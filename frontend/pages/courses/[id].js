import { useRouter } from 'next/router'
import useSWR from 'swr'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const fetcher = url => fetch(url).then(r => r.json());

export default function CourseDetail() {
    const router = useRouter();
    const { id } = router.query;
    const { data: course, error } = useSWR(id ? process.env.NEXT_PUBLIC_API_URL + '/courses/' + id : null, fetcher);
    const [msg, setMsg] = useState('');
    const [mainImage, setMainImage] = useState(null)

    if (error) return <div className="p-8">Failed to load</div>;
    if (!course) return <div className="p-8">Loading...</div>;

    const handleBuy = async () => {
        router.push(`/checkout/${id}`);
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
                            {course.lessons.map((l, idx) => (
                                <li key={idx} className="p-3 bg-dark-800 rounded shadow-sm flex justify-between items-center">{l.title} <span className="text-sm text-muted">{l.duration || ''}</span></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <Card className="lg:col-span-1">
                    <div className="text-2xl font-semibold text-white">${course.price}</div>
                    <Button onClick={handleBuy} className="mt-4 w-full">Buy Now</Button>
                    <div className="mt-4 text-sm text-muted">Access to all lessons after purchase.</div>
                    <Link href="#" className="block mt-4 text-accent">Preview course</Link>
                </Card>
            </motion.div>
            {msg && <pre className="mt-4 p-2 bg-dark-800 rounded">{msg}</pre>}
        </>
    )
}
