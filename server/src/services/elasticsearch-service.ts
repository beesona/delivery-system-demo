import { Client } from '@elastic/elasticsearch';
import { time } from 'console';
import { DeliveryStatus } from '../types/delivery-types';

const esb = require('elastic-builder');

interface SearchFilters<T, P extends keyof T> {
  createdAt?: { gte: string; lte: string };
  updatedAt?: { gte: string; lte: string };
  dispatchAt?: { gte: string; lte: string };
  status?: DeliveryStatus[];
  orderId?: number[];
  notes?: { value: string; operator: 'and' | 'or' };
  sortBy?: P;
  limit?: number;
  offset?: number;
}

class ElasticsearchService {
  client: Client;

  constructor(node = 'http://localhost:9200') {
    this.client = new Client({
      node,
      auth: {
        apiKey: 'MHJjLWI1SUJCT0dGemoxdk5zTkk6N296SDZPU3FRZ3F4anU3YnlnMUpuQQ=='
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

  async getDocument<T>(index: string, id: string): Promise<T> {
    let response = undefined;
    response = (await this.client.get({ index, id }))._source as T;
    console.log('getDocument', response);
    return response;
  }

  buildFilters<T, P extends keyof T>(searchFilters: SearchFilters<T, P>) {
    let filters: any[] = [];
    if (searchFilters.createdAt) {
      filters.push({
        range: {
          created_at: {
            time_zone: '-06:00',
            gte: searchFilters.createdAt.gte,
            lte: searchFilters.createdAt.lte
          }
        }
      });
    }
    if (searchFilters.updatedAt) {
      filters.push({
        range: {
          updated_at: {
            time_zone: '-06:00',
            gte: searchFilters.updatedAt.gte,
            lte: searchFilters.updatedAt.lte
          }
        }
      });
    }
    if (searchFilters.dispatchAt) {
      filters.push({
        range: {
          dispatch_at: {
            time_zone: '-06:00',
            gte: searchFilters.dispatchAt.gte,
            lte: searchFilters.dispatchAt.lte
          }
        }
      });
    }
    if (searchFilters.status) {
      filters.push({
        terms: {
          status: searchFilters.status
        }
      });
    }
    if (searchFilters.orderId) {
      filters.push({
        terms: {
          order_id: searchFilters.orderId
        }
      });
    }
    if (searchFilters.notes) {
      filters.push({
        match: {
          notes: {
            query: searchFilters.notes.value,
            operator: searchFilters.notes.operator
          }
        }
      });
    }
    return filters;
  }

  async search<T, P extends keyof T>(
    index: string,
    searchFilters: SearchFilters<T, P>
  ): Promise<T[] | undefined> {
    let response: T[] | undefined;
    // 2024-10-09T09:32:16.528
    const requestBody = esb.requestBodySearch().query(esb.matchQuery('delivery_type', 'BUSINESS'));

    const searchResults = await this.client.search({
      index,
      query: requestBody.toJSON(),
      size: searchFilters.limit || 100,
      from: searchFilters.offset || 0
    });
    response = searchResults.hits.hits.map((hit: any) => hit._source) as T[];
    return response;
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

export { ElasticsearchService, SearchFilters };
