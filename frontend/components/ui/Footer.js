import { useRouter } from 'next/router'

export default function Footer({ isHome }) {
    const router = useRouter()
    const hideRoutes = ['/login', '/signup', '/admin/login']
    if (hideRoutes.includes(router.pathname)) return null

    return (
        <footer className="mt-12 border-t border-dark-800">
            <div className={`container px-6 md:px-8 py-10 text-sm text-gray-400`}>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    <div className="col-span-1">
                        <div className="mb-4">MyLMS</div>
                        <div className="text-xs text-muted">© {new Date().getFullYear()} MyLMS</div>
                    </div>
                    <div>
                        <h4 className="text-sm text-white mb-3">Features</h4>
                        <ul className="space-y-2 text-muted">
                            <li>Plan</li>
                            <li>Build</li>
                            <li>Insights</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm text-white mb-3">Product</h4>
                        <ul className="space-y-2 text-muted">
                            <li>Pricing</li>
                            <li>Integrations</li>
                            <li>Download</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm text-white mb-3">Company</h4>
                        <ul className="space-y-2 text-muted">
                            <li>About</li>
                            <li>Careers</li>
                            <li>Brand</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm text-white mb-3">Resources</h4>
                        <ul className="space-y-2 text-muted">
                            <li>Developers</li>
                            <li>Documentation</li>
                            <li>Privacy</li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    )
}
