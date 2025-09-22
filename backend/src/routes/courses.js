const express = require('express');
const Course = require('../models/Course');
const Order = require('../models/Order');
const { auth, ensureEnrolled } = require('../middleware/auth');
const { createPaymentIntent } = require('../utils/payment');
const { getSignedVideoUrl } = require('../utils/video');

const router = express.Router();

// Public: list courses
router.get('/', async (req, res, next) => {
    try {
        const courses = await Course.find().select('-lessons');
        res.json(courses);
    } catch (err) { next(err); }
});

// Public: course detail
router.get('/:id', async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.json(course);
    } catch (err) { next(err); }
});

// Protected: create order (payment integration should update status)
router.post('/:id/purchase', auth, async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        // Create order entry
        const order = new Order({ user: req.user._id, course: course._id, amount: course.price, paymentProvider: 'stripe' });
        await order.save();
        // Create payment intent (or stub) and return client secret
        const intent = await createPaymentIntent(course.price, 'usd', { orderId: order._id.toString() });
        res.json({ orderId: order._id, amount: order.amount, paymentIntent: intent });
    } catch (err) { next(err); }
});

// Protected: mark order as paid (webhook or callback would do this).
router.post('/:id/confirm', auth, async (req, res, next) => {
    try {
        const { orderId, paymentId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        order.status = 'paid';
        order.paymentId = paymentId;
        await order.save();
        // add course to user purchased list
        if (!req.user.purchasedCourses) req.user.purchasedCourses = [];
        if (!req.user.purchasedCourses.some(id => id.toString() === order.course.toString())) {
            req.user.purchasedCourses.push(order.course);
            await req.user.save();
        }
        // increment course sales
        await Course.findByIdAndUpdate(order.course, { $inc: { sales: 1 } });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

// Protected: get lesson video URL (ensures enrolled)
router.get('/:courseId/lessons/:index/video', auth, ensureEnrolled, async (req, res, next) => {
    try {
        const { courseId, index } = req.params;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        const lesson = course.lessons[parseInt(index, 10)];
        if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
        // Sign the video URL using provider helper
        const signed = getSignedVideoUrl(lesson.videoUrl);
        res.json({ videoUrl: signed, title: lesson.title, description: lesson.description });
    } catch (err) { next(err); }
});

module.exports = router;
