import { useState, useEffect } from 'react'
import { Eye, CheckCircle, XCircle } from 'lucide-react'
import {
  fetchReservations,
  confirmReservation,
  cancelReservation,
  type Reservation,
} from '@/services/adminApi'

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch reservations from API
  useEffect(() => {
    const loadReservations = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchReservations()
        setReservations(data)
      } catch (err: any) {
        console.error('Error fetching reservations:', err)
        setError(err.response?.data?.message || 'Failed to load reservations')
      } finally {
        setLoading(false)
      }
    }

    loadReservations()
  }, [])

  const handleConfirm = async (id: string) => {
    try {
      await confirmReservation(id)
      // Refresh reservations
      const data = await fetchReservations()
      setReservations(data)
      alert('Reservation confirmed successfully')
    } catch (err: any) {
      console.error('Error confirming reservation:', err)
      alert(err.response?.data?.message || 'Failed to confirm reservation')
    }
  }

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await cancelReservation(id)
        // Refresh reservations
        const data = await fetchReservations()
        setReservations(data)
        alert('Reservation cancelled successfully')
      } catch (err: any) {
        console.error('Error cancelling reservation:', err)
        alert(err.response?.data?.message || 'Failed to cancel reservation')
      }
    }
  }

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-600 text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
        <p className="text-gray-600 mt-1">Manage all hotel reservations</p>
      </div>

      {reservations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">No reservations found</p>
        </div>
      ) : (
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
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(reservation.checkIn).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(reservation.checkOut).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">${reservation.totalAmount}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      {reservation.status === 'PendingPayment' && (
                        <button 
                          onClick={() => handleConfirm(reservation._id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                          title="Confirm"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {(reservation.status === 'Confirmed' || reservation.status === 'PendingPayment') && (
                        <button 
                          onClick={() => handleCancel(reservation._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Cancel"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Reservations

