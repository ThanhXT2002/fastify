import { AuthService } from './authService.js'
import { ApiResponse } from '../../base/api-reponse.js'
import { FastifyRequest, FastifyReply } from 'fastify'
import { registerSchema } from '~/schema/authSchema'
import { StatusCodes } from 'http-status-codes'

export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = registerSchema.safeParse(request.body)
    if (!parseResult.success) {
      return reply
        .code(StatusCodes.BAD_REQUEST)
        .send(ApiResponse.error(parseResult.error.issues, 'Invalid request data'))
    }
    const { email, password, name } = parseResult.data
    const result = await this.authService.register(email, password, name)
    if (result.error) {
      // Unique constraint -> conflict
      if (result.error.code === 'P2002') {
        return reply
          .code(StatusCodes.CONFLICT)
          .send(
            ApiResponse.error('User already exists', 'User already exists, registration failed', StatusCodes.CONFLICT)
          )
      }
      return reply.code(StatusCodes.BAD_REQUEST).send(ApiResponse.error(result.error, 'Registration failed'))
    }
    return reply.code(StatusCodes.OK).send(ApiResponse.ok(result, 'Registration successful', StatusCodes.OK))
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id

      if (!userId) {
        return reply.code(StatusCodes.UNAUTHORIZED).send(ApiResponse.error('User not found in request', 'Unauthorized'))
      }

      const result = await this.authService.getUserProfile(userId)
      if (result.error) {
        return reply.code(StatusCodes.NOT_FOUND).send(ApiResponse.error(result.error, 'User not found'))
      }

      return reply.code(StatusCodes.OK).send(ApiResponse.ok(result.data, 'Profile retrieved successfully'))
    } catch (error: any) {
      return reply
        .code(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ApiResponse.error(error.message, 'Failed to get profile'))
    }
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id

      if (!userId) {
        return reply.code(StatusCodes.UNAUTHORIZED).send(ApiResponse.error('User not found in request', 'Unauthorized'))
      }

      const updateData = request.body as { name?: string }
      const result = await this.authService.updateUserProfile(userId, updateData)

      if (result.error) {
        return reply.code(StatusCodes.BAD_REQUEST).send(ApiResponse.error(result.error, 'Failed to update profile'))
      }

      return reply.code(StatusCodes.OK).send(ApiResponse.ok(result.data, 'Profile updated successfully'))
    } catch (error: any) {
      return reply
        .code(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ApiResponse.error(error.message, 'Failed to update profile'))
    }
  }
}
