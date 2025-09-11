// src/repository/implementation/billing.repository.ts
import { BillingModel, BillingDoc } from '../../models/billing.model'
import { IBillingRepository } from '../interface/Ibilling.repository'

export class BillingRepository implements IBillingRepository {
  async create(data: Partial<BillingDoc>): Promise<BillingDoc> {
    return BillingModel.create(data)
  }

  async findByReservation(reservationId: string): Promise<BillingDoc | null> {
    return BillingModel.findOne({ reservationId })
  }

  async update(
    id: string,
    update: Partial<BillingDoc>
  ): Promise<BillingDoc | null> {
    return BillingModel.findByIdAndUpdate(id, update, { new: true })
  }
}
