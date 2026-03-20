import { Order, OrderStatus } from './types';
import { getSettings } from './store';

function formatMessage(template: string, order: Order): string {
  return template
    .replace(/{nome}/g, order.customerName)
    .replace(/{id}/g, order.trackingId || order.id.slice(-6).toUpperCase())
    .replace(/{rastreio}/g, order.trackingCode || 'N/A')
    .replace(/{total}/g, `R$ ${(order.total / 100).toFixed(2).replace('.', ',')}`)
    .replace(/{telefone}/g, order.customerPhone);
}

// Generate a WhatsApp link for the admin to send manually
export function generateWhatsAppLink(order: Order, newStatus: OrderStatus): string {
  const settings = getSettings();
  const messageKey =
    newStatus === 'pronto' && order.deliveryMethod === 'retirada'
      ? 'retirada_pronto'
      : newStatus;
  const template = settings.messages[messageKey];
  const message = formatMessage(template, order);

  // Format phone for WhatsApp (remove non-digits, ensure country code)
  let phone = order.customerPhone.replace(/\D/g, '');
  if (phone.startsWith('0')) phone = phone.slice(1);
  if (!phone.startsWith('55')) phone = '55' + phone;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export async function sendOrderNotification(order: Order, newStatus: OrderStatus): Promise<{ sent: boolean; whatsappLink: string }> {
  const settings = getSettings();
  const whatsappLink = generateWhatsAppLink(order, newStatus);

  const messageKey =
    newStatus === 'pronto' && order.deliveryMethod === 'retirada'
      ? 'retirada_pronto'
      : newStatus;
  const template = settings.messages[messageKey];
  const message = formatMessage(template, order);

  // Try CallMeBot WhatsApp API (free) if configured
  // CallMeBot sends to the REGISTERED number (admin/store), not customer
  if (settings.smsApiKey && settings.smsApiKey.startsWith('callmebot:')) {
    try {
      const apiKey = settings.smsApiKey.replace('callmebot:', '');
      // Use smsFromNumber (admin's registered WhatsApp) as recipient
      let adminPhone = (settings.smsFromNumber || '').replace(/\D/g, '');
      if (adminPhone.startsWith('0')) adminPhone = adminPhone.slice(1);
      if (!adminPhone.startsWith('55')) adminPhone = '55' + adminPhone;

      // Include customer info in message for admin context
      const adminMessage = `📦 Pedido ${order.trackingId || order.id.slice(-6)}\n👤 ${order.customerName}\n📱 ${order.customerPhone}\n\n${message}`;

      const url = `https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodeURIComponent(adminMessage)}&apikey=${apiKey}`;
      const response = await fetch(url);

      if (response.ok) {
        console.log(`[WhatsApp] Notificação enviada para admin: ${adminMessage.substring(0, 80)}...`);
        return { sent: true, whatsappLink };
      } else {
        console.error('[WhatsApp] Erro CallMeBot:', await response.text());
      }
    } catch (error) {
      console.error('[WhatsApp] Erro:', error);
    }
  }

  // Try Twilio SMS if configured (legacy support)
  if (settings.smsApiKey && settings.smsApiKey.includes(':') && !settings.smsApiKey.startsWith('callmebot:')) {
    try {
      const accountSid = settings.smsApiKey.split(':')[0];
      const authToken = settings.smsApiKey.split(':')[1];
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: settings.smsFromNumber,
            To: order.customerPhone,
            Body: message,
          }),
        }
      );

      if (response.ok) {
        console.log(`[SMS] Enviado para ${order.customerPhone}: ${message}`);
        return { sent: true, whatsappLink };
      } else {
        console.error('[SMS] Erro Twilio:', await response.text());
      }
    } catch (error) {
      console.error('[SMS] Erro:', error);
    }
  }

  // Fallback: log message and return WhatsApp link for manual send
  console.log('[Notificação] API não configurada. Use o link do WhatsApp para enviar manualmente:');
  console.log(`[Notificação] Para: ${order.customerPhone}`);
  console.log(`[Notificação] Mensagem: ${message}`);
  console.log(`[Notificação] Link: ${whatsappLink}`);

  return { sent: false, whatsappLink };
}

// Keep backward compatibility
export async function sendOrderSMS(order: Order, newStatus: OrderStatus): Promise<boolean> {
  const result = await sendOrderNotification(order, newStatus);
  return result.sent;
}
