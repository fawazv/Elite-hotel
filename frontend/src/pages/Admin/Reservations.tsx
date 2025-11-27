import { useState, useEffect } from 'react'
import { Eye, CheckCircle, XCircle } from 'lucide-react'

interface Reservation {
  _id: string
  code: string
  guestContact: {
    email: string
  }
  roomId: {
    number: number
    type: string
  }
  checkIn: string
  checkOut: string
  status: string
  totalAmount: number
}

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  // TODO: Fetch reservations from API
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        // Placeholder data
        const mockData: Reservation[] = [
          {
            _id: '1',
            code: 'RES-2024-001',
            guestContact: { email: 'john@example.com' },
            roomId: { number: 101, type: 'Luxury' },
            checkIn: '2024-12-01',
            checkOut: '2024-12-05',
            status: 'Confirmed',
            totalAmount: 1200,
          },
        ]
        setReservations(mockData)
      } catch (error) {
        console.error('Error fetching reservations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Confirmed: 'bg-green-100 text-green-700',
      PendingPayment: 'bg-yellow-100 text-yellow-700',
      CheckedIn: 'bg-blue-100 text-blue-700',
      CheckedOut: 'bg-gray-100 text-gray-700',
      Cancelled: 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
        <p className="text-gray-600 mt-1">Manage all hotel reservations</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Code</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Guest</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Room</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Check-In</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Check-Out</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Total</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reservations.map((reservation) => (
              <tr key={reservation._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{reservation.code}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{reservation.guestContact.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  Room {reservation.roomId.number} - {reservation.roomId.type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{reservation.checkIn}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{reservation.checkOut}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                    {reservation.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">${reservation.totalAmount}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Confirm">
                      <CheckCircle size={18} />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancel">
                      <XCircle size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Reservations
