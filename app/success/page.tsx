import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display text-3xl text-white mb-3">Pedido Confirmado!</h1>
        <p className="text-gray-400 mb-8">
          Obrigado pela sua compra! Você receberá um e-mail com os detalhes do pedido e rastreamento.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-brand text-black px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:shadow-lg hover:shadow-brand/20 transition-all"
        >
          Voltar à Loja
        </Link>
      </div>
    </div>
  );
}
