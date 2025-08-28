import Fastify from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { registerSwagger } from './config/swagger.js'
import 'dotenv/config'

const fastify = Fastify().withTypeProvider<ZodTypeProvider>()

await registerSwagger(fastify)

import { indexRoutes } from './router/index.js'

// register all application routes (router/index.ts handles prefixing)
await indexRoutes(fastify)

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err
  console.log(`Server listening at ${address}`)
})
