import { MCPTool } from '../types/index.js';
import { FileManager } from '../services/fileManager.js';
import { AIService } from '../services/ai.js';
export declare class FileTools {
    private fileManager;
    private aiService;
    constructor(fileManager: FileManager, aiService: AIService);
    getTools(): MCPTool[];
    private readFile;
    private writeFile;
    private editFile;
    private deleteFile;
    private backupFile;
    private listFiles;
    private searchInFiles;
    private startFileWatching;
    private analyzeFileChanges;
}
//# sourceMappingURL=fileTools.d.ts.map