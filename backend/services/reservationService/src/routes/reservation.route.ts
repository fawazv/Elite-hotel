// src/routes/reservation.route.ts
import express from 'express'
import authenticateToken from '../middleware/auth.middleware'
import { authorizeRole } from '../middleware/authorizeRole'
import validateRequest from '../middleware/validateRequest'
import { reservationController } from '../config/container'
import {
  quoteSchema,
  createReservationSchema,
  listReservationSchema,
  patchReservationSchema,
} from '../validators/reservation.validator'

const router = express.Router()

// Public/Online quote (no auth if you want to expose public pricing)
router.post(
  '/quote',
  validateRequest(quoteSchema),
  reservationController.quote.bind(reservationController)
)

// Create reservation
router.post(
  '/',
  authenticateToken,
  authorizeRole(['Admin', 'Receptionist']), // if online guest booking, you can relax this or move to a different public route
  validateRequest(createReservationSchema),
  reservationController.create.bind(reservationController)
)

// List / Get
router.get(
  '/',
  authenticateToken,
  authorizeRole(['Admin', 'Receptionist']),
  validateRequest(listReservationSchema),
  reservationController.list.bind(reservationController)
)
router.get(
  '/:id',
  authenticateToken,
  authorizeRole(['Admin', 'Receptionist']),
  reservationController.getById.bind(reservationController)
)
router.get(
  '/code/:code',
  authenticateToken,
  authorizeRole(['Admin', 'Receptionist']),
  reservationController.getByCode.bind(reservationController)
)

// Patch (date/room changes)
router.patch(
  '/:id',
  authenticateToken,
  authorizeRole(['Admin', 'Receptionist']),
  validateRequest(patchReservationSchema),
  reservationController.patch.bind(reservationController)
)

// Status transitions
router.post(
  '/:id/confirm',
  authenticateToken,
  authorizeRole(['Admin', 'Receptionist']),
  reservationController.confirm.bind(reservationController)
)
router.post(
  '/:id/cancel',
  authenticateToken,
  authorizeRole(['Admin', 'Receptionist']),
  reservationController.cancel.bind(reservationController)
)
router.post(
  '/:id/check-in',
  authenticateToken,
  authorizeRole(['Admin', 'Receptionist']),
  reservationController.checkIn.bind(reservationController)
)
router.post(
  '/:id/check-out',
  authenticateToken,
  authorizeRole(['Admin', 'Receptionist']),
  reservationController.checkOut.bind(reservationController)
)

export default router
