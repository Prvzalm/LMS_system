import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { setToken } from '../../utils/auth'
import { useStore } from '../../store/useStore'
import toast from 'react-hot-toast'

// A lightweight shadcn-style auth form (login/signup) with nice visuals
export default function ShadcnAuthForm({ mode = 'login', admin = false }) {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const isSignup = mode === 'signup'

    const setUser = useStore(state => state.setUser)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const url = (process.env.NEXT_PUBLIC_API_URL || '') + (isSignup ? '/api/auth/signup' : '/api/auth/login')
            const body = isSignup ? { name, email, password } : { email, password }
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()
            if (data.token) {
                setToken(data.token)
                // Always fetch user data from /me to get complete profile including isAdmin
                try {
                    const me = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/auth/me', { headers: { Authorization: 'Bearer ' + data.token } })
                    if (me.ok) {
                        const ju = await me.json()
                        if (ju.user) setUser(ju.user)
                    }
                } catch (e) { }
                toast.success(isSignup ? 'Account created' : 'Signed in')
                // after auth, go to dashboard or admin area when appropriate
                const target = admin ? '/admin/dashboard' : (isSignup ? '/dashboard' : (router.pathname.startsWith('/admin') ? '/admin/dashboard' : '/dashboard'))
                router.push(target)
            } else {
                toast.error(data.error || 'Authentication failed')
            }
        } catch (err) {
            console.error(err)
            alert('Network error')
        } finally {
            setLoading(false)
        }
    }

    const handleSocial = (provider) => {
        window.location.href = `/api/auth/${provider}`
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center">
            {/* full-width card to occupy available screen space and look expansive */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 bg-white/5 dark:bg-transparent border border-gray-200 dark:border-dark-700 rounded-lg overflow-hidden shadow-lg">
                <div className="hidden md:flex flex-col justify-center items-start p-10 bg-gradient-to-b from-orange-700 via-orange-900 to-black text-orange-100">
                    <h2 className="text-3xl font-bold mb-2">MyLMS</h2>
                    <p className="text-sm text-orange-100/80">Learn new skills, build projects and level up your career.</p>
                    <blockquote className="mt-6 text-sm text-orange-200">“Learning never exhausts the mind.”</blockquote>
                </div>

                <div className="p-6 md:p-10 flex items-center">
                    <div className="w-full">
                        <div className="mb-6">
                            <h3 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">{isSignup ? 'Create an account' : 'Sign in to your account'}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 text-center mt-2">{isSignup ? 'Enter your details to create your account' : 'Enter your email and password to continue'}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {isSignup && (
                                <div>
                                    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Name</label>
                                    <input required value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded border bg-white text-gray-900 border-gray-200 dark:bg-dark-900 dark:text-white dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="Your name" />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Email</label>
                                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded border bg-white text-gray-900 border-gray-200 dark:bg-dark-900 dark:text-white dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="name@example.com" />
                            </div>

                            <div>
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Password</label>
                                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded border bg-white text-gray-900 border-gray-200 dark:bg-dark-900 dark:text-white dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="••••••••" />
                            </div>

                            <button disabled={loading} type="submit" className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded font-semibold shadow-sm">{loading ? 'Please wait...' : (isSignup ? 'Create account' : 'Sign in')}</button>

                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 justify-center">
                                <span>{isSignup ? 'Already have an account?' : "Don't have an account?"}</span>
                                <Link href={isSignup ? '/login' : '/signup'} className="text-orange-500">{isSignup ? 'Sign in' : 'Create account'}</Link>
                            </div>

                            <div className="mt-2">
                                <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-2">Or continue with</div>
                                <div className="flex gap-3 justify-center">
                                    <button type="button" onClick={() => handleSocial('google')} className="flex items-center gap-2 px-4 py-2 border rounded w-full max-w-[220px] justify-center bg-white text-gray-700 hover:brightness-95">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.35 11.1h-9.17v2.92h5.26c-.23 1.3-1.42 3.82-5.26 3.82-3.16 0-5.74-2.6-5.74-5.82s2.58-5.82 5.74-5.82c1.8 0 3.01.76 3.7 1.41l2.52-2.43C17.3 3.05 14.95 2 12.18 2 6.9 2 2.75 6.08 2.75 11.28S6.9 20.5 12.18 20.5c6.99 0 8.9-5.36 8.9-9.4 0-.63-.07-1.11-.63-0.0z"></path></svg>
                                        <span className="text-sm">Continue with Google</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
