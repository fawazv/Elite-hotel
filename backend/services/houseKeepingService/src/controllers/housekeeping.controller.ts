import { Request, Response } from 'express'
import { HousekeepingService } from '../services/implementation/housekeeping.service'
import { asyncHandler } from '../middleware/asyncHandler'
import { CustomeRequest } from '../interfaces/CustomRequest'

export class HousekeepingController {
  constructor(private svc: HousekeepingService) {}

  assignTask = asyncHandler(async (req: CustomeRequest, res: Response) => {
    const payload = req.body
    const task = await this.svc.assignTask(payload)
    res.status(201).json({ success: true, data: task })
  })

  completeTask = asyncHandler(async (req: CustomeRequest, res: Response) => {
    const taskId = req.params.id
    const notes = req.body.notes
    const updated = await this.svc.completeTask(taskId, notes)
    res.json({ success: true, data: updated })
  })

  getTask = asyncHandler(async (req: CustomeRequest, res: Response) => {
    const task = await this.svc.getTask(req.params.id)
    if (!task)
      return res.status(404).json({ success: false, message: 'Task not found' })
    res.json({ success: true, data: task })
  })

  listTasks = asyncHandler(async (req: CustomeRequest, res: Response) => {
    // validated query was applied at route-level
    const q = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      roomId: req.query.roomId as string | undefined,
      reservationId: req.query.reservationId as string | undefined,
      assignedTo: req.query.assignedTo as string | undefined,
      status: req.query.status as any,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
      sortBy: (req.query.sortBy as any) || 'createdAt',
      sortOrder: (req.query.sortOrder as any) || 'desc',
    }

    const result = await this.svc.listTasks(q)
    res.json({ success: true, ...result })
  })

  reassignTask = asyncHandler(async (req: CustomeRequest, res: Response) => {
    const taskId = req.params.id
    const { assignedTo, notes } = req.body
    const updated = await this.svc.reassignTask(taskId, assignedTo, notes)
    res.json({ success: true, data: updated })
  })
}
