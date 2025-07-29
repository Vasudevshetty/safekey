# Migration Guide

This comprehensive guide helps you migrate to SafeKey from other secret management solutions, upgrade between SafeKey versions, and handle data migration scenarios. Learn best practices for smooth transitions with minimal downtime.

## Overview

SafeKey migration scenarios include:

- **From Other Tools**: Migrating from HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, 1Password, LastPass, etc.
- **Version Upgrades**: Upgrading SafeKey to newer versions
- **Platform Migration**: Moving between different operating systems or environments
- **Data Consolidation**: Merging multiple secret stores into SafeKey
- **Team Migration**: Moving team secrets and workflows

This guide provides step-by-step procedures, automation scripts, and rollback strategies for each scenario.

## Prerequisites

Before starting any migration:

- **Backup Existing Data**: Create comprehensive backups of current secret stores
- **Inventory Assessment**: Document all secrets, access patterns, and dependencies
- **Team Coordination**: Plan migration timing with all stakeholders
- **Testing Environment**: Set up a test environment for migration validation
- **Rollback Plan**: Prepare detailed rollback procedures

## Migration Planning

### Assessment and Inventory

```bash
# Create migration assessment script
#!/bin/bash
# migration-assessment.sh

echo "=== SafeKey Migration Assessment ==="
echo "Date: $(date)"
echo "Current User: $(whoami)"
echo "System: $(uname -a)"
echo

# Check current secret management tools
echo "=== Current Tools Detected ==="

if command -v vault &> /dev/null; then
    echo "✓ HashiCorp Vault: $(vault version)"
fi

if command -v aws &> /dev/null; then
    echo "✓ AWS CLI: $(aws --version)"
fi

if command -v az &> /dev/null; then
    echo "✓ Azure CLI: $(az --version | head -1)"
fi

if command -v op &> /dev/null; then
    echo "✓ 1Password CLI: $(op --version)"
fi

if command -v bw &> /dev/null; then
    echo "✓ Bitwarden CLI: $(bw --version)"
fi

# Check environment variables for secrets
echo
echo "=== Environment Variables Analysis ==="
env | grep -E "(SECRET|KEY|TOKEN|PASSWORD)" | wc -l | xargs echo "Potential secret env vars:"

# Check common secret files
echo
echo "=== Common Secret Files ==="
for file in ~/.aws/credentials ~/.ssh/id_rsa ~/.*rc ~/.env*; do
    if [[ -f "$file" ]]; then
        echo "Found: $file"
    fi
done

# System requirements check
echo
echo "=== System Requirements ==="
echo "Node.js: $(node --version 2>/dev/null || echo 'Not installed')"
echo "Python: $(python3 --version 2>/dev/null || echo 'Not installed')"
echo "Git: $(git --version 2>/dev/null || echo 'Not installed')"

# Disk space check
echo
echo "=== Storage Analysis ==="
df -h $HOME | tail -1 | awk '{print "Available space: " $4}'

echo
echo "Assessment complete. Review output before proceeding with migration."
```

### Migration Strategy Planning

```yaml
# migration-plan.yaml
migration:
  strategy: 'phased' # all-at-once, phased, parallel

  phases:
    - name: 'Development Secrets'
      priority: 'low'
      systems: ['local-env', 'dev-servers']
      timeline: 'week-1'

    - name: 'Staging Secrets'
      priority: 'medium'
      systems: ['staging-env', 'test-systems']
      timeline: 'week-2'
      dependencies: ['Development Secrets']

    - name: 'Production Secrets'
      priority: 'critical'
      systems: ['prod-env', 'critical-services']
      timeline: 'week-3'
      dependencies: ['Staging Secrets']

  rollback:
    triggers: ['error-rate > 5%', 'downtime > 5min']
    procedure: 'immediate'
    communication: ['slack', 'email', 'pagerduty']

  validation:
    automated_tests: true
    manual_verification: true
    performance_benchmarks: true
    security_validation: true

  communication:
    stakeholders: ['dev-team', 'ops-team', 'security-team']
    channels: ['slack', 'email']
    frequency: 'daily-updates'
```

## Migrating from HashiCorp Vault

### Export from Vault

```bash
# Export secrets from HashiCorp Vault
#!/bin/bash
# vault-export.sh

VAULT_ADDR="${VAULT_ADDR:-http://localhost:8200}"
VAULT_TOKEN="${VAULT_TOKEN}"
OUTPUT_DIR="vault-export-$(date +%Y%m%d-%H%M%S)"

mkdir -p "$OUTPUT_DIR"

echo "Exporting secrets from Vault at $VAULT_ADDR"

# List all secret engines
vault secrets list -format=json > "$OUTPUT_DIR/secret-engines.json"

# Export KV v2 secrets
export_kv_secrets() {
    local mount_path="$1"
    local output_file="$OUTPUT_DIR/kv-${mount_path//\//-}.json"

    echo "Exporting KV secrets from $mount_path..."

    # Get all secret paths
    vault kv list -format=json "$mount_path" 2>/dev/null | \
    jq -r '.[]' | while read -r secret_path; do
        # Remove trailing slash if present
        secret_path="${secret_path%/}"

        echo "  Exporting: $mount_path$secret_path"

        # Get secret data
        vault kv get -format=json "$mount_path$secret_path" >> "$output_file" 2>/dev/null
        echo "---" >> "$output_file"
    done
}

# Export from common KV mounts
export_kv_secrets "secret/"
export_kv_secrets "kv/"

# Export auth methods
vault auth list -format=json > "$OUTPUT_DIR/auth-methods.json"

# Export policies
vault policy list | while read -r policy; do
    if [[ "$policy" != "default" && "$policy" != "root" ]]; then
        vault policy read "$policy" > "$OUTPUT_DIR/policy-${policy}.hcl"
    fi
done

echo "Export completed in directory: $OUTPUT_DIR"
```

### Import to SafeKey

```bash
# Import Vault secrets to SafeKey
#!/bin/bash
# vault-import.sh

EXPORT_DIR="$1"
VAULT_NAME="${2:-vault-import}"

if [[ -z "$EXPORT_DIR" ]]; then
    echo "Usage: $0 <export-directory> [vault-name]"
    exit 1
fi

echo "Importing Vault secrets to SafeKey..."

# Create new vault
safekey vault create "$VAULT_NAME" \
    --description "Imported from HashiCorp Vault on $(date)"

safekey vault switch "$VAULT_NAME"

# Process KV exports
for kv_file in "$EXPORT_DIR"/kv-*.json; do
    if [[ -f "$kv_file" ]]; then
        echo "Processing: $kv_file"

        # Parse and import secrets
        python3 << EOF
import json
import subprocess
import sys

try:
    with open('$kv_file', 'r') as f:
        content = f.read()

    # Split by separator and process each secret
    secrets = content.split('---')

    for secret_data in secrets:
        secret_data = secret_data.strip()
        if not secret_data:
            continue

        try:
            secret_json = json.loads(secret_data)
            path = secret_json['request_id']  # This might need adjustment
            data = secret_json['data']['data']

            for key, value in data.items():
                secret_name = f"{path}_{key}".replace('/', '_').upper()

                # Import to SafeKey
                cmd = ['safekey', 'add', secret_name, str(value),
                       '--description', f'Imported from Vault path: {path}',
                       '--tags', 'vault-import,migrated']

                result = subprocess.run(cmd, capture_output=True, text=True)
                if result.returncode == 0:
                    print(f"✓ Imported: {secret_name}")
                else:
                    print(f"✗ Failed to import: {secret_name} - {result.stderr}")

        except (json.JSONDecodeError, KeyError) as e:
            print(f"Error processing secret: {e}")
            continue

except Exception as e:
    print(f"Error processing file: {e}")
    sys.exit(1)
EOF
    fi
done

echo "Import completed to vault: $VAULT_NAME"
```

### Validation and Testing

```python
# vault-migration-validator.py
import subprocess
import json
import sys

class VaultMigrationValidator:
    def __init__(self, vault_addr, vault_token, safekey_vault):
        self.vault_addr = vault_addr
        self.vault_token = vault_token
        self.safekey_vault = safekey_vault

    def get_vault_secrets(self):
        """Extract all secrets from Vault"""
        secrets = {}

        # Implementation depends on your Vault structure
        # This is a simplified example
        cmd = ['vault', 'kv', 'list', '-format=json', 'secret/']
        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode == 0:
            paths = json.loads(result.stdout)
            for path in paths:
                cmd = ['vault', 'kv', 'get', '-format=json', f'secret/{path}']
                result = subprocess.run(cmd, capture_output=True, text=True)
                if result.returncode == 0:
                    data = json.loads(result.stdout)
                    secrets[path] = data['data']['data']

        return secrets

    def get_safekey_secrets(self):
        """Extract all secrets from SafeKey"""
        cmd = ['safekey', 'list', '--format', 'json']
        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode == 0:
            return json.loads(result.stdout)
        return {}

    def validate_migration(self):
        """Validate that all secrets migrated correctly"""
        print("Starting migration validation...")

        vault_secrets = self.get_vault_secrets()
        safekey_secrets = self.get_safekey_secrets()

        print(f"Vault secrets: {len(vault_secrets)}")
        print(f"SafeKey secrets: {len(safekey_secrets)}")

        missing_secrets = []
        mismatched_secrets = []

        for vault_path, vault_data in vault_secrets.items():
            for key, value in vault_data.items():
                secret_name = f"{vault_path}_{key}".replace('/', '_').upper()

                if secret_name not in safekey_secrets:
                    missing_secrets.append(secret_name)
                else:
                    safekey_value = safekey_secrets[secret_name].get('value')
                    if safekey_value != value:
                        mismatched_secrets.append(secret_name)

        # Report results
        if not missing_secrets and not mismatched_secrets:
            print("✅ Migration validation successful!")
            return True
        else:
            print("❌ Migration validation failed:")
            if missing_secrets:
                print(f"Missing secrets: {missing_secrets}")
            if mismatched_secrets:
                print(f"Mismatched secrets: {mismatched_secrets}")
            return False

# Run validation
validator = VaultMigrationValidator(
    vault_addr="http://localhost:8200",
    vault_token="your-token",
    safekey_vault="vault-import"
)

success = validator.validate_migration()
sys.exit(0 if success else 1)
```

## Migrating from AWS Secrets Manager

### Export from AWS Secrets Manager

```bash
# Export secrets from AWS Secrets Manager
#!/bin/bash
# aws-secrets-export.sh

OUTPUT_DIR="aws-secrets-export-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUTPUT_DIR"

echo "Exporting secrets from AWS Secrets Manager..."

# Get all secrets
aws secretsmanager list-secrets --query 'SecretList[*].[Name,ARN]' --output text > "$OUTPUT_DIR/secret-list.txt"

# Export each secret
while read -r name arn; do
    echo "Exporting: $name"

    # Get secret value
    aws secretsmanager get-secret-value --secret-id "$name" > "$OUTPUT_DIR/secret-${name//\//-}.json" 2>/dev/null

    # Get secret metadata
    aws secretsmanager describe-secret --secret-id "$name" > "$OUTPUT_DIR/metadata-${name//\//-}.json" 2>/dev/null

done < "$OUTPUT_DIR/secret-list.txt"

echo "Export completed in directory: $OUTPUT_DIR"
```

### Import to SafeKey

```python
# aws-secrets-import.py
import json
import subprocess
import os
import glob
import sys

def import_aws_secrets(export_dir, vault_name="aws-import"):
    """Import AWS Secrets Manager secrets to SafeKey"""

    print(f"Importing AWS secrets to SafeKey vault: {vault_name}")

    # Create vault
    subprocess.run(['safekey', 'vault', 'create', vault_name,
                   '--description', f'Imported from AWS Secrets Manager on {datetime.now()}'])
    subprocess.run(['safekey', 'vault', 'switch', vault_name])

    # Process secret files
    secret_files = glob.glob(f"{export_dir}/secret-*.json")

    for secret_file in secret_files:
        try:
            with open(secret_file, 'r') as f:
                secret_data = json.load(f)

            secret_name = secret_data['Name']
            secret_string = secret_data.get('SecretString', '')

            # Handle JSON secrets
            try:
                secret_json = json.loads(secret_string)
                for key, value in secret_json.items():
                    safekey_name = f"{secret_name}_{key}".replace('/', '_').replace('-', '_').upper()

                    cmd = ['safekey', 'add', safekey_name, str(value),
                           '--description', f'Imported from AWS secret: {secret_name}',
                           '--tags', 'aws-import,migrated']

                    result = subprocess.run(cmd, capture_output=True, text=True)
                    if result.returncode == 0:
                        print(f"✓ Imported: {safekey_name}")
                    else:
                        print(f"✗ Failed to import: {safekey_name}")

            except json.JSONDecodeError:
                # Handle plain text secrets
                safekey_name = secret_name.replace('/', '_').replace('-', '_').upper()

                cmd = ['safekey', 'add', safekey_name, secret_string,
                       '--description', f'Imported from AWS secret: {secret_name}',
                       '--tags', 'aws-import,migrated']

                result = subprocess.run(cmd, capture_output=True, text=True)
                if result.returncode == 0:
                    print(f"✓ Imported: {safekey_name}")
                else:
                    print(f"✗ Failed to import: {safekey_name}")

        except Exception as e:
            print(f"Error processing {secret_file}: {e}")
            continue

    print("AWS Secrets Manager import completed")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 aws-secrets-import.py <export-directory>")
        sys.exit(1)

    import_aws_secrets(sys.argv[1])
```

## Migrating from Azure Key Vault

### Export from Azure Key Vault

```bash
# Export secrets from Azure Key Vault
#!/bin/bash
# azure-keyvault-export.sh

KEYVAULT_NAME="$1"
OUTPUT_DIR="azure-keyvault-export-$(date +%Y%m%d-%H%M%S)"

if [[ -z "$KEYVAULT_NAME" ]]; then
    echo "Usage: $0 <keyvault-name>"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"

echo "Exporting secrets from Azure Key Vault: $KEYVAULT_NAME"

# Get all secret names
az keyvault secret list --vault-name "$KEYVAULT_NAME" --query '[].name' -o tsv > "$OUTPUT_DIR/secret-names.txt"

# Export each secret
while read -r secret_name; do
    echo "Exporting: $secret_name"

    # Get secret value
    az keyvault secret show --vault-name "$KEYVAULT_NAME" --name "$secret_name" > "$OUTPUT_DIR/secret-${secret_name}.json"

done < "$OUTPUT_DIR/secret-names.txt"

echo "Export completed in directory: $OUTPUT_DIR"
```

### Import to SafeKey

```python
# azure-keyvault-import.py
import json
import subprocess
import glob
import sys
from datetime import datetime

def import_azure_secrets(export_dir, vault_name="azure-import"):
    """Import Azure Key Vault secrets to SafeKey"""

    print(f"Importing Azure Key Vault secrets to SafeKey vault: {vault_name}")

    # Create vault
    subprocess.run(['safekey', 'vault', 'create', vault_name,
                   '--description', f'Imported from Azure Key Vault on {datetime.now()}'])
    subprocess.run(['safekey', 'vault', 'switch', vault_name])

    # Process secret files
    secret_files = glob.glob(f"{export_dir}/secret-*.json")

    for secret_file in secret_files:
        try:
            with open(secret_file, 'r') as f:
                secret_data = json.load(f)

            secret_name = secret_data['name']
            secret_value = secret_data['value']

            # Convert name to SafeKey format
            safekey_name = secret_name.replace('-', '_').upper()

            # Import to SafeKey
            cmd = ['safekey', 'add', safekey_name, secret_value,
                   '--description', f'Imported from Azure Key Vault secret: {secret_name}',
                   '--tags', 'azure-import,migrated']

            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✓ Imported: {safekey_name}")
            else:
                print(f"✗ Failed to import: {safekey_name} - {result.stderr}")

        except Exception as e:
            print(f"Error processing {secret_file}: {e}")
            continue

    print("Azure Key Vault import completed")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 azure-keyvault-import.py <export-directory>")
        sys.exit(1)

    import_azure_secrets(sys.argv[1])
```

## Migrating from Password Managers

### From 1Password

```bash
# Export from 1Password CLI
#!/bin/bash
# onepassword-export.sh

OUTPUT_DIR="1password-export-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUTPUT_DIR"

echo "Exporting from 1Password..."

# Sign in to 1Password (if not already signed in)
op signin

# Get all vaults
op vault list --format=json > "$OUTPUT_DIR/vaults.json"

# Export each vault
cat "$OUTPUT_DIR/vaults.json" | jq -r '.[].id' | while read -r vault_id; do
    vault_name=$(cat "$OUTPUT_DIR/vaults.json" | jq -r ".[] | select(.id==\"$vault_id\") | .name")

    echo "Exporting vault: $vault_name"

    # Get all items in vault
    op item list --vault="$vault_id" --format=json > "$OUTPUT_DIR/items-${vault_name}.json"

    # Export each item
    cat "$OUTPUT_DIR/items-${vault_name}.json" | jq -r '.[].id' | while read -r item_id; do
        op item get "$item_id" --format=json > "$OUTPUT_DIR/item-${item_id}.json"
    done
done

echo "1Password export completed in directory: $OUTPUT_DIR"
```

### From Bitwarden

```bash
# Export from Bitwarden CLI
#!/bin/bash
# bitwarden-export.sh

OUTPUT_DIR="bitwarden-export-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUTPUT_DIR"

echo "Exporting from Bitwarden..."

# Login to Bitwarden
bw login

# Unlock vault
export BW_SESSION=$(bw unlock --raw)

# Export all items
bw export --format json > "$OUTPUT_DIR/bitwarden-export.json"

echo "Bitwarden export completed in directory: $OUTPUT_DIR"
```

### Import Password Manager Data

```python
# password-manager-import.py
import json
import subprocess
import sys
from datetime import datetime

def import_password_manager_data(export_file, source_type, vault_name=None):
    """Import password manager data to SafeKey"""

    if not vault_name:
        vault_name = f"{source_type}-import"

    print(f"Importing {source_type} data to SafeKey vault: {vault_name}")

    # Create vault
    subprocess.run(['safekey', 'vault', 'create', vault_name,
                   '--description', f'Imported from {source_type} on {datetime.now()}'])
    subprocess.run(['safekey', 'vault', 'switch', vault_name])

    with open(export_file, 'r') as f:
        data = json.load(f)

    if source_type == "bitwarden":
        import_bitwarden_data(data)
    elif source_type == "1password":
        import_1password_data(data)
    else:
        print(f"Unsupported source type: {source_type}")
        return

def import_bitwarden_data(data):
    """Import Bitwarden export data"""
    items = data.get('items', [])

    for item in items:
        if item.get('type') == 1:  # Login type
            name = item.get('name', '').replace(' ', '_').upper()

            # Import login credentials
            if item.get('login'):
                login = item['login']

                if login.get('username'):
                    cmd = ['safekey', 'add', f"{name}_USERNAME", login['username'],
                           '--description', f'Username for {item.get("name")}',
                           '--tags', 'bitwarden-import,username']
                    subprocess.run(cmd)

                if login.get('password'):
                    cmd = ['safekey', 'add', f"{name}_PASSWORD", login['password'],
                           '--description', f'Password for {item.get("name")}',
                           '--tags', 'bitwarden-import,password']
                    subprocess.run(cmd)

                # Import URIs
                if login.get('uris'):
                    for i, uri in enumerate(login['uris']):
                        if uri.get('uri'):
                            cmd = ['safekey', 'add', f"{name}_URL_{i}", uri['uri'],
                                   '--description', f'URL for {item.get("name")}',
                                   '--tags', 'bitwarden-import,url']
                            subprocess.run(cmd)

        elif item.get('type') == 2:  # Secure note type
            name = item.get('name', '').replace(' ', '_').upper()
            notes = item.get('notes', '')

            if notes:
                cmd = ['safekey', 'add', f"{name}_NOTE", notes,
                       '--description', f'Secure note: {item.get("name")}',
                       '--tags', 'bitwarden-import,note']
                subprocess.run(cmd)

def import_1password_data(export_dir):
    """Import 1Password export data"""
    # Implementation for 1Password data import
    # This would parse the JSON files exported by 1Password CLI
    pass

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 password-manager-import.py <export-file> <source-type> [vault-name]")
        print("Source types: bitwarden, 1password")
        sys.exit(1)

    export_file = sys.argv[1]
    source_type = sys.argv[2]
    vault_name = sys.argv[3] if len(sys.argv) > 3 else None

    import_password_manager_data(export_file, source_type, vault_name)
```

## SafeKey Version Upgrades

### Pre-Upgrade Checklist

```bash
# SafeKey upgrade preparation
#!/bin/bash
# pre-upgrade-checklist.sh

echo "=== SafeKey Upgrade Pre-flight Checklist ==="

# Check current version
CURRENT_VERSION=$(safekey --version 2>/dev/null || echo "Not installed")
echo "Current SafeKey version: $CURRENT_VERSION"

# Backup all vaults
echo "Creating vault backups..."
BACKUP_DIR="safekey-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

safekey vault list --format json | jq -r '.[].name' | while read -r vault_name; do
    echo "  Backing up vault: $vault_name"
    safekey vault switch "$vault_name"
    safekey export --output "$BACKUP_DIR/vault-${vault_name}.json"
done

# Backup configuration
echo "Backing up configuration..."
cp -r ~/.safekey "$BACKUP_DIR/config/" 2>/dev/null || echo "No config directory found"

# Check cloud sync status
echo "Checking cloud sync status..."
safekey cloud status --all 2>/dev/null || echo "Cloud sync not configured"

# Test basic functionality
echo "Testing basic functionality..."
TEST_VAULT="upgrade-test-$(date +%s)"
safekey vault create "$TEST_VAULT" --description "Upgrade test vault"
safekey vault switch "$TEST_VAULT"
safekey add TEST_SECRET "test-value" --description "Upgrade test"
safekey get TEST_SECRET --quiet >/dev/null && echo "✓ Basic operations working"
safekey remove TEST_SECRET
safekey vault delete "$TEST_VAULT" --force

echo
echo "Backup completed in: $BACKUP_DIR"
echo "Ready for upgrade!"
```

### Upgrade Process

```bash
# SafeKey upgrade script
#!/bin/bash
# upgrade-safekey.sh

NEW_VERSION="$1"
BACKUP_DIR="$2"

if [[ -z "$NEW_VERSION" || -z "$BACKUP_DIR" ]]; then
    echo "Usage: $0 <new-version> <backup-directory>"
    exit 1
fi

echo "Upgrading SafeKey to version $NEW_VERSION..."

# Stop any running SafeKey processes
pkill -f safekey 2>/dev/null || true

# Install new version
if command -v npm &> /dev/null; then
    npm install -g @vasudevshetty/safekey@"$NEW_VERSION"
elif command -v yarn &> /dev/null; then
    yarn global add @vasudevshetty/safekey@"$NEW_VERSION"
else
    echo "Error: npm or yarn required for installation"
    exit 1
fi

# Verify installation
NEW_INSTALLED_VERSION=$(safekey --version)
echo "Installed version: $NEW_INSTALLED_VERSION"

# Run migration if needed
if safekey migrate --check; then
    echo "Running data migration..."
    safekey migrate --backup-dir "$BACKUP_DIR"
fi

# Verify upgrade
echo "Verifying upgrade..."
safekey vault list >/dev/null && echo "✓ Vault access working"
safekey cloud status >/dev/null 2>&1 && echo "✓ Cloud sync working"

echo "Upgrade completed successfully!"
```

### Post-Upgrade Validation

```python
# post-upgrade-validation.py
import subprocess
import json
import sys

def validate_upgrade(backup_dir):
    """Validate SafeKey upgrade by comparing with backup data"""

    print("Starting post-upgrade validation...")

    # Get current vault list
    result = subprocess.run(['safekey', 'vault', 'list', '--format', 'json'],
                          capture_output=True, text=True)

    if result.returncode != 0:
        print("❌ Failed to list vaults")
        return False

    current_vaults = json.loads(result.stdout)
    print(f"Current vaults: {len(current_vaults)}")

    # Validate each vault
    validation_errors = []

    for vault in current_vaults:
        vault_name = vault['name']
        print(f"Validating vault: {vault_name}")

        # Switch to vault
        subprocess.run(['safekey', 'vault', 'switch', vault_name])

        # Get current secrets
        result = subprocess.run(['safekey', 'list', '--format', 'json'],
                              capture_output=True, text=True)

        if result.returncode != 0:
            validation_errors.append(f"Failed to list secrets in vault: {vault_name}")
            continue

        current_secrets = json.loads(result.stdout)

        # Compare with backup if available
        backup_file = f"{backup_dir}/vault-{vault_name}.json"
        try:
            with open(backup_file, 'r') as f:
                backup_secrets = json.load(f)

            # Compare secret counts
            if len(current_secrets) != len(backup_secrets):
                validation_errors.append(
                    f"Secret count mismatch in {vault_name}: "
                    f"current={len(current_secrets)}, backup={len(backup_secrets)}"
                )

            # Validate secret access
            for secret in current_secrets:
                secret_name = secret['name']
                result = subprocess.run(['safekey', 'get', secret_name, '--quiet'],
                                      capture_output=True, text=True)
                if result.returncode != 0:
                    validation_errors.append(f"Cannot access secret: {secret_name} in {vault_name}")

        except FileNotFoundError:
            print(f"No backup found for vault: {vault_name}")

    # Test cloud sync if configured
    result = subprocess.run(['safekey', 'cloud', 'status'],
                          capture_output=True, text=True)
    if result.returncode == 0:
        print("✓ Cloud sync operational")

    # Report results
    if validation_errors:
        print("❌ Validation failed:")
        for error in validation_errors:
            print(f"  - {error}")
        return False
    else:
        print("✅ Validation successful!")
        return True

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 post-upgrade-validation.py <backup-directory>")
        sys.exit(1)

    success = validate_upgrade(sys.argv[1])
    sys.exit(0 if success else 1)
```

## Environment and Platform Migration

### Cross-Platform Migration

```bash
# Cross-platform migration script
#!/bin/bash
# cross-platform-migrate.sh

SOURCE_PLATFORM="$1"    # linux, macos, windows
TARGET_PLATFORM="$2"    # linux, macos, windows
EXPORT_DIR="platform-migration-$(date +%Y%m%d-%H%M%S)"

echo "Migrating SafeKey from $SOURCE_PLATFORM to $TARGET_PLATFORM"

# Create export directory
mkdir -p "$EXPORT_DIR"

# Export all data
echo "Exporting SafeKey data..."

# Export all vaults
safekey vault list --format json | jq -r '.[].name' | while read -r vault_name; do
    echo "  Exporting vault: $vault_name"
    safekey vault switch "$vault_name"
    safekey export --output "$EXPORT_DIR/vault-${vault_name}.json"
done

# Export configuration
echo "Exporting configuration..."
if [[ "$SOURCE_PLATFORM" == "windows" ]]; then
    cp -r "$APPDATA/SafeKey" "$EXPORT_DIR/config/" 2>/dev/null
else
    cp -r ~/.safekey "$EXPORT_DIR/config/" 2>/dev/null
fi

# Export cloud configuration
safekey cloud config export --output "$EXPORT_DIR/cloud-config.json" 2>/dev/null

# Create migration package
tar -czf "safekey-migration-${SOURCE_PLATFORM}-to-${TARGET_PLATFORM}.tar.gz" -C "$EXPORT_DIR" .

echo "Migration package created: safekey-migration-${SOURCE_PLATFORM}-to-${TARGET_PLATFORM}.tar.gz"
echo
echo "To complete migration on $TARGET_PLATFORM:"
echo "1. Install SafeKey"
echo "2. Extract migration package"
echo "3. Run import script"
```

### Docker Container Migration

```dockerfile
# Dockerfile for SafeKey migration
FROM node:18-alpine

# Install SafeKey
RUN npm install -g @vasudevshetty/safekey

# Copy migration scripts
COPY migration-scripts/ /usr/local/bin/

# Create migration user
RUN adduser -D -s /bin/sh migration

USER migration
WORKDIR /home/migration

# Set up entrypoint
ENTRYPOINT ["/usr/local/bin/migrate-container.sh"]
```

```bash
# Container migration script
#!/bin/bash
# migrate-container.sh

MIGRATION_TYPE="$1"
SOURCE_DIR="/migration/source"
TARGET_DIR="/migration/target"

case "$MIGRATION_TYPE" in
    "export")
        echo "Exporting SafeKey data from container..."
        mkdir -p "$TARGET_DIR"

        # Export all vaults
        safekey vault list --format json | jq -r '.[].name' | while read -r vault_name; do
            safekey vault switch "$vault_name"
            safekey export --output "$TARGET_DIR/vault-${vault_name}.json"
        done

        # Export configuration
        cp -r ~/.safekey "$TARGET_DIR/config/" 2>/dev/null || true
        ;;

    "import")
        echo "Importing SafeKey data to container..."

        # Import configuration
        if [[ -d "$SOURCE_DIR/config" ]]; then
            cp -r "$SOURCE_DIR/config" ~/.safekey
        fi

        # Import vaults
        for vault_file in "$SOURCE_DIR"/vault-*.json; do
            if [[ -f "$vault_file" ]]; then
                vault_name=$(basename "$vault_file" .json | sed 's/vault-//')
                echo "Importing vault: $vault_name"
                safekey import "$vault_file" --vault "$vault_name"
            fi
        done
        ;;

    *)
        echo "Usage: $0 {export|import}"
        exit 1
        ;;
esac
```

## Team Migration Strategies

### Gradual Team Migration

```bash
# Gradual team migration script
#!/bin/bash
# gradual-team-migration.sh

TEAM_NAME="$1"
MIGRATION_PHASE="$2"  # phase1, phase2, phase3, complete

echo "Starting team migration for $TEAM_NAME - Phase: $MIGRATION_PHASE"

case "$MIGRATION_PHASE" in
    "phase1")
        echo "Phase 1: Development environment migration"

        # Migrate development secrets
        migrate_secrets_by_pattern "DEV_*" "$TEAM_NAME-dev"

        # Notify team
        send_notification "Phase 1 migration completed for $TEAM_NAME"
        ;;

    "phase2")
        echo "Phase 2: Staging environment migration"

        # Migrate staging secrets
        migrate_secrets_by_pattern "STAGE_*" "$TEAM_NAME-staging"

        # Update CI/CD for staging
        update_cicd_staging "$TEAM_NAME"
        ;;

    "phase3")
        echo "Phase 3: Production environment migration"

        # Migrate production secrets
        migrate_secrets_by_pattern "PROD_*" "$TEAM_NAME-production"

        # Update CI/CD for production
        update_cicd_production "$TEAM_NAME"
        ;;

    "complete")
        echo "Phase 4: Migration completion and cleanup"

        # Verify all migrations
        verify_team_migration "$TEAM_NAME"

        # Clean up old systems
        cleanup_old_systems "$TEAM_NAME"

        # Final notification
        send_notification "Migration completed for $TEAM_NAME"
        ;;
esac
```

## Rollback Procedures

### Automated Rollback

```bash
# SafeKey rollback script
#!/bin/bash
# rollback-safekey.sh

BACKUP_DIR="$1"
ROLLBACK_REASON="$2"

if [[ -z "$BACKUP_DIR" || -z "$ROLLBACK_REASON" ]]; then
    echo "Usage: $0 <backup-directory> <rollback-reason>"
    exit 1
fi

echo "🚨 INITIATING SAFEKEY ROLLBACK 🚨"
echo "Backup directory: $BACKUP_DIR"
echo "Reason: $ROLLBACK_REASON"
echo "Timestamp: $(date)"

# Log rollback
echo "$(date): Rollback initiated - $ROLLBACK_REASON" >> /var/log/safekey-rollback.log

# Stop SafeKey processes
pkill -f safekey 2>/dev/null || true

# Restore configuration
if [[ -d "$BACKUP_DIR/config" ]]; then
    echo "Restoring configuration..."
    rm -rf ~/.safekey 2>/dev/null
    cp -r "$BACKUP_DIR/config" ~/.safekey
fi

# Restore vaults
echo "Restoring vaults..."
for vault_backup in "$BACKUP_DIR"/vault-*.json; do
    if [[ -f "$vault_backup" ]]; then
        vault_name=$(basename "$vault_backup" .json | sed 's/vault-//')
        echo "  Restoring vault: $vault_name"

        # Delete current vault if exists
        safekey vault delete "$vault_name" --force 2>/dev/null || true

        # Import from backup
        safekey import "$vault_backup" --vault "$vault_name"
    fi
done

# Verify rollback
echo "Verifying rollback..."
if safekey vault list >/dev/null 2>&1; then
    echo "✅ Rollback completed successfully"

    # Send notification
    echo "SafeKey rollback completed successfully. Reason: $ROLLBACK_REASON" | \
        mail -s "SafeKey Rollback Completed" admin@company.com
else
    echo "❌ Rollback verification failed"
    exit 1
fi

echo "Rollback completed at $(date)"
```

## Best Practices and Recommendations

### Migration Planning

- Always create comprehensive backups before migration
- Test migration process in non-production environment
- Plan for rollback scenarios
- Communicate migration timeline to all stakeholders
- Validate data integrity after migration

### Security Considerations

- Secure transport of exported data
- Encrypt backup files
- Rotate credentials after migration
- Audit access during migration period
- Verify no data leakage occurred

### Performance Optimization

- Migrate during low-usage periods
- Use batch operations for large datasets
- Monitor system resources during migration
- Implement progress tracking
- Plan for potential downtime

### Team Coordination

- Clear communication channels
- Defined roles and responsibilities
- Progress tracking and reporting
- Emergency contact procedures
- Post-migration training

## Troubleshooting Migration Issues

### Common Problems and Solutions

**Export/Import Failures:**

```bash
# Debug export issues
safekey export --debug --output debug-export.json
safekey import debug-export.json --vault test-import --dry-run

# Check file permissions
ls -la ~/.safekey/
chmod -R 600 ~/.safekey/
```

**Version Compatibility:**

```bash
# Check version compatibility
safekey migrate --check-compatibility
safekey version --compatibility-matrix

# Force migration if needed
safekey migrate --force --backup-first
```

**Cloud Sync Issues:**

```bash
# Re-configure cloud sync after migration
safekey cloud configure --reset
safekey cloud sync --force-full-sync
safekey cloud verify-integrity
```

## Next Steps

After completing migration:

1. **Validation**: Thoroughly test all functionality
2. **Documentation**: Update team documentation
3. **Training**: Conduct team training sessions
4. **Monitoring**: Set up monitoring and alerting
5. **Optimization**: Fine-tune configuration for your environment

For more migration topics, see:

- [Advanced Migration Strategies](advanced-migration.md)
- [Enterprise Migration Planning](enterprise-migration.md)
- [Disaster Recovery](disaster-recovery.md)
