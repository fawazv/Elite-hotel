// components/RoomBookingSearch.tsx
"use client";
import { useState } from "react";
import InputField from "./ui/SearchInputField";

export default function RoomBookingSearch() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomType, setRoomType] = useState("");
  const [guests, setGuests] = useState("2");

  const roomTypeOptions = [
    { value: "", label: "Select a Room Type" },
    { value: "single", label: "Single Bed" },
    { value: "double", label: "Double Bed" },
    { value: "suite", label: "Suite" },
    { value: "family", label: "Family Room" },
  ];

  const guestsOptions = [
    { value: "1", label: "1 Guest" },
    { value: "2", label: "2 Guests" },
    { value: "3", label: "3 Guests" },
    { value: "4", label: "4 Guests" },
    { value: "5", label: "5+ Guests" },
  ];

  const calendarIcon = (
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
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );

  const dropdownIcon = (
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
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-20 relative z-20">
      <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
        <h2 className="text-2xl font-serif font-bold mb-6 text-center">
          Find Your Perfect Room
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InputField
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            label="Check-in Date"
            icon={calendarIcon}
          />

          <InputField
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            label="Check-out Date"
            icon={calendarIcon}
          />

          <InputField
            type="select"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            label="Room Type"
            options={roomTypeOptions}
            icon={dropdownIcon}
          />

          <InputField
            type="select"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            label="Guests"
            options={guestsOptions}
            icon={dropdownIcon}
          />
        </div>

        <div className="mt-8">
          <button className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
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
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Search Available Rooms
          </button>
        </div>
      </div>
    </section>
  );
}
