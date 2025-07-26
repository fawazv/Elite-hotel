// components/ui/ThemeToggle.tsx
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { ThemeToggleProps } from '../../../types'
import type { RootState } from '../../../redux/store/store'
import { toggleTheme } from '../../../redux/slices/themeSlice'

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const dispatch = useDispatch()
  const theme = useSelector((state: RootState) => state.theme.mode)

  const handleToggle = () => {
    dispatch(toggleTheme())
  }

  return (
    <button
      onClick={handleToggle}
      className={`
        relative inline-flex h-8 w-14 items-center justify-center rounded-full
        bg-gray-200 dark:bg-gray-700 transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        hover:bg-gray-300 dark:hover:bg-gray-600
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span
        className={`
          absolute left-1 h-6 w-6 transform rounded-full
          bg-white shadow-lg transition-transform duration-200 ease-in-out
          flex items-center justify-center
          ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}
        `}
      >
        {theme === 'light' ? (
          <svg
            className="h-4 w-4 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="h-4 w-4 text-blue-300"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </span>
    </button>
  )
}

export default ThemeToggle
