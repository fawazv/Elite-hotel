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
const AdminGuests = React.lazy(() => import('@pages/Admin/Guests'))
const RoomDetail = React.lazy(() => import('@/pages/Admin/RoomDetail'))
const RoomForm = React.lazy(() => import('@/pages/Admin/RoomForm'))
const Billing = React.lazy(() => import('@/pages/Admin/Billing'))

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
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="rooms/new" element={<RoomForm />} />
            <Route path="rooms/edit/:id" element={<RoomForm />} />
            <Route path="rooms/:id" element={<RoomDetail />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="billing" element={<Billing />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="guests" element={<AdminGuests />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </AdminProtectedRoute>
  )
}

export default AdminRoute
