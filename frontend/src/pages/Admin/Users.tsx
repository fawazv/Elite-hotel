import { useState, useEffect } from 'react'
import { Edit, Trash2, Shield } from 'lucide-react'

interface User {
  _id: string
  fullName: string
  email: string
  role: string
  isVerified: boolean
  isApproved: string
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Placeholder data
        const mockUsers: User[] = [
          {
            _id: '1',
            fullName: 'John Doe',
            email: 'john@example.com',
            role: 'user',
            isVerified: true,
            isApproved: 'approved',
          },
          {
            _id: '2',
            fullName: 'Jane Smith',
            email: 'jane@example.com',
            role: 'receptionist',
            isVerified: true,
            isApproved: 'approved',
          },
        ]
        setUsers(mockUsers)
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700',
      receptionist: 'bg-blue-100 text-blue-700',
      Housekeeper: 'bg-green-100 text-green-700',
      user: 'bg-gray-100 text-gray-700',
    }
    return colors[role] || 'bg-gray-100 text-gray-700'
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
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage all system users and their roles</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Name</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Email</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Role</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.fullName}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {user.isVerified && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Verified</span>
                    )}
                    {user.isApproved === 'approved' && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Approved</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Change Role">
                      <Shield size={18} />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                      <Edit size={18} />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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

export default Users
