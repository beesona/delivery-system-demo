import { Role } from '../models/role';
import { User } from '../models/user';
import { ModelService } from './model-service';

interface UserResponse {
  userName: string;
  email: string;
  name?: string;
  roles?: string[];
}

class UserService extends ModelService {
  constructor() {
    super();
  }

  async getUser(userName: string, includeRoles = true): Promise<UserResponse | undefined> {
    // check redis for the user, if not found, check the database
    let response: UserResponse | undefined = undefined;
    let user = null;
    let redisResponse = await this.cache.get(userName);
    if (redisResponse) {
      user = JSON.parse(redisResponse);
    } else {
      user = await User.findOne({
        where: { userName },
        include: [User.associations.roles]
      });
      //const roles = await user?.getRoles({ attributes: ['role'], raw: true });
      await this.cache.set(userName, JSON.stringify(user));
    }
    response = user
      ? {
          userName: user.userName,
          email: user.email,
          name: user.name,
          roles: includeRoles ? user.roles.map((role: any) => role.role) : undefined
        }
      : undefined;
    return response;
  }
}

export { UserService, UserResponse };
