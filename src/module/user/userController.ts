import { FastifyRequest, FastifyReply } from 'fastify'
import { UserService } from './userService.js'
import { ApiResponse } from '~/base/api-reponse.js'
import { StatusCodes } from 'http-status-codes'

export class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  // Get all users
  getAllUsers = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await this.userService.getAllUsers()
      reply.status(StatusCodes.OK).send(ApiResponse.ok(result, 'Users retrieved successfully'))
    } catch (error: any) {
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ApiResponse.error(error.message, 'Failed to retrieve users', StatusCodes.INTERNAL_SERVER_ERROR))
    }
  }

  // Get user by ID
  getUserById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      const user = await this.userService.getUserById(id)
      reply.status(StatusCodes.OK).send(ApiResponse.ok(user, 'User retrieved successfully'))
    } catch (error: any) {
      if (error.message === 'User not found') {
        reply.status(StatusCodes.NOT_FOUND).send(ApiResponse.error(error.message, 'User not found', StatusCodes.NOT_FOUND))
      } else {
        reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ApiResponse.error(error.message, 'Failed to retrieve user', StatusCodes.INTERNAL_SERVER_ERROR))
      }
    }
  }

  // Update user
  updateUser = async (request: FastifyRequest<{
    Params: { id: string }
    Body: { name?: string; role?: string; active?: boolean }
  }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      const updateData = request.body
      
      const updatedUser = await this.userService.updateUser(id, updateData)
      reply.status(StatusCodes.OK).send(ApiResponse.ok(updatedUser, 'User updated successfully'))
    } catch (error: any) {
      if (error.message === 'User not found') {
        reply.status(StatusCodes.NOT_FOUND).send(ApiResponse.error(error.message, 'User not found', StatusCodes.NOT_FOUND))
      } else {
        reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ApiResponse.error(error.message, 'Failed to update user', StatusCodes.INTERNAL_SERVER_ERROR))
      }
    }
  }

  // Deactivate user (soft delete)
  deactivateUser = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      const result = await this.userService.deactivateUser(id)
      reply.status(StatusCodes.OK).send(ApiResponse.ok(result, 'User deactivated successfully'))
    } catch (error: any) {
      if (error.message === 'User not found' || error.message === 'User is already inactive') {
        reply.status(StatusCodes.BAD_REQUEST).send(ApiResponse.error(error.message, 'Cannot deactivate user', StatusCodes.BAD_REQUEST))
      } else {
        reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ApiResponse.error(error.message, 'Failed to deactivate user', StatusCodes.INTERNAL_SERVER_ERROR))
      }
    }
  }

  // Activate user
  activateUser = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      const result = await this.userService.activateUser(id)
      reply.status(StatusCodes.OK).send(ApiResponse.ok(result, 'User activated successfully'))
    } catch (error: any) {
      if (error.message === 'User not found' || error.message === 'User is already active') {
        reply.status(StatusCodes.BAD_REQUEST).send(ApiResponse.error(error.message, 'Cannot activate user', StatusCodes.BAD_REQUEST))
      } else {
        reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ApiResponse.error(error.message, 'Failed to activate user', StatusCodes.INTERNAL_SERVER_ERROR))
      }
    }
  }

  // Delete user permanently
  deleteUser = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params
      const result = await this.userService.deleteUser(id)
      reply.status(StatusCodes.OK).send(ApiResponse.ok(result, 'User deleted permanently'))
    } catch (error: any) {
      if (error.message === 'User not found') {
        reply.status(StatusCodes.NOT_FOUND).send(ApiResponse.error(error.message, 'User not found', StatusCodes.NOT_FOUND))
      } else {
        reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ApiResponse.error(error.message, 'Failed to delete user', StatusCodes.INTERNAL_SERVER_ERROR))
      }
    }
  }

  // Search users
  searchUsers = async (request: FastifyRequest<{ Querystring: { q: string } }>, reply: FastifyReply) => {
    try {
      const { q: query } = request.query
      
      if (!query) {
        reply.status(StatusCodes.BAD_REQUEST).send(ApiResponse.error('Missing query parameter', 'Search query is required', StatusCodes.BAD_REQUEST))
        return
      }

      const result = await this.userService.searchUsers(query)
      reply.status(StatusCodes.OK).send(ApiResponse.ok(result, 'Search completed successfully'))
    } catch (error: any) {
      reply.status(StatusCodes.BAD_REQUEST).send(ApiResponse.error(error.message, 'Search failed', StatusCodes.BAD_REQUEST))
    }
  }

  // Get users by role
  getUsersByRole = async (request: FastifyRequest<{ Params: { role: string } }>, reply: FastifyReply) => {
    try {
      const { role } = request.params
      const result = await this.userService.getUsersByRole(role)
      reply.status(StatusCodes.OK).send(ApiResponse.ok(result, `Users with role ${role} retrieved successfully`))
    } catch (error: any) {
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ApiResponse.error(error.message, 'Failed to retrieve users by role', StatusCodes.INTERNAL_SERVER_ERROR))
    }
  }

  // Get user statistics
  getUserStatistics = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const statistics = await this.userService.getUserStatistics()
      reply.status(StatusCodes.OK).send(ApiResponse.ok(statistics, 'User statistics retrieved successfully'))
    } catch (error: any) {
      console.error(error)
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ApiResponse.error(error.message, 'Failed to retrieve user statistics', StatusCodes.INTERNAL_SERVER_ERROR))
    }
  }
}
