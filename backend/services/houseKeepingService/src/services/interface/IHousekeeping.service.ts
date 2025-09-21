import { HousekeepingTaskDoc } from '../../models/housekeeping.model'

/**
 * Payload for assigning a housekeeping task
 */
export interface AssignTaskPayload {
  roomId: string
  reservationId?: string
  assignedTo: string
  notes?: string
  idempotencyKey?: string
}

/**
 * Contract for HousekeepingService
 */
export interface IHousekeepingService {
  assignTask(payload: AssignTaskPayload): Promise<HousekeepingTaskDoc>
  completeTask(
    taskId: string,
    notes?: string
  ): Promise<HousekeepingTaskDoc | null>
  getTask(taskId: string): Promise<HousekeepingTaskDoc | null>
}
