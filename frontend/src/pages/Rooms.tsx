import React, { useState, useEffect } from 'react'

// Type definitions
interface Room {
  id: number
  name: string
  type: string
  price: number
  image: string
  description: string
  amenities: string[]
  size: string
  capacity: string
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
  onViewRoom?: (roomId: number) => void
  onBookRoom?: (roomId: number) => void
}

interface BadgeProps {
  label: string
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'unavailable'
}

interface StarRatingProps {
  rating: number
  maxRating?: number
}

interface RoomsBrowserProps {
  rooms?: Room[]
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
    { value: 'availability', label: 'Available First' },
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
          <Badge label={room.type} variant="primary" />
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
            <span className="font-medium">{room.size}</span>
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
            <span className="font-medium">{room.capacity}</span>
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

// Demo data with availability
const demoRooms: Room[] = [
  {
    id: 1,
    name: 'Ocean View Family Suite',
    type: 'Premium',
    price: 249,
    image:
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=300&fit=crop',
    description:
      'Spacious family suite with breathtaking ocean views, perfect for families seeking luxury and comfort with premium amenities.',
    amenities: [
      'Free WiFi',
      'Ocean View',
      'Breakfast',
      'Family Friendly',
      'Mini Bar',
      'Balcony',
    ],
    size: '60m²',
    capacity: '4-6 People',
    rating: 4.8,
    available: true,
  },
  {
    id: 2,
    name: 'Cozy Single Retreat',
    type: 'Standard',
    price: 129,
    image:
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    description:
      'Intimate single room with beautiful landscape views, designed for solo travelers who appreciate comfort and tranquility.',
    amenities: ['Free WiFi', 'TV', 'Breakfast', 'Work Desk', 'Coffee Machine'],
    size: '25m²',
    capacity: '1 Person',
    rating: 4.2,
    available: false,
  },
  {
    id: 3,
    name: 'Deluxe Garden Suite',
    type: 'Deluxe',
    price: 189,
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop',
    description:
      'Elegant room with private garden access and premium furnishings, offering a perfect blend of luxury and nature.',
    amenities: [
      'Free WiFi',
      'Garden View',
      'Breakfast',
      'Premium Bedding',
      'Coffee Machine',
      'Private Terrace',
    ],
    size: '35m²',
    capacity: '2 People',
    rating: 4.6,
    available: true,
  },
  {
    id: 4,
    name: 'Executive Business Suite',
    type: 'Premium',
    price: 299,
    image:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop',
    description:
      'Our finest accommodation with panoramic city views, separate living area, and exclusive executive amenities for discerning guests.',
    amenities: [
      'Free WiFi',
      'City View',
      'Breakfast',
      'Mini Bar',
      'Coffee Machine',
      'Bathtub',
      'Butler Service',
      'Executive Lounge',
    ],
    size: '65m²',
    capacity: '2-4 People',
    rating: 4.9,
    available: true,
  },
  {
    id: 5,
    name: 'Junior Honeymoon Suite',
    type: 'Premium',
    price: 219,
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
    description:
      'Romantic junior suite with champagne service and luxury amenities, perfect for special occasions and romantic getaways.',
    amenities: [
      'Free WiFi',
      'Romantic Setup',
      'Breakfast',
      'Mini Bar',
      'Jacuzzi',
      'Sitting Area',
      'Champagne Service',
    ],
    size: '45m²',
    capacity: '2-3 People',
    rating: 4.7,
    available: false,
  },
  {
    id: 6,
    name: 'Mountain View Lodge',
    type: 'Deluxe',
    price: 169,
    image:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    description:
      'Rustic yet elegant room with stunning mountain vistas and cozy fireplace, ideal for nature enthusiasts.',
    amenities: [
      'Free WiFi',
      'Mountain View',
      'Breakfast',
      'Fireplace',
      'Coffee Machine',
      'Hiking Gear Storage',
    ],
    size: '40m²',
    capacity: '2-3 People',
    rating: 4.4,
    available: true,
  },
  {
    id: 7,
    name: 'Classic Business Room',
    type: 'Standard',
    price: 149,
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
    description:
      'Professional and comfortable room designed for business travelers with modern amenities and work-friendly setup.',
    amenities: [
      'Free WiFi',
      'Work Desk',
      'Business Center Access',
      'Coffee Machine',
      'Iron & Board',
    ],
    size: '30m²',
    capacity: '1-2 People',
    rating: 4.3,
    available: true,
  },
  {
    id: 8,
    name: 'Penthouse Suite',
    type: 'Luxury',
    price: 499,
    image:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop',
    description:
      'Ultimate luxury experience with private terrace, panoramic views, and exclusive concierge service.',
    amenities: [
      'Free WiFi',
      'Private Terrace',
      'Concierge',
      'Mini Bar',
      'Jacuzzi',
      'Butler Service',
      'City View',
      'Champagne Service',
    ],
    size: '85m²',
    capacity: '2-6 People',
    rating: 4.9,
    available: false,
  },
]

// Main RoomsBrowser Component
const RoomsBrowser: React.FC<RoomsBrowserProps> = ({ rooms = demoRooms }) => {
  const [page, setPage] = useState<number>(1)
  const [sortOption, setSortOption] = useState<string>('recommended')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all')
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [displayedRooms, setDisplayedRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const roomsPerPage = 6

  // Get unique room types for filter
  const roomTypes = Array.from(new Set(rooms.map((room) => room.type)))
  const typeFilterOptions = [
    { value: 'all', label: 'All Types' },
    ...roomTypes.map((type) => ({ value: type, label: type })),
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
  }, [rooms, sortOption, typeFilter, availabilityFilter])

  // Calculate displayed rooms based on current page
  useEffect(() => {
    const startIndex = (page - 1) * roomsPerPage
    const endIndex = startIndex + roomsPerPage
    setDisplayedRooms(filteredRooms.slice(startIndex, endIndex))
  }, [filteredRooms, page])

  const calculatedTotalPages = Math.ceil(filteredRooms.length / roomsPerPage)
  const availableRoomsCount = filteredRooms.filter(
    (room) => room.available
  ).length

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
    setAvailabilityFilter('all')
    scrollToTop()
  }

  const handleViewRoom = (roomId: number) => {
    alert(`Viewing room details for Room ID: ${roomId}`)
  }

  const handleBookRoom = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId)
    alert(`Booking ${room?.name} (Room ID: ${roomId})`)
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
                {filteredRooms.length} Total Rooms
              </span>
              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                {availableRoomsCount} Available
              </span>
              <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full font-medium">
                {filteredRooms.length - availableRoomsCount} Unavailable
              </span>
            </div>
          </div>

          {/* Filters and Sorting */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8 p-6 bg-gray-50 rounded-xl">
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

              {/* No Results */}
              {displayedRooms.length === 0 && !isLoading && (
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
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
              {displayedRooms.length > 0 && (
                <div className="mt-12 text-center pt-8 border-t border-gray-200">
                  <p className="text-gray-600 mb-4">
                    Showing {displayedRooms.length} of {filteredRooms.length}{' '}
                    rooms
                    {availabilityFilter === 'all' &&
                      ` (${availableRoomsCount} available)`}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => setAvailabilityFilter('available')}
                      className="text-green-600 hover:text-green-700 font-medium transition-colors"
                    >
                      Show Available Only
                    </button>
                    <span className="text-gray-300">•</span>
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

export default RoomsBrowser
