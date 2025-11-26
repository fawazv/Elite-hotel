import mongoose, { Schema, Document } from 'mongoose'

export interface BillingDoc extends Document {
  _id: string
  paymentId: string
  reservationId: string
  guestId: string
  guestContact?: {
    email?: string
    phoneNumber?: string
  }
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'refunded' | 'failed'
  ledger: {
    type: string
    amount: number
    note?: string
    createdAt: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

const BillingSchema = new Schema<BillingDoc>(
  {
    paymentId: { type: String, required: true, index: true },
    reservationId: { type: String, required: true },
    guestId: { type: String, required: true },
    guestContact: {
      email: String,
      phoneNumber: String,
    },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
    },
    ledger: [
      {
        type: { type: String, required: true },
        amount: { type: Number, required: true },
        note: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

export const BillingModel = mongoose.model<BillingDoc>('Billing', BillingSchema)
