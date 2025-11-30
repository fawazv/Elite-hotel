// services/adminApi.ts
import { privateApi } from '@/services/instances/axiosConfig'

// ============= INTERFACES =============

export interface Room {
  _id: string
  number: number
  name: string
  type: 'Standard' | 'Deluxe' | 'Premium' | 'Luxury'
  price: number
  available: boolean
  image?: {
    url: string
  }
  images?: {
    url: string
    publicId?: string
  }[]
  description?: string
  amenities?: string[]
}

export interface Reservation {
  _id: string
  code: string
  guestContact: {
    email: string
    phone?: string
  }
  roomId: {
    _id: string
    number: number
    type: string
  }
  checkIn: string
  checkOut: string
  status: 'Confirmed' | 'PendingPayment' | 'CheckedIn' | 'CheckedOut' | 'Cancelled'
  totalAmount: number
  createdAt?: string
}

export interface Billing {
  _id: string
  paymentId: string
  reservationId: string
  guestId: string
  guestContact?: {
    email?: string
    phoneNumber?: string
  }
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'refunded' | 'failed'
  ledger: {
    type: string
    amount: number
    note?: string
    createdAt: string
  }[]
  createdAt: string
  updatedAt: string
}

export interface Payment {
  _id: string
  reservationId: string
  guestId: string
  guestContact?: {
    email?: string
    phoneNumber?: string
  }
  amount: number
  currency: string
  provider: 'stripe' | 'razorpay'
  status: 'initiated' | 'succeeded' | 'failed' | 'refunded'
  metadata?: any
  refunded?: boolean
  refundTxId?: string
  createdAt?: string
  updatedAt?: string
}

export interface User {
  _id: string
  fullName: string
  email: string
  role: 'admin' | 'receptionist' | 'Housekeeper' | 'user'
  isVerified: boolean
  isApproved: 'approved' | 'pending' | 'rejected'
  phoneNumber?: string
  avatar?: {
    url: string
  }
}

export interface DashboardStats {
  totalBookings: number
  activeRooms: number
  totalUsers: number
  revenue: number
  bookingsChange?: string
  roomsChange?: string
  usersChange?: string
  revenueChange?: string
}

// ============= ROOMS API =============

export const fetchRooms = async (): Promise<Room[]> => {
  const response = await privateApi.get('/rooms')
  return response.data.data || response.data
}

export const fetchRoomById = async (id: string): Promise<Room> => {
  const response = await privateApi.get(`/rooms/${id}`)
  return response.data.data || response.data
}

export const deleteRoom = async (id: string): Promise<void> => {
  await privateApi.delete(`/rooms/${id}`)
}

// ============= RESERVATIONS API =============

export const fetchReservations = async (): Promise<Reservation[]> => {
  const response = await privateApi.get('/reservations')
  return response.data.data || response.data
}

export const fetchReservationById = async (id: string): Promise<Reservation> => {
  const response = await privateApi.get(`/reservations/${id}`)
  return response.data.data || response.data
}

export const confirmReservation = async (id: string): Promise<Reservation> => {
  const response = await privateApi.post(`/reservations/${id}/confirm`)
  return response.data.data || response.data
}

export const cancelReservation = async (id: string): Promise<Reservation> => {
  const response = await privateApi.post(`/reservations/${id}/cancel`)
  return response.data.data || response.data
}

export const updateReservation = async (
  id: string,
  data: Partial<Reservation>
): Promise<Reservation> => {
  const response = await privateApi.patch(`/reservations/${id}`, data)
  return response.data.data || response.data
}

export const checkInReservation = async (id: string): Promise<Reservation> => {
  const response = await privateApi.post(`/reservations/${id}/check-in`)
  return response.data.data || response.data
}

export const checkOutReservation = async (id: string): Promise<Reservation> => {
  const response = await privateApi.post(`/reservations/${id}/check-out`)
  return response.data.data || response.data
}

// ============= USERS API =============

export const fetchUsers = async (): Promise<User[]> => {
  const response = await privateApi.get('/users')
  return response.data.data || response.data
}

export const fetchUserById = async (id: string): Promise<User> => {
  const response = await privateApi.get(`/users/${id}`)
  return response.data.data || response.data
}

export const deleteUser = async (id: string): Promise<void> => {
  await privateApi.delete(`/users/${id}`)
}

export const updateUserRole = async (
  id: string,
  role: string
): Promise<User> => {
  const response = await privateApi.patch(`/users/${id}`, { role })
  return response.data.data || response.data
}

// ============= DASHBOARD STATS API =============

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Fetch data from all services in parallel
    const [roomsResponse, reservationsResponse, usersResponse] = await Promise.all([
      privateApi.get('/rooms'),
      privateApi.get('/reservations'),
      privateApi.get('/users'),
    ])

    const rooms: Room[] = roomsResponse.data.data || roomsResponse.data || []
    const reservations: Reservation[] = reservationsResponse.data.data || reservationsResponse.data || []
    const users: User[] = usersResponse.data.data || usersResponse.data || []

    // Calculate statistics
    const activeRooms = rooms.filter((room) => room.available).length
    const totalBookings = reservations.length
    const totalUsers = users.length

    // Calculate revenue from confirmed/checked-in reservations
    const revenue = reservations
      .filter(
        (r) =>
          r.status === 'Confirmed' ||
          r.status === 'CheckedIn' ||
          r.status === 'CheckedOut'
      )
      .reduce((sum, r) => sum + (r.totalAmount || 0), 0)

    return {
      totalBookings,
      activeRooms,
      totalUsers,
      revenue,
      bookingsChange: '+12.5%', // TODO: Calculate actual change
      roomsChange: `+${activeRooms}`,
      usersChange: '+8.2%', // TODO: Calculate actual change
      revenueChange: '+15.3%', // TODO: Calculate actual change
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

// ============= RECENT ACTIVITY API =============

export const fetchRecentActivity = async (limit: number = 5): Promise<Reservation[]> => {
  try {
    const response = await privateApi.get('/reservations')
    const reservations: Reservation[] = response.data.data || response.data || []
    
    // Sort by createdAt descending and limit
    return reservations
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return dateB - dateA
      })
      .slice(0, limit)
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    throw error
  }
}

// ============= BILLING API =============

export const fetchBillings = async (filters?: {
  status?: string
  reservationId?: string
  dateFrom?: string
  dateTo?: string
}): Promise<Billing[]> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.reservationId) params.append('reservationId', filters.reservationId)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)

  const response = await privateApi.get(`/billing?${params.toString()}`)
  return response.data.data || response.data || []
}

export const fetchBillingById = async (id: string): Promise<Billing> => {
  const response = await privateApi.get(`/billing/${id}`)
  return response.data.data || response.data
}

export const fetchBillingByReservation = async (reservationId: string): Promise<Billing> => {
  const response = await privateApi.get(`/billing/reservation/${reservationId}`)
  return response.data.data || response.data
}

// ============= PAYMENT API =============

export const fetchPayments = async (filters?: {
  status?: string
  reservationId?: string
  provider?: string
}): Promise<Payment[]> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.reservationId) params.append('reservationId', filters.reservationId)
  if (filters?.provider) params.append('provider', filters.provider)

  const response = await privateApi.get(`/payments?${params.toString()}`)
  return response.data.data || response.data || []
}

export const fetchPaymentById = async (id: string): Promise<Payment> => {
  const response = await privateApi.get(`/payments/${id}`)
  return response.data.data || response.data
}
