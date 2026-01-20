import { DollarSign, Package, Users, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Mock data - will be replaced with real data from Supabase
const STATS = [
  {
    title: 'Total Revenue',
    value: '$2,847.50',
    change: '+12.5%',
    changeType: 'positive',
    icon: DollarSign,
  },
  {
    title: 'Orders',
    value: '47',
    change: '+8 today',
    changeType: 'positive',
    icon: Package,
  },
  {
    title: 'Customers',
    value: '42',
    change: '+3 new',
    changeType: 'positive',
    icon: Users,
  },
  {
    title: 'Conversion Rate',
    value: '3.2%',
    change: '+0.4%',
    changeType: 'positive',
    icon: TrendingUp,
  },
]

const RECENT_ORDERS = [
  { id: 'PMH-001', customer: 'Laura Carter', email: 'laura@example.com', total: '$52.95', status: 'Fulfilled', date: '2025-02-14' },
  { id: 'PMH-002', customer: 'Andrew F.', email: 'andrew@example.com', total: '$37.95', status: 'Processing', date: '2025-02-13' },
  { id: 'PMH-003', customer: 'Sam P.', email: 'sam@example.com', total: '$23.95', status: 'Unfulfilled', date: '2025-02-12' },
  { id: 'PMH-004', customer: 'Cody B.', email: 'cody@example.com', total: '$52.95', status: 'Fulfilled', date: '2025-02-11' },
  { id: 'PMH-005', customer: 'Tina L.', email: 'tina@example.com', total: '$37.95', status: 'Processing', date: '2025-02-10' },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className={`text-sm ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change} from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders from your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-pink-600">{order.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{order.customer}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{order.total}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'Fulfilled'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'Processing'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
