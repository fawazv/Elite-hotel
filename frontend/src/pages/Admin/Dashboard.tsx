import { useState, useEffect } from 'react'
import { Users, DoorClosed, CalendarCheck, TrendingUp } from 'lucide-react'
import StatsCard from '@/components/admin/StatsCard'
import {
  fetchDashboardStats,
  fetchRecentActivity,
  type DashboardStats,
  type Reservation,
} from '@/services/adminApi'

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch stats and recent activity in parallel
        const [statsData, activityData] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentActivity(3),
        ])

        setStats(statsData)
        setRecentActivity(activityData)
      } catch (err: any) {
        console.error('Error loading dashboard:', err)
        setError(err.response?.data?.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-600 text-lg">{error || 'Failed to load dashboard'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings.toString(),
      change: stats.bookingsChange || '+0%',
      isPositive: true,
      icon: CalendarCheck,
      color: 'blue' as const,
    },
    {
      title: 'Active Rooms',
      value: stats.activeRooms.toString(),
      change: stats.roomsChange || '+0',
      isPositive: true,
      icon: DoorClosed,
      color: 'green' as const,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toString(),
      change: stats.usersChange || '+0%',
      isPositive: true,
      icon: Users,
      color: 'purple' as const,
    },
    {
      title: 'Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      change: stats.revenueChange || '+0%',
      isPositive: true,
      icon: TrendingUp,
      color: 'orange' as const,
    },
  ]

  const getActivityIcon = (status: string) => {
    if (status === 'Confirmed' || status === 'CheckedIn') return CalendarCheck
    if (status === 'CheckedOut') return DoorClosed
    return Users
  }

  const getActivityColor = (status: string) => {
    if (status === 'Confirmed') return 'blue'
    if (status === 'CheckedIn') return 'green'
    if (status === 'CheckedOut') return 'purple'
    return 'gray'
  }

  const getTimeSince = (createdAt?: string) => {
    if (!createdAt) return 'Recently'
    const date = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((reservation) => {
              const Icon = getActivityIcon(reservation.status)
              const color = getActivityColor(reservation.status)
              const bgColor = `bg-${color}-100`
              const textColor = `text-${color}-600`

              return (
                <div key={reservation._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}>
                    <Icon className={textColor} size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {reservation.status === 'Confirmed' && 'New Booking'}
                      {reservation.status === 'CheckedIn' && 'Guest Checked In'}
                      {reservation.status === 'CheckedOut' && 'Guest Checked Out'}
                      {reservation.status === 'Cancelled' && 'Booking Cancelled'}
                      {reservation.status === 'PendingPayment' && 'Payment Pending'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Room {reservation.roomId.number} - {reservation.guestContact.email}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">{getTimeSince(reservation.createdAt)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

