// src/routes/payment.route.ts
import express from 'express'
import { paymentController } from '../config/container'

const router = express.Router()

router.post('/initiate', paymentController.initiate.bind(paymentController))
router.patch(
  '/:paymentId/status',
  paymentController.updateStatus.bind(paymentController)
)

export default router
