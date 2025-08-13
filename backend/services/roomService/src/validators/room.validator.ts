import Joi from 'joi'

export const createRoomSchema = Joi.object({
  number: Joi.number().integer().min(1).required(),
  name: Joi.string().trim().min(2).max(100).required(),
  type: Joi.string()
    .valid('Standard', 'Deluxe', 'Premium', 'Luxury')
    .required(),
  price: Joi.number().min(0).required(),
  image: Joi.string().uri().optional(),
  description: Joi.string().max(2000).optional(),
  amenities: Joi.array().items(Joi.string().trim()).default([]),
  size: Joi.string().optional(),
  capacity: Joi.string().optional(),
  rating: Joi.number().min(0).max(5).optional(),
  available: Joi.boolean().default(true),
})

export const updateRoomSchema = createRoomSchema // full overwrite (PUT)

export const patchRoomSchema = Joi.object({
  number: Joi.number().integer().min(1),
  name: Joi.string().trim().min(2).max(100),
  type: Joi.string().valid('Standard', 'Deluxe', 'Premium', 'Luxury'),
  price: Joi.number().min(0),
  image: Joi.string().uri(),
  description: Joi.string().max(2000),
  amenities: Joi.array().items(Joi.string().trim()),
  size: Joi.string(),
  capacity: Joi.string(),
  rating: Joi.number().min(0).max(5),
  available: Joi.boolean(),
}).min(1)
