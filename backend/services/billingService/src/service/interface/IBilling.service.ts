import { BillingDoc } from '../../models/billing.model'

export interface IBillingService {
  handlePaymentInitiated(evt: any): Promise<BillingDoc>
  handlePaymentSucceeded(evt: any): Promise<BillingDoc | null>
  handlePaymentRefunded(evt: any): Promise<BillingDoc | null>
  handlePaymentFailed(evt: any): Promise<BillingDoc | null>
  findAll(filters?: any): Promise<BillingDoc[]>
  findById(id: string): Promise<BillingDoc | null>
  findByReservation(reservationId: string): Promise<BillingDoc | null>
}
