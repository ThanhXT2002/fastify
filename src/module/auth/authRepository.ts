import { BaseRepository } from '~/base/repository.base.js'

export class AuthRepository extends BaseRepository<'user'> {
  constructor() {
    super('user')
  }
}
