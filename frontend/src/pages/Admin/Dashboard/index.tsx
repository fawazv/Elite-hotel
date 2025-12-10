import React from 'react';
import { 
  DollarSign, 
  Users, 
  Bed, 
  TrendingUp,
  ClipboardList,
  AlertCircle,
  CheckCircle,
  Activity,
  MessageSquare,
  Video,
  Clock
} from 'lucide-react';
import { useAdminDashboard } from '@/Hooks/useDashboardData';
import { useRealtimeUpdates } from '@/Hooks/useRealtimeUpdates';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ErrorWidget } from '@/components/shared/ErrorWidget';
import { LoadingWidget } from '@/components/shared/LoadingWidget';

const AdminDashboard: React.FC = () => {
  const { data, isLoading, error, refetch } = useAdminDashboard();
  
  // Enable real-time updates
  useRealtimeUpdates('admin');

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        <LoadingWidget variant="grid" count={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        <ErrorWidget
          title="Failed to Load Dashboard"
          message="Unable to fetch dashboard data. Please try again."
          severity="error"
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      </div>
    );
  }

  const {
    financialMetrics,
    occupancyMetrics,
    roomInventory,
    userMetrics,
    housekeepingStatus,
    billingStatus,
    communicationMetrics,
    systemHealth,
  } = data || {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Strategic overview of hotel operations</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date(systemHealth?.lastUpdated || '').toLocaleTimeString()}
        </div>
      </div>

      {/* System Health Banner */}
      {systemHealth && Object.values(systemHealth.services).some(s => s !== 'healthy') && (
        <ErrorWidget
          title="Service Degradation Detected"
          message="Some services are experiencing issues. Dashboard may show partial data."
          severity="warning"
        />
      )}

      {/* Financial Metrics */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Health</h2>
        {financialMetrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={`₹${financialMetrics.totalRevenue?.toLocaleString() || 0}`}
              icon={<DollarSign className="w-6 h-6" />}
              color="green"
              subtitle="All time"
            />
            <StatCard
              title="Pending Payments"
              value={financialMetrics.pendingPayments || 0}
              icon={<AlertCircle className="w-6 h-6" />}
              color="yellow"
              subtitle={`₹${financialMetrics.pendingAmount?.toLocaleString() || 0}`}
            />
            <StatCard
              title="Refunded Amount"
              value={`₹${financialMetrics.refundedAmount?.toLocaleString() || 0}`}
              icon={<TrendingUp className="w-6 h-6" />}
              color="red"
            />
            <StatCard
              title="Avg Transaction"
              value={`₹${Math.round(financialMetrics.averageTransactionValue || 0)}`}
              icon={<Activity className="w-6 h-6" />}
              color="blue"
            />
          </div>
        ) : (
          <ErrorWidget
            title="Financial Data Unavailable"
            message="Payment service is currently down."
            severity="warning"
          />
        )}
      </section>

      {/* Occupancy & Operations */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Occupancy & Operations</h2>
        {occupancyMetrics && roomInventory ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Current Occupancy"
              value={`${roomInventory.totalRooms > 0 
                ? Math.round((roomInventory.occupiedRooms / roomInventory.totalRooms) * 100)
                : 0}%`}
              icon={<Bed className="w-6 h-6" />}
              color="purple"
              subtitle={`${roomInventory.occupiedRooms}/${roomInventory.totalRooms} rooms`}
            />
            <StatCard
              title="Check-ins Today"
              value={occupancyMetrics.upcomingCheckIns || 0}
              icon={<CheckCircle className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="Check-outs Today"
              value={occupancyMetrics.upcomingCheckOuts || 0}
              icon={<ClipboardList className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="Confirmed Bookings"
              value={occupancyMetrics.bookingsByStatus?.confirmed || 0}
              icon={<Activity className="w-6 h-6" />}
              color="yellow"
            />
          </div>
        ) : (
          <ErrorWidget
            title="Occupancy Data Unavailable"
            message="Reservation or room service is currently down."
            severity="warning"
          />
        )}
      </section>

      {/* User Management */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>
        {userMetrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Guests"
              value={userMetrics.totalGuests || 0}
              icon={<Users className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="New This Month"
              value={userMetrics.newGuestsThisMonth || 0}
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="Total Staff"
              value={
                (userMetrics.staffCount?.admin || 0) +
                (userMetrics.staffCount?.receptionist || 0) +
                (userMetrics.staffCount?.housekeeper || 0)
              }
              icon={<Users className="w-6 h-6" />}
              color="purple"
            />
            <StatCard
              title="Pending Approvals"
              value={userMetrics.pendingApprovals || 0}
              icon={<AlertCircle className="w-6 h-6" />}
              color="yellow"
            />
          </div>
        ) : (
          <ErrorWidget
            title="User Data Unavailable"
            message="User service is currently down."
            severity="warning"
          />
        )}
      </section>

      {/* Housekeeping & Services */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Housekeeping & Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Housekeeping Status */}
          {housekeepingStatus ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Housekeeping Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Clean Rooms</span>
                  <StatusBadge status="clean" size="sm" />
                  <span className="font-semibold">{housekeepingStatus.cleanRooms || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dirty Rooms</span>
                  <StatusBadge status="dirty" size="sm" />
                  <span className="font-semibold">{housekeepingStatus.dirtyRooms || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <StatusBadge status="in-progress" size="sm" />
                  <span className="font-semibold">{housekeepingStatus.inProgressRooms || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tasks Overdue</span>
                  <StatusBadge status="overdue" size="sm" />
                  <span className="font-semibold text-red-600">{housekeepingStatus.tasksOverdue || 0}</span>
                </div>
              </div>
            </div>
          ) : (
            <ErrorWidget
              title="Housekeeping Data Unavailable"
              message="Housekeeping service is down."
              severity="warning"
            />
          )}

          {/* Billing Status */}
          {billingStatus ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Billing Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Paid</span>
                  <StatusBadge status="paid" size="sm" />
                  <span className="font-semibold">{billingStatus.paid || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <StatusBadge status="pending" size="sm" />
                  <span className="font-semibold">{billingStatus.pending || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overdue</span>
                  <StatusBadge status="overdue" size="sm" />
                  <span className="font-semibold text-red-600">{billingStatus.overdue || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Disputed</span>
                  <StatusBadge status="disputed" size="sm" />
                  <span className="font-semibold">{billingStatus.disputed || 0}</span>
                </div>
              </div>
            </div>
          ) : (
            <ErrorWidget
              title="Billing Data Unavailable"
              message="Billing service is down."
              severity="warning"
            />
          )}
        </div>
      </section>

      {/* Communication Metrics */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Communication Overview</h2>
        {communicationMetrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Chats"
              value={communicationMetrics.activeChatSessions || 0}
              icon={<MessageSquare className="w-6 h-6" />}
              color="blue"
              subtitle="Live sessions"
            />
            <StatCard
              title="Video Calls"
              value={communicationMetrics.videoCallsToday || 0}
              icon={<Video className="w-6 h-6" />}
              color="purple"
              subtitle="Today"
            />
            <StatCard
              title="Pending Messages"
              value={communicationMetrics.pendingMessages || 0}
              icon={<AlertCircle className="w-6 h-6" />}
              color="yellow"
              subtitle="Unread"
            />
            <StatCard
              title="Avg Response Time"
              value={`${Math.round(communicationMetrics.averageResponseTime || 0)}m`}
              icon={<Clock className="w-6 h-6" />}
              color="green"
              subtitle="Target: < 5m"
            />
          </div>
        ) : (
          <ErrorWidget
            title="Communication Data Unavailable"
            message="Communication service is down."
            severity="warning"
          />
        )}
      </section>

      {/* System Health */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {systemHealth && Object.entries(systemHealth.services).map(([service, status]) => (
              <div key={service} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{service}</span>
                <StatusBadge status={status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
