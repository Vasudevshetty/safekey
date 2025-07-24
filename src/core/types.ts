export interface SecretEntry {
  key: string;
  value: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface VaultMetadata {
  version: string;
  createdAt: Date;
  updatedAt: Date;
  keyCount: number;
  salt: string;
}

export interface VaultData {
  metadata: VaultMetadata;
  secrets: Record<string, SecretEntry>;
}

export interface EncryptedVault {
  encrypted: string;
  iv: string;
  authTag: string;
  metadata: {
    version: string;
    createdAt: string;
    salt: string;
  };
}

export class VaultError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VaultError';
  }
}

export class VaultNotFoundError extends VaultError {
  constructor(path: string) {
    super(`Vault not found at ${path}`);
  }
}

export class InvalidKeyError extends VaultError {
  constructor() {
    super('Invalid encryption key or corrupted vault');
  }
}

export class SecretNotFoundError extends VaultError {
  constructor(key: string) {
    super(`Secret '${key}' not found`);
  }
}

export class SecretAlreadyExistsError extends VaultError {
  constructor(key: string) {
    super(`Secret '${key}' already exists`);
  }
}
