import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// TODO: Replace with actual API call
interface Room {
  _id: string
  number: number
  name: string
  type: 'Standard' | 'Deluxe' | 'Premium' | 'Luxury'
  price: number
  available: boolean
  image?: {
    url: string
  }
}

const Rooms = () => {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  // TODO: Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // Placeholder data
        const mockRooms: Room[] = [
          {
            _id: '1',
            number: 101,
            name: 'Ocean View Suite',
            type: 'Luxury',
            price: 299,
            available: true,
          },
          {
            _id: '2',
            number: 102,
            name: 'Garden Room',
            type: 'Deluxe',
            price: 199,
            available: false,
          },
        ]
        setRooms(mockRooms)
      } catch (error) {
        console.error('Error fetching rooms:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      // TODO: Implement delete API call
      console.log('Delete room:', id)
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600 mt-1">Manage all hotel rooms</p>
        </div>
        <button
          onClick={() => navigate('/admin/rooms/new')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Room
        </button>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Room #</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Name</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Type</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Price</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rooms.map((room) => (
              <tr key={room._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{room.number}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{room.name}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                    {room.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">${room.price}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      room.available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {room.available ? 'Available' : 'Occupied'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/admin/rooms/${room._id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/rooms/edit/${room._id}`)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(room._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
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

export default Rooms
