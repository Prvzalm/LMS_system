import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useStore } from '../store/useStore'
import { authFetch, getToken } from '../utils/auth'
import toast from 'react-hot-toast'
import Container from '../components/ui/Container'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function SettingsPage() {
    const router = useRouter()
    const [user, setUser] = useStore(state => [state.user, state.setUser])
    const [dark, setDark] = useStore(state => [state.dark, state.setDark])
    const [currency, currencySymbol] = useStore(state => [state.currency, state.currencySymbol])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Check authentication
        if (!user) {
            const token = getToken()
            if (!token) {
                router.replace('/login')
                return
            }
        }
    }, [user])

    const handleUpdateProfile = async (updates) => {
        setLoading(true)
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })
            const data = await res.json()
            if (data.user) {
                setUser(data.user)
                toast.success('Profile updated successfully')
            } else {
                toast.error(data.error || 'Update failed')
            }
        } catch (e) {
            console.error(e)
            toast.error('Network error')
        }
        setLoading(false)
    }

    if (!user) return <Container>Loading...</Container>

    return (
        <Container>
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-white">Settings</h1>

                {/* Appearance Settings */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Appearance</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDark(false)}
                                    className={`px-4 py-2 rounded border ${!dark ? 'bg-orange-500 text-white border-orange-500' : 'bg-dark-800 text-gray-300 border-dark-700 hover:bg-dark-700'}`}
                                >
                                    Light
                                </button>
                                <button
                                    onClick={() => setDark(true)}
                                    className={`px-4 py-2 rounded border ${dark ? 'bg-orange-500 text-white border-orange-500' : 'bg-dark-800 text-gray-300 border-dark-700 hover:bg-dark-700'}`}
                                >
                                    Dark
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Currency Settings */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Currency</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-300">
                                Current currency: <span className="font-semibold text-white">{currency} ({currencySymbol})</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Currency is automatically detected based on your location. Prices are converted from USD.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Account Settings */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Account</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <p className="text-white">{user.email}</p>
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Account Type</label>
                            <p className="text-white">{user.isAdmin ? 'Administrator' : 'Student'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Member Since</label>
                            <p className="text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </Card>

                {/* Danger Zone */}
                <Card className="p-6 border-red-500/20">
                    <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium text-white mb-2">Delete Account</h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                                        // Handle account deletion
                                        toast.error('Account deletion not implemented yet')
                                    }
                                }}
                            >
                                Delete Account
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </Container>
    )
}