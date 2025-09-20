import Joi from 'joi'

export const listTasksSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(20),
  roomId: Joi.string().optional(),
  reservationId: Joi.string().optional(),
  assignedTo: Joi.string().optional(),
  status: Joi.string().valid('pending', 'in-progress', 'completed').optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional(),
  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'status')
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
})
