// pages/Home/Home.tsx
import React, { useEffect, useRef, useCallback } from 'react'
import Header from '../components/layout/Header/Header'
import Hero from '../components/sections/Hero/Hero'
import Footer from '../components/layout/Footer/Footer'

const Home: React.FC = () => {
  const sections = useRef<HTMLElement[]>([])
  const isScrollingRef = useRef(false)

  const handleScroll = useCallback((event: WheelEvent) => {
    event.preventDefault()

    if (isScrollingRef.current) return
    isScrollingRef.current = true

    const direction = event.deltaY > 0 ? 1 : -1
    const viewportHeight = window.innerHeight

    const currentSectionIndex = sections.current.findIndex((section) => {
      if (!section) return false
      const rect = section.getBoundingClientRect()
      return rect.top >= -viewportHeight / 2 && rect.top <= viewportHeight / 2
    })

    const nextIndex = Math.min(
      Math.max(0, currentSectionIndex + direction),
      sections.current.length - 1
    )

    if (sections.current[nextIndex]) {
      sections.current[nextIndex].scrollIntoView({ behavior: 'smooth' })
    }

    setTimeout(() => {
      isScrollingRef.current = false
    }, 800)
  }, [])

  useEffect(() => {
    const wheelHandler = (e: WheelEvent) => handleScroll(e)
    window.addEventListener('wheel', wheelHandler, { passive: false })

    return () => window.removeEventListener('wheel', wheelHandler)
  }, [handleScroll])

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !sections.current.includes(el)) {
      sections.current.push(el)
    }
  }

  return (
    <div className="min-h-screen bg-white transition-colors duration-300">
      <div
        ref={addToRefs}
        className="h-screen relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 "
      >
        <Header />
        <Hero />
      </div>

      {/* About Section */}
      <div
        ref={addToRefs}
        className="h-screen flex items-center justify-center bg-gray-50  px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Luxury Redefined
            </h2>
            <p className="text-lg text-gray-600  mb-6 leading-relaxed">
              At Elite Hotel, we believe that every guest deserves an
              extraordinary experience. Our commitment to excellence shines
              through in every detail, from our elegantly appointed rooms to our
              personalized service.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-gray-700 ">5-Star Service</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-gray-700 ">Premium Amenities</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-gray-700 ">Prime Location</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-gray-700 ">24/7 Concierge</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              src="/Hero2.avif"
              alt="Hotel Lobby"
              className="rounded-2xl shadow-2xl w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div
        ref={addToRefs}
        className="h-screen flex items-center justify-center bg-white  px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900  mb-12">
            Our Services
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-gray-50 -800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900  mb-4">
                Luxury Rooms
              </h3>
              <p className="text-gray-600 ">
                Spacious and elegantly designed rooms with modern amenities and
                stunning city views.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gray-50  hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900  mb-4">
                Fine Dining
              </h3>
              <p className="text-gray-600 ">
                Award-winning restaurants serving exquisite cuisine from around
                the world.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gray-50  hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900  mb-4">
                Spa & Wellness
              </h3>
              <p className="text-gray-600 ">
                Rejuvenate your body and mind with our world-class spa and
                wellness facilities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div
        ref={addToRefs}
        className="h-screen flex items-center justify-center bg-gray-50  px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900  mb-8">
            Ready to Experience Luxury?
          </h2>
          <p className="text-xl text-gray-600  mb-12 leading-relaxed">
            Book your stay with us today and discover what makes Elite Hotel the
            perfect choice for discerning travelers.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
              Book Now
            </button>
            <button className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105">
              Contact Us
            </button>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h4 className="font-semibold text-gray-900  mb-2">Phone</h4>
              <p className="text-gray-600 ">+1 (555) 123-4567</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900  mb-2">Email</h4>
              <p className="text-gray-600 ">info@elitehotel.com</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900  mb-2">Address</h4>
              <p className="text-gray-600 ">123 Luxury Ave, City Center</p>
            </div>
          </div>
        </div>
      </div>
      <div
        ref={addToRefs}
        className="h-screen relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bottom-0"
      >
        <Footer />
      </div>
    </div>
  )
}

export default Home
