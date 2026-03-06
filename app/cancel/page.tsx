import Link from 'next/link';
import { WHATSAPP_URL } from '@/lib/products';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-yellow-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z"
            />
          </svg>
        </div>
        <h1 className="font-display text-3xl text-white mb-3">Pagamento Cancelado</h1>
        <p className="text-gray-400 mb-8">
          Seu pedido não foi finalizado. Se teve algum problema, entre em contato com a gente pelo WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-brand text-black px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:shadow-lg hover:shadow-brand/20 transition-all"
          >
            Voltar à Loja
          </Link>
          <a
            href={`${WHATSAPP_URL}?text=Olá! Tive um problema com meu pedido.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-green-500 transition-all"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
