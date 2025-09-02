// import { supabase } from '../../config/supabaseClient'

import { v4 as uuidv4 } from 'uuid'
import cloudinary from '~/config/cloudinary'

import { supabase, supabaseAdmin } from '~/config/supabaseClient'
import { AuthRepository } from './authRepository'

export class AuthService {
  private authRepo: AuthRepository

  constructor() {
    this.authRepo = new AuthRepository()
  }

  async register(email: string, password: string, name?: string) {
    // Đăng ký với Supabase (cần verify email)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    const user = data.user
    if (!user) return { error: 'Supabase user not created' }

    // Sinh API key
    const apiKey = uuidv4()

    // Tạo folder trên Cloudinary
    await cloudinary.api.create_folder(email)

    // Lưu vào database
    try {
      await this.authRepo.create({
        id: user.id,
        email,
        name,
        key: apiKey,
        avatarUrl: user.user_metadata?.avatar_url || null,
        role: 'USER',
        createdAt: new Date()
      })
    } catch (err: any) {
      if (err.code === 'P2002') {
        return { error: { code: 'P2002', message: 'Record already exists', meta: err.meta } }
      }
      return { error: err }
    }

    return { user, apiKey }
  }

  async getUserProfile(userId: string) {
    try {
      const user = await this.authRepo.findById(userId)
      if (!user) {
        return { error: 'User not found' }
      }
      return { data: user }
    } catch (err: any) {
      return { error: err.message || 'Failed to get user profile' }
    }
  }

  async updateUserProfile(userId: string, updateData: { name?: string }) {
    try {
      const user = await this.authRepo.update({ id: userId }, updateData)
      if (!user) {
        return { error: 'User not found' }
      }
      return { data: user }
    } catch (err: any) {
      return { error: err.message || 'Failed to update user profile' }
    }
  }

  async getUserApiKey(userId: string) {
    try {
      const user = await this.authRepo.findById(userId)
      if (!user) {
        return { error: 'User not found' }
      }
      return { data: { key: user.key } }
    } catch (err: any) {
      console.log(err)
      return { error: err.message || 'Failed to get API key' }
    }
  }
}
