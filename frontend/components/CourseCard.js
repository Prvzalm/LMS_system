import Link from 'next/link'
import { motion } from 'framer-motion'
import Card from './ui/Card'
import Button from './ui/Button'
import { useStore } from '../store/useStore'

export default function CourseCard({ course, onEdit, onView, onDelete, isDeleting = false }) {
    const convertPrice = useStore(state => state.convertPrice)
    const currencySymbol = useStore(state => state.currencySymbol)

    return (
        <motion.div whileHover={{ y: -6 }}>
            <Card className="overflow-hidden p-0">
                <img src={(course.images && course.images[0]) || course.thumbnail || '/placeholder.png'} alt="thumb" className="w-full h-44 object-cover" />
                <div className="p-4">
                    <h3 className="font-medium text-lg text-white">{course.title}</h3>
                    <p className="text-sm text-muted line-clamp-2 mt-1">{course.description || ''}</p>
                    <div className="mt-3 flex flex-col gap-3">
                        <div className="text-lg font-medium text-muted">{currencySymbol}{convertPrice(course.price)}</div>
                        <div className="flex flex-wrap gap-2 justify-end">
                            {onView ? <Button variant="ghost" onClick={() => onView(course)}>View</Button> : <Link href={'/courses/' + course._id}><Button variant="ghost">View</Button></Link>}
                            {onEdit && <Button variant="ghost" onClick={() => onEdit(course)}>Edit</Button>}
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete "${course.title}"?\n\nThis will permanently delete the course and all associated videos from the server.`)) {
                                            onDelete(course);
                                        }
                                    }}
                                    disabled={isDeleting}
                                    className="!text-red-500 hover:!text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 flex items-center gap-2 border border-red-200 dark:border-red-800 rounded-lg px-3 py-1"
                                >
                                    {isDeleting && (
                                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}
