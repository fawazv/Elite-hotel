// src/routes/payment.route.ts
import express from 'express'
import { paymentController } from '../config/container'

const router = express.Router()

router.get('/', paymentController.list.bind(paymentController))
router.get('/:id', paymentController.getById.bind(paymentController))
router.post('/initiate', paymentController.initiate.bind(paymentController))
router.patch(
  '/:paymentId/status',
  paymentController.updateStatus.bind(paymentController)
)

export default router
