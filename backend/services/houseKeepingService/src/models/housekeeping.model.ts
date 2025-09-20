import mongoose, { Schema, Document } from 'mongoose'

export interface HousekeepingTaskDoc extends Document {
  roomId: string
  reservationId?: string
  assignedTo?: string
  status: 'pending' | 'in-progress' | 'completed'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const HousekeepingSchema = new Schema<HousekeepingTaskDoc>(
  {
    roomId: { type: String, required: true, index: true },
    reservationId: { type: String, index: true },
    assignedTo: { type: String, index: true },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    notes: { type: String },
  },
  { timestamps: true }
)

export const HousekeepingModel = mongoose.model<HousekeepingTaskDoc>(
  'HousekeepingTask',
  HousekeepingSchema
)
