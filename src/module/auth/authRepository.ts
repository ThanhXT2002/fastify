import { BaseRepository } from '~/base/repository-base'

export class AuthRepository extends BaseRepository<'user'> {
  constructor() {
    super('user')
  }
}
