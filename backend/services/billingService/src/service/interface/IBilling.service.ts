// src/service/interface/IBilling.service.ts
import { BillingDoc, LedgerEntry } from '../../models/billing.model'

export interface IBillingService {
  // Event handlers (existing)
  handlePaymentInitiated(evt: any): Promise<BillingDoc>
  handlePaymentSucceeded(evt: any): Promise<BillingDoc | null>
  handlePaymentRefunded(evt: any): Promise<BillingDoc | null>
  handlePaymentFailed(evt: any): Promise<BillingDoc | null>

  // Ledger operations
  addCharge(
    billingId: string,
    charge: Omit<LedgerEntry, 'createdAt'>
  ): Promise<BillingDoc | null>

  addCredit(
    billingId: string,
    credit: Omit<LedgerEntry, 'createdAt'>
  ): Promise<BillingDoc | null>

  processRefund(
    billingId: string,
    refund: Omit<LedgerEntry, 'createdAt'>
  ): Promise<BillingDoc | null>

  addAdjustment(
    billingId: string,
    adjustment: Omit<LedgerEntry, 'createdAt'>
  ): Promise<BillingDoc | null>

  // Status management
  changeBillingStatus(
    billingId: string,
    newStatus: BillingDoc['status']
  ): Promise<BillingDoc | null>

  sendInvoiceEmail(billingId: string): Promise<void>

  // Invoice generation
  generateInvoicePDF(billingId: string): Promise<Buffer>

  //Administrative
  archiveBilling(billingId: string): Promise<BillingDoc | null>
  getAuditLog(billingId: string): Promise<LedgerEntry[]>

  // Export
  exportBillingsCSV(filters?: any): Promise<string>
  exportBillingsPDF(filters?: any): Promise<Buffer>

  // Existing query methods
  findAll(filters?: any): Promise<BillingDoc[]>
  findById(id: string): Promise<BillingDoc | null>
  findByReservation(reservationId: string): Promise<BillingDoc | null>
}
