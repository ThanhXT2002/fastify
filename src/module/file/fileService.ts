import { FileRepository, type FileData } from './fileRepository'
import cloudinary from '~/config/cloudinary'
import { v4 as uuidv4 } from 'uuid'

export interface UploadFileData {
  buffer: Buffer
  originalName: string
  mimeType: string
  size: number
}

export interface UploadResult {
  // success should contain stored file metadata (id, url, names, size, etc.)
  success: Array<{
    id: string
    userId: string
    originalName: string
    fileName: string
    folderName: string
    fileType: string
    mimeType: string
    size: number
    url: string
    publicId: string
    cloudinaryFolder: string
    uploadedAt?: Date | string
  }>
  failed: { file: UploadFileData; error: string }[]
}

// Default file type categories (optional, for reference)
const DEFAULT_FILE_CATEGORIES = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  video: ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/aac'],
  archive: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']
}

// General size limits (can be customized per folder if needed)
const DEFAULT_SIZE_LIMITS = {
  // Per file type
  image: 50 * 1024 * 1024, // 50MB
  document: 250 * 1024 * 1024, // 250MB
  video: 200 * 1024 * 1024, // 200MB
  audio: 200 * 1024 * 1024, // 200MB
  archive: 500 * 1024 * 1024, // 500MB
  // General limit for unknown types
  default: 500 * 1024 * 1024 // 500MB
}

export class FileService {
  private fileRepo: FileRepository

  constructor() {
    this.fileRepo = new FileRepository()
  }

  // Validate folder name format
  private validateFolderName(folderName: string): string | null {
    if (!folderName) return null // Empty folder name is allowed (root folder)
    
    // Remove leading/trailing slashes and spaces
    const cleanFolder = folderName.trim().replace(/^\/+|\/+$/g, '')
    
    // Check for invalid characters
    if (!/^[a-zA-Z0-9\/_-]+$/.test(cleanFolder)) {
      return 'Folder name can only contain letters, numbers, hyphens, underscores, and forward slashes'
    }
    
    // Check for double slashes
    if (cleanFolder.includes('//')) {
      return 'Folder name cannot contain consecutive slashes'
    }
    
    // Check length
    if (cleanFolder.length > 100) {
      return 'Folder path is too long (max 100 characters)'
    }
    
    return null
  }

  // Get file type category based on MIME type
  private getFileTypeCategory(mimeType: string): string {
    const lowerMime = mimeType.toLowerCase()
    
    if (lowerMime.startsWith('image/')) return 'image'
    if (lowerMime.startsWith('video/')) return 'video'
    if (lowerMime.startsWith('audio/')) return 'audio'
    if (lowerMime.includes('pdf') || lowerMime.includes('document') || lowerMime.includes('text') || lowerMime.includes('csv') || lowerMime.includes('excel')) return 'document'
    if (lowerMime.includes('zip') || lowerMime.includes('rar') || lowerMime.includes('7z')) return 'archive'
    
    return 'default'
  }

  // Validate file type and size (more flexible)
  private validateFile(file: UploadFileData, folderName?: string): string | null {
    // Get file type category
    const fileCategory = this.getFileTypeCategory(file.mimeType)
    
    // Get size limit based on file type
    const sizeLimit = DEFAULT_SIZE_LIMITS[fileCategory as keyof typeof DEFAULT_SIZE_LIMITS] || DEFAULT_SIZE_LIMITS.default
    
    // Check file size
    if (file.size > sizeLimit) {
      return `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max size for ${fileCategory} files: ${(sizeLimit / 1024 / 1024)}MB`
    }
    
    // Optional: Check if file type is in known categories (warning only)
    const knownTypes = Object.values(DEFAULT_FILE_CATEGORIES).flat()
    if (!knownTypes.includes(file.mimeType)) {
      console.warn(`Unknown file type: ${file.mimeType} in folder: ${folderName || 'root'}`)
    }
    
    return null
  }

  // Create folder on Cloudinary if not exists (supports nested folders)
  private async ensureCloudinaryFolder(folderPath: string): Promise<void> {
    try {
      // Split folder path and create each level
      const pathParts = folderPath.split('/')
      let currentPath = ''
      
      for (const part of pathParts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part
        
        try {
          await cloudinary.api.create_folder(currentPath)
        } catch (error: any) {
          // Folder might already exist, which is fine
          if (!error.message?.includes('already exists') && !error.message?.includes('already taken')) {
            throw error
          }
        }
      }
    } catch (error: any) {
      console.error('Error creating Cloudinary folders:', error)
      throw error
    }
  }

  // Upload single file to Cloudinary
  private async uploadToCloudinary(file: UploadFileData, cloudinaryFolder: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const uniqueFileName = `${Date.now()}_${uuidv4()}`
      
      cloudinary.uploader.upload_stream(
        {
          folder: cloudinaryFolder,
          public_id: uniqueFileName,
          resource_type: 'auto', // Auto-detect file type
          use_filename: false,
          unique_filename: true
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      ).end(file.buffer)
    })
  }

  // Main upload method
  async uploadFiles(
    userId: string,
    userEmail: string,
    files: UploadFileData[],
    folderName?: string
  ): Promise<UploadResult> {
    const result: UploadResult = {
      success: [],
      failed: []
    }

    // Validate folder name format
    const folderValidation = this.validateFolderName(folderName || '')
    if (folderValidation) {
      return {
        success: [],
        failed: files.map(file => ({
          file,
          error: folderValidation
        }))
      }
    }

    // Clean and normalize folder path
    const cleanFolderName = folderName?.trim().replace(/^\/+|\/+$/g, '') || ''
    const cloudinaryFolder = cleanFolderName 
      ? `${userEmail}/${cleanFolderName}`
      : userEmail // Root folder if no subfolder specified
    
    // Ensure folder exists on Cloudinary (create nested folders if needed)
    try {
      await this.ensureCloudinaryFolder(cloudinaryFolder)
    } catch (error: any) {
      return {
        success: [],
        failed: files.map(file => ({
          file,
          error: `Failed to create folder: ${error.message}`
        }))
      }
    }

    // Process each file
    for (const file of files) {
      try {
        // Validate file
        const validationError = this.validateFile(file, cleanFolderName)
        if (validationError) {
          result.failed.push({ file, error: validationError })
          continue
        }

        // Upload to Cloudinary
        const cloudinaryResult = await this.uploadToCloudinary(file, cloudinaryFolder)

        // Save to database
        const fileData: FileData = {
          userId,
          originalName: file.originalName,
          fileName: cloudinaryResult.original_filename || file.originalName,
          folderName: cleanFolderName, // Store the clean folder path
          fileType: file.mimeType,
          mimeType: file.mimeType,
          size: file.size,
          url: cloudinaryResult.secure_url,
          publicId: cloudinaryResult.public_id,
          cloudinaryFolder
        }

        const saved = await this.fileRepo.create(fileData)

        // Push saved metadata (not the raw buffer) to response
        result.success.push({
          id: saved.id,
          userId: saved.userId,
          originalName: saved.originalName,
          fileName: saved.fileName,
          folderName: saved.folderName,
          fileType: saved.fileType,
          mimeType: saved.mimeType,
          size: saved.size,
          url: saved.url,
          publicId: saved.publicId,
          cloudinaryFolder: saved.cloudinaryFolder,
          uploadedAt: saved.uploadedAt
        })

      } catch (error: any) {
        result.failed.push({
          file,
          error: error.message || 'Upload failed'
        })
      }
    }

    return result
  }

  // Get files by user with pagination
  async getUserFiles(userId: string, folderName?: string, page = 1, limit = 20) {
    return this.fileRepo.findFilesByUser(
      { userId, folderName },
      page,
      limit
    )
  }

  // Get user folders
  async getUserFolders(userId: string) {
    return this.fileRepo.getUserFolders(userId)
  }

  // Get file by ID
  async getFileById(fileId: string, userId: string) {
    const file = await this.fileRepo.findUnique({
      where: { id: fileId, userId }
    })
    
    if (!file) {
      throw new Error('File not found or access denied')
    }
    
    return file
  }

  // Delete file
  async deleteFile(fileId: string, userId: string) {
    const file = await this.getFileById(fileId, userId)
    
    try {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(file.publicId)
    } catch (error) {
      // Continue even if Cloudinary delete fails
      console.error('Failed to delete from Cloudinary:', error)
    }

    // Delete from database
    await this.fileRepo.delete({ id: fileId })
    
    return { message: 'File deleted successfully' }
  }

  // Update file (rename)
  async updateFile(fileId: string, userId: string, updateData: { originalName?: string }) {
    const file = await this.getFileById(fileId, userId)
    
    const updatedFile = await this.fileRepo.update(
      { id: fileId },
      updateData
    )
    
    return updatedFile
  }

  // Get storage statistics
  async getStorageStats(userId: string) {
    return this.fileRepo.getStorageStats(userId)
  }

  // Browse folder contents (files và subfolders cùng cấp)
  async browseFolderContents(userId: string, folderPath?: string, page = 1, limit = 20) {
    // Validate và clean folder path
    const cleanPath = folderPath?.trim().replace(/^\/+|\/+$/g, '') || ''
    
    if (cleanPath) {
      const validationError = this.validateFolderName(cleanPath)
      if (validationError) {
        throw new Error(validationError)
      }
    }

    return this.fileRepo.browseFolderContents(userId, cleanPath, page, limit)
  }
}
