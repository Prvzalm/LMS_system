import { motion } from 'framer-motion'
export default function Button({ children, className = '', variant = 'primary', ...props }) {
    const base = 'inline-flex items-center justify-center rounded-full font-medium transition focus:outline-none';
    const variants = {
        primary: 'bg-accent text-black hover:opacity-95 px-6 py-2 font-semibold shadow-sm',
        ghost: 'bg-transparent text-accent px-3 py-1',
        subtle: 'bg-dark-700 text-gray-200 px-3 py-1'
    }
    return (
        <motion.button whileTap={{ scale: 0.98 }} className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
            {children}
        </motion.button>
    )
}
