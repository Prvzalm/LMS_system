const express = require('express');
const Order = require('../models/Order');
const Course = require('../models/Course');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Create payment intent for a course purchase
router.post('/create-intent/:courseId', auth, async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        // create an order
        const order = new Order({ user: req.user._id, course: course._id, amount: course.price, paymentProvider: 'stripe' });
        await order.save();

        if (!process.env.STRIPE_SECRET) {
            // stubbed fallback
            return res.json({ clientSecret: 'stub_secret', orderId: order._id });
        }

        const Stripe = require('stripe')(process.env.STRIPE_SECRET);
        const paymentIntent = await Stripe.paymentIntents.create({ amount: Math.round(course.price * 100), currency: 'usd', metadata: { orderId: order._id.toString() } });
        res.json({ clientSecret: paymentIntent.client_secret, orderId: order._id });
    } catch (err) { next(err); }
});

// Webhook handler (set endpoint in Stripe dashboard to POST /api/payments/webhook)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    try {
        const Stripe = require('stripe')(process.env.STRIPE_SECRET);
        let event;
        if (endpointSecret) event = Stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        else event = req.body; // in dev if not configured

        if (event.type === 'payment_intent.succeeded' || (event.type && event.type === 'payment_intent.payment_succeeded')) {
            const pi = event.data.object;
            const orderId = pi.metadata && pi.metadata.orderId;
            if (orderId) {
                const order = await Order.findById(orderId);
                if (order) {
                    order.status = 'paid';
                    order.paymentId = pi.id;
                    await order.save();
                    // add to user purchased courses
                    const User = require('../models/User');
                    const user = await User.findById(order.user);
                    if (user && !user.purchasedCourses.some(id => id.toString() === order.course.toString())) {
                        user.purchasedCourses.push(order.course);
                        await user.save();
                    }
                    await Course.findByIdAndUpdate(order.course, { $inc: { sales: 1 } });
                }
            }
        }
        res.json({ received: true });
    } catch (err) {
        console.error('Stripe webhook error', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

module.exports = router;
