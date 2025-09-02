import Fastify from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { registerSwagger } from './config/swagger.js'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import 'dotenv/config'

const fastify = Fastify().withTypeProvider<ZodTypeProvider>()

// Enable CORS early so preflight requests are handled and responses include
// Access-Control-Allow-* headers. Configure origin via env var `CORS_ORIGIN`.
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5175',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true
})

// Register multipart for file uploads
await fastify.register(multipart, {
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max file size
  }
})

await registerSwagger(fastify)

import { indexRoutes } from './router/index.js'

// register all application routes (router/index.ts handles prefixing)
await indexRoutes(fastify)

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err
  console.log(`Server listening at ${address}`)
})
