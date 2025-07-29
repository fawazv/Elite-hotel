// pages/Home.tsx (Updated to work with Outlet context)
import React from 'react'
import { useMainLayoutContext } from '../Hooks/useMainLayoutContext'
import Hero from '../components/sections/Hero/Hero'
import About from '../components/sections/About/About'
import Services from '../components/sections/Services/Services'
import Contact from '../components/sections/Contact/Contact'
import FeaturedRoomsCarousel from '../components/sections/FeaturedRooms/FeaturedRooms'

const Home: React.FC = () => {
  const { addToRefs } = useMainLayoutContext()

  return (
    <>
      {/* Hero Section */}
      <div
        ref={addToRefs}
        className="h-screen relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
      >
        <Hero />
      </div>

      {/* About Section */}
      <div
        ref={addToRefs}
        className="h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8"
      >
        <About />
      </div>

      {/* FeaturedRooms Section */}
      <div
        ref={addToRefs}
        className="h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8"
      >
        <FeaturedRoomsCarousel />
      </div>

      {/* Services Section */}
      <div
        ref={addToRefs}
        className="h-screen flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8"
      >
        <Services />
      </div>

      {/* Contact Section */}
      <div
        ref={addToRefs}
        className="h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8"
      >
        <Contact />
      </div>
    </>
  )
}

export default Home
