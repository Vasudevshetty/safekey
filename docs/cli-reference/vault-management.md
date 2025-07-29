# Vault Management Commands

This guide covers all commands related to vault creation, management, and configuration in SafeKey.

## Overview

Vault management commands allow you to:

- Create and initialize new vaults
- Configure vault settings
- Manage vault passwords and security
- Backup and restore vaults
- Handle vault corruption and recovery

## Core Vault Commands

### `safekey init`

Initialize a new SafeKey vault in the current directory.

**Syntax:**

```bash
safekey init [options]
```

**Options:**

```bash
  -n, --name <name>        Vault name (default: current directory name)
  -d, --description <desc> Vault description
  -p, --password           Prompt for master password (default: true)
  --no-password           Create vault without password (insecure)
  -f, --force             Overwrite existing vault
  -q, --quiet             Suppress output messages
```

**Examples:**

```bash
# Basic vault initialization
safekey init

# Initialize with custom name and description
safekey init -n "Production Secrets" -d "Production environment secrets"

# Force overwrite existing vault
safekey init --force

# Initialize quietly
safekey init -q
```

**Related:**

- [`safekey list`](#safekey-list) - List available vaults
- [`safekey vault info`](#safekey-vault-info) - View vault information

### `safekey vault`

Main command for vault operations and management.

**Syntax:**

```bash
safekey vault <subcommand> [options]
```

**Subcommands:**

- [`info`](#vault-info) - Display vault information
- [`list`](#vault-list) - List all vaults
- [`switch`](#vault-switch) - Switch active vault
- [`rename`](#vault-rename) - Rename a vault
- [`change-password`](#vault-change-password) - Change master password
- [`backup`](#vault-backup) - Create vault backup
- [`restore`](#vault-restore) - Restore from backup
- [`verify`](#vault-verify) - Verify vault integrity
- [`repair`](#vault-repair) - Repair corrupted vault
- [`delete`](#vault-delete) - Delete a vault

---

## Vault Information Commands

### `vault info`

Display detailed information about the current or specified vault.

**Syntax:**

```bash
safekey vault info [vault-name] [options]
```

**Options:**

```bash
  -v, --verbose           Show detailed information
  -j, --json             Output in JSON format
  --stats                Include usage statistics
  --security             Show security parameters
```

**Examples:**

```bash
# Show current vault info
safekey vault info

# Show detailed info with statistics
safekey vault info --verbose --stats

# Get info in JSON format
safekey vault info --json

# Show security parameters
safekey vault info --security
```

**Output Example:**

```
Vault Information
─────────────────
Name:           Production Secrets
Description:    Production environment secrets
Location:       /home/user/.safekey/vaults/production.vault
Created:        2025-01-29 10:30:00 UTC
Modified:       2025-01-29 15:45:00 UTC
Secrets:        42
Size:           15.2 KB
Encrypted:      Yes (AES-256-GCM)
Team Members:   3
Cloud Sync:     Enabled (GitHub Gist)
```

### `vault list`

List all available vaults with their basic information.

**Syntax:**

```bash
safekey vault list [options]
```

**Options:**

```bash
  -v, --verbose           Show detailed information
  -j, --json             Output in JSON format
  --active               Show only active vault
  --team                 Show only team vaults
  --local                Show only local vaults
```

**Examples:**

```bash
# List all vaults
safekey vault list

# List with details
safekey vault list --verbose

# List only team vaults
safekey vault list --team

# Output as JSON
safekey vault list --json
```

---

## Vault Configuration Commands

### `vault switch`

Switch the active vault context.

**Syntax:**

```bash
safekey vault switch <vault-name>
```

**Examples:**

```bash
# Switch to production vault
safekey vault switch production

# Switch with auto-completion
safekey vault switch <TAB>
```

### `vault rename`

Rename an existing vault.

**Syntax:**

```bash
safekey vault rename <old-name> <new-name> [options]
```

**Options:**

```bash
  -f, --force             Force rename without confirmation
  --update-refs           Update references in team configurations
```

**Examples:**

```bash
# Rename vault
safekey vault rename "old-name" "new-name"

# Force rename without confirmation
safekey vault rename old-name new-name --force
```

---

## Security Management Commands

### `vault change-password`

Change the master password for a vault.

**Syntax:**

```bash
safekey vault change-password [vault-name] [options]
```

**Options:**

```bash
  --current-password      Specify current password (not recommended)
  --new-password          Specify new password (not recommended)
  --verify                Verify vault integrity after change
  --backup                Create backup before password change
```

**Examples:**

```bash
# Change password with prompts
safekey vault change-password

# Change password for specific vault
safekey vault change-password production

# Change with automatic backup
safekey vault change-password --backup

# Change and verify integrity
safekey vault change-password --verify
```

**Security Notes:**

- Always creates a backup before password change
- Re-encrypts entire vault with new password
- Invalidates all existing sessions
- Updates key derivation parameters

---

## Backup and Recovery Commands

### `vault backup`

Create a backup of the vault.

**Syntax:**

```bash
safekey vault backup [vault-name] [options]
```

**Options:**

```bash
  -o, --output <file>     Output backup file path
  --compress              Compress backup file
  --encrypt               Encrypt backup with separate password
  --metadata              Include metadata in backup
  --exclude-logs          Exclude access logs from backup
```

**Examples:**

```bash
# Create basic backup
safekey vault backup

# Create compressed encrypted backup
safekey vault backup --compress --encrypt -o production-backup.vault.gz

# Backup without access logs
safekey vault backup --exclude-logs
```

### `vault restore`

Restore a vault from backup.

**Syntax:**

```bash
safekey vault restore <backup-file> [options]
```

**Options:**

```bash
  -n, --name <name>       Name for restored vault
  --overwrite             Overwrite existing vault
  --verify                Verify backup integrity before restore
  --decrypt               Decrypt encrypted backup
```

**Examples:**

```bash
# Restore from backup
safekey vault restore backup.vault

# Restore with new name
safekey vault restore backup.vault --name "restored-vault"

# Restore encrypted backup
safekey vault restore backup.vault.enc --decrypt

# Verify and restore
safekey vault restore backup.vault --verify
```

---

## Maintenance Commands

### `vault verify`

Verify the integrity of a vault.

**Syntax:**

```bash
safekey vault verify [vault-name] [options]
```

**Options:**

```bash
  --deep                  Perform deep integrity check
  --report                Generate detailed report
  -j, --json             Output results in JSON format
  --fix                   Automatically fix minor issues
```

**Examples:**

```bash
# Basic verification
safekey vault verify

# Deep verification with report
safekey vault verify --deep --report

# Verify and auto-fix issues
safekey vault verify --fix
```

**Verification Checks:**

- File format integrity
- Encryption consistency
- Metadata validation
- Secret structure verification
- Access log consistency

### `vault repair`

Repair a corrupted vault.

**Syntax:**

```bash
safekey vault repair <vault-name> [options]
```

**Options:**

```bash
  --backup                Create backup before repair
  --force                 Force repair without confirmation
  --recover-secrets       Attempt to recover corrupted secrets
  --rebuild-index         Rebuild vault index
```

**Examples:**

```bash
# Repair with automatic backup
safekey vault repair production --backup

# Force repair corrupted vault
safekey vault repair damaged-vault --force --recover-secrets

# Rebuild vault index
safekey vault repair vault-name --rebuild-index
```

### `vault delete`

Delete a vault permanently.

**Syntax:**

```bash
safekey vault delete <vault-name> [options]
```

**Options:**

```bash
  --confirm               Skip confirmation prompt
  --backup                Create backup before deletion
  --secure-delete         Securely overwrite vault file
  --team-notify           Notify team members (for team vaults)
```

**Examples:**

```bash
# Delete with confirmation
safekey vault delete old-vault

# Delete with backup
safekey vault delete old-vault --backup

# Secure delete without confirmation
safekey vault delete old-vault --confirm --secure-delete
```

**⚠️ Warning:** Vault deletion is permanent and cannot be undone without a backup.

---

## Advanced Vault Operations

### Vault Migration

Migrate vault format to newer version:

```bash
# Check if migration is needed
safekey vault info --version

# Migrate to latest format
safekey vault migrate [vault-name] [options]
```

### Vault Analytics

Get usage analytics for a vault:

```bash
# Show vault usage statistics
safekey vault stats [vault-name] [options]

# Generate usage report
safekey vault report [vault-name] [options]
```

### Vault Configuration

Configure vault-specific settings:

```bash
# Show vault configuration
safekey vault config show

# Set configuration value
safekey vault config set <key> <value>

# Reset configuration to defaults
safekey vault config reset
```

## Best Practices

### Vault Organization

- Use descriptive names for vaults
- Separate personal and work vaults
- Create project-specific vaults for large projects
- Regular backup of important vaults

### Security Practices

- Change master passwords regularly
- Verify vault integrity periodically
- Keep backups in secure locations
- Use strong, unique master passwords

### Team Vaults

- Implement proper access controls
- Regular audit of team member access
- Document vault purposes and access policies
- Plan for member onboarding/offboarding

### Maintenance

- Regular vault verification
- Monitor vault sizes and performance
- Clean up unused vaults
- Update to latest SafeKey versions

## Troubleshooting

### Common Issues

**Vault not found:**

```bash
# List available vaults
safekey vault list

# Check current directory for vault
ls -la .safekey/
```

**Corruption errors:**

```bash
# Verify vault integrity
safekey vault verify --deep

# Attempt repair
safekey vault repair --backup
```

**Password issues:**

```bash
# Reset password (requires backup)
safekey vault restore backup.vault --name new-vault
```

For more troubleshooting help, see the [Troubleshooting Guide](../troubleshooting/common-issues.md).
