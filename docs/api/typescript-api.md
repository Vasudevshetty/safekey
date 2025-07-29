# TypeScript API Reference

SafeKey provides a comprehensive TypeScript API for programmatic access to vault operations, secret management, and integrations. This guide covers the complete API surface with examples and best practices.

## Overview

The SafeKey TypeScript API is designed for:

- **Library integration**: Embed SafeKey in your applications
- **Custom tooling**: Build specialized tools on top of SafeKey
- **Automation**: Programmatic secret management
- **Testing**: Mock and test secret-dependent code

## Installation

```bash
npm install @vasudevshetty/safekey
# or
yarn add @vasudevshetty/safekey
# or
pnpm add @vasudevshetty/safekey
```

## Basic Usage

```typescript
import { SafeKey, Vault, Secret } from '@vasudevshetty/safekey';

// Initialize SafeKey
const safekey = new SafeKey({
  configPath: '~/.safekey/config.yaml',
  defaultVault: 'personal',
});

// Open a vault
const vault = await safekey.openVault('production', {
  masterPassword: process.env.SAFEKEY_PASSWORD,
});

// Get a secret
const apiKey = await vault.getSecret('API_KEY');
console.log(apiKey.value);

// Add a secret
await vault.addSecret('NEW_SECRET', 'secret-value', {
  description: 'New secret for testing',
  tags: ['test', 'api'],
});

// Save changes
await vault.save();
```

## Core Classes

### SafeKey

Main entry point for SafeKey operations.

```typescript
class SafeKey {
  constructor(options?: SafeKeyOptions);

  // Vault operations
  createVault(name: string, options?: CreateVaultOptions): Promise<Vault>;
  openVault(name: string, options?: OpenVaultOptions): Promise<Vault>;
  listVaults(options?: ListVaultsOptions): Promise<VaultInfo[]>;
  deleteVault(name: string, options?: DeleteVaultOptions): Promise<void>;

  // Configuration
  getConfig(): SafeKeyConfig;
  setConfig(config: Partial<SafeKeyConfig>): Promise<void>;

  // Cloud operations
  syncVault(vaultName: string, options?: SyncOptions): Promise<SyncResult>;
  configureCloudProvider(
    provider: CloudProvider,
    config: CloudConfig
  ): Promise<void>;

  // Team operations
  createTeam(name: string, options?: CreateTeamOptions): Promise<Team>;
  joinTeam(inviteToken: string, options?: JoinTeamOptions): Promise<Team>;
  listTeams(options?: ListTeamsOptions): Promise<TeamInfo[]>;
}
```

#### SafeKeyOptions

```typescript
interface SafeKeyOptions {
  configPath?: string;
  defaultVault?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  nonInteractive?: boolean;
  timeout?: number;
}
```

#### Example: Initialize SafeKey

```typescript
import { SafeKey } from '@vasudevshetty/safekey';

const safekey = new SafeKey({
  configPath: '/custom/path/config.yaml',
  defaultVault: 'work-secrets',
  logLevel: 'info',
  nonInteractive: true,
  timeout: 30000,
});

// Check version
console.log(await safekey.getVersion());
```

### Vault

Represents a SafeKey vault with secret management capabilities.

```typescript
class Vault {
  readonly name: string;
  readonly metadata: VaultMetadata;

  // Secret operations
  getSecret(name: string): Promise<Secret>;
  addSecret(
    name: string,
    value: string,
    options?: AddSecretOptions
  ): Promise<Secret>;
  updateSecret(
    name: string,
    value: string,
    options?: UpdateSecretOptions
  ): Promise<Secret>;
  deleteSecret(name: string): Promise<void>;
  listSecrets(filter?: SecretFilter): Promise<Secret[]>;
  searchSecrets(query: string, options?: SearchOptions): Promise<Secret[]>;

  // Vault operations
  save(): Promise<void>;
  backup(path: string, options?: BackupOptions): Promise<void>;
  restore(path: string, options?: RestoreOptions): Promise<void>;
  verify(): Promise<VerificationResult>;

  // Metadata operations
  getMetadata(): VaultMetadata;
  updateMetadata(metadata: Partial<VaultMetadata>): Promise<void>;

  // Team operations (for team vaults)
  addMember(email: string, role: TeamRole): Promise<void>;
  removeMember(email: string): Promise<void>;
  listMembers(): Promise<TeamMember[]>;
  updateMemberRole(email: string, role: TeamRole): Promise<void>;

  // Events
  on(event: VaultEvent, listener: VaultEventListener): void;
  off(event: VaultEvent, listener: VaultEventListener): void;
}
```

#### VaultMetadata

```typescript
interface VaultMetadata {
  name: string;
  description?: string;
  created: Date;
  modified: Date;
  version: string;
  secretCount: number;
  size: number;
  encrypted: boolean;
  cloudSync?: CloudSyncMetadata;
  team?: TeamMetadata;
  tags?: string[];
}
```

#### Example: Vault Operations

```typescript
// Create a new vault
const vault = await safekey.createVault('project-secrets', {
  description: 'Secrets for my project',
  masterPassword: 'strong-master-password',
  cloudSync: {
    enabled: true,
    provider: 'github',
    autoSync: true,
  },
});

// Get vault information
const metadata = vault.getMetadata();
console.log(`Vault: ${metadata.name}`);
console.log(`Secrets: ${metadata.secretCount}`);
console.log(`Size: ${metadata.size} bytes`);

// List all secrets
const secrets = await vault.listSecrets();
secrets.forEach((secret) => {
  console.log(`${secret.name}: ${secret.description}`);
});
```

### Secret

Represents a secret with metadata and value.

```typescript
class Secret {
  readonly name: string;
  readonly value: string;
  readonly metadata: SecretMetadata;

  // Utility methods
  toString(): string;
  toJSON(): SecretJSON;
  clone(): Secret;

  // Validation
  validate(): ValidationResult;

  // Metadata operations
  updateMetadata(metadata: Partial<SecretMetadata>): Secret;
  addTag(tag: string): Secret;
  removeTag(tag: string): Secret;
}
```

#### SecretMetadata

```typescript
interface SecretMetadata {
  name: string;
  description?: string;
  tags: string[];
  created: Date;
  modified: Date;
  accessed: Date;
  createdBy?: string;
  modifiedBy?: string;
  version: number;
  type: SecretType;
  sensitivity: SensitivityLevel;
  expiresAt?: Date;
  rotationPolicy?: RotationPolicy;
}
```

#### Example: Secret Management

```typescript
// Add a secret with metadata
const secret = await vault.addSecret('DATABASE_URL', 'postgresql://...', {
  description: 'Production database connection string',
  tags: ['database', 'production'],
  type: 'connection_string',
  sensitivity: 'high',
  expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
});

// Update secret value
await vault.updateSecret('DATABASE_URL', 'postgresql://new-host...', {
  description: 'Updated database connection',
});

// Search secrets
const dbSecrets = await vault.searchSecrets('database', {
  tags: ['production'],
  type: 'connection_string',
});

// Get secret with access logging
const apiKey = await vault.getSecret('API_KEY');
console.log(
  `Retrieved: ${apiKey.name} (last accessed: ${apiKey.metadata.accessed})`
);
```

## Advanced API Features

### Cloud Synchronization

```typescript
import { CloudProvider, SyncManager } from '@vasudevshetty/safekey';

// Configure cloud provider
await safekey.configureCloudProvider('github', {
  token: process.env.GITHUB_TOKEN,
  visibility: 'private',
});

// Manual sync
const syncResult = await safekey.syncVault('production', {
  direction: 'both',
  conflictResolution: 'prompt',
  createBackup: true,
});

console.log(
  `Sync completed: ${syncResult.secretsUploaded} uploaded, ${syncResult.secretsDownloaded} downloaded`
);

// Auto-sync configuration
await vault.configureAutoSync({
  enabled: true,
  interval: '5m',
  conflictResolution: 'newest',
});
```

### Team Management

```typescript
import { Team, TeamRole } from '@vasudevshetty/safekey';

// Create a team
const team = await safekey.createTeam('DevOps Team', {
  description: 'DevOps team vault',
  vaultName: 'devops-secrets',
  maxMembers: 10,
});

// Invite members
const invitation = await team.inviteMemember('alice@example.com', {
  role: 'editor',
  message: 'Welcome to the DevOps team!',
  expiresIn: '7d',
});

console.log(`Invitation sent: ${invitation.token}`);

// Manage members
await team.updateMemberRole('alice@example.com', 'admin');
await team.removeMember('old-member@example.com');

// Team events
team.on('memberJoined', (member) => {
  console.log(`${member.email} joined the team`);
});

team.on('secretModified', (secret, member) => {
  console.log(`${member.email} modified secret: ${secret.name}`);
});
```

### Encryption and Security

```typescript
import { EncryptionManager, KeyDerivation } from '@vasudevshetty/safekey';

// Custom encryption configuration
const encryptionConfig = {
  algorithm: 'AES-256-GCM',
  keyDerivation: {
    function: 'PBKDF2',
    iterations: 150000,
    saltLength: 32,
  },
};

// Create vault with custom encryption
const vault = await safekey.createVault('secure-vault', {
  masterPassword: 'ultra-secure-password',
  encryption: encryptionConfig,
});

// Key derivation utilities
const keyManager = new KeyDerivation();
const derivedKey = await keyManager.deriveKey('password', 'salt', {
  iterations: 100000,
  keyLength: 32,
});

// Memory protection
import { SecureString } from '@vasudevshetty/safekey';

const securePassword = new SecureString('sensitive-data');
// Use securePassword...
securePassword.clear(); // Securely wipe from memory
```

### Event Handling

```typescript
// Vault events
vault.on('secretAdded', (secret) => {
  console.log(`New secret added: ${secret.name}`);
});

vault.on('secretModified', (secret, oldValue) => {
  console.log(`Secret ${secret.name} was modified`);
});

vault.on('secretAccessed', (secret) => {
  console.log(`Secret ${secret.name} was accessed`);
});

vault.on('syncStarted', () => {
  console.log('Sync started');
});

vault.on('syncCompleted', (result) => {
  console.log(`Sync completed: ${result.status}`);
});

vault.on('error', (error) => {
  console.error(`Vault error: ${error.message}`);
});

// SafeKey-wide events
safekey.on('vaultOpened', (vault) => {
  console.log(`Vault opened: ${vault.name}`);
});

safekey.on('configChanged', (config) => {
  console.log('Configuration changed');
});
```

### Utilities and Helpers

```typescript
import {
  PasswordGenerator,
  SecretValidator,
  VaultUtils,
  CryptoUtils,
} from '@vasudevshetty/safekey';

// Password generation
const generator = new PasswordGenerator();
const strongPassword = generator.generate({
  length: 32,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: true,
});

// Secret validation
const validator = new SecretValidator();
const validation = validator.validate(secret);
if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
}

// Vault utilities
const vaultPath = VaultUtils.getVaultPath('my-vault');
const isValidVault = await VaultUtils.isValidVault(vaultPath);
const vaultSize = await VaultUtils.getVaultSize(vaultPath);

// Cryptographic utilities
const hash = CryptoUtils.sha256('data-to-hash');
const randomBytes = CryptoUtils.randomBytes(32);
const isSecure = CryptoUtils.isSecureRandom();
```

## Error Handling

```typescript
import {
  SafeKeyError,
  VaultError,
  AuthenticationError,
  EncryptionError,
  NetworkError,
  ConfigurationError,
} from '@vasudevshetty/safekey';

try {
  const vault = await safekey.openVault('production');
  const secret = await vault.getSecret('API_KEY');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
    // Handle authentication error
  } else if (error instanceof VaultError) {
    console.error('Vault error:', error.message);
    console.error('Vault name:', error.vaultName);
  } else if (error instanceof EncryptionError) {
    console.error('Encryption error:', error.message);
    // Handle encryption/decryption issues
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
    // Handle network/sync issues
  } else if (error instanceof SafeKeyError) {
    console.error('SafeKey error:', error.message);
    console.error('Error code:', error.code);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Type Definitions

### Enums and Types

```typescript
// Secret types
enum SecretType {
  PASSWORD = 'password',
  API_KEY = 'api_key',
  CONNECTION_STRING = 'connection_string',
  CERTIFICATE = 'certificate',
  SSH_KEY = 'ssh_key',
  TOKEN = 'token',
  OTHER = 'other',
}

// Sensitivity levels
enum SensitivityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Team roles
enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

// Cloud providers
enum CloudProvider {
  GITHUB = 'github',
  AWS_S3 = 'aws-s3',
  AZURE_BLOB = 'azure-blob',
  GOOGLE_CLOUD = 'google-cloud',
}

// Sync directions
enum SyncDirection {
  UP = 'up',
  DOWN = 'down',
  BOTH = 'both',
}

// Conflict resolution strategies
enum ConflictResolution {
  PROMPT = 'prompt',
  LOCAL = 'local',
  REMOTE = 'remote',
  NEWEST = 'newest',
  MERGE = 'merge',
}
```

### Interface Definitions

```typescript
interface CreateVaultOptions {
  description?: string;
  masterPassword: string;
  cloudSync?: CloudSyncOptions;
  team?: TeamOptions;
  encryption?: EncryptionOptions;
  tags?: string[];
}

interface AddSecretOptions {
  description?: string;
  tags?: string[];
  type?: SecretType;
  sensitivity?: SensitivityLevel;
  expiresAt?: Date;
  rotationPolicy?: RotationPolicy;
  metadata?: Record<string, any>;
}

interface SearchOptions {
  tags?: string[];
  type?: SecretType;
  sensitivity?: SensitivityLevel;
  createdAfter?: Date;
  modifiedAfter?: Date;
  includeExpired?: boolean;
  limit?: number;
  offset?: number;
}

interface SyncOptions {
  direction?: SyncDirection;
  conflictResolution?: ConflictResolution;
  createBackup?: boolean;
  dryRun?: boolean;
  filter?: SecretFilter;
}

interface CloudSyncOptions {
  enabled: boolean;
  provider: CloudProvider;
  autoSync?: boolean;
  syncInterval?: string;
  conflictResolution?: ConflictResolution;
}
```

## Testing and Mocking

```typescript
import {
  SafeKeyMock,
  VaultMock,
  SecretMock,
} from '@vasudevshetty/safekey/testing';

describe('Application with SafeKey', () => {
  let mockSafeKey: SafeKeyMock;
  let mockVault: VaultMock;

  beforeEach(() => {
    mockSafeKey = new SafeKeyMock();
    mockVault = new VaultMock('test-vault');

    // Setup mock secrets
    mockVault.addMockSecret('API_KEY', 'test-api-key');
    mockVault.addMockSecret('DATABASE_URL', 'postgres://test-db');

    mockSafeKey.addMockVault(mockVault);
  });

  it('should retrieve API key', async () => {
    const vault = await mockSafeKey.openVault('test-vault');
    const secret = await vault.getSecret('API_KEY');

    expect(secret.value).toBe('test-api-key');
  });

  it('should handle missing secrets', async () => {
    const vault = await mockSafeKey.openVault('test-vault');

    await expect(vault.getSecret('MISSING_SECRET')).rejects.toThrow(
      'Secret not found'
    );
  });
});

// Integration testing with real vaults
describe('SafeKey Integration', () => {
  it('should work with real vault', async () => {
    const safekey = new SafeKey({ nonInteractive: true });
    const vault = await safekey.createVault('integration-test', {
      masterPassword: 'test-password',
    });

    await vault.addSecret('TEST_SECRET', 'test-value');
    const secret = await vault.getSecret('TEST_SECRET');

    expect(secret.value).toBe('test-value');

    // Cleanup
    await safekey.deleteVault('integration-test');
  });
});
```

## Best Practices

### Resource Management

```typescript
// Always close vaults and clean up resources
try {
  const vault = await safekey.openVault('production');
  // ... use vault
} finally {
  await vault.close(); // Ensure vault is properly closed
}

// Use try-with-resources pattern
await safekey.withVault('production', async (vault) => {
  const secret = await vault.getSecret('API_KEY');
  // Vault is automatically closed when this block exits
  return secret.value;
});
```

### Security Considerations

```typescript
// Use secure string for sensitive data
import { SecureString } from '@vasudevshetty/safekey';

const password = new SecureString(await vault.getSecret('PASSWORD'));
try {
  // Use password...
} finally {
  password.clear(); // Wipe from memory
}

// Validate input
const validator = new SecretValidator();
const result = validator.validate(secret);
if (!result.isValid) {
  throw new Error(`Invalid secret: ${result.errors.join(', ')}`);
}

// Use read-only access when possible
const vault = await safekey.openVault('production', {
  readOnly: true,
});
```

### Performance Optimization

```typescript
// Batch operations
const secrets = await vault.bulkGetSecrets([
  'API_KEY',
  'DATABASE_URL',
  'REDIS_URL',
]);

// Use caching for frequently accessed secrets
const cache = new SecretCache();
const apiKey = await cache.get('API_KEY', () => vault.getSecret('API_KEY'));

// Lazy loading
const vault = await safekey.openVault('production', {
  lazyLoad: true,
});

// Pagination for large vaults
const secrets = await vault.listSecrets({
  limit: 50,
  offset: 0,
});
```

For more API examples and advanced usage patterns, see the [API Examples Repository](https://github.com/Vasudevshetty/safekey-api-examples).
