import { useEffect, useState } from 'react'
import RequireAdmin from '../../components/RequireAdmin'
import AdminLayout from '../../components/admin/AdminLayout'
import { authFetch } from '../../utils/auth'
import { useStore } from '../../store/useStore'
import CourseCard from '../../components/CourseCard'
import CourseEditModal from '../../components/CourseEditModal'
import toast from 'react-hot-toast'

function YourCoursesInner() {
    const [courses, setCourses] = useState([])
    const [editingCourse, setEditingCourse] = useState(null)
    const [viewingCourse, setViewingCourse] = useState(null)
    const [deletingCourseId, setDeletingCourseId] = useState(null)
    const userLoading = useStore(state => state.userLoading)

    useEffect(() => {
        if (!userLoading) {
            fetchCourses()
        }
    }, [userLoading])

    const fetchCourses = async () => {
        try {
            const res = await authFetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/admin/courses')
            if (res.ok) setCourses(await res.json())
            else {
                const pub = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/courses')
                setCourses(await pub.json())
            }
        } catch (e) { console.error(e) }
    }

    const handleDeleteCourse = async (course) => {
        try {
            setDeletingCourseId(course._id)

            // Show loading toast
            const loadingToast = toast.loading(`Deleting "${course.title}"...`)

            const res = await authFetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/admin/courses/' + course._id, {
                method: 'DELETE'
            })

            // Dismiss loading toast
            toast.dismiss(loadingToast)

            if (res.ok) {
                const result = await res.json()
                toast.success(`Course "${course.title}" deleted successfully!\n${result.deletedVideos || 0} videos removed from server.`, {
                    duration: 5000
                })
                fetchCourses() // Refresh the courses list
            } else {
                const error = await res.json()
                toast.error(`Failed to delete course: ${error.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Delete error:', error)
            toast.error('Failed to delete course. Please try again.')
        } finally {
            setDeletingCourseId(null)
        }
    }

    return (
        <AdminLayout>
            <>
                <h1 className="text-2xl font-bold mb-4">Your Courses</h1>
                <div className="grid md:grid-cols-3 gap-6">
                    {courses.map(c => (
                        <div key={c._id}>
                            <CourseCard
                                course={c}
                                onEdit={() => setEditingCourse(c)}
                                onView={() => setViewingCourse(c)}
                                onDelete={handleDeleteCourse}
                                isDeleting={deletingCourseId === c._id}
                            />
                        </div>
                    ))}
                </div>

                {editingCourse && <CourseEditModal course={editingCourse} onClose={() => { setEditingCourse(null); fetchCourses() }} />}
                {viewingCourse && <CourseEditModal course={viewingCourse} mode="view" onClose={() => setViewingCourse(null)} />}
            </>
        </AdminLayout>
    )
}

export default function YourCourses() {
    return (
        <RequireAdmin>
            <YourCoursesInner />
        </RequireAdmin>
    )
}
