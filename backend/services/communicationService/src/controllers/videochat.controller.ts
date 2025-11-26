import { Response } from 'express'
import { AuthenticatedRequest } from '../types'
import videoChatService from '../services/videochat.service'
import Joi from 'joi'

const initiateCallSchema = Joi.object({
  receiverId: Joi.string().required(),
  receiverType: Joi.string().valid('guest', 'staff').required(),
})

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'ended', 'rejected', 'missed').required(),
})

export class VideoChatController {
  async initiateCall(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { error } = initiateCallSchema.validate(req.body)
      if (error) {
        res.status(400).json({ message: error.details[0].message })
        return
      }

      const callerId = req.user!.userId
      const callerType = req.user!.role === 'admin' || req.user!.role === 'staff' ? 'staff' : 'guest'
      const { receiverId, receiverType } = req.body

      const session = await videoChatService.initiateCall(
        callerId,
        receiverId,
        callerType,
        receiverType
      )

      res.status(201).json({
        message: 'Call initiated successfully',
        sessionId: session.sessionId,
        session,
      })
    } catch (error: any) {
      console.error('Error in initiateCall:', error)
      res.status(500).json({ message: error.message || 'Failed to initiate call' })
    }
  }

  async updateCallStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params
      const { error } = updateStatusSchema.validate(req.body)
      
      if (error) {
        res.status(400).json({ message: error.details[0].message })
        return
      }

      const { status } = req.body

      const session = await videoChatService.updateCallStatus(sessionId, status)

      if (!session) {
        res.status(404).json({ message: 'Call session not found' })
        return
      }

      res.json({
        message: 'Call status updated successfully',
        session,
      })
    } catch (error: any) {
      console.error('Error in updateCallStatus:', error)
      res.status(500).json({ message: error.message || 'Failed to update call status' })
    }
  }

  async getCallHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId
      const limit = parseInt(req.query.limit as string) || 50

      const history = await videoChatService.getCallHistory(userId, limit)

      res.json({
        message: 'Call history retrieved successfully',
        count: history.length,
        history,
      })
    } catch (error) {
      console.error('Error in getCallHistory:', error)
      res.status(500).json({ message: 'Failed to retrieve call history' })
    }
  }

  async getActiveCall(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId

      const activeCall = await videoChatService.getActiveCall(userId)

      if (!activeCall) {
        res.status(404).json({ message: 'No active call found' })
        return
      }

      res.json({
        message: 'Active call retrieved successfully',
        call: activeCall,
      })
    } catch (error) {
      console.error('Error in getActiveCall:', error)
      res.status(500).json({ message: 'Failed to retrieve active call' })
    }
  }

  async getCallById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params

      const call = await videoChatService.getCallById(sessionId)

      if (!call) {
        res.status(404).json({ message: 'Call not found' })
        return
      }

      res.json({
        message: 'Call retrieved successfully',
        call,
      })
    } catch (error) {
      console.error('Error in getCallById:', error)
      res.status(500).json({ message: 'Failed to retrieve call' })
    }
  }

  async getAllActiveCalls(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Only allow staff/admin to see all active calls
      if (req.user!.role !== 'admin' && req.user!.role !== 'staff') {
        res.status(403).json({ message: 'Forbidden: Insufficient permissions' })
        return
      }

      const activeCalls = await videoChatService.getAllActiveCalls()

      res.json({
        message: 'Active calls retrieved successfully',
        count: activeCalls.length,
        calls: activeCalls,
      })
    } catch (error) {
      console.error('Error in getAllActiveCalls:', error)
      res.status(500).json({ message: 'Failed to retrieve active calls' })
    }
  }
}

export default new VideoChatController()
