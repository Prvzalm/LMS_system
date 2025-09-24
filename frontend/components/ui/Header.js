import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { useStore } from '../../store/useStore'
import { authFetch, getToken, removeToken } from '../../utils/auth'
import toast from 'react-hot-toast'

export default function Header({ isHome }) {
    const [user, setUser] = useStore(state => [state.user, state.setUser])
    const setUserLoading = useStore(state => state.setUserLoading)
    const dark = useStore(state => state.dark)
    const setDark = useStore(state => state.setDark)
    const initDark = useStore(state => state.initDark)
    const toggleSearch = useStore(state => state.toggleSearch)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)

    // Header reads user from global store populated in _app.js. No repeated token checks here.

    useEffect(() => {
        // hydrate theme from store helper which reads localStorage on client
        initDark()
    }, [])

    useEffect(() => {
        if (typeof document !== 'undefined') {
            if (dark) document.documentElement.classList.add('dark')
            else document.documentElement.classList.remove('dark')
        }
    }, [dark])

    const handleLogout = () => {
        removeToken()
        try { setUser(null) } catch (e) { }
        try { setUserLoading(false) } catch (e) { }
        try { toast.success('Logged out') } catch (e) { }
        if (typeof window !== 'undefined') window.location.href = '/'
    }


    // click outside to close profile menu
    useEffect(() => {
        const onDoc = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
        }
        document.addEventListener('click', onDoc)
        return () => document.removeEventListener('click', onDoc)
    }, [])

    return (
        <motion.header className="glass border-b fixed w-full z-30 shadow-[0_1px_0_rgba(255,255,255,0.02)]" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div className={`container px-6 md:px-8 py-3 relative flex items-center`}>
                <div className="flex items-center gap-6">
                    <Link href='/' className={`text-lg font-semibold tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>MyLMS</Link>
                </div>

                <nav className="hidden md:flex items-center gap-6 text-sm text-muted absolute left-1/2 transform -translate-x-1/2">
                    <Link href="/">Home</Link>
                    <Link href="/courses">Courses</Link>
                    <Link href="/about">About</Link>
                    <Link href="/contact">Contact</Link>
                </nav>

                <div className="ml-auto flex items-center gap-4">
                    {/* Mobile menu toggle */}
                    <button aria-label="Open navigation" onClick={() => setMobileOpen(o => !o)} className="md:hidden inline-flex items-center justify-center p-2 rounded border transition-colors duration-150" aria-expanded={mobileOpen}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
                    </button>

                    <button aria-label="Toggle dark mode" onClick={() => setDark(d => !d)} className={`hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded border transition-colors duration-150 ${dark ? 'bg-dark-800 text-gray-200 border-dark-700' : 'bg-gray-50 text-gray-800 border-gray-200'}`}>
                        {dark ? '🌙 Dark' : '☀️ Light'}
                    </button>
                    <button className="px-2 py-1 rounded bg-transparent text-gray-300" onClick={() => {
                        toggleSearch()
                        // focus fullscreen search input when opening
                        setTimeout(() => {
                            const el = document.getElementById('fullscreen-search-input')
                            if (el) el.focus()
                        }, 120)
                    }}>Search</button>
                    {user ? (
                        <>
                            {/* Profile avatar with dropdown */}
                            <div className="relative" ref={menuRef}>
                                <button onClick={() => setMenuOpen(o => !o)} className="inline-flex items-center gap-2 focus:outline-none">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-700 overflow-hidden flex items-center justify-center text-sm font-medium text-gray-800">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            (user.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U'))
                                        )}
                                    </div>
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-dark-900 border rounded shadow-md z-50">
                                        <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-800">Profile</Link>
                                        <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-800">Dashboard</Link>
                                        <Link href="/settings" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-800">Settings</Link>
                                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-dark-800">Logout</button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link href="/login" className={`text-sm ${dark ? 'text-accent' : 'text-accent'}`}>Login</Link>
                    )}
                </div>

                {/* Mobile navigation panel */}
                {mobileOpen && (
                    <div className="md:hidden absolute left-0 right-0 top-full z-40 bg-white dark:bg-dark-900 border-t border-dark-700 text-gray-800 dark:text-white">
                        <div className="px-6 md:px-8 py-4">
                            <nav className="flex flex-col space-y-2">
                                <Link href="/" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-dark-800">Home</Link>
                                <Link href="/courses" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-dark-800">Courses</Link>
                                <Link href="/about" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-dark-800">About</Link>
                                <Link href="/contact" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-dark-800">Contact</Link>
                            </nav>

                            <div className="mt-3 border-t border-dark-700 pt-3 flex flex-col gap-2">
                                <button onClick={() => { setDark(d => !d); }} className="text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-dark-800">{dark ? 'Switch to Light' : 'Switch to Dark'}</button>
                                <button onClick={() => {
                                    toggleSearch(); setMobileOpen(false); setTimeout(() => {
                                        const el = document.getElementById('fullscreen-search-input')
                                        if (el) el.focus()
                                    }, 120);
                                }} className="text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-dark-800">Search</button>
                                {user ? (
                                    <>
                                        <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-dark-800">Dashboard</Link>
                                        <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="text-left px-3 py-2 rounded text-red-500 hover:bg-gray-100 dark:hover:bg-dark-800">Logout</button>
                                    </>
                                ) : (
                                    <Link href="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-dark-800">Login</Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.header>
    )
}
