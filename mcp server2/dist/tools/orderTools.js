export class OrderTools {
    wordpressService;
    aiService;
    constructor(wordpressService, aiService) {
        this.wordpressService = wordpressService;
        this.aiService = aiService;
    }
    getTools() {
        return [
            this.getOrderInfo(),
            this.completeOrder(),
            this.updateOrderStatus(),
            this.searchOrders(),
            this.processOrderCommand(),
        ];
    }
    getOrderInfo() {
        return {
            name: 'get_order_info',
            description: 'Get detailed information about a specific WooCommerce order',
            inputSchema: {
                type: 'object',
                properties: {
                    orderId: { type: 'string', description: 'The order ID or order number' },
                },
                required: ['orderId'],
            },
            handler: async (args) => {
                try {
                    const order = await this.wordpressService.getOrder(args.orderId);
                    return { success: true, order, message: `Order ${args.orderId} retrieved successfully` };
                }
                catch (error) {
                    return { success: false, message: `Failed to get order ${args.orderId}` };
                }
            },
        };
    }
    completeOrder() {
        return {
            name: 'complete_order',
            description: 'Mark a WooCommerce order as completed',
            inputSchema: {
                type: 'object',
                properties: {
                    orderId: { type: 'string', description: 'The order ID or order number' },
                    note: { type: 'string', description: 'Optional note to add to the order' },
                },
                required: ['orderId'],
            },
            handler: async (args) => {
                try {
                    const order = await this.wordpressService.updateOrderStatus(args.orderId, 'completed', args.note || 'Order marked as completed via MCP server');
                    return { success: true, order, message: `Order ${args.orderId} has been marked as completed` };
                }
                catch (error) {
                    return { success: false, message: `Failed to complete order ${args.orderId}` };
                }
            },
        };
    }
    updateOrderStatus() {
        return {
            name: 'update_order_status',
            description: 'Update the status of a WooCommerce order',
            inputSchema: {
                type: 'object',
                properties: {
                    orderId: { type: 'string', description: 'The order ID or order number' },
                    status: { type: 'string', description: 'New status for the order' },
                    note: { type: 'string', description: 'Optional note to add to the order' },
                },
                required: ['orderId', 'status'],
            },
            handler: async (args) => {
                try {
                    const order = await this.wordpressService.updateOrderStatus(args.orderId, args.status, args.note);
                    return { success: true, order, message: `Order ${args.orderId} status updated to ${args.status}` };
                }
                catch (error) {
                    return { success: false, message: `Failed to update order ${args.orderId} status` };
                }
            },
        };
    }
    searchOrders() {
        return {
            name: 'search_orders',
            description: 'Search for WooCommerce orders with various filters',
            inputSchema: {
                type: 'object',
                properties: {
                    status: { type: 'string', description: 'Filter by order status' },
                    customer_id: { type: 'number', description: 'Filter by customer ID' },
                    date_after: { type: 'string', description: 'Filter orders after this date (ISO format)' },
                    date_before: { type: 'string', description: 'Filter orders before this date (ISO format)' },
                    limit: { type: 'number', description: 'Number of orders to return (default: 10)' },
                },
            },
            handler: async (args) => {
                try {
                    const orders = await this.wordpressService.getOrders(args);
                    return { success: true, orders, count: orders.length, message: `Found ${orders.length} orders` };
                }
                catch (error) {
                    return { success: false, message: 'Failed to search orders' };
                }
            },
        };
    }
    processOrderCommand() {
        return {
            name: 'process_order_command',
            description: 'Process natural language commands for order management using AI',
            inputSchema: {
                type: 'object',
                properties: {
                    command: { type: 'string', description: 'e.g., "#643645 mark this order as completed"' },
                },
                required: ['command'],
            },
            handler: async (args) => {
                try {
                    const orderIdMatch = args.command.match(/#(\d+)/);
                    let orderData = undefined;
                    if (orderIdMatch) {
                        const orderId = orderIdMatch[1];
                        try {
                            const fetched = await this.wordpressService.getOrder(orderId);
                            orderData = fetched ? fetched : undefined;
                        }
                        catch {
                            // continue without order data
                        }
                    }
                    const aiResponse = await this.aiService.processOrderCommand(args.command, orderData);
                    if (aiResponse.success && aiResponse.action && orderData) {
                        const orderId = String(orderData.id);
                        switch (aiResponse.action) {
                            case 'complete_order':
                                await this.wordpressService.updateOrderStatus(orderId, 'completed', aiResponse.message);
                                break;
                            case 'cancel_order':
                                await this.wordpressService.updateOrderStatus(orderId, 'cancelled', aiResponse.message);
                                break;
                            case 'update_status':
                                if (aiResponse.data?.status) {
                                    await this.wordpressService.updateOrderStatus(orderId, aiResponse.data.status, aiResponse.message);
                                }
                                break;
                        }
                    }
                    return { success: true, aiResponse, orderData, message: aiResponse.message };
                }
                catch (error) {
                    return { success: false, message: 'Failed to process order command' };
                }
            },
        };
    }
}
//# sourceMappingURL=orderTools.js.map