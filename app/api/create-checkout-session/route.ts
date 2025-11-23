// app/api/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export const POST = async (request: Request) => {
  try {
    const { priceId, email } = await request.json();

    if (!priceId || !email) {
      return new NextResponse('Missing priceId or email', { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${new URL(request.url).origin}/trial-success`,
      cancel_url: `${new URL(request.url).origin}/#pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
};
