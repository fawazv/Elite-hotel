import { X, DollarSign, Calendar, User, CreditCard } from 'lucide-react'
import { type Billing } from '@/services/adminApi'

interface BillingDetailModalProps {
  isOpen: boolean
  onClose: () => void
  billing: Billing | null
}

const BillingDetailModal = ({ isOpen, onClose, billing }: BillingDetailModalProps) => {
  if (!isOpen || !billing) return null

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
      refunded: 'bg-blue-100 text-blue-700',
      failed: 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <DollarSign className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Invoice Details</h3>
                  <p className="text-blue-100 text-sm">
                    #{billing._id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="text-white" size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Status and Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(billing.status)}`}>
                  {billing.status.charAt(0).toUpperCase() + billing.status.slice(1)}
                </span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {billing.amount.toFixed(2)} <span className="text-sm text-gray-600 uppercase">{billing.currency}</span>
                </p>
              </div>
            </div>

            {/* Guest Information */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <User size={18} className="text-gray-500" />
                <h4 className="font-semibold text-gray-900">Guest Information</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{billing.guestContact?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{billing.guestContact?.phoneNumber || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Payment & Reservation IDs */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={18} className="text-gray-500" />
                <h4 className="font-semibold text-gray-900">Transaction Details</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Payment ID</p>
                  <p className="font-mono text-xs text-gray-900">{billing.paymentId}</p>
                </div>
                <div>
                  <p className="text-gray-500">Reservation ID</p>
                  <p className="font-mono text-xs text-gray-900">{billing.reservationId}</p>
                </div>
              </div>
            </div>

            {/* Ledger History */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={18} className="text-gray-500" />
                <h4 className="font-semibold text-gray-900">Transaction History</h4>
              </div>
              <div className="space-y-3">
                {billing.ledger.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between  p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{entry.type}</p>
                      {entry.note && <p className="text-sm text-gray-600">{entry.note}</p>}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {entry.amount.toFixed(2)} {billing.currency.toUpperCase()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Created At</p>
                <p className="font-medium text-gray-900">
                  {new Date(billing.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {new Date(billing.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingDetailModal
