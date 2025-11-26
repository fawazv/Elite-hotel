import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' })

const HOTEL_SYSTEM_PROMPT = `You are an AI assistant for Elite Hotel, a luxury hotel management system.

Your role is to help guests and staff with:
- Room availability and booking inquiries
- Check-in and check-out information
- Room service requests
- Hotel facilities and amenities information
- Billing and payment inquiries
- Complaint handling
- General hotel FAQs

IMPORTANT GUIDELINES:
1. Be professional, friendly, and helpful
2. Keep responses concise and clear
3. If you don't have specific information, suggest contacting the front desk
4. For complex issues or complaints, offer to connect them with a human agent
5. Always prioritize guest satisfaction
6. Use the conversation context to provide personalized responses

HOTEL INFORMATION:
- Hotel Name: Elite Hotel
- Check-in Time: 3:00 PM
- Check-out Time: 11:00 AM
- Room Service: 24/7
- Facilities: Pool, Gym, Spa, Restaurant, Bar, Conference Rooms
- Contact: reception@elitehotel.com | +1-234-567-8900

When responding:
- If asked about room availability, acknowledge the query and suggest checking availability
- If asked about billing, refer to the billing service
- For complaints, acknowledge empathetically and offer human assistance
- Keep responses under 150 words unless more detail is specifically requested`

export interface ChatContext {
  userName?: string
  roomNumber?: string
  reservationId?: string
  checkInDate?: Date
  checkOutDate?: Date
  conversationHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>
}

export class GeminiService {
  private chat: any

  async generateResponse(userMessage: string, context: ChatContext): Promise<string> {
    try {
      // Build context-aware prompt
      let contextInfo = ''
      if (context.userName) contextInfo += `Guest Name: ${context.userName}\n`
      if (context.roomNumber) contextInfo += `Room Number: ${context.roomNumber}\n`
      if (context.reservationId) contextInfo += `Reservation ID: ${context.reservationId}\n`
      if (context.checkInDate) contextInfo += `Check-in Date: ${context.checkInDate}\n`
      if (context.checkOutDate) contextInfo += `Check-out Date: ${context.checkOutDate}\n`

      // Start or continue chat
      if (!this.chat) {
        const history = context.conversationHistory.length > 0 ? context.conversationHistory : []
        
        this.chat = model.startChat({
          history,
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
          },
        })
      }

      const promptWithContext = contextInfo
        ? `${HOTEL_SYSTEM_PROMPT}\n\nCONTEXT:\n${contextInfo}\n\nUser Message: ${userMessage}`
        : `${HOTEL_SYSTEM_PROMPT}\n\nUser Message: ${userMessage}`

      const result = await this.chat.sendMessage(promptWithContext)
      const response = result.response
      const text = response.text()

      return text
    } catch (error) {
      console.error('Error generating Gemini response:', error)
      throw new Error('Failed to generate AI response')
    }
  }

  async detectIntent(userMessage: string): Promise<{ intent: string; confidence: number }> {
    try {
      const intentPrompt = `Analyze this hotel guest message and identify the primary intent. 
      
Possible intents:
- room_availability
- make_booking
- modify_booking
- cancel_booking
- check_in_info
- check_out_info
- room_service
- facilities_info
- billing_inquiry
- complaint
- general_faq
- other

Message: "${userMessage}"

Respond ONLY with: intent_name,confidence_score (e.g., room_availability,0.95)`

      const result = await model.generateContent(intentPrompt)
      const response = result.response.text().trim()
      
      const [intent, confidenceStr] = response.split(',')
      const confidence = parseFloat(confidenceStr) || 0.5

      return { intent: intent.trim(), confidence }
    } catch (error) {
      console.error('Error detecting intent:', error)
      return { intent: 'general_faq', confidence: 0.5 }
    }
  }

  resetChat(): void {
    this.chat = null
  }
}

export default new GeminiService()
