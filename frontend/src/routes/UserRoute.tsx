// routes/UserRoute.tsx
import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'
import SnapScrollLayout from '../layouts/SnapScrollLayout'
import NotFound from '../pages/NotFound'
import SearchResults from '@/components/sections/SearchResult/SearchResult'
import Signup from '@/pages/Signup'
import OTPVerification from '@/pages/OtpVerification'

// Lazy load components for better performance
const Home = React.lazy(() => import('../pages/Home'))
// const Rooms = React.lazy(() => import('../pages/Rooms/Rooms'))
// const Bookings = React.lazy(() => import('../pages/Bookings/Bookings'))
// const About = React.lazy(() => import('../pages/About/About'))
// const Contact = React.lazy(() => import('../pages/Contact/Contact'))
// const SignIn = React.lazy(() => import('../pages/Auth/SignIn'))
// const SignUp = React.lazy(() => import('../pages/Auth/SignUp'))
// const Profile = React.lazy(() => import('../pages/Account/Profile'))
// const NotFound = React.lazy(() => import('../pages/NotFound/NotFound'))

const UserRoute: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Home route with snap scrolling */}
        <Route path="/" element={<SnapScrollLayout />}>
          <Route index element={<Home />} />
        </Route>

        {/* Main layout routes (with Header/Footer, no snap scrolling) */}
        <Route path="/" element={<MainLayout />}>
          {/* <Route path="rooms" element={<Rooms />} /> */}
          {/* <Route path="bookings" element={<Bookings />} /> */}
          {/* <Route path="about" element={<About />} /> */}
          {/* <Route path="contact" element={<Contact />} /> */}
          {/* <Route path="account/profile" element={<Profile />} /> */}
          <Route path="*" element={<NotFound />} />
          <Route path="/search-results" element={<SearchResults />} />
        </Route>

        {/* Auth layout routes (without Header/Footer) */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="signin" element={<>signin</>} />
          <Route path="signup" element={<Signup />} />
          <Route path="otp-verify" element={<OTPVerification />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default UserRoute
