import { useState } from 'react'
import Modal from './ui/Modal'
import Input from './ui/Input'
import Textarea from './ui/Textarea'
import FileInput from './ui/FileInput'
import Button from './ui/Button'
import { authFetch, getToken } from '../utils/auth'

export default function CourseEditModal({ course, onClose, mode = 'edit' }) {
    const [title, setTitle] = useState(course.title || '')
    const [description, setDescription] = useState(course.description || '')
    const [price, setPrice] = useState(course.price || 0)
    const [thumbnailFile, setThumbnailFile] = useState(null)
    const [thumbPreview, setThumbPreview] = useState(null)
    const [imagesFiles, setImagesFiles] = useState([])
    const [imagePreviews, setImagePreviews] = useState([])
    const [lessons, setLessons] = useState(course.lessons || [])
    const [lessonFiles, setLessonFiles] = useState([])
    const [lessonPreviews, setLessonPreviews] = useState([])
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)

    const uploadFile = async (file, resourceType = 'image') => {
        const form = new FormData();
        form.append('file', file);
        form.append('resourceType', resourceType);
        const token = getToken()
        if (!token) throw new Error('Not authenticated')
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/admin/upload', {
            method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: form
        });
        return res.json();
    }

    const handleAddImage = () => {
        setImagesFiles(prev => [...prev, null])
        setImagePreviews(prev => [...prev, null])
    }

    const handleAddLesson = () => {
        setLessons(prev => [...prev, { title: '', description: '', videoUrl: '' }])
        setLessonFiles(prev => [...prev, null])
        setLessonPreviews(prev => [...prev, null])
    }

    const handleLessonChange = (index, key, value) => {
        const arr = [...lessons]
        arr[index] = { ...arr[index], [key]: value }
        setLessons(arr)
    }

    const handleLessonFile = (index, file) => {
        const arr = [...lessonFiles]
        arr[index] = file
        setLessonFiles(arr)
        const prevArr = [...lessonPreviews]
        prevArr[index] = file ? URL.createObjectURL(file) : null
        setLessonPreviews(prevArr)
    }

    const handleImageChange = (index, file) => {
        const arr = [...imagesFiles]
        arr[index] = file
        setImagesFiles(arr)
        const prevArr = [...imagePreviews]
        prevArr[index] = file ? URL.createObjectURL(file) : null
        setImagePreviews(prevArr)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setProgress(0)
        try {
            const totalUploads = (thumbnailFile ? 1 : 0) + imagesFiles.filter(f => f).length + lessonFiles.filter(f => f).length + 1
            let current = 0

            let thumbUrl = course.thumbnail || ''
            if (thumbnailFile) {
                const r = await uploadFile(thumbnailFile, 'image')
                thumbUrl = r.secure_url || (r.result && r.result.secure_url) || thumbUrl
                current++
                setProgress((current / totalUploads) * 100)
            }
            const images = course.images ? [...course.images] : []
            for (const f of imagesFiles) {
                if (!f) continue
                const r = await uploadFile(f, 'image')
                images.push(r.secure_url || (r.result && r.result.secure_url))
                current++
                setProgress((current / totalUploads) * 100)
            }
            const token = getToken()
            if (!token) throw new Error('Not authenticated')
            const res = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/admin/courses/' + course._id, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ title, description, price, thumbnail: thumbUrl, images })
            })
            const data = await res.json()
            current++
            setProgress((current / totalUploads) * 100)

            // upload lessons videos and add them
            for (let i = 0; i < lessons.length; i++) {
                const ls = lessons[i]
                const file = lessonFiles[i]
                let videoUrl = ls.videoUrl || ''
                if (file) {
                    const r = await uploadFile(file, 'video')
                    videoUrl = r.secure_url || (r.result && r.result.secure_url) || ''
                    current++
                    setProgress((current / totalUploads) * 100)
                }
                if (ls.title && videoUrl) {
                    await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/admin/courses/' + course._id + '/lessons', {
                        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ title: ls.title, videoUrl, description: ls.description })
                    })
                }
            }

            setLoading(false)
            if (data._id) onClose()
            else alert('Failed to update')
        } catch (err) { setLoading(false); alert('Error updating course') }
    }

    // If mode is 'view', render a read-only detailed view
    if (mode === 'view') {
        return (
            <Modal onClose={onClose} title={course.title}>
                <div className="space-y-4">
                    <img src={course.thumbnail || (course.images && course.images[0]) || '/placeholder.png'} className="w-full h-52 object-cover rounded" />
                    <div>
                        <div className="text-sm text-gray-600">Price</div>
                        <div className="text-lg font-semibold">${course.price}</div>
                    </div>
                    <div>
                        <div className="font-medium">Description</div>
                        <p className="text-sm text-muted">{course.description}</p>
                    </div>
                    <div>
                        <div className="font-medium">Lessons</div>
                        <ul className="mt-2 space-y-2">
                            {(course.lessons || []).map((l, i) => (
                                <li key={i} className="p-2 border rounded bg-dark-700">
                                    <div className="font-semibold">{l.title}</div>
                                    <div className="text-sm text-gray-400">{l.description}</div>
                                    {l.videoUrl && (
                                        <video src={l.videoUrl} controls className="mt-2 w-full max-h-32 object-cover rounded" />
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="ghost" onClick={onClose}>Close</Button>
                    </div>
                </div>
            </Modal>
        )
    }

    return (
        <Modal onClose={onClose} title={`Edit ${course.title}`}>
            <form onSubmit={handleSubmit} className="space-y-3">
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
                <Input type="number" className="w-32" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" />

                <div>
                    <label className="block text-sm font-medium">Thumbnail</label>
                    <FileInput onChange={e => { const f = e.target.files[0]; setThumbnailFile(f); setThumbPreview(f ? URL.createObjectURL(f) : null) }} />
                    {thumbPreview && <img key={thumbPreview} src={thumbPreview} className="mt-2 w-48 h-28 object-cover rounded shadow" />}
                </div>

                <div>
                    <label className="block text-sm font-medium">Images</label>
                    <div className="space-y-2">
                        {(course.images || []).map((img, i) => (
                            <img key={i} src={img} className="w-32 h-20 object-cover rounded" />
                        ))}
                        {imagesFiles.map((f, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <FileInput onChange={e => handleImageChange(idx, e.target.files[0])} />
                                {f && <span>{f.name}</span>}
                                {imagePreviews[idx] && <img key={imagePreviews[idx]} src={imagePreviews[idx]} className="mt-2 w-32 h-20 object-cover rounded" />}
                            </div>
                        ))}
                        <Button variant="ghost" type="button" onClick={handleAddImage}>+ Add image</Button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium">Lessons</label>
                    <div className="space-y-3">
                        {lessons.map((ls, idx) => (
                            <div key={idx} className="p-2 border rounded">
                                <Input value={ls.title} onChange={e => handleLessonChange(idx, 'title', e.target.value)} placeholder={`Lesson ${idx + 1} title`} />
                                <Textarea value={ls.description} onChange={e => handleLessonChange(idx, 'description', e.target.value)} placeholder="Lesson description" />
                                <FileInput onChange={e => handleLessonFile(idx, e.target.files[0])} />
                                {lessonPreviews[idx] && <video key={lessonPreviews[idx]} src={lessonPreviews[idx]} controls className="mt-2 w-full h-32 rounded" />}
                            </div>
                        ))}
                        <Button variant="ghost" type="button" onClick={handleAddLesson}>+ Add lesson</Button>
                    </div>
                </div>

                {loading && (
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Uploading... {Math.round(progress)}%</div>
                    </div>
                )}

                <div className="flex gap-2 justify-end">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
                </div>
            </form>
        </Modal>
    )
}
