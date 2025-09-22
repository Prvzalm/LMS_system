const mongoose = require('mongoose');

const CourseProgressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    watchedLessons: [{ type: Number, default: [] }], // Array of lesson indices that have been watched
    lastWatchedLesson: { type: Number, default: 0 }, // Index of the last lesson watched
    completedAt: { type: Date }, // When the course was completed
    progressPercentage: { type: Number, default: 0 }, // 0-100
}, { timestamps: true });

// Compound index to ensure one progress document per user-course pair
CourseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('CourseProgress', CourseProgressSchema);