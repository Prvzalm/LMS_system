import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useStore } from '../store/useStore'
import ShadcnAuthForm from '../components/ui/ShadcnAuthForm'

export default function Login() {
    const router = useRouter()
    const user = useStore(state => state.user)
    const userLoading = useStore(state => state.userLoading)

    useEffect(() => {
        // Wait for authentication check to complete
        if (userLoading) return

        // If user is already logged in, redirect to dashboard
        if (user) {
            console.log('User already logged in, redirecting to dashboard')
            router.replace('/dashboard')
            return
        }
    }, [user, userLoading, router])

    // Show loading while checking authentication
    if (userLoading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-white">Checking authentication...</div>
        </div>
    }

    // If user is already logged in, don't show login form
    if (user) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-white">Redirecting to dashboard...</div>
        </div>
    }

    return <ShadcnAuthForm mode="login" />
}
