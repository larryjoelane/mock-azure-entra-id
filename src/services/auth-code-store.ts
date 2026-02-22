import { randomUUID } from "crypto";

export interface AuthCodeEntry {
  code: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  nonce: string;
  state: string;
  scope: string;
  userId: string;
  createdAt: number;
}

const CODE_LIFETIME_MS = 60_000; // 60 seconds

export class AuthCodeStore {
  private codes = new Map<string, AuthCodeEntry>();

  generateCode(): string {
    return randomUUID();
  }

  save(entry: AuthCodeEntry): void {
    this.codes.set(entry.code, entry);
  }

  consume(code: string): AuthCodeEntry | undefined {
    const entry = this.codes.get(code);
    if (!entry) return undefined;

    this.codes.delete(code);

    if (Date.now() - entry.createdAt > CODE_LIFETIME_MS) {
      return undefined;
    }

    return entry;
  }
}
