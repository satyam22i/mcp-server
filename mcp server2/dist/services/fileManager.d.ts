import fs from 'fs-extra';
import { FileChange } from '../types/index.js';
export declare class FileManager {
    private wordpressRoot;
    private backupDir;
    private watcher;
    private changeCallbacks;
    constructor(wordpressRoot: string, backupDir?: string);
    private ensureBackupDir;
    readFile(filePath: string): Promise<string>;
    writeFile(filePath: string, content: string): Promise<void>;
    editFile(filePath: string, edits: {
        line?: number;
        content: string;
        type: 'replace' | 'insert' | 'append';
    }[]): Promise<void>;
    deleteFile(filePath: string): Promise<void>;
    backupFile(filePath: string): Promise<string>;
    listFiles(directory?: string, pattern?: string): Promise<string[]>;
    searchInFiles(searchTerm: string, filePattern?: string): Promise<Array<{
        file: string;
        line: number;
        content: string;
    }>>;
    startFileWatching(patterns?: string[]): void;
    private handleFileChange;
    onFileChange(callback: (change: FileChange) => void): void;
    stopFileWatching(): void;
    getFileStats(filePath: string): Promise<fs.Stats>;
}
//# sourceMappingURL=fileManager.d.ts.map