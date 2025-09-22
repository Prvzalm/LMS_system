import { useEffect, useState } from 'react'
import { useStore } from '../../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function FullScreenSearch() {
    const searchVisible = useStore(state => state.searchVisible)
    const toggleSearch = useStore(state => state.toggleSearch)
    const [query, setQuery] = useState('')
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // fetch courses once when overlay opens
        if (!searchVisible) return
        let cancelled = false
        setLoading(true)
        fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/courses')
            .then(r => r.json())
            .then(data => {
                if (cancelled) return
                setCourses(Array.isArray(data) ? data : (data.courses || []))
            })
            .catch(() => setCourses([]))
            .finally(() => setLoading(false))
        return () => { cancelled = true }
    }, [searchVisible])

    const filtered = query.trim() === '' ? [] : courses.filter(c => (c.title || '').toLowerCase().includes(query.toLowerCase()) || (c.description || '').toLowerCase().includes(query.toLowerCase()))

    return (
        <AnimatePresence>
            {searchVisible && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start md:items-center justify-center p-6">
                    <motion.div initial={{ y: -20 }} animate={{ y: 0 }} exit={{ y: -20 }} className="w-full max-w-3xl bg-white dark:bg-dark-900 rounded-lg shadow-lg p-6">
                        <div className="flex items-center gap-3">
                            <input id="fullscreen-search-input" autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search courses..." className="flex-1 p-3 rounded border border-gray-200 dark:border-dark-700 bg-transparent focus:outline-none" />
                            <button onClick={() => { setQuery(''); toggleSearch() }} className="px-3 py-2 text-sm text-gray-600">Close</button>
                        </div>

                        <div className="mt-4">
                            {loading && <div className="text-sm text-muted">Loading...</div>}
                            {!loading && query.trim() === '' && <div className="text-sm text-muted">Type to search courses</div>}

                            {!loading && query.trim() !== '' && (
                                <div className="mt-3 grid gap-3">
                                    {filtered.length === 0 && <div className="text-sm text-muted">No matches</div>}
                                    {filtered.map(course => (
                                        <Link key={course._id || course.id || course.slug || course.title} href={`/courses/${course._id || course.id || course.slug}`} className="block p-3 rounded hover:bg-gray-100 dark:hover:bg-dark-800" onClick={() => { setQuery(''); toggleSearch(); }}>
                                            <div className="font-semibold">{course.title}</div>
                                            {course.description && <div className="text-sm text-muted">{course.description.slice(0, 120)}</div>}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
