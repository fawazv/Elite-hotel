// src/repository/implementation/payment.repository.ts
import { PaymentModel, PaymentDoc } from '../../models/payment.model'
import { IPaymentRepository } from '../interface/IPayment.repository'

export class PaymentRepository implements IPaymentRepository {
  async create(data: Partial<PaymentDoc>): Promise<PaymentDoc> {
    return PaymentModel.create(data)
  }

  async findById(id: string): Promise<PaymentDoc | null> {
    return PaymentModel.findById(id).lean()
  }

  async findByReservation(reservationId: string): Promise<PaymentDoc | null> {
    return PaymentModel.findOne({ reservationId }).lean()
  }

  async findAll(filters?: any): Promise<PaymentDoc[]> {
    return PaymentModel.find(filters || {}).sort({ createdAt: -1 }).lean()
  }

  async updateStatus(
    id: string,
    status: PaymentDoc['status'],
    metadata?: any
  ): Promise<PaymentDoc | null> {
    return PaymentModel.findByIdAndUpdate(
      id,
      { status, ...(metadata && { metadata }) },
      { new: true }
    ).lean()
  }
}
