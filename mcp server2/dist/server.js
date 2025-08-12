import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Import services
import { WordPressService } from './services/wordpress.js';
import { AIService } from './services/ai.js';
import { FileManager } from './services/fileManager.js';
import { SessionManager } from './services/session.js';
import { OAUTH_CONFIG } from './config/oauth.js';
// Import tools
import { OrderTools } from './tools/orderTools.js';
import { FileTools } from './tools/fileTools.js';
import { ContentTools } from './tools/contentTools.js';
// Load environment variables
dotenv.config();
class WooCommerceServer {
    app;
    wordpressService;
    aiService;
    fileManager;
    orderTools;
    fileTools;
    contentTools;
    sessions;
    constructor() {
        this.app = express();
        // Initialize services
        this.initializeServices();
        // Initialize tools
        this.initializeTools();
        // Set up middleware
        this.setupMiddleware();
        // Set up routes
        this.setupRoutes();
    }
    initializeServices() {
        // WordPress configuration
        const wordpressConfig = {
            url: process.env.WORDPRESS_URL || "wordpress.com",
            username: process.env.WORDPRESS_USERNAME || "username",
            password: process.env.WORDPRESS_PASSWORD || 'your_application_password',
            consumerKey: process.env.WORDPRESS_CONSUMER_KEY || 'your_woocommerce_consumer_key',
            consumerSecret: process.env.WORDPRESS_CONSUMER_SECRET || 'your_woocommerce_consumer_secret'
        };
        // Initialize services
        this.wordpressService = new WordPressService(wordpressConfig);
        this.aiService = new AIService(process.env.GEMINI_API_KEY || 'AIzaSyDVvt0D-p4b9lKNF0z-t1ns64CqQNPpFE8');
        this.fileManager = new FileManager(process.env.WORDPRESS_ROOT_PATH || './wordpress', process.env.BACKUP_DIRECTORY || './backups');
        this.sessions = new SessionManager();
        console.log('Services initialized successfully');
    }
    initializeTools() {
        // Initialize tool classes
        this.orderTools = new OrderTools(this.wordpressService, this.aiService);
        this.fileTools = new FileTools(this.fileManager, this.aiService);
        this.contentTools = new ContentTools(this.wordpressService, this.aiService);
        console.log('Tools initialized successfully');
    }
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        // Serve frontend if present
        this.app.use(express.static('public'));
    }
    setupRoutes() {
        const requireAuth = (req, res, next) => {
            const authHeader = req.headers.authorization;
            const token = authHeader?.startsWith('Bearer ')
                ? authHeader.substring('Bearer '.length)
                : undefined;
            const session = this.sessions.getSession(token);
            if (!session) {
                return res.status(401).json({ success: false, error: 'Unauthorized. Please login via /auth/login' });
            }
            // attach service to request
            req.wpService = session.service;
            next();
        };
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ status: 'ok', message: 'WooCommerce MCP Server is running' });
        });
        // OAuth: start
        this.app.get('/oauth/login', (req, res) => {
            const params = new URLSearchParams({
                response_type: 'code',
                client_id: OAUTH_CONFIG.clientId,
                redirect_uri: OAUTH_CONFIG.redirectUri,
                scope: OAUTH_CONFIG.scope,
            });
            res.redirect(`${OAUTH_CONFIG.authorizeEndpoint}?${params.toString()}`);
        });
        // OAuth: callback
        this.app.get('/oauth/callback', async (req, res) => {
            try {
                const code = String(req.query.code || '');
                if (!code)
                    return res.status(400).send('Missing code');
                const tokenRes = await fetch(OAUTH_CONFIG.tokenEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        grant_type: 'authorization_code',
                        code,
                        redirect_uri: OAUTH_CONFIG.redirectUri,
                        client_id: OAUTH_CONFIG.clientId,
                        client_secret: OAUTH_CONFIG.clientSecret,
                    }),
                });
                const tokenJson = await tokenRes.json();
                if (!tokenRes.ok)
                    throw new Error(tokenJson.error_description || 'OAuth token exchange failed');
                const accessToken = tokenJson.access_token;
                // fetch userinfo to validate and get site url if needed
                const userinfoRes = await fetch(OAUTH_CONFIG.userinfoEndpoint, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                await userinfoRes.json().catch(() => ({}));
                const session = this.sessions.createSession({
                    url: OAUTH_CONFIG.baseUrl,
                    username: '',
                    password: '',
                    consumerKey: '',
                    consumerSecret: '',
                    accessToken,
                });
                // Redirect to app with token in hash (never logs to server)
                res.redirect(`/?token=${session.token}`);
            }
            catch (e) {
                res.status(500).send('OAuth error');
            }
        });
        // Auth endpoints (WordPress credentials sent directly)
        this.app.post('/auth/login', async (req, res) => {
            const { url, username, password, consumerKey, consumerSecret } = req.body || {};
            if (!url || !username || !password) {
                return res.status(400).json({ success: false, error: 'url, username, password are required' });
            }
            try {
                const config = {
                    url,
                    username,
                    password,
                    consumerKey: consumerKey || '',
                    consumerSecret: consumerSecret || ''
                };
                const session = this.sessions.createSession(config);
                // Validate by fetching site info
                await session.service.getSiteInfo();
                res.json({ success: true, token: session.token });
            }
            catch (error) {
                res.status(401).json({ success: false, error: error instanceof Error ? error.message : 'Login failed' });
            }
        });
        this.app.post('/auth/logout', (req, res) => {
            const authHeader = req.headers.authorization;
            const token = authHeader?.startsWith('Bearer ') ? authHeader.substring('Bearer '.length) : undefined;
            if (!token)
                return res.json({ success: true });
            this.sessions.deleteSession(token);
            res.json({ success: true });
        });
        // List all available tools
        this.app.get('/tools', (req, res) => {
            const allTools = [
                ...this.orderTools.getTools(),
                ...this.fileTools.getTools(),
                ...this.contentTools.getTools()
            ];
            res.json({
                tools: allTools.map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema,
                }))
            });
        });
        // Execute a tool
        this.app.post('/execute/:toolName', requireAuth, async (req, res) => {
            const { toolName } = req.params;
            const args = req.body;
            try {
                // Build a fresh toolset using the authenticated WordPress service
                const wpService = req.wpService || this.wordpressService;
                const orderTools = new OrderTools(wpService, this.aiService);
                const fileTools = new FileTools(this.fileManager, this.aiService);
                const contentTools = new ContentTools(wpService, this.aiService);
                const allTools = [...orderTools.getTools(), ...fileTools.getTools(), ...contentTools.getTools()];
                const tool = allTools.find(t => t.name === toolName);
                if (!tool) {
                    return res.status(404).json({
                        success: false,
                        error: `Tool '${toolName}' not found`
                    });
                }
                // Execute the tool
                const result = await tool.handler(args);
                res.json(result);
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    message: `Failed to execute tool '${toolName}'`
                });
            }
        });
        // Order management routes
        this.app.get('/orders/:orderId', requireAuth, async (req, res) => {
            try {
                const wpService = req.wpService || this.wordpressService;
                const orderTools = new OrderTools(wpService, this.aiService);
                const result = await orderTools.getTools()[0].handler({ orderId: req.params.orderId });
                res.json(result);
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        this.app.post('/orders/:orderId/complete', requireAuth, async (req, res) => {
            try {
                const wpService = req.wpService || this.wordpressService;
                const orderTools = new OrderTools(wpService, this.aiService);
                const result = await orderTools.getTools()[1].handler({
                    orderId: req.params.orderId,
                    note: req.body.note
                });
                res.json(result);
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        // File management routes
        this.app.get('/files/:filePath(*)', requireAuth, async (req, res) => {
            try {
                const fileTools = new FileTools(this.fileManager, this.aiService);
                const result = await fileTools.getTools()[0].handler({ filePath: req.params.filePath });
                res.json(result);
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        this.app.post('/files/:filePath(*)', requireAuth, async (req, res) => {
            try {
                const fileTools = new FileTools(this.fileManager, this.aiService);
                const result = await fileTools.getTools()[1].handler({
                    filePath: req.params.filePath,
                    content: req.body.content
                });
                res.json(result);
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        // AI-powered order command processing
        this.app.post('/process-command', requireAuth, async (req, res) => {
            try {
                const wpService = req.wpService || this.wordpressService;
                const orderTools = new OrderTools(wpService, this.aiService);
                const result = await orderTools.getTools()[4].handler({ command: req.body.command });
                res.json(result);
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        // Content generation
        this.app.post('/generate-content', requireAuth, async (req, res) => {
            try {
                const wpService = req.wpService || this.wordpressService;
                const contentTools = new ContentTools(wpService, this.aiService);
                const result = await contentTools.getTools()[2].handler({
                    contentType: req.body.contentType,
                    context: req.body.context
                });
                res.json(result);
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        // Set up file change monitoring
        this.fileManager.onFileChange((change) => {
            console.log(`File change detected: ${change.path} (${change.type})`);
            // You can add additional logic here to handle file changes
            // For example, automatically analyze changes or trigger backups
        });
        console.log('Routes set up successfully');
        // SPA fallback
        this.app.get('*', (req, res) => {
            res.sendFile('index.html', { root: 'public' });
        });
    }
    async start() {
        const port = process.env.MCP_SERVER_PORT || 3000;
        const host = process.env.MCP_SERVER_HOST || 'localhost';
        try {
            this.app.listen(port, () => {
                console.log(`WooCommerce MCP Server started successfully`);
                console.log(`Server running at http://${host}:${port}`);
                console.log(`Health check: http://${host}:${port}/health`);
                console.log(`Available tools: http://${host}:${port}/tools`);
                // Start file watching by default
                this.fileManager.startFileWatching();
                console.log('File watching started');
            });
        }
        catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }
}
// Start the server
const server = new WooCommerceServer();
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
//# sourceMappingURL=server.js.map