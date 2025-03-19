"use client";
import Image from "next/image";
import Link from "next/link";
import { StarRating } from "./StarRating";
import { Badge } from "./Badge";

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

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <div className="flex flex-col md:flex-row border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20 focus-within:ring-2 focus-within:ring-primary/20">
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
          <h3 className="text-xl font-bold text-gray-800">{room.name}</h3>
          <div className="flex items-center mt-2 md:mt-0">
            <StarRating rating={4.0} />
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
            <Badge key={index} label={amenity} />
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
  );
}
