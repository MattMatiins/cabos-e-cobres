export type OrderStatus = 'novo' | 'pago' | 'pronto' | 'em_rota' | 'entregue';

export type DeliveryMethod = 'entrega' | 'retirada';

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  trackingId: string;
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

export interface ShippingRate {
  state: string;
  name: string;
  price: number; // centavos
  cepRangeStart: string;
  cepRangeEnd: string;
}

export type PaymentGateway = 'mercadopago' | 'stripe';

export interface StoreSettings {
  paymentGateway: PaymentGateway;
  stripeSecretKey: string;
  stripePublishableKey: string;
  mercadoPagoAccessToken: string;
  mercadoPagoPublicKey: string;
  smsApiKey: string;
  smsFromNumber: string;
  shippingRates: ShippingRate[];
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

export const SHIPPING_STATES: ShippingRate[] = [
  { state: 'AC', name: 'Acre', price: 6500, cepRangeStart: '69900', cepRangeEnd: '69999' },
  { state: 'AL', name: 'Alagoas', price: 4500, cepRangeStart: '57000', cepRangeEnd: '57999' },
  { state: 'AP', name: 'Amapá', price: 6500, cepRangeStart: '68900', cepRangeEnd: '68999' },
  { state: 'AM', name: 'Amazonas', price: 6500, cepRangeStart: '69000', cepRangeEnd: '69899' },
  { state: 'BA', name: 'Bahia', price: 3990, cepRangeStart: '40000', cepRangeEnd: '48999' },
  { state: 'CE', name: 'Ceará', price: 4500, cepRangeStart: '60000', cepRangeEnd: '63999' },
  { state: 'DF', name: 'Distrito Federal', price: 3290, cepRangeStart: '70000', cepRangeEnd: '72799' },
  { state: 'ES', name: 'Espírito Santo', price: 2990, cepRangeStart: '29000', cepRangeEnd: '29999' },
  { state: 'GO', name: 'Goiás', price: 2990, cepRangeStart: '72800', cepRangeEnd: '76799' },
  { state: 'MA', name: 'Maranhão', price: 5500, cepRangeStart: '65000', cepRangeEnd: '65999' },
  { state: 'MT', name: 'Mato Grosso', price: 3990, cepRangeStart: '78000', cepRangeEnd: '78899' },
  { state: 'MS', name: 'Mato Grosso do Sul', price: 3290, cepRangeStart: '79000', cepRangeEnd: '79999' },
  { state: 'MG', name: 'Minas Gerais', price: 2490, cepRangeStart: '30000', cepRangeEnd: '39999' },
  { state: 'PA', name: 'Pará', price: 5500, cepRangeStart: '66000', cepRangeEnd: '68899' },
  { state: 'PB', name: 'Paraíba', price: 4500, cepRangeStart: '58000', cepRangeEnd: '58999' },
  { state: 'PR', name: 'Paraná', price: 2490, cepRangeStart: '80000', cepRangeEnd: '87999' },
  { state: 'PE', name: 'Pernambuco', price: 4500, cepRangeStart: '50000', cepRangeEnd: '56999' },
  { state: 'PI', name: 'Piauí', price: 5500, cepRangeStart: '64000', cepRangeEnd: '64999' },
  { state: 'RJ', name: 'Rio de Janeiro', price: 2490, cepRangeStart: '20000', cepRangeEnd: '28999' },
  { state: 'RN', name: 'Rio Grande do Norte', price: 4500, cepRangeStart: '59000', cepRangeEnd: '59999' },
  { state: 'RS', name: 'Rio Grande do Sul', price: 2990, cepRangeStart: '90000', cepRangeEnd: '99999' },
  { state: 'RO', name: 'Rondônia', price: 6500, cepRangeStart: '76800', cepRangeEnd: '76999' },
  { state: 'RR', name: 'Roraima', price: 6500, cepRangeStart: '69300', cepRangeEnd: '69399' },
  { state: 'SC', name: 'Santa Catarina', price: 2490, cepRangeStart: '88000', cepRangeEnd: '89999' },
  { state: 'SP', name: 'São Paulo', price: 0, cepRangeStart: '01000', cepRangeEnd: '19999' },
  { state: 'SE', name: 'Sergipe', price: 4500, cepRangeStart: '49000', cepRangeEnd: '49999' },
  { state: 'TO', name: 'Tocantins', price: 4500, cepRangeStart: '77000', cepRangeEnd: '77999' },
];

export const DEFAULT_MESSAGES: StoreSettings['messages'] = {
  novo: 'Olá {nome}! Seu pedido #{id} foi recebido com sucesso. Em breve você receberá atualizações.',
  pago: 'Olá {nome}! O pagamento do seu pedido #{id} foi confirmado! Estamos preparando seus itens.',
  pronto: 'Olá {nome}! Seu pedido #{id} está pronto e será enviado em breve.',
  em_rota: 'Olá {nome}! Seu pedido #{id} está a caminho! Código de rastreio: {rastreio}',
  entregue: 'Olá {nome}! Seu pedido #{id} foi entregue. Obrigado pela preferência!',
  retirada_pronto: 'Olá {nome}! Seu pedido #{id} está pronto para retirada! Venha buscar na loja.',
};
