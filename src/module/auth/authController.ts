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
        .send(ApiResponse.error(parseResult.error.issues, 'Dữ liệu không hợp lệ'))
    }
    const { email, password, name } = parseResult.data
    const result = await this.authService.register(email, password, name)
    if (result.error) {
      return reply.code(StatusCodes.BAD_REQUEST).send(ApiResponse.error(result.error, 'Đăng ký thất bại'))
    }
    return reply.code(StatusCodes.OK).send(ApiResponse.ok(result, 'Đăng ký thành công', StatusCodes.OK))
  }
}
