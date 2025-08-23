import { IMediaService, IUploadResult } from '../interface/IMedia.service'
import cloudinary from '../../config/cloudinary.config'
import streamifier from 'streamifier'

export class MediaService implements IMediaService {
  uploadImage(
    buffer: Buffer,
    filename?: string,
    folder: string = process.env.CLOUDINARY_FOLDER || 'hotel/rooms'
  ): Promise<IUploadResult> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          use_filename: !!filename,
          unique_filename: true,
          resource_type: 'image',
          overwrite: false,
        },
        (error, result) => {
          if (error || !result) return reject(error)
          resolve({ publicId: result.public_id, url: result.secure_url })
        }
      )
      streamifier.createReadStream(buffer).pipe(upload)
    })
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
  }
}
