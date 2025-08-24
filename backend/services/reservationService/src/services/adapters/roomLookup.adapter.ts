// src/services/adapters/roomLookup.adapter.ts
import axios from 'axios'
import { IRoomLookupService } from '../interface/IReservation.service'

export class RoomLookupAdapter implements IRoomLookupService {
  private baseUrl: string
  private apiKey?: string
  constructor(
    baseUrl = process.env.ROOM_SERVICE_URL || 'http://localhost:4006',
    apiKey?: string
  ) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }
  async ensureRoomExists(roomId: string) {
    const res = await axios.get(`${this.baseUrl}/rooms/${roomId}`, {
      headers: this.apiKey ? { 'x-api-key': this.apiKey } : undefined,
    })
    const room = res.data?.data
    if (!room) throw new Error('Room not found')
    return { id: room._id, price: room.price, available: room.available }
  }
}
