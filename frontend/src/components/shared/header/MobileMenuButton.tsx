import React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../redux/store/store'

interface MobileMenuButtonProps {
  scrolled: boolean
  open: boolean
  setOpen: (open: boolean) => void
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({
  scrolled,
  open,
  setOpen,
}) => {
  const theme = useSelector((state: RootState) => state.theme.mode)

  const lineColor = open
    ? theme === 'dark'
      ? 'bg-gray-200'
      : 'bg-gray-800'
    : scrolled
    ? theme === 'dark'
      ? 'bg-gray-200'
      : 'bg-gray-800'
    : 'bg-white'

  return (
    <button
      onClick={() => setOpen(!open)}
      className="lg:hidden focus:outline-none z-50 p-2 rounded-lg hover:bg-white/10 transition-colors focus:ring-primary"
      aria-label="Toggle menu"
    >
      <div className="w-6 h-6 flex flex-col justify-center space-y-1">
        <span
          className={`block w-full h-0.5 transform transition-all duration-300 ${
            open ? 'rotate-45 translate-y-1.5' : ''
          } ${lineColor}`}
        ></span>
        <span
          className={`block w-full h-0.5 transition-all duration-300 ${
            open ? 'opacity-0' : 'opacity-100'
          } ${lineColor}`}
        ></span>
        <span
          className={`block w-full h-0.5 transform transition-all duration-300 ${
            open ? '-rotate-45 -translate-y-1.5' : ''
          } ${lineColor}`}
        ></span>
      </div>
    </button>
  )
}

export default MobileMenuButton
