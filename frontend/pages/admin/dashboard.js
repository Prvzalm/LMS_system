import useSWR from 'swr'
import { motion } from 'framer-motion'
import Card from '../../components/ui/Card'
import RequireAdmin from '../../components/RequireAdmin'
import AdminLayout from '../../components/admin/AdminLayout'
import Container from '../../components/ui/Container'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

import { authFetch } from '../../utils/auth'
import { useStore } from '../../store/useStore'

const fetcher = url => authFetch(url).then(r => r.json())

function AdminDashboard() {
    const userLoading = useStore(state => state.userLoading)
    const { data, error } = useSWR(
        userLoading ? null : ((process.env.NEXT_PUBLIC_API_URL || '') + '/api/admin/stats'),
        fetcher
    )

    if (userLoading) return <Container>Loading admin dashboard...</Container>
    if (error) return <Container>Failed to load admin stats</Container>
    return (
        <>
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <motion.div whileHover={{ scale: 1.02 }}>
                    <Card>
                        <div className="text-sm text-muted">Total Users</div>
                        <div className="text-2xl font-semibold text-white">{data?.totalUsers || 0}</div>
                    </Card>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }}>
                    <Card>
                        <div className="text-sm text-muted">Total Sales</div>
                        <div className="text-2xl font-semibold text-white">{data?.totalSales || 0}</div>
                    </Card>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }}>
                    <Card>
                        <div className="text-sm text-muted">Revenue</div>
                        <div className="text-2xl font-semibold text-white">${data?.revenue || 0}</div>
                    </Card>
                </motion.div>
            </div>

            <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Top Courses</h2>
                <ul className="space-y-2">
                    {(data?.topCourses || []).map(c => (
                        <li key={c._id}><Card className="flex justify-between text-white"><span>{c.title}</span><span className="text-sm text-muted">{c.sales} sales</span></Card></li>
                    ))}
                </ul>
            </div>

            <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4">Sales Chart</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data?.topCourses || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="title" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="sales" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </>
    )
}

export default function AdminDashboardPage() {
    return (
        <RequireAdmin>
            <AdminLayout>
                <AdminDashboard />
            </AdminLayout>
        </RequireAdmin>
    )
}
