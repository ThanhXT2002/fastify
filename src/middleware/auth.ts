import { FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from '~/config/supabaseClient'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      email: string
      [key: string]: any
    }
  }
}

export async function verifyToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({
        status: false,
        code: 401,
        errors: 'Missing or invalid authorization header',
        message: 'Unauthorized',
        timestamp: new Date().toISOString()
      })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify token với Supabase
    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return reply.code(401).send({
        status: false,
        code: 401,
        errors: 'Invalid or expired token',
        message: 'Unauthorized',
        timestamp: new Date().toISOString()
      })
    }

    // Attach user info to request
    request.user = {
      id: user.id,
      email: user.email || '',
      ...user.user_metadata
    }
  } catch (error) {
    return reply.code(401).send({
      status: false,
      code: 401,
      errors: 'Token verification failed',
      message: 'Unauthorized',
      timestamp: new Date().toISOString()
    })
  }
}

// Alias for compatibility
export const authenticateJWT = verifyToken
