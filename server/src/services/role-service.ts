import { Role } from '../models/role';
import { ModelService } from './model-service';

interface RoleResponse {
  roleName: string;
  description: string;
}

class RoleService extends ModelService {
  constructor() {
    super();
  }

  async GetRole(roleName: string): Promise<RoleResponse | undefined> {
    // check redis for the role, if not found, check the database
    let response: RoleResponse | undefined = undefined;
    let role = null;
    let redisResponse = await this.cache.get(roleName);
    if (redisResponse) {
      role = JSON.parse(redisResponse);
    } else {
      role = await Role.findOne({
        where: { role: roleName }
      });
      await this.cache.set(roleName, JSON.stringify(role));
    }
    response = role ? { roleName: role.roleName, description: role.description } : undefined;
    return response;
  }
}
