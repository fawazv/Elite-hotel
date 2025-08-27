// src/services/adapters/roomLookup.adapter.ts
import axios from 'axios'
import { IRoomLookupService } from '../interface/IReservation.service'

export class RoomLookupAdapter implements IRoomLookupService {
  private baseUrl: string
  constructor(
    baseUrl = process.env.ROOM_SERVICE_URL || 'http://localhost:4006'
  ) {
    this.baseUrl = baseUrl
  }

  async ensureRoomExists(roomId: string, jwtToken: string) {
    const res = await axios.get(`${this.baseUrl}/${roomId}`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    })
    const room = res.data?.data
    if (!room) throw new Error('Room not found')
    return { id: room._id, price: room.price, available: room.available }
  }
}
