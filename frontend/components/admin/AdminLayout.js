import Link from 'next/link'
import { useRouter } from 'next/router'
import Container from '../ui/Container'

export default function AdminLayout({ children }) {
    const router = useRouter()
    const links = [
        { href: '/admin/dashboard', label: 'Dashboard' },
        { href: '/admin/create-course', label: 'Create Course' },
        { href: '/admin/your-courses', label: 'Your Courses' },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <aside className="col-span-1">
                <div className="sticky top-24">
                    <h2 className="text-xl font-bold mb-4">Admin</h2>
                    <nav className="space-y-2">
                        {links.map(l => (
                            <div key={l.href}>
                                <Link href={l.href} className={"block px-3 py-2 rounded " + (router.pathname === l.href ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50')}>{l.label}</Link>
                            </div>
                        ))}
                    </nav>
                </div>
            </aside>

            <main className="col-span-1 md:col-span-3">
                {children}
            </main>
        </div>
    )
}
