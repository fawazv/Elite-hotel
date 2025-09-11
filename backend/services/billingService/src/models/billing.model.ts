// src/models/billing.model.ts
import mongoose, { Schema, Document } from 'mongoose'

export interface BillingDoc extends Document {
  reservationId: string
  guestId: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'refunded'
  items: { description: string; amount: number }[]
  payments: { paymentId: string; amount: number }[]
  refunds: { paymentId: string; amount: number }[]
}

const BillingSchema = new Schema<BillingDoc>(
  {
    reservationId: { type: String, required: true },
    guestId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    items: [{ description: String, amount: Number }],
    payments: [{ paymentId: String, amount: Number }],
    refunds: [{ paymentId: String, amount: Number }],
  },
  { timestamps: true }
)

export const BillingModel = mongoose.model<BillingDoc>('Billing', BillingSchema)
