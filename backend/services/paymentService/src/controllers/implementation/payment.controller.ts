// src/controllers/payment.controller.ts
import { Request, Response, NextFunction } from 'express'
import { PaymentService } from '../../services/implementation/payment.service'
import { IPaymentController } from '../interface/IPayment.controller'

export class PaymentController implements IPaymentController {
  constructor(private svc: PaymentService) {}

  async initiate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { reservationId, guestId, amount, currency, provider } = req.body
      const result = await this.svc.initiatePayment({
        reservationId,
        guestId,
        amount,
        currency,
        provider,
      })
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }

  async updateStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { paymentId } = req.params
      const { status, metadata } = req.body
      const updated = await this.svc.updatePaymentStatus(
        paymentId,
        status,
        metadata
      )
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }

  async list(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { status, reservationId, provider } = req.query
      const filters: any = {}
      if (status) filters.status = status
      if (reservationId) filters.reservationId = reservationId
      if (provider) filters.provider = provider

      const payments = await this.svc.findAll(filters)
      res.json({
        success: true,
        data: payments,
      })
    } catch (err) {
      next(err)
    }
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params
      const payment = await this.svc.findById(id)
      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Payment not found',
        })
        return
      }
      res.json({
        success: true,
        data: payment,
      })
    } catch (err) {
      next(err)
    }
  }
}
