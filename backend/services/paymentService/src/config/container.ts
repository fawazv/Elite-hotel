// src/config/container.ts
import { PaymentRepository } from '../repository/implementation/payment.repository'
import { PaymentService } from '../services/implementation/payment.service'
import { PaymentController } from '../controllers/implementation/payment.controller'

const paymentRepository = new PaymentRepository()
const paymentService = new PaymentService(paymentRepository)
export const paymentController = new PaymentController(paymentService)
