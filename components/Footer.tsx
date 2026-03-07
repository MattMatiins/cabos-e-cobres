import Link from 'next/link';
import Image from 'next/image';
import { WHATSAPP_URL } from '@/lib/products';

export default function Footer() {
  return (
    <footer className="bg-[#020617] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 no-underline mb-4">
              <Image src="/logo.png" alt="Cabos e Cobres" width={36} height={36} className="w-9 h-9 rounded-lg object-cover" />
              <div>
                <span className="font-bold text-[0.95rem] tracking-wide text-white block">
                  Cabos & Cobres
                </span>
                <span className="text-[0.6rem] text-slate-500 tracking-[0.12em] uppercase font-medium">
                  Peças Bambozzi
                </span>
              </div>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mt-4">
              Distribuidora de peças e componentes elétricos para geradores, soldas e
              equipamentos industriais Bambozzi. Qualidade original com os melhores preços do Brasil.
            </p>
            <div className="flex gap-3 mt-5">
              <a
                href={`${WHATSAPP_URL}?text=${encodeURIComponent('Olá! Vim pelo site.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-slate-400 hover:text-[#25D366] hover:border-[#25D366]/30 transition-all"
                aria-label="WhatsApp"
              >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-slate-300 text-[0.7rem] font-bold tracking-[0.15em] uppercase mb-5">
              Navegação
            </h4>
            <div className="flex flex-col gap-3">
              <Link href="/" className="text-slate-500 text-sm hover:text-orange-400 transition-colors">Início</Link>
              <Link href="#produtos" className="text-slate-500 text-sm hover:text-orange-400 transition-colors">Catálogo</Link>
              <Link href="#sobre" className="text-slate-500 text-sm hover:text-orange-400 transition-colors">Sobre</Link>
              <Link href="#contato" className="text-slate-500 text-sm hover:text-orange-400 transition-colors">Contato</Link>
            </div>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-slate-300 text-[0.7rem] font-bold tracking-[0.15em] uppercase mb-5">
              Informações
            </h4>
            <div className="flex flex-col gap-3">
              <a href="#" className="text-slate-500 text-sm hover:text-orange-400 transition-colors">Política de Privacidade</a>
              <a href="#" className="text-slate-500 text-sm hover:text-orange-400 transition-colors">Termos de Serviço</a>
              <a href="#" className="text-slate-500 text-sm hover:text-orange-400 transition-colors">Política de Frete</a>
              <a href="#" className="text-slate-500 text-sm hover:text-orange-400 transition-colors">Trocas e Devoluções</a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-wrap justify-between items-center gap-4">
          <p className="text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} Cabos e Cobres. Todos os direitos reservados.
          </p>
          <div className="flex gap-5">
            <a href="#" className="text-slate-600 text-xs hover:text-slate-400 transition-colors">Termos</a>
            <a href="#" className="text-slate-600 text-xs hover:text-slate-400 transition-colors">Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
