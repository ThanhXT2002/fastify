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
          .send(ApiResponse.error('User already exists', 'User already exists, registration failed', StatusCodes.CONFLICT))
      }
      return reply.code(StatusCodes.BAD_REQUEST).send(ApiResponse.error(result.error, 'Registration failed'))
    }
    return reply.code(StatusCodes.OK).send(ApiResponse.ok(result, 'Registration successful', StatusCodes.OK))
  }
}
