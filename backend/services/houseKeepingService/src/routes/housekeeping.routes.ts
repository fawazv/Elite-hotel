import { Router } from 'express'
import { createContainer } from '../config/container'
import validateRequest from '../middleware/validateRequest'
import { assignTaskSchema } from '../dto/assignTask.dto'
import { completeTaskSchema } from '../dto/completeTask.dto'
import authenticateToken from '../middleware/auth.middleware'
import { authorizeRole } from '../middleware/authorizeRole'
import { reassignTaskSchema } from '../dto/reassignTask.dto'
import { listTasksSchema } from '../dto/listTasks.dto'

export default function routes(container = createContainer()) {
  const router = Router()
  const ctrl = container.controller

  // assign -> Admin or Receptionist
  router.post(
    '/tasks/assign',
    authenticateToken,
    authorizeRole(['admin', 'receptionist']),
    validateRequest(assignTaskSchema),
    ctrl.assignTask
  )

  router.patch(
    '/tasks/:id/reassign',
    authenticateToken,
    authorizeRole(['admin', 'receptionist']),
    validateRequest(reassignTaskSchema),
    ctrl.reassignTask
  )

  // complete -> Housekeeper only
  router.post(
    '/tasks/:id/complete',
    authenticateToken,
    authorizeRole(['housekeeper']),
    validateRequest(completeTaskSchema),
    ctrl.completeTask
  )

  // list -> any authenticated staff (with filtering)
  router.get(
    '/tasks',
    authenticateToken,
    (req, res, next) => {
      // validate query against Joi schema
      const { error } = listTasksSchema.validate(req.query, {
        abortEarly: false,
        allowUnknown: false,
      })
      if (error) return next(error)
      next()
    },
    ctrl.listTasks
  )

  // get -> any authenticated staff
  router.get('/tasks/:id', authenticateToken, ctrl.getTask)

  return router
}
