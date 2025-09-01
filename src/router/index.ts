import { FastifyInstance } from 'fastify'
import authRouter from '~/module/auth/authRouter'
import userRouter from '~/module/user/userRouter'

export async function indexRoutes(fastify: FastifyInstance) {
  await fastify.register(
    async (instance) => {
      await instance.register(authRouter, { prefix: '/auth' })
      await instance.register(userRouter, { prefix: '/' })
    },
    { prefix: '/api' }
  )
}
