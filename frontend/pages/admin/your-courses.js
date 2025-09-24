import { useEffect, useState } from 'react'
import RequireAdmin from '../../components/RequireAdmin'
import AdminLayout from '../../components/admin/AdminLayout'
import { authFetch } from '../../utils/auth'
import CourseCard from '../../components/CourseCard'
import CourseEditModal from '../../components/CourseEditModal'

function YourCoursesInner() {
    const [courses, setCourses] = useState([])
    const [editingCourse, setEditingCourse] = useState(null)
    const [viewingCourse, setViewingCourse] = useState(null)

    useEffect(() => { fetchCourses() }, [])

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

    return (
        <AdminLayout>
            <>
                <h1 className="text-2xl font-bold mb-4">Your Courses</h1>
                <div className="grid md:grid-cols-3 gap-6">
                    {courses.map(c => (
                        <div key={c._id}>
                            <CourseCard course={c} onEdit={() => setEditingCourse(c)} onView={() => setViewingCourse(c)} />
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
