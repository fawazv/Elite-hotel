// src/config/container.ts
import { BillingRepository } from '../repository/implementation/billing.repository'
import { BillingService } from '../service/implementation/billing.service'
import { BillingController } from '../controllers/implementation/billing.controller'

// Initialize instances
const billingRepository = new BillingRepository()
const billingService = new BillingService(billingRepository)
export const billingController = new BillingController(billingService)

export { billingService, billingRepository }
