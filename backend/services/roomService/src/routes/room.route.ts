import express from 'express'
import validateRequest from '../middleware/validateRequest'
import {
  createRoomSchema,
  updateRoomSchema,
  patchRoomSchema,
} from '../validators/room.validator'
import { roomController } from '../config/container'
import authenticateToken from '../middleware/auth.middleware'

const router = express.Router()

router.post(
  '/',
  authenticateToken,
  validateRequest(createRoomSchema),
  roomController.create.bind(roomController)
)

router.get('/', roomController.list.bind(roomController))

router.get('/:id', roomController.getById.bind(roomController))

router.put(
  '/:id',
  authenticateToken,
  validateRequest(updateRoomSchema),
  roomController.update.bind(roomController)
)

router.patch(
  '/:id',
  authenticateToken,
  validateRequest(patchRoomSchema),
  roomController.patch.bind(roomController)
)

router.delete(
  '/:id',
  authenticateToken,
  roomController.remove.bind(roomController)
)

export default router
