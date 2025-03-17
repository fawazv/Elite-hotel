// components/Services.tsx
import Image from "next/image";
import {
  FaWifi,
  FaSwimmingPool,
  FaParking,
  FaUtensils,
  FaTshirt,
  FaSnowflake,
} from "react-icons/fa";

export default function Services() {
  const services = [
    {
      icon: <FaWifi />,
      title: "WiFi",
      description:
        "Stay connected with high-speed internet access throughout your stay.",
    },
    {
      icon: <FaUtensils />,
      title: "Breakfast",
      description:
        "Start your day with our delicious international breakfast buffet with local specialties.",
    },
    {
      icon: <FaTshirt />,
      title: "Laundry",
      description:
        "Keep your clothes clean and fresh with our premium laundry and dry cleaning service.",
    },
    {
      icon: <FaSwimmingPool />,
      title: "Pool",
      description:
        "Relax and enjoy our temperature-controlled swimming pool with stunning views.",
    },
    {
      icon: <FaParking />,
      title: "Parking",
      description:
        "Secure on-site parking with 24/7 surveillance and valet service available.",
    },
    {
      icon: <FaSnowflake />,
      title: "Air conditioning",
      description:
        "Individual climate control systems in all rooms for your optimal comfort.",
    },
  ];

  return (
    <section className="relative py-16">
      <div className="text-center mb-16">
        <span className="text-primary font-medium">Hotel Amenities</span>
        <h2 className="text-3xl font-serif font-bold mt-2 mb-4">
          Our Premium Services
        </h2>
        <div className="w-16 h-1 bg-primary mx-auto"></div>
      </div>

      {/* Featured Service Image */}
      <div className="relative h-[500px] rounded-2xl overflow-hidden mb-16">
        <Image
          src="/Hotel.jpg"
          alt="Elite Hotel Services"
          fill
          className="transition-transform duration-700 hover:scale-105 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8 md:p-12">
          <div className="max-w-2xl">
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              Experience Luxury Like Never Before
            </h3>
            <p className="text-white/90 text-lg mb-6">
              Our dedicated staff ensures your comfort with attention to every
              detail, creating a memorable stay experience at Elite Hotel.
            </p>
            <button className="bg-white text-primary px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Explore More
            </button>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.title}
            className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-100"
          >
            <div className="bg-primary/10 text-primary p-4 inline-block rounded-lg mb-4 text-3xl">
              {service.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {service.title}
            </h3>
            <p className="text-gray-600">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
