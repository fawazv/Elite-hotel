// // routes/AdminRoute.tsx
// import React, { Suspense } from 'react'
// import { Routes, Route } from 'react-router-dom'
// import LoadingSpinner from '../components/ui/LoadingSpinner'

// // Lazy load admin components
// const AdminDashboard = React.lazy(() => import('../pages/Admin/Dashboard'))
// const AdminUsers = React.lazy(() => import('../pages/Admin/Users'))
// const AdminBookings = React.lazy(() => import('../pages/Admin/Bookings'))
// const AdminSettings = React.lazy(() => import('../pages/Admin/Settings'))

// const AdminRoute: React.FC = () => {
//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//       <Suspense fallback={<LoadingSpinner />}>
//         <Routes>
//           <Route path="/" element={<AdminDashboard />} />
//           <Route path="/dashboard" element={<AdminDashboard />} />
//           <Route path="/users" element={<AdminUsers />} />
//           <Route path="/bookings" element={<AdminBookings />} />
//           <Route path="/settings" element={<AdminSettings />} />
//         </Routes>
//       </Suspense>
//     </div>
//   )
// }

// export default AdminRoute
