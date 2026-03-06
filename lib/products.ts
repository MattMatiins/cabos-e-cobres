export interface Product {
  id: string;
  slug: string;
  name: string;
  code: string;
  price: number; // in centavos
  priceFormatted: string;
  description: string;
  images: string[];
  category: string;
  inStock: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: 'prod_chave_transferencia',
    slug: 'chave-de-transferencia-bambozzi-1799-100v',
    name: 'Chave de Transferência Bambozzi 1799/100V K+S47 – 100A',
    code: '14318.2',
    price: 149000,
    priceFormatted: 'R$ 1.490,00',
    description: 'Chave de transferência Bambozzi modelo 1799/100V K+S47 com capacidade de 100A. Ideal para sistemas de transferência automática de geradores.',
    images: [
      'https://cabosecobres.myshopify.com/cdn/shop/files/WhatsAppImage2025-12-03at08.25.24.jpg?v=1764761611&width=800',
      'https://cabosecobres.myshopify.com/cdn/shop/files/Design_sem_nome_3.png?v=1764810187&width=800',
    ],
    category: 'Chaves e Transferência',
    inStock: true,
  },
  {
    id: 'prod_coletor_aneis_grande',
    slug: 'coletor-de-aneis-grande-bambozzi',
    name: 'Coletor de Anéis Grande Bambozzi – 15 a 60 KVA Mono e Trifásico',
    code: '12787.0',
    price: 49900,
    priceFormatted: 'R$ 499,00',
    description: 'Coletor de anéis grande Bambozzi compatível com geradores de 15 a 60 KVA, modelos monofásico e trifásico.',
    images: [
      'https://cabosecobres.myshopify.com/cdn/shop/files/WhatsApp_Image_2025-12-02_at_16.49.48.jpg?v=1764732463&width=800',
      'https://cabosecobres.myshopify.com/cdn/shop/files/Design_sem_nome_12.png?v=1764812023&width=800',
    ],
    category: 'Coletores de Anéis',
    inStock: true,
  },
  {
    id: 'prod_coletor_aneis_pequeno',
    slug: 'coletor-de-aneis-pequeno-bambozzi',
    name: 'Coletor de Anéis Pequeno Bambozzi – 3 a 15 KVA Mono e Trifásico',
    code: '12212.0',
    price: 24990,
    priceFormatted: 'R$ 249,90',
    description: 'Coletor de anéis pequeno Bambozzi compatível com geradores de 3 a 15 KVA, modelos monofásico e trifásico.',
    images: [
      'https://cabosecobres.myshopify.com/cdn/shop/files/WhatsApp_Image_2025-12-02_at_16.49.48_1.jpg?v=1764732505&width=800',
      'https://cabosecobres.myshopify.com/cdn/shop/files/Design_sem_nome_11.png?v=1764811906&width=800',
    ],
    category: 'Coletores de Anéis',
    inStock: true,
  },
  {
    id: 'prod_correia_3vx750',
    slug: 'correia-3vx-750',
    name: 'Correia 3VX 750',
    code: '1542.8',
    price: 4790,
    priceFormatted: 'R$ 47,90',
    description: 'Correia modelo 3VX 750 para geradores e equipamentos industriais Bambozzi.',
    images: [
      'https://cabosecobres.myshopify.com/cdn/shop/files/WhatsAppImage2025-12-12at09.59.09.jpg?v=1765544674&width=800',
    ],
    category: 'Correias',
    inStock: true,
  },
  {
    id: 'prod_diodo_negativo',
    slug: 'diodo-negativo-skn-25-12',
    name: 'Diodo Negativo SKN 25/12',
    code: '13507.1',
    price: 7000,
    priceFormatted: 'R$ 70,00',
    description: 'Diodo negativo SKN 25/12 para retificadores de geradores Bambozzi.',
    images: [
      'https://cabosecobres.myshopify.com/cdn/shop/files/WhatsAppImage2026-01-26at12.46.05_1_59ce0f03-d1cd-49d6-af7d-51b1c2f7bdf7.jpg?v=1769443031&width=800',
    ],
    category: 'Diodos',
    inStock: true,
  },
  {
    id: 'prod_diodo_positivo',
    slug: 'diodo-positivo-skn-25-12',
    name: 'Diodo Positivo SKN 25/12',
    code: '13506.3',
    price: 7000,
    priceFormatted: 'R$ 70,00',
    description: 'Diodo positivo SKN 25/12 para retificadores de geradores Bambozzi.',
    images: [
      'https://cabosecobres.myshopify.com/cdn/shop/files/WhatsAppImage2026-01-26at12.46.05.jpg?v=1769442971&width=800',
    ],
    category: 'Diodos',
    inStock: true,
  },
  {
    id: 'prod_ventilador_gerador',
    slug: 'ventilador-para-gerador',
    name: 'Ventilador para Gerador 3 a 7.5kVA ARM e 4 a 10kVA ART',
    code: '4742.6',
    price: 5990,
    priceFormatted: 'R$ 59,90',
    description: 'Ventilador compatível com geradores Bambozzi de 3 a 7.5kVA ARM e 4 a 10kVA ART.',
    images: [
      'https://cabosecobres.myshopify.com/cdn/shop/files/WhatsAppImage2025-12-10at07.44.30.jpg?v=1765381811&width=800',
    ],
    category: 'Ventiladores',
    inStock: true,
  },
  {
    id: 'prod_escova_carvao_e17',
    slug: 'escova-de-carvao-e17-bambozzi',
    name: 'Escova de Carvão E17 Bambozzi – 15 a 60 KVA Mono e Trifásico',
    code: '15691.1',
    price: 5960,
    priceFormatted: 'R$ 59,60',
    description: 'Escova de carvão E17 Bambozzi compatível com geradores de 15 a 60 KVA, modelos monofásico e trifásico.',
    images: [
      'https://cabosecobres.myshopify.com/cdn/shop/files/WhatsApp_Image_2025-12-02_at_16.49.48_2.jpg?v=1764732538&width=800',
      'https://cabosecobres.myshopify.com/cdn/shop/files/Design_sem_nome_10.png?v=1764811691&width=800',
    ],
    category: 'Escovas de Carvão',
    inStock: true,
  },
];

export const WHATSAPP_NUMBER = '5517991557461';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const STORE_NAME = 'Cabos e Cobres';
