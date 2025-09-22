const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

// POST /api/contact
// Expects { name, email, message }
router.post('/', async (req, res, next) => {
    try {
        const { name, email, message } = req.body || {};
        if (!name || !email || !message) return res.status(400).json({ error: 'name, email and message are required' });

        // Read SMTP configuration from env
        const host = process.env.SMTP_HOST;
        const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        const secure = process.env.SMTP_SECURE === 'true' || (port === 465);
        const to = process.env.CONTACT_TO || process.env.SMTP_USER;

        // Prepare simple message body
        const subject = `Contact form: ${name}`;
        const text = `Name: ${name}\nEmail: ${email}\n\n${message}`;

        if (host && port && user && pass && to) {
            // create reusable transporter
            const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

            // send mail
            await transporter.sendMail({ from: user, to, replyTo: email, subject, text });
            console.log('Contact email sent to', to, 'from', email);
            return res.json({ ok: true, message: 'Message sent' });
        }

        // Fallback: log to server console when SMTP not configured
        console.log('Contact (no SMTP configured) —', { name, email, message });
        return res.json({ ok: true, message: 'Message received (not emailed; SMTP not configured)' });
    } catch (err) { next(err); }
});

module.exports = router;
