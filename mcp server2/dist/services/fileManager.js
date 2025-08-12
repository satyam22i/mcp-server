import fs from 'fs-extra';
import path from 'path';
import chokidar from 'chokidar';
export class FileManager {
    wordpressRoot;
    backupDir;
    watcher = null;
    changeCallbacks = [];
    constructor(wordpressRoot, backupDir = './backups') {
        this.wordpressRoot = wordpressRoot;
        this.backupDir = backupDir;
        this.ensureBackupDir();
    }
    ensureBackupDir() {
        fs.ensureDirSync(this.backupDir);
    }
    async readFile(filePath) {
        try {
            const fullPath = path.resolve(this.wordpressRoot, filePath);
            const content = await fs.readFile(fullPath, 'utf-8');
            return content;
        }
        catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error}`);
        }
    }
    async writeFile(filePath, content) {
        try {
            const fullPath = path.resolve(this.wordpressRoot, filePath);
            await fs.ensureDir(path.dirname(fullPath));
            await fs.writeFile(fullPath, content, 'utf-8');
        }
        catch (error) {
            throw new Error(`Failed to write file ${filePath}: ${error}`);
        }
    }
    async editFile(filePath, edits) {
        try {
            const currentContent = await this.readFile(filePath);
            let newContent = currentContent;
            for (const edit of edits) {
                if (edit.type === 'replace' && edit.line) {
                    const lines = newContent.split('\n');
                    if (edit.line <= lines.length) {
                        lines[edit.line - 1] = edit.content;
                        newContent = lines.join('\n');
                    }
                }
                else if (edit.type === 'insert' && edit.line) {
                    const lines = newContent.split('\n');
                    lines.splice(edit.line - 1, 0, edit.content);
                    newContent = lines.join('\n');
                }
                else if (edit.type === 'append') {
                    newContent += '\n' + edit.content;
                }
            }
            await this.writeFile(filePath, newContent);
        }
        catch (error) {
            throw new Error(`Failed to edit file ${filePath}: ${error}`);
        }
    }
    async deleteFile(filePath) {
        try {
            const fullPath = path.resolve(this.wordpressRoot, filePath);
            await fs.remove(fullPath);
        }
        catch (error) {
            throw new Error(`Failed to delete file ${filePath}: ${error}`);
        }
    }
    async backupFile(filePath) {
        try {
            const content = await this.readFile(filePath);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = `${path.basename(filePath)}.backup.${timestamp}`;
            const backupPath = path.join(this.backupDir, backupFileName);
            await fs.writeFile(backupPath, content, 'utf-8');
            return backupPath;
        }
        catch (error) {
            throw new Error(`Failed to backup file ${filePath}: ${error}`);
        }
    }
    async listFiles(directory = '', pattern) {
        try {
            const fullPath = path.resolve(this.wordpressRoot, directory);
            const files = await fs.readdir(fullPath, { withFileTypes: true });
            let fileList = [];
            for (const file of files) {
                const relativePath = path.join(directory, file.name);
                if (file.isDirectory()) {
                    const subFiles = await this.listFiles(relativePath, pattern);
                    fileList.push(...subFiles);
                }
                else if (!pattern || file.name.match(pattern)) {
                    fileList.push(relativePath);
                }
            }
            return fileList;
        }
        catch (error) {
            throw new Error(`Failed to list files in ${directory}: ${error}`);
        }
    }
    async searchInFiles(searchTerm, filePattern = '*.php') {
        try {
            const files = await this.listFiles('', filePattern);
            const results = [];
            for (const file of files) {
                try {
                    const content = await this.readFile(file);
                    const lines = content.split('\n');
                    lines.forEach((line, index) => {
                        if (line.toLowerCase().includes(searchTerm.toLowerCase())) {
                            results.push({
                                file,
                                line: index + 1,
                                content: line.trim()
                            });
                        }
                    });
                }
                catch (error) {
                    // Skip files that can't be read
                    console.warn(`Could not search in file ${file}: ${error}`);
                }
            }
            return results;
        }
        catch (error) {
            throw new Error(`Failed to search in files: ${error}`);
        }
    }
    startFileWatching(patterns = ['**/*.php', '**/*.js', '**/*.css']) {
        if (this.watcher) {
            this.watcher.close();
        }
        this.watcher = chokidar.watch(patterns, {
            cwd: this.wordpressRoot,
            ignored: /(^|[\/\\])\../, // Ignore hidden files
            persistent: true
        });
        this.watcher
            .on('add', (filePath) => this.handleFileChange(filePath, 'created'))
            .on('change', (filePath) => this.handleFileChange(filePath, 'modified'))
            .on('unlink', (filePath) => this.handleFileChange(filePath, 'deleted'));
    }
    async handleFileChange(filePath, type) {
        const change = {
            path: filePath,
            type,
            timestamp: new Date()
        };
        if (type !== 'deleted') {
            try {
                change.content = await this.readFile(filePath);
            }
            catch (error) {
                console.warn(`Could not read content of changed file ${filePath}: ${error}`);
            }
        }
        // Notify all registered callbacks
        this.changeCallbacks.forEach(callback => callback(change));
    }
    onFileChange(callback) {
        this.changeCallbacks.push(callback);
    }
    stopFileWatching() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
        }
    }
    async getFileStats(filePath) {
        try {
            const fullPath = path.resolve(this.wordpressRoot, filePath);
            return await fs.stat(fullPath);
        }
        catch (error) {
            throw new Error(`Failed to get file stats for ${filePath}: ${error}`);
        }
    }
}
//# sourceMappingURL=fileManager.js.map