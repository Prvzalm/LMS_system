import { useEffect, useState } from 'react'
import { authFetch } from '../utils/auth'

export default function VideoPlayer({ courseId, lessonIndex }) {
    const [videoUrl, setVideoUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadedOnce, setLoadedOnce] = useState(false)

    const handlePlayClick = async (e) => {
        e.preventDefault()
        if (videoUrl || loading) return
        setLoading(true)
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/lessons/${lessonIndex}/video`)
            const data = await res.json();
            if (data.videoUrl) setVideoUrl(data.videoUrl)
            setLoadedOnce(true)
        } catch (err) {
            // ignore
        } finally { setLoading(false) }
    }

    if (loading) return <span className="text-sm text-gray-500">Loading video...</span>
    if (!videoUrl) return <button onClick={handlePlayClick} className="text-sm text-indigo-500 underline">Play</button>
    return (
        <video controls width={320} className="mt-2 rounded" onPlay={() => setLoadedOnce(true)}>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    )
}
