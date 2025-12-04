import { useState, useEffect } from 'react'
import { DollarSign, Search, CreditCard, TrendingUp, AlertCircle } from 'lucide-react'
import { fetchPayments, type Payment } from '@/services/adminApi'
import { format } from 'date-fns'
import ExportButton, { type ExportFormat, type ExportScope } from '@/components/admin/ExportButton'
import { exportToCSV, exportToExcel, formatDataForExport, generateFilename } from '@/utils/exportData'
import SortableTableHeader from '@/components/admin/SortableTableHeader'
import { useSorting } from '@/Hooks/useSorting'

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [providerFilter, setProviderFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 20

  // Sorting state
  const { sortConfigs, handleSort } = useSorting([], 'payments')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    loadPayments()
  }, [currentPage, debouncedSearch, statusFilter, providerFilter, sortConfigs])

  const loadPayments = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchPayments({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter || undefined,
        provider: providerFilter || undefined,
        search: debouncedSearch || undefined,
        sort: sortConfigs
      })
      setPayments(response.data)
      setTotalItems(response.total)
      setTotalPages(Math.ceil(response.total / itemsPerPage))
    } catch (err: any) {
      console.error('Error fetching payments:', err)
      setError(err.response?.data?.message || 'Failed to load payment records')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      initiated: 'bg-blue-100 text-blue-700 border-blue-200',
      succeeded: 'bg-green-100 text-green-700 border-green-200',
      failed: 'bg-red-100 text-red-700 border-red-200',
      refunded: 'bg-purple-100 text-purple-700 border-purple-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      stripe: 'bg-indigo-50 text-indigo-700',
      razorpay: 'bg-cyan-50 text-cyan-700',
    }
    return colors[provider] || 'bg-gray-50 text-gray-700'
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
    let dataToExport: Payment[] = []
    
    try {
      if (scope === 'current') {
        dataToExport = payments
      } else if (scope === 'filtered' || scope === 'all') {
        const response = await fetchPayments({
          limit: 10000,
          status: scope === 'all' ? undefined : (statusFilter || undefined),
          provider: scope === 'all' ? undefined : (providerFilter || undefined),
          search: scope === 'all' ? undefined : (debouncedSearch || undefined),
          sort: sortConfigs
        })
        dataToExport = response.data
      }
      
      const formatted = formatDataForExport(dataToExport, {
        'Transaction ID': (p) => p._id.slice(-8).toUpperCase(),
        'Reservation': (p) => p.reservationId?.slice(-6) || 'N/A',
        'Guest Email': (p) => p.guestContact?.email || '',
        'Amount': (p) => `${p.currency} ${p.amount}`,
        'Provider': 'provider',
        'Status': 'status',
        'Date': (p) => p.createdAt ? format(new Date(p.createdAt), 'yyyy-MM-dd HH:mm') : 'N/A'
      })
      
      const filename = generateFilename('payments')
      
      if (exportFormat === 'csv') {
        exportToCSV(formatted, filename)
      } else {
        exportToExcel(formatted, filename, 'Payments')
      }
    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export data')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Track and manage payment transactions</p>
        </div>
        {payments.length > 0 && (
          <ExportButton onExport={handleExport} loading={loading} />
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Succeeded</p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'succeeded').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'failed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <CreditCard size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Refunded</p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'refunded').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by guest email or transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="initiated">Initiated</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Providers</option>
            <option value="stripe">Stripe</option>
            <option value="razorpay">Razorpay</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center p-12">
            <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No payments found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <SortableTableHeader
                    column="_id"
                    label="Transaction"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  />
                  <SortableTableHeader
                    column="guestContact.email"
                    label="Guest"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  />
                  <SortableTableHeader
                    column="amount"
                    label="Amount"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  />
                  <SortableTableHeader
                    column="provider"
                    label="Provider"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  />
                  <SortableTableHeader
                    column="status"
                    label="Status"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  />
                  <SortableTableHeader
                    column="createdAt"
                    label="Date"
                    sortConfigs={sortConfigs}
                    onSort={handleSort}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment._id.slice(-8).toUpperCase()}
                      </div>
                      {payment.reservationId && (
                        <div className="text-xs text-gray-500">
                          Res: {payment.reservationId.slice(-6)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payment.guestContact?.email || 'N/A'}
                      </div>
                      {payment.guestContact?.phoneNumber && (
                        <div className="text-xs text-gray-500">
                          {payment.guestContact.phoneNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {payment.currency} {payment.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getProviderColor(payment.provider)}`}>
                        {payment.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.createdAt ? format(new Date(payment.createdAt), 'MMM d, yyyy') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} payments
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              Previous
            </button>
            {renderPaginationButtons()}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payments
