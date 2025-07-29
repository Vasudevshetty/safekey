# Cloud Sync Commands

SafeKey supports synchronization with multiple cloud providers to enable secure sharing and backup of your vaults across devices. This guide covers all cloud synchronization commands and workflows.

## Overview

Cloud sync functionality allows you to:

- Sync vaults across multiple devices
- Backup vaults to cloud storage
- Share vaults securely with team members
- Resolve sync conflicts automatically or manually
- Monitor sync status and history

## Supported Cloud Providers

- **GitHub Gist** - Simple, developer-friendly option
- **AWS S3** - Enterprise-grade storage with fine-grained access control
- **Azure Blob Storage** - Microsoft cloud storage solution
- **Google Cloud Storage** - Coming soon
- **Dropbox** - Coming soon

## Core Cloud Commands

### `safekey cloud`

Main command for cloud synchronization operations.

**Syntax:**

```bash
safekey cloud <subcommand> [options]
```

**Subcommands:**

- [`configure`](#cloud-configure) - Configure cloud provider
- [`sync`](#cloud-sync) - Synchronize vaults
- [`status`](#cloud-status) - Check sync status
- [`upload`](#cloud-upload) - Upload vault to cloud
- [`download`](#cloud-download) - Download vault from cloud
- [`providers`](#cloud-providers) - Manage cloud providers
- [`conflicts`](#cloud-conflicts) - Handle sync conflicts
- [`history`](#cloud-history) - View sync history

---

## Cloud Configuration Commands

### `cloud configure`

Configure cloud provider credentials and settings.

**Syntax:**

```bash
safekey cloud configure <provider> [options]
```

**Options:**

```bash
  --interactive               Interactive configuration wizard
  --credentials <file>        Load credentials from file
  --test                     Test connection after configuration
  --set-default              Set as default provider
  -f, --force                Overwrite existing configuration
```

**Examples:**

```bash
# Interactive configuration
safekey cloud configure github --interactive

# Configure AWS S3 with credentials file
safekey cloud configure aws-s3 --credentials aws-credentials.json

# Configure and test connection
safekey cloud configure azure-blob --interactive --test
```

#### GitHub Gist Configuration

```bash
safekey cloud configure github --interactive
```

**Required Information:**

- **Personal Access Token**: GitHub token with gist permissions
- **Gist Visibility**: Public or private gists
- **Description Template**: Template for gist descriptions

**Setup Steps:**

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Create token with `gist` scope
3. Enter token when prompted
4. Choose gist visibility preferences

#### AWS S3 Configuration

```bash
safekey cloud configure aws-s3 --interactive
```

**Required Information:**

- **Access Key ID**: AWS access key
- **Secret Access Key**: AWS secret key
- **Region**: AWS region (e.g., us-east-1)
- **Bucket Name**: S3 bucket for vault storage
- **Prefix**: Optional path prefix for vault files

**Setup Steps:**

1. Create IAM user with S3 permissions
2. Create S3 bucket with appropriate permissions
3. Generate access keys
4. Configure SafeKey with credentials

#### Azure Blob Storage Configuration

```bash
safekey cloud configure azure-blob --interactive
```

**Required Information:**

- **Account Name**: Azure storage account name
- **Account Key**: Azure storage account key
- **Container Name**: Blob container for vault storage
- **SAS Token**: Alternative to account key

### `cloud providers`

Manage configured cloud providers.

**Syntax:**

```bash
safekey cloud providers <subcommand> [options]
```

**Subcommands:**

- `list` - List configured providers
- `test` - Test provider connections
- `remove` - Remove provider configuration
- `default` - Set default provider

**Examples:**

```bash
# List all configured providers
safekey cloud providers list

# Test all provider connections
safekey cloud providers test

# Test specific provider
safekey cloud providers test github

# Set default provider
safekey cloud providers default aws-s3

# Remove provider configuration
safekey cloud providers remove azure-blob
```

---

## Synchronization Commands

### `cloud sync`

Synchronize vaults with cloud storage.

**Syntax:**

```bash
safekey cloud sync [vault-name] [options]
```

**Options:**

```bash
  --provider <provider>       Use specific cloud provider
  --direction <direction>     Sync direction (up|down|both)
  --force                    Force sync without conflict resolution
  --dry-run                  Show what would be synced without doing it
  --auto-resolve             Automatically resolve conflicts
  --backup                   Create backup before sync
```

**Sync Directions:**

- `up` - Upload local changes to cloud
- `down` - Download cloud changes to local
- `both` - Bi-directional sync (default)

**Examples:**

```bash
# Sync current vault
safekey cloud sync

# Sync specific vault
safekey cloud sync "production-secrets"

# Upload only (push local changes)
safekey cloud sync --direction up

# Dry run to see what would change
safekey cloud sync --dry-run

# Force sync with automatic conflict resolution
safekey cloud sync --force --auto-resolve

# Sync with specific provider
safekey cloud sync --provider github
```

### `cloud upload`

Upload a vault to cloud storage.

**Syntax:**

```bash
safekey cloud upload [vault-name] [options]
```

**Options:**

```bash
  --provider <provider>       Target cloud provider
  --encrypt                  Additional encryption layer
  --compress                 Compress before upload
  --metadata                 Include vault metadata
  --overwrite                Overwrite existing cloud vault
```

**Examples:**

```bash
# Upload current vault
safekey cloud upload

# Upload with compression and encryption
safekey cloud upload --compress --encrypt

# Upload to specific provider
safekey cloud upload "team-vault" --provider aws-s3
```

### `cloud download`

Download a vault from cloud storage.

**Syntax:**

```bash
safekey cloud download <vault-identifier> [options]
```

**Options:**

```bash
  --provider <provider>       Source cloud provider
  --name <name>              Local name for downloaded vault
  --decrypt                  Decrypt additional encryption layer
  --merge                    Merge with existing local vault
  --overwrite                Overwrite existing local vault
```

**Examples:**

```bash
# Download vault by ID
safekey cloud download vault_abc123

# Download and merge with local vault
safekey cloud download vault_abc123 --merge

# Download from specific provider
safekey cloud download vault_abc123 --provider github --name "downloaded-vault"
```

---

## Status and Monitoring Commands

### `cloud status`

Check cloud synchronization status.

**Syntax:**

```bash
safekey cloud status [vault-name] [options]
```

**Options:**

```bash
  --all                      Show status for all vaults
  --provider <provider>      Check specific provider only
  -j, --json                Output in JSON format
  --detailed                Show detailed sync information
```

**Examples:**

```bash
# Check current vault status
safekey cloud status

# Check all vaults
safekey cloud status --all

# Detailed status for specific vault
safekey cloud status "production-secrets" --detailed
```

**Status Output Example:**

```
Cloud Sync Status: production-secrets
────────────────────────────────────
Provider:           GitHub Gist
Vault ID:           vault_abc123def456
Last Sync:          2025-01-29 15:30:00 UTC
Local Modified:     2025-01-29 15:25:00 UTC
Cloud Modified:     2025-01-29 15:30:00 UTC
Status:             ✓ In Sync
Conflicts:          None
Auto Sync:          Enabled (every 5 minutes)

Sync History (last 5):
2025-01-29 15:30:00  ↑ Upload    Success  3 secrets updated
2025-01-29 15:25:00  ↓ Download  Success  1 secret added
2025-01-29 15:20:00  ↑ Upload    Success  2 secrets modified
2025-01-29 15:15:00  ↑ Upload    Success  Initial sync
```

### `cloud history`

View cloud synchronization history.

**Syntax:**

```bash
safekey cloud history [vault-name] [options]
```

**Options:**

```bash
  --provider <provider>       Filter by provider
  --limit <number>           Number of entries to show
  --since <date>             Show history since date
  --action <action>          Filter by action type
  -j, --json                Output in JSON format
```

**Action Types:**

- `upload` - Vault uploaded to cloud
- `download` - Vault downloaded from cloud
- `sync` - Bi-directional synchronization
- `conflict` - Sync conflict occurred
- `resolve` - Conflict resolution

**Examples:**

```bash
# Show recent sync history
safekey cloud history

# Show last 10 sync operations
safekey cloud history --limit 10

# Show sync history since yesterday
safekey cloud history --since "1 day ago"

# Show only conflicts
safekey cloud history --action conflict
```

---

## Conflict Resolution Commands

### `cloud conflicts`

Handle synchronization conflicts.

**Syntax:**

```bash
safekey cloud conflicts <subcommand> [vault-name] [options]
```

**Subcommands:**

- `list` - List current conflicts
- `resolve` - Resolve conflicts
- `auto-resolve` - Automatically resolve conflicts
- `abort` - Abort conflict resolution

**Examples:**

```bash
# List all conflicts
safekey cloud conflicts list

# Resolve conflicts interactively
safekey cloud conflicts resolve

# Auto-resolve using strategy
safekey cloud conflicts auto-resolve --strategy newest

# Resolve specific vault conflicts
safekey cloud conflicts resolve "production-secrets"
```

### Conflict Resolution Strategies

#### Manual Resolution

Interactive resolution with user choices for each conflict:

```bash
safekey cloud conflicts resolve --interactive
```

**Options for each conflict:**

- Use local version
- Use cloud version
- Merge changes manually
- Skip this conflict

#### Automatic Resolution Strategies

```bash
# Use newest version based on timestamp
safekey cloud conflicts auto-resolve --strategy newest

# Always prefer local version
safekey cloud conflicts auto-resolve --strategy local

# Always prefer cloud version
safekey cloud conflicts auto-resolve --strategy cloud

# Attempt automatic merge
safekey cloud conflicts auto-resolve --strategy merge
```

#### Conflict Types

**Secret Value Conflicts:**

- Same secret modified in both local and cloud
- Resolution: Choose version or manually merge

**Metadata Conflicts:**

- Secret descriptions, tags, or timestamps differ
- Resolution: Usually merge metadata

**Structural Conflicts:**

- Secret added/deleted in one location
- Resolution: Apply both changes or choose one

---

## Advanced Cloud Features

### Automatic Synchronization

Enable automatic background synchronization:

```bash
# Enable auto-sync
safekey cloud auto-sync enable

# Configure sync interval
safekey cloud auto-sync configure --interval "5m"

# Set sync conditions
safekey cloud auto-sync configure \
  --on-change \
  --on-startup \
  --when-idle

# Check auto-sync status
safekey cloud auto-sync status
```

### Cloud Vault Sharing

Share vaults via cloud storage:

```bash
# Generate shareable vault link
safekey cloud share "team-vault" --generate-link

# Share with specific permissions
safekey cloud share "team-vault" \
  --permissions "read-only" \
  --expires "7d"

# List shared vaults
safekey cloud share list

# Revoke sharing
safekey cloud share revoke "team-vault"
```

### Multi-Provider Sync

Sync with multiple cloud providers simultaneously:

```bash
# Configure multi-provider sync
safekey cloud multi-sync configure \
  --primary github \
  --backup aws-s3

# Sync to all configured providers
safekey cloud multi-sync

# Check multi-provider status
safekey cloud multi-sync status
```

### Cloud Encryption

Additional encryption layer for cloud storage:

```bash
# Enable cloud encryption
safekey cloud encryption enable --key-source password

# Use key file for encryption
safekey cloud encryption enable --key-source file --key-file cloud.key

# Rotate cloud encryption key
safekey cloud encryption rotate-key

# Disable cloud encryption
safekey cloud encryption disable
```

---

## Provider-Specific Features

### GitHub Gist Features

```bash
# List all SafeKey gists
safekey cloud github list-gists

# Clone public gist
safekey cloud github clone <gist-id>

# Set gist visibility
safekey cloud github set-visibility private

# Add collaborators to gist
safekey cloud github add-collaborator <username>
```

### AWS S3 Features

```bash
# Configure S3 lifecycle policies
safekey cloud aws-s3 lifecycle configure

# Enable S3 versioning
safekey cloud aws-s3 versioning enable

# Set up cross-region replication
safekey cloud aws-s3 replication configure --target-region us-west-2

# Configure S3 encryption
safekey cloud aws-s3 encryption configure --kms-key-id <key-id>
```

### Azure Blob Features

```bash
# Configure blob tiers
safekey cloud azure-blob tier set --tier hot

# Enable blob versioning
safekey cloud azure-blob versioning enable

# Configure blob lifecycle management
safekey cloud azure-blob lifecycle configure

# Set up geo-redundancy
safekey cloud azure-blob redundancy set --type geo
```

## Best Practices

### Security Practices

- Use strong, unique credentials for cloud providers
- Enable additional encryption for sensitive vaults
- Regularly rotate cloud provider access keys
- Monitor sync logs for unusual activity

### Sync Management

- Configure appropriate sync intervals
- Use automatic conflict resolution strategies carefully
- Regular backup before major sync operations
- Test sync configuration in non-production environments

### Provider Selection

- Choose providers based on your security requirements
- Consider geographic data residency requirements
- Evaluate provider-specific features and limitations
- Have backup providers configured

### Conflict Prevention

- Coordinate team access to shared vaults
- Use descriptive commit messages for changes
- Avoid simultaneous editing of the same secrets
- Regular synchronization to minimize conflicts

## Troubleshooting

### Common Issues

**Authentication failures:**

```bash
# Test provider credentials
safekey cloud providers test <provider>

# Reconfigure provider
safekey cloud configure <provider> --force
```

**Sync conflicts:**

```bash
# Check conflict status
safekey cloud conflicts list

# Reset to known good state
safekey cloud sync --force --direction down
```

**Network connectivity:**

```bash
# Test network connectivity
safekey cloud providers test --network-only

# Configure proxy settings
safekey cloud configure proxy --http-proxy <proxy-url>
```

**Provider-specific errors:**

```bash
# Check provider status pages
safekey cloud providers status

# View detailed error logs
safekey cloud history --detailed --action error
```

For more troubleshooting help, see the [Cloud Sync Troubleshooting Guide](../troubleshooting/common-issues.md#cloud-sync-issues).
