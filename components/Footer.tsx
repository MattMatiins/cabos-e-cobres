import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[#222] bg-surface-secondary">
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 no-underline mb-4">
              <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center font-display text-black text-sm">
                CC
              </div>
              <span className="font-display text-[1.05rem] tracking-wider uppercase text-white">
                Cabos <span className="text-brand">&amp;</span> Cobres
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Peças e componentes elétricos para geradores, soldas e equipamentos
              industriais. Qualidade e preço justo para todo o Brasil.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-gray-400 text-[0.7rem] font-bold tracking-[0.15em] uppercase mb-5">
              Navegação
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/" className="text-gray-500 text-sm hover:text-brand transition-colors">
                Início
              </Link>
              <Link href="#produtos" className="text-gray-500 text-sm hover:text-brand transition-colors">
                Catálogo
              </Link>
              <Link href="#contato" className="text-gray-500 text-sm hover:text-brand transition-colors">
                Entrar em Contato
              </Link>
            </div>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-gray-400 text-[0.7rem] font-bold tracking-[0.15em] uppercase mb-5">
              Políticas
            </h4>
            <div className="flex flex-col gap-2.5">
              <a href="#" className="text-gray-500 text-sm hover:text-brand transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="text-gray-500 text-sm hover:text-brand transition-colors">
                Política de Reembolso
              </a>
              <a href="#" className="text-gray-500 text-sm hover:text-brand transition-colors">
                Termos de Serviço
              </a>
              <a href="#" className="text-gray-500 text-sm hover:text-brand transition-colors">
                Política de Frete
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#222] pt-6 flex flex-wrap justify-between items-center gap-4">
          <p className="text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} Cabos e Cobres. Todos os direitos reservados.
          </p>
          <div className="flex gap-5">
            <a href="#" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
              Termos
            </a>
            <a href="#" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
              Privacidade
            </a>
            <a href="#" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
              Aviso Legal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
