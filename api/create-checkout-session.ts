// api/create-checkout-session.ts

// NOTE: no Stripe, no types, nothing fancy yet.
export default async function handler(req: any, res: any) {
  try {
    return res.status(200).json({
      ok: true,
      method: req.method,
      body: req.body ?? null,
      message: 'Minimal handler is working',
    });
  } catch (err: any) {
    console.error('Minimal handler error:', err);
    return res.status(500).json({
      error: 'Minimal handler failed',
      details: err?.message || 'Unknown error',
    });
  }
}
