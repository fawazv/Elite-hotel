// src/config/container.ts
// add these imports at top
import { UserRepository } from '../repositories/implementation/user.repository'
import { UserService } from '../services/implementation/user.service'
import { UserController } from '../controllers/implementation/user.controller'
import { MediaService } from '../services/implementation/media.service' // already exist in your repo
import { User } from '../models/user.model'

// repositories
const userRepository = new UserRepository(User)

// services
const mediaService = new MediaService()
const userService = new UserService(userRepository, mediaService)

// controllers
const userController = new UserController(userService)

export { userRepository, userService, userController, mediaService }
