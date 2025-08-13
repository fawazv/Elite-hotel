import { Request, Response, NextFunction } from 'express'
import { IRoomController } from '../interface/IRoom.controller'
import { IRoomService } from '../../services/interface/IRoom.service'
import { successResponse } from '../../utils/response.handler'
import { HttpStatus } from '../../enums/http.status'

export class RoomController implements IRoomController {
  private roomService: IRoomService

  constructor(roomService: IRoomService) {
    this.roomService = roomService
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body
      const created = await this.roomService.createRoom(payload)
      return successResponse(res, HttpStatus.CREATED, 'Room created', {
        data: created,
      })
    } catch (err) {
      next(err)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const room = await this.roomService.getRoomById(id)
      return successResponse(res, HttpStatus.OK, 'Room fetched', { data: room })
    } catch (err) {
      next(err)
    }
  }

  async getByNumericId(req: Request, res: Response, next: NextFunction) {
    try {
      const nid = Number(req.params.nid)
      const room = await this.roomService.getByNumericId(nid)
      return successResponse(res, HttpStatus.OK, 'Room fetched', { data: room })
    } catch (err) {
      next(err)
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const updated = await this.roomService.updateRoom(id, req.body)
      return successResponse(res, HttpStatus.OK, 'Room updated', {
        data: updated,
      })
    } catch (err) {
      next(err)
    }
  }

  async patch(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const patched = await this.roomService.patchRoom(id, req.body)
      return successResponse(res, HttpStatus.OK, 'Room patched', {
        data: patched,
      })
    } catch (err) {
      next(err)
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      await this.roomService.deleteRoom(id)
      return res.status(HttpStatus.NO_CONTENT).send()
    } catch (err) {
      next(err)
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, minPrice, maxPrice, available, q, page, limit } = req.query
      const filters = {
        type: type as string | undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        available:
          typeof available !== 'undefined' ? available === 'true' : undefined,
        q: q as string | undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      }
      const result = await this.roomService.listRooms(filters)
      return successResponse(res, HttpStatus.OK, 'Rooms listed', result)
    } catch (err) {
      next(err)
    }
  }
}
