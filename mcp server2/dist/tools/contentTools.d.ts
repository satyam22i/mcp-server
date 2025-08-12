import { MCPTool } from '../types/index.js';
import { WordPressService } from '../services/wordpress.js';
import { AIService } from '../services/ai.js';
export declare class ContentTools {
    private wordpressService;
    private aiService;
    constructor(wordpressService: WordPressService, aiService: AIService);
    getTools(): MCPTool[];
    private createPost;
    private updatePost;
    private generateContent;
    private generateAutomatedResponse;
    private getSiteInfo;
}
//# sourceMappingURL=contentTools.d.ts.map