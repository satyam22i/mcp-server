import { WordPressConfig } from '../types/index.js';
import { WordPressService } from './wordpress.js';
export interface Session {
    token: string;
    config: WordPressConfig;
    service: WordPressService;
    createdAt: Date;
}
export declare class SessionManager {
    private tokenToSession;
    createSession(config: WordPressConfig): Session;
    getSession(token?: string | null): Session | undefined;
    getService(token?: string | null): WordPressService | undefined;
    deleteSession(token: string): boolean;
    count(): number;
}
//# sourceMappingURL=session.d.ts.map