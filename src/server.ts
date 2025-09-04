import Fastify from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { registerSwagger } from './config/swagger'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import 'dotenv/config'
import { indexRoutes } from './router/index'

const fastify = Fastify().withTypeProvider<ZodTypeProvider>()

async function main() {
  // Enable CORS early so preflight requests are handled and responses include
  // Access-Control-Allow-* headers. Configure origin via env var `CORS_ORIGIN`.
  await fastify.register(cors, {
  // WARNING: Allow all origins (only for local testing). Remove or change for production.
  origin: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true
})
  // Register multipart for file uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: 500 * 1024 * 1024 // 500MB max file size
    }
  })

  await registerSwagger(fastify)

  // register all application routes (router/index.ts handles prefixing)
  await indexRoutes(fastify)

  await fastify.listen({ port: 3175 })
  console.log(`Server listening`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
