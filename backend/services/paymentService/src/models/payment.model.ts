// src/models/payment.model.ts
import mongoose, { Schema, Document } from 'mongoose'

export interface PaymentDoc extends Document {
  reservationId: string
  guestId: string
  amount: number
  currency: string
  provider: 'stripe' | 'razorpay'
  providerPaymentId?: string
  status: 'initiated' | 'succeeded' | 'failed' | 'refunded'
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const PaymentSchema = new Schema<PaymentDoc>(
  {
    reservationId: { type: String, required: true, index: true },
    guestId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'INR' },
    provider: { type: String, enum: ['stripe', 'razorpay'], required: true },
    providerPaymentId: { type: String },
    status: {
      type: String,
      enum: ['initiated', 'succeeded', 'failed', 'refunded'],
      default: 'initiated',
    },
    metadata: { type: Object },
  },
  { timestamps: true }
)

export const PaymentModel = mongoose.model<PaymentDoc>('Payment', PaymentSchema)
