import crypto from 'crypto';
import { WordPressConfig } from '../types/index.js';
import { WordPressService } from './wordpress.js';

export interface Session {
  token: string;
  config: WordPressConfig;
  service: WordPressService;
  createdAt: Date;
}

export class SessionManager {
  private tokenToSession: Map<string, Session> = new Map();

  createSession(config: WordPressConfig): Session {
    const token = crypto.randomBytes(16).toString('hex');
    const service = new WordPressService(config);
    const session: Session = { token, config, service, createdAt: new Date() };
    this.tokenToSession.set(token, session);
    return session;
  }

  getSession(token?: string | null): Session | undefined {
    if (!token) return undefined;
    return this.tokenToSession.get(token);
  }

  getService(token?: string | null): WordPressService | undefined {
    const session = this.getSession(token || undefined);
    return session?.service;
  }

  deleteSession(token: string): boolean {
    return this.tokenToSession.delete(token);
  }

  count(): number {
    return this.tokenToSession.size;
  }
}


