import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '~/config/prisma'

// Extend FastifyRequest to include user role
declare module 'fastify' {
  interface FastifyRequest {
    userRole?: string
  }
}

// Get user role from database and attach to request
export async function getUserRole(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.user?.id) {
      return reply.code(401).send({
        status: false,
        code: 401,
        errors: 'User not authenticated',
        message: 'Unauthorized',
        timestamp: new Date().toISOString()
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: { role: true, active: true }
    })

    if (!user || !user.active) {
      return reply.code(401).send({
        status: false,
        code: 401,
        errors: 'User not found or inactive',
        message: 'Unauthorized',
        timestamp: new Date().toISOString()
      })
    }

    request.userRole = user.role
  } catch (error) {
    return reply.code(500).send({
      status: false,
      code: 500,
      errors: 'Failed to get user role',
      message: 'Internal Server Error',
      timestamp: new Date().toISOString()
    })
  }
}

// Require specific role(s)
export function requireRole(allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // First get user role
    await getUserRole(request, reply)
    
    if (!request.userRole || !allowedRoles.includes(request.userRole)) {
      return reply.code(403).send({
        status: false,
        code: 403,
        errors: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        message: 'Forbidden',
        timestamp: new Date().toISOString()
      })
    }
  }
}

// Check if user is admin
export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  await getUserRole(request, reply)
  
  if (request.userRole !== 'ADMIN') {
    return reply.code(403).send({
      status: false,
      code: 403,
      errors: 'Admin access required',
      message: 'Forbidden',
      timestamp: new Date().toISOString()
    })
  }
}

// Check if user is admin or editor
export async function requireEditor(request: FastifyRequest, reply: FastifyReply) {
  await getUserRole(request, reply)
  
  if (!['ADMIN', 'EDITOR'].includes(request.userRole || '')) {
    return reply.code(403).send({
      status: false,
      code: 403,
      errors: 'Editor or Admin access required',
      message: 'Forbidden',
      timestamp: new Date().toISOString()
    })
  }
}
