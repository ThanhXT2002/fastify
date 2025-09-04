import { FastifyInstance } from 'fastify'
import { UserController } from './userController'
import { authenticateJWT } from '~/middleware/auth'
import { requireRole } from '~/middleware/permissions'

export default async function userRouter(fastify: FastifyInstance) {
  const userController = new UserController()

  // All user routes require authentication
  fastify.addHook('preHandler', authenticateJWT)

  // Get all users (admin only)
  fastify.get('/users', {
    preHandler: [requireRole(['ADMIN'])],
    schema: {
      tags: ['User'],
      summary: 'Get all users',
      description: 'Retrieve all users with statistics (admin only)',
      headers: {
        type: 'object',
        properties: {
          authorization: { type: 'string' }
        },
        required: ['authorization']
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
                users: { type: 'array' },
                statistics: { type: 'object' }
              }
            },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    handler: userController.getAllUsers
  })

  // Get user statistics (admin only) - Must be before /users/:id
  fastify.get('/users/statistics', {
    preHandler: [requireRole(['ADMIN'])],
    schema: {
      tags: ['User'],
      summary: 'Get user statistics',
      description: 'Get comprehensive user statistics (admin only)',
      headers: {
        type: 'object',
        properties: {
          authorization: { type: 'string' }
        },
        required: ['authorization']
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
      }
    },
    handler: userController.getUserStatistics
  })

  // Search users - Must be before /users/:id
  fastify.get('/users/search', {
    schema: {
      tags: ['User'],
      summary: 'Search users',
      description: 'Search users by name or email',
      headers: {
        type: 'object',
        properties: {
          authorization: { type: 'string' }
        },
        required: ['authorization']
      },
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 2 }
        },
        required: ['q']
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
                users: { type: 'array' },
                count: { type: 'integer' },
                query: { type: 'string' }
              }
            },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    handler: userController.searchUsers
  })

  // Get users by role (admin only) - Must be before /users/:id
  fastify.get('/users/role/:role', {
    preHandler: [requireRole(['ADMIN'])],
    schema: {
      tags: ['User'],
      summary: 'Get users by role',
      description: 'Retrieve users filtered by role (admin only)',
      headers: {
        type: 'object',
        properties: {
          authorization: { type: 'string' }
        },
        required: ['authorization']
      },
      params: {
        type: 'object',
        properties: {
          role: { type: 'string' }
        },
        required: ['role']
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
                users: { type: 'array' },
                count: { type: 'integer' },
                role: { type: 'string' }
              }
            },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    handler: userController.getUsersByRole
  })

  // Get user by ID
  fastify.get('/users/:id', {
    schema: {
      tags: ['User'],
      summary: 'Get user by ID',
      description: 'Retrieve a specific user by their ID',
      headers: {
        type: 'object',
        properties: {
          authorization: { type: 'string' }
        },
        required: ['authorization']
      },
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
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
                active: { type: 'boolean' },
                createdAt: { type: 'string' }
              }
            },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    handler: userController.getUserById
  })

  // Update user (admin only)
  fastify.put('/users/:id', {
    preHandler: [requireRole(['ADMIN'])],
    schema: {
      tags: ['User'],
      summary: 'Update user',
      description: 'Update user information (admin only)',
      headers: {
        type: 'object',
        properties: {
          authorization: { type: 'string' }
        },
        required: ['authorization']
      },
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          role: { type: 'string' },
          active: { type: 'boolean' }
        }
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
      }
    },
    handler: userController.updateUser
  })

  // Deactivate user (admin only)
  fastify.put('/users/:id/deactivate', {
    preHandler: [requireRole(['ADMIN'])],
    schema: {
      tags: ['User'],
      summary: 'Deactivate user',
      description: 'Deactivate (soft delete) a user (admin only)',
      headers: {
        type: 'object',
        properties: {
          authorization: { type: 'string' }
        },
        required: ['authorization']
      },
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
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
      }
    },
    handler: userController.deactivateUser
  })

  // Activate user (admin only)
  fastify.put('/users/:id/activate', {
    preHandler: [requireRole(['ADMIN'])],
    schema: {
      tags: ['User'],
      summary: 'Activate user',
      description: 'Activate a deactivated user (admin only)',
      headers: {
        type: 'object',
        properties: {
          authorization: { type: 'string' }
        },
        required: ['authorization']
      },
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
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
      }
    },
    handler: userController.activateUser
  })

  // Delete user permanently (admin only)
  fastify.delete('/users/:id', {
    preHandler: [requireRole(['ADMIN'])],
    schema: {
      tags: ['User'],
      summary: 'Delete user permanently',
      description: 'Permanently delete a user from the system (admin only)',
      headers: {
        type: 'object',
        properties: {
          authorization: { type: 'string' }
        },
        required: ['authorization']
      },
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
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
      }
    },
    handler: userController.deleteUser
  })
}
