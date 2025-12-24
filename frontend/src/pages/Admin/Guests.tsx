import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Trash2, CheckCircle, XCircle, Star, Shield, Plus, Eye, Edit, Search, ChevronLeft, ChevronRight, Filter, AlertTriangle, Users } from 'lucide-react'
import { TableSkeleton } from '@/components/common/LoadingSkeleton'
import EmptyState from '@/components/common/EmptyState'
import { fetchGuests, deleteGuest, updateGuest, type Guest } from '@/services/guestApi'
import GuestFormModal from '@/components/admin/GuestFormModal'
import GuestDetailModal from '@/components/admin/GuestDetailModal'
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal'
import ExportButton, { type ExportFormat, type ExportScope } from '@/components/admin/ExportButton'
import { exportToCSV, exportToExcel, formatDataForExport, generateFilename } from '@/utils/exportData'
import SortableTableHeader from '@/components/admin/SortableTableHeader'
import { useSorting } from '@/Hooks/useSorting'

const Guests = () => {
  const [searchParams] = useSearchParams()
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 20

  // Filters
  const [blacklistFilter, setBlacklistFilter] = useState<string | undefined>(undefined)

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [formModalOpen, setFormModalOpen] = useState(false)

  // Sorting
  const { sortConfigs, handleSort } = useSorting([{ column: 'createdAt', direction: 'desc' }])

  // Update searchQuery when URL changes (if navigated to with new params)
  useEffect(() => {
    const query = searchParams.get('search')
    if (query) {
      setSearchQuery(query)
    }
  }, [searchParams])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1) // Reset to page 1 when search changes
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadGuests = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchGuests({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch || undefined,
        isBlacklisted: blacklistFilter ? blacklistFilter === 'true' : undefined,
        sort: sortConfigs
      })
      setGuests(response.data)
      setTotalItems(response.total)
      setTotalPages(Math.ceil(response.total / itemsPerPage))
    } catch (err: any) {
      console.error('Error fetching guests:', err)
      setError(err.response?.data?.message || 'Failed to load guests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGuests()
  }, [currentPage, debouncedSearch, blacklistFilter, sortConfigs])

  const handleDelete = (guest: Guest) => {
    setGuestToDelete(guest)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!guestToDelete) return
    
    try {
      await deleteGuest(guestToDelete._id)
      loadGuests() // Reload to update pagination
      setGuestToDelete(null)
    } catch (err: any) {
      console.error('Error deleting guest:', err)
      alert(err.response?.data?.message || 'Failed to delete guest')
    }
  }

  const handleToggleVip = async (guest: Guest) => {
    const newStatus = guest.status === 'VIP' ? 'Standard' : 'VIP'
    try {
      await updateGuest(guest._id, { status: newStatus })
      loadGuests() // Reload to refresh data
    } catch (err: any) {
      console.error('Error updating guest status:', err)
      alert(err.response?.data?.message || 'Failed to update guest status')
    }
  }

  const handleToggleIdVerified = async (guest: Guest) => {
    try {
      await updateGuest(guest._id, { isIdVerified: !guest.isIdVerified })
      loadGuests() // Reload to refresh data
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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const renderPaginationButtons = () => {
    const buttons = []
    const maxVisible = 5
    let startPage = Math.max(1, currentPage - 2)
    let endPage = Math.min(totalPages, startPage + maxVisible - 1)

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            i === currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          {i}
        </button>
      )
    }

    return buttons
  }

  const handleExport = async (exportFormat: ExportFormat, scope: ExportScope) => {
    let dataToExport: Guest[] = []
    
    try {
      if (scope === 'current') {
        dataToExport = guests
      } else if (scope === 'filtered' || scope === 'all') {
        const response = await fetchGuests({
          page: 1,
          limit: 10000,
          search: scope === 'all' ? undefined : (debouncedSearch || undefined),
          isBlacklisted: scope === 'all' ? undefined : (blacklistFilter ? blacklistFilter === 'true' : undefined),
          sort: sortConfigs
        })
        dataToExport = response.data
      }
      
      const formatted = formatDataForExport(dataToExport, {
        'Name': (g) => `${g.firstName} ${g.lastName}`,
        'Email': 'email',
        'Phone': (g) => g.phoneNumber || '',
        'Status': 'status',
        'ID Verified': (g) => g.isIdVerified ? 'Yes' : 'No',
        'Blacklisted': (g) => g.isBlacklisted ? 'Yes' : 'No',
        'Last Visit': (g) => g.lastVisit ? new Date(g.lastVisit).toLocaleDateString() : '',
        'Created At': (g) => g.createdAt ? new Date(g.createdAt).toLocaleDateString() : ''
      })
      
      const filename = generateFilename('guests')
      
      if (exportFormat === 'csv') {
        exportToCSV(formatted, filename)
      } else {
        exportToExcel(formatted, filename, 'Guests')
      }
    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export data')
    }
  }

  if (loading && guests.length === 0) {
    return <TableSkeleton rows={10} />
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <EmptyState 
           title="Unable to load guests" 
           description={error || "Something went wrong while fetching the guest list."}
           icon={AlertTriangle}
           action={{ label: "Retry", onClick: () => loadGuests() }}
        />
      </div>
    )
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guest Management</h1>
          <p className="text-gray-600 mt-1">Manage hotel guests, VIP status, and ID verification</p>
        </div>
        <div className="flex gap-2">
          {guests.length > 0 && (
            <ExportButton onExport={handleExport} loading={loading} />
          )}
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add New Guest
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={blacklistFilter}
              onChange={(e) => {
                setBlacklistFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Guests</option>
              <option value="false">Active Guests</option>
              <option value="true">Blacklisted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pagination Info */}
      {totalItems > 0 && (
        <div className="text-sm text-gray-600">
          Showing {startItem}-{endItem} of {totalItems} guests
        </div>
      )}

      {guests.length === 0 ? (
        <EmptyState
           title={searchQuery || blacklistFilter ? 'No guests found' : 'No guests registered'}
           description={searchQuery 
              ? `No guests found matching "${searchQuery}"` 
              : "Guests will appear here once they sign up or are added manually."}
           icon={Users}
           action={!searchQuery && !blacklistFilter ? {
              label: "Add New Guest",
              onClick: handleAddNew,
              startIcon: Plus
           } : undefined}
        />
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <SortableTableHeader
                    column="firstName"
                    label="Name"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-4 text-sm font-semibold text-gray-900"
                  />
                  <SortableTableHeader
                    column="email"
                    label="Contact"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-4 text-sm font-semibold text-gray-900"
                  />
                  <SortableTableHeader
                    column="status"
                    label="Status"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-4 text-sm font-semibold text-gray-900"
                  />
                  <SortableTableHeader
                    column="isIdVerified"
                    label="ID Verified"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-4 text-sm font-semibold text-gray-900"
                  />
                  <SortableTableHeader
                    column="lastVisit"
                    label="Last Visit"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-4 text-sm font-semibold text-gray-900"
                  />
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {renderPaginationButtons()}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
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
