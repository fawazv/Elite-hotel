import { useState, useEffect } from 'react'
import { Eye, CheckCircle, XCircle, Edit, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  fetchReservations,
  confirmReservation,
  cancelReservation,
  type Reservation,
} from '@/services/adminApi'
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal'
import ReservationDetailModal from '@/components/admin/ReservationDetailModal'
import ReservationFormModal from '@/components/admin/ReservationFormModal'
import ExportButton, { type ExportFormat, type ExportScope } from '@/components/admin/ExportButton'
import { exportToCSV, exportToExcel, formatDataForExport, generateFilename } from '@/utils/exportData'
import { format } from 'date-fns'
import SortableTableHeader from '@/components/admin/SortableTableHeader'
import { useSorting } from '@/Hooks/useSorting'

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const itemsPerPage = 20

  // Sorting state
  const { sortConfigs, handleSort } = useSorting([], 'reservations')
  
  // Modal states
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [reservationToEdit, setReservationToEdit] = useState<Reservation | null>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1) // Reset to page 1 when search changes
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch reservations from API
  const loadReservations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchReservations({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch || undefined,
        sort: sortConfigs
      })
      setReservations(response.data)
      setTotalItems(response.total)
      setTotalPages(Math.ceil(response.total / itemsPerPage))
    } catch (err: any) {
      console.error('Error fetching reservations:', err)
      setError(err.response?.data?.message || 'Failed to load reservations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [currentPage, debouncedSearch, sortConfigs])

  const handleConfirm = async (id: string) => {
    try {
      await confirmReservation(id)
      loadReservations()
      alert('Reservation confirmed successfully')
    } catch (err: any) {
      console.error('Error confirming reservation:', err)
      alert(err.response?.data?.message || 'Failed to confirm reservation')
    }
  }

  const handleCancel = (reservation: Reservation) => {
    setReservationToCancel(reservation)
    setCancelModalOpen(true)
  }

  const confirmCancel = async () => {
    if (!reservationToCancel) return
    
    try {
      await cancelReservation(reservationToCancel._id)
      loadReservations()
      setReservationToCancel(null)
    } catch (err: any) {
      console.error('Error cancelling reservation:', err)
      alert(err.response?.data?.message || 'Failed to cancel reservation')
    }
  }

  const handleViewDetail = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setDetailModalOpen(true)
  }

  const handleEdit = (reservation: Reservation) => {
    setReservationToEdit(reservation)
    setEditModalOpen(true)
  }

  const handleEditSuccess = async () => {
    loadReservations()
  }

  const handleExport = async (exportFormat: ExportFormat, scope: ExportScope) => {
    let dataToExport: Reservation[] = []
    
    try {
      if (scope === 'current') {
        dataToExport = reservations
      } else if (scope === 'filtered' || scope === 'all') {
        const response = await fetchReservations({
          limit: 10000,
          search: scope === 'all' ? undefined : (debouncedSearch || undefined),
          sort: sortConfigs
        })
        dataToExport = response.data
      }
      
      const formatted = formatDataForExport(dataToExport, {
        'Code': 'code',
        'Guest Email': (r) => r.guestContact.email,
        'Room': (r) => `Room ${r.roomId.number} (${r.roomId.type})`,
        'Check-In': (r) => format(new Date(r.checkIn), 'yyyy-MM-dd'),
        'Check-Out': (r) => format(new Date(r.checkOut), 'yyyy-MM-dd'),
        'Status': 'status',
        'Total Amount': (r) => `$${r.totalAmount}`,
        'Created At': (r) => r.createdAt ? format(new Date(r.createdAt), 'yyyy-MM-dd HH:mm') : ''
      })
      
      const filename = generateFilename('reservations')
      
      if (exportFormat === 'csv') {
        exportToCSV(formatted, filename)
      } else {
        exportToExcel(formatted, filename, 'Reservations')
      }
    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export data')
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

  if (loading && reservations.length === 0) {
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

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
        <p className="text-gray-600 mt-1">Manage all hotel reservations</p>
        <div className="mt-4">
          {reservations.length > 0 && (
            <ExportButton onExport={handleExport} loading={loading} />
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by reservation code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Pagination Info */}
      {totalItems > 0 && (
        <div className="text-sm text-gray-600">
          Showing {startItem}-{endItem} of {totalItems} reservations
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">
            {searchQuery ? 'No reservations found matching your search' : 'No reservations found'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <SortableTableHeader
                    column="code"
                    label="Code"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-4 text-sm font-semibold text-gray-900"
                  />
                  <SortableTableHeader
                    column="guestContact.email"
                    label="Guest"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-4 text-sm font-semibold text-gray-900"
                  />
                  <SortableTableHeader
                    column="roomId"
                    label="Room"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-4 text-sm font-semibold text-gray-900"
                  />
                  <SortableTableHeader
                    column="checkIn"
                    label="Check-In"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-4 text-sm font-semibold text-gray-900"
                  />
                  <SortableTableHeader
                    column="checkOut"
                    label="Check-Out"
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
                    column="totalAmount"
                    label="Total"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-4 text-sm font-semibold text-gray-900"
                  />
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
                          onClick={() => handleViewDetail(reservation)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(reservation)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                          title="Edit"
                        >
                          <Edit size={18} />
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
                            onClick={() => handleCancel(reservation)}
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
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false)
          setReservationToCancel(null)
        }}
        onConfirm={confirmCancel}
        guestName={reservationToCancel ? `Reservation ${reservationToCancel.code}` : ''}
      />

      <ReservationDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedReservation(null)
        }}
        reservation={selectedReservation}
      />

      <ReservationFormModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setReservationToEdit(null)
        }}
        reservation={reservationToEdit}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}

export default Reservations
