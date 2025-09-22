const express = require('express');
const { auth } = require('../middleware/auth');
const CourseProgress = require('../models/CourseProgress');
const Course = require('../models/Course');

const router = express.Router();

// Get progress for a specific course
router.get('/:courseId', auth, async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.user._id;

        let progress = await CourseProgress.findOne({ user: userId, course: courseId });

        if (!progress) {
            // Create initial progress if it doesn't exist
            progress = new CourseProgress({
                user: userId,
                course: courseId,
                watchedLessons: [],
                lastWatchedLesson: 0,
                progressPercentage: 0
            });
            await progress.save();
        }

        res.json({
            progress: {
                watchedLessons: progress.watchedLessons,
                lastWatchedLesson: progress.lastWatchedLesson,
                progressPercentage: progress.progressPercentage,
                completedAt: progress.completedAt
            }
        });
    } catch (err) {
        next(err);
    }
});

// Update progress for a lesson
router.post('/:courseId/lesson/:lessonIndex', auth, async (req, res, next) => {
    try {
        const { courseId, lessonIndex } = req.params;
        const userId = req.user._id;
        const lessonIdx = parseInt(lessonIndex);

        // Get course to calculate total lessons
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Find or create progress
        let progress = await CourseProgress.findOne({ user: userId, course: courseId });

        if (!progress) {
            progress = new CourseProgress({
                user: userId,
                course: courseId,
                watchedLessons: [],
                lastWatchedLesson: 0,
                progressPercentage: 0
            });
        }

        // Add lesson to watched lessons if not already there
        if (!progress.watchedLessons.includes(lessonIdx)) {
            progress.watchedLessons.push(lessonIdx);
            progress.watchedLessons.sort((a, b) => a - b); // Keep sorted
        }

        // Update last watched lesson
        progress.lastWatchedLesson = Math.max(progress.lastWatchedLesson, lessonIdx);

        // Calculate progress percentage
        const totalLessons = course.lessons.length;
        progress.progressPercentage = Math.round((progress.watchedLessons.length / totalLessons) * 100);

        // Mark as completed if all lessons are watched
        if (progress.watchedLessons.length === totalLessons && !progress.completedAt) {
            progress.completedAt = new Date();
        }

        await progress.save();

        res.json({
            success: true,
            progress: {
                watchedLessons: progress.watchedLessons,
                lastWatchedLesson: progress.lastWatchedLesson,
                progressPercentage: progress.progressPercentage,
                completedAt: progress.completedAt
            }
        });
    } catch (err) {
        next(err);
    }
});

// Get next lesson to watch for a course
router.get('/:courseId/next-lesson', auth, async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.user._id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const progress = await CourseProgress.findOne({ user: userId, course: courseId });

        let nextLessonIndex = 0;

        if (progress) {
            // Find the first unwatched lesson
            for (let i = 0; i < course.lessons.length; i++) {
                if (!progress.watchedLessons.includes(i)) {
                    nextLessonIndex = i;
                    break;
                }
            }
            // If all lessons are watched, go to the last lesson
            if (nextLessonIndex === 0 && progress.watchedLessons.length === course.lessons.length) {
                nextLessonIndex = course.lessons.length - 1;
            }
        }

        res.json({
            nextLessonIndex,
            totalLessons: course.lessons.length,
            hasUnwatchedLessons: progress ? progress.watchedLessons.length < course.lessons.length : true
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;