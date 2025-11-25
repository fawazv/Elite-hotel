import express from 'express'
import validateRequest from '../middleware/validateRequest'
import {
  createRoomSchema,
  updateRoomSchema,
  patchRoomSchema,
} from '../validators/room.validator'
import { roomController } from '../config/container'
import authenticateToken from '../middleware/auth.middleware'
import { upload } from '../middleware/upload.middleware'
import { authorizeRole } from '../middleware/authorizeRole'

const router = express.Router()

/**
 * Upload room image + details in one multipart/form-data request
 * field name for image: "image"
 */
router.post(
  '/',
  authenticateToken,
  authorizeRole(['admin']),
  upload.single('image'),
  validateRequest(createRoomSchema),
  roomController.create.bind(roomController)
)

router.get('/', roomController.list.bind(roomController))

router.get('/:id', roomController.getById.bind(roomController))

router.patch(
  '/:id',
  authenticateToken,
  authorizeRole(['admin']),
  upload.single('image'),
  validateRequest(patchRoomSchema),
  roomController.patch.bind(roomController)
)

router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['admin']),
  roomController.remove.bind(roomController)
)

export default router
