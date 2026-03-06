export type OrderStatus = 'novo' | 'pago' | 'pronto' | 'em_rota' | 'entregue';

export type DeliveryMethod = 'entrega' | 'retirada';

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: {
    productId: string;
    name: string;
    code: string;
    price: number;
    quantity: number;
  }[];
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  trackingCode?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress?: string;
  stripeSessionId?: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}

export interface StoreSettings {
  stripeSecretKey: string;
  stripePublishableKey: string;
  smsApiKey: string;
  smsFromNumber: string;
  messages: {
    novo: string;
    pago: string;
    pronto: string;
    em_rota: string;
    entregue: string;
    retirada_pronto: string;
  };
}

export interface Visitor {
  id: string;
  page: string;
  timestamp: string;
  userAgent?: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  novo: 'Novo',
  pago: 'Pago',
  pronto: 'Pronto',
  em_rota: 'Em Rota',
  entregue: 'Entregue',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  novo: '#3B82F6',
  pago: '#F59E0B',
  pronto: '#8B5CF6',
  em_rota: '#F97316',
  entregue: '#22C55E',
};

export const DEFAULT_MESSAGES: StoreSettings['messages'] = {
  novo: 'Olá {nome}! Seu pedido #{id} foi recebido com sucesso. Em breve você receberá atualizações.',
  pago: 'Olá {nome}! O pagamento do seu pedido #{id} foi confirmado! Estamos preparando seus itens.',
  pronto: 'Olá {nome}! Seu pedido #{id} está pronto e será enviado em breve.',
  em_rota: 'Olá {nome}! Seu pedido #{id} está a caminho! Código de rastreio: {rastreio}',
  entregue: 'Olá {nome}! Seu pedido #{id} foi entregue. Obrigado pela preferência!',
  retirada_pronto: 'Olá {nome}! Seu pedido #{id} está pronto para retirada! Venha buscar na loja.',
};
