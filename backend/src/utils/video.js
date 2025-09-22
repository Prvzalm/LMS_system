// Video helpers: implement Cloudinary signed URL or passthrough
const cloudinary = require('cloudinary').v2;
const url = require('url');

if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || undefined,
        api_key: process.env.CLOUDINARY_API_KEY || undefined,
        api_secret: process.env.CLOUDINARY_API_SECRET || undefined,
        secure: true,
    });
}

function getSignedVideoUrl(videoIdentifier) {
    // videoIdentifier may be a Cloudinary public id or a full URL. If Cloudinary configured and public id given,
    // generate a signed URL with start/expiry as needed. For now, we return the Cloudinary URL with signature if possible.
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        // fallback: return whatever is stored (could be external URL)
        return videoIdentifier;
    }

    try {
        // If videoIdentifier looks like a Cloudinary public id (no scheme), create a streaming URL
        if (!/^https?:\/\//.test(videoIdentifier)) {
            // cloudinary uses the video streaming format
            const options = { resource_type: 'video', type: 'private' };
            // You can add timestamp/signature params or use signed delivery if configured in Cloudinary account
            const signedUrl = cloudinary.url(videoIdentifier, options);
            return signedUrl;
        }
        // If it's a full URL, just return it.
        return videoIdentifier;
    } catch (err) {
        return videoIdentifier;
    }
}

module.exports = { getSignedVideoUrl };
