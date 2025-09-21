import {
  IHousekeepingService,
  AssignTaskPayload,
} from '../interface/IHousekeeping.service'
import dayjs from 'dayjs'
import { HousekeepingRepository } from '../../repository/housekeeping.repository'
import { RabbitPublisher } from '../../config/rabbit.publisher'
import { HousekeepingTaskDoc } from '../../models/housekeeping.model'
import { NotFoundError } from '../../errors/NotFoundError'

export class HousekeepingService implements IHousekeepingService {
  private repo: HousekeepingRepository
  private publisher: RabbitPublisher

  constructor(repo: HousekeepingRepository, publisher: RabbitPublisher) {
    this.repo = repo
    this.publisher = publisher
  }

  async assignTask(payload: AssignTaskPayload): Promise<HousekeepingTaskDoc> {
    const task = await this.repo.create({
      roomId: payload.roomId,
      reservationId: payload.reservationId,
      assignedTo: payload.assignedTo,
      notes: payload.notes,
      status: 'pending',
    })

    await this.publisher.publish(
      'housekeeping.events',
      'housekeeping.task.assigned',
      {
        event: 'housekeeping.task.assigned',
        data: task,
        createdAt: new Date().toISOString(),
      }
    )

    return task
  }

  async completeTask(
    taskId: string,
    notes?: string
  ): Promise<HousekeepingTaskDoc | null> {
    const existing = await this.repo.findById(taskId)
    if (!existing) throw new NotFoundError('Task not found')

    const updated = await this.repo.update(taskId, {
      status: 'completed',
      notes: notes || existing.notes,
    })

    if (updated) {
      await this.publisher.publish(
        'housekeeping.events',
        'housekeeping.task.completed',
        {
          event: 'housekeeping.task.completed',
          data: updated,
          createdAt: new Date().toISOString(),
        }
      )
    }

    return updated
  }

  async getTask(taskId: string): Promise<HousekeepingTaskDoc | null> {
    return this.repo.findById(taskId)
  }

  async listTasks(query: {
    page?: number
    limit?: number
    roomId?: string
    reservationId?: string
    assignedTo?: string
    status?: 'pending' | 'in-progress' | 'completed'
    dateFrom?: string | Date
    dateTo?: string | Date
    sortBy?: 'createdAt' | 'updatedAt' | 'status'
    sortOrder?: 'asc' | 'desc'
  }) {
    const page = query.page && query.page > 0 ? query.page : 1
    const limit = query.limit && query.limit > 0 ? query.limit : 20
    const skip = (page - 1) * limit

    const filter: any = {}
    if (query.roomId) filter.roomId = query.roomId
    if (query.reservationId) filter.reservationId = query.reservationId
    if (query.assignedTo) filter.assignedTo = query.assignedTo
    if (query.status) filter.status = query.status
    if (query.dateFrom || query.dateTo) {
      filter.createdAt = {}
      if (query.dateFrom)
        filter.createdAt.$gte = dayjs(query.dateFrom).startOf('day').toDate()
      if (query.dateTo)
        filter.createdAt.$lte = dayjs(query.dateTo).endOf('day').toDate()
    }

    const sortField = (query.sortBy || 'createdAt') as string
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1
    const sort = { [sortField]: sortOrder }

    const { data, total } = await this.repo.findAndCount(filter, {
      skip,
      limit,
      sort,
    })
    return { data, total, page, limit }
  }

  /**
   * Reassign a task to another staff member.
   * Only publishes an assigned event (so notifications go out).
   */
  async reassignTask(taskId: string, assignedTo: string, notes?: string) {
    const existing = await this.repo.findById(taskId)
    if (!existing) throw new NotFoundError('Task not found')

    const updated = await this.repo.reassignTask(taskId, assignedTo, notes)
    if (updated) {
      await this.publisher.publish(
        'housekeeping.events',
        'housekeeping.task.assigned',
        {
          event: 'housekeeping.task.assigned',
          data: updated,
          createdAt: new Date().toISOString(),
          meta: { reason: 'reassigned' },
        }
      )
    }
    return updated
  }
}
