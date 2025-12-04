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

  // ===== TASK MANAGEMENT =====
  
  // Assign task -> Admin or Receptionist
  router.post(
    '/tasks/assign',
    authenticateToken,
    authorizeRole(['admin', 'receptionist']),
    validateRequest(assignTaskSchema),
    ctrl.assignTask
  )

  // Bulk assign tasks -> Admin or Receptionist
  router.post(
    '/tasks/bulk-assign',
    authenticateToken,
    authorizeRole(['admin', 'receptionist']),
    ctrl.bulkAssignTasks
  )

  // Reassign task -> Admin or Receptionist
  router.patch(
    '/tasks/:id/reassign',
    authenticateToken,
    authorizeRole(['admin', 'receptionist']),
    validateRequest(reassignTaskSchema),
    ctrl.reassignTask
  )

  // Update task status -> Admin, Receptionist, or Housekeeper
  router.patch(
    '/tasks/:id/status',
    authenticateToken,
    authorizeRole(['admin', 'receptionist', 'housekeeper']),
    ctrl.updateTaskStatus
  )

  // Update checklist -> Housekeeper
  router.patch(
    '/tasks/:id/checklist',
    authenticateToken,
    authorizeRole(['housekeeper']),
    ctrl.updateChecklist
  )

  // Complete task -> Housekeeper
  router.post(
    '/tasks/:id/complete',
    authenticateToken,
    authorizeRole(['housekeeper']),
    validateRequest(completeTaskSchema),
    ctrl.completeTask
  )

  // ===== QUERY/REPORTING =====

  // List tasks -> Any authenticated staff (with filtering)
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

  // Get task by ID -> Any authenticated staff
  router.get('/tasks/:id', authenticateToken, ctrl.getTask)

  // Get tasks by staff member
  router.get(
    '/staff/:staffId/tasks',
    authenticateToken,
    authorizeRole(['admin', 'receptionist']),
    ctrl.getTasksByStaff
  )

  // Get room cleaning history
  router.get(
    '/rooms/:roomId/history',
    authenticateToken,
    ctrl.getRoomHistory
  )

  // Get task statistics
  router.get(
    '/statistics',
    authenticateToken,
    authorizeRole(['admin', 'receptionist']),
    ctrl.getTaskStatistics
  )

  return router
}
