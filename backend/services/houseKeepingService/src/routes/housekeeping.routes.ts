import { Router } from 'express'
import { createContainer } from '../config/container'
import validateRequest from '../middleware/validateRequest'
import { assignTaskSchema } from '../dto/assignTask.dto'
import { completeTaskSchema } from '../dto/completeTask.dto'
import { authenticateToken } from '../middleware/auth.middleware'
import { authorizeRole } from '../middleware/authorizeRole'

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

  // complete -> Housekeeper only
  router.post(
    '/tasks/:id/complete',
    authenticateToken,
    authorizeRole(['housekeeper']),
    validateRequest(completeTaskSchema),
    ctrl.completeTask
  )

  // get -> any authenticated staff
  router.get('/tasks/:id', authenticateToken, ctrl.getTask)

  return router
}
