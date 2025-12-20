import { useState, useEffect } from 'react'
import { X, User, Upload } from 'lucide-react'
import { createGuest, updateGuest, type Guest } from '@/services/guestApi'

interface GuestFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  guest?: Guest | null
}

const GuestFormModal = ({ isOpen, onClose, onSuccess, guest }: GuestFormModalProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    status: 'Standard' as 'Standard' | 'VIP' | 'Loyalty',
    idProofType: '',
    idProofNumber: '',
    notes: '',
  })
  const [idCardFile, setIdCardFile] = useState<File | null>(null)
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (guest) {
      setFormData({
        firstName: guest.firstName || '',
        lastName: guest.lastName || '',
        email: guest.email || '',
        phoneNumber: guest.phoneNumber || '',
        dateOfBirth: '',
        status: guest.status || 'Standard',
        idProofType: guest.idProof?.type || '',
        idProofNumber: guest.idProof?.number || '',
        notes: guest.notes || '',
      })
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        status: 'Standard',
        idProofType: '',
        idProofNumber: '',
        notes: '',
      })
      setIdCardFile(null)
      setIdCardPreview(null)
    }
  }, [guest, isOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIdCardFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setIdCardPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFile = () => {
    setIdCardFile(null)
    setIdCardPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (guest) {
        // Edit mode - use JSON for text updates
        const payload: any = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          status: formData.status,
          notes: formData.notes,
        }

        // Include ID proof details if provided
        if (formData.idProofType || formData.idProofNumber) {
          payload.idProof = {
            type: formData.idProofType,
            number: formData.idProofNumber,
          }
        }

        // Parallel requests: Update details + Update image (if new file selected)
        const promises = [updateGuest(guest._id, payload)]
        
        if (idCardFile) {
          // Temporarily bypassing type check since we just added the function
          const { updateGuestIdProofImage } = await import('@/services/guestApi')
          promises.push(updateGuestIdProofImage(guest._id, idCardFile))
        }

        await Promise.all(promises)
      } else {
        // Create mode - use FormData for everything
        const formDataToSend = new FormData()
        formDataToSend.append('firstName', formData.firstName)
        if (formData.lastName) formDataToSend.append('lastName', formData.lastName)
        if (formData.email) formDataToSend.append('email', formData.email)
        formDataToSend.append('phoneNumber', formData.phoneNumber)
        formDataToSend.append('status', formData.status)
        if (formData.notes) formDataToSend.append('notes', formData.notes)
        
        if (formData.idProofType || formData.idProofNumber) {
          formDataToSend.append('idProof[type]', formData.idProofType)
          formDataToSend.append('idProof[number]', formData.idProofNumber)
        }

        if (idCardFile) {
          formDataToSend.append('idProofImage', idCardFile)
        }

        await createGuest(formDataToSend)
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error saving guest:', err)
      setError(err.response?.data?.message || 'Failed to save guest')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="text-blue-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {guest ? 'Edit Guest' : 'Add New Guest'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Personal Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guest Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Standard">Standard</option>
              <option value="VIP">VIP</option>
              <option value="Loyalty">Loyalty</option>
            </select>
          </div>

          {/* ID Proof */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Proof Type
              </label>
              <select
                value={formData.idProofType}
                onChange={(e) => setFormData({ ...formData, idProofType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Type</option>
                <option value="Passport">Passport</option>
                <option value="NationalID">National ID</option>
                <option value="DrivingLicense">Driving License</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Number
              </label>
              <input
                type="text"
                value={formData.idProofNumber}
                onChange={(e) => setFormData({ ...formData, idProofNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* ID Card Image Upload (Visible for both Add and Edit) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Card Image
            </label>
              {!idCardPreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="id-card-upload"
                  />
                  <label htmlFor="id-card-upload" className="cursor-pointer">
                    <Upload className="mx-auto text-gray-400 mb-2" size={48} />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 10MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={idCardPreview}
                    alt="ID Card Preview"
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>


          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : guest ? 'Update Guest' : 'Add Guest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GuestFormModal
