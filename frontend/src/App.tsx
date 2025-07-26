// App.tsx
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from './redux/store/store'
import UserRoute from './routes/UserRoute'
// import AdminRoute from './routes/AdminRoute';

const App: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.mode)

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
  }, [theme])

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <Routes>
          {/* <Route path="/admin/*" element={<AdminRoute />} /> */}
          <Route path="/*" element={<UserRoute />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
