// api/create-checkout-session.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// ⚠️ Do NOT throw at the top level – just lazily create the client
let stripe: Stripe | null = null;
if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20',
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Safety: make sure Stripe is configured
  if (!stripe) {
    console.error('STRIPE_SECRET_KEY is not set or Stripe failed to initialize.');
    return res.status(500).json({
      error: 'Server configuration error',
      details: 'Stripe is not configured on the server.',
    });
  }

  try {
    // Vercel will give us req.body if the client sends JSON
    const { priceId, email } = (req.body ?? {}) as {
      priceId?: string;
      email?: string;
    };

    if (!priceId || !email) {
      return res.status(400).json({ error: 'Missing priceId or email' });
    }

    // Create or reuse customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });
    const existingCustomer = customers.data[0];

    const customer =
      existingCustomer ??
      (await stripe.customers.create({
        email,
      }));

    // Build success/cancel URLs using the current origin
    const origin =
      req.headers.origin ||
      process.env.APP_BASE_URL ||
      'https://www.apptruexpanse.com';

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      details: err?.message || 'Unknown error',
    });
  }
}
