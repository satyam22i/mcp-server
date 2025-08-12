import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
// Import services
import { WordPressService } from './services/wordpress.js';
import { AIService } from './services/ai.js';
import { FileManager } from './services/fileManager.js';
// Import tools
import { OrderTools } from './tools/orderTools.js';
import { FileTools } from './tools/fileTools.js';
import { ContentTools } from './tools/contentTools.js';
// Load environment variables
dotenv.config();
class WooCommerceMCPServer {
    server;
    wordpressService;
    aiService;
    fileManager;
    orderTools;
    fileTools;
    contentTools;
    constructor() {
        // Initialize transport
        const transport = new StdioServerTransport();
        this.server = new Server({
            name: 'woocommerce-mcp-server',
            version: '1.0.0',
        }, transport);
        // Initialize services
        this.initializeServices();
        // Initialize tools
        this.initializeTools();
        // Set up server handlers
        this.setupHandlers();
    }
    initializeServices() {
        // WordPress configuration
        const wordpressConfig = {
            url: process.env.WORDPRESS_URL || 'https://your-wordpress-site.com',
            username: process.env.WORDPRESS_USERNAME || 'your_username',
            password: process.env.WORDPRESS_PASSWORD || 'your_application_password',
            consumerKey: process.env.WORDPRESS_CONSUMER_KEY || 'your_woocommerce_consumer_key',
            consumerSecret: process.env.WORDPRESS_CONSUMER_SECRET || 'your_woocommerce_consumer_secret'
        };
        // Initialize services
        this.wordpressService = new WordPressService(wordpressConfig);
        this.aiService = new AIService(process.env.GEMINI_API_KEY || 'AIzaSyDVvt0D-p4b9lKNF0z-t1ns64CqQNPpFE8');
        this.fileManager = new FileManager(process.env.WORDPRESS_ROOT_PATH || './wordpress', process.env.BACKUP_DIRECTORY || './backups');
        console.log('Services initialized successfully');
    }
    initializeTools() {
        // Initialize tool classes
        this.orderTools = new OrderTools(this.wordpressService, this.aiService);
        this.fileTools = new FileTools(this.fileManager, this.aiService);
        this.contentTools = new ContentTools(this.wordpressService, this.aiService);
        console.log('Tools initialized successfully');
    }
    setupHandlers() {
        // Set up file change monitoring
        this.fileManager.onFileChange((change) => {
            console.log(`File change detected: ${change.path} (${change.type})`);
            // You can add additional logic here to handle file changes
            // For example, automatically analyze changes or trigger backups
        });
        console.log('Server handlers set up successfully');
    }
    async start() {
        try {
            console.log('WooCommerce MCP Server started successfully');
            // Start file watching by default
            this.fileManager.startFileWatching();
            console.log('File watching started');
        }
        catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }
}
// Start the server
const server = new WooCommerceMCPServer();
server.start().catch((error) => {
    console.error('Server startup failed:', error);
    process.exit(1);
});
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('Shutting down server...');
    process.exit(0);
});
//# sourceMappingURL=index.js.map