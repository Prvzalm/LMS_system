const express = require('express');
const cloudinary = require('../utils/cloudinary');
const dotenv = require('dotenv');
const streamifier = require('streamifier');
const multer = require('multer');
const { auth } = require('../middleware/auth');
dotenv.config();

const router = express.Router();
const upload = multer(); // memory storage

try {
    if (process.env.CLOUDINARY_URL) cloudinary.config();
} catch (e) { console.warn('Cloudinary config', e && e.message); }

// Upload or update user's avatar
router.post('/avatar', auth, upload.single('file'), async (req, res, next) => {
    try {
        // defensive: ensure cloudinary has been configured with api_key
        try {
            const cfg = cloudinary.config()
            if (!cfg || !cfg.api_key) return res.status(500).json({ error: 'Cloudinary not configured (missing api_key). Ensure CLOUDINARY_URL or CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET are set and restart the server.' })
        } catch (e) { return res.status(500).json({ error: 'Cloudinary configuration error' }) }
        if (!req.file) return res.status(400).json({ error: 'No file provided' });
        const folder = req.body.folder || 'profilePics';

        const streamUpload = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ resource_type: 'image', folder }, (error, result) => {
                    if (result) resolve(result);
                    else reject(error);
                });
                streamifier.createReadStream(fileBuffer).pipe(stream);
            });
        }

        const result = await streamUpload(req.file.buffer);
        // Save to user and return updated user (without password)
        const User = require('../models/User');
        const user = await User.findById(req.user._id);
        user.avatar = result.secure_url;
        await user.save();
        const safe = user.toObject();
        delete safe.password;
        res.json({ ok: true, user: safe, url: result.secure_url, public_id: result.public_id });
    } catch (err) { next(err); }
});

module.exports = router;
