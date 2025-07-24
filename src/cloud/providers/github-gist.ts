/**
 * GitHub Gist Cloud Provider
 * Uses GitHub Gists for cloud storage - simple and free option
 */

import {
  CloudCredentials,
  VaultMetadata,
  VaultVersion,
  CloudProviderAuthError,
  CloudProviderNetworkError,
  VaultNotFoundError,
} from '../types.js';
import { BaseCloudProvider } from '../base-provider.js';

interface GitHubGistFile {
  filename: string;
  content: string;
  raw_url: string;
  size: number;
}

interface GitHubGist {
  id: string;
  description: string;
  public: boolean;
  created_at: string;
  updated_at: string;
  files: Record<string, GitHubGistFile>;
  owner: {
    login: string;
  };
}

export class GitHubGistProvider extends BaseCloudProvider {
  readonly name = 'github-gist';
  readonly displayName = 'GitHub Gist';
  readonly requiresAuth = true;

  private readonly apiBase = 'https://api.github.com';
  private readonly gistPrefix = 'safekey-vault-';

  protected validateCredentials(credentials: CloudCredentials): void {
    if (!credentials.token) {
      throw new Error('GitHub token is required');
    }
  }

  protected async performAuthentication(): Promise<void> {
    try {
      const response = await this.makeRequest('GET', '/user');
      if (!response.ok) {
        throw new CloudProviderAuthError(
          this.name,
          `Invalid token: ${response.status}`
        );
      }
    } catch (err) {
      if (err instanceof CloudProviderAuthError) {
        throw err;
      }
      const error = err instanceof Error ? err : new Error(String(err));
      throw new CloudProviderNetworkError(
        this.name,
        `Authentication failed: ${error.message}`
      );
    }
  }

  protected async testConnection(): Promise<void> {
    await this.makeRequest('GET', '/user');
  }

  async upload(
    vaultId: string,
    data: Buffer,
    metadata: VaultMetadata
  ): Promise<string> {
    await this.ensureConfigured();

    const gistName = this.getGistName(vaultId);
    const content = {
      description: `SafeKey Vault: ${metadata.description || vaultId}`,
      public: false,
      files: {
        'vault.json': {
          content: data.toString('base64'),
        },
        'metadata.json': {
          content: JSON.stringify(metadata, null, 2),
        },
      },
    };

    try {
      // Check if gist already exists
      const existingGist = await this.findGistByName(gistName);

      if (existingGist) {
        // Update existing gist
        const response = await this.makeRequest(
          'PATCH',
          `/gists/${existingGist.id}`,
          content
        );
        const gist: GitHubGist = await response.json();
        return gist.id;
      } else {
        // Create new gist
        const response = await this.makeRequest('POST', '/gists', content);
        const gist: GitHubGist = await response.json();
        return gist.id;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new CloudProviderNetworkError(
        this.name,
        `Upload failed: ${error.message}`
      );
    }
  }

  async download(
    vaultId: string
  ): Promise<{ data: Buffer; metadata: VaultMetadata }> {
    await this.ensureConfigured();

    try {
      const gist = await this.findGistByVaultId(vaultId);
      if (!gist) {
        throw new VaultNotFoundError(this.name, vaultId);
      }

      const vaultFile = gist.files['vault.json'];
      const metadataFile = gist.files['metadata.json'];

      if (!vaultFile || !metadataFile) {
        throw new Error('Invalid vault structure in gist');
      }

      // Download the actual content
      const [vaultContent, metadataContent] = await Promise.all([
        this.downloadFileContent(vaultFile.raw_url),
        this.downloadFileContent(metadataFile.raw_url),
      ]);

      const data = Buffer.from(vaultContent, 'base64');
      const metadata: VaultMetadata = JSON.parse(metadataContent);

      return { data, metadata };
    } catch (err) {
      if (err instanceof VaultNotFoundError) {
        throw err;
      }
      const error = err instanceof Error ? err : new Error(String(err));
      throw new CloudProviderNetworkError(
        this.name,
        `Download failed: ${error.message}`
      );
    }
  }

  async listVersions(vaultId: string): Promise<VaultVersion[]> {
    await this.ensureConfigured();

    try {
      const gist = await this.findGistByVaultId(vaultId);
      if (!gist) {
        return [];
      }

      // GitHub Gists don't have version history in API,
      // so we return the current version only
      return [
        {
          id: gist.id,
          timestamp: new Date(gist.updated_at),
          size: gist.files['vault.json']?.size || 0,
          checksum: '', // Not available from GitHub API
          author: gist.owner.login,
        },
      ];
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new CloudProviderNetworkError(
        this.name,
        `Failed to list versions: ${error.message}`
      );
    }
  }

  async delete(vaultId: string): Promise<void> {
    await this.ensureConfigured();

    try {
      const gist = await this.findGistByVaultId(vaultId);
      if (!gist) {
        throw new VaultNotFoundError(this.name, vaultId);
      }

      await this.makeRequest('DELETE', `/gists/${gist.id}`);
    } catch (err) {
      if (err instanceof VaultNotFoundError) {
        throw err;
      }
      const error = err instanceof Error ? err : new Error(String(err));
      throw new CloudProviderNetworkError(
        this.name,
        `Delete failed: ${error.message}`
      );
    }
  }

  async exists(vaultId: string): Promise<boolean> {
    await this.ensureConfigured();

    try {
      const gist = await this.findGistByVaultId(vaultId);
      return gist !== null;
    } catch {
      return false;
    }
  }

  async getMetadata(vaultId: string): Promise<VaultMetadata> {
    await this.ensureConfigured();

    try {
      const gist = await this.findGistByVaultId(vaultId);
      if (!gist) {
        throw new VaultNotFoundError(this.name, vaultId);
      }

      const metadataFile = gist.files['metadata.json'];
      if (!metadataFile) {
        throw new Error('Metadata not found in gist');
      }

      const content = await this.downloadFileContent(metadataFile.raw_url);
      return JSON.parse(content);
    } catch (err) {
      if (err instanceof VaultNotFoundError) {
        throw err;
      }
      const error = err instanceof Error ? err : new Error(String(err));
      throw new CloudProviderNetworkError(
        this.name,
        `Failed to get metadata: ${error.message}`
      );
    }
  }

  private getGistName(vaultId: string): string {
    return `${this.gistPrefix}${vaultId}`;
  }

  private async findGistByVaultId(vaultId: string): Promise<GitHubGist | null> {
    const gistName = this.getGistName(vaultId);
    return this.findGistByName(gistName);
  }

  private async findGistByName(gistName: string): Promise<GitHubGist | null> {
    try {
      const response = await this.makeRequest('GET', '/gists');
      const gists: GitHubGist[] = await response.json();

      return (
        gists.find(
          (gist) =>
            gist.description.includes(gistName) ||
            gist.description.includes('SafeKey Vault')
        ) || null
      );
    } catch {
      return null;
    }
  }

  private async downloadFileContent(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${this._credentials.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`);
    }

    return response.text();
  }

  private async makeRequest(
    method: string,
    path: string,
    body?: any
  ): Promise<Response> {
    const url = `${this.apiBase}${path}`;
    const headers: Record<string, string> = {
      Authorization: `token ${this._credentials.token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'SafeKey/1.1.0',
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok && response.status !== 404) {
      const errorText = await response.text();
      throw new Error(`GitHub API error: ${response.status} ${errorText}`);
    }

    return response;
  }
}
