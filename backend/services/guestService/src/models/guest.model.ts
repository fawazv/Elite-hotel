// src/models/guest.model.ts
import { Schema, model, Document } from 'mongoose'
import IGuest from '../interfaces/IGuest'

export interface GuestDocument extends IGuest, Document {}

const ImageSchema = new Schema(
  {
    publicId: { type: String },
    url: { type: String },
  },
  { _id: false }
)

const AddressSchema = new Schema(
  {
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  { _id: false }
)

const IdProofSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Passport', 'NationalID', 'DrivingLicense', 'Other'],
    },
    number: { type: String },
    image: { type: ImageSchema, default: null },
  },
  { _id: false }
)

const PreferencesSchema = new Schema(
  {
    smoking: { type: Boolean },
    roomType: {
      type: String,
      enum: ['Standard', 'Deluxe', 'Premium', 'Luxury'],
    },
    bedType: { type: String, enum: ['Single', 'Double', 'Queen', 'King'] },
    notes: { type: String, maxlength: 2000 },
  },
  { _id: false }
)

const GuestSchema = new Schema<GuestDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true, index: true },
    phoneNumber: {
      type: String,
      required: true,
      index: true,
      validate: {
        validator: (v: string) => /^[0-9]{10,15}$/.test(v),
        message: (props: any) => `${props.value} is not a valid phone number!`,
      },
    },
    dateOfBirth: { type: Date },
    address: { type: AddressSchema },
    idProof: { type: IdProofSchema, default: null },
    preferences: { type: PreferencesSchema },
    notes: { type: String, maxlength: 5000 },
    isBlacklisted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Useful index combo for fast lookup during booking:
GuestSchema.index({ email: 1, phoneNumber: 1 }, { unique: false })

export const Guest = model<GuestDocument>('Guest', GuestSchema)
