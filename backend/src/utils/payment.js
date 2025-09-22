// Payment helpers (Stripe stub)
const stripeKey = process.env.STRIPE_SECRET || null;
let stripe = null;
if (stripeKey) {
    try { stripe = require('stripe')(stripeKey); } catch (e) { stripe = null; }
}

async function createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    if (!stripe) {
        // Return a stub object for local dev
        return { client_secret: 'stub_client_secret', id: 'stub_intent' };
    }
    const intent = await stripe.paymentIntents.create({ amount: Math.round(amount * 100), currency, metadata });
    return intent;
}

module.exports = { createPaymentIntent };
