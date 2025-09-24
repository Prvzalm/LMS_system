const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const userRoutes = require('./routes/user');
const paymentRoutes = require('./routes/payments');
const contactRoutes = require('./routes/contact');
const progressRoutes = require('./routes/progress');
const passport = require('passport');
const path = require('path');

dotenv.config();

const app = express();
app.use(express.static(path.join(__dirname, '/frontend')));
app.use(cors({
    origin: 'https://lms-system-64mu1bnkf-parvezalam.vercel.app',
    credentials: true
}));
app.use(express.json());
// Initialize passport (used for OAuth strategies)
require('./utils/passport');
app.use(passport.initialize());

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => res.send({ ok: true, message: 'LMS Backend running' }));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', uploadRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/progress', progressRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms_dev').then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}).catch((err) => {
    console.error('MongoDB connection error', err);
    process.exit(1);
});
