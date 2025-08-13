import Joi from 'joi'

export const createRoomSchema = Joi.object({
  roomId: Joi.number().integer().positive().optional(),
  name: Joi.string().min(2).max(200).required(),
  type: Joi.string().required(),
  price: Joi.number().positive().required(),
  image: Joi.string().uri().optional(),
  description: Joi.string().allow('', null).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  size: Joi.string().optional(),
  capacity: Joi.string().optional(),
  rating: Joi.number().min(0).max(5).optional(),
  available: Joi.boolean().optional(),
})

export const updateRoomSchema = createRoomSchema

export const patchRoomSchema = Joi.object({
  price: Joi.number().positive().optional(),
  available: Joi.boolean().optional(),
  rating: Joi.number().min(0).max(5).optional(),
  description: Joi.string().allow('', null).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  name: Joi.string().min(2).max(200).optional(),
  image: Joi.string().uri().optional(),
}).min(1)
