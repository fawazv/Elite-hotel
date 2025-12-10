
import { Request, Response } from 'express'
import { AuthenticatedRequest } from '../types'
import chatbotService from '../services/chatbot.service'
import Joi from 'joi'
import { InputValidator } from '../utils/input-validator'
import { ContentModerator } from '../services/content-moderator.service'
import { ErrorHandler } from '../utils/error-handler'

const sendMessageSchema = Joi.object({
  conversationId: Joi.string().required(),
  message: Joi.string().required().min(1).max(1000),
})

const createConversationSchema = Joi.object({
  context: Joi.object({
    guestId: Joi.string(),
    reservationId: Joi.string(),
    roomNumber: Joi.string(),
    userName: Joi.string(),
  }).optional(),
})

export class ChatbotController {
  async createConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { error } = createConversationSchema.validate(req.body)
      if (error) {
        res.status(400).json({ message: error.details[0].message })
        return
      }

      const userId = req.user!.userId
      const userType = req.user!.role === 'admin' || req.user!.role === 'staff' ? 'staff' : 'guest'
      const { context } = req.body

      const conversation = await chatbotService.createConversation(userId, userType, context)

      res.status(201).json({
        message: 'Conversation created successfully',
        conversationId: conversation.conversationId,
        conversation,
      })
    } catch (error) {
      console.error('Error in createConversation:', error)
      res.status(500).json({ message: 'Failed to create conversation' })
    }
  }

  async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validate request using new InputValidator
      const validatedData = InputValidator.validateMessageRequest(req.body)
      
      // Moderate content
      const { clean, flagged } = await ContentModerator.moderateInput(
        validatedData.message
      )

      if (flagged) {
        console.warn(`[Security] PII detected in message from user ${req.user!.userId}`)
        // We could block the message here, but for now we proceed with the redacted version
      }

      const conversation = await chatbotService.sendMessage(
        validatedData.conversationId,
        clean
      )

      res.json({
        message: 'Message sent successfully',
        conversation,
      })
    } catch (error: any) {
      ErrorHandler.handle(error, req, res)
    }
  }

  async getConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId
      const limit = parseInt(req.query.limit as string) || 20

      const conversations = await chatbotService.getConversations(userId, limit)

      res.json({
        message: 'Conversations retrieved successfully',
        count: conversations.length,
        conversations,
      })
    } catch (error) {
      console.error('Error in getConversations:', error)
      res.status(500).json({ message: 'Failed to retrieve conversations' })
    }
  }

  async getConversationById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params

      const conversation = await chatbotService.getConversationById(conversationId)

      if (!conversation) {
        res.status(404).json({ message: 'Conversation not found' })
        return
      }

      res.json({
        message: 'Conversation retrieved successfully',
        conversation,
      })
    } catch (error) {
      console.error('Error in getConversationById:', error)
      res.status(500).json({ message: 'Failed to retrieve conversation' })
    }
  }

  async updateContext(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params
      const { context } = req.body

      if (!context) {
        res.status(400).json({ message: 'Context is required' })
        return
      }

      const conversation = await chatbotService.updateContext(conversationId, context)

      if (!conversation) {
        res.status(404).json({ message: 'Conversation not found' })
        return
      }

      res.json({
        message: 'Context updated successfully',
        conversation,
      })
    } catch (error) {
      console.error('Error in updateContext:', error)
      res.status(500).json({ message: 'Failed to update context' })
    }
  }

  async handoffToAgent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { conversationId } = req.body

      if (!conversationId) {
        res.status(400).json({ message: 'Conversation ID is required' })
        return
      }

      const conversation = await chatbotService.handoffToAgent(conversationId)

      if (!conversation) {
        res.status(404).json({ message: 'Conversation not found' })
        return
      }

      res.json({
        message: 'Conversation handed off to agent successfully',
        conversation,
      })
    } catch (error) {
      console.error('Error in handoffToAgent:', error)
      res.status(500).json({ message: 'Failed to handoff conversation' })
    }
  }

  async closeConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params

      const conversation = await chatbotService.closeConversation(conversationId)

      if (!conversation) {
        res.status(404).json({ message: 'Conversation not found' })
        return
      }

      res.json({
        message: 'Conversation closed successfully',
        conversation,
      })
    } catch (error) {
      console.error('Error in closeConversation:', error)
      res.status(500).json({ message: 'Failed to close conversation' })
    }
  }

  async getGuestToken(req: Request, res: Response): Promise<void> {
    try {
      const { name, guestId } = req.body
      
      const tokenData = await chatbotService.generateGuestToken(name, guestId)
      
      res.json({
        message: 'Guest token generated successfully',
        ...tokenData
      })
    } catch (error) {
      console.error('Error in getGuestToken:', error)
      res.status(500).json({ message: 'Failed to generate guest token' })
    }
  }
}

export default new ChatbotController()
