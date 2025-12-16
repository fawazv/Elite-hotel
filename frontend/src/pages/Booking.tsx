import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { format, addDays, differenceInCalendarDays } from 'date-fns'
import {
  fetchPublicRoomById,
  getQuote,
  createPublicReservation,
  searchAvailableRooms,
  type PublicRoom,
  type QuoteResponse,
  type GuestDetails,
  lookupGuest,
} from '@/services/publicApi'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { z } from 'zod'
import StripePaymentModal from '@/components/shared/StripePaymentModal'
import { useRazorpay } from '@/Hooks/useRazorpay'

// ============= STEPS =============
// 1. Review
// 2. Guest Details
// 3. Payment
// 4. Confirmation

const Booking: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [step, setStep] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [room, setRoom] = useState<PublicRoom | null>(null)
  
  // Booking Data State
  const [checkIn, setCheckIn] = useState<string>(
    searchParams.get('checkIn') || format(new Date(), 'yyyy-MM-dd')
  )
  const [checkOut, setCheckOut] = useState<string>(
    searchParams.get('checkOut') || format(addDays(new Date(), 1), 'yyyy-MM-dd')
  )
  const [guests, setGuests] = useState<number>(() => {
      const g = searchParams.get('guests')
      return g ? parseInt(g) : 0 // 0 indicates "not set yet" (will fallback to room capacity)
  })

  // Track if guests value came from URL or user interaction, to avoid overriding user choice with room capacity
  const [guestsSetByUser, setGuestsSetByUser] = useState<boolean>(!!searchParams.get('guests'))

  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  })
  
  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [paymentProvider, setPaymentProvider] = useState<'Stripe' | 'Razorpay'>('Razorpay')
  const [confirmedReservation, setConfirmedReservation] = useState<any>(null)
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null)
  const [showStripeModal, setShowStripeModal] = useState<boolean>(false)
  
  // Availability State
  const [isCheckingAvailability, setIsCheckingAvailability] = useState<boolean>(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)

  // Guest Lookup State
  const [isGuestLookupMode, setIsGuestLookupMode] = useState<boolean>(true)
  const [lookupValue, setLookupValue] = useState<string>('')
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false)
  
  const isRazorpayLoaded = useRazorpay()

  // 1. Fetch Room Details
  useEffect(() => {
    if (!roomId) return

    const loadRoom = async () => {
      try {
        setIsLoading(true)
        const roomData = await fetchPublicRoomById(roomId)
        setRoom(roomData)
        
        // If guests wasn't set by URL, default to room capacity
        if (!guestsSetByUser) {
             setGuests(roomData.capacity || 2)
        } else if (guests === 0) {
             setGuests(roomData.capacity || 2)
        }

        setIsLoading(false)
      } catch (err) {
        toast.error('Failed to load room details')
        navigate('/rooms')
      }
    }
    loadRoom()
  }, [roomId, navigate]) // Removed guestsSetByUser dependency to avoid loop, it's init logic

  // 2. Check Availability and Fetch Quote when dependencies change
  useEffect(() => {
    const checkAvailabilityAndQuote = async () => {
      if (!roomId || !checkIn || !checkOut || !guests || !room) return
      
      // Basic validation
      if (new Date(checkIn) >= new Date(checkOut)) {
          setAvailabilityError("Check-out date must be after check-in date")
          setQuote(null)
          return
      }

      try {
        setIsCheckingAvailability(true)
        setAvailabilityError(null)
        setQuote(null)

        // 1. Check if room is available
        // We search for available rooms of this type. If our room ID is in the list, it's available.
        const availableRooms = await searchAvailableRooms({
            checkIn,
            checkOut,
            adults: guests,
            // Removed type filter to avoid mismatches - we only care if OUR roomId is in the available list
        })

        // Backend might return id or _id depending on the service (Reservation Service returns 'id' from adapter, Room Service returns '_id')
        const isAvailable = availableRooms.some(r => r._id === roomId || (r as any).id === roomId)

        if (!isAvailable) {
            setAvailabilityError("This room is not available for the selected dates.")
            setIsCheckingAvailability(false)
            return
        }

        // 2. If available, get quote
        const quoteData = await getQuote({
          roomId,
          checkIn,
          checkOut,
          adults: guests,
          currency: 'INR',
        })
        setQuote(quoteData)
        // Reset processing state
      } catch (err) {
        console.error("Failed to check availability or get quote", err)
        setAvailabilityError("Failed to verify availability. Please try again.")
        setQuote(null)
      } finally {
        setIsCheckingAvailability(false)
      }
    }

    checkAvailabilityAndQuote()
  }, [roomId, checkIn, checkOut, guests, room])

  const handleCreateReservation = async () => {
    if (!roomId || !quote) return
    
    try {
      setIsLoading(true)
      const res = await createPublicReservation({
        roomId,
        checkIn,
        checkOut,
        adults: guests,
        guestDetails,
        paymentProvider,
        requiresPrepayment: true,
        currency: quote.currency,
      })
      
      if (res.status === 'PendingPayment') {
        if (paymentProvider === 'Razorpay' && res.paymentOrder) {
          handleRazorpayPayment(res)
        } else if (paymentProvider === 'Stripe' && res.paymentClientSecret) {
          setStripeClientSecret(res.paymentClientSecret)
          setConfirmedReservation(res) // Temporary save for reference
          setShowStripeModal(true)
        }
      } else {
        setConfirmedReservation(res)
        setStep(4)
      }
      setIsLoading(false)
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to create reservation')
      setIsLoading(false)
    }
  }

  const handleGuestLookup = async () => {
    if (!lookupValue) return
    
    setIsLookingUp(true)
    try {
        const emailSchema = z.string().email()
        const phoneSchema = z.string().min(10) // Basic length check for phone

        const isEmail = emailSchema.safeParse(lookupValue).success
        const isPhone = !isEmail && phoneSchema.safeParse(lookupValue).success

        if (!isEmail && !isPhone) {
            toast.error("Please enter a valid email address or phone number")
            setIsLookingUp(false)
            return
        }

        const email = isEmail ? lookupValue : undefined
        const phone = isPhone ? lookupValue : undefined
        
        const guest = await lookupGuest(email, phone)
        
        if (guest) {
            setGuestDetails({
                firstName: guest.firstName,
                lastName: guest.lastName || '',
                email: guest.email,
                phoneNumber: guest.phoneNumber
            })
            setIsGuestLookupMode(false)
            toast.success(`Welcome back, ${guest.firstName}!`)
            setStep(3) // Skip to payment
        } else {
             // Not found, switch to full form and pre-fill
             setIsGuestLookupMode(false)
             setGuestDetails(prev => ({
                 ...prev,
                 email: isEmail ? lookupValue : prev.email,
                 phoneNumber: isPhone ? lookupValue : prev.phoneNumber
             }))
             toast.info("We couldn't find your details. Please enter them below.")
        }
    } catch (err) {
        console.error(err)
        // On error, just show form
        setIsGuestLookupMode(false)
    } finally {
        setIsLookingUp(false)
    }
  }

  const handleRazorpayPayment = (reservation: any) => {
    if (!isRazorpayLoaded) {
      toast.error('Payment gateway not ready. Please refresh.')
      return
    }
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: reservation.paymentOrder.amount,
      currency: reservation.paymentOrder.currency,
      name: 'Elite Hotel',
      description: `Booking for ${room?.name}`,
      order_id: reservation.paymentOrder.id,
      handler: async function () {
        setConfirmedReservation(reservation)
        setStep(4)
        toast.success('Payment Successful!')
      },
      prefill: {
        name: `${guestDetails.firstName} ${guestDetails.lastName}`,
        email: guestDetails.email,
        contact: guestDetails.phoneNumber,
      },
      theme: {
        color: '#3399cc',
      },
    }

    const rzp1 = new (window as any).Razorpay(options)
    rzp1.open()
  }

  if (isLoading && step === 1 && !room) {
    return <LoadingSpinner />
  }

  if (!room) return null

  const steps = [
      { id: 1, label: 'Review' },
      { id: 2, label: 'Guest Details' },
      { id: 3, label: 'Payment' },
      { id: 4, label: 'Confirmation' },
  ]
  
  // Calculate nights
  const nights = quote?.nights || (checkIn && checkOut ? Math.max(1, differenceInCalendarDays(new Date(checkOut), new Date(checkIn))) : 1)

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Step Indicator */}
        <div className="mb-12 relative">
            <div className="flex justify-between items-center relative z-10 max-w-4xl mx-auto">
              {steps.map((s) => (
                <div key={s.id} className="flex flex-col items-center">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                       step >= s.id ? 'bg-primary-600 border-primary-600 text-white shadow-lg scale-110' : 'bg-white border-gray-300 text-gray-400'
                   }`}>
                     {step > s.id ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                     ) : s.id}
                   </div>
                   <span className={`mt-2 text-xs font-semibold uppercase tracking-wider ${step >= s.id ? 'text-primary-800' : 'text-gray-400'}`}>
                       {s.label}
                   </span>
                </div>
              ))}
            </div>
            {/* Connecting Line */}
             <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-0 hidden md:block" style={{ left: '10%', width: '80%' }}>
                <div className="h-full bg-primary-200 transition-all duration-500 ease-out" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}></div>
             </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-gray-100">
             
             {/* Step 1: Summary / Review */}
             {step === 1 && (
               <div className="p-8 md:p-12">
                 <h2 className="text-3xl font-bold text-gray-900 mb-8 font-heading">Review Your Booking</h2>
                 
                 <div className="flex flex-col md:flex-row gap-8 mb-10">
                    <div className="w-full md:w-1/2">
                        <img 
                            src={room.image?.url || room.images?.[0]?.url} 
                            alt={room.name} 
                            className="w-full h-64 object-cover rounded-2xl shadow-md" 
                        />
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col justify-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{room.name}</h3>
                      <p className="text-primary-600 font-medium mb-4">Room #{room.number}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                          {room.amenities?.slice(0, 5).map(amenity => (
                              <span key={amenity} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wide">
                                  {amenity}
                              </span>
                          ))}
                      </div>

                      <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-100">
                           <div className="flex justify-between items-center text-sm">
                               <label className="text-gray-500 font-medium w-24">Check-in:</label>
                               <input 
                                   type="date"
                                   value={checkIn}
                                   min={format(new Date(), 'yyyy-MM-dd')}
                                   onChange={(e) => setCheckIn(e.target.value)}
                                   className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 outline-none"
                               />
                           </div>
                           <div className="flex justify-between items-center text-sm">
                               <label className="text-gray-500 font-medium w-24">Check-out:</label>
                               <input 
                                   type="date"
                                   value={checkOut}
                                   min={checkIn ? format(addDays(new Date(checkIn), 1), 'yyyy-MM-dd') : format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                                   onChange={(e) => setCheckOut(e.target.value)}
                                   className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 outline-none"
                               />
                           </div>
                           <div className="flex justify-between items-center text-sm">
                               <span className="text-gray-500 font-medium">Nights:</span>
                               <span className="text-gray-900 font-semibold">{nights}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                               <label className="text-gray-500 font-medium w-24">Guests:</label>
                               <input 
                                   type="number"
                                   min="1"
                                   max={room.capacity}
                                   value={guests}
                                   onChange={(e) => {
                                       setGuests(parseInt(e.target.value))
                                       setGuestsSetByUser(true)
                                   }}
                                   className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 outline-none text-right"
                               />
                               <span className="ml-2 text-xs text-gray-400">(Max {room.capacity})</span>
                           </div>
                      </div>
                    </div>
                 </div>
                 
                 {/* Availability Loading/Error State */}
                 <div className="mb-8">
                    {isCheckingAvailability ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            <span className="ml-3 text-gray-500 font-medium">Checking availability...</span>
                        </div>
                    ) : availabilityError ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center">
                            <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <div>
                                <p className="font-bold">Not Available</p>
                                <p className="text-sm">{availabilityError}</p>
                            </div>
                        </div>
                    ) : (
                        null
                    )}
                 </div>

                 {/* Quote Display - Only show if available and quoted */}
                 {quote && !isCheckingAvailability && !availabilityError && (
                    <div className="border-t border-gray-100 pt-8">
                         <div className="bg-primary-50 p-6 rounded-2xl animate-fadeIn">
                             <h4 className="font-bold text-gray-900 mb-4 text-lg">Price Breakdown</h4>
                             <div className="space-y-3">
                                {quote.breakdown?.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm items-center">
                                        <span className="text-gray-600">{item.label}</span>
                                        <span className="font-medium text-gray-900">{quote.currency} {Math.abs(item.amount).toFixed(2)}</span>
                                    </div>
                                ))}
                             </div>
                             <div className="border-t border-primary-100 mt-4 pt-4 flex justify-between items-center">
                                <span className="font-bold text-xl text-gray-900">Total</span>
                                <span className="font-bold text-2xl text-primary-700">{quote.currency} {quote.total.toFixed(2)}</span>
                             </div>
                         </div>
                    </div>
                 )}
                 
                 {!quote && !isCheckingAvailability && !availabilityError && (
                    <div className="border-t border-gray-100 pt-8 text-center text-gray-500">
                        Enter valid dates to see price breakdown.
                    </div>
                 )}
                 
                 <div className="mt-10 flex justify-end">
                    <button 
                    onClick={() => setStep(2)}
                    disabled={!quote || !!availabilityError || isCheckingAvailability}
                    className="w-full md:w-auto px-10 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    Continue to Guest Details
                    </button>
                 </div>
               </div>
             )}

             {/* Step 2: Guest Details */}
             {step === 2 && (
               <div className="p-8 md:p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 font-heading">Guest Information</h2>
                
                {isGuestLookupMode ? (
                    <div className="max-w-xl mx-auto space-y-8 animate-fadeIn">
                        <div className="text-center">
                             <p className="text-gray-600 mb-2">Please provide your email or phone number to continue. If you've stayed with us before, we'll find your details.</p>
                             <div className="bg-blue-50 text-blue-800 text-sm px-4 py-3 rounded-lg inline-block border border-blue-100">
                                <span className="flex items-center gap-2">
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                   We'll automatically detect if it's an email or phone number.
                                </span>
                             </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Email or Phone Number</label>
                            <input 
                                type="text"
                                value={lookupValue}
                                onChange={(e) => setLookupValue(e.target.value)}
                                placeholder="Enter email or phone..."
                                className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white text-lg"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleGuestLookup()
                                }}
                            />
                        </div>

                        <button 
                            onClick={handleGuestLookup}
                            disabled={!lookupValue || isLookingUp}
                            className="w-full px-10 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-all shadow-lg flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                            {isLookingUp ? (
                                <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                Finding details...
                                </>
                            ) : (
                                'Continue'
                            )}
                        </button>
                        
                        <div className="text-center pt-4">
                            <button 
                                onClick={() => setIsGuestLookupMode(false)}
                                className="text-primary-700 hover:text-primary-900 font-bold text-sm hover:underline"
                            >
                                I'm a new guest (Enter details manually)
                            </button>
                        </div>
                    </div>
                ) : (
                    <> {/* Manual Entry Form */}
                        <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                            <input 
                                type="text" 
                                value={guestDetails.firstName}
                                onChange={e => setGuestDetails({...guestDetails, firstName: e.target.value})}
                                className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                                placeholder="John"
                                required
                            />
                            </div>
                            <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                            <input 
                                type="text" 
                                value={guestDetails.lastName}
                                onChange={e => setGuestDetails({...guestDetails, lastName: e.target.value})}
                                className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                                placeholder="Doe"
                            />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <input 
                            type="email" 
                            value={guestDetails.email}
                            onChange={e => setGuestDetails({...guestDetails, email: e.target.value})}
                            className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                            placeholder="john@example.com"
                            required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                            <input 
                            type="tel" 
                            value={guestDetails.phoneNumber}
                            onChange={e => setGuestDetails({...guestDetails, phoneNumber: e.target.value})}
                            className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                            placeholder="+1 (555) 000-0000"
                            required
                            />
                        </div>
                        </div>
                        <div className="mt-12 flex flex-col md:flex-row gap-4 justify-between items-center border-t border-gray-100 pt-8">
                        <div className="flex gap-4">
                            <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-800 font-semibold px-4 py-2">Back to Review</button>
                            <button onClick={() => setIsGuestLookupMode(true)} className="text-primary-600 hover:text-primary-800 font-semibold px-4 py-2">Lookup Again</button>
                        </div>
                        <button 
                            onClick={() => setStep(3)}
                            disabled={!guestDetails.firstName || !guestDetails.email || !guestDetails.phoneNumber}
                            className="w-full md:w-auto px-10 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue to Payment
                        </button>
                        </div>
                    </>
                )}
               </div>
             )}

             {/* Step 3: Payment */}
             {step === 3 && (
                <div className="p-8 md:p-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 font-heading text-center">Secure Payment</h2>
                  
                  <div className="max-w-xl mx-auto space-y-4 mb-10">
                    <label className={`flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 group ${paymentProvider === 'Razorpay' ? 'border-primary-600 bg-primary-50 shadow-md ring-1 ring-primary-600' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                      <div className="flex items-center h-5">
                          <input 
                            type="radio" 
                            name="payment" 
                            value="Razorpay" 
                            checked={paymentProvider === 'Razorpay'} 
                            onChange={() => setPaymentProvider('Razorpay')}
                            className="h-5 w-5 text-primary-600 border-gray-300 focus:ring-primary-500"
                          />
                      </div>
                      <div className="ml-4 flex-1">
                          <span className="block text-lg font-bold text-gray-900">Razorpay / UPI / NetBanking</span>
                          <span className="block text-sm text-gray-500 mt-1">Pay securely using your preferred Indian payment method.</span>
                      </div>
                      <div className="ml-4">
                        {/* Razorpay Icon placeholder if you had one */}
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">RZP</div>
                      </div>
                    </label>
                     <label className={`flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 group ${paymentProvider === 'Stripe' ? 'border-primary-600 bg-primary-50 shadow-md ring-1 ring-primary-600' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                       <div className="flex items-center h-5">
                          <input 
                            type="radio" 
                            name="payment" 
                            value="Stripe" 
                            checked={paymentProvider === 'Stripe'} 
                            onChange={() => setPaymentProvider('Stripe')}
                            className="h-5 w-5 text-primary-600 border-gray-300 focus:ring-primary-500"
                          />
                       </div>
                       <div className="ml-4 flex-1">
                          <span className="block text-lg font-bold text-gray-900">Credit Card (Stripe)</span>
                          <span className="block text-sm text-gray-500 mt-1">International credit and debit cards accepted.</span>
                       </div>
                       <div className="ml-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">STR</div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="mt-12 flex flex-col md:flex-row gap-4 justify-between items-center border-t border-gray-100 pt-8">
                   <button onClick={() => setStep(2)} className="text-gray-500 hover:text-gray-800 font-semibold px-4 py-2">Back to Details</button>
                   <button 
                    onClick={handleCreateReservation}
                    disabled={isLoading}
                    className="w-full md:w-auto px-10 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex justify-center items-center disabled:opacity-70"
                   >
                     {isLoading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span> : null}
                     Pay {quote?.currency} {quote?.total.toFixed(2)}
                   </button>
                 </div>
                </div>
             )}

              {/* Step 4: Confirmation */}
              {step === 4 && ( // Confirmation Step
                <div className="p-8 md:p-12">
                  <div className="text-center mb-8">
                     <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2 font-heading">Booking Confirmed!</h2>
                      <p className="text-gray-600">
                        Thank you for your reservation. A confirmation email has been sent to <span className="font-semibold text-gray-900">{guestDetails.email}</span>.
                      </p>
                  </div>

                  {/* Reservation Summary Card */}
                  <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden mb-10 shadow-sm">
                      <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Reservation Summary</span>
                          <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Confirmed</span>
                      </div>
                      <div className="p-6 md:p-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               {/* Left Column: Room Info */}
                               <div>
                                   <h3 className="text-xl font-bold text-gray-900 mb-4">{room.name}</h3>
                                   <div className="flex gap-4 mb-6">
                                     <img 
                                          src={room.image?.url || room.images?.[0]?.url} 
                                          alt={room.name} 
                                          className="w-24 h-24 object-cover rounded-xl shadow-sm"
                                      />
                                      <div className="space-y-1 text-sm">
                                          <p className="text-gray-600">Room #{room.number}</p>
                                          <p className="text-gray-600">{room.type}</p>
                                          <p className="text-gray-600">{guests} Guest{guests > 1 ? 's' : ''}</p>
                                      </div>
                                   </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Booking Reference</p>
                                      <p className="text-2xl font-mono font-bold text-primary-700 tracking-wider">
                                          {confirmedReservation?.code || 'PENDING'}
                                      </p>
                                    </div>
                               </div>

                               {/* Right Column: Dates & Payment */}
                               <div className="space-y-6">
                                   <div className="grid grid-cols-2 gap-4">
                                       <div>
                                           <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Check-in</p>
                                           <p className="font-bold text-gray-900">{format(new Date(checkIn), 'MMM dd, yyyy')}</p>
                                       </div>
                                       <div>
                                           <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Check-out</p>
                                           <p className="font-bold text-gray-900">{format(new Date(checkOut), 'MMM dd, yyyy')}</p>
                                       </div>
                                   </div>
                                   
                                   <div className="border-t border-gray-200 pt-4">
                                       <div className="flex justify-between items-center mb-2">
                                           <span className="text-gray-600">Total Amount</span>
                                           <span className="text-xl font-bold text-gray-900">{confirmedReservation?.currency} {confirmedReservation?.totalAmount?.toFixed(2)}</span>
                                       </div>
                                       <div className="flex justify-between items-center text-sm">
                                           <span className="text-gray-500">Payment Method</span>
                                           <span className="font-medium text-gray-900 capitalize">{paymentProvider}</span>
                                       </div>
                                   </div>
                               </div>
                          </div>
                      </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => navigate('/')}
                      className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md"
                    >
                      Return to Home
                    </button>
                    
                    {confirmedReservation && (
                        <button 
                          onClick={async () => {
                              try {
                                  // Dynamically import download function to avoid circular dep issues in some setups, or use imported one
                                  const { downloadInvoice } = await import('@/services/publicApi');
                                  toast.promise(downloadInvoice(confirmedReservation._id), {
                                      loading: 'Generating invoice...',
                                      success: (blob) => {
                                          const url = window.URL.createObjectURL(new Blob([blob]));
                                          const link = document.createElement('a');
                                          link.href = url;
                                          link.setAttribute('download', `invoice_${confirmedReservation.code}.pdf`);
                                          document.body.appendChild(link);
                                          link.click();
                                          link.remove();
                                          return 'Invoice downloaded!';
                                      },
                                      error: 'Failed to download invoice'
                                  });
                              } catch (err) {
                                  console.error(err);
                                  toast.error("Could not download invoice at this time.");
                              }
                          }}
                          className="px-8 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          Download Invoice
                        </button>
                    )}
                  </div>
                </div>
              )}

        </div>
        
        {/* Stripe Modal */}
        {showStripeModal && stripeClientSecret && quote && (
            <StripePaymentModal 
                clientSecret={stripeClientSecret}
                amount={quote.total}
                currency={quote.currency}
                onClose={() => setShowStripeModal(false)}
                onSuccess={(id) => {
                    setShowStripeModal(false)
                    setStep(4)
                    toast.success('Payment Successful!')
                }}
            />
        )}
      </div>
    </div>
  )
}
export default Booking
