import React from 'react';
import { 
  ClipboardCheck,
  Clock,
  Award,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useHousekeeperDashboard } from '@/Hooks/useDashboardData';
import { useRealtimeUpdates } from '@/Hooks/useRealtimeUpdates';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { ErrorWidget } from '@/components/shared/ErrorWidget';
import { LoadingWidget } from '@/components/shared/LoadingWidget';

const HousekeeperDashboard: React.FC = () => {
  const { data, isLoading, error, refetch } = useHousekeeperDashboard();
  
  // Enable real-time updates
  useRealtimeUpdates('housekeeper');

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Tasks</h1>
        <LoadingWidget variant="table" count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Tasks</h1>
        <ErrorWidget
          title="Failed to Load Tasks"
          message="Unable to fetch your tasks. Please try again."
          severity="error"
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      </div>
    );
  }

  const {
    assignedTasks,
    myStats,
    roomContext,
    serviceHealth,
  } = data || {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-500 mt-1">Housekeeping dashboard</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* My Performance Stats */}
      {myStats && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Tasks Today"
              value={myStats.tasksCompleted?.today || 0}
              icon={<CheckCircle className="w-6 h-6" />}
              color="green"
              trend={{
                direction: 'neutral',
                percentage: myStats.tasksCompleted?.week || 0,
                label: 'this week'
              }}
            />
            <StatCard
              title="Avg Completion Time"
              value={`${myStats.averageCompletionTime || 0} min`}
              icon={<Clock className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="Pending Tasks"
              value={myStats.pendingTasks || 0}
              icon={<ClipboardCheck className="w-6 h-6" />}
              color={myStats.pendingTasks > 5 ? 'yellow' : 'gray'}
            />
            <StatCard
              title="On-Time Rate"
              value={`${myStats.performance?.onTimeCompletionRate || 100}%`}
              icon={<Award className="w-6 h-6" />}
              color="purple"
              subtitle={`Quality: ${myStats.performance?.qualityScore || 100}%`}
            />
          </div>
        </section>
      )}

      {/* Assigned Tasks */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          My Assigned Tasks ({assignedTasks?.length || 0})
        </h2>
        {assignedTasks && assignedTasks.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Context
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignedTasks.map((task: any) => {
                    const context = roomContext?.[task.roomId];
                    return (
                      <tr 
                        key={task._id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {/* View task details */}}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              Room {task.roomNumber || task.roomId}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 capitalize">
                            {task.taskType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PriorityBadge 
                            priority={task.priority} 
                            animate={task.priority === 'urgent'}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={task.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-600 space-y-1">
                            {context?.hasGuestCheckingInToday && (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span>Check-in today at {new Date(context.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            )}
                            {context?.hasGuestCheckingOutToday && (
                              <div className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-blue-600" />
                                <span>Check-out today</span>
                              </div>
                            )}
                            {context?.isCurrentlyOccupied && (
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span>Currently occupied</span>
                              </div>
                            )}
                            {!context && <span className="text-gray-400">No context</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.dueBy ? new Date(task.dueBy).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-500">You have no pending tasks at the moment.</p>
          </div>
        )}
      </section>

      {/* Overdue Tasks Warning */}
      {myStats && myStats.overdueTasksCount > 0 && (
        <ErrorWidget
          title={`${myStats.overdueTasksCount} Overdue Task${myStats.overdueTasksCount > 1 ? 's' : ''}`}
          message="Please complete overdue tasks as soon as possible."
          severity="warning"
        />
      )}

      {/* Service Health */}
      {serviceHealth && Object.values(serviceHealth).some(s => s !== 'healthy') && (
        <ErrorWidget
          title="Service Issues"
          message="Some services are experiencing issues. Data may be incomplete."
          severity="info"
        />
      )}
    </div>
  );
};

export default HousekeeperDashboard;
