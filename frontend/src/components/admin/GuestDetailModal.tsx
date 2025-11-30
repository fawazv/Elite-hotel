import { X, CheckCircle, XCircle, Calendar, Phone, Mail, CreditCard, FileText, Eye } from 'lucide-react'
import { type Guest } from '@/services/guestApi'
import { useState } from 'react'

interface GuestDetailModalProps {
  isOpen: boolean
  onClose: () => void
  guest: Guest | null
  onVerifyId: (guestId: string) => void
}

const GuestDetailModal = ({ isOpen, onClose, guest, onVerifyId }: GuestDetailModalProps) => {
  const [imageModalOpen, setImageModalOpen] = useState(false)

  if (!isOpen || !guest) return null

  return (
    <>
      <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Guest Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Personal Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-base font-medium text-gray-900">
                    {guest.firstName} {guest.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    guest.status === 'VIP' ? 'bg-purple-100 text-purple-700' :
                    guest.status === 'Loyalty' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {guest.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-base text-gray-900">{guest.email || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-base text-gray-900">{guest.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ID Proof Section */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard size={20} />
                  ID Proof Information
                </h3>
                {guest.isIdVerified ? (
                  <span className="flex items-center text-green-600 text-sm font-medium">
                    <CheckCircle size={16} className="mr-1" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center text-orange-600 text-sm font-medium">
                    <XCircle size={16} className="mr-1" /> Not Verified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">ID Type</p>
                  <p className="text-base font-medium text-gray-900">
                    {guest.idProof?.type || 'Not Provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ID Number</p>
                  <p className="text-base font-medium text-gray-900">
                    {guest.idProof?.number || 'Not Provided'}
                  </p>
                </div>
              </div>

              {/* ID Card Image */}
              {guest.idProof?.image?.url ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">ID Card Image</p>
                  <div className="relative group">
                    <img
                      src={guest.idProof.image.url}
                      alt="ID Proof"
                      className="w-full h-48 object-cover rounded-lg border-2 border-blue-200"
                    />
                    <button
                      onClick={() => setImageModalOpen(true)}
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all rounded-lg"
                    >
                      <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                    </button>
                  </div>
                  {!guest.isIdVerified && (
                    <button
                      onClick={() => onVerifyId(guest._id)}
                      className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Mark as Verified
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileText className="mx-auto text-gray-400 mb-2" size={48} />
                  <p className="text-gray-500">No ID card uploaded</p>
                </div>
              )}
            </div>

            {/* Additional Info */}
            {guest.notes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-700">{guest.notes}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <div>
                  <p>Last Visit</p>
                  <p className="text-gray-900">
                    {guest.lastVisit ? new Date(guest.lastVisit).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <div>
                  <p>Member Since</p>
                  <p className="text-gray-900">
                    {guest.createdAt ? new Date(guest.createdAt).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {imageModalOpen && guest.idProof?.image?.url && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]">
          <button
            onClick={() => setImageModalOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
          <img
            src={guest.idProof.image.url}
            alt="ID Proof Full View"
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </>
  )
}

export default GuestDetailModal
