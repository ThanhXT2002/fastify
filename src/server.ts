import Fastify from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { registerSwagger } from './config/swagger.js'
import cors from '@fastify/cors'
import 'dotenv/config'

const fastify = Fastify().withTypeProvider<ZodTypeProvider>()

// Enable CORS early so preflight requests are handled and responses include
// Access-Control-Allow-* headers. Configure origin via env var `CORS_ORIGIN`.
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5175',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
})

await registerSwagger(fastify)

import { indexRoutes } from './router/index.js'

// register all application routes (router/index.ts handles prefixing)
await indexRoutes(fastify)

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err
  console.log(`Server listening at ${address}`)
})
