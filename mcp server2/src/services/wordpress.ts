import axios, { AxiosInstance } from 'axios';
import { WordPressConfig, WooCommerceOrder } from '../types/index.js';

export class WordPressService {
  private client: AxiosInstance;
  private config: WordPressConfig;

  constructor(config: WordPressConfig) {
    this.config = config;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    // Prefer OAuth Bearer token if provided
    if (config.accessToken) {
      headers['Authorization'] = `Bearer ${config.accessToken}`;
    }
    this.client = axios.create({
      baseURL: config.url,
      auth: config.accessToken
        ? undefined
        : {
            username: config.username,
            password: config.password,
          },
      headers,
    });
  }

  async getOrder(orderId: string): Promise<WooCommerceOrder> {
    try {
      const response = await this.client.get(`/wp-json/wc/v3/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get order ${orderId}: ${error}`);
    }
  }

  async updateOrderStatus(orderId: string, status: string, note?: string): Promise<WooCommerceOrder> {
    try {
      const updateData: any = { status };
      if (note) {
        updateData.note = note;
      }
      
      const response = await this.client.put(`/wp-json/wc/v3/orders/${orderId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update order ${orderId}: ${error}`);
    }
  }

  async getOrders(params: any = {}): Promise<WooCommerceOrder[]> {
    try {
      const response = await this.client.get('/wp-json/wc/v3/orders', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get orders: ${error}`);
    }
  }

  async createPost(title: string, content: string, status: string = 'draft'): Promise<any> {
    try {
      const response = await this.client.post('/wp-json/wp/v2/posts', {
        title,
        content,
        status
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create post: ${error}`);
    }
  }

  async updatePost(postId: number, data: any): Promise<any> {
    try {
      const response = await this.client.put(`/wp-json/wp/v2/posts/${postId}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update post ${postId}: ${error}`);
    }
  }

  async getSiteInfo(): Promise<any> {
    try {
      const response = await this.client.get('/wp-json/');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get site info: ${error}`);
    }
  }
}
