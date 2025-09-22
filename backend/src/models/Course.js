const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
    title: String,
    description: String,
    videoUrl: String, // secure URL/id for hosting provider
}, { _id: false });

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    thumbnail: String,
    images: [String],
    price: { type: Number, default: 0 },
    lessons: [LessonSchema],
    sales: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
