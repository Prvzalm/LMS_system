import { create } from 'zustand'

export const useStore = create((set) => ({
    // theme
    // keep a stable default on server and client to avoid hydration mismatch
    dark: false,
    // setDark accepts either a boolean or an updater function (prev => next)
    setDark: (v) => {
        if (typeof v === 'function') {
            set((s) => {
                const next = !!v(s.dark)
                try { if (typeof window !== 'undefined') localStorage.setItem('mylms:dark', next ? '1' : '0') } catch (e) { }
                return { dark: next }
            });
        } else {
            const next = !!v
            try { if (typeof window !== 'undefined') localStorage.setItem('mylms:dark', next ? '1' : '0') } catch (e) { }
            set(() => ({ dark: next }));
        }
    },

    // optional: hydrate dark from localStorage on client
    initDark: () => {
        if (typeof window === 'undefined') return
        try {
            const saved = localStorage.getItem('mylms:dark')
            if (saved !== null) set(() => ({ dark: saved === '1' }))
        } catch (e) { }
    },

    // search
    query: '',
    setQuery: (q) => set(() => ({ query: q })),

    // authenticated user (client-only, hydrated from token)
    user: null,
    setUser: (u) => set(() => ({ user: u })),

    // toast helpers (light wrapper that will call react-hot-toast from components)
    // We store a small queue for programs that prefer reading store; primarily use showToast()
    toasts: [],
    addToast: (t) => set((s) => ({ toasts: [...s.toasts, t] })),
    removeToast: (id) => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })),
    showToast: (msg, opts = {}) => {
        // convenience method; components can still import react-hot-toast directly
        try {
            // push a lightweight record into store (useful for debugging)
            const id = Date.now() + Math.random().toString(36).slice(2, 7)
            set((s) => ({ toasts: [...s.toasts, { id, msg, opts }] }))
            // auto remove after ttl if provided
            const ttl = opts.duration || 4000
            setTimeout(() => {
                try { useStore.getState().removeToast(id) } catch (e) { }
            }, ttl)
            return id
        } catch (e) { return null }
    },

    // controls whether the fullscreen search overlay is visible
    // default false so it does not open on page load
    searchVisible: false,
    toggleSearch: () => set((s) => ({ searchVisible: !s.searchVisible })),
    showSearch: () => set(() => ({ searchVisible: true })),
    hideSearch: () => set(() => ({ searchVisible: false })),
}))
