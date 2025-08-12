export class FileTools {
    fileManager;
    aiService;
    constructor(fileManager, aiService) {
        this.fileManager = fileManager;
        this.aiService = aiService;
    }
    getTools() {
        return [
            this.readFile(),
            this.writeFile(),
            this.editFile(),
            this.deleteFile(),
            this.backupFile(),
            this.listFiles(),
            this.searchInFiles(),
            this.startFileWatching(),
            this.analyzeFileChanges(),
        ];
    }
    readFile() {
        return {
            name: 'read_file',
            description: 'Read the contents of a WordPress file',
            inputSchema: {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'Path relative to WordPress root' },
                },
                required: ['filePath'],
            },
            handler: async (args) => {
                try {
                    const content = await this.fileManager.readFile(args.filePath);
                    return { success: true, content, filePath: args.filePath, message: `File ${args.filePath} read successfully` };
                }
                catch (error) {
                    return { success: false, message: `Failed to read file ${args.filePath}` };
                }
            },
        };
    }
    writeFile() {
        return {
            name: 'write_file',
            description: 'Write content to a WordPress file',
            inputSchema: {
                type: 'object',
                properties: {
                    filePath: { type: 'string' },
                    content: { type: 'string' },
                },
                required: ['filePath', 'content'],
            },
            handler: async (args) => {
                try {
                    await this.fileManager.writeFile(args.filePath, args.content);
                    return { success: true, filePath: args.filePath, message: `File ${args.filePath} written successfully` };
                }
                catch (error) {
                    return { success: false, message: `Failed to write file ${args.filePath}` };
                }
            },
        };
    }
    editFile() {
        return {
            name: 'edit_file',
            description: 'Edit specific parts of a WordPress file',
            inputSchema: {
                type: 'object',
                properties: {
                    filePath: { type: 'string' },
                    edits: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                line: { type: 'number' },
                                content: { type: 'string' },
                                type: { type: 'string', enum: ['replace', 'insert', 'append'] },
                            },
                            required: ['content', 'type'],
                        },
                    },
                },
                required: ['filePath', 'edits'],
            },
            handler: async (args) => {
                try {
                    await this.fileManager.editFile(args.filePath, args.edits);
                    return { success: true, filePath: args.filePath, editsApplied: args.edits.length, message: `File ${args.filePath} edited successfully` };
                }
                catch (error) {
                    return { success: false, message: `Failed to edit file ${args.filePath}` };
                }
            },
        };
    }
    deleteFile() {
        return {
            name: 'delete_file',
            description: 'Delete a WordPress file',
            inputSchema: {
                type: 'object',
                properties: { filePath: { type: 'string' } },
                required: ['filePath'],
            },
            handler: async (args) => {
                try {
                    await this.fileManager.deleteFile(args.filePath);
                    return { success: true, filePath: args.filePath, message: `File ${args.filePath} deleted successfully` };
                }
                catch (error) {
                    return { success: false, message: `Failed to delete file ${args.filePath}` };
                }
            },
        };
    }
    backupFile() {
        return {
            name: 'backup_file',
            description: 'Create a backup of a WordPress file',
            inputSchema: {
                type: 'object',
                properties: { filePath: { type: 'string' } },
                required: ['filePath'],
            },
            handler: async (args) => {
                try {
                    const backupPath = await this.fileManager.backupFile(args.filePath);
                    return { success: true, originalFile: args.filePath, backupPath, message: `Backed up to ${backupPath}` };
                }
                catch (error) {
                    return { success: false, message: `Failed to backup file ${args.filePath}` };
                }
            },
        };
    }
    listFiles() {
        return {
            name: 'list_files',
            description: 'List files in a WordPress directory',
            inputSchema: {
                type: 'object',
                properties: { directory: { type: 'string' }, pattern: { type: 'string' } },
            },
            handler: async (args) => {
                try {
                    const files = await this.fileManager.listFiles(args.directory || '', args.pattern);
                    return { success: true, files, count: files.length, directory: args.directory || 'root' };
                }
                catch (error) {
                    return { success: false, message: 'Failed to list files' };
                }
            },
        };
    }
    searchInFiles() {
        return {
            name: 'search_in_files',
            description: 'Search for text in WordPress files',
            inputSchema: {
                type: 'object',
                properties: {
                    searchTerm: { type: 'string' },
                    filePattern: { type: 'string' },
                },
                required: ['searchTerm'],
            },
            handler: async (args) => {
                try {
                    const results = await this.fileManager.searchInFiles(args.searchTerm, args.filePattern);
                    return { success: true, results, count: results.length };
                }
                catch (error) {
                    return { success: false, message: 'Failed to search in files' };
                }
            },
        };
    }
    startFileWatching() {
        return {
            name: 'start_file_watching',
            description: 'Start monitoring WordPress files for changes',
            inputSchema: {
                type: 'object',
                properties: { patterns: { type: 'array', items: { type: 'string' } } },
            },
            handler: async (args) => {
                try {
                    this.fileManager.startFileWatching(args.patterns);
                    return { success: true, patterns: args.patterns || ['**/*.php', '**/*.js', '**/*.css'] };
                }
                catch (error) {
                    return { success: false, message: 'Failed to start file watching' };
                }
            },
        };
    }
    analyzeFileChanges() {
        return {
            name: 'analyze_file_changes',
            description: 'Analyze file changes using AI for security and performance insights',
            inputSchema: {
                type: 'object',
                properties: {
                    changes: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: { path: { type: 'string' }, type: { type: 'string' }, content: { type: 'string' } },
                        },
                    },
                },
                required: ['changes'],
            },
            handler: async (args) => {
                try {
                    const analysis = await this.aiService.analyzeFileChanges(args.changes);
                    return { success: true, analysis, changesCount: args.changes.length };
                }
                catch (error) {
                    return { success: false, message: 'Failed to analyze file changes' };
                }
            },
        };
    }
}
//# sourceMappingURL=fileTools.js.map