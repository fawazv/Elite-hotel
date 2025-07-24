"use client";

// components/Testimonials.tsx
import { useState } from "react";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    position: "Business Traveler",
    image: "/api/placeholder/80/80",
    quote:
      "The Elite Hotel exceeded all my expectations. The rooms are spacious and elegant, and the staff went above and beyond to accommodate my needs during my business trip.",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    position: "Family Vacation",
    image: "/api/placeholder/80/80",
    quote:
      "We stayed in the family suite and it was perfect! The kids loved the pool, and the breakfast buffet had something for everyone. We'll definitely be coming back.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emma Davis",
    position: "Honeymoon Stay",
    image: "/api/placeholder/80/80",
    quote:
      "Our honeymoon at Elite Hotel was absolutely magical. The beach view suite was stunning, and the special touches like champagne and rose petals made our stay unforgettable.",
    rating: 5,
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToNext = () => {
    setActiveIndex((current) =>
      current === testimonials.length - 1 ? 0 : current + 1
    );
  };

  const goToPrev = () => {
    setActiveIndex((current) =>
      current === 0 ? testimonials.length - 1 : current - 1
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <svg
        key={index}
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={index < rating ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={index < rating ? "text-yellow-400" : "text-gray-300"}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    ));
  };

  return (
    <section className="py-16 bg-neutral-50">
      <div className="text-center mb-12">
        <span className="text-primary font-medium">Testimonials</span>
        <h2 className="text-3xl font-serif font-bold mt-2 mb-4">
          What Our Guests Say
        </h2>
        <div className="w-16 h-1 bg-primary mx-auto"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="relative">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`transition-opacity duration-500 ${
                  activeIndex === index
                    ? "opacity-100"
                    : "opacity-0 absolute inset-0"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-5">
                  <div className="bg-primary text-white p-8 flex flex-col items-center justify-center md:col-span-2">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white mb-4">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-bold">{testimonial.name}</h3>
                    <p className="text-white/80">{testimonial.position}</p>
                    <div className="flex mt-3">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>

                  <div className="p-8 md:p-12 flex flex-col justify-center md:col-span-3">
                    <svg
                      className="text-primary h-12 w-12 mb-6 opacity-20"
                      fill="currentColor"
                      viewBox="0 0 32 32"
                      aria-hidden="true"
                    >
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                    <p className="text-xl text-gray-600 italic mb-6">
                      {testimonial.quote}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <button
          onClick={goToPrev}
          className="absolute left-2 md:-left-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="Previous testimonial"
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
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 md:-right-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="Next testimonial"
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
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        {/* Dots indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                activeIndex === index ? "bg-primary" : "bg-gray-300"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}
