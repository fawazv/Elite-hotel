// src/services/implementation/user.service.ts
import { IUserService } from '../interface/IUser.service'
import IUser from '../../interfaces/IUser'
import CustomError from '../../utils/CustomError'
import { HttpStatus } from '../../enums/http.status'
import { IMediaService } from '../interface/IMedia.service'
import { UserRepository } from '../../repositories/implementation/user.repository'

export class UserService implements IUserService {
  private userRepo: any // UserRepository (typed looser for compatibility)
  private mediaService: IMediaService

  constructor(userRepo: UserRepository, mediaService: IMediaService) {
    this.userRepo = userRepo
    this.mediaService = mediaService
  }

  async getById(id: string): Promise<IUser | null> {
    const user = await this.userRepo.findByIdLean(id)
    return user
  }

  async list(query: {
    page?: number
    limit?: number
    search?: string
    role?: string
  }) {
    const page = query.page && query.page > 0 ? query.page : 1
    const limit = query.limit && query.limit > 0 ? query.limit : 20
    const skip = (page - 1) * limit

    const filter: any = {}
    if (query.search) {
      filter.$or = [
        { fullName: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { phoneNumber: { $regex: query.search, $options: 'i' } },
      ]
    }
    if (query.role) filter.role = query.role

    const [data, total] = await Promise.all([
      (this.userRepo as any).findAll(filter, {
        skip,
        limit,
        sort: { createdAt: -1 },
        projection: { password: 0 },
      }),
      (this.userRepo as any).count(filter),
    ])
    return { data, total, page, limit }
  }

  async update(id: string, payload: Partial<IUser>): Promise<IUser | null> {
    // Prevent password updates here; password change happens in AuthService
    if ((payload as any).password) delete (payload as any).password
    const updated = await this.userRepo.update(id, payload)
    if (!updated) throw new CustomError('User not found', HttpStatus.NOT_FOUND)
    return updated
  }

  async patch(id: string, payload: Partial<IUser>): Promise<IUser | null> {
    if ((payload as any).password) delete (payload as any).password
    const patched = await this.userRepo.patch(id, payload)
    if (!patched) throw new CustomError('User not found', HttpStatus.NOT_FOUND)
    return patched
  }

  async delete(id: string): Promise<void> {
    const existing = await this.userRepo.findById(id)
    if (!existing) throw new CustomError('User not found', HttpStatus.NOT_FOUND)
    // remove avatar from cloud if exists
    if ((existing as any).avatar?.publicId) {
      await this.mediaService.deleteImage((existing as any).avatar.publicId)
    }
    await this.userRepo.delete(id)
  }

  async updateAvatar(
    id: string,
    file: Express.Multer.File
  ): Promise<{ publicId: string; url: string }> {
    if (!file) throw new CustomError('No file uploaded', HttpStatus.BAD_REQUEST)
    const existing = await this.userRepo.findById(id)
    if (!existing) throw new CustomError('User not found', HttpStatus.NOT_FOUND)

    // delete old avatar if present
    if ((existing as any).avatar?.publicId) {
      await this.mediaService.deleteImage((existing as any).avatar.publicId)
    }

    const uploaded = await this.mediaService.uploadImage(
      file.buffer,
      file.originalname,
      process.env.CLOUDINARY_FOLDER || 'hotel/avatars'
    )
    const updated = await this.userRepo.patch(id, {
      avatar: { publicId: uploaded.publicId, url: uploaded.url },
    })
    if (!updated)
      throw new CustomError(
        'Failed to update avatar',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    return uploaded
  }

  async removeAvatar(id: string): Promise<void> {
    const existing = await this.userRepo.findById(id)
    if (!existing) throw new CustomError('User not found', HttpStatus.NOT_FOUND)
    if ((existing as any).avatar?.publicId) {
      await this.mediaService.deleteImage((existing as any).avatar.publicId)
      await this.userRepo.patch(id, { avatar: null })
    }
  }
}
