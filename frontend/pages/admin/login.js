import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useStore } from '../../store/useStore'
import ShadcnAuthForm from '../../components/ui/ShadcnAuthForm'

export default function AdminLogin() {
    const router = useRouter()
    const user = useStore(state => state.user)
    const userLoading = useStore(state => state.userLoading)

    useEffect(() => {
        // Wait for authentication check to complete
        if (userLoading) return

        // If user is already logged in and is admin, redirect to admin dashboard
        if (user && user.isAdmin) {
            console.log('Admin already logged in, redirecting to admin dashboard')
            router.replace('/admin/dashboard')
            return
        }
    }, [user, userLoading, router])

    // Show loading while checking authentication
    if (userLoading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-white">Checking admin authentication...</div>
        </div>
    }

    // If admin is already logged in, don't show login form
    if (user && user.isAdmin) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-white">Redirecting to admin dashboard...</div>
        </div>
    }

    return <ShadcnAuthForm mode="login" admin={true} />
}
