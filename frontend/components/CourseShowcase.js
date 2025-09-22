import Link from 'next/link'

export default function CourseShowcase({ courses = [] }) {
    // take up to 6 and render large tiles (3 columns on desktop)
    const tiles = courses.slice(0, 6)
    return (
        <div className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tiles.map((c) => (
                    <Link key={c._id} href={'/courses/' + c._id} className="group block rounded-2xl overflow-hidden bg-dark-800 border border-dark-700 p-6 hover:shadow-lg transition">
                        <div className="h-56 bg-[rgba(255,255,255,0.02)] rounded-lg flex items-end p-4">
                            <div>
                                <div className="text-white font-semibold text-xl">{c.title}</div>
                                <div className="text-muted text-sm mt-2">{(c.description || '').slice(0, 120)}</div>
                            </div>
                            <div className="ml-auto text-gray-400 opacity-0 group-hover:opacity-100 transition">+</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
