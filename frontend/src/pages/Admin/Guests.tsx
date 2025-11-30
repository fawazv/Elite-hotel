import { useState, useEffect } from 'react'
import { Trash2, CheckCircle, XCircle, Star, Shield, Plus, Eye, Edit } from 'lucide-react'
import { fetchGuests, deleteGuest, updateGuest, type Guest } from '@/services/guestApi'
import GuestFormModal from '@/components/admin/GuestFormModal'
import GuestDetailModal from '@/components/admin/GuestDetailModal'
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal'

const Guests = () => {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null)

  useEffect(() => {
    loadGuests()
  }, [])

  const loadGuests = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchGuests()
      setGuests(response.data || [])
    } catch (err: any) {
      console.error('Error fetching guests:', err)
      setError(err.response?.data?.message || 'Failed to load guests')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (guest: Guest) => {
    setGuestToDelete(guest)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!guestToDelete) return
    
    try {
      await deleteGuest(guestToDelete._id)
      setGuests(guests.filter((guest) => guest._id !== guestToDelete._id))
      setGuestToDelete(null)
    } catch (err: any) {
      console.error('Error deleting guest:', err)
      alert(err.response?.data?.message || 'Failed to delete guest')
    }
  }

  const handleToggleVip = async (guest: Guest) => {
    const newStatus = guest.status === 'VIP' ? 'Standard' : 'VIP'
    try {
      const updated = await updateGuest(guest._id, { status: newStatus })
      setGuests(guests.map((g) => (g._id === guest._id ? { ...g, ...updated } : g)))
    } catch (err: any) {
      console.error('Error updating guest status:', err)
      alert(err.response?.data?.message || 'Failed to update guest status')
    }
  }

  const handleToggleIdVerified = async (guest: Guest) => {
    try {
      const updated = await updateGuest(guest._id, { isIdVerified: !guest.isIdVerified })
      setGuests(guests.map((g) => (g._id === guest._id ? { ...g, ...updated } : g)))
    } catch (err: any) {
      console.error('Error updating ID verification:', err)
      alert('Failed to update ID verification')
    }
  }

  const handleViewDetail = (guest: Guest) => {
    setSelectedGuest(guest)
    setDetailModalOpen(true)
  }

  const handleEdit = (guest: Guest) => {
    setSelectedGuest(guest)
    setFormModalOpen(true)
  }

  const handleAddNew = () => {
    setSelectedGuest(null)
    setFormModalOpen(true)
  }

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      VIP: 'bg-purple-100 text-purple-700',
      Loyalty: 'bg-blue-100 text-blue-700',
      Standard: 'bg-gray-100 text-gray-700',
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
          onClick={loadGuests}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guest Management</h1>
          <p className="text-gray-600 mt-1">Manage hotel guests, VIP status, and ID verification</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add New Guest
        </button>
      </div>

      {guests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">No guests found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">ID Verified</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Last Visit</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {guests.map((guest) => (
                <tr key={guest._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{guest.firstName} {guest.lastName}</div>
                    {guest.isBlacklisted && <span className="text-xs text-red-600 font-bold">BLACKLISTED</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{guest.email}</div>
                    <div className="text-sm text-gray-500">{guest.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(guest.status)}`}>
                      {guest.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {guest.isIdVerified ? (
                      <span className="flex items-center text-green-600 text-sm">
                        <CheckCircle size={16} className="mr-1" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-400 text-sm">
                        <XCircle size={16} className="mr-1" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {guest.lastVisit ? new Date(guest.lastVisit).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewDetail(guest)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleEdit(guest)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit Guest"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleToggleVip(guest)}
                        className={`p-2 rounded-lg transition-colors ${guest.status === 'VIP' ? 'text-purple-600 bg-purple-50' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'}`}
                        title="Toggle VIP Status"
                      >
                        <Star size={18} fill={guest.status === 'VIP' ? 'currentColor' : 'none'} />
                      </button>
                      <button 
                        onClick={() => handleToggleIdVerified(guest)}
                        className={`p-2 rounded-lg transition-colors ${guest.isIdVerified ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                        title="Toggle ID Verification"
                      >
                        <Shield size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(guest)}
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
      )}

      {/* Modals */}
      <GuestFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false)
          setSelectedGuest(null)
        }}
        onSuccess={loadGuests}
        guest={selectedGuest}
      />

      <GuestDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedGuest(null)
        }}
        guest={selectedGuest}
        onVerifyId={(guestId) => {
          const guest = guests.find(g => g._id === guestId)
          if (guest) handleToggleIdVerified(guest)
        }}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setGuestToDelete(null)
        }}
        onConfirm={confirmDelete}
        guestName={guestToDelete ? `${guestToDelete.firstName} ${guestToDelete.lastName || ''}`.trim() : ''}
      />
    </div>
  )
}

export default Guests
