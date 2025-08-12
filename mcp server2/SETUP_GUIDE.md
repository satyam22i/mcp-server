# WooCommerce MCP Server - Setup Guide

## 🚀 Quick Start

This guide will help you set up and run the WooCommerce MCP Server for your WordPress/WooCommerce website.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- WordPress website with WooCommerce installed
- Google Gemini API key (provided: `AIzaSyD-*******-*********`)

## Step 1: Installation

1. **Clone or download the project files**
2. **Install dependencies**:
   ```bash
   npm install
   ```

## Step 2: Configuration

1. **Copy the environment template**:
   ```bash
   cp env.example .env
   ```

2. **Edit the `.env` file** with your WordPress details:
   ```env
   # WordPress/WooCommerce Configuration
   WORDPRESS_URL=https://your-wordpress-site.com
   WORDPRESS_USERNAME=your_username
   WORDPRESS_PASSWORD=your_application_password
   WORDPRESS_CONSUMER_KEY=your_woocommerce_consumer_key
   WORDPRESS_CONSUMER_SECRET=your_woocommerce_consumer_secret

   # AI Configuration (already configured)
   GEMINI_API_KEY=AIzaSyDVvt0D-p4b9lKNF0z-t1ns64CqQNPpFE8

   # File System Configuration
   WORDPRESS_ROOT_PATH=/path/to/your/wordpress/installation
   BACKUP_DIRECTORY=./backups
   ```

## Step 3: WordPress Setup

### 3.1 Application Passwords
1. Go to WordPress Admin → Users → Profile
2. Scroll to "Application Passwords"
3. Add a new application password
4. Use this password in your `.env` file

### 3.2 WooCommerce REST API
1. Go to WooCommerce → Settings → Advanced → REST API
2. Add a new key with read/write permissions
3. Use the Consumer Key and Consumer Secret in your `.env` file

### 3.3 File Permissions
Ensure the server has read/write access to your WordPress files:
```bash
chmod -R 755 /path/to/your/wordpress
chown -R www-data:www-data /path/to/your/wordpress
```

## Step 4: Build and Run

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Verify it's running**:
   ```bash
   curl http://localhost:3000/health
   ```

## Step 5: Testing

Run the test script to verify everything is working:

```bash
node test-example.js
```

## 🎯 Key Features

### Order Management
- **Natural Language Commands**: Say "#643645 mark this order as completed"
- **Order Status Updates**: Complete, cancel, or update order status
- **Order Search**: Find orders by status, customer, or date range

### File Management
- **Read/Write Files**: Access and modify WordPress files
- **File Monitoring**: Real-time detection of file changes
- **Automatic Backups**: Backup files before making changes
- **Search in Files**: Find specific text across files

### AI-Powered Features
- **Content Generation**: Create blog posts, product descriptions
- **Smart Responses**: Generate customer service responses
- **File Analysis**: Security and performance insights
- **Order Processing**: Understand natural language commands

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Check server status |
| `/tools` | GET | List all available tools |
| `/orders/:id` | GET | Get order information |
| `/orders/:id/complete` | POST | Complete an order |
| `/process-command` | POST | Process natural language commands |
| `/files/:path` | GET | Read a file |
| `/files/:path` | POST | Write to a file |
| `/generate-content` | POST | Generate content with AI |

## 🔧 Example Usage

### Complete an Order
```bash
curl -X POST http://localhost:3000/orders/643645/complete \
  -H "Content-Type: application/json" \
  -d '{"note": "Order shipped successfully"}'
```

### Process Natural Language Command
```bash
curl -X POST http://localhost:3000/process-command \
  -H "Content-Type: application/json" \
  -d '{"command": "#643645 mark this order as completed"}'
```

### Generate Content
```bash
curl -X POST http://localhost:3000/generate-content \
  -H "Content-Type: application/json" \
  -d '{"contentType": "product description", "context": "Wireless headphones"}'
```

### Read a File
```bash
curl -X GET http://localhost:3000/files/wp-config.php
```

## 🛠️ Development

### Development Mode
```bash
npm run dev
```

### Watch Mode
```bash
npm run watch
```

## 🔒 Security Considerations

1. **API Keys**: Keep your API keys secure
2. **File Permissions**: Use appropriate file permissions
3. **Backup Strategy**: Always backup before changes
4. **Access Control**: Limit server access
5. **Monitoring**: Monitor file changes and API usage

## 🐛 Troubleshooting

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

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review the logs for error details
3. Ensure all dependencies are properly installed
4. Verify your WordPress and WooCommerce configuration

## 🎉 Success!

Your WooCommerce MCP Server is now running and ready to help you manage your WordPress/WooCommerce website with AI-powered automation!

---

**Note**: This server is designed for WooCommerce WordPress websites and requires proper configuration of WordPress REST API and WooCommerce settings for full functionality.
