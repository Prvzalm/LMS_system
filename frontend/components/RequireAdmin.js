import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useStore } from '../store/useStore'

export default function RequireAdmin({ children }) {
    const router = useRouter()
    const [ok, setOk] = useState(null)
    const user = useStore(state => state.user)
    const userLoading = useStore(state => state.userLoading)

    useEffect(() => {
        // Wait for user loading to complete
        if (userLoading) {
            console.log('User authentication still loading...')
            return
        }

        // If user is not loaded after auth check is complete
        if (!user) {
            console.log('No user found after auth check, redirecting to admin login')
            router.replace('/admin/login')
            return
        }

        // Check if user is admin
        if (!user.isAdmin) {
            console.log('User exists but isAdmin is false/undefined, redirecting to admin login')
            router.replace('/admin/login')
            return
        }

        console.log('User exists and is admin, allowing access')
        setOk(true)
    }, [user, userLoading, router])

    // Show loading while checking authentication
    if (userLoading || ok === null) {
        return <div className="p-8">Checking admin access...</div>
    }

    return children
}
