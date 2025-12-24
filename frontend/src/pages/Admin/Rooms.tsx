import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Search, ChevronLeft, ChevronRight, AlertTriangle, FolderOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchRooms, deleteRoom, type Room } from '@/services/adminApi'
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal'
import ExportButton, { type ExportFormat, type ExportScope } from '@/components/admin/ExportButton'
import { exportToCSV, exportToExcel, formatDataForExport, generateFilename } from '@/utils/exportData'
import SortableTableHeader from '@/components/admin/SortableTableHeader'
import { useSorting } from '@/Hooks/useSorting'
import { TableSkeleton } from '@/components/common/LoadingSkeleton'
import EmptyState from '@/components/common/EmptyState'

const Rooms = () => {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('')
  const itemsPerPage = 20

  // Sorting state
  const { sortConfigs, handleSort } = useSorting([], 'rooms')
  
  // Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1) // Reset to page 1 when search changes
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadRooms = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchRooms({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch || undefined,
        type: typeFilter || undefined,
        available: availabilityFilter ? availabilityFilter === 'true' : undefined,
        sort: sortConfigs
      })
      
      setRooms(response.data)
      setTotalItems(response.total)
      setTotalPages(Math.ceil(response.total / itemsPerPage))
    } catch (err: any) {
      console.error('Error fetching rooms:', err)
      setError(err.response?.data?.message || 'Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRooms()
  }, [currentPage, debouncedSearch, typeFilter, availabilityFilter, sortConfigs])

  const handleDelete = (room: Room) => {
    setRoomToDelete(room)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!roomToDelete) return
    
    try {
      await deleteRoom(roomToDelete._id)
      loadRooms() // Reload to update pagination
      setRoomToDelete(null)
    } catch (err: any) {
      console.error('Error deleting room:', err)
      alert(err.response?.data?.message || 'Failed to delete room')
    }
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
    let dataToExport: Room[] = []
    
    try {
      if (scope === 'current') {
        dataToExport = rooms
      } else if (scope === 'filtered' || scope === 'all') {
        const response = await fetchRooms({
          limit: 10000,
          search: scope === 'all' ? undefined : (debouncedSearch || undefined),
          type: scope === 'all' ? undefined : (typeFilter || undefined),
          available: scope === 'all' ? undefined : (availabilityFilter ? availabilityFilter === 'true' : undefined),
          sort: sortConfigs
        })
        dataToExport = response.data
      }
      
      const formatted = formatDataForExport(dataToExport, {
        'Room Number': 'number',
        'Name': 'name',
        'Type': 'type',
        'Price': (r) => `$${r.price}`,
        'Status': (r) => r.available ? 'Available' : 'Occupied',
        'Description': 'description',
        'Amenities': (r) => r.amenities?.join(', ') || ''
      })
      
      const filename = generateFilename('rooms')
      
      if (exportFormat === 'csv') {
        exportToCSV(formatted, filename)
      } else {
        exportToExcel(formatted, filename, 'Rooms')
      }
    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export data')
    }
  }

  if (loading && rooms.length === 0) {
    return <TableSkeleton rows={10} />
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <EmptyState 
           title="Unable to load rooms" 
           description={error || "Something went wrong while fetching the room list."}
           icon={AlertTriangle}
           action={{ label: "Retry", onClick: () => loadRooms() }}
        />
      </div>
    )
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600 mt-1">Manage all hotel rooms</p>
        </div>
        <div className="flex gap-2">
          {rooms.length > 0 && (
            <ExportButton onExport={handleExport} loading={loading} />
          )}
          <button
            onClick={() => navigate('/admin/rooms/new')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add Room
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
              placeholder="Search by room number, name, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Premium">Premium</option>
            <option value="Luxury">Luxury</option>
          </select>
          <select
            value={availabilityFilter}
            onChange={(e) => {
              setAvailabilityFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Available</option>
            <option value="false">Occupied</option>
          </select>
        </div>
      </div>

      {/* Pagination Info */}
      {totalItems > 0 && (
        <div className="text-sm text-gray-600">
          Showing {startItem}-{endItem} of {totalItems} rooms
        </div>
      )}

  {/* Empty State */}
      {rooms.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No rooms found' : 'No rooms added yet'}
          description={searchQuery ? `We couldn't find any rooms matching "${searchQuery}"` : "Get started by adding your first room to the inventory."}
          icon={FolderOpen}
          action={!searchQuery ? {
            label: "Add Your First Room",
            onClick: () => navigate('/admin/rooms/new'),
            startIcon: Plus
          } : undefined}
        />
      ) : (
        <>
          {/* Rooms Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <SortableTableHeader
                    column="number"
                    label="Room #"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-4 text-sm font-semibold text-gray-900"
                  />
                  <SortableTableHeader
                    column="name"
                    label="Name"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-4 text-sm font-semibold text-gray-900"
                  />
                  <SortableTableHeader
                    column="type"
                    label="Type"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-4 text-sm font-semibold text-gray-900"
                  />
                  <SortableTableHeader
                    column="price"
                    label="Price"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-4 text-sm font-semibold text-gray-900"
                  />
                  <SortableTableHeader
                    column="available"
                    label="Status"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-4 text-sm font-semibold text-gray-900"
                  />
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
                          onClick={() => handleDelete(room)}
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

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setRoomToDelete(null)
        }}
        onConfirm={confirmDelete}
        guestName={roomToDelete ? `Room ${roomToDelete.number} - ${roomToDelete.name}` : ''}
      />
    </div>
  )
}

export default Rooms
