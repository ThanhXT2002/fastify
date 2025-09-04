import { AuthController } from './authController'
import { FastifyInstance } from 'fastify'
import { verifyToken } from '~/middleware/auth'

const authController = new AuthController()

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
    authController.register.bind(authController)
  )

  fastify.get(
    '/profile',
    {
      preHandler: [verifyToken],
      schema: {
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'boolean' },
              code: { type: 'integer' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  key: { type: 'string' },
                  role: { type: 'string' },
                  avatarUrl: { type: 'string' },
                  createdAt: { type: 'string' }
                }
              },
              message: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        },
        tags: ['Auth'],
        summary: 'Get user profile'
      }
    },
    authController.getProfile.bind(authController)
  )

  fastify.put(
    '/profile',
    {
      preHandler: [verifyToken],
      schema: {
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'boolean' },
              code: { type: 'integer' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' },
                  key: { type: 'string' },
                  avatarUrl: { type: 'string' },
                  createdAt: { type: 'string' }
                }
              },
              message: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        },
        tags: ['Auth'],
        summary: 'Update user profile'
      }
    },
    authController.updateProfile.bind(authController)
  )

  fastify.get(
    '/api-key',
    {
      preHandler: [verifyToken],
      schema: {
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'boolean' },
              code: { type: 'integer' },
              data: {
                type: 'object',
                properties: {
                  key: { type: 'string' }
                }
              },
              message: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        },
        tags: ['Auth'],
        summary: 'Get user API key'
      }
    },
    authController.getApiKey.bind(authController)
  )
}
