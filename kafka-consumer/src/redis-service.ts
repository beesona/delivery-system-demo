import { createClient } from 'redis';

class RedisService {
  static #instance: RedisService;

  public static get instance(): RedisService {
    if (!RedisService.#instance) {
      RedisService.#instance = new RedisService();
      this.#instance.connect();
      this.#instance.client.flushAll();
    }

    return RedisService.#instance;
  }

  private client = createClient({
    url: 'redis://default:eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81@localhost:6379'
  });

  async connect() {
    try {
      await this.client.connect();
      console.log('Connected to Redis');
    } catch (error) {
      console.log(error);
    }
  }

  async set(key: string, field: string, value: string) {
    await this.client.hSet(key, field, value);
  }

  async get(key: string) {
    return await this.client.get(key);
  }

  async disconnect() {
    await this.client.disconnect();
  }
}

export { RedisService };
