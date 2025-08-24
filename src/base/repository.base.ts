import { PrismaClient } from '../../generated/prisma'

const prisma = new PrismaClient()

type ModelDelegate = {
  findMany: (args?: any) => Promise<any>;
  findUnique: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
  upsert: (args: any) => Promise<any>;
  count: (args?: any) => Promise<any>;
};

type PrismaModelKeys = {
  [K in keyof typeof prisma]: (typeof prisma)[K] extends ModelDelegate ? K : never
}[keyof typeof prisma];

export class BaseRepository<TModel extends PrismaModelKeys> {
  protected model: ModelDelegate;

  constructor(model: TModel) {
    this.model = prisma[model] as ModelDelegate;
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
