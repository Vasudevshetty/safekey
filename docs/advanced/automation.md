# Automation & Scripting

SafeKey provides powerful automation capabilities that allow you to integrate secrets management into your development workflows, CI/CD pipelines, and operational procedures. This guide covers scripting, automation patterns, and best practices.

## Overview

SafeKey automation features include:

- **Command-line scripting** with shell integration
- **CI/CD pipeline integration** for automated deployments
- **Webhook and event-driven automation** for reactive workflows
- **Scheduled tasks** for maintenance and backup operations
- **Custom hooks** for extending functionality

## Command-Line Scripting

### Exit Codes

SafeKey follows standard Unix exit code conventions:

- `0` - Success
- `1` - General error
- `2` - Command line argument error
- `3` - Authentication error
- `4` - Authorization error
- `5` - Resource not found
- `6` - Conflict or lock error
- `7` - Network error
- `8` - Encryption/decryption error

### Non-Interactive Mode

For automation, disable interactive prompts:

```bash
# Using environment variable
export SAFEKEY_NON_INTERACTIVE=true

# Using command flag
safekey --non-interactive get API_KEY

# Using configuration
safekey config set ui.interactive false
```

### Batch Operations

Process multiple secrets efficiently:

```bash
# Batch add from file
cat secrets.txt | while read name value; do
  safekey add "$name" "$value" --non-interactive
done

# Batch export to environment file
safekey list --format env > .env

# Batch import from JSON
safekey import secrets.json --format json --merge

# Bulk operations with confirmation bypass
safekey bulk-add --file secrets.csv --confirm
```

### Output Formats for Automation

Use machine-readable output formats:

```bash
# JSON output
safekey list --format json | jq '.secrets[].name'

# YAML output for configuration files
safekey export --format yaml > secrets.yaml

# Environment variable format
safekey list --format env > production.env

# CSV for spreadsheet import
safekey list --format csv > secrets.csv

# Custom templates
safekey list --template '{{.name}}={{.value}}'
```

## Shell Integration

### Command Substitution

Use SafeKey output in shell commands:

```bash
# Use secret in command
curl -H "Authorization: Bearer $(safekey get API_TOKEN)" https://api.example.com

# Set environment variables
export DATABASE_URL=$(safekey get DATABASE_URL)
export API_KEY=$(safekey get API_KEY)

# Conditional execution based on secret existence
if safekey exists MAINTENANCE_MODE; then
  echo "Maintenance mode is enabled"
  exit 1
fi
```

### Environment Variable Export

Export secrets as environment variables:

```bash
# Export all secrets to current shell
eval $(safekey list --format env)

# Export specific secrets
eval $(safekey get-multiple API_KEY DATABASE_URL --format env)

# Export with prefix
eval $(safekey list --format env --prefix PROD_)

# Export to file for sourcing
safekey list --format env > production.env
source production.env
```

### Shell Functions

Create convenient shell functions:

```bash
# Add to ~/.bashrc or ~/.zshrc
function safe() {
  case "$1" in
    get)
      safekey get "$2" --quiet
      ;;
    set)
      safekey add "$2" "$3" --update
      ;;
    env)
      eval $(safekey list --format env)
      ;;
    *)
      safekey "$@"
      ;;
  esac
}

# Usage
safe get API_KEY
safe set NEW_SECRET "secret value"
safe env
```

## CI/CD Integration

### GitHub Actions

Integrate SafeKey with GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy Application

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup SafeKey
        run: |
          wget -O safekey https://github.com/Vasudevshetty/safekey/releases/latest/download/safekey-linux
          chmod +x safekey
          sudo mv safekey /usr/local/bin/

      - name: Configure SafeKey
        env:
          SAFEKEY_MASTER_PASSWORD: ${{ secrets.SAFEKEY_PASSWORD }}
          SAFEKEY_VAULT_URL: ${{ secrets.SAFEKEY_VAULT_URL }}
        run: |
          safekey cloud download production-vault --non-interactive
          safekey vault switch production-vault

      - name: Deploy with secrets
        run: |
          # Export secrets as environment variables
          eval $(safekey list --format env --prefix DEPLOY_)

          # Run deployment script with secrets available
          ./deploy.sh
```

### GitLab CI

Integrate with GitLab CI/CD:

```yaml
# .gitlab-ci.yml
stages:
  - setup
  - deploy

variables:
  SAFEKEY_NON_INTERACTIVE: 'true'

setup_secrets:
  stage: setup
  image: alpine:latest
  before_script:
    - apk add --no-cache wget
    - wget -O safekey https://github.com/Vasudevshetty/safekey/releases/latest/download/safekey-linux
    - chmod +x safekey
    - mv safekey /usr/local/bin/
  script:
    - echo $SAFEKEY_VAULT_DATA | base64 -d > vault.safekey
    - safekey vault import vault.safekey --name ci-vault
    - safekey list --format env > secrets.env
  artifacts:
    reports:
      dotenv: secrets.env
    expire_in: 1 hour

deploy:
  stage: deploy
  dependencies:
    - setup_secrets
  script:
    - echo "Deploying with secrets loaded"
    - ./deploy.sh
```

### Jenkins Pipeline

Integrate with Jenkins:

```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        SAFEKEY_NON_INTERACTIVE = 'true'
    }

    stages {
        stage('Setup Secrets') {
            steps {
                script {
                    // Download and setup SafeKey
                    sh '''
                        wget -O safekey https://github.com/Vasudevshetty/safekey/releases/latest/download/safekey-linux
                        chmod +x safekey
                        ./safekey --version
                    '''

                    // Load vault from credentials
                    withCredentials([file(credentialsId: 'safekey-vault', variable: 'VAULT_FILE')]) {
                        sh './safekey vault import $VAULT_FILE --name pipeline-vault'
                    }

                    // Export secrets to environment
                    def secrets = sh(
                        script: './safekey list --format env',
                        returnStdout: true
                    ).trim()

                    // Parse and set environment variables
                    secrets.split('\n').each { line ->
                        def (key, value) = line.split('=', 2)
                        env[key] = value
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sh './deploy.sh'
            }
        }
    }
}
```

### Docker Integration

Use SafeKey in Docker containers:

```dockerfile
# Dockerfile
FROM alpine:latest

# Install SafeKey
RUN apk add --no-cache wget && \
    wget -O /usr/local/bin/safekey https://github.com/Vasudevshetty/safekey/releases/latest/download/safekey-linux && \
    chmod +x /usr/local/bin/safekey

# Copy vault file
COPY vault.safekey /app/vault.safekey

# Entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
```

```bash
#!/bin/bash
# entrypoint.sh

set -e

# Import vault
safekey vault import /app/vault.safekey --name app-vault --non-interactive

# Export secrets to environment
eval $(safekey list --format env)

# Execute main application
exec "$@"
```

## Event-Driven Automation

### Webhooks

Configure webhooks for secret events:

```bash
# Configure webhook endpoint
safekey config set webhooks.enabled true
safekey config set webhooks.url "https://your-webhook-endpoint.com/safekey"

# Configure webhook events
safekey config set webhooks.events "secret_created,secret_modified,secret_deleted"

# Set webhook authentication
safekey config set webhooks.auth.type "bearer"
safekey config set webhooks.auth.token "your-webhook-token"
```

### Custom Hooks

Implement custom hooks for automation:

```yaml
# ~/.safekey/config.yaml
hooks:
  secret_added: |
    #!/bin/bash
    echo "Secret added: $SAFEKEY_SECRET_NAME"
    curl -X POST https://api.example.com/notify \
      -H "Content-Type: application/json" \
      -d "{\"event\": \"secret_added\", \"name\": \"$SAFEKEY_SECRET_NAME\"}"

  secret_modified: |
    #!/bin/bash
    echo "Secret modified: $SAFEKEY_SECRET_NAME"
    # Trigger deployment if production secret changed
    if [[ "$SAFEKEY_VAULT_NAME" == "production" ]]; then
      ./trigger-deployment.sh
    fi

  sync_completed: |
    #!/bin/bash
    echo "Sync completed for vault: $SAFEKEY_VAULT_NAME"
    # Send notification to team
    slack-notify "Vault $SAFEKEY_VAULT_NAME synced successfully"
```

### Event Processing

Process events programmatically:

```python
#!/usr/bin/env python3
# event_processor.py

import json
import subprocess
import sys

def process_safekey_event(event_data):
    """Process SafeKey webhook event"""
    event_type = event_data.get('type')
    vault_name = event_data.get('vault')
    secret_name = event_data.get('secret')

    if event_type == 'secret_created':
        handle_secret_created(vault_name, secret_name)
    elif event_type == 'secret_modified':
        handle_secret_modified(vault_name, secret_name)
    elif event_type == 'sync_completed':
        handle_sync_completed(vault_name)

def handle_secret_created(vault, secret):
    """Handle new secret creation"""
    print(f"New secret '{secret}' created in vault '{vault}'")

    # Update configuration management
    subprocess.run([
        'ansible-playbook',
        'update-secrets.yml',
        f'--extra-vars=vault={vault},secret={secret}'
    ])

def handle_secret_modified(vault, secret):
    """Handle secret modification"""
    print(f"Secret '{secret}' modified in vault '{vault}'")

    # Restart services that use this secret
    if secret in ['DATABASE_URL', 'API_KEY']:
        subprocess.run(['systemctl', 'restart', 'myapp'])

def handle_sync_completed(vault):
    """Handle sync completion"""
    print(f"Sync completed for vault '{vault}'")

    # Validate secrets after sync
    result = subprocess.run([
        'safekey', 'vault', 'verify', vault
    ], capture_output=True, text=True)

    if result.returncode != 0:
        # Send alert about vault corruption
        send_alert(f"Vault {vault} failed verification after sync")

if __name__ == '__main__':
    event_data = json.loads(sys.stdin.read())
    process_safekey_event(event_data)
```

## Scheduled Automation

### Cron Jobs

Set up scheduled tasks with cron:

```bash
# Edit crontab
crontab -e

# Add scheduled tasks
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/safekey backup --all --output /backups/safekey-$(date +\%Y\%m\%d).backup

# Sync every 15 minutes
*/15 * * * * /usr/local/bin/safekey cloud sync --all --quiet

# Weekly vault verification
0 3 * * 0 /usr/local/bin/safekey vault verify --all --report

# Monthly password rotation reminder
0 9 1 * * echo "Time to rotate SafeKey master passwords" | mail -s "Password Rotation Reminder" admin@example.com
```

### Systemd Timers

Use systemd for more sophisticated scheduling:

```ini
# /etc/systemd/system/safekey-backup.service
[Unit]
Description=SafeKey Backup Service
After=network.target

[Service]
Type=oneshot
User=safekey
Group=safekey
Environment=SAFEKEY_NON_INTERACTIVE=true
ExecStart=/usr/local/bin/safekey backup --all --compress --output /backups/safekey-backup.gz
```

```ini
# /etc/systemd/system/safekey-backup.timer
[Unit]
Description=Daily SafeKey Backup
Requires=safekey-backup.service

[Timer]
OnCalendar=daily
RandomizedDelaySec=1h
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
# Enable and start timer
sudo systemctl enable safekey-backup.timer
sudo systemctl start safekey-backup.timer

# Check timer status
sudo systemctl status safekey-backup.timer
```

## Monitoring and Alerting

### Health Checks

Implement health checks for vault status:

```bash
#!/bin/bash
# health_check.sh

set -e

VAULT_NAME="production"
ALERT_EMAIL="admin@example.com"

# Check vault accessibility
if ! safekey vault info "$VAULT_NAME" >/dev/null 2>&1; then
  echo "ERROR: Cannot access vault $VAULT_NAME" | mail -s "SafeKey Alert" $ALERT_EMAIL
  exit 1
fi

# Check vault integrity
if ! safekey vault verify "$VAULT_NAME" --quiet; then
  echo "ERROR: Vault $VAULT_NAME failed integrity check" | mail -s "SafeKey Alert" $ALERT_EMAIL
  exit 1
fi

# Check cloud sync status
if ! safekey cloud status "$VAULT_NAME" --quiet; then
  echo "WARNING: Cloud sync issues for vault $VAULT_NAME" | mail -s "SafeKey Warning" $ALERT_EMAIL
fi

# Check secret count (detect unexpected changes)
CURRENT_COUNT=$(safekey list --count-only)
EXPECTED_COUNT=42

if [ "$CURRENT_COUNT" -ne "$EXPECTED_COUNT" ]; then
  echo "WARNING: Secret count changed from $EXPECTED_COUNT to $CURRENT_COUNT" | mail -s "SafeKey Warning" $ALERT_EMAIL
fi

echo "Health check passed for vault $VAULT_NAME"
```

### Log Monitoring

Monitor SafeKey logs for issues:

```bash
#!/bin/bash
# log_monitor.sh

LOG_FILE="$HOME/.safekey/logs/safekey.log"
ALERT_EMAIL="admin@example.com"

# Check for error patterns
if tail -n 100 "$LOG_FILE" | grep -q "ERROR\|FATAL"; then
  echo "Errors detected in SafeKey logs:" | mail -s "SafeKey Errors" $ALERT_EMAIL
  tail -n 50 "$LOG_FILE" | grep "ERROR\|FATAL" | mail -s "SafeKey Error Details" $ALERT_EMAIL
fi

# Check for authentication failures
AUTH_FAILURES=$(tail -n 1000 "$LOG_FILE" | grep -c "Authentication failed" || echo 0)
if [ "$AUTH_FAILURES" -gt 5 ]; then
  echo "Multiple authentication failures detected: $AUTH_FAILURES" | mail -s "SafeKey Security Alert" $ALERT_EMAIL
fi
```

## Infrastructure as Code

### Terraform Integration

Manage SafeKey resources with Terraform:

```hcl
# terraform/safekey.tf
terraform {
  required_providers {
    safekey = {
      source = "vasudevshetty/safekey"
      version = "~> 1.0"
    }
  }
}

provider "safekey" {
  vault_path = var.vault_path
}

resource "safekey_vault" "production" {
  name        = "production"
  description = "Production environment secrets"

  cloud_sync {
    enabled  = true
    provider = "aws-s3"
    bucket   = "my-safekey-backups"
  }
}

resource "safekey_secret" "database_url" {
  vault_name  = safekey_vault.production.name
  name        = "DATABASE_URL"
  value       = var.database_url
  description = "Production database connection string"

  tags = ["database", "production"]
}

resource "safekey_team" "devops" {
  name        = "DevOps Team"
  vault_name  = safekey_vault.production.name

  members = [
    {
      email = "alice@example.com"
      role  = "admin"
    },
    {
      email = "bob@example.com"
      role  = "editor"
    }
  ]
}
```

### Ansible Integration

Manage secrets with Ansible:

```yaml
# ansible/safekey-playbook.yml
---
- name: Manage SafeKey Secrets
  hosts: localhost
  tasks:
    - name: Ensure vault exists
      safekey_vault:
        name: '{{ vault_name }}'
        state: present

    - name: Add database credentials
      safekey_secret:
        vault: '{{ vault_name }}'
        name: DATABASE_URL
        value: '{{ database_url }}'
        state: present

    - name: Sync vault to cloud
      safekey_sync:
        vault: '{{ vault_name }}'
        provider: github
        state: synced
```

## Best Practices

### Security in Automation

- **Never hardcode master passwords** in scripts
- **Use environment variables** for sensitive configuration
- **Implement proper access controls** for automation systems
- **Audit automation scripts** regularly
- **Use dedicated service accounts** for automation

### Error Handling

```bash
#!/bin/bash
# robust_script.sh

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Function for error handling
handle_error() {
  local exit_code=$?
  echo "Error occurred on line $1: Exit code $exit_code" >&2
  # Cleanup and notification logic here
  exit $exit_code
}

trap 'handle_error $LINENO' ERR

# Robust secret retrieval with fallback
get_secret_safe() {
  local secret_name="$1"
  local fallback="${2:-}"

  if ! secret_value=$(safekey get "$secret_name" --quiet 2>/dev/null); then
    if [ -n "$fallback" ]; then
      echo "Warning: Using fallback for $secret_name" >&2
      echo "$fallback"
    else
      echo "Error: Could not retrieve $secret_name and no fallback provided" >&2
      return 1
    fi
  else
    echo "$secret_value"
  fi
}

# Usage
API_KEY=$(get_secret_safe "API_KEY" "fallback-key")
```

### Performance Optimization

```bash
# Batch operations for better performance
safekey bulk-add --file secrets.csv  # Instead of multiple 'add' commands

# Use local vault when possible
safekey vault switch local-vault  # Avoid cloud operations for frequent access

# Cache secrets for short-lived processes
eval $(safekey list --format env)  # Export once, use multiple times
```

### Logging and Debugging

```bash
# Enable debug logging for troubleshooting
export SAFEKEY_LOG_LEVEL=debug

# Log automation activities
exec > >(tee -a automation.log)
exec 2>&1

echo "$(date): Starting automation script"
# Your automation logic here
echo "$(date): Automation script completed"
```

For more automation examples and patterns, see the [Automation Cookbook](../guides/automation-cookbook.md).
