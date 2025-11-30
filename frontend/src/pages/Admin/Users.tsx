import { useState, useEffect } from 'react'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { fetchUsers, deleteUser, type User } from '@/services/adminApi'
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal'
import UserDetailModal from '@/components/admin/UserDetailModal'
import UserFormModal from '@/components/admin/UserFormModal'

const Users = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchUsers()
      setUsers(data)
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError(err.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (user: User) => {
    setUserToDelete(user)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return
    
    try {
      await deleteUser(userToDelete._id)
      setUsers(users.filter((user) => user._id !== userToDelete._id))
      setUserToDelete(null)
    } catch (err: any) {
      console.error('Error deleting user:', err)
      alert(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleViewDetail = (user: User) => {
    setSelectedUser(user)
    setDetailModalOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setEditModalOpen(true)
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700',
      receptionist: 'bg-blue-100 text-blue-700',
      Housekeeper: 'bg-green-100 text-green-700',
      user: 'bg-gray-100 text-gray-700',
    }
    return colors[role] || 'bg-gray-100 text-gray-700'
  }

  const getApprovalBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      approved: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
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
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage all system users and their roles</p>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Role</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Verified</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar?.url && (
                        <img 
                          src={user.avatar.url} 
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <span className="text-sm font-medium text-gray-900">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getApprovalBadgeColor(user.isApproved)}`}>
                      {user.isApproved}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      user.isVerified 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.isVerified ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewDetail(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user)}
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

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setUserToDelete(null)
        }}
        onConfirm={confirmDelete}
        guestName={userToDelete ? `${userToDelete.email}` : ''}
      />

      <UserDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
      />

      <UserFormModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedUser(null)
        }}
        onSuccess={loadUsers}
        user={selectedUser}
      />
    </div>
  )
}

export default Users
