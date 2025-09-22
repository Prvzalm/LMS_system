import { motion } from 'framer-motion'
import Button from './ui/Button'
import Card from './ui/Card'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useStore } from '../store/useStore'

export default function Hero() {
    const router = useRouter()
    const user = useStore(state => state.user)

    const onGetStarted = () => {
        if (user) router.push('/dashboard')
        else router.push('/signup')
    }
    return (
        <motion.section className="mb-12" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-8 items-center">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-white">Grow your career with expert-led courses</h1>
                        <p className="mt-4 text-lg text-muted">Practical, project-based learning created by industry professionals. Join thousands of learners and level up today.</p>
                        <div className="mt-6 flex gap-3">
                            <Button variant="primary" onClick={onGetStarted}>Get started</Button>
                            <Link href="/courses"><Button variant="ghost">Browse courses</Button></Link>
                        </div>
                        <div className="mt-6 text-sm text-gray-400">Trusted by professionals and teams worldwide.</div>
                    </div>
                    <div className="hidden lg:flex justify-center">
                        <div className="w-full max-w-md bg-gradient-to-tr from-dark-800 to-dark-900 rounded-lg p-6 shadow-lg">
                            <img src="/assets/illustration-learning.png" alt="learning illustration" className="w-full h-48 object-contain" />
                        </div>
                    </div>
                </div>
            </Card>
        </motion.section>
    )
}
