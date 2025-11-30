import { useState, useEffect } from 'react'
import { DollarSign, Filter } from 'lucide-react'
import { fetchBillings, type Billing } from '@/services/adminApi'
import BillingDetailModal from '@/components/admin/BillingDetailModal'

const Billing = () => {
  const [billings, setBillings] = useState<Billing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  
  // Modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null)

  const loadBillings = async () => {
    try {
      setLoading(true)
      setError(null)
      const filters = statusFilter ? { status: statusFilter } : undefined
      const data = await fetchBillings(filters)
      setBillings(data)
    } catch (err: any) {
      console.error('Error fetching billings:', err)
      setError(err.response?.data?.message || 'Failed to load billing records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBillings()
  }, [statusFilter])

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Invoices</h1>
          <p className="text-gray-600 mt-1">View and manage all billing records</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Filter size={20} className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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

      {billings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No billing records found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Invoice ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Guest</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Amount</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Currency</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Created</th>
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
