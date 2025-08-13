import express from 'express'
import validateRequest from '../middleware/validateRequest'
import {
  createRoomSchema,
  updateRoomSchema,
  patchRoomSchema,
} from '../validators/room.validator'
import { roomController } from '../config/container'

const roomRoute = express.Router()

roomRoute.get('/', roomController.list.bind(roomController))
roomRoute.post(
  '/',
  // validateRequest(createRoomSchema),
  roomController.create.bind(roomController)
)
roomRoute.get(
  '/numeric/:nid',
  roomController.getByNumericId.bind(roomController)
)
roomRoute.get('/:id', roomController.getById.bind(roomController))
roomRoute.put(
  '/:id',
  // validateRequest(updateRoomSchema),
  roomController.update.bind(roomController)
)
roomRoute.patch(
  '/:id',
  // validateRequest(patchRoomSchema),
  roomController.patch.bind(roomController)
)
roomRoute.delete('/:id', roomController.remove.bind(roomController))

export default roomRoute
