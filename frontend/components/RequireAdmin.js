import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useStore } from '../store/useStore'

export default function RequireAdmin({ children }) {
    const router = useRouter()
    const [ok, setOk] = useState(null)
    const user = useStore(state => state.user)

    useEffect(() => {
        // If user is not loaded, wait a short time for _app.js hydration
        if (!user) {
            const t = setTimeout(() => {
                const u = useStore.getState().user
                if (!u) router.replace('/admin/login')
            }, 600)
            return () => clearTimeout(t)
        }
        if (!user.isAdmin) {
            router.replace('/admin/login')
            return
        }
        setOk(true)
    }, [user])

    if (!ok) return <div className="p-8">Checking admin access...</div>
    return children
}
