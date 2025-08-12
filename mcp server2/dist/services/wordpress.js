import axios from 'axios';
export class WordPressService {
    client;
    config;
    constructor(config) {
        this.config = config;
        const headers = { 'Content-Type': 'application/json' };
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
    async getOrder(orderId) {
        try {
            const response = await this.client.get(`/wp-json/wc/v3/orders/${orderId}`);
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to get order ${orderId}: ${error}`);
        }
    }
    async updateOrderStatus(orderId, status, note) {
        try {
            const updateData = { status };
            if (note) {
                updateData.note = note;
            }
            const response = await this.client.put(`/wp-json/wc/v3/orders/${orderId}`, updateData);
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to update order ${orderId}: ${error}`);
        }
    }
    async getOrders(params = {}) {
        try {
            const response = await this.client.get('/wp-json/wc/v3/orders', { params });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to get orders: ${error}`);
        }
    }
    async createPost(title, content, status = 'draft') {
        try {
            const response = await this.client.post('/wp-json/wp/v2/posts', {
                title,
                content,
                status
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to create post: ${error}`);
        }
    }
    async updatePost(postId, data) {
        try {
            const response = await this.client.put(`/wp-json/wp/v2/posts/${postId}`, data);
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to update post ${postId}: ${error}`);
        }
    }
    async getSiteInfo() {
        try {
            const response = await this.client.get('/wp-json/');
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to get site info: ${error}`);
        }
    }
}
//# sourceMappingURL=wordpress.js.map