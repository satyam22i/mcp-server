import { WordPressConfig, WooCommerceOrder } from '../types/index.js';
export declare class WordPressService {
    private client;
    private config;
    constructor(config: WordPressConfig);
    getOrder(orderId: string): Promise<WooCommerceOrder>;
    updateOrderStatus(orderId: string, status: string, note?: string): Promise<WooCommerceOrder>;
    getOrders(params?: any): Promise<WooCommerceOrder[]>;
    createPost(title: string, content: string, status?: string): Promise<any>;
    updatePost(postId: number, data: any): Promise<any>;
    getSiteInfo(): Promise<any>;
}
//# sourceMappingURL=wordpress.d.ts.map