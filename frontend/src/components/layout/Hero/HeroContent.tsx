const HeroContent = () => {
  return (
    <>
      <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
            Welcome to{' '}
            <span className="text-primary bg-gradient-to-r from-primary to-orange-600 bg-clip-text">
              Elite Hotel
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed animate-fade-in">
            Experience luxury and comfort in the heart of the city. Your perfect
            stay awaits with world-class amenities and exceptional service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
              Book Your Stay
            </button>
            <button className="bg-white/5 text-white border border-white/30 backdrop-blur-sm hover:bg-white/20 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105">
              Explore Rooms
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default HeroContent
