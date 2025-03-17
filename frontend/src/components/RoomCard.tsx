//components/RoomCard.tsx
import Image from "next/image";
import Link from "next/link";

const rooms = [
  {
    id: 1,
    name: "Single Bed",
    price: 99,
    image: "/rooms/Room1.png",
    amenities: ["Free WiFi", "TV", "Breakfast"],
    size: "25m²",
    capacity: "1 Person",
  },
  {
    id: 2,
    name: "Triple Suite",
    price: 199,
    image: "/rooms/Room2.png",
    amenities: ["Free WiFi", "Minibar", "Balcony"],
    size: "45m²",
    capacity: "3 People",
  },
  {
    id: 3,
    name: "Single Suite",
    price: 149,
    image: "/rooms/Room3.png",
    amenities: ["Free WiFi", "Workspace", "Breakfast"],
    size: "35m²",
    capacity: "1 Person",
  },
  {
    id: 4,
    name: "Beach View",
    price: 249,
    image: "/rooms/Room4.png",
    amenities: ["Ocean View", "Balcony", "Breakfast"],
    size: "40m²",
    capacity: "2 People",
  },
];

export default function RoomCard() {
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
        {rooms.map((room) => (
          <div
            key={room.id}
            className="group bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl"
          >
            <div className="relative h-60 overflow-hidden">
              <Image
                src={room.image}
                alt={room.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="transition-transform duration-700 group-hover:scale-110 object-cover"
              />
              <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                ${room.price}/night
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {room.name}
              </h3>

              <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
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
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  </svg>
                  {room.size}
                </div>
                <div className="flex items-center gap-1">
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
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                  >
                    {amenity}
                  </span>
                ))}
              </div>

              <Link href={`/rooms/${room.id} `}>
                <button className="w-full bg-primary/10 text-primary font-medium py-2 rounded-lg transition-colors hover:bg-primary hover:text-white">
                  View Details
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/rooms"
          className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Browse All Rooms
        </Link>
      </div>
    </section>
  );
}
