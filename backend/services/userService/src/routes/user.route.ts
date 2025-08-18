// src/routes/user.route.ts
import express from 'express'
import validateRequest from '../middleware/validateRequest'
import { updateUserSchema, patchUserSchema } from '../validators/user.validator'
import { userController } from '../config/container'
import authenticateToken from '../middleware/auth.middleware'
import { authorizeRole } from '../middleware/authorizeRole'
import { upload } from '../middleware/upload.middleware' // reuse your multer middleware

const router = express.Router()

// admin and receptionist can list users; admin-only for delete and update of others
router.get(
  '/',
  authenticateToken,
  authorizeRole(['admin', 'receptionist']),
  userController.list.bind(userController)
)
router.get(
  '/:id',
  authenticateToken,
  authorizeRole(['admin', 'receptionist', 'Housekeeper']),
  userController.getById.bind(userController)
)

// update/patch - admin or the user themself (we'll rely on authorizeRole for admin, for user-self check handle in controller/middleware)
router.patch(
  '/:id',
  authenticateToken,
  authorizeRole(['admin']),
  validateRequest(patchUserSchema),
  userController.patch.bind(userController)
)
router.put(
  '/:id',
  authenticateToken,
  authorizeRole(['admin']),
  validateRequest(updateUserSchema),
  userController.update.bind(userController)
)

// avatar: upload single file 'avatar'
router.post(
  '/:id/avatar',
  authenticateToken,
  upload.single('avatar'),
  userController.updateAvatar.bind(userController)
)
router.delete(
  '/:id/avatar',
  authenticateToken,
  userController.removeAvatar.bind(userController)
)

// delete user (admin only)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['admin']),
  userController.remove.bind(userController)
)

export default router
