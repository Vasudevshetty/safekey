/**
 * Cloud Provider Types and Interfaces
 * Defines the abstraction layer for different cloud storage providers
 */

export interface CloudCredentials {
  [key: string]: string;
}

export interface VaultVersion {
  id: string;
  timestamp: Date;
  size: number;
  checksum: string;
  author?: string;
}

export interface SyncResult {
  success: boolean;
  action: 'upload' | 'download' | 'no-change' | 'conflict';
  localVersion?: string;
  remoteVersion?: string;
  conflictDetails?: Conflict;
  error?: string;
}

export interface Conflict {
  type: 'content' | 'delete' | 'metadata';
  localData: any;
  remoteData: any;
  lastCommonVersion?: string;
  timestamp: Date;
}

export interface SyncStatus {
  isConfigured: boolean;
  lastSync?: Date;
  status: 'synced' | 'pending' | 'conflict' | 'error' | 'disconnected';
  provider: string;
  error?: string;
  conflictCount: number;
}

export interface CloudProvider {
  readonly name: string;
  readonly displayName: string;
  readonly requiresAuth: boolean;

  /**
   * Initialize and authenticate with the cloud provider
   */
  authenticate(credentials: CloudCredentials): Promise<void>;

  /**
   * Test if the provider is properly configured and accessible
   */
  isConfigured(): Promise<boolean>;

  /**
   * Upload an encrypted vault to the cloud
   */
  upload(
    vaultId: string,
    data: Buffer,
    metadata: VaultMetadata
  ): Promise<string>;

  /**
   * Download an encrypted vault from the cloud
   */
  download(vaultId: string): Promise<{ data: Buffer; metadata: VaultMetadata }>;

  /**
   * List all available versions of a vault
   */
  listVersions(vaultId: string): Promise<VaultVersion[]>;

  /**
   * Delete a vault from the cloud
   */
  delete(vaultId: string): Promise<void>;

  /**
   * Check if a vault exists in the cloud
   */
  exists(vaultId: string): Promise<boolean>;

  /**
   * Get metadata about a vault without downloading it
   */
  getMetadata(vaultId: string): Promise<VaultMetadata>;
}

export interface VaultMetadata {
  version: string;
  lastModified: Date;
  checksum: string;
  size: number;
  author?: string;
  description?: string;
}

export interface SyncConfiguration {
  enabled: boolean;
  provider: string;
  vaultId: string;
  autoSync: boolean;
  syncInterval?: number; // minutes
  conflictResolution: 'manual' | 'local-wins' | 'remote-wins' | 'merge';
  credentials: CloudCredentials;
}

export interface CloudProviderError extends Error {
  code: string;
  provider: string;
  retryable: boolean;
}

export class CloudProviderNotConfiguredError
  extends Error
  implements CloudProviderError
{
  code = 'PROVIDER_NOT_CONFIGURED';
  retryable = false;

  constructor(public provider: string) {
    super(`Cloud provider ${provider} is not properly configured`);
  }
}

export class CloudProviderAuthError
  extends Error
  implements CloudProviderError
{
  code = 'AUTHENTICATION_FAILED';
  retryable = true;

  constructor(
    public provider: string,
    message: string
  ) {
    super(`Authentication failed for ${provider}: ${message}`);
  }
}

export class CloudProviderNetworkError
  extends Error
  implements CloudProviderError
{
  code = 'NETWORK_ERROR';
  retryable = true;

  constructor(
    public provider: string,
    message: string
  ) {
    super(`Network error for ${provider}: ${message}`);
  }
}

export class VaultNotFoundError extends Error implements CloudProviderError {
  code = 'VAULT_NOT_FOUND';
  retryable = false;

  constructor(
    public provider: string,
    vaultId: string
  ) {
    super(`Vault ${vaultId} not found in ${provider}`);
  }
}

export class SyncConflictError extends Error implements CloudProviderError {
  code = 'SYNC_CONFLICT';
  retryable = false;

  constructor(
    public provider: string,
    public conflict: Conflict
  ) {
    super(`Sync conflict detected: ${conflict.type}`);
  }
}
