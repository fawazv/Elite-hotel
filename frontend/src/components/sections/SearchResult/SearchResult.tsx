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
}

interface SortOption {
  value: string
  label: string
}

interface SortSelectProps {
  value: string
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  options?: SortOption[]
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

interface RoomCardProps {
  room: Room
  onViewRoom?: (roomId: number) => void
}

interface BadgeProps {
  label: string
  variant?: 'default' | 'primary' | 'secondary'
}

interface StarRatingProps {
  rating: number
  maxRating?: number
}

interface SearchResultsProps {
  results?: Room[]
  currentPage?: number
  totalPages?: number
}

// Badge Component
const Badge: React.FC<BadgeProps> = ({ label, variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-100 text-primary-700',
    secondary: 'bg-green-100 text-green-700',
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
const RoomCard: React.FC<RoomCardProps> = ({ room, onViewRoom }) => {
  const handleViewRoom = () => {
    if (onViewRoom) {
      onViewRoom(room.id)
    } else {
      // Fallback: could open in new tab or show alert
      console.log(`Viewing room ${room.id}: ${room.name}`)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary-500/30 hover:-translate-y-1 bg-white">
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
        <div className="absolute top-4 left-4">
          <Badge label={room.type} variant="primary" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800 mb-2 lg:mb-0">
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

        <p className="text-gray-600 mb-4 leading-relaxed">{room.description}</p>

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
          <div className="text-gray-800 mb-3 sm:mb-0">
            <span className="text-3xl font-bold text-primary-600">
              ${room.price}
            </span>
            <span className="text-gray-600 text-sm font-medium"> / night</span>
          </div>

          <button
            onClick={handleViewRoom}
            className="w-full sm:w-auto bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary transition-all duration-200 focus:ring-4 focus:ring-primary/20 focus:outline-none transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            View Room Details
          </button>
        </div>
      </div>
    </div>
  )
}

// Demo data
const demoResults: Room[] = [
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
  },
]

// Main SearchResults Component
const SearchResults: React.FC<SearchResultsProps> = ({
  results = demoResults,
  currentPage = 1,
}) => {
  const [page, setPage] = useState<number>(currentPage)
  const [sortOption, setSortOption] = useState<string>('recommended')
  const [filteredResults, setFilteredResults] = useState<Room[]>([])
  const [displayedResults, setDisplayedResults] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const roomsPerPage = 4

  // Apply sorting and filtering to results
  useEffect(() => {
    setIsLoading(true)
    const sorted = [...results]

    switch (sortOption) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'rating-desc':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      default:
        // "recommended" - could be based on rating, popularity, etc.
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
    }

    setTimeout(() => {
      setFilteredResults(sorted)
      setIsLoading(false)
    }, 300)
  }, [results, sortOption])

  // Calculate displayed results based on current page
  useEffect(() => {
    const startIndex = (page - 1) * roomsPerPage
    const endIndex = startIndex + roomsPerPage
    setDisplayedResults(filteredResults.slice(startIndex, endIndex))
  }, [filteredResults, page])

  const calculatedTotalPages = Math.ceil(filteredResults.length / roomsPerPage)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    scrollToSearchResults()
  }

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value)
    setPage(1)
  }

  const handleClearSearch = () => {
    setPage(1)
    setSortOption('recommended')
    scrollToSearchResults()
  }

  const handleViewRoom = (roomId: number) => {
    // In a real app, this would navigate to the room detail page
    alert(`Viewing room details for Room ID: ${roomId}`)
  }

  const scrollToSearchResults = () => {
    setTimeout(() => {
      const sectionElement = document.querySelector('.search-result')
      if (sectionElement) {
        const elementPosition = sectionElement.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - 100
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-24">
      <section className="search-result max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100 backdrop-blur-sm">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 pb-6 border-b border-gray-200">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Search Results
              </h1>
              <p className="text-gray-600 text-lg">
                Found{' '}
                <span className="font-semibold text-primary">
                  {filteredResults.length}
                </span>{' '}
                rooms matching your criteria
              </p>
            </div>

            <div className="flex items-center gap-4">
              <label
                htmlFor="sort-select"
                className="text-sm font-medium text-gray-700 hidden sm:block"
              >
                Sort by:
              </label>
              <SortSelect value={sortOption} onChange={handleSortChange} />
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Results */}
              <div className="space-y-8">
                {displayedResults.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onViewRoom={handleViewRoom}
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No rooms found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search criteria or browse our featured
                    rooms.
                  </p>
                  <button
                    onClick={handleClearSearch}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    Clear Filters
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

              {/* Clear Search */}
              <div className="mt-10 text-center pt-8 border-t border-gray-200">
                <button
                  onClick={handleClearSearch}
                  className="text-gray-600 hover:text-primary-600 flex items-center justify-center gap-2 mx-auto transition-colors group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:-translate-x-1 transition-transform"
                  >
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  <span className="font-medium">
                    Clear Search & Reset Filters
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default SearchResults
