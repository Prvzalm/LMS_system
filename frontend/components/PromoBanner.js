import { motion } from 'framer-motion'
import Button from './ui/Button'
import { useRouter } from 'next/router'
import { useStore } from '../store/useStore'

export default function PromoBanner() {
    const router = useRouter()
    const user = useStore(state => state.user)

    const onGetStarted = () => {
        // If logged in, go to dashboard; otherwise go to signup
        if (user) router.push('/dashboard')
        else router.push('/signup')
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="my-6 bg-gradient-to-r from-rose-500 to-orange-400 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold">Launch your course</h3>
                    <p className="mt-1">Reach thousands of learners. Create and manage courses easily.</p>
                </div>
                <div>
                    <Button variant="primary" onClick={onGetStarted}>Get started</Button>
                </div>
            </div>
        </motion.div>
    )
}
