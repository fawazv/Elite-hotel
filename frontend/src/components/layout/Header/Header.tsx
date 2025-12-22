// components/Header.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../../redux/store/store'
import { logout } from '../../../redux/slices/authSlice'
import MobileMenuButton from './MobileMenuButton'
import Sidebar from './Sidebar'
import NavButton from './NavButton'
import { NotificationBell } from '@/components/shared/NotificationBell'

const Header: React.FC = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  )
  
  console.log("Header User Data:", user)

  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Check if current route is home page
  const isHomePage = location.pathname === '/'

  // Determine if header should be in scrolled state
  const isScrolledState = !isHomePage || scrolled

  // Check if user is admin
  const isAdmin = user?.role === 'admin'

  // Optimize scroll handler with useCallback
  const handleScroll = useCallback(() => {
    // Only update scroll state on home page
    if (isHomePage) {
      setScrolled(window.scrollY > 10)
    }
  }, [isHomePage])

  const logoutUser = async () => {
    try {
      // Clear any stored tokens
      localStorage.removeItem('token')
      dispatch(logout())
      setDropdownOpen(false)
      // Show success message if you have a toast system
      console.log('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (dropdownOpen && !target.closest('.account-dropdown')) {
        setDropdownOpen(false)
      }
    }

    // Add scroll event listener only on home page
    if (isHomePage) {
      window.addEventListener('scroll', handleScroll)
    }

    // Add click outside listener
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside as EventListener)

    // Cleanup function
    return () => {
      if (isHomePage) {
        window.removeEventListener('scroll', handleScroll)
      }
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener(
        'touchstart',
        handleClickOutside as EventListener
      )
    }
  }, [dropdownOpen, handleScroll, isHomePage])

  // Reset scroll state when route changes
  useEffect(() => {
    if (!isHomePage) {
      setScrolled(false)
    }
  }, [isHomePage])

  return (
    <header
      className={`
        fixed top-0 w-full z-50 transition-all duration-300
        ${isScrolledState ? 'bg-white shadow-lg py-4' : 'bg-transparent py-4'}
      `}
    >
      <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center">
          <span
            className={`
              font-serif text-2xl font-bold transition-colors duration-200
              ${isScrolledState ? 'text-primary' : 'text-white'}
            `}
          >
            Elite Hotel
          </span>
        </Link>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <MobileMenuButton
            open={open}
            scrolled={isScrolledState}
            setOpen={setOpen}
          />
        </div>

        {/* Sidebar Overlay */}
        {open && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          open={open}
          setOpen={setOpen}
          isAuthenticated={isAuthenticated}
          onLogout={logoutUser}
          isAdmin={isAdmin}
          userName={user?.fullName}
          profilePicture={user?.avatar?.url || user?.profileImage || '/default-avatar.png'}
        />

        {/* Desktop Menu */}
        <nav className="hidden lg:flex gap-8 items-center">
          <NavButton href="/rooms" scrolled={isScrolledState}>
            Browse all rooms
          </NavButton>

          {user?.role && ['admin', 'receptionist', 'housekeeper'].includes(user.role) && (
            <NavButton 
              href={
                user.role === 'admin' ? '/admin/dashboard' : 
                user.role === 'receptionist' ? '/receptionist/dashboard' :
                user.role === 'housekeeper' ? '/housekeeper/dashboard' : '/'
              } 
              scrolled={isScrolledState}
            >
              Dashboard
            </NavButton>
          )}

          <NavButton href={isAuthenticated ? "/bookings" : "/find-booking"} scrolled={isScrolledState}>
            {isAuthenticated ? "My Bookings" : "Find Booking"}
          </NavButton>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <div className={isScrolledState ? "text-gray-600" : "text-white"}>
                <NotificationBell />
              </div>

              <div className="relative account-dropdown">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`
                  font-medium transition-colors flex items-center gap-2
                  ${
                    isScrolledState
                      ? 'text-gray-800  hover:text-primary'
                      : 'text-white hover:text-white/80'
                  }
                `}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={user?.avatar?.url || user?.profileImage || '/default-avatar.png'}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>{user?.fullName || 'User'}</span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transform transition-transform ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white  ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fade-in">
                  <Link
                    to="/account/profile"
                    className="block px-4 py-2 text-sm text-gray-700  hover:bg-gray-100 "
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    className="block px-4 py-2 text-sm text-gray-700  hover:bg-gray-100  w-full text-left cursor-pointer"
                    onClick={logoutUser}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/auth/signin"
                className={`
                  px-5 py-2 rounded-lg font-medium border transition-all duration-200
                  ${
                    isScrolledState
                      ? 'bg-white  text-primary border-primary hover:bg-gray-50'
                      : 'bg-white/5 text-white border border-white/30 backdrop-blur-sm hover:bg-white/20'
                  }
                `}
              >
                Sign In
              </Link>
              <Link
                to="/auth/signup"
                className="bg-primary-700 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-800 transition-colors duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
