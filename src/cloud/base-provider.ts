/**
 * Base Cloud Provider Implementation
 * Provides common functionality for all cloud providers
 */

import {
  CloudProvider,
  CloudCredentials,
  VaultMetadata,
  VaultVersion,
  CloudProviderNotConfiguredError,
} from './types.js';

export abstract class BaseCloudProvider implements CloudProvider {
  protected _isConfigured = false;
  protected _credentials: CloudCredentials = {};

  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract readonly requiresAuth: boolean;

  /**
   * Common authentication flow
   */
  async authenticate(credentials: CloudCredentials): Promise<void> {
    this.validateCredentials(credentials);
    this._credentials = { ...credentials };

    try {
      await this.performAuthentication();
      this._isConfigured = true;
    } catch (error) {
      this._isConfigured = false;
      throw error;
    }
  }

  /**
   * Check if provider is configured
   */
  async isConfigured(): Promise<boolean> {
    if (!this._isConfigured) {
      return false;
    }

    try {
      await this.testConnection();
      return true;
    } catch {
      this._isConfigured = false;
      return false;
    }
  }

  /**
   * Common validation before operations
   */
  protected async ensureConfigured(): Promise<void> {
    if (!(await this.isConfigured())) {
      throw new CloudProviderNotConfiguredError(this.name);
    }
  }

  /**
   * Generate consistent vault IDs
   */
  protected generateVaultId(vaultPath: string): string {
    // Use a hash of the vault path to create consistent IDs
    return Buffer.from(vaultPath)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 32);
  }

  /**
   * Calculate checksum for data integrity
   */
  protected calculateChecksum(data: Buffer): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Create metadata for a vault
   */
  protected createMetadata(data: Buffer, author?: string): VaultMetadata {
    return {
      version: '1.0',
      lastModified: new Date(),
      checksum: this.calculateChecksum(data),
      size: data.length,
      author,
      description: 'SafeKey Vault',
    };
  }

  /**
   * Abstract methods to be implemented by providers
   */
  protected abstract validateCredentials(credentials: CloudCredentials): void;
  protected abstract performAuthentication(): Promise<void>;
  protected abstract testConnection(): Promise<void>;

  abstract upload(
    vaultId: string,
    data: Buffer,
    metadata: VaultMetadata
  ): Promise<string>;
  abstract download(
    vaultId: string
  ): Promise<{ data: Buffer; metadata: VaultMetadata }>;
  abstract listVersions(vaultId: string): Promise<VaultVersion[]>;
  abstract delete(vaultId: string): Promise<void>;
  abstract exists(vaultId: string): Promise<boolean>;
  abstract getMetadata(vaultId: string): Promise<VaultMetadata>;
}

/**
 * Cloud Provider Registry
 * Manages available cloud providers
 */
export class CloudProviderRegistry {
  private static providers = new Map<string, () => CloudProvider>();

  /**
   * Register a cloud provider
   */
  static register(name: string, factory: () => CloudProvider): void {
    this.providers.set(name, factory);
  }

  /**
   * Get a provider instance
   */
  static getProvider(name: string): CloudProvider {
    const factory = this.providers.get(name);
    if (!factory) {
      throw new Error(`Cloud provider '${name}' not found`);
    }
    return factory();
  }

  /**
   * List all available providers
   */
  static listProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if a provider is available
   */
  static hasProvider(name: string): boolean {
    return this.providers.has(name);
  }
}
