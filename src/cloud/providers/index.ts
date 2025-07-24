/**
 * Cloud Providers Index
 * Registers all available cloud providers
 */

import { CloudProviderRegistry } from '../base-provider.js';
import { GitHubGistProvider } from './github-gist.js';
import { AWSS3Provider } from './aws-s3.js';
import { AzureBlobProvider } from './azure-blob.js';

// Register all available providers
CloudProviderRegistry.register('github-gist', () => new GitHubGistProvider());
CloudProviderRegistry.register('aws-s3', () => new AWSS3Provider());
CloudProviderRegistry.register('azure-blob', () => new AzureBlobProvider());

// Export providers for direct use
export {
  GitHubGistProvider,
  AWSS3Provider,
  AzureBlobProvider,
  CloudProviderRegistry,
};

// Export convenience function to get all provider info
export function getAllProviders() {
  return [
    {
      name: 'github-gist',
      displayName: 'GitHub Gist',
      description: 'Store vaults as private GitHub Gists',
      requiresAuth: true,
      credentials: ['token'],
    },
    {
      name: 'aws-s3',
      displayName: 'Amazon S3',
      description: 'Store vaults in AWS S3 buckets',
      requiresAuth: true,
      credentials: ['accessKeyId', 'secretAccessKey', 'region', 'bucketName'],
    },
    {
      name: 'azure-blob',
      displayName: 'Azure Blob Storage',
      description: 'Store vaults in Azure Blob containers',
      requiresAuth: true,
      credentials: ['accountName', 'accountKey', 'containerName'],
    },
  ];
}
