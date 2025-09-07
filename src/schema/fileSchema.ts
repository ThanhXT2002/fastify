import { z } from 'zod'

export const deleteMultipleFilesSchema = z.object({
  fileIds: z.array(z.string().uuid()).min(1).max(100) // Max 100 files per request for safety
})

export const deleteFilesByUrlsSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(100) // Max 100 URLs per request for safety
})

export const uploadFileSchema = z.object({
  folderName: z.string().optional()
})

export const updateFileSchema = z.object({
  originalName: z.string().optional()
})

export const getFilesQuerySchema = z.object({
  folder: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
})

export const browseFolderQuerySchema = z.object({
  path: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(20)
})
