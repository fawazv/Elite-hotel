// src/routes/billing.route.ts
import express from 'express'
import { billingController } from '../config/container'

const router = express.Router()

// List billing records with optional filters
router.get('/', billingController.list.bind(billingController))

// Get billing by ID
router.get('/:id', billingController.getById.bind(billingController))

// Get billing by reservation ID
router.get('/reservation/:reservationId', billingController.getByReservation.bind(billingController))

export default router
