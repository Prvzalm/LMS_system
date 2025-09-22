import '../styles/globals.css'
import { useEffect } from 'react'
import Header from '../components/ui/Header'
import Footer from '../components/ui/Footer'
import Container from '../components/ui/Container'
import FullScreenSearch from '../components/ui/FullScreenSearch'
import { AnimatePresence, motion } from 'framer-motion'
import { getToken, authFetch } from '../utils/auth'
import { useStore } from '../store/useStore'
import Toast from '../components/ui/Toast'

function MyApp({ Component, pageProps, router }) {
    const setUser = useStore(state => state.setUser)
    const initCurrency = useStore(state => state.initCurrency)

    // hydrate user once on client when app mounts to avoid repeated token checks
    useEffect(() => {
        const token = getToken()
        if (!token) return
        (async () => {
            try {
                const res = await authFetch((process.env.NEXT_PUBLIC_API_URL || '') + '/auth/me')
                const data = await res.json()
                if (data && data.user) setUser(data.user)
            } catch (e) { /* ignore - user remains null */ }
        })()
    }, [])

    // init currency on app load
    useEffect(() => {
        initCurrency()
    }, [])

    const isHome = router.route === '/'
    return (
        <div>
            <Toast />
            <Header isHome={isHome} />
            <FullScreenSearch />
            <AnimatePresence mode="wait">
                <motion.main key={router.route} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                    <Container isHome={isHome}>
                        <Component {...pageProps} />
                    </Container>
                </motion.main>
            </AnimatePresence>
            <Footer isHome={isHome} />
        </div>
    )
}

export default MyApp
