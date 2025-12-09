import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPublicRooms } from '@/services/publicApi'

interface Room {
  _id: string
  name: string
  type: string
  price: number
  images?: { url: string }[]
  image?: { url: string }
  description?: string
  capacity?: number
  size?: string
  amenities?: string[]
}

const FeaturedRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadFeaturedRooms = async () => {
      try {
        setIsLoading(true)
        // Try to fetch Premium rooms first
        const response = await fetchPublicRooms({
          type: 'Premium',
          available: true,
          limit: 4
        })

        let featuredData = response.data
        
        // If not enough premium rooms, fetch any available rooms to fill the gap
        if (featuredData.length < 3) {
           const fallbackResponse = await fetchPublicRooms({
             available: true,
             limit: 4
           })
           // Combine and deduplicate based on _id
           const combined = [...featuredData, ...fallbackResponse.data]
           const uniqueRooms = Array.from(new Map(combined.map(room => [room._id, room])).values())
           featuredData = uniqueRooms.slice(0, 4)
        }

        setRooms(featuredData)
      } catch (error) {
        console.error('Failed to load featured rooms', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFeaturedRooms()
  }, [])

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Featured Accommodations
            </h2>
            <div className="h-1 w-24 bg-amber-800 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (rooms.length === 0) return null

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Featured Accommodations
          </h2>
          <div className="h-1 w-24 bg-amber-800 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Experience luxury and comfort in our hand-picked selection of premium rooms and suites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-1"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={room.images?.[0]?.url || room.image?.url || '/placeholder-room.jpg'}
                  alt={room.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80'
                  }}
                />
                <div className="absolute top-4 left-4">
                   <span className="bg-amber-800 text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
                      {room.type}
                   </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  <Link
                    to={`/rooms/${room._id}`}
                    className="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-amber-50 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                    {room.name}
                  </h3>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                  {room.description || 'Experience comfort and elegance in this beautifully appointed room.'}
                </p>

                <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    <span>{room.size || '35m²'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    <span>{room.capacity || 2} Guests</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-2xl font-bold text-amber-800">${room.price}</span>
                    <span className="text-gray-500 text-sm"> / night</span>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 text-amber-800 font-semibold hover:text-amber-900 transition-colors"
          >
            View All Accommodations
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedRooms
