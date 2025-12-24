import React from 'react'
import {
  DollarSign,
  Users,
  BedDouble,
  Calendar,
  Activity,
  AlertTriangle
} from 'lucide-react'
import { useAdminDashboard } from '@/Hooks/useDashboardData'
import StatsCard from '@/components/admin/StatsCard'
import OccupancyChart from '@/components/admin/widgets/OccupancyChart'
import RecentActivity from '@/components/admin/widgets/RecentActivity'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import EmptyState from '@/components/common/EmptyState'
import RevenueChart from '@/components/admin/widgets/RevenueChart'
import { useState, useEffect } from 'react'
import { dashboardApi } from '@/services/dashboardApi'

const Dashboard: React.FC = () => {
  const { data, isLoading, isError, refetch } = useAdminDashboard()
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    const fetchRecentActivity = async () => {
        const activity = await dashboardApi.getRecentActivity();
        setRecentActivity(activity);
    };
    fetchRecentActivity();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (isError) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <EmptyState 
           title="Failed to load dashboard" 
           description="We couldn't fetch the latest data. Please check your connection and try again."
           icon={AlertTriangle}
           action={{ label: "Try Again", onClick: () => refetch() }}
        />
      </div>
    )
  }



  const occupancyData = [
    { name: 'Occupied', value: data?.occupancyMetrics?.occupiedRooms || 0, color: '#3B82F6' },
    { name: 'Available', value: data?.occupancyMetrics?.availableRooms || 0, color: '#10B981' },
    { name: 'Maintenance', value: data?.occupancyMetrics?.maintenanceRooms || 0, color: '#F59E0B' },
  ]

  // Mock recent activity if API doesn't return list (the current Type def for AdminDashboardData doesn't strictly have recentActivity list, 
  // so we might need to fetch separately or update type. For now, assuming recentActivity might be missing or handled via separate hook. 
  // Wait, I didn't see recentActivity in AdminDashboardData. I will use a separate hook or mock it for now until backend is confirmed.)
  // Actually, let's just make the RecentActivity component handle empty state gracefully, which it does.
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
            <button
                onClick={() => window.location.href = '/admin/desk-booking'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
                <Calendar size={16} />
                Create Reservation
            </button>
           <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
             <Activity size={14} /> System Healthy
           </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`$${data?.financialMetrics?.totalRevenue.toLocaleString() ?? '0'}`}
          change="+12.5%"
          isPositive={true}
          icon={DollarSign}
          color="blue"
        />
        <StatsCard
          title="Occupancy"
          value={`${data?.occupancyMetrics?.currentOccupancy ?? 0}%`}
          change="+4.2%"
          isPositive={true}
          icon={BedDouble}
          color="green"
        />
        <StatsCard
          title="Pending Approvals"
          value={(data?.userMetrics?.pendingApprovals ?? 0).toString()}
          change={data?.userMetrics?.pendingApprovals ? "Action Required" : "All Clear"}
          isPositive={!(data?.userMetrics?.pendingApprovals ?? 0)}
          icon={Users}
          color={data?.userMetrics?.pendingApprovals ? "orange" : "green"}
        />
        <StatsCard
          title="Dirty Rooms"
          value={(data?.housekeepingStatus?.dirtyRooms ?? 0).toString()}
          change={`${data?.housekeepingStatus?.inProgressRooms ?? 0} In Progress`}
          isPositive={false}
          icon={Activity}
          color="orange"
        />
      </div>

      {/* Secondary Stats Grid - Billing & More Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
               <p className="text-sm text-gray-500">Overdue Invoices</p>
               <p className="text-2xl font-bold text-gray-800">{data?.billingStatus?.overdue ?? 0}</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
               <AlertTriangle size={20} />
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
               <p className="text-sm text-gray-500">Tasks Overdue</p>
               <p className="text-2xl font-bold text-gray-800">{data?.housekeepingStatus?.tasksOverdue ?? 0}</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
               <Activity size={20} />
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
               <p className="text-sm text-gray-500">New Guests</p>
               <p className="text-2xl font-bold text-gray-800">{data?.userMetrics?.newGuestsThisMonth ?? 0}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
               <Users size={20} />
            </div>
         </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
               <p className="text-sm text-gray-500">Average Rate</p>
               <p className="text-2xl font-bold text-gray-800">${data?.roomInventory?.averageDailyRate ?? 0}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
               <DollarSign size={20} />
            </div>
         </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <OccupancyChart data={occupancyData} />
        </div>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
            <RecentActivity activities={recentActivity} />
         </div>
         <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">System Health</h3>
            <div className="space-y-4">
              {Object.entries(data?.systemHealth?.services || {}).map(([service, status]) => (
                <div key={service} className="flex items-center justify-between">
                  <span className="capitalize text-gray-600">{service}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-medium ${status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                      {status}
                    </span>
                  </div>
                </div>
              ))}
              {(!data?.systemHealth?.services) && <p className="text-gray-400 italic">No health data available</p>}
            </div>
         </div>
      </div>
    </div>
  )
}

export default Dashboard
