import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

const searchSchema = z.object({
  checkIn: z.string().refine((val) => {
    const date = new Date(val)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  }, { message: "Check-in date cannot be in the past" }),
  checkOut: z.string().refine((val) => {
    const date = new Date(val)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date > today
  }, { message: "Check-out date must be in the future" }),
  roomType: z.string().optional(),
  guests: z.string().optional(),
}).refine((data) => {
  if (data.checkIn && data.checkOut) {
    return new Date(data.checkOut) > new Date(data.checkIn)
  }
  return true
}, {
  message: "Check-out date must be after check-in date",
  path: ["checkOut"]
})

const RoomBookingSearch = () => {
  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0]

  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [roomType, setRoomType] = useState('')
  const [guests, setGuests] = useState('2')
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const navigate = useNavigate()

  // Updated to match backend enum + category (simplified for user selection)
  const roomTypeOptions = [
    { value: '', label: 'All Room Types' },
    { value: 'Standard', label: 'Standard' },
    { value: 'Deluxe', label: 'Deluxe' },
    { value: 'Premium', label: 'Premium' },
    { value: 'Luxury', label: 'Luxury' },
  ]

  const guestsOptions = [
    { value: '1', label: '1 Guest' },
    { value: '2', label: '2 Guests' },
    { value: '3', label: '3 Guests' },
    { value: '4', label: '4 Guests' },
    { value: '5', label: '5+ Guests' },
  ]

  type InputFieldProps = {
    type?: string
    value: string
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void
    placeholder?: string
    label?: string
    icon?: React.ReactNode
    options?: { value: string; label: string }[]
    min?: string
    error?: string
    id?: string
    name?: string
    autoComplete?: string
  }

  const InputField = ({
    type = 'text',
    value,
    onChange,
    placeholder,
    label,
    icon,
    options,
    min,
    error,
    id,
    name,
    autoComplete,
  }: InputFieldProps) => {
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {type === 'select' ? (
            <select
              id={id}
              name={name}
              value={value}
              onChange={onChange}
              autoComplete={autoComplete}
              className={`w-full px-4 py-3 rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all appearance-none cursor-pointer bg-white`}
            >
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={id}
              name={name}
              type={type}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              min={min}
              autoComplete={autoComplete}
              className={`w-full px-4 py-3 rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all`}
            />
          )}
          {icon && (
            <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${error ? 'text-red-400' : 'text-gray-400'}`}>
              {icon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }

  const calendarIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  )

  const dropdownIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  )

  const handleSearch = () => {
    // Validate inputs
    const result = searchSchema.safeParse({ checkIn, checkOut, roomType, guests })

    if (!result.success) {
      const fieldErrors: {[key: string]: string} = {}
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({}) // Clear errors

    const params = new URLSearchParams()
    
    if (checkIn) params.append('checkIn', checkIn)
    if (checkOut) params.append('checkOut', checkOut)
    if (roomType) params.append('roomType', roomType)
    if (guests) params.append('guests', guests)

    const searchString = params.toString()
    navigate(`/search-results${searchString ? `?${searchString}` : ''}`)
  }

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCheckIn(e.target.value) 
    if (errors.checkIn) setErrors({...errors, checkIn: ''})
    
    // Auto-update check-out min date or clear if invalid
    if (e.target.value) {
       // If check-out is before or same as new check-in, separate it
       if (checkOut && new Date(checkOut) <= new Date(e.target.value)) {
          setCheckOut('')
       }
    }
  }

  const getMinCheckOutDate = () => {
    if (checkIn) {
      const date = new Date(checkIn)
      date.setDate(date.getDate() + 1)
      return date.toISOString().split('T')[0]
    }
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-xl shadow-2xl p-6 lg:p-8 border border-gray-100">
        <h2 className="text-xl lg:text-2xl font-serif font-bold mb-4 lg:mb-6 text-center">
          Find Your Perfect Room
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <InputField
            id="check-in-date"
            name="checkIn"
            type="date"
            value={checkIn}
            onChange={handleCheckInChange}
            label="Check-in Date"
            icon={calendarIcon}
            min={today}
            autoComplete="off"
            error={errors.checkIn}
          />

          <InputField
            id="check-out-date"
            name="checkOut"
            type="date"
            value={checkOut}
            onChange={(e) => {
              setCheckOut(e.target.value)
              if (errors.checkOut) setErrors({...errors, checkOut: ''})
            }}
            label="Check-out Date"
            icon={calendarIcon}
            min={getMinCheckOutDate()}
            autoComplete="off"
            error={errors.checkOut}
          />

          <InputField
            id="room-type"
            name="roomType"
            type="select"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            label="Room Type"
            options={roomTypeOptions}
            icon={dropdownIcon}
            autoComplete="off"
          />

          <InputField
            id="guests"
            name="guests"
            type="select"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            label="Guests"
            options={guestsOptions}
            icon={dropdownIcon}
            autoComplete="off"
          />
        </div>

        <div className="mt-6 lg:mt-8">
          <button
            onClick={handleSearch}
            className="w-full bg-amber-800 text-white py-3 rounded-lg font-medium hover:bg-amber-900 transition-all flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Search Available Rooms
          </button>
        </div>
      </div>
    </div>
  )
}
export default RoomBookingSearch
