import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import CartDrawer from '@/components/CartDrawer';
import VisitorTracker from '@/components/VisitorTracker';

export const metadata: Metadata = {
  title: 'Cabos e Cobres – Peças e Componentes Elétricos',
  description:
    'Peças e acessórios originais Bambozzi para geradores, soldas e equipamentos industriais. Qualidade garantida com os melhores preços do Brasil.',
  keywords: [
    'cabos e cobres',
    'peças bambozzi',
    'gerador bambozzi',
    'escova de carvão',
    'coletor de anéis',
    'chave de transferência',
    'peças para gerador',
    'componentes elétricos',
  ],
  icons: {
    icon: '/favicon.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Cabos e Cobres – Peças e Componentes Elétricos',
    description: 'Peças originais Bambozzi com os melhores preços do Brasil.',
    type: 'website',
    locale: 'pt_BR',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>
          {children}
          <CartDrawer />
          <VisitorTracker />
        </CartProvider>
      </body>
    </html>
  );
}
