'use client';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-30%] left-[-10%] w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[100px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Diagonal accent line */}
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-orange-500/20 to-transparent transform rotate-12 translate-x-[-200px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <div
              className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 opacity-0"
              style={{ animation: 'fadeUp 0.6s ease-out forwards' }}
            >
              <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Distribuidor Autorizado Bambozzi
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight text-white mb-6 opacity-0"
              style={{ animation: 'fadeUp 0.6s ease-out 0.1s forwards' }}
            >
              Peças e Componentes para{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                Geradores Bambozzi
              </span>
            </h1>

            <p
              className="text-lg text-slate-400 leading-relaxed max-w-lg mb-8 opacity-0"
              style={{ animation: 'fadeUp 0.6s ease-out 0.2s forwards' }}
            >
              Peças e acessórios originais para geradores, soldas e equipamentos industriais.
              Qualidade garantida com os melhores preços do Brasil.
            </p>

            <div
              className="flex flex-col sm:flex-row items-start gap-4 opacity-0"
              style={{ animation: 'fadeUp 0.6s ease-out 0.3s forwards' }}
            >
              <a
                href="#produtos"
                className="inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-sm tracking-wider uppercase shadow-[0_4px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_8px_30px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 transition-all duration-300 group"
              >
                Ver Catálogo
                <svg className="w-[18px] h-[18px] transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="#contato"
                className="inline-flex items-center gap-2 text-slate-300 px-6 py-4 rounded-xl font-semibold text-sm border border-slate-600 hover:border-orange-500/40 hover:text-orange-400 transition-all duration-300"
              >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366]">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Fale Conosco
              </a>
            </div>

            {/* Trust badges */}
            <div
              className="flex flex-wrap items-center gap-6 mt-10 opacity-0"
              style={{ animation: 'fadeUp 0.6s ease-out 0.5s forwards' }}
            >
              {[
                { icon: 'M5 12l5 5L20 7', label: 'Peças Originais' },
                { icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8', label: 'Envio Rápido' },
                { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', label: 'Garantia' },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="text-orange-400">
                      <path d={badge.icon} />
                    </svg>
                  </div>
                  <span className="text-slate-400 text-xs font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Stats/Visual */}
          <div
            className="hidden lg:block relative opacity-0"
            style={{ animation: 'fadeUp 0.6s ease-out 0.4s forwards' }}
          >
            <div className="relative">
              {/* Stats cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-extrabold text-orange-400 mb-1">28+</div>
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Produtos</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-extrabold text-orange-400 mb-1">27</div>
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Estados</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-extrabold text-orange-400 mb-1">100%</div>
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Original</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-extrabold text-white mb-1">SP</div>
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Frete Grátis</div>
                </div>
              </div>

              {/* Decorative element */}
              <div className="absolute -top-4 -right-4 w-24 h-24 border border-orange-500/10 rounded-2xl -z-10" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 border border-orange-500/5 rounded-3xl -z-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
    </section>
  );
}
