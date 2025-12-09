import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getUserById, type UserProfile } from '@/services/userApi'
import { toast } from 'sonner'
import ProfileInformation from '@/components/Profile/ProfileInformation'
import ChangePassword from '@/components/Profile/ChangePassword'
import AvatarUpload from '@/components/Profile/AvatarUpload'
import { User, Lock, Camera, Loader2 } from 'lucide-react'

type TabType = 'profile' | 'password' | 'avatar'

const Profile: React.FC = () => {

  const user = useSelector((state: any) => state.auth.user)
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        toast.error('User not authenticated')
        return
      }

      setIsLoading(true)
      try {
        const profileData = await getUserById(user.id)
        setProfile(profileData)
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user?.id])

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile)
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile Information', icon: User },
    { id: 'password' as TabType, label: 'Change Password', icon: Lock },
    { id: 'avatar' as TabType, label: 'Profile Picture', icon: Camera },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load profile</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {activeTab === 'profile' && (
            <ProfileInformation profile={profile} onProfileUpdate={handleProfileUpdate} />
          )}
          {activeTab === 'password' && <ChangePassword />}
          {activeTab === 'avatar' && (
            <AvatarUpload userId={profile._id} currentAvatar={profile.avatar} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
