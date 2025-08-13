import { RoomRepository } from '../repository/implementation/room.repository'
import { RoomService } from '../services/implementation/room.service'
import { RoomController } from '../controllers/implementation/room.controller'

// repositories
const roomRepository = new RoomRepository()

// services
const roomService = new RoomService(roomRepository)

// controllers
const roomController = new RoomController(roomService)

export { roomController, roomService, roomRepository }
