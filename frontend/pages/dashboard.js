import { useEffect, useState } from 'react'
import VideoPlayer from '../components/VideoPlayer'
import { useStore } from '../store/useStore'
import Link from 'next/link';
import Container from '../components/ui/Container'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { getToken } from '../utils/auth'
import { useRouter } from 'next/router'

export default function Dashboard() {
    const user = useStore(state => state.user)
    const convertPrice = useStore(state => state.convertPrice)
    const currencySymbol = useStore(state => state.currencySymbol)
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        ; (async () => {
            setLoading(true)
            try {
                if (!user) { setLoading(false); return }
                const purchased = user.purchasedCourses || [];
                if (purchased.length === 0) { setCourses([]); setLoading(false); return }
                if (typeof purchased[0] === 'object' && purchased[0].title) {
                    setCourses(purchased); setLoading(false); return
                }
                // fetch course details progressively so we can render immediately
                const placeholder = purchased.map(id => (typeof id === 'string' ? { _id: id, title: 'Loading...', price: 0, lessons: [] } : id))
                setCourses(placeholder)
                // fetch each course in background and update when ready
                purchased.forEach(async (id, idx) => {
                    try {
                        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/courses/' + (typeof id === 'string' ? id : id._id))
                        const json = await res.json()
                        setCourses(prev => {
                            const copy = [...prev]
                            // replace placeholder or id entry
                            const pos = copy.findIndex(x => x && x._id === json._id)
                            if (pos >= 0) copy[pos] = json
                            else copy.push(json)
                            return copy
                        })
                    } catch (e) {
                        // ignore individual failures
                    }
                })
            } catch (e) { }
            setLoading(false)
        })()
    }, [user]);

    if (loading) return <Container><div className="text-center py-12">Loading your courses...</div></Container>
    if (!user) return (
        <Container>
            <div className="text-center py-12">
                <h1 className="text-3xl font-bold mb-4 text-white">Your Dashboard</h1>
                <p className="mb-6 text-gray-300">Please <Link href="/login" className="text-orange-500 hover:text-orange-400">log in</Link> to see your purchased courses.</p>
            </div>
        </Container>
    )

    return (
        <Container>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name}!</h1>
                <p className="text-gray-300">Continue your learning journey with your purchased courses.</p>
            </div>

            {/* Continue Learning */}
            {courses.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">Continue Learning</h2>
                    <ContinueLearningCard course={courses[0]} convertPrice={convertPrice} currencySymbol={currencySymbol} />
                </div>
            )}

            {courses.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <h2 className="text-2xl font-semibold text-white mb-2">No courses yet</h2>
                    <p className="text-gray-400 mb-6">You haven't purchased any courses yet. Start learning today!</p>
                    <Link href="/courses">
                        <Button className="bg-orange-500 hover:bg-orange-600">Browse Courses</Button>
                    </Link>
                </div>
            ) : (
                <div>
                    <h2 className="text-2xl font-semibold text-white mb-6">Your Courses</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {courses.map(c => (
                            <CourseCard key={c._id} course={c} convertPrice={convertPrice} currencySymbol={currencySymbol} />
                        ))}
                    </div>
                </div>
            )}
        </Container>
    )
}

function CourseCard({ course, convertPrice, currencySymbol }) {
    const [expanded, setExpanded] = useState(false);
    const [progress, setProgress] = useState(null);
    const [loadingProgress, setLoadingProgress] = useState(false);

    // Load progress data when component mounts
    useEffect(() => {
        loadProgress();
    }, [course._id]);

    const loadProgress = async () => {
        setLoadingProgress(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/progress/${course._id}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setProgress(data.progress);
            }
        } catch (err) {
            console.error('Failed to load progress:', err);
        }
        setLoadingProgress(false);
    };

    const totalLessons = course.lessons?.length || 0;
    const completedLessons = progress?.watchedLessons?.length || 0;
    const progressPercentage = progress?.progressPercentage || 0;

    const markLessonWatched = (lessonIndex) => {
        // Update local progress state
        if (progress) {
            const newWatchedLessons = [...(progress.watchedLessons || [])];
            if (!newWatchedLessons.includes(lessonIndex)) {
                newWatchedLessons.push(lessonIndex);
                setProgress({
                    ...progress,
                    watchedLessons: newWatchedLessons,
                    progressPercentage: Math.round((newWatchedLessons.length / totalLessons) * 100)
                });
            }
        }
    };

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="relative">
                <img
                    src={(course.images && course.images[0]) || course.thumbnail || '/placeholder.png'}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Purchased
                    </span>
                </div>
                {progressPercentage > 0 && (
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-black bg-opacity-50 rounded-full h-2">
                            <div
                                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <p className="text-white text-xs mt-1">
                            {completedLessons} of {totalLessons} lessons completed
                        </p>
                    </div>
                )}
            </div>

            <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">{course.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>

                <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold text-orange-500">
                        {currencySymbol}{convertPrice(course.price)}
                    </div>
                    <div className="text-sm text-gray-400">
                        {course.lessons?.length || 0} lessons
                    </div>
                </div>

                <div className="space-y-3">
                    <Button
                        onClick={() => setExpanded(!expanded)}
                        variant="outline"
                        className="w-full"
                    >
                        {expanded ? 'Hide Lessons' : 'View Lessons'}
                    </Button>

                    {expanded && (
                        <div className="space-y-2 mt-4 pt-4 border-t border-dark-700">
                            {course.lessons && course.lessons.map((lesson, i) => {
                                const isWatched = progress?.watchedLessons?.includes(i) || false;
                                return (
                                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${isWatched ? 'bg-green-900 bg-opacity-20 border border-green-500' : 'bg-dark-800'
                                        }`}>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-white">{lesson.title}</h4>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Lesson {i + 1}
                                                {isWatched && (
                                                    <span className="ml-2 text-green-400">✓ Completed</span>
                                                )}
                                            </div>
                                        </div>
                                        <VideoPlayer
                                            courseId={course._id}
                                            lessonIndex={i}
                                            onWatched={() => markLessonWatched(i)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}

function ContinueLearningCard({ course, convertPrice, currencySymbol }) {
    const router = useRouter();
    const [nextLesson, setNextLesson] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNextLesson();
    }, [course._id]);

    const loadNextLesson = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/progress/${course._id}/next-lesson`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setNextLesson(data);
            }
        } catch (err) {
            console.error('Failed to load next lesson:', err);
        }
        setLoading(false);
    };

    const handleContinueCourse = () => {
        if (nextLesson) {
            // Use Next.js router for client-side navigation
            router.push(`/courses/${course._id}?lesson=${nextLesson.nextLessonIndex}`);
        } else {
            // Fallback to course page
            router.push(`/courses/${course._id}`);
        }
    };

    return (
        <Card className="p-6 bg-gradient-to-r from-orange-900/20 to-orange-800/20 border-orange-500/20">
            <div className="flex items-center gap-6">
                <img
                    src={(course.images && course.images[0]) || course.thumbnail || '/placeholder.png'}
                    alt={course.title}
                    className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{course.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleContinueCourse}
                            className="bg-orange-500 hover:bg-orange-600"
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : nextLesson?.hasUnwatchedLessons ? 'Continue Learning' : 'Review Course'}
                        </Button>
                        <div className="text-sm text-gray-400">
                            {nextLesson ? (
                                nextLesson.hasUnwatchedLessons ?
                                    `Next: Lesson ${nextLesson.nextLessonIndex + 1}` :
                                    'All lessons completed'
                            ) : (
                                `${course.lessons?.length || 0} lessons available`
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
