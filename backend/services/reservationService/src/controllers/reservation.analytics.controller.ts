import { Request, Response, NextFunction } from 'express';

/**
 * Reservation Analytics Controller
 * Provides aggregated metrics for dashboards
 */
export class ReservationAnalyticsController {
  private reservationModel: any;

  constructor(reservationModel: any) {
    this.reservationModel = reservationModel;
  }

  /**
 * GET /analytics/occupancy
   * Returns occupancy metrics for admin dashboard
   */
  async getOccupancyMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get all reservations
      const allReservations = await this.reservationModel.find({});
      
      // Calculate current occupancy (checked-in guests)
      const checkedInReservations = allReservations.filter(
        (r: any) => r.status === 'CheckedIn'
      );

      //Get bookings by status
      const bookingsByStatus = {
        confirmed: allReservations.filter((r: any) => r.status === 'Confirmed').length,
        checkedIn: checkedInReservations.length,
        checkedOut: allReservations.filter((r: any) => r.status === 'CheckedOut').length,
        cancelled: allReservations.filter((r: any) => r.status === 'Cancelled').length,
        pendingPayment: allReservations.filter((r: any) => r.status === 'PendingPayment').length,
      };

      // Calculate upcoming check-ins and check-outs (today)
      const upcomingCheckIns = allReservations.filter((r: any) => {
        const checkIn = new Date(r.checkIn);
        return checkIn >= today && checkIn < tomorrow && r.status === 'Confirmed';
      }).length;

      const upcomingCheckOuts = allReservations.filter((r: any) => {
        const checkOut = new Date(r.checkOut);
        return checkOut >= today && checkOut < tomorrow && r.status === 'CheckedIn';
      }).length;

      // Mock occupancy trend (would need historical data in production)
      const occupancyTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        occupancyTrend.push({
          date: date.toISOString().split('T')[0],
          percentage: Math.floor(Math.random() * 30) + 60 // Mock data: 60-90%
        });
      }

      res.json({
        success: true,
        data: {
          currentOccupancy: 0, // Will be calculated with room count
          totalRooms: 0, // Needs to be fetched from room service
          occupiedRooms: checkedInReservations.length,
          availableRooms: 0, // Calculated: totalRooms - occupiedRooms
          maintenanceRooms: 0, // From room service
          occupancyTrend,
          bookingsByStatus,
          upcomingCheckIns,
          upcomingCheckOuts
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /analytics/today-activity
   * Returns today's check-ins and check-outs for receptionist
   */
  async getTodayActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Check-ins scheduled for today
      const checkInsScheduled = await this.reservationModel.find({
        checkIn: { $gte: today, $lt: tomorrow },
        status: { $in: ['Confirmed', 'PendingPayment'] }
      }).populate('roomId').populate('guestId').lean();

      // Check-outs scheduled for today
      const checkOutsScheduled = await this.reservationModel.find({
        checkOut: { $gte: today, $lt: tomorrow },
        status: 'CheckedIn'
      }).populate('roomId').populate('guestId').lean();

      // Format the data
      const formatReservations = (reservations: any[]) => {
        return reservations.map((r: any) => ({
          _id: r._id,
          code: r.code,
          guestName: r.guestId?.fullName || r.guestContact?.email || 'Guest',
          guestContact: {
            email: r.guestContact?.email || r.guestId?.email || '',
            phone: r.guestContact?.phone || r.guestId?.phoneNumber || ''
          },
          roomNumber: r.roomId?.number || 'TBD',
          roomType: r.roomId?.type || 'Standard',
          checkInTime: r.checkIn,
          checkOutTime: r.checkOut,
          status: r.status,
          totalAmount: r.totalAmount || 0
        }));
      };

      res.json({
        success: true,
        data: {
          checkInsScheduled: {
            count: checkInsScheduled.length,
            reservations: formatReservations(checkInsScheduled)
          },
          checkOutsScheduled: {
            count: checkOutsScheduled.length,
            reservations: formatReservations(checkOutsScheduled)
          },
          lateCheckOuts: 0, // Would need additional logic
          earlyCheckIns: 0
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /analytics/room-context
   * Returns room context for housekeeper dashboard
   */
  async getRoomContext(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get all active reservations
      const activeReservations = await this.reservationModel.find({
        status: { $in: ['Confirmed', 'CheckedIn'] }
      }).lean();

      const roomContext: Record<string, any> = {};

      activeReservations.forEach((r: any) => {
        const checkIn = new Date(r.checkIn);
        const checkOut = new Date(r.checkOut);
        const roomId = r.roomId?._id || r.roomId;

        if (roomId) {
          roomContext[roomId.toString()] = {
            hasGuestCheckingInToday: checkIn >= today && checkIn < tomorrow,
            checkInTime: checkIn >= today && checkIn < tomorrow ? r.checkIn: null,
            hasGuestCheckingOutToday: checkOut >= today && checkOut < tomorrow,
            isCurrentlyOccupied: r.status === 'CheckedIn',
            guestPreferences: r.guestId?.preferences || []
          };
        }
      });

      res.json({
        success: true,
        data: roomContext
      });
    } catch (err) {
      next(err);
    }
  }
}
