import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { useStore } from '../store/useStore'
import { authFetch, getToken } from '../utils/auth'
import toast from 'react-hot-toast'
import Container from '../components/ui/Container'

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useStore(state => [state.user, state.setUser])
    const userLoading = useStore(state => state.userLoading)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Wait for authentication check to complete
        if (userLoading) return

        // rely on global store user populated by _app.js; if not present, do a fast token check
        if (user) return
        // if there's no token locally, redirect immediately to avoid waiting
        try {
            const token = getToken()
            if (!token) {
                router.replace('/login')
                return
            }
            // token exists but user isn't hydrated yet — let _app.js finish hydration briefly
            // show loading until either store.user is set elsewhere or a short fallback occurs
            // (no artificial 600ms delay here to avoid blocking navigation unnecessarily)
        } catch (e) {
            router.replace('/login')
        }
    }, [user, userLoading, router])

    if (loading || !user || userLoading) return <Container>Loading...</Container>

    return (
        <Container>
            <div className="max-w-2xl mx-auto bg-white dark:bg-dark-900 border rounded p-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-dark-700 overflow-hidden flex items-center justify-center text-xl font-semibold">
                            {user.avatar ? (
                                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                (user.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U'))
                            )}
                        </div>
                        {/* camera overlay - opens file dialog */}
                        <div className="absolute right-0 bottom-0">
                            <label title="Change avatar" className="cursor-pointer bg-white dark:bg-dark-800 rounded-full">
                                <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" strokeLinecap="round" strokeLinejoin="round"></path><path d="M8 7l2-3h4l2 3" strokeLinecap="round" strokeLinejoin="round"></path><circle cx="12" cy="13" r="3" strokeLinecap="round" strokeLinejoin="round"></circle></svg>
                                <input id="avatar-file" className="hidden" type="file" accept="image/*" />
                            </label>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{user.name}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="text-md font-semibold">Update profile picture</h3>
                    <ProfileAvatarEditor />
                </div>

                <div className="mt-6">
                    <h3 className="text-md font-semibold">Account details</h3>
                    <dl className="mt-2 grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between"><dt className="text-muted">ID</dt><dd className="font-mono text-xs">{user._id}</dd></div>
                        <div className="flex justify-between"><dt className="text-muted">Is Admin</dt><dd>{user.isAdmin ? 'Yes' : 'No'}</dd></div>
                        {/* show other user fields if present */}
                        {user.purchasedCourses && (
                            <div>
                                <h4 className="mt-4 font-medium">Purchased courses</h4>
                                <ul className="list-disc ml-6 mt-2 text-sm">
                                    {user.purchasedCourses.map((c, i) => (
                                        <li key={i}>{typeof c === 'string' ? c : c.title || c._id}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </dl>
                </div>
            </div>
        </Container>
    )
}

function AvatarUploader() {
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const setUser = useStore(state => state.setUser)

    const handle = async () => {
        if (!file) return alert('Please select an image')
        setLoading(true)
        try {
            const form = new FormData()
            form.append('file', file)
            form.append('folder', 'profilePics')
            const res = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/user/avatar', {
                method: 'POST',
                headers: { Authorization: 'Bearer ' + (getToken() || '') },
                body: form
            })
            const data = await res.json()
            if (data && data.user) {
                setUser(data.user)
                alert('Profile picture updated')
            } else {
                alert(data.error || 'Upload failed')
            }
        } catch (e) { console.error(e); alert('Network error') }
        setLoading(false)
    }

    return (
        <div className="mt-3">
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
            <div className="mt-2">
                <button disabled={loading} onClick={handle} className="px-4 py-2 bg-orange-500 text-white rounded">{loading ? 'Uploading...' : 'Upload'}</button>
            </div>
        </div>
    )
}

function ProfileAvatarEditor() {
    const fileRef = useRef(null)
    const [preview, setPreview] = useState(null)
    const [file, setFile] = useState(null)
    const [saving, setSaving] = useState(false)
    const setUser = useStore(state => state.setUser)

    // handle file input change
    useEffect(() => {
        const el = document.getElementById('avatar-file')
        const onChange = (e) => {
            const f = e.target.files && e.target.files[0]
            if (!f) return
            setFile(f)
            const url = URL.createObjectURL(f)
            setPreview(url)
        }
        if (el) el.addEventListener('change', onChange)
        return () => { if (el) el.removeEventListener('change', onChange); if (preview) URL.revokeObjectURL(preview) }
    }, [preview])

    const handleSave = async () => {
        if (!file) return toast.error('No image selected')
        setSaving(true)
        try {
            const form = new FormData()
            form.append('file', file)
            form.append('folder', 'profilePics')
            const res = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/user/avatar', {
                method: 'POST',
                headers: { Authorization: 'Bearer ' + (getToken() || '') },
                body: form
            })
            const data = await res.json()
            if (data && data.user) {
                setUser(data.user)
                toast.success('Profile picture updated')
                setPreview(null)
                setFile(null)
                const el = document.getElementById('avatar-file')
                if (el) el.value = ''
            } else {
                toast.error(data.error || 'Upload failed')
            }
        } catch (e) { console.error(e); toast.error('Network error') }
        setSaving(false)
    }

    return (
        <div className="mt-3">
            {preview ? (
                <div className="flex items-center gap-3">
                    <div className="w-28 h-28 rounded-full overflow-hidden border">
                        <img src={preview} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-orange-500 text-white rounded">{saving ? 'Saving...' : 'Save'}</button>
                        <button onClick={() => { setPreview(null); setFile(null); const el = document.getElementById('avatar-file'); if (el) el.value = '' }} className="px-4 py-2 border rounded">Cancel</button>
                    </div>
                </div>
            ) : (
                <div className="text-sm text-gray-500">Click the camera icon on your avatar to choose a new image.</div>
            )}
        </div>
    )
}
