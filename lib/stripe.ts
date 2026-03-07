import Stripe from 'stripe';

// Only initialize Stripe if configured (may use Mercado Pago instead)
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_COLE_SUA_CHAVE_AQUI') {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
  });
}

export { stripe };
