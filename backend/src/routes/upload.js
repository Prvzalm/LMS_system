const express = require('express');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');
const { auth, adminOnly } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// cloudinary configured via backend/src/utils/cloudinary.js

// Create temp directory for large files
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer with disk storage for large files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        files: 1,
        fileSize: 10 * 1024 * 1024 * 1024 // 10GB explicit limit
    }
});

router.post('/upload', auth, adminOnly, upload.single('file'), async (req, res, next) => {
    try {
        try {
            const cfg = cloudinary.config()
            if (!cfg || !cfg.api_key) return res.status(500).json({ error: 'Cloudinary not configured (missing api_key). Ensure CLOUDINARY_URL or CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET are set and restart the server.' })
        } catch (e) { return res.status(500).json({ error: 'Cloudinary configuration error' }) }
        if (!req.file) return res.status(400).json({ error: 'No file provided' });

        const resourceType = req.body.resourceType || 'image'; // 'video' or 'image'
        const folder = req.body.folder || 'lms';
        const fileSize = req.file.size;
        const fileName = req.file.originalname;

        console.log(`Starting upload of ${fileName} (${(fileSize / (1024 * 1024)).toFixed(2)}MB) to Cloudinary...`);

        const streamUpload = (filePath) => {
            return new Promise((resolve, reject) => {
                const totalBytes = fileSize;

                const stream = cloudinary.uploader.upload_stream({
                    resource_type: resourceType,
                    folder,
                    chunk_size: 10000000, // 10MB chunks for larger files
                    timeout: 1800000 // 30 minutes timeout for very large files
                }, (error, result) => {
                    if (result) {
                        console.log(`Upload completed: ${fileName} (${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)}GB)`);
                        // Clean up temp file
                        fs.unlink(filePath, (err) => {
                            if (err) console.error('Error deleting temp file:', err);
                        });
                        resolve(result);
                    } else {
                        console.error(`Upload failed: ${fileName}`, error);
                        // Clean up temp file on error
                        fs.unlink(filePath, (err) => {
                            if (err) console.error('Error deleting temp file:', err);
                        });
                        reject(error);
                    }
                });

                // Track upload progress
                stream.on('progress', (progress) => {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    console.log(`Upload progress: ${fileName} - ${percent}% (${(progress.loaded / (1024 * 1024)).toFixed(1)}MB / ${(progress.total / (1024 * 1024)).toFixed(1)}MB)`);
                });

                // Read file from disk and pipe to cloudinary
                const fileStream = fs.createReadStream(filePath);
                fileStream.pipe(stream);
            });
        }

        const result = await streamUpload(req.file.path);

        // Return simplified payload with file info
        res.json({
            ok: true,
            secure_url: result.secure_url,
            public_id: result.public_id,
            fileName: fileName,
            fileSize: fileSize,
            fileSizeGB: (fileSize / (1024 * 1024 * 1024)).toFixed(2),
            unlimited: true, // Indicates unlimited file size support
            raw: result
        });
    } catch (err) {
        console.error('Upload error:', err);
        next(err);
    }
});

module.exports = router;
