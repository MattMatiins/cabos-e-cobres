const features = [
  {
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    title: 'Peças Originais',
    desc: 'Componentes genuínos Bambozzi com garantia de fábrica e certificação de qualidade.',
  },
  {
    icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8',
    title: 'Envio Rápido',
    desc: 'Entrega para todo o Brasil com código de rastreio. Frete grátis para SP.',
  },
  {
    icon: 'M22 12h-4l-3 9L9 3l-3 9H2',
    title: 'Suporte Técnico',
    desc: 'Equipe especializada pronta para tirar suas dúvidas via WhatsApp.',
  },
  {
    icon: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z M19 10v2a7 7 0 01-14 0v-2',
    title: 'Preço Justo',
    desc: 'Melhores condições e preços competitivos para todo o Brasil.',
  },
];

export default function Features() {
  return (
    <section className="bg-[#1e293b] border-y border-white/5" id="sobre">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="flex items-start gap-4 opacity-0"
              style={{ animation: `fadeUp 0.5s ease-out ${0.1 + i * 0.1}s forwards` }}
            >
              <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="text-orange-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1 tracking-wide">{f.title}</h3>
                <p className="text-slate-400 text-[0.82rem] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
