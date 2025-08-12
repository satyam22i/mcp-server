import { MCPTool } from '../types/index.js';
import { WordPressService } from '../services/wordpress.js';
import { AIService } from '../services/ai.js';
export declare class OrderTools {
    private wordpressService;
    private aiService;
    constructor(wordpressService: WordPressService, aiService: AIService);
    getTools(): MCPTool[];
    private getOrderInfo;
    private completeOrder;
    private updateOrderStatus;
    private searchOrders;
    private processOrderCommand;
}
//# sourceMappingURL=orderTools.d.ts.map