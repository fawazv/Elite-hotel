const Contact = () => {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-4xl lg:text-5xl font-bold text-gray-900  mb-8">
        Ready to Experience Luxury?
      </h2>
      <p className="text-xl text-gray-600  mb-12 leading-relaxed">
        Book your stay with us today and discover what makes Elite Hotel the
        perfect choice for discerning travelers.
      </p>
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <button className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
          Book Now
        </button>
        <button className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105">
          Contact Us
        </button>
      </div>

      <div className="mt-16 grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <h4 className="font-semibold text-gray-900  mb-2">Phone</h4>
          <p className="text-gray-600 ">+1 (555) 123-4567</p>
        </div>
        <div className="text-center">
          <h4 className="font-semibold text-gray-900  mb-2">Email</h4>
          <p className="text-gray-600 ">info@elitehotel.com</p>
        </div>
        <div className="text-center">
          <h4 className="font-semibold text-gray-900  mb-2">Address</h4>
          <p className="text-gray-600 ">123 Luxury Ave, City Center</p>
        </div>
      </div>
    </div>
  )
}

export default Contact
