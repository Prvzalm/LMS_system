const express = require('express');
const Course = require('../models/Course');
const User = require('../models/User');
const Order = require('../models/Order');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(auth);
router.use(adminOnly);

router.get('/stats', async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalSales = await Order.countDocuments({ status: 'paid' });
        const revenueAgg = await Order.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const revenue = (revenueAgg[0] && revenueAgg[0].total) || 0;
        const topCourses = await Course.find().sort({ sales: -1 }).limit(5).select('title sales');
        res.json({ totalUsers, totalSales, revenue, topCourses });
    } catch (err) { next(err); }
});

// List all courses (admin)
router.get('/courses', async (req, res, next) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) { next(err); }
});

router.post('/courses', async (req, res, next) => {
    try {
        const { title, description, thumbnail, price, lessons } = req.body;
        const course = new Course({ title, description, thumbnail, price, lessons });
        await course.save();
        res.json(course);
    } catch (err) { next(err); }
});

// Update course
router.put('/courses/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const upd = req.body;
        const course = await Course.findByIdAndUpdate(id, upd, { new: true });
        res.json(course);
    } catch (err) { next(err); }
});

// Delete course
router.delete('/courses/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await Course.findByIdAndDelete(id);
        res.json({ ok: true });
    } catch (err) { next(err); }
});

// Add lesson to course
router.post('/courses/:id/lessons', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, videoUrl, description } = req.body;
        const course = await Course.findById(id);
        course.lessons.push({ title, videoUrl, description });
        await course.save();
        res.json(course);
    } catch (err) { next(err); }
});

// Remove lesson
router.delete('/courses/:id/lessons/:index', async (req, res, next) => {
    try {
        const { id, index } = req.params;
        const course = await Course.findById(id);
        course.lessons.splice(parseInt(index, 10), 1);
        await course.save();
        res.json(course);
    } catch (err) { next(err); }
});

// Seed admin user (protected by SEED_KEY in env)
router.post('/seed-admin', async (req, res, next) => {
    try {
        const secret = process.env.SEED_KEY;
        if (!secret || req.body.key !== secret) return res.status(403).json({ error: 'Invalid seed key' });
        const User = require('../models/User');
        let admin = await User.findOne({ email: 'admin@gmail.com' });
        if (!admin) {
            admin = new User({ name: 'Admin', email: 'admin@gmail.com', password: 'admin@gmail.com', isAdmin: true });
            await admin.save();
        }
        res.json({ ok: true, admin: { email: admin.email } });
    } catch (err) { next(err); }
});

router.get('/users', async (req, res, next) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) { next(err); }
});

router.get('/orders', async (req, res, next) => {
    try {
        const orders = await Order.find().populate('user', 'name email').populate('course', 'title price');
        res.json(orders);
    } catch (err) { next(err); }
});

// Development-only: seed admin user and demo courses when provided with SEED_KEY
router.post('/seed', async (req, res, next) => {
    try {
        const key = req.headers['x-seed-key'] || req.body.seedKey;
        if (!process.env.SEED_KEY || process.env.SEED_KEY !== key) return res.status(403).json({ error: 'Invalid seed key' });
        // create admin user if missing
        let admin = await User.findOne({ email: 'admin@example.com' });
        if (!admin) {
            admin = new User({ name: 'Admin', email: 'admin@example.com', password: 'password', isAdmin: true });
            await admin.save();
        }
        // create sample courses
        const sampleCourses = [
            { title: 'Intro to Node.js', description: 'Learn Node basics', thumbnail: '', price: 19.99, lessons: [{ title: 'Welcome', videoUrl: 'https://res.cloudinary.com/demo/video/upload/sample.mp4' }] },
            { title: 'React for Beginners', description: 'Learn React', thumbnail: '', price: 24.99, lessons: [{ title: 'Intro', videoUrl: 'https://res.cloudinary.com/demo/video/upload/sample.mp4' }] }
        ];
        for (const c of sampleCourses) {
            const exists = await Course.findOne({ title: c.title });
            if (!exists) {
                const course = new Course(c);
                await course.save();
            }
        }
        res.json({ ok: true, adminEmail: admin.email });
    } catch (err) { next(err); }
});

module.exports = router;
