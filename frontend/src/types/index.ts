// types/index.ts
export interface User {
  id: string
  fullName: string
  email: string
  profileImage?: string
  role?: 'user' | 'admin'
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export interface ThemeState {
  mode: 'light' | 'dark'
}

export interface RootState {
  auth: AuthState
  theme: ThemeState
}

export interface HeaderProps {
  user?: User | null
  isAuthenticated?: boolean
  onLogout?: () => Promise<void>
}

export interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
  isAuthenticated: boolean
  isAdmin?: boolean
  onLogout: () => Promise<void>
  userName?: string
  profilePicture?: string
}

export interface NavButtonProps {
  href: string
  children: React.ReactNode
  scrolled: boolean
  onClick?: () => void
}

export interface MobileMenuButtonProps {
  open: boolean
  setOpen: (open: boolean) => void
  scrolled: boolean
}

export interface ThemeToggleProps {
  className?: string
}

export interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}
