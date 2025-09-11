// notification-service/src/services/email.service.ts
import nodemailer from 'nodemailer'

export class EmailService {
  private transporter: nodemailer.Transporter
  constructor() {
    // Example: use SMTP transport from env
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async sendMail({
    to,
    subject,
    text,
    html,
    attachments,
  }: {
    to: string
    subject: string
    text?: string
    html?: string
    attachments?: { filename: string; content: Buffer }[]
  }) {
    if (!to) return
    const info = await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
      attachments,
    })
    return info
  }
}
