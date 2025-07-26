import { useSelector } from 'react-redux'
import type { RootState } from '../../../redux/store/store'

import type { ReactNode, MouseEventHandler } from 'react'

interface NavButtonProps {
  href?: string
  children: ReactNode
  scrolled?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NavButton = ({ href, children, scrolled, onClick }: NavButtonProps) => {
  const theme = useSelector((state: RootState) => state.theme.mode)

  const baseClasses =
    'font-medium transition-all duration-300 hover:scale-105 focus:ring-primary'
  const colorClasses = scrolled
    ? theme === 'dark'
      ? 'text-gray-200 hover:text-primary'
      : 'text-gray-800 hover:text-primary'
    : 'text-white hover:text-white/80'

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${colorClasses} relative group`}
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
    </button>
  )
}

export default NavButton
