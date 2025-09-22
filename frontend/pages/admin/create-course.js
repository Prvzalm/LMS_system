import { useState, useEffect } from 'react'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import FileInput from '../../components/ui/FileInput'
import Button from '../../components/ui/Button'
import { motion } from 'framer-motion'
import RequireAdmin from '../../components/RequireAdmin'
import AdminLayout from '../../components/admin/AdminLayout'
import { authFetch, getToken } from '../../utils/auth'
import CourseCard from '../../components/CourseCard'
import CourseEditModal from '../../components/CourseEditModal'

function CreateCourseInner() {
    const [step, setStep] = useState(1)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState(0)
    const [thumbnailFile, setThumbnailFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [thumbPreview, setThumbPreview] = useState(null)
    const [courses, setCourses] = useState([])
    const [editingCourse, setEditingCourse] = useState(null)
    const [lessons, setLessons] = useState([])

    useEffect(() => { fetchCourses() }, [])

    const fetchCourses = async () => {
        try {
            const res = await authFetch((process.env.NEXT_PUBLIC_API_URL || '') + '/admin/courses')
            // backend doesn't expose this route yet; fallback to public /courses
            if (res.status === 200) {
                const data = await res.json()
                setCourses(data)
            } else {
                const pub = await fetch(process.env.NEXT_PUBLIC_API_URL + '/courses')
                const d = await pub.json()
                setCourses(d)
            }
        } catch (err) { console.error('fetch courses', err) }
    }

    const uploadFile = async (file, resourceType = 'image') => {
        const form = new FormData();
        form.append('file', file);
        form.append('resourceType', resourceType);
        const token = getToken()
        if (!token) throw new Error('Not authenticated')
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/admin/upload', { method: 'POST', body: form, headers: { Authorization: 'Bearer ' + token } })
        return res.json();
    }

    const addLesson = () => setLessons(prev => [...prev, { title: '', description: '', file: null, uploading: false }])
    const removeLesson = (idx) => setLessons(prev => prev.filter((_, i) => i !== idx))
    const moveLesson = (idx, dir) => {
        setLessons(prev => {
            const arr = [...prev]
            const to = idx + dir
            if (to < 0 || to >= arr.length) return arr
            const t = arr[to]; arr[to] = arr[idx]; arr[idx] = t
            return arr
        })
    }
    const setLessonField = (idx, key, value) => {
        setLessons(prev => {
            const arr = [...prev]
            arr[idx] = { ...arr[idx], [key]: value }
            return arr
        })
    }

    const handleCreate = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoading(true)
        try {
            let thumbUrl = ''
            if (thumbnailFile) {
                const r = await uploadFile(thumbnailFile, 'image');
                thumbUrl = r.secure_url || (r.result && r.result.secure_url) || '';
            }
            const token = getToken()
            if (!token) throw new Error('Not authenticated')

            // create course first
            const res = await authFetch((process.env.NEXT_PUBLIC_API_URL || '') + '/admin/courses', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, thumbnail: thumbUrl, price, lessons: [] })
            })
            const data = await res.json()

            if (!data._id) {
                setLoading(false)
                alert('Failed to create course')
                return
            }

            // upload lessons videos and attach them to the created course
            for (let i = 0; i < lessons.length; i++) {
                const ls = lessons[i]
                if (!ls.title) continue
                let videoUrl = ls.videoUrl || ''
                if (ls.file) {
                    // mark uploading
                    setLessons(prev => prev.map((x, j) => j === i ? { ...x, uploading: true } : x))
                    const r = await uploadFile(ls.file, 'video')
                    videoUrl = r.secure_url || (r.result && r.result.secure_url) || ''
                    setLessons(prev => prev.map((x, j) => j === i ? { ...x, uploading: false } : x))
                }
                if (videoUrl) {
                    await authFetch((process.env.NEXT_PUBLIC_API_URL || '') + '/admin/courses/' + data._id + '/lessons', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: ls.title, videoUrl, description: ls.description })
                    })
                }
            }

            setLoading(false)
            // refresh list and clear form
            await fetchCourses()
            setTitle(''); setDescription(''); setPrice(0); setThumbnailFile(null); setThumbPreview(null); setLessons([])
        } catch (err) { setLoading(false); console.error(err); alert('Error creating course') }
    }

    const handleThumbnailChange = (file) => {
        setThumbnailFile(file)
        const url = URL.createObjectURL(file)
        setThumbPreview(url)
    }

    const openEdit = (course) => setEditingCourse(course)

    return (
        <>
            <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold mb-4">Admin - Create Course</motion.h1>

            <div className="flex items-start gap-6">
                <div className="w-full md:w-2/3">
                    <div className="bg-dark-800 p-6 rounded">
                        <div className="mb-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(step / 3) * 100}%` }}></div>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Step {step} of 3</div>
                        </div>
                        <div className="mb-4 flex gap-2">
                            <button className={"px-3 py-1 rounded " + (step === 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100')} onClick={() => setStep(1)}>1. Details</button>
                            <button className={"px-3 py-1 rounded " + (step === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-100')} onClick={() => setStep(2)}>2. Lessons</button>
                            <button className={"px-3 py-1 rounded " + (step === 3 ? 'bg-indigo-600 text-white' : 'bg-gray-100')} onClick={() => setStep(3)}>3. Review</button>
                        </div>

                        {step === 1 && (
                            <form onSubmit={e => { e.preventDefault(); setStep(2); }} className="space-y-3">
                                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
                                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
                                <Input type="number" className="w-32" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" />

                                <div>
                                    <label className="block text-sm font-medium">Thumbnail</label>
                                    <FileInput onChange={e => handleThumbnailChange(e.target.files[0])} />
                                    {thumbPreview && <img src={thumbPreview} className="mt-2 w-48 h-28 object-cover rounded shadow" />}
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" variant="primary">Next: Lessons</Button>
                                </div>
                            </form>
                        )}

                        {step === 2 && (
                            <div>
                                <h3 className="font-semibold mb-2">Lessons / Video Upload</h3>
                                <p className="text-sm text-gray-600 mb-4">Add lessons, upload videos and reorder them before publishing.</p>

                                <div className="space-y-3">
                                    {lessons.map((ls, idx) => (
                                        <div key={idx} className="p-3 border rounded bg-white">
                                            <div className="flex justify-between items-start">
                                                <div className="font-medium">Lesson {idx + 1}</div>
                                                <div className="flex items-center gap-2">
                                                    <button type="button" onClick={() => moveLesson(idx, -1)} className="px-2 py-1 bg-gray-100 rounded">↑</button>
                                                    <button type="button" onClick={() => moveLesson(idx, 1)} className="px-2 py-1 bg-gray-100 rounded">↓</button>
                                                    <button type="button" onClick={() => removeLesson(idx)} className="px-2 py-1 bg-red-50 text-red-600 rounded">Delete</button>
                                                </div>
                                            </div>
                                            <div className="mt-2 space-y-2">
                                                <Input placeholder="Lesson title" value={ls.title} onChange={e => setLessonField(idx, 'title', e.target.value)} />
                                                <Textarea placeholder="Lesson description" value={ls.description} onChange={e => setLessonField(idx, 'description', e.target.value)} />
                                                <div className="flex items-center gap-2">
                                                    <FileInput onChange={e => setLessonField(idx, 'file', e.target.files[0])} />
                                                    {ls.file && <span className="text-sm">{ls.file.name}</span>}
                                                    {ls.uploading && <span className="text-sm text-gray-500">Uploading...</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-3">
                                    <Button variant="ghost" onClick={addLesson}>+ Add lesson</Button>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <Button variant="subtle" onClick={() => setStep(1)}>Back</Button>
                                    <Button onClick={() => setStep(3)}>Next: Review</Button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h3 className="font-semibold mb-2">Review & Publish</h3>
                                <div className="space-y-2">
                                    <div><strong>Title:</strong> {title || '-'} </div>
                                    <div><strong>Description:</strong> {description || '-'} </div>
                                    <div><strong>Price:</strong> ${price}</div>
                                    {thumbPreview && <img src={thumbPreview} className="mt-2 w-48 h-28 object-cover rounded shadow" />}
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Button variant="subtle" onClick={() => setStep(2)}>Back</Button>
                                    <Button variant="primary" onClick={handleCreate} disabled={loading}>{loading ? 'Creating...' : 'Create Course'}</Button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                <aside className="hidden md:block md:w-1/3">
                    <div className="bg-dark-800 p-4 rounded">
                        <h3 className="font-semibold">Quick help</h3>
                        <p className="text-sm text-gray-600">Use steps to create a course. After creating, you can add lessons and upload videos in the lessons editor.</p>
                    </div>
                </aside>
            </div>

            {editingCourse && <CourseEditModal course={editingCourse} onClose={() => { setEditingCourse(null); fetchCourses(); }} />}
        </>
    )
}

export default function CreateCourse() {
    return (
        <RequireAdmin>
            <AdminLayout>
                <CreateCourseInner />
            </AdminLayout>
        </RequireAdmin>
    )
}
