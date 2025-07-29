import { useState, type SetStateAction } from 'react'

const RoomBookingSearch = () => {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [roomType, setRoomType] = useState('')
  const [guests, setGuests] = useState('2')

  const roomTypeOptions = [
    { value: '', label: 'Select a Room Type' },
    { value: 'single', label: 'Single Bed' },
    { value: 'double', label: 'Double Bed' },
    { value: 'suite', label: 'Suite' },
    { value: 'family', label: 'Family Room' },
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
    options?: { value: string; label: React.ReactNode }[]
  }

  const InputField = ({
    type = 'text',
    value,
    onChange,
    placeholder,
    label,
    icon,
    options,
  }: InputFieldProps) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {type === 'select' ? (
            <select
              value={value}
              onChange={onChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all appearance-none"
            >
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all"
            />
          )}
          {icon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
        </div>
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
    console.log('Search parameters:', {
      checkIn,
      checkOut,
      roomType,
      guests,
    })
    // Here you would typically trigger a search or navigate to search results
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-xl shadow-2xl p-6 lg:p-8 border border-gray-100">
        <h2 className="text-xl lg:text-2xl font-serif font-bold mb-4 lg:mb-6 text-center">
          Find Your Perfect Room
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <InputField
            type="date"
            value={checkIn}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setCheckIn(e.target.value)
            }
            label="Check-in Date"
            icon={calendarIcon}
            placeholder={undefined}
            options={undefined}
          />

          <InputField
            type="date"
            value={checkOut}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setCheckOut(e.target.value)
            }
            label="Check-out Date"
            icon={calendarIcon}
            placeholder={undefined}
            options={undefined}
          />

          <InputField
            type="select"
            value={roomType}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setRoomType(e.target.value)
            }
            label="Room Type"
            options={roomTypeOptions}
            icon={dropdownIcon}
            placeholder={undefined}
          />

          <InputField
            type="select"
            value={guests}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setGuests(e.target.value)
            }
            label="Guests"
            options={guestsOptions}
            icon={dropdownIcon}
            placeholder={undefined}
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
