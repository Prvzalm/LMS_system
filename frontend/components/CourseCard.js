import Link from 'next/link'
import { motion } from 'framer-motion'
import Card from './ui/Card'
import Button from './ui/Button'

export default function CourseCard({ course, onEdit, onView }) {
    return (
        <motion.div whileHover={{ y: -6 }}>
            <Card className="overflow-hidden p-0">
                <img src={(course.images && course.images[0]) || course.thumbnail || '/placeholder.png'} alt="thumb" className="w-full h-44 object-cover" />
                <div className="p-4">
                    <h3 className="font-medium text-lg text-white">{course.title}</h3>
                    <p className="text-sm text-muted line-clamp-2 mt-1">{course.description || ''}</p>
                    <div className="mt-3 flex items-center justify-between">
                        <div className="text-lg font-medium text-muted">${course.price}</div>
                        <div className="flex gap-2">
                            {onView ? <Button variant="ghost" onClick={() => onView(course)}>View</Button> : <Link href={'/courses/' + course._id}><Button variant="ghost">View</Button></Link>}
                            {onEdit && <Button variant="ghost" onClick={() => onEdit(course)}>Edit</Button>}
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}
