import { AIResponse } from '../types/index.js';
export declare class AIService {
    private genAI;
    private jsonModel;
    private plainTextModel;
    constructor(apiKey: string);
    private safeJsonParse;
    private parseCommandHeuristically;
    processOrderCommand(command: string, orderData?: Record<string, any>): Promise<AIResponse>;
    generateContent(contentType: string, context: string): Promise<string>;
    analyzeFileChanges(changes: {
        type: string;
        path: string;
    }[]): Promise<AIResponse>;
    generateAutomatedResponse(context: string, type: 'order' | 'customer' | 'support'): Promise<string>;
}
//# sourceMappingURL=ai.d.ts.map