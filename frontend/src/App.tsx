import './index.css'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import UserRoute from './routes/UserRoute'
import { useSelector } from 'react-redux'
import type { RootState } from './redux/store/store'
import { useEffect } from 'react'

const App = () => {
  const theme = useSelector((state: RootState) => state.theme.mode)

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <Router>
      <div
        className={`App ${
          theme === 'dark'
            ? 'bg-darkBg text-darkText'
            : 'bg-lightBg text-lightText'
        }`}
      >
        <Routes>
          <Route path="/admin/*" element={<div>welcome to admin</div>} />
          <Route path="/*" element={<UserRoute />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
