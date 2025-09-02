import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { FastifyInstance } from 'fastify'

export async function registerSwagger(fastify: FastifyInstance) {
  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'Fastify API',
        description: 'API documentation',
        version: '1.0.0'
      },
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'authorization',
          in: 'header',
          description: 'Enter Bearer token (format: Bearer <token>)'
        }
      }
    }
  })

  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    }
  })
}
