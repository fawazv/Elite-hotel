import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminLayout from '@/layouts/AdminLayout'
import AdminProtectedRoute from '@/layouts/AdminProtectedRoute'

// Lazy load admin components
const Dashboard = React.lazy(() => import('@pages/Admin/Dashboard'))
const AdminRooms = React.lazy(() => import('@pages/Admin/Rooms'))
const AdminReservations = React.lazy(() => import('@pages/Admin/Reservations'))
const AdminUsers = React.lazy(() => import('@pages/Admin/Users'))
const AdminSettings = React.lazy(() => import('@pages/Admin/Settings'))

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

const AdminRoute: React.FC = () => {
  return (
    <AdminProtectedRoute>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/rooms" element={<AdminRooms />} />
            <Route path="/reservations" element={<AdminReservations />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </AdminProtectedRoute>
  )
}

export default AdminRoute
