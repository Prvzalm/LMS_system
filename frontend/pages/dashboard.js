import { useEffect, useState } from 'react'
import VideoPlayer from '../components/VideoPlayer'
import { useStore } from '../store/useStore'
import Link from 'next/link';
import Container from '../components/ui/Container'

export default function Dashboard() {
    const user = useStore(state => state.user)
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

    if (loading) return <Container>Loading...</Container>
    if (!user) return (
        <Container>
            <h1 className="text-2xl font-bold mb-4">Your Dashboard</h1>
            <p className="mb-4">Please <Link href="/login" className="text-indigo-600">log in</Link> to see your purchased courses.</p>
        </Container>
    )

    return (
        <Container>
            <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}</h1>
            <p className="mb-4">Your purchased courses are listed below.</p>
            {courses.length === 0 && <div className="text-gray-600">You haven't purchased any courses yet.</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                {courses.map(c => (
                    <div key={c._id} className="p-4 border rounded bg-white">
                        <h3 className="font-semibold">{c.title}</h3>
                        <p className="text-sm text-gray-600">${c.price}</p>
                        <ul className="mt-2">
                            {c.lessons && c.lessons.map((l, i) => (
                                <li key={i} className="py-1">
                                    {l.title} — <VideoPlayer courseId={c._id} lessonIndex={i} />
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </Container>
    )
}
