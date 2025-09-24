import '../styles/globals.css'
import Head from 'next/head'
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
    const setUserLoading = useStore(state => state.setUserLoading)
    const initCurrency = useStore(state => state.initCurrency)

    // hydrate user once on client when app mounts to avoid repeated token checks
    useEffect(() => {
        const token = getToken()
        if (!token) {
            setUserLoading(false) // No token, auth check complete
            return
        }
        (async () => {
            try {
                const res = await authFetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/auth/me')
                const data = await res.json()
                if (data && data.user) setUser(data.user)
            } catch (e) { /* ignore - user remains null */ }
            setUserLoading(false) // Auth check complete
        })()
    }, [])

    // init currency on app load
    useEffect(() => {
        initCurrency()
    }, [])

    const isHome = router.route === '/'
    return (
        <>
            <Head>
                <title>LMS System - Online Learning Platform</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Learn new skills with our comprehensive Learning Management System. Access courses, track progress, and achieve your goals." />
                <meta name="keywords" content="online learning, courses, education, LMS, skill development, training" />
                <meta name="author" content="LMS System" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="LMS System - Online Learning Platform" />
                <meta property="og:description" content="Learn new skills with our comprehensive Learning Management System." />
                <meta property="og:image" content="/og-image.jpg" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:title" content="LMS System - Online Learning Platform" />
                <meta property="twitter:description" content="Learn new skills with our comprehensive Learning Management System." />
                <meta property="twitter:image" content="/og-image.jpg" />

                {/* Favicon - multiple formats for better compatibility */}
                <link rel="icon" type="image/x-icon" href="/favicon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/site.webmanifest" />
            </Head>
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
        </>
    )
}

export default MyApp
