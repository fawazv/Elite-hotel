// src/validators/user.validator.ts
import Joi from 'joi'

export const updateUserSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required(),
  role: Joi.string().valid('admin', 'receptionist', 'housekeeper').required(),
  isApproved: Joi.string().valid('pending', 'approved', 'rejected').optional(),
  // do not accept password here
})

export const patchUserSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).optional(),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional(),
  role: Joi.string().valid('admin', 'receptionist', 'housekeeper').optional(),
  isApproved: Joi.string().valid('pending', 'approved', 'rejected').optional(),
}).min(1)
