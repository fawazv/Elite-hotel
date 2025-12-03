// src/utils/pdf.service.ts
import PDFDocument from 'pdfkit'
import { BillingDoc } from '../models/billing.model'

export class PDFService {
  /**
   * Generate a professional PDF invoice
   * @param billing - Billing document
   * @returns PDF Buffer
   */
  static async generateInvoice(billing: BillingDoc): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 })
        const buffers: Buffer[] = []

        doc.on('data', buffers.push.bind(buffers))
        doc.on('end', () => resolve(Buffer.concat(buffers)))
        doc.on('error', reject)

        // Header - Hotel Branding
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('Elite Hotel', { align: 'center' })
          .fontSize(10)
          .font('Helvetica')
          .text('Luxury Accommodation & Services', { align: 'center' })
          .moveDown(0.5)
          .text('123 Luxury Avenue, Elite City, EC 12345', { align: 'center' })
          .text('Phone: +1 (555) 123-4567 | Email: billing@elitehotel.com', {
            align: 'center',
          })
          .moveDown(2)

        // Invoice Title and Number
        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .text('INVOICE', { align: 'center' })
          .moveDown(0.3)
          .fontSize(10)
          .font('Helvetica')
          .text(`Invoice #: ${billing._id.toString().slice(-8).toUpperCase()}`, {
            align: 'center',
          })
          .moveDown(1.5)

        // Billing Information Section
        const leftColumn = 50
        const rightColumn = 350

        // Date Information (Left)
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('Invoice Date:', leftColumn)
          .font('Helvetica')
          .text(new Date(billing.createdAt).toLocaleDateString(), leftColumn)
          .moveDown(0.5)

        // Guest Information (Right)
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('Bill To:', rightColumn, doc.y - 30)
          .font('Helvetica')
          .text(billing.guestContact?.email || 'N/A', rightColumn)
        if (billing.guestContact?.phoneNumber) {
          doc.text(billing.guestContact.phoneNumber, rightColumn)
        }
        doc
          .fontSize(9)
          .text(`Guest ID: ${billing.guestId}`, rightColumn)
          .text(`Reservation: ${billing.reservationId}`, rightColumn)
          .moveDown(2)

        // Transaction Details Table
        const tableTop = doc.y
        const itemHeight = 25

        // Table Headers
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#333')

        // Draw header background
        doc
          .rect(leftColumn, tableTop, 495, 20)
          .fillAndStroke('#f0f0f0', '#ccc')

        doc
          .fillColor('#000')
          .text('Date', leftColumn + 5, tableTop + 5)
          .text('Description', leftColumn + 100, tableTop + 5)
          .text('Type', leftColumn + 300, tableTop + 5)
          .text('Amount', leftColumn + 400, tableTop + 5, { width: 90, align: 'right' })

        // Table Rows - Ledger Entries
        let yPosition = tableTop + 25
        doc.font('Helvetica').fontSize(9)

        billing.ledger.forEach((entry, index) => {
          // Alternate row colors
          if (index % 2 === 0) {
            doc
              .rect(leftColumn, yPosition - 3, 495, itemHeight)
              .fillAndStroke('#fafafa', '#eee')
          }

          doc
            .fillColor('#000')
            .text(
              new Date(entry.createdAt).toLocaleDateString(),
              leftColumn + 5,
              yPosition
            )
            .text(entry.note || entry.type, leftColumn + 100, yPosition, { width: 180 })
            .text(entry.type.toUpperCase(), leftColumn + 300, yPosition)
            .text(
              `${entry.amount >= 0 ? '+' : ''}${entry.amount.toFixed(2)}`,
              leftColumn + 400,
              yPosition,
              { width: 90, align: 'right' }
            )

          yPosition += itemHeight
        })

        // Summary Section
        yPosition += 20
        const summaryX = rightColumn + 50

        doc
          .moveTo(summaryX, yPosition)
          .lineTo(545, yPosition)
          .stroke()
          .moveDown(0.5)

        yPosition += 15

        // Calculate total from ledger
        const ledgerTotal = billing.ledger.reduce((sum, entry) => sum + entry.amount, 0)

        doc
          .fontSize(10)
          .font('Helvetica')
          .text('Subtotal:', summaryX, yPosition)
          .text(`${billing.amount.toFixed(2)} ${billing.currency.toUpperCase()}`, summaryX + 150, yPosition, {
            align: 'right',
            width: 90,
          })
          .moveDown(0.3)

        yPosition += 20
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .text('Total Amount:', summaryX, yPosition)
          .text(
            `${billing.amount.toFixed(2)} ${billing.currency.toUpperCase()}`,
            summaryX + 150,
            yPosition,
            {
              align: 'right',
              width: 90,
            }
          )

        yPosition += 30

        // Status Badge
        const statusColors: Record<string, string> = {
          paid: '#10b981',
          pending: '#f59e0b',
          refunded: '#3b82f6',
          failed: '#ef4444',
          void: '#6b7280',
          archived: '#9ca3af',
        }

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Payment Status:', summaryX, yPosition)
          .fillColor(statusColors[billing.status] || '#000')
          .text(billing.status.toUpperCase(), summaryX + 150, yPosition, {
            align: 'right',
            width: 90,
          })
          .fillColor('#000')

        // Footer
        doc
          .fontSize(8)
          .font('Helvetica')
          .text(
            'Thank you for choosing Elite Hotel. For inquiries, please contact our billing department.',
            50,
            700,
            { align: 'center', width: 500 }
          )
          .moveDown(0.3)
          .text(`Payment ID: ${billing.paymentId}`, { align: 'center' })
          .text('This is a computer-generated invoice and does not require a signature.', {
            align: 'center',
          })

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }
}
