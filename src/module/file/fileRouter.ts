import { FastifyInstance } from 'fastify'
import { FileController } from './fileController.js'
import { authenticateApiKey } from '~/middleware/apiAuth.js'

export default async function fileRouter(fastify: FastifyInstance) {
  const fileController = new FileController()

  // All file routes require API key authentication
  fastify.addHook('preHandler', authenticateApiKey)

  // Upload files
  fastify.post('/files/upload', {
    schema: {
      tags: ['File'],
      summary: 'Upload multiple files',
      description: 'Upload multiple files to user folder on Cloudinary',
      headers: {
        type: 'object',
        properties: {
          'x-api-key': { type: 'string' }
        },
        required: ['x-api-key']
      },
      consumes: ['multipart/form-data'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'boolean' },
            code: { type: 'integer' },
            data: {
              type: 'object',
              properties: {
                success: { type: 'array' },
                failed: { type: 'array' }
              }
            },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    handler: fileController.uploadFiles
  })

  // Get user files with pagination
  fastify.get('/files', {
    schema: {
      tags: ['File'],
      summary: 'Get user files',
      description: 'Get paginated list of user files with optional folder filter',
      headers: {
        type: 'object',
        properties: {
          'x-api-key': { type: 'string' }
        },
        required: ['x-api-key']
      },
      querystring: {
        type: 'object',
        properties: {
          folder: { 
            type: 'string',
            description: 'Filter by folder path (supports nested folders like "images/2024")'
          },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'boolean' },
            code: { type: 'integer' },
            data: {
              type: 'object',
              properties: {
                files: { type: 'array' },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    totalPages: { type: 'integer' }
                  }
                }
              }
            },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    handler: fileController.getUserFiles
  })

  // Get user folders
  fastify.get('/files/folders', {
    schema: {
      tags: ['File'],
      summary: 'Get user folders',
      description: 'Get list of all folders containing user files',
      headers: {
        type: 'object',
        properties: {
          'x-api-key': { type: 'string' }
        },
        required: ['x-api-key']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'boolean' },
            code: { type: 'integer' },
            data: {
              type: 'object',
              properties: {
                folders: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    handler: fileController.getUserFolders
  })

  // Get storage statistics
  fastify.get('/files/stats', {
    schema: {
      tags: ['File'],
      summary: 'Get storage statistics',
      description: 'Get user storage usage statistics',
      headers: {
        type: 'object',
        properties: {
          'x-api-key': { type: 'string' }
        },
        required: ['x-api-key']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'boolean' },
            code: { type: 'integer' },
            data: {
              type: 'object',
              properties: {
                totalFiles: { type: 'integer' },
                totalSize: { type: 'integer' },
                folderBreakdown: { type: 'array' }
              }
            },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    handler: fileController.getStorageStats
  })

  // Get file by ID
  fastify.get('/files/:id', {
    schema: {
      tags: ['File'],
      summary: 'Get file by ID',
      description: 'Get detailed information about a specific file',
      headers: {
        type: 'object',
        properties: {
          'x-api-key': { type: 'string' }
        },
        required: ['x-api-key']
      },
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'boolean' },
            code: { type: 'integer' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                originalName: { type: 'string' },
                fileName: { type: 'string' },
                folderName: { type: 'string' },
                fileType: { type: 'string' },
                size: { type: 'integer' },
                url: { type: 'string' },
                uploadedAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    handler: fileController.getFileById
  })

  // Update file (rename)
  fastify.put('/files/:id', {
    schema: {
      tags: ['File'],
      summary: 'Update file',
      description: 'Update file information (currently supports renaming)',
      headers: {
        type: 'object',
        properties: {
          'x-api-key': { type: 'string' }
        },
        required: ['x-api-key']
      },
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          originalName: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'boolean' },
            code: { type: 'integer' },
            data: { type: 'object' },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    handler: fileController.updateFile
  })

  // Delete file
  fastify.delete('/files/:id', {
    schema: {
      tags: ['File'],
      summary: 'Delete file',
      description: 'Delete file from both Cloudinary and database',
      headers: {
        type: 'object',
        properties: {
          'x-api-key': { type: 'string' }
        },
        required: ['x-api-key']
      },
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'boolean' },
            code: { type: 'integer' },
            data: {
              type: 'object',
              properties: {
                message: { type: 'string' }
              }
            },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    handler: fileController.deleteFile
  })
}
