// routes/UserRoute.tsx

import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import LoadingSpinner from '../components/ui/LoadingSpinner'

// Lazy load components for better performance
const Home = React.lazy(() => import('../pages/Home/Home'))
// const Rooms = React.lazy(() => import('../pages/Rooms/Rooms'));
// const Bookings = React.lazy(() => import('../pages/Bookings/Bookings'));
// const About = React.lazy(() => import('../pages/About/About'));
// const Contact = React.lazy(() => import('../pages/Contact/Contact'));
// const SignIn = React.lazy(() => import('../pages/Auth/SignIn'));
// const SignUp = React.lazy(() => import('../pages/Auth/SignUp'));
// const Profile = React.lazy(() => import('../pages/Account/Profile'));
// const NotFound = React.lazy(() => import('../pages/NotFound/NotFound'));

const UserRoute: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/rooms" element={<Rooms />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/account/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Suspense>
  )
}

export default UserRoute
