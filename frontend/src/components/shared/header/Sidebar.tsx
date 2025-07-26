import { useState, useEffect, useRef } from 'react'
import {
  Home,
  Building,
  Calendar,
  Info,
  Mail,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  ClipboardList,
  ChevronDown,
  X,
  Shield,
  Users,
  BarChart,
} from 'lucide-react'
import ProfileAvatar from './ProfileAvatar'
import AnimatedDropdown from './AnimatedDropdown'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../redux/store/store'

type SidebarProps = {
  open: boolean
  setOpen: (open: boolean) => void
  isAuthenticated: boolean
  logoutUser: () => Promise<void> | void
  isAdmin: boolean
  userName?: string
  profilePicture?: string
}

const Sidebar = ({
  open,
  setOpen,
  isAuthenticated,
  logoutUser,
  isAdmin,
  userName,
  profilePicture,
}: SidebarProps) => {
  const theme = useSelector((state: RootState) => state.theme.mode)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/rooms', label: 'Browse Rooms', icon: Building },
    { href: '/bookings', label: 'My Bookings', icon: Calendar },
    { href: '/about', label: 'About', icon: Info },
    { href: '/contact', label: 'Contact', icon: Mail },
  ]

  const adminItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart },
    { href: '/admin/users', label: 'User Management', icon: Users },
    {
      href: '/admin/bookings',
      label: 'Booking Management',
      icon: ClipboardList,
    },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [open, setOpen])

  // Close dropdowns when sidebar closes
  useEffect(() => {
    if (!open) {
      setDropdownOpen(false)
      setAdminDropdownOpen(false)
    }
  }, [open])

  return (
    <div
      ref={sidebarRef}
      className={`fixed top-0 right-0 h-full w-80 z-50 lg:hidden transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : 'translate-x-full'
      } ${
        theme === 'dark' ? 'bg-gray-900 border-l border-gray-800' : 'bg-white'
      } shadow-2xl overflow-y-auto`}
    >
      {/* Header */}
      <div
        className={`flex justify-between items-center p-6 border-b ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        }`}
      >
        <button onClick={() => setOpen(false)}>
          <span className="font-serif text-2xl font-bold text-primary">
            Elite Hotel
          </span>
        </button>
        <button
          onClick={() => setOpen(false)}
          className={`p-2 rounded-lg transition-colors focus:ring-primary ${
            theme === 'dark'
              ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
          }`}
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
      </div>

      {/* User Welcome */}
      {isAuthenticated && userName && (
        <div
          className={`m-6 p-4 rounded-xl ${
            theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-amber-50 border border-amber-200'
          }`}
        >
          <div className="flex items-center">
            <ProfileAvatar
              src={profilePicture}
              alt="Profile"
              size="w-12 h-12"
            />
            <div className="ml-3">
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Welcome back
              </p>
              <p className="font-medium text-primary">{userName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-6">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.href}>
                <button
                  onClick={() => setOpen(false)}
                  className={`w-full flex items-center py-3 px-4 rounded-lg transition-all hover:scale-105 focus:ring-primary ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-primary'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                  }`}
                >
                  <Icon size={18} className="mr-3" />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Admin Section */}
        {isAdmin && (
          <div className="mt-8">
            <h3
              className={`font-medium uppercase text-xs tracking-wider px-4 mb-3 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
              Admin Area
            </h3>

            <button
              className={`w-full flex items-center justify-between py-3 px-4 rounded-lg transition-all hover:scale-105 focus:ring-primary ${
                theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-800'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
              aria-expanded={adminDropdownOpen}
            >
              <div className="flex items-center">
                <Shield size={18} className="mr-3" />
                <span>Administration</span>
              </div>
              <ChevronDown
                className={`transition-transform duration-300 ${
                  adminDropdownOpen ? 'rotate-180' : ''
                }`}
                size={16}
              />
            </button>

            <AnimatedDropdown
              isOpen={adminDropdownOpen}
              className="mt-2 ml-4 pl-4 space-y-1 border-l-2 border-gray-300"
            >
              {adminItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      setAdminDropdownOpen(false)
                      setOpen(false)
                    }}
                    className={`w-full flex items-center py-2 px-4 rounded-lg transition-all focus:ring-primary ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-primary hover:bg-gray-800'
                        : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} className="mr-2" />
                    {item.label}
                  </button>
                )
              })}
            </AnimatedDropdown>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div
        className={`p-6 border-t mt-auto ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        }`}
      >
        {isAuthenticated ? (
          <div>
            <button
              className={`w-full flex items-center justify-between py-3 px-4 rounded-lg transition-all hover:scale-105 focus:ring-primary ${
                theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-800'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
            >
              <div className="flex items-center">
                <ProfileAvatar
                  src={profilePicture}
                  alt="Profile"
                  size="w-6 h-6"
                />
                <span className="ml-3">Account</span>
              </div>
              <ChevronDown
                className={`transition-transform duration-300 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
                size={16}
              />
            </button>

            <AnimatedDropdown
              isOpen={dropdownOpen}
              className="mt-2 ml-4 pl-4 space-y-1 border-l-2 border-gray-300"
            >
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  setOpen(false)
                }}
                className={`w-full flex items-center py-2 px-4 rounded-lg transition-all focus:ring-primary ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-primary hover:bg-gray-800'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
              >
                <User size={16} className="mr-2" />
                Profile
              </button>
              <button
                onClick={async () => {
                  setDropdownOpen(false)
                  setOpen(false)
                  await logoutUser()
                }}
                className="w-full flex items-center py-2 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-all focus:ring-2 focus:ring-red-500"
              >
                <LogOut size={16} className="mr-2" />
                Sign out
              </button>
            </AnimatedDropdown>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setOpen(false)}
              className={`w-full flex items-center justify-center py-3 px-4 border border-primary rounded-lg transition-all hover:scale-105 focus:ring-primary ${
                theme === 'dark'
                  ? 'text-primary hover:bg-gray-800'
                  : 'text-primary hover:bg-amber-50'
              }`}
            >
              <LogIn size={18} className="mr-2" />
              Sign In
            </button>
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center justify-center py-3 px-4 btn-primary rounded-lg hover:scale-105 focus:ring-primary"
            >
              <UserPlus size={18} className="mr-2" />
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar
