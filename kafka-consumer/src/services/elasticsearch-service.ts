import { Client } from '@elastic/elasticsearch';

class ElasticsearchService {
  client: Client;

  constructor(node = 'http://localhost:9200') {
    this.client = new Client({
      node,
      auth: {
        apiKey: 'UHJIcmtKSUJhWk42OWoyS2YyeVk6TEFJNnV6S3VTek9naV9fM1V0RVpIZw=='
      }
    });
  }

  async createIndex(index: string) {
    return await this.client.indices.create({ index });
  }

  async indexDocument(index: string, id: string, body: any) {
    return await this.client.index({ index, id, body });
  }

  async updateDocument(index: string, id: string, body: any) {
    return await this.client.update({ index, id, body });
  }

  async search(index: string, body: any) {
    return await this.client.search({ index, body });
  }

  async deleteDocument(index: string, id: string) {
    return await this.client.delete({ index, id });
  }

  async deleteIndex(index: string) {
    return await this.client.indices.delete({ index });
  }

  async disconnect() {
    await this.client.close();
  }
}

export { ElasticsearchService };
