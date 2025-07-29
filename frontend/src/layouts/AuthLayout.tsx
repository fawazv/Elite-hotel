// layouts/AuthLayout.tsx
import React from 'react'
import { Outlet } from 'react-router-dom'

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  )
}

export default AuthLayout
