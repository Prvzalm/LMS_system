const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const passport = require('passport');

// Start Google OAuth flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), (req, res) => {
    // Successful authentication; issue JWT and redirect or respond with token
    const token = jwt.sign({ id: req.user._id, isAdmin: req.user.isAdmin }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    // If frontend expects a redirect, send token as query or set a cookie. We'll redirect to frontend with token in query param.
    const redirectUrl = (process.env.FRONTEND_URL || '') + `/auth/success?token=${token}`;
    return res.redirect(redirectUrl);
});

router.post('/signup', async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ error: 'Email already in use' });
        user = new User({ name, email, password });
        await user.save();
        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });
        const match = await user.comparePassword(password);
        if (!match) return res.status(400).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) { next(err); }
});

// Get current user
router.get('/me', async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header) return res.status(401).json({ error: 'No token provided' });
        const token = header.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const User = require('../models/User');
        const user = await User.findById(decoded.id).select('-password').populate('purchasedCourses');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    } catch (err) { return res.status(401).json({ error: 'Invalid token' }); }
});

// Convenience admin login (for development) - same as login but verifies isAdmin
router.post('/admin-login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });
        if (!user.isAdmin) return res.status(403).json({ error: 'Not an admin' });
        const match = await user.comparePassword(password);
        if (!match) return res.status(400).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
    } catch (err) { next(err); }
});

module.exports = router;

