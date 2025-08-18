// src/controllers/implementation/user.controller.ts
import { NextFunction, Request, Response } from 'express'
import { IUserController } from '../interface/IUser.controller'
import { IUserService } from '../../services/interface/IUser.service'
import { successResponse } from '../../utils/response.handler'
import { HttpStatus } from '../../enums/http.status'

export class UserController implements IUserController {
  private userService: IUserService
  constructor(userService: IUserService) {
    this.userService = userService
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.getById(req.params.id)
      if (!user)
        return successResponse(res, HttpStatus.NOT_FOUND, 'User not found')
      return successResponse(res, HttpStatus.OK, 'User fetched', { data: user })
    } catch (err) {
      next(err)
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const q = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        search: req.query.search as string | undefined,
        role: req.query.role as string | undefined,
      }
      const result = await this.userService.list(q)
      return successResponse(res, HttpStatus.OK, 'Users fetched', result)
    } catch (err) {
      next(err)
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userService.update(req.params.id, req.body)
      return successResponse(res, HttpStatus.OK, 'User updated', {
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }

  async patch(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userService.patch(req.params.id, req.body)
      return successResponse(res, HttpStatus.OK, 'User patched', {
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await this.userService.delete(req.params.id)
      return successResponse(res, HttpStatus.NO_CONTENT, 'User deleted')
    } catch (err) {
      next(err)
    }
  }

  async updateAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const file = (req as any).file as Express.Multer.File | undefined
      const uploaded = await this.userService.updateAvatar(req.params.id, file!)
      return successResponse(res, HttpStatus.OK, 'Avatar updated', {
        data: uploaded,
      })
    } catch (err) {
      next(err)
    }
  }

  async removeAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      await this.userService.removeAvatar(req.params.id)
      return successResponse(res, HttpStatus.OK, 'Avatar removed')
    } catch (err) {
      next(err)
    }
  }
}
