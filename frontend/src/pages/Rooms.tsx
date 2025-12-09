import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPublicRooms } from '@/services/publicApi'

// Type definitions
interface Room {
  id: string
  _id: string
  number: number
  name: string
  type: string
  category?: string
  price: number
  image: string
  images?: { url: string }[]
  description: string
  amenities: string[]
  size: number
  capacity: number
  rating?: number
  available: boolean
}

interface SortOption {
  value: string
  label: string
}

interface FilterOption {
  value: string
  label: string
}

interface SortSelectProps {
  value: string
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  options?: SortOption[]
}

interface FilterSelectProps {
  value: string
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  options?: FilterOption[]
  label: string
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

interface RoomCardProps {
  room: Room
  onViewRoom?: (roomId: string) => void
  onBookRoom?: (roomId: string) => void
}

interface BadgeProps {
  label: string
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'unavailable'
}

interface StarRatingProps {
  rating: number
  maxRating?: number
}

// Badge Component
const Badge: React.FC<BadgeProps> = ({ label, variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-100 text-primary-700',
    secondary: 'bg-green-100 text-green-700',
    success: 'bg-green-100 text-green-800',
    unavailable: 'bg-red-100 text-red-700',
  }

  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${variantClasses[variant]}`}
    >
      {label}
    </span>
  )
}

// StarRating Component
const StarRating: React.FC<StarRatingProps> = ({ rating, maxRating = 5 }) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${
            i < Math.floor(rating)
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="12,2 15,8 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,8" />
        </svg>
      ))}
      <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
    </div>
  )
}

// SortSelect Component
const SortSelect: React.FC<SortSelectProps> = ({
  value,
  onChange,
  options = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating-desc', label: 'Rating: High to Low' },
  ],
}) => {
  return (
    <select
      className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
      aria-label="Sort results"
      value={value}
      onChange={onChange}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

// FilterSelect Component
const FilterSelect: React.FC<FilterSelectProps> = ({
  value,
  onChange,
  options = [],
  label,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}:</label>
      <select
        className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// Pagination Component
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    let start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }

  return (
    <div className="flex justify-center mt-8">
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
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
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {getVisiblePages().map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`min-w-10 h-10 flex items-center justify-center rounded-md transition-colors font-medium ${
              pageNum === currentPage
                ? 'bg-primary-600 text-white shadow-md'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            aria-label={`Page ${pageNum}`}
            aria-current={pageNum === currentPage ? 'page' : undefined}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
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
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </nav>
    </div>
  )
}

// RoomCard Component
const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onViewRoom,
  onBookRoom,
}) => {
  const handleViewRoom = () => {
    if (onViewRoom) {
      onViewRoom(room.id)
    }
  }

  const handleBookRoom = () => {
    if (room.available && onBookRoom) {
      onBookRoom(room.id)
    }
  }

  return (
    <div
      className={`flex flex-col lg:flex-row border-2 rounded-xl overflow-hidden transition-all duration-300 bg-white ${
        room.available
          ? 'border-gray-200 hover:shadow-xl hover:border-primary-500/30 hover:-translate-y-1'
          : 'border-gray-300 opacity-75'
      }`}
    >
      <div className="relative w-full lg:w-80 h-64 lg:h-60 group overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            room.available ? 'group-hover:scale-110' : 'grayscale'
          }`}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src =
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
          }}
        />
        <div className="absolute top-4 left-4 flex gap-2">
           <Badge label={room.category || 'Standard'} variant="primary" />
          <Badge label={room.type} variant="secondary" />
          <Badge
            label={room.available ? 'Available' : 'Unavailable'}
            variant={room.available ? 'success' : 'unavailable'}
          />
        </div>
        {!room.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
              Currently Unavailable
            </span>
          </div>
        )}
        {room.available && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-3">
          <h3
            className={`text-xl font-bold mb-2 lg:mb-0 ${
              room.available ? 'text-gray-800' : 'text-gray-500'
            }`}
          >
            {room.name}
          </h3>
          <StarRating rating={room.rating || 4.2} />
        </div>

        <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            <span className="font-medium">{room.size}m²</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span className="font-medium">{room.capacity} People</span>
          </div>
        </div>

        <p
          className={`mb-4 leading-relaxed ${
            room.available ? 'text-gray-600' : 'text-gray-400'
          }`}
        >
          {room.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {room.amenities.slice(0, 4).map((amenity, index) => (
            <Badge key={index} label={amenity} />
          ))}
          {room.amenities.length > 4 && (
            <Badge
              label={`+${room.amenities.length - 4} more`}
              variant="secondary"
            />
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-auto pt-4 border-t border-gray-100">
          <div className="mb-3 sm:mb-0">
            <span
              className={`text-3xl font-bold ${
                room.available ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              ${room.price}
            </span>
            <span className="text-gray-600 text-sm font-medium"> / night</span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleViewRoom}
              className="flex-1 sm:flex-none bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200 focus:ring-4 focus:ring-gray-600/20 focus:outline-none"
            >
              View Details
            </button>
            <button
              onClick={handleBookRoom}
              disabled={!room.available}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-semibold transition-all duration-200 focus:ring-4 focus:outline-none ${
                room.available
                  ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-600/20 transform hover:scale-105 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {room.available ? 'Book Now' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main RoomsBrowser Component
const RoomsBrowser: React.FC = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState<number>(1)
  const [sortOption, setSortOption] = useState<string>('recommended')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('available') // Default to available
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [displayedRooms, setDisplayedRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const roomsPerPage = 6

  // Fetch rooms from backend on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch all rooms (limit 100 for now to support client-side filtering)
        const response = await fetchPublicRooms({
           limit: 100
        })
        
        const roomsData = response.data
        
        // Transform backend data to component format
        const transformedRooms: Room[] = roomsData.map((room) => ({
          id: room._id,
          _id: room._id,
          number: room.number,
          name: room.name,
          type: room.type,
          category: room.category,
          price: room.price,
          image: room.images?.[0]?.url || room.image?.url || '/placeholder-room.jpg',
          images: room.images,
          description: room.description || 'Comfortable and elegant room with modern amenities.',
          amenities: room.amenities || ['Free WiFi', 'Air Conditioning', 'TV'],
          size: room.size || 35,
          capacity: room.capacity || 2,
          rating: room.rating || 4.5,
          available: room.available,
        }))
        
        setRooms(transformedRooms)
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to fetch rooms:', err)
        setError('Failed to load rooms. Please try again later.')
        setIsLoading(false)
        setRooms([])
      }
    }

    fetchRooms()
  }, [])

  // Get unique room types for filter
  const roomTypes = Array.from(new Set(rooms.map((room) => room.type)))
  const typeFilterOptions = [
    { value: 'all', label: 'All Types' },
    ...roomTypes.map((type) => ({ value: type, label: type })),
  ]


  const categoryFilterOptions = [
    { value: 'all', label: 'All Categories' },
    ...['Single', 'Double', 'Triple', 'Quad', 'Family', 'Suite'].map((cat) => ({ value: cat, label: cat })),
  ]

  const availabilityFilterOptions = [
    { value: 'all', label: 'All Rooms' },
    { value: 'available', label: 'Available Only' },
    { value: 'unavailable', label: 'Unavailable Only' },
  ]

  // Apply sorting and filtering to rooms
  useEffect(() => {
    setIsLoading(true)
    let filtered = [...rooms]

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((room) => room.type === typeFilter)
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((room) => room.category === categoryFilter)
    }

    // Apply availability filter
    if (availabilityFilter === 'available') {
      filtered = filtered.filter((room) => room.available)
    } else if (availabilityFilter === 'unavailable') {
      filtered = filtered.filter((room) => !room.available)
    }

    // Apply sorting
    switch (sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating-desc':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'availability':
        filtered.sort((a, b) => (b.available ? 1 : 0) - (a.available ? 1 : 0))
        break
      default:
        // "recommended" - available first, then by rating
        filtered.sort((a, b) => {
          if (a.available !== b.available) {
            return b.available ? 1 : -1
          }
          return (b.rating || 0) - (a.rating || 0)
        })
        break
    }

    setTimeout(() => {
      setFilteredRooms(filtered)
      setIsLoading(false)
    }, 300)
  }, [rooms, sortOption, typeFilter, categoryFilter, availabilityFilter])

  // Calculate displayed rooms based on current page
  useEffect(() => {
    const startIndex = (page - 1) * roomsPerPage
    const endIndex = startIndex + roomsPerPage
    setDisplayedRooms(filteredRooms.slice(startIndex, endIndex))
  }, [filteredRooms, page])

  const calculatedTotalPages = Math.ceil(filteredRooms.length / roomsPerPage)


  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    scrollToTop()
  }

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value)
    setPage(1)
  }

  const handleTypeFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setTypeFilter(event.target.value)
    setPage(1)
  }

  const handleCategoryFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCategoryFilter(event.target.value)
    setPage(1)
  }

  const handleAvailabilityFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setAvailabilityFilter(event.target.value)
    setPage(1)
  }

  const handleClearFilters = () => {
    setPage(1)
    setSortOption('recommended')
    setTypeFilter('all')
    setCategoryFilter('all')
    setAvailabilityFilter('all')
    scrollToTop()
  }

  const handleViewRoom = (roomId: string) => {
    navigate(`/rooms/${roomId}`)
  }

  const handleBookRoom = (roomId: string) => {
    navigate(`/book/${roomId}`)
  }

  const scrollToTop = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100 my-20">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Browse Our Rooms
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Discover the perfect accommodation for your stay
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-primary-100 text-primary-800 px-4 py-2 rounded-full font-medium">
                {rooms.length} Total Rooms
              </span>
              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                 {rooms.filter(r => r.available).length} Available
              </span>
            </div>
          </div>

          {/* Filters and Sorting */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8 p-6 bg-gray-50 rounded-xl">
             <FilterSelect
              value={categoryFilter}
              onChange={handleCategoryFilterChange}
              options={categoryFilterOptions}
              label="Category"
            />
            <FilterSelect
              value={typeFilter}
              onChange={handleTypeFilterChange}
              options={typeFilterOptions}
              label="Room Type"
            />
            <FilterSelect
              value={availabilityFilter}
              onChange={handleAvailabilityFilterChange}
              options={availabilityFilterOptions}
              label="Availability"
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <SortSelect value={sortOption} onChange={handleSortChange} />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="flex flex-col justify-center items-center py-10">
               <p className="text-red-500 mb-4">{error}</p>
                <button
                onClick={() => window.location.reload()}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Room Grid */}
              <div className="space-y-6">
                {displayedRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onViewRoom={handleViewRoom}
                    onBookRoom={handleBookRoom}
                  />
                ))}
              </div>
              
              {displayedRooms.length === 0 && !isLoading && !error && (
                  <div className="text-center py-20">
                      <p className="text-gray-500 text-lg">No rooms found matching your criteria.</p>
                      <button onClick={handleClearFilters} className="mt-4 text-primary-600 hover:underline">Clear Filters</button>
                  </div>
              )}

              {/* Pagination */}
              {calculatedTotalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={calculatedTotalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
export default RoomsBrowser
