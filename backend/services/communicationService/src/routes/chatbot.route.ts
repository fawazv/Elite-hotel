import express from 'express'
import chatbotController from '../controllers/chatbot.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Conversation management
router.post('/conversation', (req, res) => chatbotController.createConversation(req, res))
router.get('/conversations', (req, res) => chatbotController.getConversations(req, res))
router.get('/conversation/:conversationId', (req, res) =>
  chatbotController.getConversationById(req, res)
)
router.delete('/conversation/:conversationId', (req, res) =>
  chatbotController.closeConversation(req, res)
)

// Messaging
router.post('/message', (req, res) => chatbotController.sendMessage(req, res))

// Context and handoff
router.put('/context/:conversationId', (req, res) => chatbotController.updateContext(req, res))
router.post('/handoff', (req, res) => chatbotController.handoffToAgent(req, res))

export default router
