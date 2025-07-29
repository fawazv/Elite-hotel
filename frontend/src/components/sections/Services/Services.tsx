import React from 'react'
import ServiceCard from '../../layout/Services/ServiceCard'

// Type definition for a service object
interface Service {
  icon: string
  title: string
  description: string
}

const Services: React.FC = () => {
  const services: Service[] = [
    {
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      title: 'Luxury Rooms',
      description:
        'Spacious and elegantly designed rooms with modern amenities and stunning city views.',
    },
    {
      icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
      title: 'Fine Dining',
      description:
        'Award-winning restaurants serving exquisite cuisine from around the world.',
    },
    {
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      title: 'Spa & Wellness',
      description:
        'Rejuvenate your body and mind with our world-class spa and wellness facilities.',
    },
    {
      icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4',
      title: 'Event Planning',
      description:
        'Professional event coordination for weddings, conferences, and special celebrations.',
    },
    {
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      title: 'Concierge Services',
      description:
        '24/7 personalized assistance for reservations, tours, and local recommendations.',
    },
    {
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      title: 'Fitness Center',
      description:
        'State-of-the-art gym equipment and fitness classes with professional trainers.',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto text-center">
      <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-12">
        Our Services
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {services.map((service: Service, index: number) => (
          <ServiceCard
            key={index}
            icon={service.icon}
            title={service.title}
            description={service.description}
          />
        ))}
      </div>
    </div>
  )
}

export default Services
