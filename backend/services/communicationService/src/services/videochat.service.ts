import videoChatRepository from '../repositories/videochat.repository'
import { IVideoChatSession } from '../models/videoChatSession.model'
import { v4 as uuidv4 } from 'uuid'
import { CallStatus, UserType } from '../types'
import { publishEvent } from '../config/rabbitmq.config'

export class VideoChatService {
  async initiateCall(
    callerId: string,
    receiverId: string,
    callerType: UserType,
    receiverType: UserType
  ): Promise<IVideoChatSession> {
    try {
      const sessionId = uuidv4()

      const session = await videoChatRepository.create({
        sessionId,
        callerId,
        receiverId,
        callerType,
        receiverType,
        status: 'pending',
        startTime: new Date(),
      })

      // Publish event to RabbitMQ
      await publishEvent('videochat.call.initiated', {
        sessionId,
        callerId,
        receiverId,
        callerType,
        receiverType,
        timestamp: new Date(),
      })

      return session
    } catch (error) {
      console.error('Error initiating call:', error)
      throw new Error('Failed to initiate call')
    }
  }

  async updateCallStatus(sessionId: string, status: CallStatus): Promise<IVideoChatSession | null> {
    try {
      const updateData: any = { status }

      if (status === 'active') {
        updateData.startTime = new Date()
      } else if (status === 'ended' || status === 'rejected' || status === 'missed') {
        updateData.endTime = new Date()
        
        // Calculate duration if call was active
        const session = await videoChatRepository.findBySessionId(sessionId)
        if (session && session.startTime) {
          const duration = Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000)
          updateData.duration = duration
        }
      }

      const session = await videoChatRepository.updateStatus(sessionId, status, updateData)

      if (session) {
        // Publish status update event
        await publishEvent(`videochat.call.${status}`, {
          sessionId,
          callerId: session.callerId,
          receiverId: session.receiverId,
          status,
          timestamp: new Date(),
        })
      }

      return session
    } catch (error) {
      console.error('Error updating call status:', error)
      throw new Error('Failed to update call status')
    }
  }

  async getCallHistory(userId: string, limit: number = 50): Promise<IVideoChatSession[]> {
    try {
      return await videoChatRepository.findCallHistory(userId, limit)
    } catch (error) {
      console.error('Error fetching call history:', error)
      throw new Error('Failed to fetch call history')
    }
  }

  async getActiveCall(userId: string): Promise<IVideoChatSession | null> {
    try {
      return await videoChatRepository.findActiveCall(userId)
    } catch (error) {
      console.error('Error fetching active call:', error)
      throw new Error('Failed to fetch active call')
    }
  }

  async getCallById(sessionId: string): Promise<IVideoChatSession | null> {
    try {
      return await videoChatRepository.findBySessionId(sessionId)
    } catch (error) {
      console.error('Error fetching call by ID:', error)
      throw new Error('Failed to fetch call')
    }
  }

  async getAllActiveCalls(): Promise<IVideoChatSession[]> {
    try {
      return await videoChatRepository.findAllActiveCalls()
    } catch (error) {
      console.error('Error fetching active calls:', error)
      throw new Error('Failed to fetch active calls')
    }
  }
}

export default new VideoChatService()

