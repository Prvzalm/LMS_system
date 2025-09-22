const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Course = require('../models/Course');

const auth = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No token provided' });
    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

const adminOnly = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
    next();
}

const ensureEnrolled = async (req, res, next) => {
    // expects req.user and req.params.courseId
    try {
        const courseId = req.params.courseId || req.body.courseId;
        if (!courseId) return res.status(400).json({ error: 'courseId required' });
        const enrolled = req.user.purchasedCourses && req.user.purchasedCourses.some(id => id.toString() === courseId.toString());
        if (!enrolled) return res.status(403).json({ error: 'You must purchase this course to access content' });
        next();
    } catch (err) { next(err); }
}

module.exports = { auth, adminOnly, ensureEnrolled };
