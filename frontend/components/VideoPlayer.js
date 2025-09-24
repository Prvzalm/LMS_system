import { useEffect, useState, useRef } from 'react'
import { authFetch } from '../utils/auth'

export default function VideoPlayer({ courseId, lessonIndex, onWatched }) {
    const [videoUrl, setVideoUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const videoRef = useRef(null);

    const handlePlayClick = async (e) => {
        e.preventDefault()
        if (videoUrl || loading) return
        setLoading(true)
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/courses/${courseId}/lessons/${lessonIndex}/video`)
            const data = await res.json();
            if (data.videoUrl) {
                setVideoUrl(data.videoUrl)
                setShowModal(true)
            }
        } catch (err) {
            console.error('Failed to load video:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setPlaying(false)
        if (videoRef.current) {
            videoRef.current.pause()
        }
    }

    const handleVideoPlay = () => {
        setPlaying(true)
        // Save progress when video starts playing
        saveProgress()
        if (onWatched) {
            onWatched()
        }
    }

    const saveProgress = async () => {
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/progress/${courseId}/lesson/${lessonIndex}`, {
                method: 'POST'
            })
            if (res.ok) {
                console.log('Progress saved for lesson', lessonIndex)
            }
        } catch (err) {
            console.error('Failed to save progress:', err)
        }
    }

    const handleVideoPause = () => {
        setPlaying(false)
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && showModal) {
                handleCloseModal()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [showModal])

    if (loading) {
        return (
            <button className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors disabled:opacity-50" disabled>
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
            </button>
        )
    }

    return (
        <>
            <button
                onClick={handlePlayClick}
                className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                </svg>
                Play
            </button>

            {showModal && videoUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className="bg-dark-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-dark-700">
                            <h3 className="text-lg font-semibold text-white">Lesson {lessonIndex + 1}</h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-white transition-colors p-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="relative bg-black">
                            <video
                                ref={videoRef}
                                controls
                                className="w-full max-h-[70vh] object-contain"
                                onPlay={handleVideoPlay}
                                onPause={handleVideoPause}
                                autoPlay
                            >
                                <source src={videoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            {playing && (
                                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                    Now Playing
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
