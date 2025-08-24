// import { supabase } from '../../config/supabaseClient'

import { v4 as uuidv4 } from 'uuid'
import cloudinary from '~/config/cloudinary'

import { supabase } from '~/config/supabaseClient'
import { AuthRepository } from './authRepository'

export class AuthService {
  private authRepo: AuthRepository

  constructor() {
    this.authRepo = new AuthRepository()
  }

  async register(email: string, password: string, name?: string) {
    // Đăng ký với Supabase
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    const user = data.user
    if (!user) return { error: 'Supabase user not created' }

    // Sinh API key
    const apiKey = uuidv4()

    // Tạo folder trên Cloudinary
    await cloudinary.api.create_folder(email)

    // Lưu vào database
    await this.authRepo.create({
      id: user.id,
      email,
      name,
      key: apiKey,
      avatarUrl: user.user_metadata?.avatar_url || null,
      role: 'USER',
      createdAt: new Date()
    })

    return { user, apiKey }
  }
}
