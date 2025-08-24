import nodemailer from 'nodemailer'
import twilio from 'twilio'

export interface INotificationService {
  sendBookingConfirmation(
    email: string,
    phone: string,
    reservationDetails: any
  ): Promise<void>
  sendReminder(
    email: string,
    phone: string,
    reservationDetails: any
  ): Promise<void>
  sendCancellation(
    email: string,
    phone: string,
    reservationDetails: any
  ): Promise<void>
}

export class NotificationService implements INotificationService {
  private mailer
  private smsClient

  constructor() {
    // Email (using nodemailer + SMTP or any provider like SendGrid)
    this.mailer = nodemailer.createTransport({
      service: 'Gmail', // can swap with SendGrid, SES
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // SMS (Twilio)
    this.smsClient = twilio(
      process.env.TWILIO_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    )
  }

  async sendBookingConfirmation(
    email: string,
    phone: string,
    reservationDetails: any
  ) {
    const msg = `Booking Confirmed!\nRoom: ${reservationDetails.roomId}\nCheck-in: ${reservationDetails.checkIn}`
    await this.mailer.sendMail({
      from: 'hotel@example.com',
      to: email,
      subject: 'Booking Confirmation',
      text: msg,
    })
    await this.smsClient.messages.create({
      from: process.env.TWILIO_PHONE!,
      to: phone,
      body: msg,
    })
  }

  async sendReminder(email: string, phone: string, reservationDetails: any) {
    const msg = `Reminder: Your check-in is on ${reservationDetails.checkIn}`
    await this.mailer.sendMail({
      from: 'hotel@example.com',
      to: email,
      subject: 'Check-in Reminder',
      text: msg,
    })
    await this.smsClient.messages.create({
      from: process.env.TWILIO_PHONE!,
      to: phone,
      body: msg,
    })
  }

  async sendCancellation(
    email: string,
    phone: string,
    reservationDetails: any
  ) {
    const msg = `Your booking (Room ${reservationDetails.roomId}) has been cancelled.`
    await this.mailer.sendMail({
      from: 'hotel@example.com',
      to: email,
      subject: 'Booking Cancelled',
      text: msg,
    })
    await this.smsClient.messages.create({
      from: process.env.TWILIO_PHONE!,
      to: phone,
      body: msg,
    })
  }
}
