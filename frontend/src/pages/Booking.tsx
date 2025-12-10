// frontend/src/pages/Booking.tsx
import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import {
  fetchPublicRoomById,
  getQuote,
  createPublicReservation,
  type PublicRoom,
  type QuoteResponse,
  type GuestDetails,
} from '@/services/publicApi'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

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
  
  // Booking Data
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const guests = parseInt(searchParams.get('guests') || '1')
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  })
  
  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'razorpay'>('razorpay')
  const [confirmedReservation, setConfirmedReservation] = useState<any>(null)

  // Load Room & Quote
  useEffect(() => {
    const init = async () => {
      if (!roomId) return
      try {
        setIsLoading(true)
        const roomData = await fetchPublicRoomById(roomId)
        setRoom(roomData)
        
        if (checkIn && checkOut) {
          const quoteData = await getQuote({
            roomId,
            checkIn,
            checkOut,
            adults: guests,
            currency: 'USD',
          })
          setQuote(quoteData)
        }
        setIsLoading(false)
      } catch (err) {
        toast.error('Failed to load booking details')
        navigate('/rooms')
      }
    }
    init()
  }, [roomId, checkIn, checkOut, guests, navigate])

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
        if (paymentProvider === 'razorpay' && res.paymentOrder) {
          handleRazorpayPayment(res)
        } else if (paymentProvider === 'stripe' && res.paymentClientSecret) {
          // TODO: Implement Stripe Elements
          toast.success('Reservation created. Redirecting to payment...')
           // For now just simulate finish
           setConfirmedReservation(res)
           setStep(4)
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

  const handleRazorpayPayment = (reservation: any) => {
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

  if (isLoading && step === 1) {
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
  const nights = quote?.nights || 1

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

                      <div className="space-y-3 bg-gray-50 p-5 rounded-xl border border-gray-100">
                           <div className="flex justify-between text-sm">
                               <span className="text-gray-500 font-medium">Check-in:</span>
                               <span className="text-gray-900 font-semibold">{checkIn}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                               <span className="text-gray-500 font-medium">Check-out:</span>
                               <span className="text-gray-900 font-semibold">{checkOut}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                               <span className="text-gray-500 font-medium">Nights:</span>
                               <span className="text-gray-900 font-semibold">{nights}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                               <span className="text-gray-500 font-medium">Guests:</span>
                               <span className="text-gray-900 font-semibold">{guests}</span>
                           </div>
                      </div>
                    </div>
                 </div>
                 
                 {quote && (
                    <div className="border-t border-gray-100 pt-8">
                         <div className="bg-primary-50 p-6 rounded-2xl">
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
                 
                 <div className="mt-10 flex justify-end">
                    <button 
                    onClick={() => setStep(2)}
                    className="w-full md:w-auto px-10 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
                <div className="space-y-6 max-w-2xl mx-auto">
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
                   <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-800 font-semibold px-4 py-2">Back to Review</button>
                   <button 
                    onClick={() => setStep(3)}
                    disabled={!guestDetails.firstName || !guestDetails.email || !guestDetails.phoneNumber}
                    className="w-full md:w-auto px-10 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     Continue to Payment
                   </button>
                 </div>
               </div>
             )}

             {/* Step 3: Payment */}
             {step === 3 && (
                <div className="p-8 md:p-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 font-heading text-center">Secure Payment</h2>
                  
                  <div className="max-w-xl mx-auto space-y-4 mb-10">
                    <label className={`flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 group ${paymentProvider === 'razorpay' ? 'border-primary-600 bg-primary-50 shadow-md ring-1 ring-primary-600' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                      <div className="flex items-center h-5">
                          <input 
                            type="radio" 
                            name="payment" 
                            value="razorpay" 
                            checked={paymentProvider === 'razorpay'} 
                            onChange={() => setPaymentProvider('razorpay')}
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
                     <label className={`flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 group ${paymentProvider === 'stripe' ? 'border-primary-600 bg-primary-50 shadow-md ring-1 ring-primary-600' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                       <div className="flex items-center h-5">
                          <input 
                            type="radio" 
                            name="payment" 
                            value="stripe" 
                            checked={paymentProvider === 'stripe'} 
                            onChange={() => setPaymentProvider('stripe')}
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
              {step === 4 && (
                <div className="p-8 md:p-16 text-center">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4 font-heading">Booking Confirmed!</h2>
                  <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
                    Your reservation for <span className="font-semibold text-gray-900">{room.name}</span> has been successfully confirmed. A confirmation email has been sent to {guestDetails.email}.
                  </p>
                  
                  <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto mb-10 border border-gray-200 dashed">
                      <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-2">Booking Reference</p>
                      <p className="text-3xl font-mono font-bold text-primary-700 tracking-widest">{confirmedReservation?.code}</p>
                  </div>

                  <button 
                    onClick={() => navigate('/')}
                    className="px-10 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg"
                  >
                    Return to Home
                  </button>
                </div>
              )}

        </div>
      </div>
    </div>
  )
}

export default Booking
