import React, { useState, useRef } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  Camera,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react'
import { motion } from 'framer-motion'
import ImageCropper from '@/components/ImageCropper/ImageCropper'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store/store'
import { toast } from 'sonner'
import { passwordUpdate } from '@/services/authApi'
import type { ServerErrorResponse } from '@/utils/serverErrorResponse'

// Zod Schemas
const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Types
type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

interface UserProfile extends ProfileFormData {
  role: 'receptionist' | 'housekeeper' | 'admin'
  profilePicture?: string
}

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)

  // State
  const [profile, setProfile] = useState<UserProfile>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    role: user?.role as 'receptionist' | 'housekeeper' | 'admin',
    profilePicture: undefined,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [showImageCropper, setShowImageCropper] = useState(false)
  const [tempImageSrc, setTempImageSrc] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // Error states
  const [profileError, setProfileError] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clear error functions
  const clearProfileError = () => {
    if (profileError) setProfileError('')
  }

  const clearPasswordError = () => {
    if (passwordError) setPasswordError('')
  }

  // React Hook Form for Profile
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
    },
  })

  // React Hook Form for Password
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  // Role configurations
  const roleConfig = {
    receptionist: { color: 'bg-blue-100 text-blue-800', label: 'Receptionist' },
    housekeeper: { color: 'bg-green-100 text-green-800', label: 'Housekeeper' },
    admin: { color: 'bg-purple-100 text-purple-800', label: 'Administrator' },
  }

  // Handlers
  const handleEditToggle = () => {
    if (isEditing) {
      resetProfile({
        fullName: profile.fullName,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
      })
      clearProfileError()
    }
    setIsEditing(!isEditing)
  }

  const onSubmitProfile: SubmitHandler<ProfileFormData> = async (data) => {
    setProfileError('') // Clear any previous errors
    setIsLoading(true)
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setProfile((prev) => ({ ...prev, ...data }))
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)

      // Assert the type of the error object
      const serverError = error as ServerErrorResponse

      if (
        serverError &&
        serverError.response &&
        serverError.response.data &&
        serverError.response.data.message
      ) {
        setProfileError(serverError.response.data.message)
      } else {
        // Fallback for other error types
        setProfileError('Failed to update profile. Please try again.')
      }
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePassword: SubmitHandler<PasswordFormData> = async (
    data
  ) => {
    setPasswordError('') // Clear any previous errors
    setIsLoading(true)
    try {
      await passwordSchema.parseAsync(data)
      const response = await passwordUpdate(data)
      if (response.success) {
        toast.success(response.message)
        setShowPasswordForm(false)
        resetPassword()
        setPasswordError('')
      } else {
        setPasswordError(response.message || 'Failed to update password')
        toast.error(response.message)
      }
    } catch (error) {
      console.error('Error found in update password:', error)

      // Assert the type of the error object
      const serverError = error as ServerErrorResponse

      if (
        serverError &&
        serverError.response &&
        serverError.response.data &&
        serverError.response.data.message
      ) {
        setPasswordError(serverError.response.data.message)
      } else {
        // Fallback for other error types
        setPasswordError('An unknown error occurred. Please try again.')
      }
      toast.error('Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  // Profile picture handlers
  const handleProfilePictureChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setTempImageSrc(e.target?.result as string)
        setShowImageCropper(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (croppedImage: string) => {
    setProfile((prev) => ({ ...prev, profilePicture: croppedImage }))
    setShowImageCropper(false)
    setTempImageSrc('')
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Profile Management
          </h1>
          <p className="text-gray-600">
            Manage your personal information and account settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture & Role Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center sticky top-8">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={48} className="text-primary-600" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-primary-600 text-white p-2 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
                >
                  <Camera size={16} />
                </button>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {profile.fullName}
              </h2>

              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                  roleConfig[profile.role].color
                }`}
              >
                <UserCheck size={14} className="mr-1" />
                {roleConfig[profile.role].label}
              </div>

              <div className="text-sm text-gray-500 space-y-1">
                <div className="flex items-center justify-center">
                  <Mail size={14} className="mr-2" />
                  {profile.email}
                </div>
                <div className="flex items-center justify-center">
                  <Phone size={14} className="mr-2" />
                  {profile.phoneNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Personal Information
                </h3>
                <button
                  onClick={handleEditToggle}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isEditing
                      ? 'text-gray-600 hover:text-gray-800 border border-gray-300'
                      : 'text-primary-600 hover:text-primary-700 border border-primary-300'
                  }`}
                >
                  {isEditing ? (
                    <X size={16} className="mr-2" />
                  ) : (
                    <Edit3 size={16} className="mr-2" />
                  )}
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {/* Profile Error Display */}
              {profileError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-sm text-red-600">{profileError}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          {...registerProfile('fullName', {
                            onChange: clearProfileError,
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                        {profileErrors.fullName && (
                          <p className="mt-1 text-sm text-red-600">
                            {profileErrors.fullName.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                        {profile.fullName}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <div
                      className={`px-4 py-3 rounded-lg ${
                        roleConfig[profile.role].color
                      } flex items-center`}
                    >
                      <UserCheck size={16} className="mr-2" />
                      {roleConfig[profile.role].label}
                      <span className="ml-auto text-xs">
                        (Cannot be changed)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <div>
                        <input
                          type="email"
                          {...registerProfile('email', {
                            onChange: clearProfileError,
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                        {profileErrors.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {profileErrors.email.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                        {profile.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <div>
                        <input
                          type="tel"
                          {...registerProfile('phoneNumber', {
                            onChange: clearProfileError,
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                        {profileErrors.phoneNumber && (
                          <p className="mt-1 text-sm text-red-600">
                            {profileErrors.phoneNumber.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                        {profile.phoneNumber}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end mt-6">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save size={16} className="mr-2" />
                      )}
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Password Change Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Change Password
                </h3>
                <button
                  onClick={() => {
                    setShowPasswordForm(!showPasswordForm)
                    if (!showPasswordForm) {
                      resetPassword()
                      clearPasswordError()
                    } else {
                      clearPasswordError()
                    }
                  }}
                  className="flex items-center px-4 py-2 text-primary-600 hover:text-primary-700 border border-primary-300 rounded-lg transition-colors"
                >
                  <Lock size={16} className="mr-2" />
                  {showPasswordForm ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {showPasswordForm && (
                <div>
                  {/* Password Error Display */}
                  {passwordError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <p className="text-sm text-red-600">{passwordError}</p>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmitPassword(handleUpdatePassword)}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            {...registerPassword('currentPassword', {
                              onChange: clearPasswordError,
                            })}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.current ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                        {passwordErrors.currentPassword && (
                          <p className="mt-1 text-sm text-red-600">
                            {passwordErrors.currentPassword.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            {...registerPassword('newPassword', {
                              onChange: clearPasswordError,
                            })}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.new ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                        {passwordErrors.newPassword && (
                          <p className="mt-1 text-sm text-red-600">
                            {passwordErrors.newPassword.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            {...registerPassword('confirmPassword', {
                              onChange: clearPasswordError,
                            })}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.confirm ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                        {passwordErrors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">
                            {passwordErrors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Lock size={16} className="mr-2" />
                          )}
                          {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleProfilePictureChange}
        className="hidden"
      />

      {/* Image Cropper Modal */}
      {showImageCropper && (
        <ImageCropper
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowImageCropper(false)
            setTempImageSrc('')
          }}
        />
      )}
    </div>
  )
}

export default Profile
