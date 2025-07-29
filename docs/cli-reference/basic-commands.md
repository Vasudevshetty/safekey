# Basic Commands

This section covers the essential SafeKey commands that you'll use in your daily workflow.

## safekey init

Initialize a new vault in the current directory or specified path.

### Syntax

```bash
safekey init [options]
```

### Options

- `--vault <path>` - Specify vault file path (default: ./secrets.vault)
- `--name <name>` - Set vault name for identification
- `--description <desc>` - Add vault description
- `--team` - Initialize as team vault with collaboration features

### Examples

```bash
# Initialize default vault
safekey init

# Initialize with custom path and name
safekey init --vault ./production.vault --name "Production Secrets"

# Initialize team vault
safekey init --team --vault ./team-secrets.vault
```

## safekey add

Add a new secret or update an existing one in your vault.

### Syntax

```bash
safekey add <key> [options]
```

### Options

- `--vault <path>` - Use specific vault file
- `--description <desc>` - Add description for the secret
- `--tags <tags>` - Comma-separated tags for organization
- `--generate` - Generate a secure random value
- `--length <num>` - Length for generated password (default: 32)

### Examples

```bash
# Add a secret with prompt for value
safekey add API_KEY

# Add with description and tags
safekey add DB_PASSWORD --description "Production database password" --tags "database,production"

# Generate a secure password
safekey add ADMIN_PASSWORD --generate --length 24

# Use specific vault
safekey add API_KEY --vault ./project-secrets.vault
```

## safekey get

Retrieve a secret value from your vault.

### Syntax

```bash
safekey get <key> [options]
```

### Options

- `--vault <path>` - Use specific vault file
- `--show` - Display value in terminal (less secure)
- `--output <format>` - Output format: `clipboard` (default), `raw`, `json`
- `--no-expire` - Don't auto-clear clipboard

### Examples

```bash
# Copy to clipboard (default)
safekey get API_KEY

# Display in terminal
safekey get API_KEY --show

# Get raw value for scripts
API_KEY=$(safekey get API_KEY --output raw)

# Use specific vault
safekey get API_KEY --vault ./project-secrets.vault
```

## safekey list

Display all secrets in your vault with optional filtering.

### Syntax

```bash
safekey list [options]
```

### Options

- `--vault <path>` - Use specific vault file
- `--search <term>` - Search by key name or description
- `--tags <tags>` - Filter by tags (comma-separated)
- `--format <format>` - Output format: `table` (default), `json`, `keys`
- `--sort <field>` - Sort by: `name`, `created`, `modified`, `accessed`

### Examples

```bash
# List all secrets
safekey list

# Search for specific secrets
safekey list --search api

# Filter by tags
safekey list --tags production,database

# Get only key names
safekey list --format keys

# Sort by last modified
safekey list --sort modified
```

## safekey remove

Remove a secret from your vault.

### Syntax

```bash
safekey remove <key> [options]
```

### Options

- `--vault <path>` - Use specific vault file
- `--force` - Skip confirmation prompt
- `--backup` - Create backup before removal

### Examples

```bash
# Remove with confirmation
safekey remove OLD_API_KEY

# Force removal without confirmation
safekey remove OLD_API_KEY --force

# Remove with backup
safekey remove OLD_API_KEY --backup
```

## safekey search

Advanced search across all secrets with filters and sorting.

### Syntax

```bash
safekey search <query> [options]
```

### Options

- `--vault <path>` - Use specific vault file
- `--tags <tags>` - Limit search to specific tags
- `--fields <fields>` - Search in specific fields: `key`, `description`, `tags`
- `--limit <num>` - Maximum number of results

### Examples

```bash
# Search in all fields
safekey search "database"

# Search only in descriptions
safekey search "production" --fields description

# Search with tag filter
safekey search "api" --tags production
```

## safekey info

Display information about a vault or specific secret.

### Syntax

```bash
safekey info [key] [options]
```

### Options

- `--vault <path>` - Use specific vault file
- `--stats` - Show detailed statistics

### Examples

```bash
# Show vault information
safekey info

# Show specific secret info
safekey info API_KEY

# Show detailed stats
safekey info --stats
```

## Command Options

### Global Options

These options work with all commands:

- `--vault <path>` - Specify which vault to use
- `--help` - Show command help
- `--version` - Show SafeKey version
- `--verbose` - Enable verbose output
- `--quiet` - Suppress non-essential output

### Environment Variables

- `SAFEKEY_VAULT` - Default vault path
- `SAFEKEY_MASTER_PASSWORD` - Master password (not recommended for security)
- `SAFEKEY_CONFIG` - Custom config file path

## Exit Codes

SafeKey uses standard exit codes:

- `0` - Success
- `1` - General error
- `2` - Invalid arguments
- `3` - Authentication failed
- `4` - Vault not found
- `5` - Secret not found

## Next Steps

- Learn about [Vault Management](vault-management.md)
- Explore [Team Commands](team-commands.md)
- Set up [Cloud Sync](cloud-sync.md)
