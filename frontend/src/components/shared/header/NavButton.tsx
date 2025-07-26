// components/ui/NavButton.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import type { NavButtonProps } from '../../../types'

const NavButton: React.FC<NavButtonProps> = ({
  href,
  children,
  scrolled,
  onClick,
}) => {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={`
        font-medium transition-colors duration-200 hover:scale-105 transform
        ${
          scrolled
            ? 'text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary'
            : 'text-white hover:text-white/80'
        }
      `}
    >
      {children}
    </Link>
  )
}

export default NavButton
