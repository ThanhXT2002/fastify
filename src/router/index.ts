

import { FastifyInstance } from 'fastify'
import authRouter from '~/module/auth/authRouter'
import { z } from 'zod'

export async function registerRoutes(fastify: FastifyInstance) {
  await authRouter(fastify)

  // fastify.get(
  //   '/ping',
  //   {
  //     schema: {
  //       response: {
  //         200: z.object({ pong: z.string() })
  //       }
  //     }
  //   },
  //   async () => {
  //     return { pong: 'it works!' }
  //   }
  // )
}
