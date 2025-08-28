

import { FastifyInstance } from 'fastify'
import authRouter from '~/module/auth/authRouter'

export async function indexRoutes(fastify: FastifyInstance) {
  await fastify.register(async (instance) => {
    await instance.register(authRouter, { prefix: '/auth' })
   
  }, { prefix: '/api' })
}
