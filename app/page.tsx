import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Products from '@/components/Products';
import ContactCTA from '@/components/ContactCTA';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';

export default function Home() {
  return (
    <>
      <div className="bg-gradient-to-r from-brand-dark via-brand to-brand-dark text-black text-center py-2.5 px-4 text-xs font-bold tracking-[0.12em] uppercase">
        Produtos selecionados especialmente para você! &bull; Envio para todo Brasil
      </div>
      <Header />
      <Hero />
      <Features />
      <Products />
      <ContactCTA />
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
