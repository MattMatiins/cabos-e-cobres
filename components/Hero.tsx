'use client';

import { useEffect, useRef } from 'react';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty('--mx', `${x * 30}px`);
      el.style.setProperty('--my', `${y * 20}px`);
    };

    el.addEventListener('mousemove', handleMouseMove);
    return () => el.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[560px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0d0d0d] via-[#1a1200] to-[#0d0d0d]"
      style={{ perspective: '1000px' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_40%,rgba(245,166,35,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_70%_60%,rgba(245,166,35,0.06),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,166,35,0.04),transparent_70%)]" />
      </div>

      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            'linear-gradient(rgba(245,166,35,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          animation: 'gridMove 20s linear infinite',
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-72 h-72 rounded-full bg-brand/5 blur-[80px]"
          style={{ top: '10%', left: '15%', animation: 'float3d 8s ease-in-out infinite' }}
        />
        <div
          className="absolute w-48 h-48 rounded-full bg-brand/8 blur-[60px]"
          style={{ bottom: '15%', right: '20%', animation: 'float3d 6s ease-in-out infinite 1s' }}
        />
        <div
          className="absolute w-32 h-32 rounded-full bg-brand/10 blur-[40px]"
          style={{ top: '50%', left: '60%', animation: 'float3d 10s ease-in-out infinite 2s' }}
        />
      </div>

      <div
        className="relative text-center px-6 py-20 max-w-3xl"
        style={{ transform: 'translate3d(var(--mx, 0), var(--my, 0), 0)', transition: 'transform 0.3s ease-out' }}
      >
        <span
          className="inline-block bg-brand/10 border border-brand/25 text-brand px-5 py-2 rounded-full text-xs font-bold tracking-[0.15em] uppercase mb-7 opacity-0"
          style={{ animation: 'fadeUp 0.8s ease-out forwards' }}
        >
          Pecas Bambozzi Originais
        </span>

        <h1
          className="font-display text-4xl md:text-6xl leading-[1.1] tracking-tight mb-5 opacity-0"
          style={{ animation: 'fadeUp 0.8s ease-out 0.1s forwards' }}
        >
          Componentes Elétricos
          <br />
          de <span className="text-brand relative">
            Alta Performance
            <span className="absolute -bottom-1 left-0 right-0 h-1 bg-brand/30 rounded-full blur-sm" />
          </span>
        </h1>

        <p
          className="text-gray-400 text-lg max-w-xl mx-auto mb-9 opacity-0"
          style={{ animation: 'fadeUp 0.8s ease-out 0.2s forwards' }}
        >
          Peças e acessórios para geradores, soldas e equipamentos industriais.
          Qualidade garantida com os melhores preços do mercado.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0"
          style={{ animation: 'fadeUp 0.8s ease-out 0.3s forwards' }}
        >
          <a
            href="#produtos"
            className="inline-flex items-center gap-3 bg-brand text-black px-9 py-4 rounded-full font-bold text-sm tracking-wider uppercase shadow-[0_0_40px_rgba(245,166,35,0.2)] hover:shadow-[0_0_60px_rgba(245,166,35,0.35)] hover:-translate-y-0.5 transition-all duration-300 group"
            style={{ animation: 'glowPulse 3s ease-in-out infinite' }}
          >
            Comprar Agora
            <svg
              className="w-[18px] h-[18px] transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="#contato"
            className="inline-flex items-center gap-2 text-gray-400 px-6 py-4 rounded-full font-medium text-sm tracking-wider uppercase border border-[#333] hover:border-brand/40 hover:text-brand transition-all duration-300"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366]">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Fale Conosco
          </a>
        </div>

        <div
          className="flex items-center justify-center gap-8 mt-12 opacity-0"
          style={{ animation: 'fadeUp 0.8s ease-out 0.5s forwards' }}
        >
          {['Frete Grátis*', 'Peças Originais', 'Garantia'].map((badge) => (
            <div key={badge} className="flex items-center gap-2 text-gray-500 text-xs">
              <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="text-brand">
                <path d="M5 13l4 4L19 7" />
              </svg>
              {badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
