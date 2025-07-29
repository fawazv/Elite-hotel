const Services = () => {
  return (
    <div className="max-w-6xl mx-auto text-center">
      <h2 className="text-4xl lg:text-5xl font-bold text-gray-900  mb-12">
        Our Services
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="group p-8 rounded-2xl bg-gray-50 -800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900  mb-4">
            Luxury Rooms
          </h3>
          <p className="text-gray-600 ">
            Spacious and elegantly designed rooms with modern amenities and
            stunning city views.
          </p>
        </div>

        <div className="group p-8 rounded-2xl bg-gray-50  hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900  mb-4">
            Fine Dining
          </h3>
          <p className="text-gray-600 ">
            Award-winning restaurants serving exquisite cuisine from around the
            world.
          </p>
        </div>

        <div className="group p-8 rounded-2xl bg-gray-50  hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900  mb-4">
            Spa & Wellness
          </h3>
          <p className="text-gray-600 ">
            Rejuvenate your body and mind with our world-class spa and wellness
            facilities.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Services
