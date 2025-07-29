# Understanding Vaults

Vaults are the core storage mechanism in SafeKey. This guide explains how vaults work, their structure, and best practices for managing them.

## What is a Vault?

A vault is an encrypted file that stores all your secrets. Each vault is:

- **Encrypted** using AES-256-GCM with a unique key derived from your master password
- **Self-contained** - includes all metadata and encrypted secrets
- **Portable** - can be safely backed up and transferred
- **Versioned** - maintains history for audit and recovery

## Vault Structure

### Physical Structure

```
my-secrets.vault
├── Header (unencrypted metadata)
│   ├── Version
│   ├── Salt
│   ├── Key derivation parameters
│   └── Vault ID
└── Encrypted Payload
    ├── Secrets data
    ├── Metadata
    ├── Access logs
    └── Team information
```

### Logical Structure

```json
{
  "version": "1.2.1",
  "id": "vault_abc123",
  "created": "2025-01-29T10:30:00Z",
  "secrets": {
    "API_KEY": {
      "value": "encrypted_value",
      "description": "Production API key",
      "tags": ["api", "production"],
      "created": "2025-01-29T10:30:00Z",
      "modified": "2025-01-29T10:30:00Z",
      "accessed": "2025-01-29T11:15:00Z"
    }
  },
  "metadata": {
    "name": "Production Secrets",
    "description": "Main production environment secrets"
  }
}
```

## Vault Types

### Personal Vaults

Default vault type for individual use:

```bash
# Initialize personal vault
safekey init
```

Features:

- Single-user access
- Local encryption key
- No team sharing capabilities
- Suitable for personal projects

### Team Vaults

Shared vaults for collaborative work:

```bash
# Initialize team vault
safekey init --team
```

Features:

- Multi-user access
- Role-based permissions
- Audit logging
- Secure member management

### Project Vaults

Organized by project or environment:

```bash
# Create project-specific vault
safekey init --vault ./frontend-secrets.vault --name "Frontend Project"
safekey init --vault ./backend-secrets.vault --name "Backend Services"
```

## Vault Naming and Organization

### Naming Conventions

Use descriptive names that indicate the vault's purpose:

```bash
# Good examples
./production-secrets.vault
./staging-environment.vault
./team-shared-keys.vault
./project-alpha-dev.vault

# Avoid generic names
./secrets.vault
./vault.vault
./keys.vault
```

### Directory Structure

Organize vaults in a logical directory structure:

```
~/vaults/
├── personal/
│   ├── development.vault
│   └── testing.vault
├── work/
│   ├── production.vault
│   ├── staging.vault
│   └── team-shared.vault
└── projects/
    ├── project-a/
    │   ├── dev.vault
    │   └── prod.vault
    └── project-b/
        └── secrets.vault
```

## Vault Operations

### Creating Vaults

```bash
# Default vault in current directory
safekey init

# Custom location and name
safekey init --vault ~/vaults/production.vault --name "Production Environment"

# Team vault with description
safekey init --team --vault ./team-secrets.vault --description "Shared team credentials"
```

### Switching Between Vaults

```bash
# Use specific vault for a command
safekey add API_KEY --vault ~/vaults/production.vault

# Set default vault
safekey config set default-vault ~/vaults/production.vault

# Use vault from environment variable
export SAFEKEY_VAULT=~/vaults/production.vault
safekey add API_KEY
```

### Vault Information

```bash
# Show vault information
safekey info

# List all configured vaults
safekey vault list

# Show vault statistics
safekey stats
```

Example output:

```
🛡️  Vault Information

Name: Production Environment
Location: /home/user/vaults/production.vault
Type: Personal
Created: 2025-01-29 10:30:00
Last Modified: 2025-01-29 15:45:00
Secrets Count: 15
Size: 2.3 KB
Status: Unlocked (expires in 28 minutes)
```

## Vault Security

### Encryption Details

- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2 with SHA-256
- **Salt**: 32 random bytes per vault
- **Iterations**: 100,000 (configurable)
- **IV**: 12 random bytes per encryption operation

### Master Password Requirements

SafeKey enforces strong master passwords:

- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, and symbols
- Not a common password (checked against known breaches)
- Not similar to vault name or your username

### Vault Locking

Vaults automatically lock for security:

```bash
# Check lock status
safekey status

# Lock vault manually
safekey lock

# Unlock vault
safekey unlock

# Configure auto-lock timeout
safekey config set auto-lock-timeout 30  # 30 minutes
```

## Backup and Recovery

### Creating Backups

```bash
# Manual backup
cp production.vault production.vault.backup

# Automated backup with timestamp
safekey backup --output production-$(date +%Y%m%d).vault

# Export to encrypted archive
safekey export --format encrypted --output backup.enc
```

### Recovery Procedures

1. **Vault Corruption**:

   ```bash
   # Restore from backup
   cp production.vault.backup production.vault

   # Verify integrity
   safekey verify
   ```

2. **Forgotten Master Password**:
   - No recovery possible (by design)
   - Restore from exported backup if available
   - Use team recovery if vault has multiple members

3. **File System Issues**:

   ```bash
   # Check vault integrity
   safekey verify --vault production.vault

   # Repair if possible
   safekey repair --vault production.vault
   ```

## Best Practices

### Vault Management

1. **Use descriptive names** and organize by purpose
2. **Regular backups** - automate with scripts or CI/CD
3. **Monitor vault size** - large vaults may impact performance
4. **Audit access** - review logs periodically

### Security Practices

1. **Strong master passwords** unique to each vault
2. **Secure storage** of vault files (not in public repos)
3. **Access control** - limit who can access vault files
4. **Regular rotation** of secrets within vaults

### Performance Optimization

1. **Limit vault size** - consider splitting large vaults
2. **Use appropriate key derivation iterations** based on security needs
3. **Regular cleanup** - remove unused secrets

## Advanced Vault Features

### Vault Metadata

```bash
# Set vault metadata
safekey vault set-metadata --name "Production API Keys" --description "All production service API keys"

# Add custom tags to vault
safekey vault tag --add environment:production --add team:backend
```

### Vault Templates

```bash
# Create vault from template
safekey init --template web-app --vault new-project.vault

# Save current vault as template
safekey vault save-template --name web-app --include-structure
```

### Vault Merging

```bash
# Merge two vaults (interactive)
safekey vault merge --source other.vault --target current.vault

# Import secrets from another vault
safekey import --from other.vault --filter "tag:production"
```

## Troubleshooting

Common vault-related issues and solutions:

### Vault Won't Open

- Check file permissions
- Verify master password
- Check for file corruption with `safekey verify`

### Performance Issues

- Consider splitting large vaults
- Adjust key derivation iterations
- Use SSD storage for better I/O

### Sync Conflicts

- Use `safekey resolve` for merge conflicts
- Maintain backup before resolving
- Consider team coordination protocols

## Next Steps

- Learn about [encryption implementation](encryption.md)
- Explore [security model](security.md) details
- Set up [team collaboration](../guides/team-setup.md)
- Configure [cloud sync](../guides/cloud-setup.md)
