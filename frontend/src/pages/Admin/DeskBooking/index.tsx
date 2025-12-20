
import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  User, 
  CreditCard, 
  CheckCircle,
  Users,
  BedDouble
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store/store';
import * as reservationApi from '@/services/reservationApi';
// Mock data for rooms - replace with API call
import { searchAvailableRooms } from '@/services/publicApi';

const DeskBooking: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'admin';
  
  const [step, setStep] = useState(1);
  const [searchParams, setSearchParams] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [guestDetails, setGuestDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Use existing public API to find rooms
      const rooms = await searchAvailableRooms(searchParams);
      // Filter out occupied/dirty if API doesn't already
      setAvailableRooms(rooms);
      setStep(2);
    } catch (error) {
      toast.error('Failed to search rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = async () => {
    try {
      setIsLoading(true);
      // Construct reservation payload
      const reservationData = {
        roomId: selectedRoom.id,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        adults: searchParams.guests,
        children: 0,
        guestDetails: {
          firstName: guestDetails.firstName,
          lastName: guestDetails.lastName,
          email: guestDetails.email,
          phoneNumber: guestDetails.phone
        },
        paymentProvider: 'Offline',
        requiresPrepayment: paymentMethod === 'pay_later',
        source: isAdmin ? 'Admin' : 'FrontDesk',
        notes: isAdmin 
          ? `Booked by Admin (${user?.fullName || 'System'}). Payment: ${paymentMethod}` 
          : `Desk booking via Receptionist. Payment: ${paymentMethod}`
      };

      await reservationApi.createReservation(reservationData);
      toast.success('Booking confirmed successfully!');
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/receptionist/dashboard');
      }
    } catch (error) {
       console.error(error);
      toast.error('Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Desk Booking</h1>
          <p className="text-gray-500 mt-1">Create a new reservation for walk-in guests</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</span>
          <div className={`w-12 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
          <div className={`w-12 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Step 1: Search */}
        {step === 1 && (
          <div className="p-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Check Availability
            </h2>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={searchParams.checkIn}
                  onChange={(e) => {
                    const newCheckIn = e.target.value;
                    const nextDay = new Date(newCheckIn);
                    nextDay.setDate(nextDay.getDate() + 1);
                    const nextDayStr = nextDay.toISOString().split('T')[0];
                    
                    setSearchParams(prev => ({
                      ...prev,
                      checkIn: newCheckIn,
                      checkOut: prev.checkOut <= newCheckIn ? nextDayStr : prev.checkOut
                    }));
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                <input
                  type="date"
                  required
                  min={searchParams.checkIn ? new Date(new Date(searchParams.checkIn).getTime() + 86400000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                  value={searchParams.checkOut}
                  onChange={(e) => setSearchParams({...searchParams, checkOut: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
                <div className="relative">
                  <Users className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                  <select
                    value={searchParams.guests}
                    onChange={(e) => setSearchParams({...searchParams, guests: parseInt(e.target.value)})}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    {[1,2,3,4,5,6].map(num => (
                      <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {isLoading ? 'Searching...' : (
                    <>
                      <Search className="w-5 h-5" />
                      Search Rooms
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Select Room */}
        {step === 2 && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-blue-600" />
                Select Room
              </h2>
              <button 
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Change Dates
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableRooms.length > 0 ? availableRooms.map((room) => (
                <div 
                  key={room._id}
                  onClick={() => { setSelectedRoom(room); setStep(3); }}
                  className="border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-lg font-bold text-gray-900">Room {room.number}</span>
                    <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Available</span>
                  </div>
                  <p className="text-gray-600 mb-2">{room.type}</p>
                  <p className="text-2xl font-bold text-blue-600">${room.price}<span className="text-sm text-gray-500 font-normal">/night</span></p>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 group-hover:text-blue-600">
                    <span>Select Room</span>
                    <span className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">→</span>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No rooms available for the selected dates.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Guest & Payment */}
        {step === 3 && selectedRoom && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Guest Details & Payment
              </h2>
              <button 
                onClick={() => setStep(2)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Back to Rooms
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Guest Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        required
                        value={guestDetails.firstName}
                        onChange={(e) => setGuestDetails({...guestDetails, firstName: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={guestDetails.lastName}
                        onChange={(e) => setGuestDetails({...guestDetails, lastName: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      required
                      value={guestDetails.email}
                      onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      required
                      value={guestDetails.phone}
                      onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {['cash', 'card_machine', 'pay_later'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`p-4 rounded-lg border text-center transition-all ${paymentMethod === method ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <CreditCard className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === method ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium capitalize">{method.replace('_', ' ')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-medium mb-4">Booking Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Room</span>
                    <span className="font-medium">{selectedRoom.number} ({selectedRoom.type})</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Dates</span>
                    <span className="font-medium">{searchParams.checkIn} to {searchParams.checkOut}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Price per night</span>
                    <span className="font-medium">${selectedRoom.price}</span>
                  </div>
                  <div className="flex justify-between py-2 text-lg font-bold text-blue-600">
                    <span>Total Amount</span>
                    {/* Calculate total days * price */}
                    <span>
                      ${
                        selectedRoom.price * 
                        Math.ceil((new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime()) / (1000 * 60 * 60 * 24))
                      }
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={isLoading || !guestDetails.firstName || !guestDetails.email}
                  className="w-full mt-8 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Processing...' : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeskBooking;
