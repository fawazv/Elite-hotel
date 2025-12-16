import React, { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { lookupPublicReservation } from '@/services/publicApi'
import type { Reservation } from '@/services/reservationApi'
import BookingDetails from './BookingDetails'

const findBookingSchema = z.object({
  code: z.string().min(1, 'Reservation code is required'),
  contact: z.string().min(1, 'Email or Phone is required'),
})

const FindBooking: React.FC = () => {
  const [code, setCode] = useState('')
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)
  const [reservation, setReservation] = useState<Reservation | null>(null)

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = findBookingSchema.safeParse({ code, contact })
    if (!validation.success) {
      toast.error((validation as any).error.errors[0].message)
      return
    }

    try {
      setLoading(true)
      const data = await lookupPublicReservation(code, contact)
      if (data) {
        setReservation(data)
        toast.success("Reservation found!")
      } else {
        toast.error("No booking found with these details.")
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || "Failed to find booking")
    } finally {
      setLoading(false)
    }
  }

  if (reservation) {
    // Render details view if found
    return <BookingDetails reservation={reservation} />
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12 flex items-center justify-center">
      <div className="w-full max-w-lg px-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 md:p-12">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-sm">
                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 font-heading">Find Your Booking</h1>
                <p className="text-gray-500 mt-2">Enter your reservation code and the email or phone number used during booking.</p>
            </div>

            <form onSubmit={handleLookup} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Reservation Code</label>
                    <input 
                        type="text" 
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())} // Auto uppercase
                        placeholder="e.g. RES-123456"
                        className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white text-lg font-mono uppercase placeholder:normal-case"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Email or Phone Number</label>
                    <input 
                        type="text" 
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="email@example.com or +1234567890"
                        className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white text-lg"
                    />
                </div>

                <button 
                    type="submit"
                    disabled={loading || !code || !contact}
                    className="w-full px-10 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {loading ? (
                        <>
                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                         Searching...
                        </>
                    ) : 'Find Booking'}
                </button>
            </form>

            <div className="mt-8 text-center">
                 <p className="text-sm text-gray-400">Having trouble? Contact our <a href="/contact" className="text-primary-600 hover:underline">support team</a>.</p>
            </div>
        </div>
      </div>
    </div>
  )
}

export default FindBooking
