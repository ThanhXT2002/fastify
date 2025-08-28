import { AuthController } from './authController.js'
import { FastifyInstance } from 'fastify'

export default async function authRouter(fastify: FastifyInstance) {
  fastify.post(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 }
          },
          required: ['email', 'password']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'boolean' },
              code: { type: 'integer' },
              data: { type: 'object' },
              message: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        },
        tags: ['Auth'],
        summary: 'Register new user'
      }
    },
    new AuthController().register.bind(new AuthController())
  )
}
