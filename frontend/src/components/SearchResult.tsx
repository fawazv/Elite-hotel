"use client";
import { useState, useEffect } from "react";
import { RoomCard } from "@/components/ui/RoomCard";
import { Pagination } from "@/components/ui/Pagination";
import { SortSelect } from "@/components/ui/SortSelect";

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
  totalPages = Math.ceil(demoResults.length / 4),
}: SearchResultsProps) {
  const [page, setPage] = useState(currentPage);
  const [sortOption, setSortOption] = useState("recommended");
  const [filteredResults, setFilteredResults] = useState<Room[]>([]);
  const [displayedResults, setDisplayedResults] = useState<Room[]>([]);
  const roomsPerPage = 4;
  console.log(displayedResults);

  // Apply sorting and filtering to results
  useEffect(() => {
    let sorted = [...results];

    // Apply sorting
    switch (sortOption) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating-desc":
        // Assuming we had a rating property, for now this just keeps the original order
        break;
      default:
        // "recommended" - default sorting or could be based on other criteria
        break;
    }

    setFilteredResults(sorted);
  }, [results, sortOption]);

  // Calculate displayed results based on current page
  useEffect(() => {
    const startIndex = (page - 1) * roomsPerPage;
    const endIndex = startIndex + roomsPerPage;
    setDisplayedResults(filteredResults.slice(startIndex, endIndex));
  }, [filteredResults, page]);

  // Calculate total pages based on filtered results
  const calculatedTotalPages = Math.ceil(filteredResults.length / roomsPerPage);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    scrollToSearchResults();
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value);
    setPage(1); // Reset to first page when sorting changes
  };

  const handleClearSearch = () => {
    setPage(1);
    setSortOption("recommended");
    scrollToSearchResults();
  };

  const scrollToSearchResults = () => {
    setTimeout(() => {
      // Reset the search and scroll to the section element
      const sectionElement = document.querySelector(".search-result");

      if (sectionElement) {
        // Calculate position with offset for space at the top
        const elementPosition = sectionElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 80; // 80px space at the top

        // Scroll to that position
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      } else {
        // Fallback to scrolling to the top of the page if element not found
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 100); // Small delay to ensure DOM updates
  };

  return (
    <section className="search-result max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl font-serif font-bold">Search Results</h2>
            <p className="text-gray-600 mt-1">
              Found {filteredResults.length} rooms matching your criteria
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <SortSelect value={sortOption} onChange={handleSortChange} />
          </div>
        </div>

        <div className="space-y-6">
          {displayedResults.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>

        {/* Show message when no results */}
        {displayedResults.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-600">
              No rooms match your criteria
            </p>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={calculatedTotalPages}
          onPageChange={handlePageChange}
        />

        <div className="mt-8 text-center">
          <button
            onClick={handleClearSearch}
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

// Demo data to show search results - would be replaced with actual API data
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
    name: "Deluxe Single",
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
  {
    id: 4,
    name: "Garden View",
    type: "Deluxe",
    price: 189,
    image: "/rooms/Room3.png",
    description:
      "Elegant room with a private balcony overlooking our beautiful gardens.",
    amenities: [
      "Free WiFi",
      "TV",
      "Breakfast",
      "Premium Bedding",
      "Coffee Machine",
      "Balcony",
    ],
    size: "35m²",
    capacity: "2 People",
  },
  {
    id: 5,
    name: "Junior Suite",
    type: "Premium",
    price: 219,
    image: "/rooms/Room2.png",
    description:
      "Spacious junior suite with separate living area and luxury amenities.",
    amenities: [
      "Free WiFi",
      "TV",
      "Breakfast",
      "Mini Bar",
      "Coffee Machine",
      "Sitting Area",
    ],
    size: "45m²",
    capacity: "2-3 People",
  },
  {
    id: 6,
    name: "Executive Suite",
    type: "Premium",
    price: 299,
    image: "/rooms/Room4.png",
    description:
      "Our finest accommodation with panoramic views, separate bedroom, and exclusive amenities.",
    amenities: [
      "Free WiFi",
      "TV",
      "Breakfast",
      "Mini Bar",
      "Coffee Machine",
      "Bathtub",
      "Panoramic View",
      "Butler Service",
    ],
    size: "65m²",
    capacity: "2-4 People",
  },
];
