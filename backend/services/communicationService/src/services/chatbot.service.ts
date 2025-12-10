import conversationRepository, { ConversationContext } from '../repositories/conversation.repository'
import { IConversation } from '../models/conversation.model'
import { v4 as uuidv4 } from 'uuid'
import geminiService, { ChatContext } from './gemini.service'
import { publishEvent } from '../config/rabbitmq.config'
import { Message } from '../types'
import jwt from 'jsonwebtoken'

export class ChatbotService {
  async createConversation(
    userId: string,
    userType: 'guest' | 'staff',
    context?: ConversationContext
  ): Promise<IConversation> {
    try {
      const conversationId = uuidv4()

      const conversation = await conversationRepository.create({
        conversationId,
        userId,
        userType,
        context: context || {},
      })

      await publishEvent('chatbot.conversation.started', {
        conversationId,
        userId,
        userType,
        timestamp: new Date(),
      })

      return conversation
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw new Error('Failed to create conversation')
    }
  }

  async sendMessage(conversationId: string, userMessage: string): Promise<IConversation> {
    try {
      const conversation = await conversationRepository.findByConversationId(conversationId)

      if (!conversation) {
        throw new Error('Conversation not found')
      }

      if (conversation.status !== 'active') {
        throw new Error('Conversation is not active')
      }

      // Add user message to conversation
      const userMsg = {
        sender: 'user' as const,
        content: userMessage,
        timestamp: new Date(),
      }

      // Detect intent
      const { intent, confidence } = await geminiService.detectIntent(userMessage)

      // Build context for Gemini
      const chatContext: ChatContext = {
        userName: conversation.context.userName,
        roomNumber: conversation.context.roomNumber,
        reservationId: conversation.context.reservationId?.toString(),
        checkInDate: conversation.context.checkInDate,
        checkOutDate: conversation.context.checkOutDate,
        conversationHistory: conversation.messages.slice(-10).map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })),
      }

      // Generate AI response
      const botResponse = await geminiService.generateResponse(userMessage, chatContext)

      // Add bot response
      const botMsg = {
        sender: 'bot' as const,
        content: botResponse,
        timestamp: new Date(),
        intent,
        confidence,
      }

      // Add both messages to conversation
      const updatedConversation = await conversationRepository.addMessages(conversationId, [userMsg, botMsg])

      // Check if handoff is needed (complaints or low confidence)
      const requiresHandoff = intent === 'complaint' || confidence < 0.6

      if (requiresHandoff && updatedConversation) {
        await publishEvent('chatbot.handoff.requested', {
          conversationId,
          userId: updatedConversation.userId,
          intent,
          confidence,
          timestamp: new Date(),
        })
      }

      return updatedConversation!
    } catch (error) {
      console.error('Error sending message:', error)
      throw new Error('Failed to send message')
    }
  }

  async getConversations(userId: string, limit: number = 20): Promise<IConversation[]> {
    try {
      return await conversationRepository.findByUserId(userId, limit)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      throw new Error('Failed to fetch conversations')
    }
  }

  async getConversationById(conversationId: string): Promise<IConversation | null> {
    try {
      return await conversationRepository.findByConversationId(conversationId)
    } catch (error) {
      console.error('Error fetching conversation:', error)
      throw new Error('Failed to fetch conversation')
    }
  }

  async updateContext(
    conversationId: string,
    context: Partial<ConversationContext>
  ): Promise<IConversation | null> {
    try {
      return await conversationRepository.updateContext(conversationId, context)
    } catch (error) {
      console.error('Error updating context:', error)
      throw new Error('Failed to update context')
    }
  }

  async handoffToAgent(conversationId: string): Promise<IConversation | null> {
    try {
      const conversation = await conversationRepository.updateStatus(conversationId, 'handoff')

      if (conversation) {
        await publishEvent('chatbot.handoff.completed', {
          conversationId,
          userId: conversation.userId,
          timestamp: new Date(),
        })
      }

      return conversation
    } catch (error) {
      console.error('Error handing off conversation:', error)
      throw new Error('Failed to handoff conversation')
    }
  }

  async closeConversation(conversationId: string): Promise<IConversation | null> {
    try {
      const conversation = await conversationRepository.updateStatus(conversationId, 'closed')

      if (conversation) {
        geminiService.resetChat()
        
        await publishEvent('chatbot.conversation.closed', {
          conversationId,
          userId: conversation.userId,
          messageCount: conversation.messages.length,
          timestamp: new Date(),
        })
      }

      return conversation
    } catch (error) {
      console.error('Error closing conversation:', error)
      throw new Error('Failed to close conversation')
    }
  }


  async generateGuestToken(name?: string, existingGuestId?: string): Promise<{ token: string, guestId: string, name: string }> {
    try {
      const guestId = existingGuestId || `guest_${uuidv4()}`
      const guestName = name || 'Anonymous Guest'
      
      const token = jwt.sign(
        {
          userId: guestId,
          role: 'guest',
          name: guestName
        },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      )
      
      return { token, guestId, name: guestName }
    } catch (error) {
      console.error('Error generating guest token:', error)
      throw new Error('Failed to generate guest token')
    }
  }
}

export default new ChatbotService()

