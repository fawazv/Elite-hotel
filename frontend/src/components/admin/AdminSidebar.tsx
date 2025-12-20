import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store/store'
import {
  LayoutDashboard,
  Users,
  DoorClosed,
  CalendarCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  DollarSign,
  MessageSquare,
  Sparkles,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'receptionist', 'housekeeper'] },
  { to: '/admin/users', icon: Users, label: 'Users', roles: ['admin'] },
  { to: '/admin/guests', icon: UserCheck, label: 'Guests', roles: ['admin', 'receptionist'] },
  { to: '/admin/rooms', icon: DoorClosed, label: 'Rooms', roles: ['admin', 'receptionist', 'housekeeper'] },
  { to: '/admin/reservations', icon: CalendarCheck, label: 'Reservations', roles: ['admin', 'receptionist'] },
  { to: '/admin/billing', icon: DollarSign, label: 'Billing', roles: ['admin', 'receptionist'] },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments', roles: ['admin', 'receptionist'] },
  { to: '/admin/housekeeping', icon: Sparkles, label: 'Housekeeping', roles: ['admin', 'housekeeper', 'receptionist'] },
  { to: '/admin/communications', icon: MessageSquare, label: 'Communications', roles: ['admin', 'receptionist'] },
  { to: '/admin/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
]

const AdminSidebar = ({ isOpen, onToggle }: AdminSidebarProps) => {
  const { user } = useSelector((state: RootState) => state.auth)
  const userRole = user?.role?.toLowerCase() || 'admin'
  
  // Determine the base path prefix (e.g., /admin or /receptionist)
  // If the user is a receptionist, we use the /receptionist prefix. 
  // For admin (or others accessing admin view), keep /admin.
  const prefix = userRole === 'receptionist' ? '/receptionist' : '/admin'

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole))

  return (
    <aside
      className={cn(
        'bg-gray-900 text-white transition-all duration-300 ease-in-out relative',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        {isOpen && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Elite Hotel
          </h1>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors ml-auto"
          aria-label="Toggle sidebar"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        {filteredNavItems.map((item) => {
           // Replace '/admin' in the item.to with the dynamic prefix
           // e.g. /admin/dashboard -> /receptionist/dashboard
           const linkPath = item.to.replace('/admin', prefix)
           
           return (
          <NavLink
            key={item.to}
            to={linkPath}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all duration-200',
                'hover:bg-gray-800 group',
                isActive && 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg',
                !isOpen && 'justify-center'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={22}
                  className={cn(
                    'transition-colors',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  )}
                />
                {isOpen && (
                  <span
                    className={cn(
                      'font-medium transition-colors',
                      isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
           )
        })}
      </nav>

      {/* User Info at Bottom */}
      {isOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="text-sm text-gray-400">
            <p className="font-medium text-white">Admin Panel</p>
            <p>v1.0.0</p>
          </div>
        </div>
      )}
    </aside>
  )
}

export default AdminSidebar
