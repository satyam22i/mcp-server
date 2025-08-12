export class ContentTools {
    wordpressService;
    aiService;
    constructor(wordpressService, aiService) {
        this.wordpressService = wordpressService;
        this.aiService = aiService;
    }
    getTools() {
        return [
            this.createPost(),
            this.updatePost(),
            this.generateContent(),
            this.generateAutomatedResponse(),
            this.getSiteInfo()
        ];
    }
    createPost() {
        return {
            name: 'create_post',
            description: 'Create a new WordPress post',
            inputSchema: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        description: 'Post title'
                    },
                    content: {
                        type: 'string',
                        description: 'Post content (HTML or plain text)'
                    },
                    status: {
                        type: 'string',
                        enum: ['draft', 'publish', 'private'],
                        description: 'Post status (default: draft)'
                    }
                },
                required: ['title', 'content']
            },
            handler: async (args) => {
                try {
                    const post = await this.wordpressService.createPost(args.title, args.content, args.status || 'draft');
                    return {
                        success: true,
                        post,
                        message: `Post "${args.title}" created successfully with status: ${args.status || 'draft'}`
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        message: `Failed to create post "${args.title}"`
                    };
                }
            }
        };
    }
    updatePost() {
        return {
            name: 'update_post',
            description: 'Update an existing WordPress post',
            inputSchema: {
                type: 'object',
                properties: {
                    postId: {
                        type: 'number',
                        description: 'Post ID to update'
                    },
                    title: {
                        type: 'string',
                        description: 'New post title'
                    },
                    content: {
                        type: 'string',
                        description: 'New post content'
                    },
                    status: {
                        type: 'string',
                        enum: ['draft', 'publish', 'private'],
                        description: 'New post status'
                    }
                },
                required: ['postId']
            },
            handler: async (args) => {
                try {
                    const updateData = {};
                    if (args.title)
                        updateData.title = args.title;
                    if (args.content)
                        updateData.content = args.content;
                    if (args.status)
                        updateData.status = args.status;
                    const post = await this.wordpressService.updatePost(args.postId, updateData);
                    return {
                        success: true,
                        post,
                        message: `Post ${args.postId} updated successfully`
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        message: `Failed to update post ${args.postId}`
                    };
                }
            }
        };
    }
    generateContent() {
        return {
            name: 'generate_content',
            description: 'Generate content for WordPress using AI',
            inputSchema: {
                type: 'object',
                properties: {
                    contentType: {
                        type: 'string',
                        description: 'Type of content to generate (e.g., "blog post", "product description", "meta description")'
                    },
                    context: {
                        type: 'string',
                        description: 'Context or topic for the content'
                    }
                },
                required: ['contentType', 'context']
            },
            handler: async (args) => {
                try {
                    const content = await this.aiService.generateContent(args.contentType, args.context);
                    return {
                        success: true,
                        content,
                        contentType: args.contentType,
                        context: args.context,
                        message: `Generated ${args.contentType} content successfully`
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        message: `Failed to generate ${args.contentType} content`
                    };
                }
            }
        };
    }
    generateAutomatedResponse() {
        return {
            name: 'generate_automated_response',
            description: 'Generate automated responses for customer interactions',
            inputSchema: {
                type: 'object',
                properties: {
                    context: {
                        type: 'string',
                        description: 'Context of the customer interaction'
                    },
                    type: {
                        type: 'string',
                        enum: ['order', 'customer', 'support'],
                        description: 'Type of interaction'
                    }
                },
                required: ['context', 'type']
            },
            handler: async (args) => {
                try {
                    const response = await this.aiService.generateAutomatedResponse(args.context, args.type);
                    return {
                        success: true,
                        response,
                        context: args.context,
                        type: args.type,
                        message: `Generated automated ${args.type} response successfully`
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        message: `Failed to generate automated ${args.type} response`
                    };
                }
            }
        };
    }
    getSiteInfo() {
        return {
            name: 'get_site_info',
            description: 'Get information about the WordPress site',
            inputSchema: {
                type: 'object',
                properties: {}
            },
            handler: async () => {
                try {
                    const siteInfo = await this.wordpressService.getSiteInfo();
                    return {
                        success: true,
                        siteInfo,
                        message: 'Site information retrieved successfully'
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        message: 'Failed to get site information'
                    };
                }
            }
        };
    }
}
//# sourceMappingURL=contentTools.js.map