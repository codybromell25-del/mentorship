import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function stripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to your environment.");
    }
    _stripe = new Stripe(key, { apiVersion: "2026-08-26.dahlia" });
  }
  return _stripe;
}
