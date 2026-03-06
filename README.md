# Cabos e Cobres - Loja Online

Loja de peças e componentes elétricos Bambozzi. Projeto Next.js 14 com Stripe Checkout e WhatsApp integrado, pronto para deploy na Vercel.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** (estilização)
- **Stripe Checkout** (pagamentos com cartão e boleto)
- **WhatsApp** (atendimento e fallback de pagamento)

## Setup Rápido

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas chaves do Stripe:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas chaves:

```env
STRIPE_SECRET_KEY=sk_live_sua_chave_aqui
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave_aqui
```

> Para testes, use as chaves de teste do Stripe (`sk_test_...` e `pk_test_...`).

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Deploy na Vercel

### Via GitHub

1. Suba o projeto para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Adicione as variáveis de ambiente no painel da Vercel:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Deploy automático!

### Via CLI

```bash
npx vercel
```

## Configuração do Stripe

1. Acesse [dashboard.stripe.com](https://dashboard.stripe.com)
2. Copie as chaves da API (Settings → API keys)
3. Configure os webhooks para o domínio da Vercel (opcional, para confirmação automática)
4. Ative os métodos de pagamento desejados (Cartão, Boleto, PIX)

### Métodos de pagamento suportados

- Cartão de crédito/débito
- Boleto bancário
- (PIX pode ser habilitado via Stripe Dashboard)

## WhatsApp

O número configurado é **(17) 99155-7461**. Para alterar, edite o arquivo `lib/products.ts`:

```typescript
export const WHATSAPP_NUMBER = '5517991557461';
```

## Estrutura do Projeto

```
├── app/
│   ├── api/create-checkout-session/  # API Stripe
│   ├── success/                       # Página pós-pagamento
│   ├── cancel/                        # Página de cancelamento
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── Products.tsx
│   ├── ProductCard.tsx
│   ├── ContactCTA.tsx
│   ├── Footer.tsx
│   └── WhatsAppFloat.tsx
├── lib/
│   ├── products.ts          # Dados dos produtos
│   ├── stripe.ts            # Config Stripe (server)
│   └── stripe-client.ts     # Config Stripe (client)
└── ...
```

## Adicionando Produtos

Edite `lib/products.ts` para adicionar ou modificar produtos. Cada produto segue a interface:

```typescript
{
  id: string;           // ID único (usado pelo Stripe)
  slug: string;         // URL amigável
  name: string;         // Nome do produto
  code: string;         // Código Bambozzi
  price: number;        // Preço em centavos (R$ 49,90 = 4990)
  priceFormatted: string;
  description: string;
  images: string[];     // URLs das imagens
  category: string;
  inStock: boolean;
}
```

## Licença

Projeto privado – Cabos e Cobres.
