import useSWR from 'swr'
import CourseCard from '../../components/CourseCard'

const fetcher = url => fetch(url).then(r => r.json())

export default function Courses() {
    const { data: courses, error } = useSWR(process.env.NEXT_PUBLIC_API_URL + '/api/courses', fetcher)
    if (error) return <div className="p-8">Failed to load</div>
    if (!courses) return <div className="p-8">Loading...</div>

    return (
        <>
            <h1 className="text-3xl font-bold mb-8 mt-6 text-white">All Courses</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(c => <CourseCard key={c._id} course={c} />)}
            </div>
        </>
    )
}
