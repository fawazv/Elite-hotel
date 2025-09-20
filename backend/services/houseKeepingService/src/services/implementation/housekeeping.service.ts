import {
  IHousekeepingService,
  AssignTaskPayload,
} from '../interface/IHousekeeping.service'
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
}
