import { BaseService } from '@core/application';

import { User, UserRepository } from '../../infrastructure';

interface InjectedDependencies {
  userRepository: UserRepository;
}

type CreateUserObj = Omit<
  User,
  'id' | 'createdAt' | 'updatedAt' | 'appleLoginId' | 'googleLoginId'
>;

export class UserService extends BaseService {
  private readonly _userRepository: UserRepository;

  constructor({ userRepository }: InjectedDependencies) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0]);

    this._userRepository = userRepository;
  }

  async createUser(userObj: CreateUserObj): Promise<User> {
    return this._atomicPhase(async (tx) => {
      const userRepo = this._userRepository.withTransaction(tx);

      const [user] = await userRepo.create(userObj);

      // console.log('User created', user);
      // throw new Error('Intentionally failing to test rollback');

      return user;
    });
  }
}

export default UserService;
