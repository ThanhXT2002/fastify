import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class BaseRepository<TModel extends keyof typeof prisma> {
  protected model: (typeof prisma)[TModel]

  constructor(model: TModel) {
    this.model = prisma[model]
  }

  async findMany(query: object = {}) {
    return this.model.findMany(query)
  }

  async findUnique(query: object) {
    return this.model.findUnique(query)
  }

  async create(data: object) {
    return this.model.create({ data })
  }

  async update(where: object, data: object) {
    return this.model.update({ where, data })
  }

  async delete(where: object) {
    return this.model.delete({ where })
  }

  async upsert(where: object, createData: object, updateData: object) {
    return this.model.upsert({ where, create: createData, update: updateData })
  }

  async count(where: object = {}) {
    return this.model.count({ where })
  }
}
