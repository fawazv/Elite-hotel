import type { ReactNode } from 'react'

interface AnimatedDropdownProps {
  isOpen: boolean
  children: ReactNode
  className?: string
}

const AnimatedDropdown = ({
  isOpen,
  children,
  className = '',
}: AnimatedDropdownProps) => {
  return (
    <div
      className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } ${className}`}
    >
      <div
        className={`transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : '-translate-y-2'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export default AnimatedDropdown
