import { Route, Routes } from 'react-router-dom'
import { Suspense } from 'react'
import Home from '../pages/Home/Home'
// import NotFoundPage from '@/components/NotFound'
// import Loading from '@/components/Loading'

const UserRoute = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Suspense>
  )
}

export default UserRoute
