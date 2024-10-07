import { DatabaseService } from './database-service';
import { RedisService } from './redis-service';

export class ModelService {
  private db: DatabaseService;
  cache: RedisService;

  constructor() {
    this.db = DatabaseService.instance;
    this.cache = RedisService.instance;
  }
}
