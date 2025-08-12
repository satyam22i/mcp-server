import { GoogleGenerativeAI } from '@google/generative-ai';
export class AIService {
    genAI;
    jsonModel;
    plainTextModel;
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        // Basic model config — JSON-capable model
        this.jsonModel = this.genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
        });
        this.plainTextModel = this.genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
        });
    }
    safeJsonParse(text) {
        try {
            return JSON.parse(text);
        }
        catch {
            throw new Error(`Invalid JSON from AI: ${text}`);
        }
    }
    // Heuristic fallback when AI is unavailable or returns invalid JSON
    parseCommandHeuristically(command) {
        const normalized = command.toLowerCase();
        const isComplete = /(mark|set|change).*(as\s+)?(complete|completed|done)/.test(normalized) || /complete\s+order/.test(normalized);
        const isCancel = /(cancel|void|reject)/.test(normalized);
        const isRefund = /(refund|refunded)/.test(normalized);
        if (isComplete) {
            return {
                message: 'Marking the order as completed (heuristic fallback).',
                action: 'complete_order',
                data: { status: 'completed' },
                success: true,
            };
        }
        if (isCancel) {
            return {
                message: 'Cancelling the order (heuristic fallback).',
                action: 'update_status',
                data: { status: 'cancelled' },
                success: true,
            };
        }
        if (isRefund) {
            return {
                message: 'Refunding the order (heuristic fallback).',
                action: 'update_status',
                data: { status: 'refunded' },
                success: true,
            };
        }
        return {
            message: 'No actionable intent detected (heuristic fallback).',
            action: 'inform',
            success: true,
        };
    }
    async processOrderCommand(command, orderData) {
        try {
            const prompt = `
        You are an AI assistant for a WooCommerce store.
        Analyze the order command and return ONLY a JSON object:
        {
          "message": "Human-readable explanation",
          "action": "complete_order" | "cancel_order" | "update_status" | "inform" | "error",
          "data": { "status": "<order-status>" },
          "success": true | false
        }
        Command: ${command}
        ${orderData ? `Order Data: ${JSON.stringify(orderData, null, 2)}` : ''}
      `.trim();
            const result = await this.jsonModel.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0 },
            });
            // Try strict JSON parsing
            const jsonText = result.response.text();
            try {
                return this.safeJsonParse(jsonText);
            }
            catch {
                // Fall back to deterministic parser
                return this.parseCommandHeuristically(command);
            }
        }
        catch (error) {
            console.error('AI processing error:', error);
            // Fall back to deterministic parser on any AI error
            return this.parseCommandHeuristically(command);
        }
    }
    async generateContent(contentType, context) {
        try {
            const prompt = `
        Generate a ${contentType} for a WooCommerce website.
        Context: ${context}
        Output should be professional, engaging, SEO-friendly.
        Do NOT wrap the text in markdown or formatting.
      `.trim();
            const result = await this.plainTextModel.generateContent(prompt);
            return result.response.text();
        }
        catch (error) {
            console.error('Failed to generate content:', error);
            throw new Error('The AI failed to generate the content.', { cause: error });
        }
    }
    async analyzeFileChanges(changes) {
        try {
            const prompt = `
        You are a WordPress security expert.
        Analyze these file changes and return ONLY a JSON object:
        {
          "message": "Summary of findings",
          "action": "monitor" | "revert" | "investigate" | "error",
          "data": { "securityRisk": "low|medium|high", "details": "..." },
          "success": true
        }
        File Changes: ${JSON.stringify(changes, null, 2)}
      `.trim();
            const result = await this.jsonModel.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0 },
            });
            const jsonText = result.response.text();
            try {
                return this.safeJsonParse(jsonText);
            }
            catch {
                return {
                    message: 'Analysis completed (fallback, non-JSON response).',
                    action: 'monitor',
                    success: true,
                };
            }
        }
        catch (error) {
            console.error('AI analysis error:', error);
            return {
                message: 'An error occurred during file change analysis (fallback used).',
                action: 'monitor',
                success: true,
            };
        }
    }
    async generateAutomatedResponse(context, type) {
        try {
            const prompt = `
        Generate a professional, friendly, helpful automated response
        for a ${type} interaction in a WooCommerce store.
        Context: ${context}
        Keep it concise and specific to the case.
      `.trim();
            const result = await this.plainTextModel.generateContent(prompt);
            return result.response.text();
        }
        catch (error) {
            console.error('Failed to generate automated response:', error);
            // Provide a safe fallback response
            return 'Thank you for your message. We have received your request and will update you shortly.';
        }
    }
}
//# sourceMappingURL=ai.js.map