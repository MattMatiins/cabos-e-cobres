import { Order, OrderStatus } from './types';
import { getSettings } from './store';

function formatMessage(template: string, order: Order): string {
  return template
    .replace(/{nome}/g, order.customerName)
    .replace(/{id}/g, order.id.slice(-6).toUpperCase())
    .replace(/{rastreio}/g, order.trackingCode || 'N/A')
    .replace(/{total}/g, `R$ ${(order.total / 100).toFixed(2).replace('.', ',')}`)
    .replace(/{telefone}/g, order.customerPhone);
}

export async function sendOrderSMS(order: Order, newStatus: OrderStatus): Promise<boolean> {
  const settings = getSettings();

  if (!settings.smsApiKey || !settings.smsFromNumber) {
    console.log('[SMS] Não configurado. Mensagem que seria enviada:');
    const messageKey =
      newStatus === 'pronto' && order.deliveryMethod === 'retirada'
        ? 'retirada_pronto'
        : newStatus;
    const template = settings.messages[messageKey];
    const message = formatMessage(template, order);
    console.log(`[SMS] Para: ${order.customerPhone}`);
    console.log(`[SMS] Mensagem: ${message}`);
    return false;
  }

  try {
    const messageKey =
      newStatus === 'pronto' && order.deliveryMethod === 'retirada'
        ? 'retirada_pronto'
        : newStatus;
    const template = settings.messages[messageKey];
    const message = formatMessage(template, order);

    // Twilio API integration
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

    if (!response.ok) {
      console.error('[SMS] Erro ao enviar:', await response.text());
      return false;
    }

    console.log(`[SMS] Enviado para ${order.customerPhone}: ${message}`);
    return true;
  } catch (error) {
    console.error('[SMS] Erro:', error);
    return false;
  }
}
