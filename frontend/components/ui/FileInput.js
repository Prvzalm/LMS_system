export default function FileInput({ onChange }) {
    return (
        <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer bg-white text-sm">
            <input type="file" onChange={onChange} className="hidden" />
            <span className="text-indigo-600">Choose file</span>
        </label>
    )
}
