// src/controllers/implementation/billing.controller.ts
import { Request, Response, NextFunction } from 'express'
import { IBillingController } from '../interface/IBilling.controller'
import { BillingService } from '../../service/implementation/billing.service'
import logger from '../../utils/logger.service'

export class BillingController implements IBillingController {
  constructor(private svc: BillingService) {}

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, reservationId, dateFrom, dateTo } = req.query
      
      const filters: any = {}
      if (status) filters.status = status
      if (reservationId) filters.reservationId = reservationId
      if (dateFrom || dateTo) {
        filters.createdAt = {}
        if (dateFrom) filters.createdAt.$gte = new Date(dateFrom as string)
        if (dateTo) filters.createdAt.$lte = new Date(dateTo as string)
      }

      const billings = await this.svc.findAll(filters)
      
      res.json({
        success: true,
        data: billings,
      })
    } catch (err) {
      logger.error('Error listing billings', { error: (err as Error).message })
      next(err)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const billing = await this.svc.findById(id)
      
      if (!billing) {
        res.status(404).json({
          success: false,
          message: 'Billing record not found',
        })
        return
      }

      res.json({
        success: true,
        data: billing,
      })
    } catch (err) {
      logger.error('Error fetching billing', { error: (err as Error).message })
      next(err)
    }
  }

  async getByReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reservationId } = req.params
      const billing = await this.svc.findByReservation(reservationId)
      
      if (!billing) {
        res.status(404).json({
          success: false,
          message: 'Billing record not found for this reservation',
        })
        return
      }

      res.json({
        success: true,
        data: billing,
      })
    } catch (err) {
      logger.error('Error fetching billing by reservation', { error: (err as Error).message })
      next(err)
    }
  }
}
