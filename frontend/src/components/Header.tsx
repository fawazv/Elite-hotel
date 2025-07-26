import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, LogOut, User } from 'lucide-react'
import MobileMenuButton from './shared/header/MobileMenuButton'
import ProfileAvatar from './shared/header/ProfileAvatar'
import { useSelector } from 'react-redux'
import type { RootState } from '../redux/store/store'
import ThemeToggle from './shared/header/ThemeToggle'
import Sidebar from './shared/header/Sidebar'
import NavButton from './shared/header/NavButton'
import AnimatedDropdown from './shared/header/AnimatedDropdown'

const Header = () => {
  const theme = useSelector((state: RootState) => state.theme.mode)

  // Mock data - replace with your actual Redux state
  const user = {
    fullName: 'John Doe',
    profileImage: '/api/placeholder/40/40',
  }
  const isAuthenticated = true
  const isAdmin = true

  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 10)
  }, [])

  const logoutUser = async () => {
    console.log('Logout triggered')
    setDropdownOpen(false)
    // Add your logout logic here
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (dropdownOpen && !target.closest('.account-dropdown')) {
        setDropdownOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen, handleScroll])

  const headerBg = scrolled
    ? theme === 'dark'
      ? 'bg-gray-900/95 backdrop-blur-lg shadow-2xl border-b border-gray-800'
      : 'bg-white/95 backdrop-blur-lg shadow-2xl'
    : 'bg-transparent'

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${headerBg} py-2`}
    >
      <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <button className="flex items-center group">
            <span
              className={`font-serif text-2xl font-bold transition-all duration-300 group-hover:scale-105 ${
                scrolled ? 'text-primary' : 'text-white'
              }`}
            >
              Elite Hotel
            </span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-2 lg:hidden">
          <ThemeToggle scrolled={scrolled} />
          <MobileMenuButton open={open} scrolled={scrolled} setOpen={setOpen} />
        </div>

        {/* Sidebar Overlay */}
        {open && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          open={open}
          setOpen={setOpen}
          isAuthenticated={isAuthenticated}
          logoutUser={logoutUser}
          isAdmin={isAdmin}
          userName={user?.fullName}
          profilePicture={user?.profileImage}
        />

        {/* Desktop Menu */}
        <nav className="hidden lg:flex gap-6 items-center">
          <NavButton href="/rooms" scrolled={scrolled}>
            Browse Rooms
          </NavButton>
          {isAdmin && (
            <NavButton href="/admin" scrolled={scrolled}>
              Admin
            </NavButton>
          )}
          <NavButton href="/bookings" scrolled={scrolled}>
            My Bookings
          </NavButton>

          <ThemeToggle scrolled={scrolled} />

          {isAuthenticated ? (
            <div className="relative account-dropdown">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 hover:scale-105 focus:ring-primary ${
                  scrolled
                    ? theme === 'dark'
                      ? 'hover:bg-gray-800 text-gray-200'
                      : 'hover:bg-gray-100 text-gray-800'
                    : 'hover:bg-white/10 text-white'
                }`}
                aria-expanded={dropdownOpen}
              >
                <ProfileAvatar src={user?.profileImage} alt="Profile" />
                <span className="font-medium">{user?.fullName}</span>
                <ChevronDown
                  className={`transition-transform duration-300 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                  size={16}
                />
              </button>

              <AnimatedDropdown
                isOpen={dropdownOpen}
                className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl py-2 ring-1 ring-black/5 z-50 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white'
                }`}
              >
                <button
                  className={`w-full text-left px-4 py-3 text-sm transition-colors focus:ring-primary ${
                    theme === 'dark'
                      ? 'text-gray-200 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={16} className="inline mr-2" />
                  Profile
                </button>
                <button
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors focus:ring-2 focus:ring-red-500"
                  onClick={logoutUser}
                >
                  <LogOut size={16} className="inline mr-2" />
                  Sign out
                </button>
              </AnimatedDropdown>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                className={`px-6 py-2 rounded-lg font-medium border transition-all duration-300 hover:scale-105 focus:ring-primary ${
                  scrolled
                    ? theme === 'dark'
                      ? 'bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                    : 'bg-white/10 text-white border-white/30 backdrop-blur-sm hover:bg-white/20'
                }`}
              >
                Sign In
              </button>
              <button className="btn-primary px-6 py-2 rounded-lg font-medium hover:scale-105 focus:ring-primary shadow-lg">
                Sign Up
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
