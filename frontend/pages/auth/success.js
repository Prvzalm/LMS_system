import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { setToken } from '../../utils/auth'
import { useStore } from '../../store/useStore'
import Link from 'next/link'

export default function AuthSuccess() {
    const router = useRouter()
    const setUser = useStore(state => state.setUser)
    const setUserLoading = useStore(state => state.setUserLoading)

    useEffect(() => {
        const { token } = router.query
        if (token) {
            try {
                setToken(token)
            } catch (err) {
                console.error('Failed to save token', err)
            }
            // fetch and hydrate user immediately so Header updates without refresh
            ; (async () => {
                setUserLoading(true)
                try {
                    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/auth/me', { headers: { Authorization: 'Bearer ' + token } })
                    const data = await res.json()
                    if (data && data.user) {
                        setUser(data.user)
                    }
                } catch (e) { console.error(e) }
                setUserLoading(false)
                // redirect to dashboard regardless
                router.replace('/dashboard')
            })()
        } else {
            router.replace('/login')
        }
    }, [router])

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-xl font-semibold">Signing you in…</h2>
                <p className="text-sm text-gray-600 mt-2">If you are not redirected automatically, please click <Link href="/login" className="text-orange-500">here</Link>.</p>
            </div>
        </div>
    )
}
