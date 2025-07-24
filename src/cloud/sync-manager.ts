/**
 * Sync Manager
 * Orchestrates synchronization between local vaults and cloud providers
 */

import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import {
  CloudProvider,
  SyncResult,
  SyncStatus,
  SyncConfiguration,
  Conflict,
  SyncConflictError,
  VaultMetadata,
} from './types.js';
import { CloudProviderRegistry } from './base-provider.js';
import { Config } from '../config/config.js';

export class SyncManager {
  private config: Config;

  constructor() {
    this.config = new Config();
  }

  /**
   * Enable sync for a vault
   */
  async enableSync(
    vaultPath: string,
    providerName: string,
    credentials: Record<string, string>,
    options: Partial<SyncConfiguration> = {}
  ): Promise<void> {
    const resolvedVaultPath = this.resolveVaultPath(vaultPath);
    const provider = CloudProviderRegistry.getProvider(providerName);
    await provider.authenticate(credentials);

    const vaultId = this.generateVaultId(resolvedVaultPath);
    const syncConfig: SyncConfiguration = {
      enabled: true,
      provider: providerName,
      vaultId,
      autoSync: options.autoSync ?? false,
      syncInterval: options.syncInterval ?? 15,
      conflictResolution: options.conflictResolution ?? 'manual',
      credentials,
    };

    await this.saveSyncConfiguration(resolvedVaultPath, syncConfig);
  }

  /**
   * Disable sync for a vault
   */
  async disableSync(vaultPath: string): Promise<void> {
    const resolvedVaultPath = this.resolveVaultPath(vaultPath);
    const configPath = this.getSyncConfigPath(resolvedVaultPath);
    try {
      await fs.unlink(configPath);
    } catch (error) {
      // Config doesn't exist, which is fine
    }
  }

  /**
   * Sync a vault with its cloud provider
   */
  async syncVault(vaultPath: string): Promise<SyncResult> {
    const resolvedVaultPath = this.resolveVaultPath(vaultPath);
    const syncConfig = await this.getSyncConfiguration(resolvedVaultPath);
    if (!syncConfig.enabled) {
      return {
        success: false,
        action: 'no-change',
        error: 'Sync not enabled for this vault',
      };
    }

    const provider = CloudProviderRegistry.getProvider(syncConfig.provider);
    await provider.authenticate(syncConfig.credentials);

    try {
      // Check if vault exists locally
      const vaultExists = await this.vaultExists(resolvedVaultPath);
      if (!vaultExists) {
        // Try to download from cloud
        return await this.downloadVault(
          resolvedVaultPath,
          provider,
          syncConfig
        );
      }

      // Check if vault exists in cloud
      const cloudExists = await provider.exists(syncConfig.vaultId);
      if (!cloudExists) {
        // Upload to cloud
        return await this.uploadVault(resolvedVaultPath, provider, syncConfig);
      }

      // Both exist, check for conflicts
      return await this.resolveSync(resolvedVaultPath, provider, syncConfig);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        action: 'no-change',
        error: err.message,
      };
    }
  }

  /**
   * Get sync status for a vault
   */
  async getSyncStatus(vaultPath: string): Promise<SyncStatus> {
    try {
      const resolvedVaultPath = this.resolveVaultPath(vaultPath);
      const syncConfig = await this.getSyncConfiguration(resolvedVaultPath);
      if (!syncConfig.enabled) {
        return {
          isConfigured: false,
          status: 'disconnected',
          provider: 'none',
          conflictCount: 0,
        };
      }

      const provider = CloudProviderRegistry.getProvider(syncConfig.provider);

      // Authenticate the provider to check if it's properly configured
      try {
        await provider.authenticate(syncConfig.credentials);
      } catch (error) {
        return {
          isConfigured: false,
          status: 'error',
          provider: syncConfig.provider,
          error: error instanceof Error ? error.message : String(error),
          conflictCount: 0,
        };
      }

      const isConfigured = await provider.isConfigured();

      if (!isConfigured) {
        return {
          isConfigured: false,
          status: 'error',
          provider: syncConfig.provider,
          error: 'Provider not configured',
          conflictCount: 0,
        };
      }

      // Check for pending changes
      const lastSyncTime = await this.getLastSyncTime(resolvedVaultPath);
      const vaultModTime =
        await this.getVaultModificationTime(resolvedVaultPath);

      let status: SyncStatus['status'] = 'synced';
      if (vaultModTime && lastSyncTime && vaultModTime > lastSyncTime) {
        status = 'pending';
      }

      return {
        isConfigured: true,
        lastSync: lastSyncTime,
        status,
        provider: syncConfig.provider,
        conflictCount: 0, // TODO: Implement conflict detection
      };
    } catch (error) {
      return {
        isConfigured: false,
        status: 'error',
        provider: 'unknown',
        error: error instanceof Error ? error.message : String(error),
        conflictCount: 0,
      };
    }
  }

  /**
   * Resolve sync conflicts
   */
  async resolveConflicts(
    vaultPath: string,
    resolution: 'local' | 'remote' | 'merge'
  ): Promise<SyncResult> {
    const resolvedVaultPath = this.resolveVaultPath(vaultPath);
    const syncConfig = await this.getSyncConfiguration(resolvedVaultPath);
    const provider = CloudProviderRegistry.getProvider(syncConfig.provider);
    await provider.authenticate(syncConfig.credentials);

    switch (resolution) {
      case 'local':
        return await this.uploadVault(resolvedVaultPath, provider, syncConfig);
      case 'remote':
        return await this.downloadVault(
          resolvedVaultPath,
          provider,
          syncConfig
        );
      case 'merge':
        return await this.mergeVaults(resolvedVaultPath, provider, syncConfig);
      default:
        throw new Error(`Unknown resolution: ${resolution}`);
    }
  }

  private async resolveSync(
    vaultPath: string,
    provider: CloudProvider,
    syncConfig: SyncConfiguration
  ): Promise<SyncResult> {
    const localMeta = await this.getLocalVaultMetadata(vaultPath);
    const remoteMeta = await provider.getMetadata(syncConfig.vaultId);

    // Compare timestamps
    if (localMeta.lastModified > remoteMeta.lastModified) {
      // Local is newer, upload
      return await this.uploadVault(vaultPath, provider, syncConfig);
    } else if (remoteMeta.lastModified > localMeta.lastModified) {
      // Remote is newer, download
      return await this.downloadVault(vaultPath, provider, syncConfig);
    } else {
      // Same timestamp, check checksums
      if (localMeta.checksum === remoteMeta.checksum) {
        return {
          success: true,
          action: 'no-change',
        };
      } else {
        // Conflict detected
        const conflict: Conflict = {
          type: 'content',
          localData: localMeta,
          remoteData: remoteMeta,
          timestamp: new Date(),
        };

        if (syncConfig.conflictResolution === 'manual') {
          throw new SyncConflictError(syncConfig.provider, conflict);
        } else {
          // Auto-resolve based on configuration
          return await this.resolveConflicts(
            vaultPath,
            syncConfig.conflictResolution === 'local-wins' ? 'local' : 'remote'
          );
        }
      }
    }
  }

  private async uploadVault(
    vaultPath: string,
    provider: CloudProvider,
    syncConfig: SyncConfiguration
  ): Promise<SyncResult> {
    const vaultData = await fs.readFile(vaultPath);
    const metadata = await this.getLocalVaultMetadata(vaultPath);

    const remoteId = await provider.upload(
      syncConfig.vaultId,
      vaultData,
      metadata
    );
    await this.updateLastSyncTime(vaultPath);

    return {
      success: true,
      action: 'upload',
      remoteVersion: remoteId,
    };
  }

  private async downloadVault(
    vaultPath: string,
    provider: CloudProvider,
    syncConfig: SyncConfiguration
  ): Promise<SyncResult> {
    const { data, metadata } = await provider.download(syncConfig.vaultId);

    await fs.writeFile(vaultPath, data);
    await this.updateLastSyncTime(vaultPath);

    return {
      success: true,
      action: 'download',
      remoteVersion: metadata.version,
    };
  }

  private async mergeVaults(
    vaultPath: string,
    provider: CloudProvider,
    syncConfig: SyncConfiguration
  ): Promise<SyncResult> {
    // For now, implement simple merge by taking local changes
    // TODO: Implement proper secret-level merging
    return await this.uploadVault(vaultPath, provider, syncConfig);
  }

  private async getLocalVaultMetadata(
    vaultPath: string
  ): Promise<VaultMetadata> {
    const stats = await fs.stat(vaultPath);
    const data = await fs.readFile(vaultPath);
    const checksum = createHash('sha256').update(data).digest('hex');

    return {
      version: '1.0',
      lastModified: stats.mtime,
      checksum,
      size: stats.size,
      description: 'SafeKey Vault',
    };
  }

  private generateVaultId(vaultPath: string): string {
    return createHash('sha256')
      .update(vaultPath)
      .digest('hex')
      .substring(0, 16);
  }

  private getSyncConfigPath(vaultPath: string): string {
    const vaultDir = path.dirname(vaultPath);
    const vaultName = path.basename(vaultPath, path.extname(vaultPath));

    // If vault name already starts with a dot, don't add another one
    if (vaultName.startsWith('.')) {
      return path.join(vaultDir, `${vaultName}.sync.json`);
    } else {
      return path.join(vaultDir, `.${vaultName}.sync.json`);
    }
  }

  private async saveSyncConfiguration(
    vaultPath: string,
    config: SyncConfiguration
  ): Promise<void> {
    const configPath = this.getSyncConfigPath(vaultPath);
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  }

  private async getSyncConfiguration(
    vaultPath: string
  ): Promise<SyncConfiguration> {
    const configPath = this.getSyncConfigPath(vaultPath);
    try {
      const data = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return {
        enabled: false,
        provider: '',
        vaultId: '',
        autoSync: false,
        conflictResolution: 'manual',
        credentials: {},
      };
    }
  }

  private async vaultExists(vaultPath: string): Promise<boolean> {
    try {
      await fs.access(vaultPath);
      return true;
    } catch {
      return false;
    }
  }

  private async getLastSyncTime(vaultPath: string): Promise<Date | undefined> {
    const syncPath = this.getSyncConfigPath(vaultPath) + '.time';
    try {
      const data = await fs.readFile(syncPath, 'utf-8');
      return new Date(data);
    } catch {
      return undefined;
    }
  }

  private async updateLastSyncTime(vaultPath: string): Promise<void> {
    const syncPath = this.getSyncConfigPath(vaultPath) + '.time';
    await fs.writeFile(syncPath, new Date().toISOString());
  }

  private async getVaultModificationTime(
    vaultPath: string
  ): Promise<Date | undefined> {
    try {
      const stats = await fs.stat(vaultPath);
      return stats.mtime;
    } catch {
      return undefined;
    }
  }

  /**
   * Resolve vault path from profile name or path
   */
  private resolveVaultPath(vaultPath: string): string {
    // If it's "default", resolve to current profile path
    if (vaultPath === 'default') {
      const currentProfile = this.config.getCurrentProfile();
      return currentProfile.vaultPath;
    }

    // Check if it's a profile name (no path separators and no file extension)
    if (
      !vaultPath.includes('/') &&
      !vaultPath.includes('\\') &&
      !vaultPath.includes('.')
    ) {
      try {
        const profile = this.config.getProfile(vaultPath);
        if (profile) {
          return profile.vaultPath;
        }
      } catch {
        // If profile resolution fails, treat as literal path
      }
    }

    // Return as literal path
    return vaultPath;
  }
}
