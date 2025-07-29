const About = () => {
  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          Luxury Redefined
        </h2>
        <p className="text-lg text-gray-600  mb-6 leading-relaxed">
          At Elite Hotel, we believe that every guest deserves an extraordinary
          experience. Our commitment to excellence shines through in every
          detail, from our elegantly appointed rooms to our personalized
          service.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span className="text-gray-700 ">5-Star Service</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span className="text-gray-700 ">Premium Amenities</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span className="text-gray-700 ">Prime Location</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span className="text-gray-700 ">24/7 Concierge</span>
          </div>
        </div>
      </div>
      <div className="relative">
        <img
          src="/images/Hero2.avif"
          alt="Hotel Lobby"
          className="rounded-2xl shadow-2xl w-full h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
      </div>
    </div>
  )
}

export default About
