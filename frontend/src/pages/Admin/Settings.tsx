import { Settings as SettingsIcon, Bell, Lock, Database } from 'lucide-react'

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage application settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <SettingsIcon className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">General</h2>
          </div>
          <p className="text-gray-600 text-sm">Configure general application settings</p>
          <button className="mt-4 text-blue-600 hover:underline text-sm font-medium">
            Manage →
          </button>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Bell className="text-green-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          </div>
          <p className="text-gray-600 text-sm">Configure notification preferences</p>
          <button className="mt-4 text-blue-600 hover:underline text-sm font-medium">
            Manage →
          </button>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Lock className="text-purple-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Security</h2>
          </div>
          <p className="text-gray-600 text-sm">Manage security and authentication settings</p>
          <button className="mt-4 text-blue-600 hover:underline text-sm font-medium">
            Manage →
          </button>
        </div>

        {/* Database */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Database className="text-orange-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Database</h2>
          </div>
          <p className="text-gray-600 text-sm">Database backup and maintenance</p>
          <button className="mt-4 text-blue-600 hover:underline text-sm font-medium">
            Manage →
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
