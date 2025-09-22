const express = require('express');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// cloudinary configured via backend/src/utils/cloudinary.js

const upload = multer(); // memory storage

router.post('/upload', auth, adminOnly, upload.single('file'), async (req, res, next) => {
    try {
        try {
            const cfg = cloudinary.config()
            if (!cfg || !cfg.api_key) return res.status(500).json({ error: 'Cloudinary not configured (missing api_key). Ensure CLOUDINARY_URL or CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET are set and restart the server.' })
        } catch (e) { return res.status(500).json({ error: 'Cloudinary configuration error' }) }
        if (!req.file) return res.status(400).json({ error: 'No file provided' });
        const resourceType = req.body.resourceType || 'image'; // 'video' or 'image'
        const folder = req.body.folder || 'lms';

        const streamUpload = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ resource_type: resourceType, folder }, (error, result) => {
                    if (result) resolve(result);
                    else reject(error);
                });
                streamifier.createReadStream(fileBuffer).pipe(stream);
            });
        }

        const result = await streamUpload(req.file.buffer);
        // Return simplified payload
        res.json({ ok: true, secure_url: result.secure_url, public_id: result.public_id, raw: result });
    } catch (err) { next(err); }
});

module.exports = router;
