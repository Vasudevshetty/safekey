# Common Issues and Solutions

This guide provides solutions to the most frequently encountered issues when using SafeKey. Each section includes diagnostic steps, multiple solution approaches, and prevention strategies.

## Overview

SafeKey issues generally fall into these categories:

- **Installation and Setup**: Problems during initial installation or configuration
- **Authentication and Access**: Issues with vault access, passwords, and permissions
- **Cloud Synchronization**: Problems with cloud provider connectivity and sync
- **Performance**: Slow operations, timeouts, and resource usage
- **Data Integrity**: Corruption, missing data, and backup/restore issues
- **Team Management**: Collaboration problems and permission conflicts
- **Platform-Specific**: OS-specific issues and compatibility problems

## Installation and Setup Issues

### SafeKey Installation Fails

**Symptoms:**

- npm/yarn installation errors
- Missing dependencies
- Permission errors during installation

**Diagnosis:**

```bash
# Check Node.js version
node --version  # Should be 16.0.0 or higher

# Check npm version and permissions
npm --version
npm config get prefix

# Check for global npm permission issues
npm config get user-config
ls -la $(npm config get prefix)
```

**Solutions:**

**Option 1: Fix npm permissions (Linux/macOS)**

```bash
# Create npm global directory in home folder
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# Add to your shell profile
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Install SafeKey
npm install -g @vasudevshetty/safekey
```

**Option 2: Use Node Version Manager**

```bash
# Install nvm (Linux/macOS)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install latest stable Node.js
nvm install node
nvm use node

# Install SafeKey
npm install -g @vasudevshetty/safekey
```

**Option 3: Use Yarn instead of npm**

```bash
# Install Yarn
npm install -g yarn

# Install SafeKey with Yarn
yarn global add @vasudevshetty/safekey
```

**Windows-specific solution:**

```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install using npm
npm install -g @vasudevshetty/safekey

# Or use Chocolatey
choco install nodejs
npm install -g @vasudevshetty/safekey
```

**Prevention:**

- Always use supported Node.js versions (16+)
- Keep npm/yarn updated to latest versions
- Use proper permission settings for global packages

### Command Not Found Error

**Symptoms:**

- `safekey: command not found`
- Installation completes but command is unavailable

**Diagnosis:**

```bash
# Check if SafeKey was installed
npm list -g @vasudevshetty/safekey

# Check PATH
echo $PATH
which safekey

# Check npm global bin directory
npm config get prefix
ls -la $(npm config get prefix)/bin/
```

**Solutions:**

**Option 1: Fix PATH**

```bash
# Add npm global bin to PATH
export PATH="$(npm config get prefix)/bin:$PATH"

# Make permanent by adding to shell profile
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**Option 2: Create symlink**

```bash
# Find SafeKey binary
find $(npm config get prefix) -name "safekey*"

# Create symlink in /usr/local/bin
sudo ln -s $(npm config get prefix)/lib/node_modules/@vasudevshetty/safekey/bin/safekey.js /usr/local/bin/safekey
```

**Option 3: Use npx**

```bash
# Run SafeKey using npx
npx @vasudevshetty/safekey --version

# Create alias for convenience
echo 'alias safekey="npx @vasudevshetty/safekey"' >> ~/.bashrc
source ~/.bashrc
```

### Configuration Directory Issues

**Symptoms:**

- Cannot create configuration directory
- Permission denied when accessing ~/.safekey
- Configuration not persisting

**Diagnosis:**

```bash
# Check configuration directory
ls -la ~/.safekey/
stat ~/.safekey/

# Check permissions
ls -ld ~/.safekey/
ls -la ~/.safekey/

# Check disk space
df -h $HOME
```

**Solutions:**

**Option 1: Fix permissions**

```bash
# Fix ownership and permissions
sudo chown -R $(whoami):$(id -gn) ~/.safekey/
chmod -R 700 ~/.safekey/
```

**Option 2: Recreate configuration directory**

```bash
# Remove and recreate
rm -rf ~/.safekey/
safekey init

# Or manually create with proper permissions
mkdir -p ~/.safekey/vaults
chmod 700 ~/.safekey/
chmod 700 ~/.safekey/vaults
```

**Option 3: Use custom configuration directory**

```bash
# Set custom config directory
export SAFEKEY_CONFIG_DIR="$HOME/Documents/safekey-config"
mkdir -p "$SAFEKEY_CONFIG_DIR"
safekey init
```

## Authentication and Access Issues

### Forgot Master Password

**Symptoms:**

- Cannot access any vaults
- "Invalid password" errors
- Lost or forgotten master password

**Solutions:**

**Option 1: Use password recovery (if configured)**

```bash
# Check if recovery was configured
ls ~/.safekey/recovery/

# Use recovery key
safekey recover --recovery-key /path/to/recovery-key.txt

# Use recovery phrase
safekey recover --recovery-phrase
```

**Option 2: Restore from cloud backup**

```bash
# List available cloud backups
safekey cloud backups list

# Restore from specific backup
safekey cloud restore --backup-id <backup-id>

# Restore and reset password
safekey cloud restore --backup-id <backup-id> --reset-password
```

**Option 3: Use team recovery (if part of a team)**

```bash
# Request team recovery
safekey team recover --team "Team Name" --reason "Forgot master password"

# Team admin can initiate recovery
safekey team recover-member --member user@example.com --generate-temporary-access
```

**Last resort: Reset everything**

```bash
# ⚠️ WARNING: This will delete all local data
safekey reset --confirm

# Start fresh
safekey init
```

### Vault Access Denied

**Symptoms:**

- Cannot switch to a vault
- Permission denied errors
- "Vault not found" messages

**Diagnosis:**

```bash
# List all vaults
safekey vault list

# Check vault permissions
safekey vault info <vault-name>

# Check current user permissions
safekey vault permissions <vault-name>
```

**Solutions:**

**Option 1: Verify vault name**

```bash
# List vaults with exact names
safekey vault list --format table

# Use exact vault name (case-sensitive)
safekey vault switch "Production Secrets"
```

**Option 2: Check team membership**

```bash
# Check team membership
safekey team list --my-teams

# Request access to team vault
safekey team request-access "Team Name" --reason "Need access for project work"
```

**Option 3: Restore vault access**

```bash
# Restore from cloud sync
safekey cloud sync --vault <vault-name>

# Force sync if needed
safekey cloud sync --vault <vault-name> --force
```

### Two-Factor Authentication Issues

**Symptoms:**

- 2FA codes not working
- Lost authenticator device
- Cannot disable 2FA

**Solutions:**

**Option 1: Use backup codes**

```bash
# Use backup code instead of TOTP
safekey auth verify --backup-code <backup-code>

# Regenerate backup codes
safekey auth backup-codes --regenerate
```

**Option 2: Reset 2FA with recovery**

```bash
# Use recovery key to reset 2FA
safekey auth reset-2fa --recovery-key /path/to/recovery-key.txt

# Disable 2FA temporarily
safekey auth disable-2fa --recovery-key /path/to/recovery-key.txt
```

**Option 3: Team admin assistance**

```bash
# Team admin can reset member's 2FA
safekey team member reset-2fa --member user@example.com --team "Team Name"
```

## Cloud Synchronization Issues

### Cloud Sync Failures

**Symptoms:**

- Sync operations fail or timeout
- "Network error" messages
- Conflicts during synchronization

**Diagnosis:**

```bash
# Check cloud sync status
safekey cloud status

# Test cloud connectivity
safekey cloud test --provider github
safekey cloud test --provider aws-s3
safekey cloud test --provider azure-blob

# Check sync history
safekey cloud history --limit 10
```

**Solutions:**

**Option 1: Fix network connectivity**

```bash
# Test internet connection
ping github.com
curl -I https://api.github.com

# Check firewall/proxy settings
echo $HTTP_PROXY
echo $HTTPS_PROXY

# Test with different DNS
nslookup github.com 8.8.8.8
```

**Option 2: Reconfigure cloud provider**

```bash
# Reconfigure GitHub
safekey cloud configure github --reset
safekey cloud configure github --interactive

# Test configuration
safekey cloud test --provider github --verbose
```

**Option 3: Force full resync**

```bash
# Force complete resync
safekey cloud sync --force --full-sync

# Clear local cache and resync
safekey cloud cache clear
safekey cloud sync --force
```

### Authentication with Cloud Providers

**Symptoms:**

- "Authentication failed" errors
- Expired tokens or credentials
- Permission denied on cloud resources

**GitHub Issues:**

```bash
# Check token validity
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user

# Regenerate token with proper scopes
# Required scopes: gist, read:user

# Update token in SafeKey
safekey cloud configure github --token <new-token>
```

**AWS S3 Issues:**

```bash
# Test AWS credentials
aws sts get-caller-identity

# Check S3 bucket access
aws s3 ls s3://your-bucket-name

# Update credentials
safekey cloud configure aws-s3 --access-key-id <new-key> --secret-access-key <new-secret>
```

**Azure Blob Issues:**

```bash
# Test Azure credentials
az account show

# Check storage account access
az storage blob list --account-name <account-name> --container-name <container>

# Update credentials
safekey cloud configure azure-blob --account-key <new-key>
```

### Sync Conflicts

**Symptoms:**

- "Conflict detected" messages
- Duplicate secrets with different values
- Sync operations stuck or failing

**Diagnosis:**

```bash
# List current conflicts
safekey cloud conflicts list

# Show conflict details
safekey cloud conflicts show --conflict-id <id>

# Check sync history for conflicts
safekey cloud history --conflicts-only
```

**Solutions:**

**Option 1: Automatic conflict resolution**

```bash
# Use latest version (last write wins)
safekey cloud conflicts resolve --strategy latest

# Use local version
safekey cloud conflicts resolve --strategy local

# Use remote version
safekey cloud conflicts resolve --strategy remote
```

**Option 2: Manual conflict resolution**

```bash
# Resolve conflicts interactively
safekey cloud conflicts resolve --interactive

# Review each conflict manually
safekey cloud conflicts resolve --manual
```

**Option 3: Merge conflicts**

```bash
# Smart merge (when possible)
safekey cloud conflicts resolve --strategy merge

# Create backup before resolving
safekey cloud conflicts resolve --strategy merge --backup-first
```

## Performance Issues

### Slow Operations

**Symptoms:**

- Commands take a long time to complete
- Timeouts during operations
- High CPU or memory usage

**Diagnosis:**

```bash
# Enable debug mode
export SAFEKEY_DEBUG=true
safekey vault list

# Check system resources
top -p $(pgrep safekey)
ps aux | grep safekey

# Profile a specific operation
time safekey list --vault large-vault
```

**Solutions:**

**Option 1: Optimize vault size**

```bash
# Check vault sizes
safekey vault list --with-stats

# Split large vaults
safekey vault create specific-project-secrets
safekey move-secrets --from large-vault --to specific-project-secrets --pattern "PROJECT_*"

# Clean up unused secrets
safekey cleanup --remove-unused --older-than 90d
```

**Option 2: Improve caching**

```bash
# Enable caching
safekey config set cache.enabled true
safekey config set cache.ttl 300  # 5 minutes

# Clear cache if corrupted
safekey cache clear
```

**Option 3: Optimize cloud sync**

```bash
# Reduce sync frequency
safekey cloud config set sync.auto false
safekey cloud config set sync.interval 3600  # 1 hour

# Use compression
safekey cloud config set compression.enabled true
```

### Memory Issues

**Symptoms:**

- Out of memory errors
- System becomes unresponsive
- SafeKey crashes during operations

**Solutions:**

**Option 1: Increase memory limits**

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
safekey operation

# Or set permanently
echo 'export NODE_OPTIONS="--max-old-space-size=4096"' >> ~/.bashrc
```

**Option 2: Process large vaults in batches**

```bash
# Export large vault in batches
safekey export --vault large-vault --batch-size 100 --output vault-batch-1.json

# Import in batches
safekey import vault-batch-1.json --batch-size 50
```

**Option 3: Use streaming operations**

```bash
# Stream operations for large datasets
safekey list --stream | grep "PATTERN" | head -100
safekey export --stream --output-format jsonl
```

## Data Integrity Issues

### Corrupted Vault Data

**Symptoms:**

- Cannot open vault
- "Data corruption detected" errors
- Missing or garbled secret values

**Diagnosis:**

```bash
# Check vault integrity
safekey vault check --vault <vault-name>

# Verify checksums
safekey vault verify --vault <vault-name> --deep

# Check file system integrity
ls -la ~/.safekey/vaults/
file ~/.safekey/vaults/<vault-name>.vault
```

**Solutions:**

**Option 1: Restore from backup**

```bash
# List available backups
safekey backup list --vault <vault-name>

# Restore from most recent backup
safekey backup restore --vault <vault-name> --backup latest

# Restore from specific backup
safekey backup restore --vault <vault-name> --backup <backup-id>
```

**Option 2: Restore from cloud sync**

```bash
# Force download from cloud
safekey cloud sync --vault <vault-name> --download-only --force

# Restore from cloud backup
safekey cloud restore --vault <vault-name> --timestamp <timestamp>
```

**Option 3: Repair vault**

```bash
# Attempt automatic repair
safekey vault repair --vault <vault-name>

# Manual repair with data recovery
safekey vault repair --vault <vault-name> --recover-data --interactive
```

### Missing Secrets

**Symptoms:**

- Secrets that should exist are not found
- Empty secret values
- Secrets missing after sync

**Diagnosis:**

```bash
# Search for missing secrets
safekey search <secret-name> --all-vaults
safekey search <secret-name> --include-deleted

# Check audit log
safekey audit --vault <vault-name> --action delete --limit 50

# Check sync history
safekey cloud history --vault <vault-name> --limit 20
```

**Solutions:**

**Option 1: Restore from history**

```bash
# Show secret history
safekey history <secret-name> --vault <vault-name>

# Restore from specific version
safekey restore <secret-name> --version <version-id>

# Restore deleted secret
safekey restore <secret-name> --from-deleted
```

**Option 2: Recover from backup**

```bash
# Extract specific secret from backup
safekey backup extract --secret <secret-name> --backup <backup-id>

# Compare current vs backup
safekey backup compare --vault <vault-name> --backup <backup-id>
```

**Option 3: Team recovery**

```bash
# Check if team members have the secret
safekey team search <secret-name> --team <team-name>

# Request secret from team member
safekey team request-secret <secret-name> --from <member-email>
```

## Team Management Issues

### Permission Conflicts

**Symptoms:**

- Cannot access team vaults
- Permission denied for team operations
- Inconsistent access across team members

**Diagnosis:**

```bash
# Check team membership
safekey team info <team-name> --members

# Check individual permissions
safekey team permissions <team-name> --member <member-email>

# Check vault permissions
safekey vault permissions <vault-name>
```

**Solutions:**

**Option 1: Update member roles**

```bash
# Update member role
safekey team role set <team-name> <member-email> editor

# Grant specific permissions
safekey team permissions grant <team-name> <member-email> --permission read_secrets,write_secrets
```

**Option 2: Resync team configuration**

```bash
# Refresh team membership from cloud
safekey team sync <team-name>

# Force team configuration refresh
safekey team refresh <team-name> --force
```

**Option 3: Rejoin team**

```bash
# Leave and rejoin team
safekey team leave <team-name>
safekey team join <invitation-code>
```

### Team Sync Issues

**Symptoms:**

- Team member changes not syncing
- Inconsistent vault access across team
- Team operations failing

**Solutions:**

**Option 1: Force team resync**

```bash
# Force sync team data
safekey team sync <team-name> --force

# Sync all teams
safekey team sync --all
```

**Option 2: Rebuild team configuration**

```bash
# Rebuild team from cloud
safekey team rebuild <team-name> --from-cloud

# Reset local team data
safekey team reset <team-name> --keep-vault-access
```

### Invitation Problems

**Symptoms:**

- Team invitations not received
- Invalid invitation codes
- Cannot join team

**Solutions:**

**Option 1: Resend invitation**

```bash
# Resend invitation
safekey team invite <team-name> <member-email> --resend

# Generate new invitation code
safekey team invite <team-name> <member-email> --new-code
```

**Option 2: Direct team addition**

```bash
# Add member directly (admin only)
safekey team add-member <team-name> <member-email> --role editor

# Verify member was added
safekey team info <team-name> --members
```

## Platform-Specific Issues

### Windows Issues

**PowerShell Execution Policy:**

```powershell
# Check current execution policy
Get-ExecutionPolicy

# Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run SafeKey
safekey --version
```

**Path Issues:**

```powershell
# Check if SafeKey is in PATH
where safekey

# Add npm global directory to PATH
$npmPath = npm config get prefix
$env:PATH += ";$npmPath"

# Make permanent
[Environment]::SetEnvironmentVariable("PATH", $env:PATH, [EnvironmentVariableTarget]::User)
```

**File Permission Issues:**

```powershell
# Check SafeKey directory permissions
Get-Acl $env:USERPROFILE\.safekey

# Fix permissions
icacls "$env:USERPROFILE\.safekey" /grant:r "$env:USERNAME:(OI)(CI)F" /T
```

### macOS Issues

**Gatekeeper Issues:**

```bash
# Allow unsigned Node.js packages
sudo spctl --master-disable

# Or allow specific node binary
sudo xattr -rd com.apple.quarantine /usr/local/bin/node
```

**Keychain Integration:**

```bash
# Reset keychain if having issues
security delete-keychain login.keychain
security create-keychain -p "" login.keychain
security default-keychain -s login.keychain
```

### Linux Issues

**Missing System Dependencies:**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install build-essential libssl-dev

# CentOS/RHEL/Fedora
sudo yum groupinstall "Development Tools"
sudo yum install openssl-devel

# Arch Linux
sudo pacman -S base-devel openssl
```

**SELinux Issues:**

```bash
# Check SELinux status
sestatus

# Allow SafeKey operations
sudo setsebool -P allow_execstack 1

# Or create custom SELinux policy
sudo semanage fcontext -a -t bin_t ~/.npm-global/bin/safekey
sudo restorecon ~/.npm-global/bin/safekey
```

## Diagnostic Tools and Commands

### Built-in Diagnostics

```bash
# General health check
safekey doctor

# Verbose diagnostics
safekey doctor --verbose

# Check specific components
safekey doctor --check-config
safekey doctor --check-vaults
safekey doctor --check-cloud
safekey doctor --check-permissions

# Generate diagnostic report
safekey doctor --report --output diagnostic-report.json
```

### System Information

```bash
# System information script
#!/bin/bash
# safekey-sysinfo.sh

echo "=== SafeKey System Information ==="
echo "Date: $(date)"
echo "User: $(whoami)"
echo "OS: $(uname -a)"
echo "Shell: $SHELL"
echo

echo "=== SafeKey Installation ==="
echo "SafeKey version: $(safekey --version 2>/dev/null || echo 'Not found')"
echo "Installation path: $(which safekey 2>/dev/null || echo 'Not found')"
echo "Node.js version: $(node --version 2>/dev/null || echo 'Not found')"
echo "npm version: $(npm --version 2>/dev/null || echo 'Not found')"
echo

echo "=== Configuration ==="
echo "Config directory: ~/.safekey"
ls -la ~/.safekey/ 2>/dev/null || echo "Config directory not found"
echo

echo "=== Network ==="
echo "Internet connectivity:"
ping -c 1 github.com >/dev/null 2>&1 && echo "✓ GitHub reachable" || echo "✗ GitHub unreachable"
ping -c 1 s3.amazonaws.com >/dev/null 2>&1 && echo "✓ AWS reachable" || echo "✗ AWS unreachable"

echo
echo "=== Disk Space ==="
df -h $HOME | tail -1

echo
echo "=== Process Information ==="
ps aux | grep -E "(node|safekey)" | grep -v grep
```

### Log Analysis

```bash
# Enable detailed logging
export SAFEKEY_LOG_LEVEL=debug
export SAFEKEY_LOG_FILE=~/.safekey/debug.log

# Analyze logs
tail -f ~/.safekey/debug.log

# Common log patterns to look for
grep -i "error" ~/.safekey/debug.log
grep -i "timeout" ~/.safekey/debug.log
grep -i "permission" ~/.safekey/debug.log
grep -i "network" ~/.safekey/debug.log
```

## Getting Additional Help

### Community Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check the comprehensive docs
- **Stack Overflow**: Tag questions with `safekey`
- **Discord Community**: Join for real-time help

### Professional Support

- **Enterprise Support**: Available for business users
- **Priority Support**: Faster response times
- **Custom Solutions**: Tailored implementations

### Before Asking for Help

1. **Check this troubleshooting guide**
2. **Run diagnostic tools**: `safekey doctor`
3. **Search existing issues**: GitHub and Stack Overflow
4. **Gather system information**: Use the sysinfo script above
5. **Include relevant logs**: Enable debug logging

### Reporting Issues

When reporting issues, include:

- SafeKey version (`safekey --version`)
- Operating system and version
- Node.js version (`node --version`)
- Complete error messages
- Steps to reproduce
- Expected vs. actual behavior
- Diagnostic report (`safekey doctor --report`)

## Prevention Strategies

### Regular Maintenance

```bash
# Regular maintenance script
#!/bin/bash
# safekey-maintenance.sh

echo "Starting SafeKey maintenance..."

# Update SafeKey
npm update -g @vasudevshetty/safekey

# Health check
safekey doctor

# Backup all vaults
safekey backup create --all-vaults

# Clean up old backups
safekey backup cleanup --older-than 30d

# Sync with cloud
safekey cloud sync --all

# Check for conflicts
safekey cloud conflicts list

# Generate health report
safekey doctor --report --output "health-$(date +%Y%m%d).json"

echo "Maintenance completed at $(date)"
```

### Monitoring

```bash
# Set up monitoring
safekey config set monitoring.enabled true
safekey config set monitoring.check_interval 3600  # 1 hour
safekey config set monitoring.alert_email admin@company.com

# Monitor specific issues
safekey monitor --watch-for "sync_failures,authentication_errors,performance_degradation"
```

By following this troubleshooting guide, you should be able to resolve most common SafeKey issues. For persistent problems, don't hesitate to seek community or professional support.
