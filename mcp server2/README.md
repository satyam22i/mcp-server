# WooCommerce MCP Server

A powerful HTTP-based server for managing WooCommerce WordPress websites with AI-powered automation, file management, and order processing capabilities. This server provides a RESTful API interface for managing your WordPress/WooCommerce site programmatically.

## Features

### 🛒 Order Management
- **Get Order Information**: Retrieve detailed order data
- **Complete Orders**: Mark orders as completed with notes
- **Update Order Status**: Change order status (pending, processing, completed, cancelled, etc.)
- **Search Orders**: Filter orders by status, customer, date range
- **AI-Powered Commands**: Process natural language commands like "#643645 mark this order as completed"

### 📁 File Management
- **Read/Write Files**: Access and modify WordPress files
- **File Editing**: Make specific line-by-line edits
- **File Backups**: Automatic backup creation before changes
- **File Monitoring**: Real-time file change detection
- **Search in Files**: Find specific text across files
- **AI Analysis**: Analyze file changes for security and performance

### 📝 Content Management
- **Create Posts**: Generate new WordPress posts
- **Update Posts**: Modify existing content
- **AI Content Generation**: Create blog posts, product descriptions, meta descriptions
- **Automated Responses**: Generate customer service responses

### 🤖 AI Integration
- **Google Gemini AI**: Powered by Google's latest AI model
- **Smart Order Processing**: Understand natural language commands
- **Content Generation**: Create engaging, SEO-friendly content
- **File Analysis**: Security and performance insights
- **Automated Responses**: Professional customer interactions

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd woocommerce-mcp-server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # WordPress/WooCommerce Configuration
   WORDPRESS_URL=https://your-wordpress-site.com
   WORDPRESS_USERNAME=your_username
   WORDPRESS_PASSWORD=your_application_password
   WORDPRESS_CONSUMER_KEY=your_woocommerce_consumer_key
   WORDPRESS_CONSUMER_SECRET=your_woocommerce_consumer_secret

   # AI Configuration
   GEMINI_API_KEY=AIzaS********-***********************  /// intergrate your API

   # File System Configuration
   WORDPRESS_ROOT_PATH=/path/to/your/wordpress/installation
   BACKUP_DIRECTORY=./backups
   ```

4. **Build the project**:
   ```bash
   npm run build
   ```

5. **Start the server**:
   ```bash
   npm start
   ```
   
   The server will start on `http://localhost:3000` by default.

## WordPress Setup

### 1. Application Passwords
Create an application password for API access:
1. Go to WordPress Admin → Users → Profile
2. Scroll to "Application Passwords"
3. Add a new application password
4. Use this password in your `.env` file

### 2. WooCommerce REST API
Enable WooCommerce REST API:
1. Go to WooCommerce → Settings → Advanced → REST API
2. Add a new key with read/write permissions
3. Use the Consumer Key and Consumer Secret in your `.env` file

### 3. File Permissions
Ensure the server has read/write access to your WordPress files:
```bash
chmod -R 755 /path/to/your/wordpress
chown -R www-data:www-data /path/to/your/wordpress
```

## API Endpoints

### Health Check
- `GET /health` - Check if the server is running
- `POST /auth/login` - Login with WordPress credentials (returns Bearer token)
- `POST /auth/logout` - Invalidate current session

### Tools
- `GET /tools` - List all available tools
- `POST /execute/:toolName` - Execute a specific tool (requires Authorization: Bearer <token>)

### Order Management
- `GET /orders/:orderId` - Get order information
- `POST /orders/:orderId/complete` - Complete an order
- `POST /process-command` - Process natural language commands (requires Authorization)

### File Management
- `GET /files/:filePath` - Read a file
- `POST /files/:filePath` - Write to a file

### Content Management
- `POST /generate-content` - Generate content with AI

## Frontend Console

After starting the server, open `http://localhost:3000/` to access a modern web UI:

1. Login using your WordPress URL, username and application password (no .env needed)
2. Use the AI Command Console to run natural-language actions (e.g., `#87 mark this order as refunded`)
3. Manage orders and generate content
4. Publish generated content as a WordPress post


## Usage Examples

### Order Management

**Get order information**:
```bash
curl -X GET http://localhost:3000/orders/643645
```

**Complete an order**:
```bash
curl -X POST http://localhost:3000/orders/643645/complete \
  -H "Content-Type: application/json" \
  -d '{"note": "Order shipped and delivered successfully"}'
```

**Process natural language command**:
```bash
curl -X POST http://localhost:3000/process-command \
  -H "Content-Type: application/json" \
  -d '{"command": "#643645 mark this order as completed"}'
```

### File Management

**Read a file**:
```bash
curl -X GET http://localhost:3000/files/wp-config.php
```

**Write to a file**:
```bash
curl -X POST http://localhost:3000/files/test-file.txt \
  -H "Content-Type: application/json" \
  -d '{"content": "This is a test file"}'
```

**Search in files** (using tool execution):
```bash
curl -X POST http://localhost:3000/execute/search_in_files \
  -H "Content-Type: application/json" \
  -d '{"searchTerm": "woocommerce", "filePattern": "*.php"}'
```

### Content Management

**Create a post** (using tool execution):
```bash
curl -X POST http://localhost:3000/execute/create_post \
  -H "Content-Type: application/json" \
  -d '{"title": "New Product Launch", "content": "We are excited to announce our latest product...", "status": "draft"}'
```

**Generate content with AI**:
```bash
curl -X POST http://localhost:3000/generate-content \
  -H "Content-Type: application/json" \
  -d '{"contentType": "product description", "context": "Premium wireless headphones with noise cancellation"}'
```

## Available Tools

### Order Tools
- `get_order_info` - Get detailed order information
- `complete_order` - Mark order as completed
- `update_order_status` - Change order status
- `search_orders` - Search and filter orders
- `process_order_command` - Process natural language commands

### File Tools
- `read_file` - Read file contents
- `write_file` - Write content to file
- `edit_file` - Make specific edits to file
- `delete_file` - Delete a file
- `backup_file` - Create file backup
- `list_files` - List files in directory
- `search_in_files` - Search for text in files
- `start_file_watching` - Monitor file changes
- `analyze_file_changes` - AI analysis of changes

### Content Tools
- `create_post` - Create new WordPress post
- `update_post` - Update existing post
- `generate_content` - Generate content with AI
- `generate_automated_response` - Create customer responses
- `get_site_info` - Get WordPress site information

## Security Considerations

1. **API Keys**: Keep your API keys secure and never commit them to version control
2. **File Permissions**: Use appropriate file permissions for your WordPress installation
3. **Backup Strategy**: Always backup files before making changes
4. **Access Control**: Limit server access to authorized users only
5. **Monitoring**: Monitor file changes and API usage

## Troubleshooting

### Common Issues

1. **Connection Errors**:
   - Verify WordPress URL and credentials
   - Check if REST API is enabled
   - Ensure proper SSL certificates

2. **File Permission Errors**:
   - Check file ownership and permissions
   - Verify WordPress root path is correct
   - Ensure backup directory is writable

3. **AI Service Errors**:
   - Verify Gemini API key is valid
   - Check API quota and limits
   - Ensure internet connectivity

### Logs
Check the console output for detailed error messages and debugging information.

## Development

### Project Structure
```
src/
├── services/          # Core services
│   ├── wordpress.ts   # WordPress API integration
│   ├── ai.ts         # AI service integration
│   └── fileManager.ts # File management
├── tools/            # MCP tools
│   ├── orderTools.ts # Order management tools
│   ├── fileTools.ts  # File management tools
│   └── contentTools.ts # Content management tools
├── types/            # TypeScript type definitions
└── index.ts          # Main server entry point
```

### Adding New Tools
1. Create a new tool class in `src/tools/`
2. Implement the `MCPTool` interface
3. Register the tool in the main server
4. Add appropriate error handling and validation

### Testing
### Quick Test
Run the test script to verify the server is working:

```bash
# Start the server
npm start

# In another terminal, run the test script
node test-example.js
```

### Development Mode
```bash
# Run in development mode
npm run dev

# Watch for changes
npm run watch
```

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs for error details
3. Ensure all dependencies are properly installed
4. Verify your WordPress and WooCommerce configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Note**: This MCP server is designed for WooCommerce WordPress websites and requires proper configuration of WordPress REST API and WooCommerce settings for full functionality.
