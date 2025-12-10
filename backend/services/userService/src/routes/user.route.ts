// src/routes/user.route.ts
import express from 'express'
import validateRequest from '../middleware/validateRequest'
import { updateUserSchema, patchUserSchema } from '../validators/user.validator'
import { userController } from '../config/container'
import authenticateToken from '../middleware/auth.middleware'
import { authorizeRole } from '../middleware/authorizeRole'
import { upload } from '../middleware/upload.middleware' // reuse your multer middleware
import { authorizeOwnerOrAdmin } from '../middleware/authorizeOwnerOrAdmin'

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

// patch - admin or the user themself can update.
router.patch(
  '/:id',
  authenticateToken,
  authorizeOwnerOrAdmin(),
  validateRequest(patchUserSchema),
  userController.patch.bind(userController)
)

// avatar: upload single file 'avatar'
router.post(
  '/:id/avatar',
  authenticateToken,
  authorizeOwnerOrAdmin(),
  upload.single('avatar'),
  userController.updateAvatar.bind(userController)
)

router.delete(
  '/:id/avatar',
  authenticateToken,
  authorizeOwnerOrAdmin(),
  userController.removeAvatar.bind(userController)
)

// delete user (admin only)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['admin']),
  userController.remove.bind(userController)
)

// Analytics endpoints
import { UserAnalyticsController } from '../controllers/user.analytics.controller';
import { User as UserModel } from '../models/user.model';

const userAnalyticsController = new UserAnalyticsController(UserModel);

router.get('/analytics/metrics', userAnalyticsController.getUserMetrics.bind(userAnalyticsController));

export default router
