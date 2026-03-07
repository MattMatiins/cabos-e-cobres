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
      {/* Top bar */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 text-white text-center py-2.5 px-4 text-xs font-semibold tracking-wider">
        Frete grátis para São Paulo &bull; Envio para todo Brasil &bull; Peças Originais Bambozzi
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
