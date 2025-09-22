import useSWR from 'swr'
import CourseCard from '../components/CourseCard'
import CourseShowcase from '../components/CourseShowcase'
import { useStore } from '../store/useStore'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Link from 'next/link'

const fetcher = url => fetch(url).then(r => r.json())

export default function Home() {
    const { data: courses, error } = useSWR(process.env.NEXT_PUBLIC_API_URL + '/courses', fetcher)
    const query = useStore(state => state.query)
    const setQuery = useStore(state => state.setQuery)

    if (error) return <div className="p-8">Failed to load</div>
    if (!courses) return <div className="p-8">Loading...</div>

    const filtered = courses.filter(c => c.title.toLowerCase().includes(query.toLowerCase()) || (c.description || '').toLowerCase().includes(query.toLowerCase()))

    return (
        <div className="min-h-screen bg-dark-900 text-white">
            <header>
                <div className="w-full flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1">
                        <motion.h1 initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl md:text-6xl leading-tight font-extrabold">Learn modern skills. Build real products.</motion.h1>
                        <p className="mt-4 text-gray-300 max-w-2xl">Project-based courses, expert instructors, and hands-on assignments that prepare you for real jobs.</p>

                        <div className="mt-6 flex gap-3">
                            <Link href="/courses" className="px-5 py-3 rounded bg-accent text-black font-semibold">Browse Courses</Link>
                            <GetStartedCTA />
                        </div>
                    </div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full md:w-1/2">
                        <div className="bg-gradient-to-tr from-dark-800 to-dark-900 p-6 rounded-lg glass animate-float">
                            <div className="h-60 flex items-center justify-center text-gray-400">Illustration / Video placeholder</div>
                        </div>
                    </motion.div>
                </div>
            </header>

            <main className="w-full">
                {/* landing search removed: use fullscreen search from header */}
                <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-dark-800 rounded-lg border border-dark-700">
                        <h3 className="text-xl font-semibold text-white">Project-based learning</h3>
                        <p className="mt-2 text-sm text-muted">Build real projects while you learn — resume-ready work you can show.</p>
                    </div>
                    <div className="p-6 bg-dark-800 rounded-lg border border-dark-700">
                        <h3 className="text-xl font-semibold text-white">Expert instructors</h3>
                        <p className="mt-2 text-sm text-muted">Courses taught by industry professionals with hands-on experience.</p>
                    </div>
                    <div className="p-6 bg-dark-800 rounded-lg border border-dark-700">
                        <h3 className="text-xl font-semibold text-white">Flexible learning</h3>
                        <p className="mt-2 text-sm text-muted">Learn at your own pace on desktop or mobile.</p>
                    </div>
                </section>

                <section className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">Popular Courses</h2>
                    <CourseShowcase courses={filtered} />
                </section>
            </main>

        </div>
    )
}

function GetStartedCTA() {
    const router = useRouter()
    const user = useStore(state => state.user)
    const onClick = () => {
        if (user) router.push('/dashboard')
        else router.push('/signup')
    }
    return (
        <button onClick={onClick} className="px-5 py-3 rounded border border-gray-700 text-gray-200">Get Started</button>
    )
}
