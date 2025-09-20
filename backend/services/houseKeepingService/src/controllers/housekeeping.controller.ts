import { Request, Response } from 'express'
import { HousekeepingService } from '../services/implementation/housekeeping.service'
import { asyncHandler } from '../middleware/asyncHandler'
import { AuthRequest } from '../middleware/auth.middleware'

export class HousekeepingController {
  constructor(private svc: HousekeepingService) {}

  assignTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    const payload = req.body
    const task = await this.svc.assignTask(payload)
    res.status(201).json({ success: true, data: task })
  })

  completeTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    const taskId = req.params.id
    const notes = req.body.notes
    const updated = await this.svc.completeTask(taskId, notes)
    res.json({ success: true, data: updated })
  })

  getTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    const task = await this.svc.getTask(req.params.id)
    if (!task)
      return res.status(404).json({ success: false, message: 'Task not found' })
    res.json({ success: true, data: task })
  })
}
