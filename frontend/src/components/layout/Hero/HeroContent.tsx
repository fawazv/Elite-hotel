const HeroContent = () => {
  return (
    <div className="text-center max-w-4xl mx-auto mb-8 lg:mb-12">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 lg:mb-6 animate-fade-in">
        Welcome to{' '}
        <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          Elite Hotel
        </span>
      </h1>
      <p className="text-lg sm:text-xl text-gray-300 mb-6 lg:mb-8 leading-relaxed animate-fade-in max-w-3xl mx-auto">
        Experience luxury and comfort in the heart of the city. Your perfect
        stay awaits with world-class amenities and exceptional service.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
        <button className="bg-amber-800 hover:bg-amber-900 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-lg font-semibold text-base lg:text-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
          Book Your Stay
        </button>
        <button className="bg-white/5 text-white border border-white/30 backdrop-blur-sm hover:bg-white/20 px-6 lg:px-8 py-3 lg:py-4 rounded-lg font-semibold text-base lg:text-lg transition-all duration-200 transform hover:scale-105">
          Explore Rooms
        </button>
      </div>
    </div>
  )
}

export default HeroContent
