import { Request, Response, NextFunction } from 'express';

/**
 * Payment Analytics Controller
 * Provides payment metrics for dashboards
 */
export class PaymentAnalyticsController {
  private paymentModel: any;

  constructor(paymentModel: any) {
    this.paymentModel = paymentModel;
  }

  /**
   * GET /analytics/revenue
   * Returns revenue metrics for admin dashboard
   */
  async getRevenueMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const now = new Date();
      
      // Time periods
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // Get all payments
      const allPayments = await this.paymentModel.find({}).lean();

      // Filter by status and time
      const succeededPayments = allPayments.filter((p: any) => p.status === 'succeeded');
      const refundedPayments = allPayments.filter((p: any) => p.status === 'refunded');

      const calculateTotal = (payments: any[], fromDate: Date) => {
        return payments
          .filter((p: any) => new Date(p.createdAt) >= fromDate)
          .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      };

      const totalRevenue = succeededPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      const refundedAmount = refundedPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      const pendingPayments = allPayments.filter((p: any) => p.status === 'initiated');

      const averageTransactionValue = succeededPayments.length > 0
        ? totalRevenue / succeededPayments.length
        : 0;

      res.json({
        success: true,
        data: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          pendingPayments: pendingPayments.length,
          pendingAmount: pendingPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
          refundedAmount: Math.round(refundedAmount * 100) / 100,
          averageTransactionValue: Math.round(averageTransactionValue * 100) / 100,
          revenueByPeriod: {
            today: calculateTotal(succeededPayments, startOfToday),
            week: calculateTotal(succeededPayments, startOfWeek),
            month: calculateTotal(succeededPayments, startOfMonth),
            year: calculateTotal(succeededPayments, startOfYear)
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /analytics/pending
   * Returns pending payments for receptionist dashboard
   */
  async getPendingPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pendingPayments = await this.paymentModel.find({
        status: 'initiated'
      }).populate('reservationId').populate('guestId').lean();

      const formattedPayments = pendingPayments.map((p: any) => ({
        reservationId: p.reservationId?._id || p.reservationId,
        guestName: p.guestId?.fullName || p.guestContact?.email || 'Guest',
        amount: p.amount,
        currency: p.currency,
        dueDate: p.createdAt // Or could be from reservation checkout date
      }));

      res.json({
        success: true,
        data: {
          count: pendingPayments.length,
          totalAmount: pendingPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
          reservations: formattedPayments
        }
      });
    } catch (err) {
      next(err);
    }
  }
}
