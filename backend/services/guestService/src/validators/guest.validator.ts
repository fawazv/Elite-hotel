// src/validators/guest.validator.ts
import Joi from 'joi'

const phone = Joi.string().pattern(/^[0-9]{10,15}$/)

const address = Joi.object({
  line1: Joi.string().allow('', null),
  line2: Joi.string().allow('', null),
  city: Joi.string().allow('', null),
  state: Joi.string().allow('', null),
  postalCode: Joi.string().allow('', null),
  country: Joi.string().allow('', null),
})

const idProof = Joi.object({
  type: Joi.string()
    .valid('Passport', 'NationalID', 'DrivingLicense', 'Other')
    .optional(),
  number: Joi.string().max(100).optional(),
})

const preferences = Joi.object({
  smoking: Joi.alternatives(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ),
  roomType: Joi.string().valid('Standard', 'Deluxe', 'Premium', 'Luxury'),
  bedType: Joi.string().valid('Single', 'Double', 'Queen', 'King'),
  notes: Joi.string().max(2000),
})

export const createGuestSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(1).max(100).optional(),
  email: Joi.string().email().optional(),
  phoneNumber: phone.required(),
  dateOfBirth: Joi.date().optional(),
  address: address.optional(),
  idProof: idProof.optional(),
  preferences: preferences.optional(),
  notes: Joi.string().max(5000).optional(),
  isBlacklisted: Joi.boolean().optional(),
})

export const updateGuestSchema = createGuestSchema // PUT expects full valid object if you want strictness

export const patchGuestSchema = Joi.object({
  firstName: Joi.string().min(2).max(100),
  lastName: Joi.string().min(1).max(100),
  email: Joi.string().email(),
  phoneNumber: phone,
  dateOfBirth: Joi.date(),
  address: address,
  idProof: idProof,
  preferences: preferences,
  notes: Joi.string().max(5000),
  isBlacklisted: Joi.boolean(),
}).min(1)

export const ensureGuestSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(1).max(100).optional(),
  email: Joi.string().email().optional(),
  phoneNumber: phone.required(),
  idProof: idProof.optional(),
})
