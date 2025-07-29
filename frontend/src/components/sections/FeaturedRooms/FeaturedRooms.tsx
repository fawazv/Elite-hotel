// If using react-router-dom for navigation:
import { Link } from 'react-router-dom'

const rooms = [
  {
    id: 1,
    name: 'Single Bed',
    price: 99,
    image:
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop&crop=center',
    amenities: ['Free WiFi', 'TV', 'Breakfast'],
    size: '25m²',
    capacity: '1 Person',
  },
  {
    id: 2,
    name: 'Triple Suite',
    price: 199,
    image:
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop&crop=center',
    amenities: ['Free WiFi', 'Minibar', 'Balcony'],
    size: '45m²',
    capacity: '3 People',
  },
  {
    id: 3,
    name: 'Single Suite',
    price: 149,
    image:
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop&crop=center',
    amenities: ['Free WiFi', 'Workspace', 'Breakfast'],
    size: '35m²',
    capacity: '1 Person',
  },
  {
    id: 4,
    name: 'Beach View',
    price: 249,
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&crop=center',
    amenities: ['Ocean View', 'Balcony', 'Breakfast'],
    size: '40m²',
    capacity: '2 People',
  },
  {
    id: 5,
    name: 'Deluxe Double',
    price: 179,
    image:
      'https://images.unsplash.com/photo-1562790351-d273a961e0e9?w=800&h=600&fit=crop&crop=center',
    amenities: ['Free WiFi', 'Minibar', 'Air Conditioning', 'Room Service'],
    size: '38m²',
    capacity: '2 People',
  },
  {
    id: 6,
    name: 'Family Room',
    price: 299,
    image:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop&crop=center',
    amenities: ['Free WiFi', 'Kitchenette', 'Two Bathrooms', 'Kids Area'],
    size: '65m²',
    capacity: '4 People',
  },
  {
    id: 7,
    name: 'Executive Suite',
    price: 399,
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&crop=center',
    amenities: [
      'Free WiFi',
      'Living Area',
      'Premium Minibar',
      'Butler Service',
    ],
    size: '85m²',
    capacity: '2 People',
  },
  {
    id: 8,
    name: 'Garden View',
    price: 129,
    image:
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=center',
    amenities: ['Free WiFi', 'Garden View', 'Breakfast', 'Tea Making'],
    size: '30m²',
    capacity: '2 People',
  },
  {
    id: 9,
    name: 'Penthouse',
    price: 599,
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop&crop=center',
    amenities: [
      'Free WiFi',
      'Private Terrace',
      'Jacuzzi',
      'City View',
      'Concierge',
    ],
    size: '120m²',
    capacity: '4 People',
  },
  {
    id: 10,
    name: 'Standard Twin',
    price: 119,
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center',
    amenities: ['Free WiFi', 'Twin Beds', 'Desk', 'Breakfast'],
    size: '32m²',
    capacity: '2 People',
  },
  {
    id: 11,
    name: 'Honeymoon Suite',
    price: 449,
    image:
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop&crop=center',
    amenities: [
      'Free WiFi',
      'King Bed',
      'Champagne',
      'Rose Petals',
      'Spa Access',
    ],
    size: '75m²',
    capacity: '2 People',
  },
  {
    id: 12,
    name: 'Business Room',
    price: 169,
    image:
      'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=800&h=600&fit=crop&crop=center',
    amenities: ['Free WiFi', 'Work Desk', 'Printer Access', 'Express Checkout'],
    size: '35m²',
    capacity: '1 Person',
  },
  {
    id: 13,
    name: 'Pool View',
    price: 189,
    image:
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop&crop=center',
    amenities: ['Free WiFi', 'Pool View', 'Balcony', 'Mini Fridge'],
    size: '42m²',
    capacity: '2 People',
  },
  {
    id: 14,
    name: 'Studio Apartment',
    price: 219,
    image:
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop&crop=center',
    amenities: ['Free WiFi', 'Full Kitchen', 'Living Area', 'Washing Machine'],
    size: '55m²',
    capacity: '3 People',
  },
]

export default function FeaturedRooms() {
  return (
    <section id="rooms">
      <div className="text-center mb-12">
        <span className="text-primary font-medium">Our Accommodations</span>
        <h2 className="text-3xl font-serif font-bold mt-2 mb-4">
          Featured Rooms
        </h2>
        <div className="w-16 h-1 bg-primary mx-auto"></div>
        <p className="mt-4 text-gray-600 max-w-lg mx-auto">
          Discover our selection of premium rooms and suites designed for your
          comfort and relaxation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {rooms.slice(0, 4).map((room) => (
          <div
            key={room.id}
            className="group bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-2 transform"
          >
            <div className="relative h-60 overflow-hidden">
              <img
                src={room.image}
                alt={room.name}
                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
              <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                ${room.price}/night
              </div>

              {/* Overlay that appears on hover */}
              <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            </div>

            <div className="p-6 transition-all duration-300 group-hover:bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800 mb-2 transition-colors duration-300 group-hover:text-primary">
                {room.name}
              </h3>

              <div className="flex items-center gap-3 mb-3 text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                <div className="flex items-center gap-1 transition-transform duration-300 group-hover:scale-105">
                  {/* Size Icon */}
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
                    className="transition-colors duration-300 group-hover:text-primary"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  </svg>
                  {room.size}
                </div>
                <div className="flex items-center gap-1 transition-transform duration-300 group-hover:scale-105">
                  {/* Capacity Icon */}
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
                    className="transition-colors duration-300 group-hover:text-primary"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  {room.capacity}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {room.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs transition-all duration-300 group-hover:bg-primary/20 group-hover:text-primary group-hover:scale-105"
                  >
                    {amenity}
                  </span>
                ))}
              </div>

              <Link to={`/rooms/${room.id}`}>
                <button className="w-full bg-primary/10 text-primary font-medium py-2 rounded-lg transition-all duration-300 ease-out hover:bg-primary hover:text-white hover:shadow-lg transform hover:scale-105 active:scale-95">
                  View Details
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/rooms"
          className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Browse All Rooms
        </Link>
      </div>
    </section>
  )
}
