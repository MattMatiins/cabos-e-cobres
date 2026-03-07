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
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 text-white text-center py-2.5 px-4 text-[0.7rem] sm:text-xs font-semibold tracking-wider">
        <span className="hidden sm:inline">Frete grátis para São Paulo &bull; Envio para todo Brasil &bull; Peças Originais Bambozzi</span>
        <span className="sm:hidden">Peças Originais Bambozzi &bull; Frete grátis SP</span>
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
