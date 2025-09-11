import { BillingDoc } from '../../models/billing.model'

export interface IBillingRepository {
  create(data: Partial<BillingDoc>): Promise<BillingDoc>

  updateStatus(
    paymentId: string,
    status: BillingDoc['status'],
    ledgerEntry?: { type: string; amount: number; note?: string }
  ): Promise<BillingDoc | null>

  findByPaymentId(paymentId: string): Promise<BillingDoc | null>
}
