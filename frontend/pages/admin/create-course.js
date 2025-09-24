import { useState, useEffect } from 'react'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import FileInput from '../../components/ui/FileInput'
import Button from '../../components/ui/Button'
import { motion } from 'framer-motion'
import RequireAdmin from '../../components/RequireAdmin'
import AdminLayout from '../../components/admin/AdminLayout'
import { authFetch, getToken } from '../../utils/auth'
import { useStore } from '../../store/useStore'
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
    const [uploadProgress, setUploadProgress] = useState({})
    const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState(0)
    const [isCreatingCourse, setIsCreatingCourse] = useState(false)
    const [creationProgress, setCreationProgress] = useState(0)
    const userLoading = useStore(state => state.userLoading)

    useEffect(() => {
        if (!userLoading) {
            fetchCourses()
        }
    }, [userLoading])

    const fetchCourses = async () => {
        try {
            const res = await authFetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/admin/courses')
            // backend doesn't expose this route yet; fallback to public /courses
            if (res.status === 200) {
                const data = await res.json()
                setCourses(data)
            } else {
                const pub = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/courses')
                const d = await pub.json()
                setCourses(d)
            }
        } catch (err) { console.error('fetch courses', err) }
    }

    const uploadFile = async (file, resourceType = 'image', onProgress = null) => {
        return new Promise((resolve, reject) => {
            const form = new FormData();
            form.append('file', file);
            form.append('resourceType', resourceType);
            const token = getToken()
            if (!token) {
                reject(new Error('Not authenticated'));
                return;
            }

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    onProgress(percentComplete, event.loaded, event.total);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const result = JSON.parse(xhr.responseText);
                        resolve(result);
                    } catch (e) {
                        reject(new Error('Invalid response format'));
                    }
                } else {
                    reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Network error during upload'));
            });

            xhr.addEventListener('abort', () => {
                reject(new Error('Upload aborted'));
            });

            xhr.open('POST', (process.env.NEXT_PUBLIC_API_URL || '') + '/api/admin/upload');
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            xhr.send(form);
        });
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
        setIsCreatingCourse(true)
        setCreationProgress(0)

        try {
            // Step 1: Upload thumbnail (10% progress)
            setCreationProgress(5)
            let thumbUrl = ''
            if (thumbnailFile) {
                setThumbnailUploadProgress(0)
                const r = await uploadFile(thumbnailFile, 'image', (progress) => {
                    setThumbnailUploadProgress(progress)
                    setCreationProgress(5 + (progress * 0.1)) // 5-15% for thumbnail
                })
                thumbUrl = r.secure_url || (r.result && r.result.secure_url) || ''
                setThumbnailUploadProgress(0)
            }
            setCreationProgress(15)

            const token = getToken()
            if (!token) throw new Error('Not authenticated')

            // Step 2: Create course (20% progress)
            setCreationProgress(20)
            const res = await authFetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/admin/courses', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, thumbnail: thumbUrl, price, lessons: [] })
            })
            const data = await res.json()

            if (!data._id) {
                setLoading(false)
                setIsCreatingCourse(false)
                alert('Failed to create course')
                return
            }
            setCreationProgress(30)

            // Step 3: Upload lessons (30-90% progress)
            const totalLessons = lessons.filter(ls => ls.title && ls.file).length
            let completedLessons = 0

            for (let i = 0; i < lessons.length; i++) {
                const ls = lessons[i]
                if (!ls.title) continue
                let videoUrl = ls.videoUrl || ''
                if (ls.file) {
                    // mark uploading and set initial progress
                    setLessons(prev => prev.map((x, j) => j === i ? { ...x, uploading: true } : x))
                    setUploadProgress(prev => ({ ...prev, [i]: 0 }))

                    try {
                        const r = await uploadFile(ls.file, 'video', (progress, loaded, total) => {
                            setUploadProgress(prev => ({ ...prev, [i]: progress }))
                            // Update overall progress: 30% + (lesson progress * 60% / total lessons)
                            const lessonProgress = (progress / 100) * (60 / totalLessons)
                            setCreationProgress(30 + (completedLessons * (60 / totalLessons)) + lessonProgress)
                        })
                        videoUrl = r.secure_url || (r.result && r.result.secure_url) || ''
                    } catch (error) {
                        console.error(`Failed to upload lesson ${i + 1}:`, error)
                        // Continue with other lessons even if one fails
                        videoUrl = ''
                    }

                    setLessons(prev => prev.map((x, j) => j === i ? { ...x, uploading: false } : x))
                    setUploadProgress(prev => {
                        const newProgress = { ...prev }
                        delete newProgress[i]
                        return newProgress
                    })
                }
                if (videoUrl) {
                    await authFetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/admin/courses/' + data._id + '/lessons', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: ls.title, videoUrl, description: ls.description })
                    })
                }

                completedLessons++
                setCreationProgress(30 + (completedLessons * (60 / totalLessons)))
            }

            // Step 4: Finalize (90-100% progress)
            setCreationProgress(95)
            setLoading(false)
            setIsCreatingCourse(false)
            setCreationProgress(100)

            // refresh list and clear form
            await fetchCourses()
            setTitle(''); setDescription(''); setPrice(0); setThumbnailFile(null); setThumbPreview(null); setLessons([])
            setCreationProgress(0)
        } catch (err) {
            setLoading(false)
            setIsCreatingCourse(false)
            setCreationProgress(0)
            console.error(err)
            alert('Error creating course')
        }
    }

    const handleThumbnailChange = (file) => {
        setThumbnailFile(file)
        const url = URL.createObjectURL(file)
        setThumbPreview(url)
    }

    const openEdit = (course) => setEditingCourse(course)

    return (
        <>
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
                🎓 Create New Course
            </motion.h1>

            <div className="flex items-start gap-6">
                <div className="w-full md:w-2/3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="glass bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 dark:border-dark-700/50"
                    >
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'
                                        }`}>
                                        <span className="font-semibold">1</span>
                                    </div>
                                    <div className={`h-1 w-16 transition-all duration-300 ${step >= 2 ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200'
                                        }`}></div>
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'
                                        }`}>
                                        <span className="font-semibold">2</span>
                                    </div>
                                    <div className={`h-1 w-16 transition-all duration-300 ${step >= 3 ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200'
                                        }`}></div>
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'
                                        }`}>
                                        <span className="font-semibold">3</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm font-medium">
                                <span className={step >= 1 ? 'text-blue-600' : 'text-gray-400'}>Course Details</span>
                                <span className={step >= 2 ? 'text-blue-600' : 'text-gray-400'}>Add Lessons</span>
                                <span className={step >= 3 ? 'text-blue-600' : 'text-gray-400'}>Review & Publish</span>
                            </div>
                        </div>
                        <div className="mb-6 flex gap-3">
                            <button
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${step === 1
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                    }`}
                                onClick={() => setStep(1)}
                            >
                                📝 Details
                            </button>
                            <button
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${step === 2
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                    }`}
                                onClick={() => setStep(2)}
                            >
                                🎬 Lessons
                            </button>
                            <button
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${step === 3
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                    }`}
                                onClick={() => setStep(3)}
                            >
                                ✅ Review
                            </button>
                        </div>

                        {step === 1 && (
                            <motion.form
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={e => { e.preventDefault(); setStep(2); }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        📖 Course Title
                                    </label>
                                    <Input
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="Enter an engaging course title..."
                                        className="text-lg py-3 px-4 border-2 border-gray-200 dark:border-dark-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-colors"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        📝 Course Description
                                    </label>
                                    <Textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Describe what students will learn, the course objectives, and who this course is for..."
                                        className="min-h-[120px] text-base py-3 px-4 border-2 border-gray-200 dark:border-dark-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-colors resize-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            💰 Price (USD)
                                        </label>
                                        <Input
                                            type="number"
                                            className="text-lg py-3 px-4 border-2 border-gray-200 dark:border-dark-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-colors"
                                            value={price}
                                            onChange={e => setPrice(e.target.value)}
                                            placeholder="0"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            🖼️ Course Thumbnail
                                        </label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Recommended: 1280x720px, any file size supported</p>
                                        <div className="space-y-3">
                                            <FileInput onChange={e => handleThumbnailChange(e.target.files[0])} />
                                            {thumbnailFile && (
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Selected: {thumbnailFile.name} ({thumbnailFile.size >= 1024 * 1024 * 1024 ?
                                                        (thumbnailFile.size / (1024 * 1024 * 1024)).toFixed(2) + 'GB' :
                                                        (thumbnailFile.size / (1024 * 1024)).toFixed(1) + 'MB'})
                                                </div>
                                            )}
                                            {thumbnailUploadProgress > 0 && thumbnailUploadProgress < 100 && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm text-blue-600 dark:text-blue-400">
                                                        <span>Uploading thumbnail...</span>
                                                        <span>{thumbnailUploadProgress}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${thumbnailUploadProgress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                            {thumbPreview && (
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="relative inline-block"
                                                >
                                                    <img
                                                        src={thumbPreview}
                                                        className="w-32 h-24 object-cover rounded-lg shadow-lg border-2 border-white dark:border-dark-600"
                                                        alt="Course thumbnail preview"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => { setThumbnailFile(null); setThumbPreview(null); }}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                                        title="Remove thumbnail"
                                                    >
                                                        ×
                                                    </button>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="flex items-center gap-2 px-8 py-3 text-lg"
                                        disabled={!title.trim() || !description.trim()}
                                    >
                                        Next: Add Lessons ➡️
                                    </Button>
                                </div>
                            </motion.form>
                        )}

                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-xl mb-1">🎬 Course Lessons</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Add video lessons and organize them in the order you want students to watch.</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                                💡 Unlimited file size support - upload any size video!
                                            </span>
                                            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                                                🚀 Enhanced progress tracking
                                            </span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" onClick={addLesson} className="flex items-center gap-2">
                                        ➕ Add Lesson
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {lessons.map((ls, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: idx * 0.1 }}
                                            className="glass bg-white/70 dark:bg-dark-700/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/30 dark:border-dark-600/50 hover:shadow-xl transition-all duration-200"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl">🎥</span>
                                                        <span className="font-semibold text-lg">Lesson {idx + 1}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => moveLesson(idx, -1)}
                                                        disabled={idx === 0}
                                                        className="p-2 rounded-lg bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        title="Move up"
                                                    >
                                                        ⬆️
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveLesson(idx, 1)}
                                                        disabled={idx === lessons.length - 1}
                                                        className="p-2 rounded-lg bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        title="Move down"
                                                    >
                                                        ⬇️
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeLesson(idx)}
                                                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                                                        title="Delete lesson"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <Input
                                                    placeholder="Lesson title (e.g., Introduction to React)"
                                                    value={ls.title}
                                                    onChange={e => setLessonField(idx, 'title', e.target.value)}
                                                    className="text-base"
                                                />
                                                <Textarea
                                                    placeholder="Brief description of what students will learn in this lesson..."
                                                    value={ls.description}
                                                    onChange={e => setLessonField(idx, 'description', e.target.value)}
                                                    className="min-h-[80px] text-base"
                                                />
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-600/50 rounded-lg">
                                                        <FileInput onChange={e => setLessonField(idx, 'file', e.target.files[0])} />
                                                        {ls.file && (
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                                                        ✅ {ls.file.name}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        ({ls.file.size >= 1024 * 1024 * 1024 ?
                                                                            (ls.file.size / (1024 * 1024 * 1024)).toFixed(2) + 'GB' :
                                                                            (ls.file.size / (1024 * 1024)).toFixed(1) + 'MB'})
                                                                    </span>
                                                                </div>
                                                                {ls.uploading && uploadProgress[idx] !== undefined && (
                                                                    <div className="mt-2">
                                                                        <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 mb-1">
                                                                            <span>Uploading...</span>
                                                                            <span>{uploadProgress[idx]}%</span>
                                                                        </div>
                                                                        <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
                                                                            <div
                                                                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                                                                style={{ width: `${uploadProgress[idx]}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {ls.uploading && uploadProgress[idx] === undefined && (
                                                            <span className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                                                ⏳ Preparing upload...
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {lessons.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-12 px-6 bg-gray-50 dark:bg-dark-700/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-600"
                                    >
                                        <div className="text-4xl mb-4">📚</div>
                                        <h4 className="font-semibold text-lg mb-2">No lessons yet</h4>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">Start building your course by adding your first lesson!</p>
                                        <Button variant="primary" onClick={addLesson} className="flex items-center gap-2 mx-auto">
                                            ➕ Add Your First Lesson
                                        </Button>
                                    </motion.div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <Button variant="subtle" onClick={() => setStep(1)}>⬅️ Back to Details</Button>
                                    <Button onClick={() => setStep(3)} className="flex items-center gap-2">
                                        Next: Review ➡️
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <h3 className="font-semibold text-2xl mb-2">🎯 Review & Publish</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Double-check everything before publishing your course</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="glass bg-white/70 dark:bg-dark-700/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/30 dark:border-dark-600/50">
                                        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                            📋 Course Details
                                        </h4>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="font-medium text-gray-600 dark:text-gray-400 block mb-1">Title:</span>
                                                <span className="text-lg font-semibold">{title || <span className="text-red-500 italic">Not set</span>}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600 dark:text-gray-400 block mb-1">Description:</span>
                                                <div className="bg-gray-50 dark:bg-dark-600/50 p-3 rounded-lg max-h-32 overflow-y-auto">
                                                    {description ? (
                                                        <span className="text-sm leading-relaxed whitespace-pre-wrap">{description}</span>
                                                    ) : (
                                                        <span className="text-red-500 italic">Not set</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-dark-600">
                                                <span className="font-medium text-gray-600 dark:text-gray-400">Price:</span>
                                                <span className="text-xl font-bold text-green-600">${price || '0'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="glass bg-white/70 dark:bg-dark-700/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/30 dark:border-dark-600/50">
                                        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                            🎬 Lessons ({lessons.length})
                                        </h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {lessons.length > 0 ? (
                                                lessons.map((ls, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-dark-600/50 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">{idx + 1}.</span>
                                                            <span className="text-sm">{ls.title || 'Untitled'}</span>
                                                        </div>
                                                        {ls.file && <span className="text-xs text-green-600">📎 Video</span>}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400 text-sm italic">No lessons added</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {thumbPreview && (
                                    <div className="glass bg-white/70 dark:bg-dark-700/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/30 dark:border-dark-600/50">
                                        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                            🖼️ Course Thumbnail
                                        </h4>
                                        <img src={thumbPreview} className="w-full max-w-sm h-48 object-cover rounded-lg shadow-lg mx-auto" alt="Course thumbnail" />
                                    </div>
                                )}

                                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-dark-600">
                                    <Button variant="subtle" onClick={() => setStep(2)} className="flex items-center gap-2">
                                        ⬅️ Back to Lessons
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleCreate}
                                        disabled={loading || !title.trim() || !description.trim()}
                                        className="flex items-center gap-2 px-8 py-3 text-lg"
                                    >
                                        {loading ? '🚀 Publishing...' : '🚀 Publish Course'}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                </div>

                <aside className="hidden md:block md:w-1/3">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="glass bg-white/60 dark:bg-dark-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 dark:border-dark-700/50 sticky top-6"
                    >
                        <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">🚀 Quick Help</h3>
                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <p><strong>Step 1:</strong> Fill in your course details including title, description, and pricing.</p>
                            <p><strong>Step 2:</strong> Add video lessons with titles and descriptions. You can reorder them by dragging.</p>
                            <p><strong>Step 3:</strong> Review everything and publish your course to make it available to students.</p>
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                💡 <strong>Tip:</strong> High-quality thumbnails and clear descriptions help attract more students!
                            </p>
                        </div>
                    </motion.div>
                </aside>
            </div>

            {editingCourse && <CourseEditModal course={editingCourse} onClose={() => { setEditingCourse(null); fetchCourses(); }} />}

            {/* Full Screen Loading Overlay */}
            {isCreatingCourse && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-dark-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20 dark:border-dark-700/50"
                    >
                        <div className="text-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-16 h-16 mx-auto mb-4"
                            >
                                <div className="w-full h-full rounded-full border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400"></div>
                            </motion.div>

                            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                                🚀 Creating Your Course
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Please wait while we upload your content and create your course...
                            </p>

                            {/* Overall Progress */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    <span>Overall Progress</span>
                                    <span>{creationProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${creationProgress}%` }}
                                        transition={{ duration: 0.5 }}
                                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                                    ></motion.div>
                                </div>
                            </div>

                            {/* Current Step Indicator */}
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {creationProgress < 15 && "📸 Uploading thumbnail..."}
                                {creationProgress >= 15 && creationProgress < 30 && "📝 Creating course structure..."}
                                {creationProgress >= 30 && creationProgress < 90 && "🎬 Uploading video lessons..."}
                                {creationProgress >= 90 && "✅ Finalizing course..."}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
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
