import { AuthController } from './authController.js'
import { FastifyInstance } from 'fastify'
import { registerSchema } from '~/schema/authSchema'

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
              success: { type: 'boolean' },
              data: { type: 'object' },
              message: { type: 'string' }
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
