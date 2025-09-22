import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useStore } from '../../store/useStore'

// Simple wrapper that mounts react-hot-toast's Toaster globally.
// We also keep a tiny effect to mirror store.toasts into native toasts if components used showToast.
export default function Toast() {
    const toasts = useStore(state => state.toasts)

    useEffect(() => {
        // no-op: store.toasts can be used by debugging or future features
    }, [toasts])

    return <Toaster />
}
