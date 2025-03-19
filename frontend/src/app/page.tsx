// page.tsx
import Header from "@/components/layout/Header";
import HeroSection from "@/components/HeroSection";
import RoomCard from "@/components/RoomCard";
import Services from "@/components/Services";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/layout/Footer";
import RoomBookingSearch from "@/components/RoomBookingSearch";
import Testimonials from "@/components/Testimonials";
import SearchResults from "@/components/SearchResult";

export default function Home() {
  // Replace this with your actual role-checking logic
  // const userIsAdmin = user?.role === 'admin';

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* <Header isAdmin={userIsAdmin} /> */}
      <Header />
      <HeroSection />
      <RoomBookingSearch />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24">
        <SearchResults />
        <RoomCard />
        <Services />
        <Testimonials />
        <ContactForm />
      </div>
      <Footer />
    </div>
  );
}
