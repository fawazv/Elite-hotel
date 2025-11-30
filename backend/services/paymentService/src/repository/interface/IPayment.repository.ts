// src/repository/interface/IPayment.repository.ts
import { PaymentDoc } from '../../models/payment.model'

export interface IPaymentRepository {
  create(data: Partial<PaymentDoc>): Promise<PaymentDoc>
  findById(id: string): Promise<PaymentDoc | null>
  findByReservation(reservationId: string): Promise<PaymentDoc | null>
  findAll(filters?: any): Promise<PaymentDoc[]>
  updateStatus(
    id: string,
    status: PaymentDoc['status'],
    metadata?: any
  ): Promise<PaymentDoc | null>
}
