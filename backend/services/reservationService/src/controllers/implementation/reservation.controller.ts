// src/controllers/implementation/reservation.controller.ts
import { NextFunction, Request, Response } from 'express'
import { IReservationController } from '../interface/IReservation.controller'
import { IReservationService } from '../../services/interface/IReservation.service'
import { successResponse } from '../../utils/response.handler'
import { HttpStatus } from '../../enums/http.status'
import { CustomeRequest } from '../../interfaces/CustomRequest'

export class ReservationController implements IReservationController {
  private svc: IReservationService
  constructor(svc: IReservationService) {
    this.svc = svc
  }

  async quote(req: CustomeRequest, res: Response, next: NextFunction) {
    try {
      const { roomId, checkIn, checkOut, currency, promoCode } = req.body
      const result = await this.svc.quote({
        roomId,
        checkIn,
        checkOut,
        currency,
        promoCode,
      })
      return successResponse(res, HttpStatus.OK, 'Quote calculated', {
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }

  async create(req: CustomeRequest, res: Response, next: NextFunction) {
    try {
      const createdBy = (req.user as any)?.id
      const jwtToken = (req.headers.authorization || '').replace('Bearer ', '')

      const result = await this.svc.create(req.body, createdBy, jwtToken)
      return successResponse(res, HttpStatus.CREATED, 'Reservation created', {
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }

  // For guest (online) bookings
  async createPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.svc.createPublic(req.body)
      return successResponse(res, HttpStatus.CREATED, 'Reservation created', {
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await this.svc.getById(req.params.id)
      if (!r)
        return successResponse(
          res,
          HttpStatus.NOT_FOUND,
          'Reservation not found'
        )
      return successResponse(res, HttpStatus.OK, 'Reservation fetched', {
        data: r,
      })
    } catch (err) {
      next(err)
    }
  }

  async getByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await this.svc.getByCode(req.params.code)
      if (!r)
        return successResponse(
          res,
          HttpStatus.NOT_FOUND,
          'Reservation not found'
        )
      return successResponse(res, HttpStatus.OK, 'Reservation fetched', {
        data: r,
      })
    } catch (err) {
      next(err)
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.svc.list({
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        status: (req.query.status as string) || undefined,
        guestId: (req.query.guestId as string) || undefined,
        roomId: (req.query.roomId as string) || undefined,
        dateFrom: req.query.dateFrom
          ? new Date(req.query.dateFrom as string)
          : undefined,
        dateTo: req.query.dateTo
          ? new Date(req.query.dateTo as string)
          : undefined,
        search: (req.query.search as string) || undefined,
        sort: req.query.sort ? JSON.parse(req.query.sort as string) : undefined,
      })
      return successResponse(res, HttpStatus.OK, 'Reservations fetched', result)
    } catch (err) {
      next(err)
    }
  }

  async patch(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await this.svc.patch(req.params.id, req.body)
      return successResponse(res, HttpStatus.OK, 'Reservation patched', {
        data: r,
      })
    } catch (err) {
      next(err)
    }
  }

  async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await this.svc.confirm(req.params.id)
      return successResponse(res, HttpStatus.OK, 'Reservation confirmed', {
        data: r,
      })
    } catch (err) {
      next(err)
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await this.svc.cancel(req.params.id, req.body?.reason)
      return successResponse(res, HttpStatus.OK, 'Reservation cancelled', {
        data: r,
      })
    } catch (err) {
      next(err)
    }
  }

  async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await this.svc.checkIn(req.params.id)
      return successResponse(res, HttpStatus.OK, 'Checked in', { data: r })
    } catch (err) {
      next(err)
    }
  }

  async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await this.svc.checkOut(req.params.id)
      return successResponse(res, HttpStatus.OK, 'Checked out', { data: r })
    } catch (err) {
      next(err)
    }
  }
}
