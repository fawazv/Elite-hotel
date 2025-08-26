// notification-service/src/services/sms.service.ts
import twilio, { Twilio } from 'twilio'

export class SmsService {
  private client: Twilio
  private from: string

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID || ''
    const authToken = process.env.TWILIO_AUTH_TOKEN || ''
    this.from = process.env.TWILIO_PHONE_NUMBER || ''

    if (!accountSid || !authToken || !this.from) {
      throw new Error('Twilio credentials or phone number are missing in env')
    }

    this.client = twilio(accountSid, authToken)
  }

  async sendSms({ to, body }: { to: string; body: string }) {
    if (!to) return

    try {
      const message = await this.client.messages.create({
        body,
        from: this.from,
        to,
      })
      console.log(`✅ SMS sent to ${to}, Message SID: ${message.sid}`)
      return message
    } catch (err: any) {
      console.error('❌ Error sending SMS:', err.message)
      throw err
    }
  }
}
