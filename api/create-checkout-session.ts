// api/create-checkout-session.ts
import Stripe from 'stripe';

// Safely read the secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn(
    '[Stripe] STRIPE_SECRET_KEY is not set — /api/create-checkout-session will always fail.'
  );
}

// Create a Stripe client (only if we have a key)
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
    })
  : null;

export default async function handler(req: any, res: any) {
  // Allow only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // --- 1) Parse body safely ---
    const body = req.body || {};
    const { priceId, email } = body as { priceId?: string; email?: string };

    if (!priceId || !email) {
      return res
        .status(400)
        .json({ error: 'Missing priceId or email in request body.' });
    }

    if (!stripe) {
      return res.status(500).json({
        error: 'Stripe is not configured on the server.',
      });
    }

    // --- 2) Look up / create customer by email ---
    const existing = await stripe.customers.list({ email, limit: 1 });
    const existingCustomer = existing.data[0];

    const customer =
      existingCustomer ??
      (await stripe.customers.create({
        email,
      }));

    // --- 3) Build origin + success/cancel URLs ---
    const origin =
      (req.headers.origin as string) ||
      process.env.APP_BASE_URL ||
      'https://www.apptruexpanse.com';

    // --- 4) Create checkout session (subscription) ---
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],

      // Adjust these paths to whatever you want in MAT
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/cancelled`,
    });

    // --- 5) Return the session URL to the frontend ---
    return res.status(200).json({
      url: session.url,
    });
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    return res.status(500).json({
      error: 'Internal server error while creating checkout session.',
      details: err?.message || 'Unknown error',
    });
  }
}
