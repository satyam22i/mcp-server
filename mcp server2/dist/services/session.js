import crypto from 'crypto';
import { WordPressService } from './wordpress.js';
export class SessionManager {
    tokenToSession = new Map();
    createSession(config) {
        const token = crypto.randomBytes(16).toString('hex');
        const service = new WordPressService(config);
        const session = { token, config, service, createdAt: new Date() };
        this.tokenToSession.set(token, session);
        return session;
    }
    getSession(token) {
        if (!token)
            return undefined;
        return this.tokenToSession.get(token);
    }
    getService(token) {
        const session = this.getSession(token || undefined);
        return session?.service;
    }
    deleteSession(token) {
        return this.tokenToSession.delete(token);
    }
    count() {
        return this.tokenToSession.size;
    }
}
//# sourceMappingURL=session.js.map