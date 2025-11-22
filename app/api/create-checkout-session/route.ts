// app/api/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: Request) {
  try {
    const { priceId, email } = await request.json();

    if (!email || !priceId) {
      return new NextResponse('Email and priceId are required', { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      subscription_data: {
        trial_period_days: 7,
        trial_settings: {
          end_behavior: { missing_payment_method: 'cancel' },
        },
      },
      success_url: `${new URL(request.url).origin}/trial-success`,
      cancel_url: `${new URL(request.url).origin}/#pricing`,
      metadata: { note: '7-day card-upfront trial' },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return new NextResponse(err.message || 'Something went wrong', { status: 500 });
  }
}
