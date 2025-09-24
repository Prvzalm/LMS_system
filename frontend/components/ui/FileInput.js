export default function FileInput({ onChange, accept, className = '' }) {
    return (
        <label className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-dark-700/50 hover:bg-gray-100 dark:hover:bg-dark-600/70 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 ${className}`}>
            <input type="file" onChange={onChange} accept={accept} className="hidden" />
            <div className="flex items-center gap-3">
                <div className="text-2xl">📎</div>
                <div>
                    <div className="font-medium text-gray-700 dark:text-gray-300">Choose file</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Click to browse or drag & drop</div>
                </div>
            </div>
        </label>
    )
}
