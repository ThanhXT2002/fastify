import { FastifyInstance } from 'fastify'

export async function registerRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/ping',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              pong: { type: 'string' }
            }
          }
        }
      }
    },
    async () => {
      return { pong: 'it works!' }
    }
  )
}
