import { RoomController } from '../controllers/implementation/room.controller'
import { RoomModel } from '../models/room.model'
import { RoomRepository } from '../repository/implementation/room.repository'
import { RoomService } from '../services/implementation/room.service'

// Repositories
const roomRepository = new RoomRepository(RoomModel)

// Services
const roomService = new RoomService(roomRepository)
console.log('RoomService initialized:', !!roomService)

// Controllers
const roomController = new RoomController(roomService)

export { roomRepository, roomService, roomController }
