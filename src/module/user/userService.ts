import { UserRepository } from "./userRepository.js";

type Role = 'ADMIN' | 'EDITOR' | 'USER'

export class UserService {
  private userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  // Get all users with pagination
  async getAllUsers() {
    try {
      const users = await this.userRepository.getAllUsers()
      const totalUsers = await this.userRepository.countTotalUsers()
      const activeUsers = await this.userRepository.countActiveUsers()

      return {
        users,
        statistics: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers
        }
      }
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error}`)
    }
  }

  // Get user by ID
  async getUserById(id: string) {
    try {
      const user = await this.userRepository.getUserWithDetails(id)
      
      if (!user) {
        throw new Error('User not found')
      }

      return user
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error}`)
    }
  }

  // Update user information
  async updateUser(id: string, updateData: {
    name?: string
    role?: string
    active?: boolean
  }) {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.getUserWithDetails(id)
      
      if (!existingUser) {
        throw new Error('User not found')
      }

      // Update user
      const updatedUser = await this.userRepository.updateUser(id, updateData)
      
      return updatedUser
    } catch (error) {
      throw new Error(`Failed to update user: ${error}`)
    }
  }

  // Soft delete user (deactivate)
  async deactivateUser(id: string) {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.getUserWithDetails(id)
      
      if (!existingUser) {
        throw new Error('User not found')
      }

      if (!existingUser.active) {
        throw new Error('User is already inactive')
      }

      // Soft delete user
      await this.userRepository.softDeleteUser(id)
      
      return { message: 'User deactivated successfully' }
    } catch (error) {
      throw new Error(`Failed to deactivate user: ${error}`)
    }
  }

  // Activate user
  async activateUser(id: string) {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.getUserWithDetails(id)
      
      if (!existingUser) {
        throw new Error('User not found')
      }

      if (existingUser.active) {
        throw new Error('User is already active')
      }

      // Activate user
      const activatedUser = await this.userRepository.updateUser(id, { active: true })
      
      return activatedUser
    } catch (error) {
      throw new Error(`Failed to activate user: ${error}`)
    }
  }

  // Delete user permanently
  async deleteUser(id: string) {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.getUserWithDetails(id)
      
      if (!existingUser) {
        throw new Error('User not found')
      }

      // Hard delete user
      await this.userRepository.hardDeleteUser(id)
      
      return { message: 'User deleted permanently' }
    } catch (error) {
      throw new Error(`Failed to delete user: ${error}`)
    }
  }

  // Search users
  async searchUsers(query: string) {
    try {
      if (!query || query.trim().length < 2) {
        throw new Error('Search query must be at least 2 characters')
      }

      const users = await this.userRepository.searchUsers(query.trim())
      
      return {
        users,
        count: users.length,
        query: query.trim()
      }
    } catch (error) {
      throw new Error(`Failed to search users: ${error}`)
    }
  }

  // Get users by role
  async getUsersByRole(role: string) {
    try {
      const users = await this.userRepository.getUsersByRole(role)
      const count = await this.userRepository.countUsersByRole(role)
      
      return {
        users,
        count,
        role
      }
    } catch (error) {
      throw new Error(`Failed to fetch users by role: ${error}`)
    }
  }

  // Get user statistics
  async getUserStatistics() {
    try {
      const totalUsers = await this.userRepository.countTotalUsers()
      const activeUsers = await this.userRepository.countActiveUsers()
      const recentUsers = await this.userRepository.countRecentUsers()
      const adminUsers = await this.userRepository.countUsersByRole('ADMIN')
      const userUsers = await this.userRepository.countUsersByRole('USER')
      const editorUsers = await this.userRepository.countUsersByRole('EDITOR')
      
      return {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        recent: recentUsers,
        byRole: {
          admin: adminUsers,
          editor: editorUsers,
          user: userUsers,
          other: totalUsers - adminUsers - editorUsers - userUsers
        }
      }
    } catch (error) {
      throw new Error(`Failed to fetch user statistics: ${error}`)
    }
  }
}
