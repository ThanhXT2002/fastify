import Fastify from 'fastify'
import { registerSwagger } from './config/swagger.js'

const fastify = Fastify()

await registerSwagger(fastify)

import { registerRoutes } from './router/index.js'

await registerRoutes(fastify)

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err
  console.log(`Server listening at ${address}`)
})
