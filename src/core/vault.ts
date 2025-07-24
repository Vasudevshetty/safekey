import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import {
  VaultData,
  EncryptedVault,
  SecretEntry,
  VaultMetadata,
  VaultNotFoundError,
  InvalidKeyError,
  SecretNotFoundError,
  SecretAlreadyExistsError,
} from './types.js';
import {
  encrypt,
  decrypt,
  deriveKey,
  generateSalt,
  secureWipe,
  DecryptionInput,
} from '../crypto/aes.js';

export class Vault {
  private data: VaultData;
  private filePath: string;
  private masterKey: Buffer | null = null;

  constructor(filePath?: string) {
    this.filePath = filePath || join(homedir(), '.safekey-vault.json');
    this.data = {
      metadata: {
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        keyCount: 0,
        salt: generateSalt(),
      },
      secrets: {},
    };
  }

  /**
   * Initialize a new vault with a master password
   */
  async initialize(masterPassword: string): Promise<void> {
    const salt = generateSalt();
    this.masterKey = deriveKey(masterPassword, salt);

    this.data.metadata.salt = salt;
    this.data.metadata.createdAt = new Date();
    this.data.metadata.updatedAt = new Date();

    await this.save();
  }

  /**
   * Load an existing vault from disk
   */
  async load(masterPassword: string): Promise<void> {
    try {
      const fileContent = await fs.readFile(this.filePath, 'utf8');
      const encryptedVault: EncryptedVault = JSON.parse(fileContent);

      this.masterKey = deriveKey(masterPassword, encryptedVault.metadata.salt);

      const decryptionInput: DecryptionInput = {
        encrypted: encryptedVault.encrypted,
        iv: encryptedVault.iv,
        authTag: encryptedVault.authTag,
      };

      const decryptedData = decrypt(decryptionInput, this.masterKey);
      this.data = JSON.parse(decryptedData);

      // Ensure dates are properly parsed
      this.data.metadata.createdAt = new Date(this.data.metadata.createdAt);
      this.data.metadata.updatedAt = new Date(this.data.metadata.updatedAt);

      Object.values(this.data.secrets).forEach((secret) => {
        secret.createdAt = new Date(secret.createdAt);
        secret.updatedAt = new Date(secret.updatedAt);
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new VaultNotFoundError(this.filePath);
      }
      throw new InvalidKeyError();
    }
  }

  /**
   * Save the vault to disk
   */
  async save(): Promise<void> {
    if (!this.masterKey) {
      throw new Error('Vault not initialized or loaded');
    }

    this.data.metadata.updatedAt = new Date();
    this.data.metadata.keyCount = Object.keys(this.data.secrets).length;

    const serializedData = JSON.stringify(this.data);
    const encryptionResult = encrypt(serializedData, this.masterKey);

    const encryptedVault: EncryptedVault = {
      encrypted: encryptionResult.encrypted,
      iv: encryptionResult.iv,
      authTag: encryptionResult.authTag,
      metadata: {
        version: this.data.metadata.version,
        createdAt: this.data.metadata.createdAt.toISOString(),
        salt: this.data.metadata.salt,
      },
    };

    await fs.writeFile(
      this.filePath,
      JSON.stringify(encryptedVault, null, 2),
      'utf8'
    );
  }

  /**
   * Add a new secret to the vault
   */
  async addSecret(
    key: string,
    value: string,
    description?: string
  ): Promise<void> {
    if (this.data.secrets[key]) {
      throw new SecretAlreadyExistsError(key);
    }

    const now = new Date();
    const secret: SecretEntry = {
      key,
      value,
      description,
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    this.data.secrets[key] = secret;
    await this.save();
  }

  /**
   * Get a secret from the vault
   */
  getSecret(key: string): SecretEntry {
    const secret = this.data.secrets[key];
    if (!secret) {
      throw new SecretNotFoundError(key);
    }
    return { ...secret }; // Return a copy
  }

  /**
   * Update an existing secret
   */
  async updateSecret(
    key: string,
    value: string,
    description?: string
  ): Promise<void> {
    const secret = this.data.secrets[key];
    if (!secret) {
      throw new SecretNotFoundError(key);
    }

    secret.value = value;
    if (description !== undefined) {
      secret.description = description;
    }
    secret.updatedAt = new Date();
    secret.version += 1;

    await this.save();
  }

  /**
   * Remove a secret from the vault
   */
  async removeSecret(key: string): Promise<void> {
    if (!this.data.secrets[key]) {
      throw new SecretNotFoundError(key);
    }

    delete this.data.secrets[key];
    await this.save();
  }

  /**
   * List all secret keys
   */
  listSecrets(): string[] {
    return Object.keys(this.data.secrets);
  }

  /**
   * Get all secrets (without values for security)
   */
  getAllSecrets(): Array<Omit<SecretEntry, 'value'>> {
    return Object.values(this.data.secrets).map((secret) => ({
      key: secret.key,
      description: secret.description,
      createdAt: secret.createdAt,
      updatedAt: secret.updatedAt,
      version: secret.version,
    }));
  }

  /**
   * Check if vault exists on disk
   */
  async exists(): Promise<boolean> {
    try {
      await fs.access(this.filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get vault metadata
   */
  getMetadata(): VaultMetadata {
    return { ...this.data.metadata };
  }

  /**
   * Export vault data to a specified format
   */
  exportSecrets(format: 'json' | 'env' = 'json'): string {
    if (format === 'env') {
      return Object.entries(this.data.secrets)
        .map(([key, secret]) => `${key}=${secret.value}`)
        .join('\n');
    }

    return JSON.stringify(this.data.secrets, null, 2);
  }

  /**
   * Import secrets from various formats
   */
  async importSecrets(
    data: string,
    format: 'json' | 'env' = 'json',
    overwrite = false
  ): Promise<number> {
    let importedCount = 0;

    if (format === 'env') {
      const lines = data
        .split('\n')
        .filter((line) => line.trim() && !line.startsWith('#'));

      for (const line of lines) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');

          if (!this.data.secrets[key] || overwrite) {
            await this.addOrUpdateSecret(key.trim(), value.trim());
            importedCount++;
          }
        }
      }
    } else {
      const secrets = JSON.parse(data);

      for (const [key, value] of Object.entries(secrets)) {
        if (
          typeof value === 'string' &&
          (!this.data.secrets[key] || overwrite)
        ) {
          await this.addOrUpdateSecret(key, value);
          importedCount++;
        }
      }
    }

    return importedCount;
  }

  /**
   * Helper method to add or update a secret
   */
  private async addOrUpdateSecret(
    key: string,
    value: string,
    description?: string
  ): Promise<void> {
    if (this.data.secrets[key]) {
      await this.updateSecret(key, value, description);
    } else {
      await this.addSecret(key, value, description);
    }
  }

  /**
   * Clear the master key from memory
   */
  clearMasterKey(): void {
    if (this.masterKey) {
      secureWipe(this.masterKey);
      this.masterKey = null;
    }
  }
}
