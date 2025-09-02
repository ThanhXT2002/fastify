import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '../../generated/prisma'

const prisma = new PrismaClient()

declare module 'fastify' {
  interface FastifyRequest {
    apiUser?: {
      id: string
      email: string
      name?: string
      key: string
      active: boolean
    }
  }
}

export async function authenticateApiKey(request: FastifyRequest, reply: FastifyReply) {
  try {
    const apiKey = request.headers['x-api-key'] as string

    if (!apiKey) {
      return reply.code(401).send({
        status: false,
        code: 401,
        errors: 'Missing X-API-Key header',
        message: 'API key required',
        timestamp: new Date().toISOString()
      })
    }

    // Tìm user dựa trên API key
    const user = await prisma.user.findUnique({
      where: { key: apiKey },
      select: {
        id: true,
        email: true,
        name: true,
        key: true,
        active: true
      }
    })

    if (!user) {
      return reply.code(401).send({
        status: false,
        code: 401,
        errors: 'Invalid API key',
        message: 'API key not found',
        timestamp: new Date().toISOString()
      })
    }

    if (!user.active) {
      return reply.code(403).send({
        status: false,
        code: 403,
        errors: 'Account is inactive',
        message: 'Your account has been deactivated. Please contact administrator.',
        timestamp: new Date().toISOString()
      })
    }

    // Attach user info to request
    request.apiUser = {
      ...user,
      name: user.name || undefined
    }
  } catch (error: any) {
    return reply.code(500).send({
      status: false,
      code: 500,
      errors: 'Failed to authenticate API key',
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    })
  }
}
