import { BaseRepository } from '~/base/repository.base.js'

export class UserRepository extends BaseRepository<'user'> {
  constructor() {
    super('user')
  }

  // Get all users with basic info
  async getAllUsers() {
    return this.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  // Get user with full info
  async getUserWithDetails(id: string) {
    return this.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        avatarUrl: true,
        key: true
      }
    })
  }

  // Update user information
  async updateUser(
    id: string,
    data: {
      name?: string
      role?: string
      active?: boolean
    }
  ) {
    return this.update({ id }, data)
  }

  // Soft delete user (set active to false)
  async softDeleteUser(id: string) {
    return this.update({ id }, { active: false })
  }

  // Hard delete user
  async hardDeleteUser(id: string) {
    return this.delete({ id })
  }

  // Count users by criteria
  async countUsers(where: object = {}) {
    return this.count(where)
  }

  // Count total users
  async countTotalUsers() {
    return this.count()
  }

  // Count active users
  async countActiveUsers() {
    return this.count({ active: true })
  }

  // Count users by role
  async countUsersByRole(role: string) {
    return this.count({ role })
  }

  // Count recent users (last 30 days)
  async countRecentUsers() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return this.count({
      createdAt: {
        gte: thirtyDaysAgo
      }
    })
  }

  // Search users by email or name
  async searchUsers(query: string) {
    return this.findMany({
      where: {
        OR: [{ email: { contains: query, mode: 'insensitive' } }, { name: { contains: query, mode: 'insensitive' } }]
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true
      },
      take: 50, // Limit results
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  // Check if user exists by email
  async existsByEmail(email: string) {
    const user = await this.findUnique({
      where: { email },
      select: { id: true }
    })
    return !!user
  }

  // Get users by role
  async getUsersByRole(role: string) {
    return this.findMany({
      where: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }
}
