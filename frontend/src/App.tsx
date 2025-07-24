import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/admin/*" element={<h1>Welcome to Admin Route</h1>} />
          <Route path="/*" element={<h2>user</h2>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
