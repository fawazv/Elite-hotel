"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Room {
  id: number;
  name: string;
  type: string;
  price: number;
  image: string;
  description: string;
  amenities: string[];
  size: string;
  capacity: string;
}

interface SearchResultsProps {
  results?: Room[];
  currentPage?: number;
  totalPages?: number;
}

export default function SearchResults({
  results = demoResults,
  currentPage = 1,
  totalPages = 6,
}: SearchResultsProps) {
  const [page, setPage] = useState(currentPage);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // In a real implementation, you would fetch new results here
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl font-serif font-bold">Search Results</h2>
            <p className="text-gray-600 mt-1">
              Found {results.length} rooms matching your criteria
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <select
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              aria-label="Sort results"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="recommended">Recommended</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {results.map((room) => (
            <div
              key={room.id}
              className="flex flex-col md:flex-row border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20 focus-within:ring-2 focus-within:ring-primary/20"
            >
              <div className="relative w-full md:w-72 h-60">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 280px"
                  className="transition-transform duration-700 group-hover:scale-105 object-cover"
                />
                <div className="absolute top-4 left-4 bg-white text-primary font-medium px-3 py-1 rounded-full text-sm shadow-sm">
                  {room.type}
                </div>
              </div>

              <div className="flex-1 p-6 flex flex-col">
                <div className="flex flex-col md:flex-row justify-between">
                  <h3 className="text-xl font-bold text-gray-800">
                    {room.name}
                  </h3>
                  <div className="flex items-center mt-2 md:mt-0">
                    <div className="flex items-center text-yellow-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="opacity-40"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      <span className="ml-2 text-gray-700 text-sm">4.0</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
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

                <p className="mt-3 text-gray-600">{room.description}</p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {room.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 pt-4 border-t border-gray-100">
                  <div className="text-gray-800">
                    <span className="text-2xl font-bold text-primary">
                      ${room.price}
                    </span>
                    <span className="text-gray-600 text-sm"> / night</span>
                  </div>

                  <Link href={`/rooms/${room.id}`} className="mt-3 sm:mt-0">
                    <button className="w-full sm:w-auto bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all focus:ring-2 focus:ring-primary/50 focus:outline-none">
                      View Room Now
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8">
          <nav className="flex items-center gap-1" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
                    pageNum === page
                      ? "bg-primary text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  aria-label={`Page ${pageNum}`}
                  aria-current={pageNum === page ? "page" : undefined}
                >
                  {pageNum}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </nav>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              // In a real implementation, reset the search
              window.location.href = "/";
            }}
            className="text-gray-600 hover:text-primary flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Clear Search
          </button>
        </div>
      </div>
    </section>
  );
}

// Demo data to show search results
const demoResults: Room[] = [
  {
    id: 1,
    name: "Family Suite 6",
    type: "Premium",
    price: 249,
    image: "/rooms/Room4.png",
    description:
      "Spacious family suite with ocean views, perfect for families looking for comfort and relaxation.",
    amenities: [
      "Free WiFi",
      "Ocean View",
      "Breakfast",
      "Family Friendly",
      "Mini Bar",
    ],
    size: "60m²",
    capacity: "4-6 People",
  },
  {
    id: 2,
    name: "Single View",
    type: "Standard",
    price: 129,
    image: "/rooms/Room1.png",
    description:
      "Cozy single room with a beautiful view of the surrounding landscape, perfect for solo travelers.",
    amenities: ["Free WiFi", "TV", "Breakfast", "Work Desk"],
    size: "25m²",
    capacity: "1 Person",
  },
  {
    id: 3,
    name: "Single View",
    type: "Deluxe",
    price: 149,
    image: "/rooms/Room3.png",
    description:
      "Upscale single room with premium amenities and a stunning view of the property gardens.",
    amenities: [
      "Free WiFi",
      "TV",
      "Breakfast",
      "Premium Bedding",
      "Coffee Machine",
    ],
    size: "30m²",
    capacity: "1 Person",
  },
];
