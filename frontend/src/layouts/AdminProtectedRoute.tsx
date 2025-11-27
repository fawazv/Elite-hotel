import type { RootState } from '@/redux/store/store'
import type { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

interface AdminProtectedRouteProps {
  children: ReactNode
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  // Check if user has admin role
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default AdminProtectedRoute
