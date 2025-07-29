import * as React from 'react'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import HeroContent from '../../layout/Hero/HeroContent'
import RoomBookingSearch from '../../layout/Hero/RoomBookingSearch'
import ScrollIndicator from '../../layout/Hero/ScrollIndicator'

const Hero = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  )

  // Enhanced collection of luxury hotel background images
  const backgroundImages = [
    {
      url: '/images/Hero1.avif',
      title: 'Luxury Hotel Lobby',
    },
    {
      url: '/images/Hero3.avif',
      title: 'Hotel Pool Area',
    },
    {
      url: '/images/Hero4.avif',
      title: 'Modern Hotel Room',
    },
    {
      url: '/images/Hero5.avif',
      title: 'Hotel Restaurant',
    },
    {
      url: '/images/Hero6.avif',
      title: 'Hotel Exterior',
    },
  ]

  return (
    <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden">
      {/* Background Carousel using shadcn */}
      <Carousel
        plugins={[plugin.current]}
        className="absolute inset-0 w-full h-full"
        opts={{
          align: 'start',
          loop: true,
        }}
      >
        <CarouselContent className="h-full -ml-0">
          {backgroundImages.map((image, index) => (
            <CarouselItem key={index} className="pl-0 basis-full">
              <div className="relative h-screen w-full">
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('${image.url}')`,
                  }}
                />
                {/* Image title overlay (optional) */}
                <div className="absolute bottom-4 left-4 z-10">
                  <span className="text-white/70 text-sm font-medium bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    {image.title}
                  </span>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Content Container */}
      <div className="relative z-30 flex flex-col justify-center items-center h-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Content */}
        <HeroContent />

        {/* Room Booking Search */}
        <RoomBookingSearch />
      </div>

      {/* Scroll Indicator */}
      <div className="relative z-30">
        <ScrollIndicator />
      </div>

      {/* Enhanced Visual Effects */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Subtle animated overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Subtle vignette effect */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/10" />
      </div>
    </section>
  )
}

export default Hero
