// App.tsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import UserRoute from './routes/UserRoute'
import AdminRoute from './routes/AdminRoute'
import { ChatbotProvider } from './contexts/ChatbotContext'
import ChatbotWidget from './components/common/ChatbotWidget'
import './i18n/config'

const App: React.FC = () => {
  return (
    <ChatbotProvider>
      <Router>
        <div className="min-h-screen bg-white transition-colors duration-300">
          <Routes>
            <Route path="/admin/*" element={<AdminRoute />} />
            <Route path="/*" element={<UserRoute />} />
          </Routes>
          
          {/* Global Chatbot Widget */}
          <ChatbotWidget />
        </div>
      </Router>
    </ChatbotProvider>
  )
}

export default App
