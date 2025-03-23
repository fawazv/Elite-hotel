import React from "react";
import NavButton from "@/components/ui/NavButton";
import Link from "next/link";

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  dropdownOpen: boolean;
  setDropdownOpen: (dropdownOpen: boolean) => void;
  isAuthenticated?: boolean;
};

export default function Sidebar({
  open,
  setOpen,
  dropdownOpen,
  setDropdownOpen,
  isAuthenticated,
}: SidebarProps) {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-72 bg-white shadow-lg transform ${
        open ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 ease-in-out z-50 lg:hidden`}
    >
      <div className="p-8 h-full flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <span className="text-primary font-bold text-xl font-serif">
            Elite Hotel
          </span>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-gray-900"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="flex  flex-col gap-6 text-lg h-full">
          {/* {isAdmin && (
          <Link
            href="/admin"
            className="text-gray-800 hover:text-primary transition-colors"
            onClick={() => setOpen(false)}
          >
            Admin
          </Link>
        )} */}
          <NavButton href="/" open={open} onClick={() => setOpen(false)}>
            Browse all rooms
          </NavButton>
          <NavButton href="/admin" open={open} onClick={() => setOpen(false)}>
            Admin
          </NavButton>
          <NavButton
            href="/bookings"
            open={open}
            onClick={() => setOpen(false)}
          >
            Find my booking
          </NavButton>
          {isAuthenticated ? (
            <>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="account-dropdown text-left text-gray-800 hover:text-primary transition-colors flex items-center justify-between"
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
                  className={`ml-2 transform transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {dropdownOpen && (
                <div className="ml-4 flex flex-col gap-4">
                  <Link
                    href="/account/profile"
                    className="text-gray-700 hover:text-primary transition-colors"
                    onClick={() => {
                      setDropdownOpen(false);
                      setOpen(false);
                    }}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/signout"
                    className="text-gray-700 hover:text-primary transition-colors"
                    onClick={() => {
                      setDropdownOpen(false);
                      setOpen(false);
                    }}
                  >
                    Sign out
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="mt-auto flex flex-col gap-4">
              <Link
                href="/signin"
                className="bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors text-center"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="border border-primary  text-primary py-3 rounded-lg font-medium hover:bg-primary/10 transition-colors text-center"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
