import { createClient } from 'redis';
import { DebeziumData } from './types';

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

  async setHashMap(key: string, value: DebeziumData) {
    for (const [objKey, keyValue] of Object.entries(value)) {
      await this.client.hSet(key, objKey, keyValue);
    }
  }

  async indexField(key: string, field: string, value: string, keyPrefix = '') {
    try {
      await this.client.set(`${field}:${value}`, `${keyPrefix}_${key}`);
    } catch (error) {
      console.log(`Error indexing field: ${field}:${value} for key: ${key}`);
    }
  }

  async get(key: string) {
    let response;
    response = await this.client.hGetAll(key);
    return response;
  }

  async getHashField(key: string, field: string) {
    let response;
    response = await this.client.hGet(key, field);
    return response;
  }

  async disconnect() {
    await this.client.disconnect();
  }
}

export { RedisService };
