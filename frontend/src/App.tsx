// App.tsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import UserRoute from './routes/UserRoute'
import AdminRoute from './routes/AdminRoute'

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-white transition-colors duration-300">
        <Routes>
          <Route path="/admin/*" element={<AdminRoute />} />
          <Route path="/*" element={<UserRoute />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
