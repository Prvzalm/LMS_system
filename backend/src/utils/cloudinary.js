const cloudinary = require('cloudinary').v2
const dotenv = require('dotenv')
dotenv.config()

// Configure cloudinary from env vars. Try cloudinary.config() first (reads CLOUDINARY_URL),
// if that doesn't populate keys we'll parse CLOUDINARY_URL or read explicit vars.
try {
    if (process.env.CLOUDINARY_URL) {
        // This will work if CLOUDINARY_URL is in correct format
        cloudinary.config()
        // verify config
        if (!cloudinary.config().api_key) {
            // fallthrough to parsing
            throw new Error('CLOUDINARY_URL did not yield api_key')
        }
        module.exports = cloudinary
        return
    }
} catch (e) {
    // continue to other methods
}

// parse CLOUDINARY_URL of the form cloudinary://api_key:api_secret@cloud_name
if (process.env.CLOUDINARY_URL) {
    const m = process.env.CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/)
    if (m) {
        cloudinary.config({ cloud_name: m[3], api_key: m[1], api_secret: m[2] })
        module.exports = cloudinary
        return
    }
}

// fallback to explicit env vars
if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET })
    module.exports = cloudinary
    return
}

// If we reach here, cloudinary isn't configured; export cloudinary anyway (calls will error)
console.warn('Cloudinary not configured: set CLOUDINARY_URL or CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET/CLOUDINARY_CLOUD_NAME')
module.exports = cloudinary
