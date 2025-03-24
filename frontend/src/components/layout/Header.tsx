// components/Header.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import NavButton from "../ui/NavButton";
import Sidebar from "./Sidebar";
import MobileMenuButton from "../ui/MobileMenuButton";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";

// Add a prop for the user role
export default function Header({}) {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Optimize scroll handler with useCallback
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (dropdownOpen && !target.closest(".account-dropdown")) {
        setDropdownOpen(false);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Add click outside listener - use mousedown and touchstart for better mobile support
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener(
      "touchstart",
      handleClickOutside as EventListener
    );

    // Cleanup function
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener(
        "touchstart",
        handleClickOutside as EventListener
      );
    };
  }, [dropdownOpen, handleScroll]);
  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-lg py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <span
            className={`font-serif text-2xl font-bold ${
              scrolled ? "text-primary" : "text-white"
            }`}
          >
            Elite Hotel
          </span>
        </Link>

        {/* Mobile Menu Button */}
        <MobileMenuButton open={open} scrolled={scrolled} setOpen={setOpen} />

        {/* Sidebar Overlay */}
        {open && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setOpen(false)}
          ></div>
        )}
        {/* Sidebar */}
        <Sidebar
          open={open}
          setOpen={setOpen}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          isAuthenticated={isAuthenticated}
        />

        {/* Desktop Menu */}
        <nav className="hidden lg:flex gap-8 items-center">
          {/* {isAdmin && (
            <Link
              href="/admin"
              className={`font-medium transition-colors ${
                scrolled
                  ? "text-gray-800 hover:text-primary"
                  : "text-white hover:text-white/80"
              }`}
            >
              Admin
            </Link>
          )} */}

          <NavButton href="/rooms" scrolled={scrolled}>
            Browse all rooms
          </NavButton>
          <NavButton href="/admin" scrolled={scrolled}>
            Admin
          </NavButton>
          <NavButton href="/bookings" scrolled={scrolled}>
            Find my booking
          </NavButton>
          {isAuthenticated ? (
            <div className="relative account-dropdown">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`font-medium transition-colors flex items-center gap-2 ${
                  scrolled
                    ? "text-gray-800 hover:text-primary"
                    : "text-white hover:text-white/80"
                }`}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                Account
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
                  className={`transform transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <Link
                    href="/account/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/signout"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Sign out
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/signin"
                className={`${
                  scrolled
                    ? "bg-white text-primary border-primary hover:bg-gray-50/75 transition-colors"
                    : "bg-white/5 text-white border border-white/30 backdrop-blur-sm hover:bg-white/20 transition-all"
                }  px-5 py-2 rounded-lg font-medium border `}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-primary text-white px-5 py-2 rounded-lg font-medium hover:bg-primary/75 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
