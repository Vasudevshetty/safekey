# Core Classes

This document provides detailed information about SafeKey's core classes, their methods, properties, and usage patterns. These classes form the foundation of the SafeKey TypeScript API.

## Class Hierarchy

```
SafeKey (entry point)
├── Vault (secret container)
│   ├── Secret (individual secret)
│   └── VaultMetadata (vault information)
├── Team (collaboration)
│   ├── TeamMember (team member info)
│   └── TeamInvitation (invitation management)
├── CloudProvider (sync providers)
│   ├── GitHubProvider
│   ├── AWSProvider
│   └── AzureProvider
└── EncryptionManager (crypto operations)
    ├── KeyDerivation
    └── CipherContext
```

## SafeKey Class

The main entry point for all SafeKey operations.

### Constructor

```typescript
constructor(options?: SafeKeyOptions)
```

**Parameters:**

- `options`: Optional configuration object

**Example:**

```typescript
import { SafeKey } from '@vasudevshetty/safekey';

const safekey = new SafeKey({
  configPath: '~/.safekey/config.yaml',
  defaultVault: 'personal',
  logLevel: 'info',
});
```

### Properties

```typescript
class SafeKey {
  readonly version: string;
  readonly config: SafeKeyConfig;
  readonly isInitialized: boolean;
}
```

### Methods

#### Vault Management

##### `createVault(name: string, options: CreateVaultOptions): Promise<Vault>`

Creates a new vault with the specified configuration.

**Parameters:**

- `name`: Unique vault name
- `options`: Vault creation options

**Returns:** Promise resolving to the created Vault instance

**Example:**

```typescript
const vault = await safekey.createVault('project-secrets', {
  description: 'Secrets for my project',
  masterPassword: 'secure-password',
  cloudSync: {
    enabled: true,
    provider: 'github',
  },
});
```

**Throws:**

- `VaultExistsError`: If vault already exists
- `ConfigurationError`: If options are invalid
- `EncryptionError`: If encryption setup fails

##### `openVault(name: string, options?: OpenVaultOptions): Promise<Vault>`

Opens an existing vault for operations.

**Parameters:**

- `name`: Vault name to open
- `options`: Optional opening parameters

**Returns:** Promise resolving to the opened Vault instance

**Example:**

```typescript
const vault = await safekey.openVault('production', {
  masterPassword: process.env.MASTER_PASSWORD,
  readOnly: false,
  timeout: 30000,
});
```

##### `listVaults(options?: ListVaultsOptions): Promise<VaultInfo[]>`

Lists all available vaults with their metadata.

**Parameters:**

- `options`: Optional filtering and sorting options

**Returns:** Promise resolving to array of vault information

**Example:**

```typescript
const vaults = await safekey.listVaults({
  includeTeamVaults: true,
  sortBy: 'modified',
  order: 'desc',
});

vaults.forEach((vault) => {
  console.log(`${vault.name}: ${vault.secretCount} secrets`);
});
```

##### `deleteVault(name: string, options?: DeleteVaultOptions): Promise<void>`

Permanently deletes a vault and all its contents.

**Parameters:**

- `name`: Vault name to delete
- `options`: Optional deletion parameters

**Example:**

```typescript
await safekey.deleteVault('old-vault', {
  createBackup: true,
  confirmDeletion: true,
});
```

#### Cloud Operations

##### `configureCloudProvider(provider: CloudProvider, config: CloudConfig): Promise<void>`

Configures a cloud storage provider for vault synchronization.

**Example:**

```typescript
await safekey.configureCloudProvider('github', {
  token: process.env.GITHUB_TOKEN,
  visibility: 'private',
  description: 'SafeKey vault backup',
});
```

##### `syncVault(vaultName: string, options?: SyncOptions): Promise<SyncResult>`

Synchronizes a vault with its cloud storage.

**Example:**

```typescript
const result = await safekey.syncVault('production', {
  direction: 'both',
  conflictResolution: 'newest',
  createBackup: true,
});

console.log(`Sync completed: ${result.status}`);
```

#### Team Operations

##### `createTeam(name: string, options?: CreateTeamOptions): Promise<Team>`

Creates a new team for collaborative vault management.

**Example:**

```typescript
const team = await safekey.createTeam('DevOps Team', {
  description: 'Development and operations team',
  vaultName: 'devops-secrets',
  maxMembers: 10,
});
```

##### `joinTeam(inviteToken: string, options?: JoinTeamOptions): Promise<Team>`

Joins an existing team using an invitation token.

**Example:**

```typescript
const team = await safekey.joinTeam('inv_abc123def456', {
  acceptTerms: true,
  localVaultPath: '~/teams/devops',
});
```

## Vault Class

Represents a SafeKey vault containing secrets and metadata.

### Properties

```typescript
class Vault {
  readonly name: string;
  readonly metadata: VaultMetadata;
  readonly isTeamVault: boolean;
  readonly isReadOnly: boolean;
  readonly cloudSync: CloudSyncInfo | null;
}
```

### Secret Operations

#### `getSecret(name: string): Promise<Secret>`

Retrieves a secret by name.

**Parameters:**

- `name`: Secret name to retrieve

**Returns:** Promise resolving to the Secret instance

**Example:**

```typescript
const secret = await vault.getSecret('API_KEY');
console.log(`Value: ${secret.value}`);
console.log(`Description: ${secret.metadata.description}`);
```

**Throws:**

- `SecretNotFoundError`: If secret doesn't exist
- `AuthorizationError`: If insufficient permissions

#### `addSecret(name: string, value: string, options?: AddSecretOptions): Promise<Secret>`

Adds a new secret to the vault.

**Parameters:**

- `name`: Unique secret name
- `value`: Secret value
- `options`: Optional metadata and settings

**Returns:** Promise resolving to the created Secret instance

**Example:**

```typescript
const secret = await vault.addSecret('DATABASE_URL', 'postgresql://...', {
  description: 'Production database connection',
  tags: ['database', 'production'],
  type: 'connection_string',
  sensitivity: 'high',
});
```

#### `updateSecret(name: string, value: string, options?: UpdateSecretOptions): Promise<Secret>`

Updates an existing secret's value and optionally its metadata.

**Example:**

```typescript
const updated = await vault.updateSecret('API_KEY', 'new-api-key-value', {
  description: 'Updated API key for version 2.0',
  addTags: ['v2'],
  removeTags: ['v1'],
});
```

#### `deleteSecret(name: string): Promise<void>`

Removes a secret from the vault.

**Example:**

```typescript
await vault.deleteSecret('OLD_SECRET');
```

#### `listSecrets(filter?: SecretFilter): Promise<Secret[]>`

Lists secrets in the vault with optional filtering.

**Parameters:**

- `filter`: Optional filtering criteria

**Returns:** Promise resolving to array of secrets

**Example:**

```typescript
// List all secrets
const allSecrets = await vault.listSecrets();

// List secrets with specific tags
const dbSecrets = await vault.listSecrets({
  tags: ['database'],
  type: 'connection_string',
});

// List recently modified secrets
const recentSecrets = await vault.listSecrets({
  modifiedAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
});
```

#### `searchSecrets(query: string, options?: SearchOptions): Promise<Secret[]>`

Searches for secrets using text queries.

**Example:**

```typescript
// Search by name or description
const results = await vault.searchSecrets('database', {
  includeMetadata: true,
  fuzzyMatch: true,
});

// Advanced search with multiple criteria
const advancedResults = await vault.searchSecrets('api', {
  tags: ['production'],
  sensitivity: ['high', 'critical'],
  limit: 10,
});
```

### Bulk Operations

#### `bulkGetSecrets(names: string[]): Promise<Secret[]>`

Retrieves multiple secrets in a single operation.

**Example:**

```typescript
const secrets = await vault.bulkGetSecrets([
  'API_KEY',
  'DATABASE_URL',
  'REDIS_URL',
]);

const secretMap = new Map(secrets.map((s) => [s.name, s.value]));
```

#### `bulkAddSecrets(secrets: BulkSecretInput[]): Promise<Secret[]>`

Adds multiple secrets efficiently.

**Example:**

```typescript
const secrets = await vault.bulkAddSecrets([
  {
    name: 'API_KEY_1',
    value: 'key1',
    options: { description: 'First API key' },
  },
  {
    name: 'API_KEY_2',
    value: 'key2',
    options: { description: 'Second API key' },
  },
]);
```

### Vault Management

#### `save(): Promise<void>`

Persists all changes to the vault.

**Example:**

```typescript
// Make changes
await vault.addSecret('NEW_SECRET', 'value');
await vault.updateSecret('EXISTING_SECRET', 'new-value');

// Save all changes
await vault.save();
```

#### `backup(path: string, options?: BackupOptions): Promise<void>`

Creates a backup of the vault.

**Example:**

```typescript
await vault.backup('/backups/vault-backup.safekey', {
  compress: true,
  includeMetadata: true,
  encrypt: true,
});
```

#### `restore(path: string, options?: RestoreOptions): Promise<void>`

Restores vault from a backup file.

**Example:**

```typescript
await vault.restore('/backups/vault-backup.safekey', {
  overwriteExisting: true,
  validateIntegrity: true,
});
```

#### `verify(): Promise<VerificationResult>`

Verifies vault integrity and consistency.

**Example:**

```typescript
const result = await vault.verify();
if (!result.isValid) {
  console.error('Vault verification failed:');
  result.errors.forEach((error) => console.error(`- ${error}`));
}
```

### Event Handling

```typescript
// Listen for vault events
vault.on('secretAdded', (secret: Secret) => {
  console.log(`Secret added: ${secret.name}`);
});

vault.on('secretModified', (secret: Secret, oldValue: string) => {
  console.log(`Secret modified: ${secret.name}`);
});

vault.on('secretDeleted', (secretName: string) => {
  console.log(`Secret deleted: ${secretName}`);
});

vault.on('syncStarted', () => {
  console.log('Vault sync started');
});

vault.on('syncCompleted', (result: SyncResult) => {
  console.log(`Vault sync completed: ${result.status}`);
});

vault.on('error', (error: Error) => {
  console.error(`Vault error: ${error.message}`);
});
```

## Secret Class

Represents an individual secret with its value and metadata.

### Properties

```typescript
class Secret {
  readonly name: string;
  readonly value: string;
  readonly metadata: SecretMetadata;
  readonly vault: string;
}
```

### Methods

#### `toString(): string`

Returns the secret value as a string.

**Example:**

```typescript
const secret = await vault.getSecret('API_KEY');
console.log(secret.toString()); // Prints the secret value
```

#### `toJSON(): SecretJSON`

Serializes the secret to JSON format.

**Example:**

```typescript
const json = secret.toJSON();
console.log(json.name);
console.log(json.metadata.created);
// Note: value is not included in JSON for security
```

#### `clone(): Secret`

Creates a copy of the secret.

**Example:**

```typescript
const copy = secret.clone();
```

#### `validate(): ValidationResult`

Validates the secret according to configured policies.

**Example:**

```typescript
const validation = secret.validate();
if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
}
```

#### `updateMetadata(metadata: Partial<SecretMetadata>): Secret`

Returns a new Secret instance with updated metadata.

**Example:**

```typescript
const updated = secret.updateMetadata({
  description: 'Updated description',
  tags: [...secret.metadata.tags, 'new-tag'],
});
```

#### `addTag(tag: string): Secret`

Adds a tag to the secret's metadata.

**Example:**

```typescript
const tagged = secret.addTag('production');
```

#### `removeTag(tag: string): Secret`

Removes a tag from the secret's metadata.

**Example:**

```typescript
const untagged = secret.removeTag('development');
```

### Utility Methods

#### `isExpired(): boolean`

Checks if the secret has expired based on its expiration date.

**Example:**

```typescript
if (secret.isExpired()) {
  console.log(`Secret ${secret.name} has expired`);
}
```

#### `isExpiringSoon(days: number = 7): boolean`

Checks if the secret will expire within the specified number of days.

**Example:**

```typescript
if (secret.isExpiringSoon(30)) {
  console.log(`Secret ${secret.name} expires within 30 days`);
}
```

#### `getAge(): number`

Returns the age of the secret in milliseconds.

**Example:**

```typescript
const ageInDays = secret.getAge() / (24 * 60 * 60 * 1000);
console.log(`Secret is ${ageInDays} days old`);
```

## Team Class

Manages team collaboration for shared vaults.

### Properties

```typescript
class Team {
  readonly name: string;
  readonly id: string;
  readonly vault: Vault;
  readonly metadata: TeamMetadata;
  readonly permissions: TeamPermissions;
}
```

### Member Management

#### `addMember(email: string, role: TeamRole): Promise<TeamMember>`

Adds a new member to the team.

**Example:**

```typescript
const member = await team.addMember('alice@example.com', 'editor');
console.log(`Added ${member.email} as ${member.role}`);
```

#### `removeMember(email: string): Promise<void>`

Removes a member from the team.

**Example:**

```typescript
await team.removeMember('former-employee@example.com');
```

#### `updateMemberRole(email: string, role: TeamRole): Promise<TeamMember>`

Updates a team member's role.

**Example:**

```typescript
const updated = await team.updateMemberRole('alice@example.com', 'admin');
```

#### `listMembers(): Promise<TeamMember[]>`

Lists all team members with their roles and metadata.

**Example:**

```typescript
const members = await team.listMembers();
members.forEach((member) => {
  console.log(`${member.email}: ${member.role} (joined: ${member.joinedAt})`);
});
```

### Invitation Management

#### `inviteMember(email: string, options?: InviteOptions): Promise<TeamInvitation>`

Invites a new member to join the team.

**Example:**

```typescript
const invitation = await team.inviteMember('newbie@example.com', {
  role: 'viewer',
  message: 'Welcome to our team!',
  expiresIn: '7d',
});

console.log(`Invitation token: ${invitation.token}`);
```

#### `listInvitations(): Promise<TeamInvitation[]>`

Lists all pending invitations.

**Example:**

```typescript
const invitations = await team.listInvitations();
invitations.forEach((invite) => {
  console.log(
    `${invite.email}: ${invite.status} (expires: ${invite.expiresAt})`
  );
});
```

#### `revokeInvitation(token: string): Promise<void>`

Revokes a pending invitation.

**Example:**

```typescript
await team.revokeInvitation('inv_abc123def456');
```

### Audit and Monitoring

#### `getAuditLog(options?: AuditOptions): Promise<AuditEntry[]>`

Retrieves team activity audit log.

**Example:**

```typescript
const auditLog = await team.getAuditLog({
  since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
  actions: ['secret_modified', 'member_added'],
  limit: 100,
});

auditLog.forEach((entry) => {
  console.log(
    `${entry.timestamp}: ${entry.user} ${entry.action} ${entry.resource}`
  );
});
```

#### `getStatistics(): Promise<TeamStatistics>`

Gets team usage statistics.

**Example:**

```typescript
const stats = await team.getStatistics();
console.log(`Active members: ${stats.activeMemberCount}`);
console.log(`Secrets accessed this month: ${stats.secretsAccessedThisMonth}`);
console.log(`Most active member: ${stats.mostActiveMember}`);
```

## EncryptionManager Class

Handles cryptographic operations for SafeKey.

### Properties

```typescript
class EncryptionManager {
  readonly algorithm: string;
  readonly keyDerivation: KeyDerivationConfig;
  readonly isInitialized: boolean;
}
```

### Key Management

#### `deriveKey(password: string, salt: Buffer, options?: KeyDerivationOptions): Promise<Buffer>`

Derives an encryption key from a password and salt.

**Example:**

```typescript
const encryptionManager = new EncryptionManager();
const salt = crypto.randomBytes(32);
const key = await encryptionManager.deriveKey('password', salt, {
  iterations: 100000,
  keyLength: 32,
});
```

#### `generateSalt(length: number = 32): Buffer`

Generates a cryptographically secure random salt.

**Example:**

```typescript
const salt = encryptionManager.generateSalt(32);
```

### Encryption Operations

#### `encrypt(data: string, key: Buffer): Promise<EncryptedData>`

Encrypts data using the specified key.

**Example:**

```typescript
const encrypted = await encryptionManager.encrypt('secret-data', key);
console.log(`IV: ${encrypted.iv}`);
console.log(`Data: ${encrypted.data}`);
console.log(`Tag: ${encrypted.tag}`);
```

#### `decrypt(encryptedData: EncryptedData, key: Buffer): Promise<string>`

Decrypts data using the specified key.

**Example:**

```typescript
const decrypted = await encryptionManager.decrypt(encrypted, key);
console.log(`Decrypted: ${decrypted}`);
```

### Utility Methods

#### `hash(data: string, algorithm: string = 'sha256'): string`

Computes a hash of the input data.

**Example:**

```typescript
const hash = encryptionManager.hash('data-to-hash', 'sha256');
```

#### `compareHash(data: string, hash: string): boolean`

Compares data against a hash value.

**Example:**

```typescript
const isValid = encryptionManager.compareHash('data', existingHash);
```

#### `generateRandomBytes(length: number): Buffer`

Generates cryptographically secure random bytes.

**Example:**

```typescript
const randomData = encryptionManager.generateRandomBytes(32);
```

## Error Classes

SafeKey provides specific error classes for different types of failures.

### SafeKeyError

Base error class for all SafeKey-related errors.

```typescript
class SafeKeyError extends Error {
  readonly code: string;
  readonly details?: any;

  constructor(message: string, code: string, details?: any);
}
```

### VaultError

Errors related to vault operations.

```typescript
class VaultError extends SafeKeyError {
  readonly vaultName: string;

  constructor(message: string, vaultName: string, code?: string);
}
```

### AuthenticationError

Authentication and authorization failures.

```typescript
class AuthenticationError extends SafeKeyError {
  readonly authType: string;

  constructor(message: string, authType: string);
}
```

### EncryptionError

Cryptographic operation failures.

```typescript
class EncryptionError extends SafeKeyError {
  readonly operation: string;

  constructor(message: string, operation: string);
}
```

### NetworkError

Network and cloud sync related errors.

```typescript
class NetworkError extends SafeKeyError {
  readonly provider?: string;
  readonly statusCode?: number;

  constructor(message: string, provider?: string, statusCode?: number);
}
```

For more detailed examples and advanced usage patterns, see the [Core Classes Examples](../examples/core-classes.md).
