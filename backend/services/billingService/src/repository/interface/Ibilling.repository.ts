// src/repository/interfaces/billing.repository.interface.ts
import { BillingDoc } from '../../models/billing.model'

export interface IBillingRepository {
  create(data: Partial<BillingDoc>): Promise<BillingDoc>
  findByReservation(reservationId: string): Promise<BillingDoc | null>
  update(id: string, update: Partial<BillingDoc>): Promise<BillingDoc | null>
}
