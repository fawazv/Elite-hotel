// components/HeroSection.tsx
import Image from "next/image";
import { PT_Serif } from "next/font/google";

const ptSerifBold = PT_Serif({
  subsets: ["latin"],
  weight: "700",
});

export default function HeroSection() {
  return (
    <section className="relative w-full h-[90vh] overflow-hidden">
      {/* Hero Image */}
      <Image
        src="/Hotel.jpg"
        fill
        sizes="100vw"
        quality={100}
        alt="Elite Hotel"
        priority
        className="transition-transform duration-10000 scale-105 animate-slow-zoom object-cover"
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>

      {/* Hero Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white container mx-auto px-4">
        <div className="text-center max-w-4xl">
          <span className="inline-block bg-primary px-4 py-1 rounded-full text-sm font-medium mb-6">
            Welcome to the Elite Experience
          </span>
          <h1
            className={`${ptSerifBold.className} text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6`}
          >
            LUXURY REDEFINED
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Experience unparalleled comfort and impeccable service at the heart
            of the city
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all">
              Book Your Stay
            </button>
            <button className="bg-white/10 text-white border border-white/30 backdrop-blur-sm px-8 py-3 rounded-lg font-medium hover:bg-white/20 transition-all">
              Explore Rooms
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Accent Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-primary"></div>
    </section>
  );
}
