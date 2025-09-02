import { FastifyRequest, FastifyReply } from 'fastify'
import { FileService, type UploadFileData } from './fileService.js'
import { ApiResponse } from '~/base/api-reponse.js'
import { StatusCodes } from 'http-status-codes'

export class FileController {
  private fileService: FileService

  constructor() {
    this.fileService = new FileService()
  }

  // Upload multiple files
  uploadFiles = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.apiUser
      if (!user) {
        return reply
          .status(StatusCodes.UNAUTHORIZED)
          .send(ApiResponse.error('User not authenticated', 'Unauthorized', StatusCodes.UNAUTHORIZED))
      }

      const files: UploadFileData[] = []
      let folderName: string | undefined

      // Process multipart data
      for await (const part of request.parts()) {
        if (part.type === 'field' && part.fieldname === 'folderName') {
          folderName = part.value as string
        } else if (part.type === 'file') {
          const buffer = await part.toBuffer()
          files.push({
            buffer,
            originalName: part.filename || 'unknown',
            mimeType: part.mimetype || 'application/octet-stream',
            size: buffer.length
          })
        }
      }

      // folderName is now optional - can be empty for root folder upload
      if (files.length === 0) {
        return reply
          .status(StatusCodes.BAD_REQUEST)
          .send(ApiResponse.error('No files provided', 'Bad Request', StatusCodes.BAD_REQUEST))
      }

      // Upload files
      const result = await this.fileService.uploadFiles(
        user.id,
        user.email,
        files,
        folderName
      )

      return reply
        .status(StatusCodes.OK)
        .send(ApiResponse.ok(result, 'Files processed successfully', StatusCodes.OK))

    } catch (error: any) {
      return reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ApiResponse.error(error.message, 'Upload failed', StatusCodes.INTERNAL_SERVER_ERROR))
    }
  }

  // Get user files with pagination
  getUserFiles = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.apiUser
      if (!user) {
        return reply
          .status(StatusCodes.UNAUTHORIZED)
          .send(ApiResponse.error('User not authenticated', 'Unauthorized', StatusCodes.UNAUTHORIZED))
      }

      const query = request.query as {
        folder?: string
        page?: string
        limit?: string
      }

      const page = parseInt(query.page || '1')
      const limit = Math.min(parseInt(query.limit || '20'), 100) // Max 100 items per page

      const result = await this.fileService.getUserFiles(
        user.id,
        query.folder,
        page,
        limit
      )

      return reply
        .status(StatusCodes.OK)
        .send(ApiResponse.ok(result, 'Files retrieved successfully', StatusCodes.OK))

    } catch (error: any) {
      return reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ApiResponse.error(error.message, 'Failed to get files', StatusCodes.INTERNAL_SERVER_ERROR))
    }
  }

  // Get user folders
  getUserFolders = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.apiUser
      if (!user) {
        return reply
          .status(StatusCodes.UNAUTHORIZED)
          .send(ApiResponse.error('User not authenticated', 'Unauthorized', StatusCodes.UNAUTHORIZED))
      }

      const folders = await this.fileService.getUserFolders(user.id)

      return reply
        .status(StatusCodes.OK)
        .send(ApiResponse.ok({ folders }, 'Folders retrieved successfully', StatusCodes.OK))

    } catch (error: any) {
      return reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ApiResponse.error(error.message, 'Failed to get folders', StatusCodes.INTERNAL_SERVER_ERROR))
    }
  }

  // Get file by ID
  getFileById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const user = request.apiUser
      if (!user) {
        return reply
          .status(StatusCodes.UNAUTHORIZED)
          .send(ApiResponse.error('User not authenticated', 'Unauthorized', StatusCodes.UNAUTHORIZED))
      }

      const { id } = request.params
      const file = await this.fileService.getFileById(id, user.id)

      return reply
        .status(StatusCodes.OK)
        .send(ApiResponse.ok(file, 'File retrieved successfully', StatusCodes.OK))

    } catch (error: any) {
      if (error.message === 'File not found or access denied') {
        return reply
          .status(StatusCodes.NOT_FOUND)
          .send(ApiResponse.error(error.message, 'File not found', StatusCodes.NOT_FOUND))
      }

      return reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ApiResponse.error(error.message, 'Failed to get file', StatusCodes.INTERNAL_SERVER_ERROR))
    }
  }

  // Delete file
  deleteFile = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const user = request.apiUser
      if (!user) {
        return reply
          .status(StatusCodes.UNAUTHORIZED)
          .send(ApiResponse.error('User not authenticated', 'Unauthorized', StatusCodes.UNAUTHORIZED))
      }

      const { id } = request.params
      const result = await this.fileService.deleteFile(id, user.id)

      return reply
        .status(StatusCodes.OK)
        .send(ApiResponse.ok(result, 'File deleted successfully', StatusCodes.OK))

    } catch (error: any) {
      if (error.message === 'File not found or access denied') {
        return reply
          .status(StatusCodes.NOT_FOUND)
          .send(ApiResponse.error(error.message, 'File not found', StatusCodes.NOT_FOUND))
      }

      return reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ApiResponse.error(error.message, 'Failed to delete file', StatusCodes.INTERNAL_SERVER_ERROR))
    }
  }

  // Update file
  updateFile = async (
    request: FastifyRequest<{
      Params: { id: string }
      Body: { originalName?: string }
    }>,
    reply: FastifyReply
  ) => {
    try {
      const user = request.apiUser
      if (!user) {
        return reply
          .status(StatusCodes.UNAUTHORIZED)
          .send(ApiResponse.error('User not authenticated', 'Unauthorized', StatusCodes.UNAUTHORIZED))
      }

      const { id } = request.params
      const updateData = request.body

      const file = await this.fileService.updateFile(id, user.id, updateData)

      return reply
        .status(StatusCodes.OK)
        .send(ApiResponse.ok(file, 'File updated successfully', StatusCodes.OK))

    } catch (error: any) {
      if (error.message === 'File not found or access denied') {
        return reply
          .status(StatusCodes.NOT_FOUND)
          .send(ApiResponse.error(error.message, 'File not found', StatusCodes.NOT_FOUND))
      }

      return reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ApiResponse.error(error.message, 'Failed to update file', StatusCodes.INTERNAL_SERVER_ERROR))
    }
  }

  // Get storage statistics
  getStorageStats = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.apiUser
      if (!user) {
        return reply
          .status(StatusCodes.UNAUTHORIZED)
          .send(ApiResponse.error('User not authenticated', 'Unauthorized', StatusCodes.UNAUTHORIZED))
      }

      const stats = await this.fileService.getStorageStats(user.id)

      return reply
        .status(StatusCodes.OK)
        .send(ApiResponse.ok(stats, 'Storage stats retrieved successfully', StatusCodes.OK))

    } catch (error: any) {
      return reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ApiResponse.error(error.message, 'Failed to get storage stats', StatusCodes.INTERNAL_SERVER_ERROR))
    }
  }
}
