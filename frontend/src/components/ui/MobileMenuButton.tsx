import React from "react";

type ButtonProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  scrolled: boolean;
};

export default function MobileMenuButton({
  scrolled,
  open,
  setOpen,
}: ButtonProps) {
  return (
    <button
      onClick={() => setOpen(!open)}
      className="lg:hidden focus:outline-none z-50"
      aria-label="Toggle menu"
    >
      <div
        className={`w-6 h-6 flex flex-col justify-around transition-all ${
          open ? "transform rotate-90" : ""
        }`}
      >
        <span
          className={`block w-full h-0.5 transform transition-all duration-300 ${
            open
              ? "rotate-45 translate-y-1.5 bg-gray-800"
              : `${scrolled ? "bg-gray-800" : "bg-white"}`
          }`}
        ></span>
        <span
          className={`block w-full h-0.5 transition-opacity duration-300 ${
            open ? "opacity-0" : `${scrolled ? "bg-gray-800" : "bg-white"}`
          }`}
        ></span>
        <span
          className={`block w-full h-0.5 transform transition-all duration-300 ${
            open
              ? "-rotate-45 -translate-y-1.5 bg-gray-800"
              : `${scrolled ? "bg-gray-800" : "bg-white"}`
          }`}
        ></span>
      </div>
    </button>
  );
}
