import { Users, DoorClosed, CalendarCheck, TrendingUp } from 'lucide-react'
import StatsCard from '@/components/admin/StatsCard'

const Dashboard = () => {
  // TODO: Fetch real data from API
  const stats = [
    {
      title: 'Total Bookings',
      value: '2,543',
      change: '+12.5%',
      isPositive: true,
      icon: CalendarCheck,
      color: 'blue',
    },
    {
      title: 'Active Rooms',
      value: '48',
      change: '+2',
      isPositive: true,
      icon: DoorClosed,
      color: 'green',
    },
    {
      title: 'Total Users',
      value: '1,234',
      change: '+8.2%',
      isPositive: true,
      icon: Users,
      color: 'purple',
    },
    {
      title: 'Revenue',
      value: '$45,231',
      change: '+15.3%',
      isPositive: true,
      icon: TrendingUp,
      color: 'orange',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <CalendarCheck className="text-blue-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">New Booking</p>
              <p className="text-sm text-gray-600">Room 301 - John Doe</p>
            </div>
            <span className="text-sm text-gray-500">2 min ago</span>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="text-green-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">New User Registration</p>
              <p className="text-sm text-gray-600">jane.smith@email.com</p>
            </div>
            <span className="text-sm text-gray-500">15 min ago</span>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <DoorClosed className="text-purple-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Room Status Updated</p>
              <p className="text-sm text-gray-600">Room 205 - Now Available</p>
            </div>
            <span className="text-sm text-gray-500">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
