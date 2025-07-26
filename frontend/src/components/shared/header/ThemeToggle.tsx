import { Sun, Moon } from 'lucide-react'
import { toggleTheme } from '../../../redux/slices/themeSlice'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../../redux/store/store'

interface ThemeToggleProps {
  scrolled: boolean
}

const ThemeToggle = ({ scrolled }: ThemeToggleProps) => {
  const dispatch = useDispatch()
  const theme = useSelector((state: RootState) => state.theme.mode)

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 focus:ring-primary ${
        scrolled
          ? theme === 'dark'
            ? 'hover:bg-gray-800 text-gray-200'
            : 'hover:bg-gray-100 text-gray-800'
          : 'hover:bg-white/10 text-white'
      }`}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  )
}

export default ThemeToggle
