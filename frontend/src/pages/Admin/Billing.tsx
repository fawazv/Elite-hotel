import { useState, useEffect } from 'react'
import { DollarSign, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchBillings, type Billing } from '@/services/adminApi'
import BillingDetailModal from '@/components/admin/BillingDetailModal'
import ExportButton, { type ExportFormat, type ExportScope } from '@/components/admin/ExportButton'
import { exportToCSV, exportToExcel, formatDataForExport, generateFilename } from '@/utils/exportData'
import { format } from 'date-fns'
import SortableTableHeader from '@/components/admin/SortableTableHeader'
import { useSorting } from '@/Hooks/useSorting'

const Billing = () => {
  const [billings, setBillings] = useState<Billing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const itemsPerPage = 20

  // Sorting state
  const { sortConfigs, handleSort } = useSorting([], 'billing')
  
  // Modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1) // Reset to page 1 when search changes
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadBillings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchBillings({
        status: statusFilter || undefined,
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch || undefined,
        sort: sortConfigs
      })
      setBillings(response.data)
      setTotalItems(response.total)
      setTotalPages(Math.ceil(response.total / itemsPerPage))
    } catch (err: any) {
      console.error('Error fetching billings:', err)
      setError(err.response?.data?.message || 'Failed to load billing records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBillings()
  }, [currentPage, debouncedSearch, statusFilter, sortConfigs])

  const handleViewDetail = (billing: Billing) => {
    setSelectedBilling(billing)
    setDetailModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
      refunded: 'bg-blue-100 text-blue-700',
      failed: 'bg-red-100 text-red-700',
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
    let dataToExport: Billing[] = []
    
    try {
      if (scope === 'current') {
        dataToExport = billings
      } else if (scope === 'filtered' || scope === 'all') {
        const response = await fetchBillings({
          limit: 10000,
          status: scope === 'all' ? undefined : (statusFilter || undefined),
          search: scope === 'all' ? undefined : (debouncedSearch || undefined),
          sort: sortConfigs
        })
        dataToExport = response.data
      }
      
      const formatted = formatDataForExport(dataToExport, {
        'Invoice ID': (b) => b._id.slice(-8).toUpperCase(),
        'Guest Email': (b) => b.guestContact?.email || '',
        'Amount': (b) => `${b.currency} ${b.amount.toFixed(2)}`,
        'Status': 'status',
        'Created': (b) => format(new Date(b.createdAt), 'yyyy-MM-dd'),
        'Ledger Entries': (b) => b.ledger?.length || 0
      })
      
      const filename = generateFilename('billing')
      
      if (exportFormat === 'csv') {
        exportToCSV(formatted, filename)
      } else {
        exportToExcel(formatted, filename, 'Billing')
      }
    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export data')
    }
  }

  if (loading && billings.length === 0) {
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
        <h1 className="text-3xl font-bold text-gray-900">Billing & Invoices</h1>
        <p className="text-gray-600 mt-1">View and manage all billing records</p>
        <div className="mt-4">
          {billings.length > 0 && (
            <ExportButton onExport={handleExport} loading={loading} />
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by guest email, invoice ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pagination Info */}
      {totalItems > 0 && (
        <div className="text-sm text-gray-600">
          Showing {startItem}-{endItem} of {totalItems} billing records
        </div>
      )}

      {billings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">
            {searchQuery ? 'No billing records found matching your search' : 'No billing records found'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <SortableTableHeader
                    column="_id"
                    label="Invoice ID"
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
                    column="amount"
                    label="Amount"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-4 text-sm font-semibold text-gray-900"
                  />
                  <SortableTableHeader
                    column="currency"
                    label="Currency"
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
                    column="createdAt"
                    label="Created"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-4 text-sm font-semibold text-gray-900"
                  />
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {billings.map((billing) => (
                  <tr key={billing._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{billing._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {billing.guestContact?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {billing.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 uppercase">
                      {billing.currency}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(billing.status)}`}>
                        {billing.status.charAt(0).toUpperCase() + billing.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(billing.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetail(billing)}
                        className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
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

      <BillingDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedBilling(null)
        }}
        billing={selectedBilling}
      />
    </div>
  )
}

export default Billing
