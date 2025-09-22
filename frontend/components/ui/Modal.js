export default function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="bg-dark-800 rounded shadow-lg max-w-2xl w-full p-6 z-10 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-sm px-2 py-1">Close</button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    )
}
