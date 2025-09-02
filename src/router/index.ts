import { FastifyInstance } from 'fastify'
import authRouter from '~/module/auth/authRouter'
import userRouter from '~/module/user/userRouter'
import fileRouter from '~/module/file/fileRouter'

export async function indexRoutes(fastify: FastifyInstance) {
  await fastify.register(
    async (instance) => {
      await instance.register(authRouter, { prefix: '/auth' })
      await instance.register(userRouter, { prefix: '/' })
      await instance.register(fileRouter, { prefix: '/' })
    },
    { prefix: '/api' }
  )
}
