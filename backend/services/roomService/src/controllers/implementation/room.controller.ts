import { NextFunction, Request, Response } from 'express'
import { IRoomController } from '../interface/IRoom.controller'
import { IRoomService } from '../../services/interface/IRoom.service'
import { successResponse } from '../../utils/response.handler'
import { HttpStatus } from '../../enums/http.status'
import CustomError from '../../utils/CustomError'

export class RoomController implements IRoomController {
  private roomService: IRoomService
  constructor(roomService: IRoomService) {
    this.roomService = roomService
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.roomService.createRoom(req.body)
      return successResponse(res, HttpStatus.CREATED, 'Room created', {
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id

      if (!id) {
        throw new CustomError('Room ID is required', HttpStatus.BAD_REQUEST)
      }
      const room = await this.roomService.getRoomById(id)
      if (!room) {
        throw new CustomError('Room not found', HttpStatus.NOT_FOUND)
      }
      return successResponse(res, HttpStatus.OK, 'Room fetched', { data: room })
    } catch (err) {
      next(err)
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      // normalize query types
      const q = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        type: req.query.type as string | undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        available:
          req.query.available != null
            ? req.query.available === 'true'
            : undefined,
        sortBy: (req.query.sortBy as any) || undefined,
        sortOrder: (req.query.sortOrder as any) || undefined,
        search: (req.query.search as string) || undefined,
      }
      const result = await this.roomService.listRooms(q)
      return successResponse(res, HttpStatus.OK, 'Rooms fetched', result)
    } catch (err) {
      next(err)
    }
  }

  async patch(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id
      if (!id) {
        throw new CustomError('Room ID is required', HttpStatus.BAD_REQUEST)
      }
      const result = await this.roomService.patchRoom(id, req.body)
      return successResponse(res, HttpStatus.OK, 'Room patched', {
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id
      await this.roomService.deleteRoom(id)
      return successResponse(res, HttpStatus.OK, 'Room deleted')
    } catch (err) {
      next(err)
    }
  }
}
