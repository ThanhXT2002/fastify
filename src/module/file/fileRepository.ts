import { BaseRepository } from '~/base/repository.base.js'

export interface FileData {
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
}

export interface FileFilters {
  userId: string
  folderName?: string
  fileType?: string
}

export class FileRepository extends BaseRepository<'file'> {
  constructor() {
    super('file')
  }

  // Tìm files theo user và filters
  async findFilesByUser(filters: FileFilters, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const where: any = { userId: filters.userId }

    if (filters.folderName) {
      where.folderName = filters.folderName
    }
    if (filters.fileType) {
      where.fileType = { contains: filters.fileType }
    }

    const [files, total] = await Promise.all([
      this.findMany({
        where,
        orderBy: { uploadedAt: 'desc' },
        skip,
        take: limit
      }),
      this.count(where)
    ])

    return {
      files,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  // Lấy tất cả folders của user
  async getUserFolders(userId: string) {
    const folders = await this.model.findMany({
      where: { userId },
      select: { folderName: true },
      distinct: ['folderName'],
      orderBy: { folderName: 'asc' }
    })

    return folders.map((f: any) => f.folderName)
  }

  // Kiểm tra file có thuộc về user không
  async isFileOwnedByUser(fileId: string, userId: string) {
    const file = await this.findUnique({
      where: { id: fileId, userId }
    })
    return !!file
  }

  // Xóa file theo publicId (để sync với Cloudinary)
  async deleteByPublicId(publicId: string, userId: string) {
    return this.model.deleteMany({
      where: { publicId, userId }
    })
  }

  // Lấy thống kê storage của user
  async getStorageStats(userId: string) {
    const stats = await this.model.aggregate({
      _sum: { size: true },
      _count: true,
      where: { userId }
    })

    const folderStats = await this.model.groupBy({
      by: ['folderName'],
      _sum: { size: true },
      _count: true,
      where: { userId }
    })

    return {
      totalFiles: stats._count,
      totalSize: stats._sum.size || 0,
      folderBreakdown: folderStats.map((folder: any) => ({
        folderName: folder.folderName,
        fileCount: folder._count,
        totalSize: folder._sum.size || 0
      }))
    }
  }
}
