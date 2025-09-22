export default function Card({ children, className = '' }) {
    return (
        <div className={`bg-dark-800 border border-dark-700 rounded-xl shadow-sm p-4 ${className}`}>
            {children}
        </div>
    )
}
