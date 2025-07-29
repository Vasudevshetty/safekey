# Configuration

SafeKey provides extensive configuration options to customize behavior, security settings, and integrations. This guide covers all configuration aspects from basic settings to advanced customizations.

## Configuration Overview

SafeKey configuration is managed through:

- **Global configuration**: System-wide settings
- **Vault-specific configuration**: Per-vault settings
- **Environment variables**: Runtime configuration
- **Configuration files**: Persistent settings storage

## Configuration Hierarchy

Settings are applied in the following order (later sources override earlier ones):

1. **Default values** - Built-in defaults
2. **Global configuration file** - `~/.safekey/config.yaml`
3. **Vault configuration file** - `.safekey/vault-config.yaml`
4. **Environment variables** - `SAFEKEY_*` variables
5. **Command-line flags** - Explicit overrides

## Global Configuration

### Configuration File Location

**Default Paths:**

- **Linux/macOS**: `~/.safekey/config.yaml`
- **Windows**: `%USERPROFILE%\.safekey\config.yaml`
- **Custom**: Set via `SAFEKEY_CONFIG_PATH` environment variable

### Basic Configuration Commands

```bash
# Show current configuration
safekey config show

# Show configuration with sources
safekey config show --sources

# Edit configuration interactively
safekey config edit

# Set specific configuration value
safekey config set <key> <value>

# Get specific configuration value
safekey config get <key>

# Reset configuration to defaults
safekey config reset

# Validate configuration
safekey config validate
```

### Configuration Structure

```yaml
# ~/.safekey/config.yaml
version: '1.2.1'

# Global settings
global:
  default_vault: 'personal'
  editor: 'vim'
  pager: 'less'
  timezone: 'UTC'
  locale: 'en_US'

# Security settings
security:
  password_policy:
    min_length: 12
    require_uppercase: true
    require_lowercase: true
    require_numbers: true
    require_symbols: true

  session:
    timeout: '15m'
    max_sessions: 3
    remember_duration: '7d'

  encryption:
    algorithm: 'AES-256-GCM'
    key_derivation:
      function: 'PBKDF2'
      iterations: 100000
      salt_length: 32

  two_factor:
    enabled: false
    backup_codes: 10
    totp_window: 1

# User interface settings
ui:
  theme: 'auto' # auto, light, dark
  colors: true
  interactive: true
  confirm_destructive: true
  show_tips: true

  # Terminal UI settings
  tui:
    enabled: true
    key_bindings: 'vim' # vim, emacs, default
    mouse_support: true
    search_highlight: true

# Cloud provider settings
cloud:
  auto_sync: false
  sync_interval: '5m'
  conflict_resolution: 'prompt' # prompt, local, remote, newest

  providers:
    github:
      default_visibility: 'private'
      description_template: 'SafeKey vault: {vault_name}'

    aws_s3:
      default_region: 'us-east-1'
      storage_class: 'STANDARD'
      encryption: 'AES256'

    azure_blob:
      default_tier: 'Hot'
      redundancy: 'LRS'

# Team settings
team:
  default_role: 'viewer'
  invite_expiry: '7d'
  auto_accept_known_users: false
  audit_retention: '1y'

# Logging settings
logging:
  level: 'info' # debug, info, warn, error
  file: '~/.safekey/logs/safekey.log'
  max_size: '10MB'
  max_backups: 5
  compress: true

  # Audit logging
  audit:
    enabled: true
    file: '~/.safekey/logs/audit.log'
    include_reads: false
    include_metadata: true

# Development settings
development:
  debug: false
  profiling: false
  metrics: false
  api_timeout: '30s'
```

## Security Configuration

### Password Policy

Configure password requirements and validation:

```bash
# Set minimum password length
safekey config set security.password_policy.min_length 14

# Require special characters
safekey config set security.password_policy.require_symbols true

# Configure password strength checking
safekey config set security.password_policy.strength_check true

# Set password history
safekey config set security.password_policy.history_size 5
```

### Session Management

Configure authentication sessions:

```bash
# Set session timeout
safekey config set security.session.timeout "30m"

# Configure maximum concurrent sessions
safekey config set security.session.max_sessions 5

# Set remember me duration
safekey config set security.session.remember_duration "14d"

# Enable session encryption
safekey config set security.session.encrypt true
```

### Encryption Settings

Configure cryptographic parameters:

```bash
# Set PBKDF2 iterations
safekey config set security.encryption.key_derivation.iterations 150000

# Configure encryption algorithm
safekey config set security.encryption.algorithm "AES-256-GCM"

# Set salt length
safekey config set security.encryption.key_derivation.salt_length 32

# Enable memory protection
safekey config set security.encryption.memory_protection true
```

### Two-Factor Authentication

Configure 2FA settings:

```bash
# Enable two-factor authentication
safekey config set security.two_factor.enabled true

# Set TOTP time window
safekey config set security.two_factor.totp_window 2

# Configure backup codes
safekey config set security.two_factor.backup_codes 12

# Set 2FA provider
safekey config set security.two_factor.provider "totp"  # totp, sms, email
```

## User Interface Configuration

### Terminal Interface

Customize the command-line interface:

```bash
# Set default editor
safekey config set global.editor "code"

# Configure pager
safekey config set global.pager "bat"

# Set color scheme
safekey config set ui.theme "dark"

# Enable/disable colors
safekey config set ui.colors true

# Configure confirmation prompts
safekey config set ui.confirm_destructive true
```

### Terminal UI (TUI) Settings

Configure the interactive terminal interface:

```bash
# Enable TUI mode
safekey config set ui.tui.enabled true

# Set key bindings
safekey config set ui.tui.key_bindings "vim"

# Enable mouse support
safekey config set ui.tui.mouse_support true

# Configure search highlighting
safekey config set ui.tui.search_highlight true

# Set refresh rate
safekey config set ui.tui.refresh_rate "100ms"
```

### Output Formatting

Configure output formats and verbosity:

```bash
# Set default output format
safekey config set ui.output_format "table"  # table, json, yaml, csv

# Configure date format
safekey config set ui.date_format "2006-01-02 15:04:05"

# Set timezone
safekey config set global.timezone "America/New_York"

# Configure verbosity
safekey config set ui.verbosity "normal"  # quiet, normal, verbose, debug
```

## Cloud Configuration

### Auto-Sync Settings

Configure automatic synchronization:

```bash
# Enable auto-sync
safekey config set cloud.auto_sync true

# Set sync interval
safekey config set cloud.sync_interval "10m"

# Configure sync triggers
safekey config set cloud.sync_on_change true
safekey config set cloud.sync_on_startup true

# Set conflict resolution strategy
safekey config set cloud.conflict_resolution "prompt"
```

### Provider-Specific Configuration

#### GitHub Configuration

```bash
# Set default gist visibility
safekey config set cloud.providers.github.default_visibility "private"

# Configure description template
safekey config set cloud.providers.github.description_template "SafeKey: {vault_name} - {timestamp}"

# Set API timeout
safekey config set cloud.providers.github.api_timeout "30s"

# Configure rate limiting
safekey config set cloud.providers.github.rate_limit_buffer 0.1
```

#### AWS S3 Configuration

```bash
# Set default region
safekey config set cloud.providers.aws_s3.default_region "eu-west-1"

# Configure storage class
safekey config set cloud.providers.aws_s3.storage_class "STANDARD_IA"

# Set encryption method
safekey config set cloud.providers.aws_s3.encryption "aws:kms"

# Configure multipart upload threshold
safekey config set cloud.providers.aws_s3.multipart_threshold "100MB"
```

#### Azure Blob Configuration

```bash
# Set default tier
safekey config set cloud.providers.azure_blob.default_tier "Cool"

# Configure redundancy
safekey config set cloud.providers.azure_blob.redundancy "GRS"

# Set block size
safekey config set cloud.providers.azure_blob.block_size "4MB"

# Configure access tier
safekey config set cloud.providers.azure_blob.access_tier "Hot"
```

## Vault-Specific Configuration

### Per-Vault Settings

Each vault can have its own configuration file:

```yaml
# .safekey/vault-config.yaml
vault:
  name: 'Production Secrets'
  description: 'Production environment secrets'

  # Vault-specific security settings
  security:
    require_2fa: true
    session_timeout: '5m'
    audit_all_access: true

  # Cloud sync settings for this vault
  cloud:
    enabled: true
    provider: 'aws-s3'
    sync_interval: '2m'
    backup_copies: 3

  # Team settings
  team:
    enabled: true
    default_role: 'viewer'
    require_approval: true

  # Automation settings
  automation:
    hooks:
      pre_sync: './scripts/backup.sh'
      post_sync: './scripts/notify.sh'

    scheduled_tasks:
      - name: 'daily_backup'
        schedule: '0 2 * * *' # Daily at 2 AM
        command: 'safekey backup'
```

### Vault Configuration Commands

```bash
# Show vault configuration
safekey vault config show

# Set vault-specific setting
safekey vault config set security.require_2fa true

# Get vault setting
safekey vault config get cloud.provider

# Reset vault configuration
safekey vault config reset

# Copy configuration from another vault
safekey vault config copy source-vault target-vault
```

## Environment Variables

### Core Environment Variables

```bash
# Configuration file path
export SAFEKEY_CONFIG_PATH="/custom/path/config.yaml"

# Default vault
export SAFEKEY_DEFAULT_VAULT="work-secrets"

# Disable interactive prompts
export SAFEKEY_NON_INTERACTIVE=true

# Set log level
export SAFEKEY_LOG_LEVEL=debug

# Cloud provider credentials
export SAFEKEY_GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
export SAFEKEY_AWS_ACCESS_KEY_ID="AKIAXXXXXXXX"
export SAFEKEY_AWS_SECRET_ACCESS_KEY="xxxxxxxx"
export SAFEKEY_AZURE_STORAGE_ACCOUNT="myaccount"
export SAFEKEY_AZURE_STORAGE_KEY="xxxxxxxx"

# Security settings
export SAFEKEY_SESSION_TIMEOUT="15m"
export SAFEKEY_REQUIRE_2FA=true

# UI settings
export SAFEKEY_NO_COLOR=true
export SAFEKEY_EDITOR="nano"
export SAFEKEY_PAGER="cat"
```

### Development Environment Variables

```bash
# Enable debug mode
export SAFEKEY_DEBUG=true

# Enable profiling
export SAFEKEY_PROFILE=true

# Set API endpoint for development
export SAFEKEY_API_ENDPOINT="http://localhost:8080"

# Disable TLS verification (development only)
export SAFEKEY_INSECURE_TLS=true

# Mock cloud providers
export SAFEKEY_MOCK_CLOUD=true
```

## Advanced Configuration

### Custom Hooks and Scripts

Configure custom scripts for various events:

```yaml
hooks:
  # Vault lifecycle hooks
  vault_created: './scripts/setup-vault.sh'
  vault_opened: './scripts/audit-access.sh'
  vault_closed: './scripts/cleanup.sh'

  # Secret lifecycle hooks
  secret_added: './scripts/log-addition.sh'
  secret_modified: './scripts/backup-change.sh'
  secret_accessed: './scripts/audit-access.sh'

  # Sync hooks
  pre_sync: './scripts/pre-sync-backup.sh'
  post_sync: './scripts/post-sync-notify.sh'
  sync_conflict: './scripts/handle-conflict.sh'

  # Team hooks
  member_added: './scripts/welcome-member.sh'
  member_removed: './scripts/revoke-access.sh'
```

### Plugin Configuration

Configure SafeKey plugins and extensions:

```yaml
plugins:
  enabled: true
  directory: '~/.safekey/plugins'

  # Plugin-specific configuration
  password_generator:
    default_length: 16
    include_symbols: true
    exclude_ambiguous: true

  integrations:
    slack:
      webhook_url: 'https://hooks.slack.com/...'
      channel: '#security'

    email:
      smtp_server: 'smtp.example.com'
      from_address: 'safekey@example.com'
```

### Performance Tuning

Optimize SafeKey performance:

```yaml
performance:
  # Cache settings
  cache:
    enabled: true
    size: '100MB'
    ttl: '30m'
    compression: true

  # Parallel operations
  concurrency:
    max_workers: 4
    sync_workers: 2
    backup_workers: 1

  # Memory settings
  memory:
    limit: '256MB'
    gc_percentage: 10

  # Network settings
  network:
    timeout: '30s'
    retries: 3
    keep_alive: true
```

## Configuration Profiles

### Multiple Profiles

Manage different configuration profiles:

```bash
# Create new profile
safekey config profile create work

# Switch to profile
safekey config profile use work

# List profiles
safekey config profile list

# Copy profile
safekey config profile copy work personal

# Delete profile
safekey config profile delete old-profile
```

### Profile Structure

```yaml
# ~/.safekey/profiles/work.yaml
profile:
  name: 'work'
  description: 'Work environment configuration'

# Include all configuration sections
global:
  default_vault: 'work-secrets'

security:
  session_timeout: '8h'

cloud:
  auto_sync: true
  provider: 'aws-s3'
```

## Configuration Validation

### Validation Commands

```bash
# Validate current configuration
safekey config validate

# Validate specific file
safekey config validate --file /path/to/config.yaml

# Check for deprecated settings
safekey config validate --check-deprecated

# Validate and show suggestions
safekey config validate --suggestions
```

### Configuration Schema

SafeKey uses JSON Schema for configuration validation:

```bash
# Show configuration schema
safekey config schema

# Export schema to file
safekey config schema --output schema.json

# Validate against custom schema
safekey config validate --schema custom-schema.json
```

## Migration and Backup

### Configuration Backup

```bash
# Backup current configuration
safekey config backup --output config-backup.yaml

# Restore from backup
safekey config restore config-backup.yaml

# Export configuration for sharing
safekey config export --sanitize --output shared-config.yaml
```

### Configuration Migration

```bash
# Migrate from older version
safekey config migrate --from-version 1.1.0

# Migrate configuration format
safekey config migrate --format yaml

# Preview migration changes
safekey config migrate --dry-run
```

## Troubleshooting Configuration

### Common Issues

**Configuration file not found:**

```bash
# Check configuration file location
safekey config show --sources

# Create default configuration
safekey config init
```

**Invalid configuration:**

```bash
# Validate configuration
safekey config validate

# Reset to defaults
safekey config reset --confirm
```

**Environment variable conflicts:**

```bash
# Show environment variables
safekey config show --env-only

# Clear SafeKey environment variables
unset $(env | grep SAFEKEY_ | cut -d= -f1)
```

### Debug Configuration

```bash
# Show effective configuration with sources
safekey config debug

# Trace configuration loading
safekey --debug config show

# Test configuration changes
safekey config test --dry-run
```

For more configuration help, see the [Configuration Troubleshooting Guide](../troubleshooting/common-issues.md#configuration-issues).
