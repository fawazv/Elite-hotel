// src/controllers/webhook.controller.ts
import { Request, Response } from 'express'
import { PaymentService } from '../../services/implementation/payment.service'
import {
  verifyRazorpaySignature,
  verifyStripeEvent,
} from '../../utils/webhook.util'
import Stripe from 'stripe'

export class WebhookController {
  private svc: PaymentService
  private stripe: Stripe

  constructor(svc: PaymentService) {
    this.svc = svc
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-08-27.basil',
    })
  }

  // Stripe webhook handler
  async handleStripe(req: Request, res: Response) {
    try {
      const sig = req.headers['stripe-signature']
      const event = verifyStripeEvent(
        (req as any).rawBody, // must keep raw body middleware
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || '',
        this.stripe
      )

      switch (event.type) {
        case 'payment_intent.succeeded': {
          const intent = event.data.object as Stripe.PaymentIntent
          const paymentId = intent.metadata?.paymentId
          if (paymentId) {
            await this.svc.updatePaymentStatus(paymentId, 'succeeded', {
              stripeId: intent.id,
            })
          }
          break
        }
        case 'payment_intent.payment_failed': {
          const intent = event.data.object as Stripe.PaymentIntent
          const paymentId = intent.metadata?.paymentId
          if (paymentId) {
            await this.svc.updatePaymentStatus(paymentId, 'failed', {
              stripeId: intent.id,
            })
          }
          break
        }
        case 'charge.refunded': {
          const charge = event.data.object as Stripe.Charge
          const paymentId = charge.metadata?.paymentId
          if (paymentId) {
            await this.svc.updatePaymentStatus(paymentId, 'refunded', {
              stripeChargeId: charge.id,
            })
          }
          break
        }
        default:
          console.log(`Unhandled Stripe event: ${event.type}`)
      }

      res.json({ received: true })
    } catch (err) {
      console.error('Stripe webhook error:', err)
      res.status(400).send(`Webhook Error: ${(err as any).message}`)
    }
  }

  // Razorpay webhook handler
  async handleRazorpay(req: Request, res: Response) {
    try {
      const signature = req.headers['x-razorpay-signature'] as string
      const body = JSON.stringify(req.body)

      const valid = verifyRazorpaySignature(
        body,
        signature,
        process.env.RAZORPAY_WEBHOOK_SECRET || ''
      )
      if (!valid) return res.status(400).send('Invalid signature')

      const evt = req.body
      switch (evt.event) {
        case 'payment.captured': {
          const { payment_id, notes } = evt.payload.payment.entity
          const paymentId = notes?.paymentId
          if (paymentId) {
            await this.svc.updatePaymentStatus(paymentId, 'succeeded', {
              razorpayPaymentId: payment_id,
            })
          }
          break
        }
        case 'payment.failed': {
          const { payment_id, notes } = evt.payload.payment.entity
          const paymentId = notes?.paymentId
          if (paymentId) {
            await this.svc.updatePaymentStatus(paymentId, 'failed', {
              razorpayPaymentId: payment_id,
            })
          }
          break
        }
        case 'refund.processed': {
          const { id, notes } = evt.payload.refund.entity
          const paymentId = notes?.paymentId
          if (paymentId) {
            await this.svc.updatePaymentStatus(paymentId, 'refunded', {
              razorpayRefundId: id,
            })
          }
          break
        }
        default:
          console.log(`Unhandled Razorpay event: ${evt.event}`)
      }

      res.json({ received: true })
    } catch (err) {
      console.error('Razorpay webhook error:', err)
      res.status(400).send(`Webhook Error: ${(err as any).message}`)
    }
  }
}
