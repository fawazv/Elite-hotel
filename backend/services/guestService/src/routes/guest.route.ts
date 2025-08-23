// src/routes/guest.route.ts
import express from 'express'
import validateRequest from '../middleware/validateRequest'
import {
  createGuestSchema,
  updateGuestSchema,
  patchGuestSchema,
  ensureGuestSchema,
} from '../validators/guest.validator'
import { guestController } from '../config/container'
import authenticateToken from '../middleware/auth.middleware'
import { authorizeRole } from '../middleware/authorizeRole'
import { upload } from '../middleware/upload.middleware'

const router = express.Router()

// Create guest (Admin/Receptionist)
router.post(
  '/',
  authenticateToken,
  authorizeRole(['Admin', 'Receptionist']),
  upload.single('idProofImage'),
  validateRequest(createGuestSchema),
  guestController.create.bind(guestController)
)

// List / Get
router.get(
  '/',
  authenticateToken,
  authorizeRole(['Admin', 'Receptionist']),
  guestController.list.bind(guestController)
)

router.get(
  '/:id',
  authenticateToken,
  authorizeRole(['Admin', 'Receptionist']),
  guestController.getById.bind(guestController)
)

// Update / Patch
router.put(
  '/:id',
  authenticateToken,
  authorizeRole(['Admin', 'Receptionist']),
  validateRequest(updateGuestSchema),
  guestController.update.bind(guestController)
)

router.patch(
  '/:id',
  authenticateToken,
  authorizeRole(['Admin', 'Receptionist']),
  validateRequest(patchGuestSchema),
  guestController.patch.bind(guestController)
)

// Delete
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['Admin']),
  guestController.remove.bind(guestController)
)

// ID Proof image ops
router.post(
  '/:id/id-proof',
  authenticateToken,
  authorizeRole(['Admin', 'Receptionist']),
  upload.single('image'),
  guestController.updateIdProofImage.bind(guestController)
)

router.delete(
  '/:id/id-proof',
  authenticateToken,
  authorizeRole(['Admin', 'Receptionist']),
  guestController.removeIdProofImage.bind(guestController)
)

// Booking-time helper (ReservationService should call this)
router.post(
  '/ensure',
  authenticateToken,
  authorizeRole(['Admin', 'Receptionist']),
  validateRequest(ensureGuestSchema),
  guestController.ensureForBooking.bind(guestController)
)

export default router
