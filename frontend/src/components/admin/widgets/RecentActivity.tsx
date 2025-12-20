import { format } from 'date-fns'
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'

interface Activity {
  _id: string
  guestName: string
  roomNumber: number
  status: 'Confirmed' | 'PendingPayment' | 'CheckedIn' | 'CheckedOut' | 'Cancelled'
  amount: number
  createdAt: string
  type: 'booking' | 'check-in' | 'check-out' | 'cancellation'
}

interface RecentActivityProps {
  activities?: Activity[]
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Confirmed':
    case 'CheckedIn':
      return <CheckCircle size={16} className="text-green-500" />
    case 'PendingPayment':
      return <Clock size={16} className="text-yellow-500" />
    case 'Cancelled':
      return <XCircle size={16} className="text-red-500" />
    default:
      return <AlertCircle size={16} className="text-gray-500" />
  }
}

const RecentActivity = ({ activities = [] }: RecentActivityProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Activity</h3>
      <div className="space-y-6">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div key={activity._id} className="flex items-start gap-4">
              <div className="mt-1">{getStatusIcon(activity.status)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {activity.guestName}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Room {activity.roomNumber} • {activity.status}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default RecentActivity
