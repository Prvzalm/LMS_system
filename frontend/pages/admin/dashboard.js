import useSWR from 'swr'
import { motion } from 'framer-motion'
import Card from '../../components/ui/Card'
import RequireAdmin from '../../components/RequireAdmin'
import AdminLayout from '../../components/admin/AdminLayout'
import Container from '../../components/ui/Container'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

import { authFetch } from '../../utils/auth'

const fetcher = url => authFetch(url).then(r => r.json())

function AdminDashboard() {
    const { data, error } = useSWR(process.env.NEXT_PUBLIC_API_URL + '/admin/stats', fetcher)

    if (error) return <Container>Failed to load</Container>
    return (
        <>
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <motion.div whileHover={{ scale: 1.02 }}>
                    <Card>
                        <div className="text-sm text-gray-500">Total Users</div>
                        <div className="text-2xl font-semibold">{data?.totalUsers || 0}</div>
                    </Card>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }}>
                    <Card>
                        <div className="text-sm text-gray-500">Total Sales</div>
                        <div className="text-2xl font-semibold">{data?.totalSales || 0}</div>
                    </Card>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }}>
                    <Card>
                        <div className="text-sm text-gray-500">Revenue</div>
                        <div className="text-2xl font-semibold">${data?.revenue || 0}</div>
                    </Card>
                </motion.div>
            </div>

            <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Top Courses</h2>
                <ul className="space-y-2">
                    {(data?.topCourses || []).map(c => (
                        <li key={c._id}><Card className="flex justify-between">{c.title}<span className="text-sm text-gray-600">{c.sales} sales</span></Card></li>
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
