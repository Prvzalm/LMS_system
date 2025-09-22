import Link from 'next/link'
import RequireAdmin from '../../components/RequireAdmin'
import AdminLayout from '../../components/admin/AdminLayout'

function AdminIndexInner() {
    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold">Welcome to Admin</h1>
            <p className="mt-2 text-gray-600">Use the left menu to navigate admin actions.</p>
        </AdminLayout>
    )
}

export default function AdminIndex() {
    return (
        <RequireAdmin>
            <AdminIndexInner />
        </RequireAdmin>
    )
}
