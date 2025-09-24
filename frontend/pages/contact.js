import { useState } from 'react'

export default function Contact() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [status, setStatus] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('sending')
        try {
            const res = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/contact', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message })
            })
            if (res.ok) {
                setStatus('sent')
                setName(''); setEmail(''); setMessage('')
            } else {
                setStatus('error')
            }
        } catch (e) {
            setStatus('error')
        }
    }

    return (
        <>
            <h1 className="text-3xl font-bold mb-4 md:mb-6 mt-6 md:mt-10 text-white">Contact</h1>
            <p className="text-gray-300 mb-8">Have questions? Fill the form below and we'll get back to you.</p>

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded bg-dark-800 border border-dark-700 text-white" />
                </div>
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Email</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded bg-dark-800 border border-dark-700 text-white" />
                </div>
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Message</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full p-3 rounded bg-dark-800 border border-dark-700 text-white" rows={6} />
                </div>
                <div>
                    <button type="submit" className="px-5 py-3 bg-accent text-black rounded-full">Send</button>
                </div>
                {status === 'sending' && <div className="text-sm text-muted">Sending...</div>}
                {status === 'sent' && <div className="text-sm text-accent">Message sent — we'll reply soon.</div>}
                {status === 'error' && <div className="text-sm text-red-400">Failed to send. Try again later.</div>}
            </form>
        </>
    )
}
