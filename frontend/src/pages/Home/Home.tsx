import { useEffect, useRef, useCallback } from 'react'
import { Building, Settings, Calendar, Mail } from 'lucide-react'
import Header from '../../components/Header'
import { useSelector } from 'react-redux'
import type { RootState } from '../../redux/store/store'

const Home = () => {
  const theme = useSelector((state: RootState) => state.theme.mode)

  const sections = useRef<HTMLElement[]>([])
  const isScrollingRef = useRef(false)

  const handleScroll = useCallback((event: { deltaY: number }) => {
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
    window.addEventListener('wheel', handleScroll, { passive: false })
    return () => window.removeEventListener('wheel', handleScroll)
  }, [handleScroll])

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !sections.current.includes(el)) {
      sections.current.push(el)
    }
  }

  const heroSectionBg =
    theme === 'dark'
      ? 'bg-gradient-to-br from-gray-900 via-amber-900 to-yellow-900'
      : 'bg-gradient-to-br from-amber-600 via-orange-600 to-red-600'

  const sectionBg =
    theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Hero Section */}
      <div
        ref={addToRefs}
        className={`min-h-screen flex items-center justify-center relative overflow-hidden ${heroSectionBg}`}
      >
        <Header />
        <div className="text-center text-white z-10 px-4 max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-serif font-bold mb-6 animate-fade-in">
            Elite Hotel
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
            Experience luxury redefined with breathtaking views and unparalleled
            service in the heart of elegance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="btn-primary px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 shadow-2xl">
              Discover More
            </button>
            <button className="bg-white/10 backdrop-blur-sm text-white border border-white/30 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105">
              View Rooms
            </button>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-overlay filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-orange-300 rounded-full mix-blend-overlay filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2 opacity-75">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/75 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div
        ref={addToRefs}
        className={`min-h-screen flex items-center justify-center ${sectionBg} transition-colors duration-300`}
      >
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8 text-primary">
            About Our Hotel
          </h2>
          <p className="text-xl md:text-2xl leading-relaxed mb-12 opacity-80 max-w-4xl mx-auto">
            Nestled in the heart of luxury, Elite Hotel offers an unmatched
            experience of comfort and elegance. Our world-class amenities and
            personalized service ensure every moment of your stay is
            extraordinary.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div
              className={`p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border border-gray-700'
                  : 'bg-amber-50 border border-amber-200'
              }`}
            >
              <Building size={64} className="mx-auto mb-6 text-primary" />
              <h3 className="text-2xl font-semibold mb-4 text-primary">
                Luxury Rooms
              </h3>
              <p className="opacity-70 text-lg">
                Spacious rooms with premium amenities and stunning city views
              </p>
            </div>

            <div
              className={`p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border border-gray-700'
                  : 'bg-amber-50 border border-amber-200'
              }`}
            >
              <Settings size={64} className="mx-auto mb-6 text-primary" />
              <h3 className="text-2xl font-semibold mb-4 text-primary">
                Premium Service
              </h3>
              <p className="opacity-70 text-lg">
                24/7 concierge and room service for your ultimate comfort
              </p>
            </div>

            <div
              className={`p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border border-gray-700'
                  : 'bg-amber-50 border border-amber-200'
              }`}
            >
              <Calendar size={64} className="mx-auto mb-6 text-primary" />
              <h3 className="text-2xl font-semibold mb-4 text-primary">
                Easy Booking
              </h3>
              <p className="opacity-70 text-lg">
                Seamless reservation experience with instant confirmation
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 shadow-lg">
              Learn More
            </button>
            <button
              className={`px-8 py-4 rounded-full font-semibold text-lg border-2 border-primary transition-all duration-300 hover:scale-105 ${
                theme === 'dark'
                  ? 'text-primary hover:bg-gray-800'
                  : 'text-primary hover:bg-amber-50'
              }`}
            >
              View Gallery
            </button>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div
        ref={addToRefs}
        className={`min-h-screen flex items-center justify-center ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-gray-800 to-gray-900'
            : 'bg-gradient-to-br from-gray-50 to-gray-100'
        } transition-colors duration-300`}
      >
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2
            className={`text-5xl md:text-6xl font-serif font-bold mb-8 text-primary`}
          >
            Our Services
          </h2>
          <p
            className={`text-xl md:text-2xl leading-relaxed mb-12 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            } max-w-4xl mx-auto`}
          >
            Discover the exceptional services that make your stay unforgettable
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                title: 'Spa & Wellness',
                desc: 'Rejuvenate your mind and body',
              },
              { title: 'Fine Dining', desc: 'Exquisite culinary experiences' },
              {
                title: 'Event Spaces',
                desc: 'Perfect venues for any occasion',
              },
              {
                title: 'Business Center',
                desc: 'Professional meeting facilities',
              },
            ].map((service, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border border-gray-700'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">
                  {service.title}
                </h3>
                <p
                  className={`${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div
        ref={addToRefs}
        className={`min-h-screen flex items-center justify-center ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-amber-900 via-orange-900 to-red-900'
            : 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500'
        } transition-colors duration-300`}
      >
        <div className="max-w-5xl mx-auto px-4 text-center text-white">
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8">
            Get In Touch
          </h2>
          <p className="text-xl md:text-2xl leading-relaxed mb-12 opacity-90 max-w-3xl mx-auto">
            Ready to experience luxury? Contact us today to make your
            reservation and begin your journey of elegance.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="opacity-80">info@elitehotel.com</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="opacity-80">+1 (555) 123-4567</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p className="opacity-80">123 Luxury Ave, City Center</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-white text-amber-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-2xl">
              <Mail size={20} className="inline mr-2" />
              Contact Us
            </button>
            <button className="bg-white/10 backdrop-blur-sm text-white border border-white/30 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <Calendar size={20} className="inline mr-2" />
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
