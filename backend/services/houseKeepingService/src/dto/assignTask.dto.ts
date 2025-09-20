import Joi from 'joi'

export const assignTaskSchema = Joi.object({
  roomId: Joi.string().required(),
  reservationId: Joi.string().optional(),
  assignedTo: Joi.string().required(), // staff id
  notes: Joi.string().max(2000).optional(),
})
