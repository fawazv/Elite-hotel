// src/repository/implementation/billing.repository.ts
import { BillingModel, BillingDoc } from '../../models/billing.model'
import { IBillingRepository } from '../interface/IBilling.repository'

export class BillingRepository implements IBillingRepository {
  async create(data: Partial<BillingDoc>): Promise<BillingDoc> {
    const billing = new BillingModel(data)
    return billing.save()
  }

  async updateStatus(
    paymentId: string,
    status: BillingDoc['status'],
    ledgerEntry?: { type: string; amount: number; note?: string }
  ): Promise<BillingDoc | null> {
    const update: any = { status }
    if (ledgerEntry) {
      update.$push = { ledger: { ...ledgerEntry, createdAt: new Date() } }
    }
    return BillingModel.findOneAndUpdate({ paymentId }, update, {
      new: true,
    }).exec()
  }

  async findByPaymentId(paymentId: string): Promise<BillingDoc | null> {
    return BillingModel.findOne({ paymentId }).exec()
  }
}
