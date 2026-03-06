const features = [
  {
    icon: (
      <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Peças Originais',
    desc: 'Componentes genuínos com garantia de fábrica',
  },
  {
    icon: (
      <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M5 12h14M12 3v2m0 14v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M3 12h2m14 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
      </svg>
    ),
    title: 'Envio Rápido',
    desc: 'Entrega para todo o Brasil com rastreio',
  },
  {
    icon: (
      <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    title: 'Suporte Técnico',
    desc: 'Equipe especializada para tirar suas dúvidas',
  },
  {
    icon: (
      <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
      </svg>
    ),
    title: 'Preço Justo',
    desc: 'Melhores condições do mercado para você',
  },
];

export default function Features() {
  return (
    <section className="bg-surface-secondary border-y border-[#222]">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f) => (
          <div key={f.title} className="text-center px-4">
            <div className="w-[52px] h-[52px] bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-brand">
              {f.icon}
            </div>
            <h3 className="text-sm font-bold mb-1.5 tracking-wide">{f.title}</h3>
            <p className="text-gray-500 text-[0.82rem]">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
