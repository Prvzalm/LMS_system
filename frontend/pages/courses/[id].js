import { useRouter } from 'next/router'
import useSWR from 'swr'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { getToken } from '../../utils/auth'
import { useStore } from '../../store/useStore'

const fetcher = url => fetch(url).then(r => r.json());

export default function CourseDetail() {
    const router = useRouter();
    const { id, lesson } = router.query;
    const { data: course, error } = useSWR(id ? process.env.NEXT_PUBLIC_API_URL + '/courses/' + id : null, fetcher);
    const [msg, setMsg] = useState('');
    const [mainImage, setMainImage] = useState(null)
    const [expandedLessons, setExpandedLessons] = useState({})
    const convertPrice = useStore(state => state.convertPrice)
    const currencySymbol = useStore(state => state.currencySymbol)

    // Handle lesson query parameter - expand the specified lesson
    useEffect(() => {
        if (lesson && course) {
            const lessonIndex = parseInt(lesson);
            if (!isNaN(lessonIndex) && lessonIndex >= 0 && lessonIndex < course.lessons.length) {
                setExpandedLessons(prev => ({ ...prev, [lessonIndex]: true }));
                // Scroll to the lesson after a short delay to ensure DOM is updated
                setTimeout(() => {
                    const lessonElement = document.getElementById(`lesson-${lessonIndex}`);
                    if (lessonElement) {
                        lessonElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 500);
            }
        }
    }, [lesson, course]);

    if (error) return <div className="p-8">Failed to load</div>;
    if (!course) return <div className="p-8">Loading...</div>;

    // const handleBuy = async () => {
    //     router.push(`/checkout/${id}`);
    // }

    const handleBuy = async () => {
        const token = getToken();
        if (!token) {
            alert('Please login first');
            return;
        }
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/buy/${id}`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert('Course purchased successfully!');
                // Optionally redirect to dashboard or purchased courses
            } else {
                alert(data.error || 'Purchase failed');
            }
        } catch (err) {
            alert('Error purchasing course');
        }
    }

    return (
        <>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <img src={mainImage || course.thumbnail || (course.images && course.images[0]) || '/placeholder.png'} className="w-full h-72 object-cover rounded shadow-sm" />
                    <h1 className="text-3xl font-bold mt-4 text-white">{course.title}</h1>
                    <p className="mt-4 text-muted">{course.description}</p>

                    {(course.images && course.images.length > 0) && (
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold text-white mb-3">Screenshots</h2>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {course.images.map((src, i) => (
                                    <img key={i} src={src} className="w-full h-24 object-cover rounded cursor-pointer border" onClick={() => setMainImage(src)} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                        <h2 className="text-xl font-semibold text-white">Lessons</h2>
                        <ul className="mt-2 space-y-2">
                            {course.lessons.map((l, idx) => {
                                const isExpanded = expandedLessons[idx]
                                const desc = l.description || ''
                                const shouldTruncate = desc.length > 300
                                const displayDesc = isExpanded ? desc : desc.slice(0, 300)
                                const isTargetLesson = lesson && parseInt(lesson) === idx;
                                return (
                                    <li
                                        key={idx}
                                        id={`lesson-${idx}`}
                                        className={`p-3 bg-dark-800 rounded shadow-sm transition-colors ${isTargetLesson ? 'ring-2 ring-orange-500 bg-orange-900/20' : ''
                                            }`}
                                    >
                                        <div className="font-semibold text-white">{l.title}</div>
                                        <div className="text-sm text-muted mt-1">
                                            {displayDesc}{shouldTruncate && !isExpanded ? '...' : ''}
                                        </div>
                                        {shouldTruncate && (
                                            <button
                                                onClick={() => setExpandedLessons(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                                className="text-accent text-sm mt-1 hover:underline"
                                            >
                                                {isExpanded ? 'Show less' : 'Read more'}
                                            </button>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
                <Card className="lg:col-span-1 h-fit">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-accent">{currencySymbol}{convertPrice(course.price)}</div>
                        <div className="text-sm text-muted mt-1">One-time payment</div>
                    </div>

                    <Button onClick={handleBuy} className="mt-6 w-full bg-accent text-black hover:bg-accent/90">
                        Buy Now
                    </Button>

                    <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Access to all {course.lessons?.length || 0} lessons</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Lifetime access</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>Certificate of completion</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-dark-700">
                        <Link href="#" className="block text-accent hover:underline text-center">
                            Preview course
                        </Link>
                    </div>
                </Card>
            </motion.div>
            {msg && <pre className="mt-4 p-2 bg-dark-800 rounded">{msg}</pre>}
        </>
    )
}
