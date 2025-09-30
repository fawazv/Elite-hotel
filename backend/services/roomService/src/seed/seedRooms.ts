import dotenv from 'dotenv'
dotenv.config()
import connectMongoDB from '../config/db.config'
import { Room } from '../models/room.model'

const rooms = [
  {
    number: 1,
    name: 'Ocean View Family Suite',
    type: 'Premium',
    price: 249,
    image: {
      publicId: 'ocean-view-family-suite-1', // Placeholder publicId
      url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=300&fit=crop',
    },
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
    number: 2,
    name: 'Cozy Single Retreat',
    type: 'Standard',
    price: 129,
    image: {
      publicId: 'cozy-single-retreat-2', // Placeholder publicId
      url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    },
    description:
      'Intimate single room with beautiful landscape views, designed for solo travelers who appreciate comfort and tranquility.',
    amenities: ['Free WiFi', 'TV', 'Breakfast', 'Work Desk', 'Coffee Machine'],
    size: '25m²',
    capacity: '1 Person',
    rating: 4.2,
    available: false,
  },
  {
    number: 3,
    name: 'Deluxe Garden Suite',
    type: 'Deluxe',
    price: 189,
    image: {
      publicId: 'deluxe-garden-suite-3', // Placeholder publicId
      url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop',
    },
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
    number: 4,
    name: 'Executive Business Suite',
    type: 'Premium',
    price: 299,
    image: {
      publicId: 'executive-business-suite-4', // Placeholder publicId
      url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop',
    },
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
    number: 5,
    name: 'Junior Honeymoon Suite',
    type: 'Premium',
    price: 219,
    image: {
      publicId: 'junior-honeymoon-suite-5', // Placeholder publicId
      url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
    },
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
    number: 6,
    name: 'Mountain View Lodge',
    type: 'Deluxe',
    price: 169,
    image: {
      publicId: 'mountain-view-lodge-6', // Placeholder publicId
      url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    },
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
    number: 7,
    name: 'Classic Business Room',
    type: 'Standard',
    price: 149,
    image: {
      publicId: 'classic-business-room-7', // Placeholder publicId
      url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
    },
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
    number: 8,
    name: 'Penthouse Suite',
    type: 'Luxury',
    price: 499,
    image: {
      publicId: 'penthouse-suite-8', // Placeholder publicId
      url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop',
    },
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

;(async () => {
  try {
    await connectMongoDB()
    console.log('Seeding rooms...')
    await Room.deleteMany({})
    await Room.insertMany(rooms)
    console.log('✅ Rooms seeded successfully')
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()
