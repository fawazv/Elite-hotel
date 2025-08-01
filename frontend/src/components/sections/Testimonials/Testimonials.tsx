import React, { useState, useEffect, useCallback } from 'react'

// TypeScript interfaces
interface Testimonial {
  id: number
  name: string
  position: string
  image: string
  quote: string
  rating: number
  location?: string
  date?: string
}

interface TestimonialsProps {
  autoPlay?: boolean
  autoPlayInterval?: number
  showDots?: boolean
  showNavigation?: boolean
  customTestimonials?: Testimonial[]
}

const defaultTestimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    position: 'Business Traveler',
    image:
      'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    quote:
      'The Elite Hotel exceeded all my expectations. The rooms are spacious and elegant, and the staff went above and beyond to accommodate my needs during my business trip.',
    rating: 5,
    location: 'New York, NY',
    date: 'March 2024',
  },
  {
    id: 2,
    name: 'Michael Chen',
    position: 'Family Vacation',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    quote:
      "We stayed in the family suite and it was perfect! The kids loved the pool, and the breakfast buffet had something for everyone. We'll definitely be coming back.",
    rating: 5,
    location: 'Los Angeles, CA',
    date: 'February 2024',
  },
  {
    id: 3,
    name: 'Emma Davis',
    position: 'Honeymoon Stay',
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    quote:
      'Our honeymoon at Elite Hotel was absolutely magical. The beach view suite was stunning, and the special touches like champagne made our stay unforgettable.',
    rating: 5,
    location: 'Miami Beach, FL',
    date: 'January 2024',
  },
  {
    id: 4,
    name: 'James Wilson',
    position: 'Corporate Event',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    quote:
      'We hosted our annual company retreat here and everything was flawless. The meeting facilities are state-of-the-art, and the catering was exceptional.',
    rating: 5,
    location: 'Chicago, IL',
    date: 'December 2023',
  },
  {
    id: 5,
    name: 'Lisa Rodriguez',
    position: 'Anniversary Celebration',
    image:
      'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
    quote:
      'Celebrating our 25th anniversary here was the perfect choice. The spa treatments were divine, and the attention to detail made us feel like royalty.',
    rating: 5,
    location: 'San Francisco, CA',
    date: 'November 2023',
  },
]

const Testimonials: React.FC<TestimonialsProps> = ({
  autoPlay = true,
  autoPlayInterval = 4000,
  showDots = true,
  showNavigation = true,
  customTestimonials,
}) => {
  const testimonials = customTestimonials || defaultTestimonials
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [progress, setProgress] = useState(0)

  const goToNext = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveIndex((current) =>
      current === testimonials.length - 1 ? 0 : current + 1
    )
    setTimeout(() => setIsAnimating(false), 600)
  }, [isAnimating, testimonials.length])

  const goToPrev = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveIndex((current) =>
      current === 0 ? testimonials.length - 1 : current - 1
    )
    setTimeout(() => setIsAnimating(false), 600)
  }, [isAnimating, testimonials.length])

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating || index === activeIndex) return
      setIsAnimating(true)
      setActiveIndex(index)
      setTimeout(() => setIsAnimating(false), 600)
    },
    [isAnimating, activeIndex]
  )

  // Auto-play functionality with progress tracking
  useEffect(() => {
    if (!autoPlay) {
      setProgress(100)
      return
    }

    setProgress(0)
    let startTime = Date.now()

    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const newProgress = (elapsed / autoPlayInterval) * 100

      if (newProgress >= 100) {
        setActiveIndex((current) =>
          current === testimonials.length - 1 ? 0 : current + 1
        )
        startTime = Date.now()
        setProgress(0)
      } else {
        setProgress(newProgress)
      }
    }

    const progressInterval = setInterval(updateProgress, 50)
    return () => clearInterval(progressInterval)
  }, [autoPlay, autoPlayInterval, testimonials.length, activeIndex])

  const renderStars = useCallback((rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <svg
        key={index}
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={index < rating ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-all duration-300 ${
          index < rating ? 'text-yellow-400 scale-110' : 'text-gray-300'
        }`}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    ))
  }, [])

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>, name: string) => {
      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name
      )}&size=150&background=3b82f6&color=ffffff&bold=true`
    },
    []
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50 to-indigo-100 flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 text-center pt-8 sm:pt-12 lg:pt-16 pb-4 sm:pb-6 px-4">
        <div className="max-w-4xl pt-8 mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm text-primary-700 rounded-full text-sm font-semibold mb-4 sm:mb-6 shadow-sm border border-primary-100 hover:bg-white/90 transition-all duration-300">
            <svg
              className="w-4 h-4 mr-2 animate-pulse"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            Customer Testimonials
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            What Our{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-600 bg-clip-text text-transparent">
              Guests
            </span>{' '}
            Say
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Discover why thousands of guests choose us for their perfect stay
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-600 to-primary-600 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10">
        <div className="relative w-full max-w-6xl">
          {/* Main Testimonial Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/50 hover:shadow-3xl transition-all duration-500">
            <div className="relative">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`transition-all duration-700 ease-in-out ${
                    activeIndex === index
                      ? 'opacity-100 translate-x-0'
                      : index < activeIndex
                      ? 'opacity-0 -translate-x-full absolute inset-0'
                      : 'opacity-0 translate-x-full absolute inset-0'
                  }`}
                >
                  {/* Mobile Layout */}
                  <div className="block lg:hidden">
                    <div className="p-6 sm:p-8 text-center">
                      {/* Profile Section */}
                      <div className="mb-6">
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-primary-100 mx-auto mb-4 shadow-lg group">
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) =>
                              handleImageError(e, testimonial.name)
                            }
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                          {testimonial.name}
                        </h3>
                        <p className="text-primary-600 font-medium text-sm sm:text-base mb-1">
                          {testimonial.position}
                        </p>
                        {testimonial.location && (
                          <p className="text-gray-500 text-sm mb-3">
                            {testimonial.location}
                          </p>
                        )}
                        <div className="flex justify-center mb-4">
                          {renderStars(testimonial.rating)}
                        </div>
                      </div>

                      {/* Quote Section */}
                      <div className="relative">
                        <div className="absolute -top-2 -left-2 text-primary-100">
                          <svg
                            className="w-8 h-8 sm:w-10 sm:h-10"
                            fill="currentColor"
                            viewBox="0 0 32 32"
                          >
                            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                          </svg>
                        </div>
                        <blockquote className="relative z-10">
                          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-medium italic mb-6">
                            "{testimonial.quote}"
                          </p>
                        </blockquote>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                        {testimonial.date && (
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {testimonial.date}
                          </div>
                        )}
                        <div className="flex items-center text-green-600">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Verified Stay
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:block">
                    <div className="grid grid-cols-5 min-h-[400px] xl:min-h-[450px]">
                      {/* Left Panel - Profile */}
                      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-700 text-white p-8 xl:p-10 flex flex-col items-center justify-center col-span-2 relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-6 left-6 w-16 h-16 border border-white rounded-full animate-pulse"></div>
                          <div className="absolute bottom-6 right-6 w-12 h-12 border border-white rounded-full animate-pulse animation-delay-2000"></div>
                          <div className="absolute top-1/2 left-8 w-2 h-2 bg-white rounded-full animate-ping"></div>
                          <div className="absolute top-1/4 right-10 w-3 h-3 bg-white rounded-full animate-ping animation-delay-1000"></div>
                        </div>

                        <div className="relative z-10 text-center">
                          <div className="relative w-24 h-24 xl:w-28 xl:h-28 rounded-full overflow-hidden border-4 border-white/30 mb-6 shadow-xl group">
                            <img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) =>
                                handleImageError(e, testimonial.name)
                              }
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <h3 className="text-xl xl:text-2xl font-bold mb-2">
                            {testimonial.name}
                          </h3>
                          <p className="text-white/90 text-base xl:text-lg mb-2">
                            {testimonial.position}
                          </p>
                          {testimonial.location && (
                            <p className="text-white/70 text-sm mb-4">
                              {testimonial.location}
                            </p>
                          )}
                          <div className="flex justify-center mb-4">
                            {renderStars(testimonial.rating)}
                          </div>
                          {testimonial.date && (
                            <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm hover:bg-white/30 transition-colors duration-300">
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {testimonial.date}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Panel - Quote */}
                      <div className="p-8 xl:p-10 flex flex-col justify-center col-span-3 relative">
                        <div className="absolute top-6 left-6 text-primary-100 opacity-30">
                          <svg
                            className="w-16 h-16"
                            fill="currentColor"
                            viewBox="0 0 32 32"
                          >
                            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                          </svg>
                        </div>

                        <blockquote className="relative z-10 mb-6">
                          <p className="text-xl xl:text-2xl text-gray-700 leading-relaxed font-medium italic">
                            "{testimonial.quote}"
                          </p>
                        </blockquote>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center text-green-600">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Verified Stay
                          </div>
                          <div className="text-gray-400">
                            {activeIndex + 1} of {testimonials.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          {showNavigation && (
            <>
              <button
                onClick={goToPrev}
                disabled={isAnimating}
                className="absolute left-2 sm:left-4 lg:-left-6 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm border border-gray-200 p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl hover:border-primary-300 hover:bg-white transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 group z-10"
                aria-label="Previous testimonial"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-600 group-hover:text-primary-600 transition-colors"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button
                onClick={goToNext}
                disabled={isAnimating}
                className="absolute right-2 sm:right-4 lg:-right-6 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm border border-gray-200 p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl hover:border-primary-300 hover:bg-white transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 group z-10"
                aria-label="Next testimonial"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-600 group-hover:text-primary-600 transition-colors"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom Section - Dots and Progress */}
      <div className="relative z-10 pb-6 sm:pb-8 px-4">
        {/* Dots Indicator */}
        {showDots && (
          <div className="flex justify-center mb-4 sm:mb-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isAnimating}
                className={`relative transition-all duration-300 hover:scale-125 ${
                  activeIndex === index
                    ? 'w-8 sm:w-10 h-2 bg-gradient-to-r from-primary-600 to-primary-600'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                } rounded-full disabled:opacity-50`}
                aria-label={`Go to testimonial ${index + 1}`}
              >
                {activeIndex === index && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-600 rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Progress Bar */}
        {autoPlay && (
          <div className="max-w-sm mx-auto px-4">
            <div className="bg-gray-200 rounded-full h-1 overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-primary-600 to-primary-600 transition-all duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center text-xs text-gray-500">Auto-playing</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Testimonials
