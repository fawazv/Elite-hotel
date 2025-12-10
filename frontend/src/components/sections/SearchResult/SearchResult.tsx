import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { fetchPublicRooms, searchAvailableRooms } from '@/services/publicApi'

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
  variant?: 'default' | 'primary' | 'secondary' | 'success'
}

interface StarRatingProps {
  rating: number
  maxRating?: number
}

interface SearchResultsProps {
  results?: Room[]
  currentPage?: number
}

// Badge Component
const Badge: React.FC<BadgeProps> = ({ label, variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-100 text-primary-700',
    secondary: 'bg-green-100 text-green-700',
    success: 'bg-green-100 text-green-800',
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
    } else {
      console.log(`Viewing room ${room.id}: ${room.name}`)
    }
  }

  const handleBookRoom = () => {
    if (onBookRoom) {
      onBookRoom(room.id)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row border-2 rounded-xl overflow-hidden transition-all duration-300 bg-white border-gray-200 hover:shadow-xl hover:border-primary-500/30 hover:-translate-y-1">
      <div className="relative w-full lg:w-80 h-64 lg:h-60 group overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src =
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
          }}
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge label={room.type} variant="primary" />
          <Badge label="Available" variant="success" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-3">
          <h3 className="text-xl font-bold mb-2 lg:mb-0 text-gray-800">
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

        <p className="mb-4 leading-relaxed text-gray-600">{room.description}</p>

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
            <span className="text-3xl font-bold text-primary-600">
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
              className="flex-1 sm:flex-none bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 focus:ring-4 focus:ring-primary-600/20 focus:outline-none transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main SearchResults Component
const SearchResults: React.FC<SearchResultsProps> = ({
  results: externalResults,
  currentPage = 1,
}) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [page, setPage] = useState<number>(currentPage)
  const [sortOption, setSortOption] = useState<string>('recommended')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredResults, setFilteredResults] = useState<Room[]>([])
  const [displayedResults, setDisplayedResults] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const roomsPerPage = 6

  // Fetch rooms from backend on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Get search params from URL
        const checkIn = searchParams.get('checkIn') || undefined
        const checkOut = searchParams.get('checkOut') || undefined
        const roomType = searchParams.get('roomType') || undefined
        const guests = searchParams.get('guests') || undefined
        
        // Fetch rooms from backend
        let roomsData: any[] = []

        if (checkIn && checkOut) {
           // Use availability endpoint
           roomsData = await searchAvailableRooms({
             checkIn,
             checkOut,
             adults: guests ? parseInt(guests) : 1,
             type: roomType === 'all' ? undefined : roomType,
           })
        } else {
           // Fallback to standard list if no dates
           const response = await fetchPublicRooms({
             available: true,
             type: roomType === 'all' ? undefined : roomType,
             limit: 100, 
           })
           roomsData = response.data
        }
        
        // Transform backend data to component format
        const transformedRooms: Room[] = roomsData.map((room) => ({
          id: room.id || room._id,
          _id: room._id || room.id,

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
        // Fallback to empty array on error
        setRooms([])
      }
    }

    // Use external results if provided, otherwise fetch from API
    if (externalResults && externalResults.length > 0) {
      setRooms(externalResults)
      setIsLoading(false)
    } else {
      fetchRooms()
    }
  }, [searchParams, externalResults])

  // Get unique room types and categories for filter
  const roomTypes = Array.from(new Set(rooms.map((room) => room.type)))
  const typeFilterOptions = [
    { value: 'all', label: 'All Types' },
    ...roomTypes.map((type) => ({ value: type, label: type })),
  ]


  const categoryFilterOptions = [
    { value: 'all', label: 'All Categories' },
    ...['Single', 'Double', 'Triple', 'Quad', 'Family', 'Suite'].map((cat) => ({ value: cat, label: cat })),
  ]

  // Apply sorting and filtering to results
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
      default:
        // "recommended" - sort by rating
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
    }

    setTimeout(() => {
      setFilteredResults(filtered)
      setIsLoading(false)
    }, 300)
  }, [rooms, sortOption, typeFilter, categoryFilter])

  // Calculate displayed results based on current page
  useEffect(() => {
    const startIndex = (page - 1) * roomsPerPage
    const endIndex = startIndex + roomsPerPage
    setDisplayedResults(filteredResults.slice(startIndex, endIndex))
  }, [filteredResults, page])

  const calculatedTotalPages = Math.ceil(filteredResults.length / roomsPerPage)

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

  const handleClearFilters = () => {
    setPage(1)
    setSortOption('recommended')
    setTypeFilter('all')
    setCategoryFilter('all')
    scrollToTop()
  }

  const handleViewRoom = (roomId: string) => {
    navigate(`/rooms/${roomId}`)
  }

  const handleBookRoom = (roomId: string) => {
    const checkIn = searchParams.get('checkIn') || ''
    const checkOut = searchParams.get('checkOut') || ''
    const guests = searchParams.get('guests') || '2'
    
    // Navigate to booking flow with room and date info
    const bookingUrl = `/book/${roomId}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
    navigate(bookingUrl)
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
              Search Results
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Found {filteredResults.length} available rooms matching your
              criteria
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-primary-100 text-primary-800 px-4 py-2 rounded-full font-medium">
                {filteredResults.length} Results Found
              </span>
              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                All Available
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
          {error ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
              >
                Try Again
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Results Grid */}
              <div className="space-y-6">
                {displayedResults.map((room, index) => (
                  <RoomCard
                    key={room.id || "room-" + index}
                    room={room}
                    onViewRoom={handleViewRoom}
                    onBookRoom={handleBookRoom}
                  />
                ))}
              </div>

              {/* No Results */}
              {displayedResults.length === 0 && !isLoading && (
                <div className="py-20 text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    No rooms found
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    No rooms match your current filters. Try adjusting your
                    search criteria or browse all available rooms.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
                  >
                    Clear All Filters
                  </button>
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

              {/* Bottom Summary */}
              {displayedResults.length > 0 && (
                <div className="mt-12 text-center pt-8 border-t border-gray-200">
                  <p className="text-gray-600 mb-4">
                    Showing {displayedResults.length} of{' '}
                    {filteredResults.length} available rooms
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={handleClearFilters}
                      className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      Reset All Filters
                    </button>
                    <span className="text-gray-300">•</span>
                    <button
                      onClick={scrollToTop}
                      className="text-gray-600 hover:text-gray-700 font-medium transition-colors"
                    >
                      Back to Top
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchResults
