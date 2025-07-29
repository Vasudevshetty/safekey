# Integrations

SafeKey is designed to integrate seamlessly with popular development tools, cloud platforms, and workflows. This guide covers various integration patterns and implementations.

## Overview

SafeKey supports integrations with:

- **Development Tools**: IDEs, editors, terminal enhancements
- **CI/CD Platforms**: GitHub Actions, GitLab CI, Jenkins, etc.
- **Cloud Platforms**: AWS, Azure, Google Cloud
- **Container Orchestration**: Docker, Kubernetes, Docker Compose
- **Configuration Management**: Ansible, Terraform, Chef, Puppet
- **Monitoring & Alerting**: Prometheus, Grafana, PagerDuty, Slack
- **Password Managers**: 1Password, Bitwarden, LastPass

## IDE and Editor Integrations

### Visual Studio Code

Install the SafeKey extension for VS Code:

```json
// .vscode/settings.json
{
  "safekey.defaultVault": "development",
  "safekey.autoSync": true,
  "safekey.showInStatusBar": true,
  "safekey.environmentFile": ".env.safekey"
}
```

**Features:**

- Syntax highlighting for vault files
- Secret completion in environment files
- Integrated secret management panel
- Automatic environment variable injection

### IntelliJ IDEA / JetBrains IDEs

Configure SafeKey plugin:

```xml
<!-- .idea/safekey.xml -->
<application>
  <component name="SafeKeySettings">
    <option name="defaultVault" value="project-secrets" />
    <option name="autoImport" value="true" />
    <option name="environmentPrefix" value="SAFEKEY_" />
  </component>
</application>
```

### Vim/Neovim

SafeKey Vim plugin configuration:

```vim
" ~/.vimrc or ~/.config/nvim/init.vim
Plug 'vasudevshetty/safekey.vim'

" Configuration
let g:safekey_default_vault = 'personal'
let g:safekey_auto_source = 1

" Key mappings
nnoremap <leader>sg :SafeKeyGet<CR>
nnoremap <leader>sa :SafeKeyAdd<CR>
nnoremap <leader>sl :SafeKeyList<CR>
```

### Emacs

SafeKey Emacs integration:

```elisp
;; ~/.emacs.d/init.el
(use-package safekey
  :ensure t
  :config
  (setq safekey-default-vault "emacs-secrets")
  (global-set-key (kbd "C-c s g") 'safekey-get)
  (global-set-key (kbd "C-c s a") 'safekey-add)
  (global-set-key (kbd "C-c s l") 'safekey-list))
```

## Shell and Terminal Integrations

### Bash Integration

Add to `~/.bashrc`:

```bash
# SafeKey integration
export SAFEKEY_DEFAULT_VAULT="personal"

# Auto-completion
if command -v safekey >/dev/null 2>&1; then
  eval "$(safekey completion bash)"
fi

# Convenient aliases
alias sk='safekey'
alias skget='safekey get'
alias skadd='safekey add'
alias sklist='safekey list'

# Function to quickly export secrets
skenv() {
  local vault="${1:-$SAFEKEY_DEFAULT_VAULT}"
  eval $(safekey vault switch "$vault" && safekey list --format env)
}

# Function to run command with secrets
skrun() {
  local vault="$1"
  shift
  (
    skenv "$vault"
    "$@"
  )
}
```

### Zsh Integration

Add to `~/.zshrc`:

```zsh
# SafeKey integration
export SAFEKEY_DEFAULT_VAULT="personal"

# Auto-completion
if command -v safekey >/dev/null 2>&1; then
  eval "$(safekey completion zsh)"
fi

# Oh My Zsh plugin support
plugins=(... safekey)

# Advanced prompt integration
function safekey_prompt_info() {
  if [[ -n $SAFEKEY_CURRENT_VAULT ]]; then
    echo " 🔐 $SAFEKEY_CURRENT_VAULT"
  fi
}

# Add to your prompt
RPROMPT='$(safekey_prompt_info)'
```

### Fish Shell Integration

Add to `~/.config/fish/config.fish`:

```fish
# SafeKey integration
set -gx SAFEKEY_DEFAULT_VAULT personal

# Auto-completion
if command -v safekey >/dev/null 2>&1
    safekey completion fish | source
end

# Functions
function skenv
    set vault (test -n "$argv[1]" && echo $argv[1] || echo $SAFEKEY_DEFAULT_VAULT)
    safekey vault switch $vault
    eval (safekey list --format env)
end

function skget
    safekey get $argv
end
```

### Starship Prompt Integration

Add SafeKey status to Starship prompt:

```toml
# ~/.config/starship.toml
[custom.safekey]
command = "safekey status --format=prompt"
when = "test -n $SAFEKEY_CURRENT_VAULT"
symbol = "🔐 "
style = "bold blue"
format = "[$symbol$output]($style) "
```

## CI/CD Platform Integrations

### GitHub Actions

Create reusable SafeKey action:

```yaml
# .github/actions/safekey-setup/action.yml
name: 'Setup SafeKey'
description: 'Setup SafeKey and load secrets'
inputs:
  vault-name:
    description: 'Vault name to load'
    required: true
  master-password:
    description: 'Master password for vault'
    required: true
  cloud-provider:
    description: 'Cloud provider for vault sync'
    required: false
    default: 'github'

runs:
  using: 'composite'
  steps:
    - name: Download SafeKey
      shell: bash
      run: |
        wget -O safekey https://github.com/Vasudevshetty/safekey/releases/latest/download/safekey-linux
        chmod +x safekey
        sudo mv safekey /usr/local/bin/

    - name: Configure SafeKey
      shell: bash
      env:
        SAFEKEY_MASTER_PASSWORD: ${{ inputs.master-password }}
        SAFEKEY_NON_INTERACTIVE: true
      run: |
        safekey cloud configure ${{ inputs.cloud-provider }} --non-interactive
        safekey cloud download ${{ inputs.vault-name }}
        safekey vault switch ${{ inputs.vault-name }}

    - name: Export secrets
      shell: bash
      run: |
        safekey list --format env >> $GITHUB_ENV
```

Usage in workflows:

```yaml
# .github/workflows/deploy.yml
- name: Setup SafeKey
  uses: ./.github/actions/safekey-setup
  with:
    vault-name: 'production'
    master-password: ${{ secrets.SAFEKEY_PASSWORD }}
    cloud-provider: 'github'

- name: Deploy application
  run: |
    echo "Database URL: $DATABASE_URL"
    echo "API Key: $API_KEY"
    ./deploy.sh
```

### GitLab CI Templates

Create reusable GitLab CI templates:

```yaml
# .gitlab/ci/safekey.yml
.safekey_setup:
  before_script:
    - apk add --no-cache wget
    - wget -O safekey https://github.com/Vasudevshetty/safekey/releases/latest/download/safekey-linux
    - chmod +x safekey && mv safekey /usr/local/bin/
    - echo $SAFEKEY_VAULT_DATA | base64 -d > vault.safekey
    - safekey vault import vault.safekey --name $VAULT_NAME
    - safekey vault switch $VAULT_NAME
    - safekey list --format env > secrets.env
  artifacts:
    reports:
      dotenv: secrets.env
    expire_in: 1 hour

.safekey_deploy:
  extends: .safekey_setup
  stage: deploy
  script:
    - echo "Secrets loaded, running deployment"
    - ./deploy.sh
```

### Azure DevOps

Azure Pipelines integration:

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  - group: SafeKey-Variables

stages:
  - stage: Deploy
    jobs:
      - job: DeployJob
        steps:
          - task: Bash@3
            displayName: 'Setup SafeKey'
            inputs:
              targetType: 'inline'
              script: |
                wget -O safekey https://github.com/Vasudevshetty/safekey/releases/latest/download/safekey-linux
                chmod +x safekey
                sudo mv safekey /usr/local/bin/

                echo "$(SAFEKEY_VAULT_DATA)" | base64 -d > vault.safekey
                safekey vault import vault.safekey --name production
                safekey vault switch production

                # Export secrets to pipeline variables
                safekey list --format azure-devops >> $AZURE_DEVOPS_CLI_VARIABLE_PREFIX.env
```

## Container Integrations

### Docker Integration

Multi-stage Dockerfile with SafeKey:

```dockerfile
# Dockerfile
FROM alpine:latest AS secrets
RUN apk add --no-cache wget
RUN wget -O /usr/local/bin/safekey https://github.com/Vasudevshetty/safekey/releases/latest/download/safekey-linux
RUN chmod +x /usr/local/bin/safekey

# Copy vault and extract secrets
COPY vault.safekey /tmp/vault.safekey
ARG SAFEKEY_MASTER_PASSWORD
ENV SAFEKEY_NON_INTERACTIVE=true
RUN safekey vault import /tmp/vault.safekey --name app-vault
RUN safekey vault switch app-vault
RUN safekey list --format env > /tmp/secrets.env

# Production stage
FROM node:alpine
COPY --from=secrets /tmp/secrets.env /app/secrets.env
COPY . /app
WORKDIR /app

# Load secrets and run application
CMD ["sh", "-c", "source /app/secrets.env && npm start"]
```

### Docker Compose Integration

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    environment:
      - SAFEKEY_VAULT_NAME=production
    volumes:
      - ./vault.safekey:/app/vault.safekey:ro
    entrypoint: ['./entrypoint.sh']

  secrets-init:
    image: alpine:latest
    volumes:
      - secrets-data:/secrets
      - ./vault.safekey:/vault.safekey:ro
    command: |
      sh -c "
        apk add --no-cache wget &&
        wget -O /usr/local/bin/safekey https://github.com/Vasudevshetty/safekey/releases/latest/download/safekey-linux &&
        chmod +x /usr/local/bin/safekey &&
        safekey vault import /vault.safekey --name prod &&
        safekey vault switch prod &&
        safekey list --format env > /secrets/env
      "

volumes:
  secrets-data:
```

### Kubernetes Integration

SafeKey operator for Kubernetes:

```yaml
# safekey-operator.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: safekey-operator
  namespace: safekey-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: safekey-operator
  template:
    metadata:
      labels:
        app: safekey-operator
    spec:
      containers:
        - name: operator
          image: vasudevshetty/safekey-operator:latest
          env:
            - name: SAFEKEY_CLOUD_PROVIDER
              value: 'kubernetes-secrets'
---
apiVersion: v1
kind: CustomResourceDefinition
metadata:
  name: safekeyvaults.safekey.dev
spec:
  group: safekey.dev
  version: v1
  scope: Namespaced
  names:
    plural: safekeyvaults
    singular: safekeyvault
    kind: SafeKeyVault
```

SafeKey vault custom resource:

```yaml
# vault-cr.yaml
apiVersion: safekey.dev/v1
kind: SafeKeyVault
metadata:
  name: production-secrets
  namespace: production
spec:
  vaultName: production
  cloudProvider: aws-s3
  syncInterval: 5m
  secretTemplate:
    metadata:
      labels:
        managed-by: safekey
    type: Opaque
  secrets:
    - name: DATABASE_URL
      key: database-url
    - name: API_KEY
      key: api-key
```

## Cloud Platform Integrations

### AWS Integration

AWS Systems Manager Parameter Store integration:

```bash
#!/bin/bash
# sync-to-aws-ssm.sh

VAULT_NAME="production"
AWS_REGION="us-east-1"
SSM_PREFIX="/safekey/$VAULT_NAME"

# Export secrets to AWS SSM Parameter Store
safekey list --format json | jq -r '.secrets[] | "\(.name)=\(.value)"' | while IFS='=' read -r name value; do
  aws ssm put-parameter \
    --region "$AWS_REGION" \
    --name "$SSM_PREFIX/$name" \
    --value "$value" \
    --type "SecureString" \
    --overwrite

  echo "Synced $name to SSM"
done
```

AWS Lambda function for SafeKey integration:

```python
# lambda_function.py
import json
import boto3
import subprocess
import os

def lambda_handler(event, context):
    """Lambda function to sync SafeKey secrets to AWS Secrets Manager"""

    # Download SafeKey binary
    subprocess.run(['wget', '-O', '/tmp/safekey',
                   'https://github.com/Vasudevshetty/safekey/releases/latest/download/safekey-linux'])
    subprocess.run(['chmod', '+x', '/tmp/safekey'])

    # Set environment
    os.environ['PATH'] = '/tmp:' + os.environ['PATH']
    os.environ['SAFEKEY_NON_INTERACTIVE'] = 'true'

    # Import vault from S3
    vault_data = boto3.client('s3').get_object(
        Bucket=event['vault_bucket'],
        Key=event['vault_key']
    )['Body'].read()

    with open('/tmp/vault.safekey', 'wb') as f:
        f.write(vault_data)

    # Import and switch vault
    subprocess.run(['safekey', 'vault', 'import', '/tmp/vault.safekey', '--name', 'lambda-vault'])
    subprocess.run(['safekey', 'vault', 'switch', 'lambda-vault'])

    # Get secrets and sync to AWS Secrets Manager
    result = subprocess.run(['safekey', 'list', '--format', 'json'],
                          capture_output=True, text=True)
    secrets = json.loads(result.stdout)

    secrets_manager = boto3.client('secretsmanager')

    for secret in secrets['secrets']:
        secret_name = f"safekey/{event['vault_name']}/{secret['name']}"

        try:
            secrets_manager.create_secret(
                Name=secret_name,
                SecretString=secret['value'],
                Description=f"Synced from SafeKey vault: {event['vault_name']}"
            )
        except secrets_manager.exceptions.ResourceExistsException:
            secrets_manager.update_secret(
                SecretId=secret_name,
                SecretString=secret['value']
            )

    return {
        'statusCode': 200,
        'body': json.dumps(f"Synced {len(secrets['secrets'])} secrets")
    }
```

### Azure Integration

Azure Key Vault synchronization:

```powershell
# sync-to-azure-keyvault.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$VaultName,

    [Parameter(Mandatory=$true)]
    [string]$KeyVaultName,

    [Parameter(Mandatory=$true)]
    [string]$ResourceGroup
)

# Get secrets from SafeKey
$secrets = safekey list --format json | ConvertFrom-Json

# Login to Azure (assuming Azure CLI is configured)
az login --identity

foreach ($secret in $secrets.secrets) {
    $secretName = $secret.name -replace '[^a-zA-Z0-9-]', '-'

    az keyvault secret set `
        --vault-name $KeyVaultName `
        --name $secretName `
        --value $secret.value `
        --description "Synced from SafeKey vault: $VaultName"

    Write-Host "Synced $($secret.name) to Azure Key Vault"
}
```

### Google Cloud Integration

Google Secret Manager integration:

```python
#!/usr/bin/env python3
# sync-to-gcp-secret-manager.py

import json
import subprocess
from google.cloud import secretmanager

def sync_safekey_to_gcp(project_id, vault_name):
    """Sync SafeKey secrets to Google Cloud Secret Manager"""

    client = secretmanager.SecretManagerServiceClient()
    parent = f"projects/{project_id}"

    # Get secrets from SafeKey
    result = subprocess.run(['safekey', 'list', '--format', 'json'],
                          capture_output=True, text=True)
    secrets = json.loads(result.stdout)

    for secret in secrets['secrets']:
        secret_id = f"safekey-{vault_name}-{secret['name'].lower().replace('_', '-')}"

        try:
            # Create secret
            secret_obj = client.create_secret(
                request={
                    "parent": parent,
                    "secret_id": secret_id,
                    "secret": {
                        "labels": {
                            "source": "safekey",
                            "vault": vault_name
                        }
                    }
                }
            )
            print(f"Created secret: {secret_id}")
        except Exception as e:
            if "already exists" not in str(e):
                print(f"Error creating secret {secret_id}: {e}")
                continue

        # Add secret version
        secret_name = f"{parent}/secrets/{secret_id}"
        response = client.add_secret_version(
            request={
                "parent": secret_name,
                "payload": {"data": secret['value'].encode("UTF-8")}
            }
        )
        print(f"Added version to secret: {secret_id}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        print("Usage: sync-to-gcp-secret-manager.py <project-id> <vault-name>")
        sys.exit(1)

    sync_safekey_to_gcp(sys.argv[1], sys.argv[2])
```

## Configuration Management Integrations

### Ansible Integration

SafeKey Ansible lookup plugin:

```python
# plugins/lookup/safekey.py
from ansible.plugins.lookup import LookupBase
from ansible.errors import AnsibleError
import subprocess
import json

class LookupModule(LookupBase):
    def run(self, terms, variables=None, **kwargs):
        ret = []
        vault_name = kwargs.get('vault', None)

        for term in terms:
            try:
                cmd = ['safekey', 'get', term, '--format', 'json']
                if vault_name:
                    subprocess.run(['safekey', 'vault', 'switch', vault_name], check=True)

                result = subprocess.run(cmd, capture_output=True, text=True, check=True)
                secret_data = json.loads(result.stdout)
                ret.append(secret_data['value'])
            except subprocess.CalledProcessError as e:
                raise AnsibleError(f"Failed to get secret '{term}': {e}")

        return ret
```

Use in Ansible playbooks:

```yaml
# playbook.yml
---
- name: Deploy application with SafeKey secrets
  hosts: production
  vars:
    database_url: "{{ lookup('safekey', 'DATABASE_URL', vault='production') }}"
    api_key: "{{ lookup('safekey', 'API_KEY', vault='production') }}"

  tasks:
    - name: Configure application
      template:
        src: app.conf.j2
        dest: /etc/app/config.conf
      notify: restart app

    - name: Set environment variables
      lineinfile:
        path: /etc/environment
        line: '{{ item.key }}={{ item.value }}'
      loop:
        - { key: 'DATABASE_URL', value: '{{ database_url }}' }
        - { key: 'API_KEY', value: '{{ api_key }}' }
      no_log: true
```

### Terraform Integration

SafeKey Terraform provider:

```hcl
# main.tf
terraform {
  required_providers {
    safekey = {
      source  = "vasudevshetty/safekey"
      version = "~> 1.0"
    }
  }
}

provider "safekey" {
  vault_path = "/path/to/vault.safekey"
}

# Data source to read secrets
data "safekey_secret" "database_url" {
  name = "DATABASE_URL"
}

data "safekey_secret" "api_key" {
  name = "API_KEY"
}

# Use secrets in resources
resource "aws_db_instance" "main" {
  engine   = "postgres"
  username = "admin"
  password = data.safekey_secret.database_url.value

  # Other configuration...
}

resource "kubernetes_secret" "app_secrets" {
  metadata {
    name = "app-secrets"
  }

  data = {
    DATABASE_URL = data.safekey_secret.database_url.value
    API_KEY      = data.safekey_secret.api_key.value
  }
}
```

## Monitoring and Alerting Integrations

### Prometheus Integration

SafeKey metrics exporter:

```python
#!/usr/bin/env python3
# safekey_exporter.py

import time
import subprocess
import json
from prometheus_client import start_http_server, Gauge, Counter, Info

# Metrics
vault_secrets_total = Gauge('safekey_vault_secrets_total', 'Total number of secrets in vault', ['vault_name'])
vault_size_bytes = Gauge('safekey_vault_size_bytes', 'Vault file size in bytes', ['vault_name'])
vault_last_sync = Gauge('safekey_vault_last_sync_timestamp', 'Last sync timestamp', ['vault_name'])
vault_sync_errors = Counter('safekey_vault_sync_errors_total', 'Total sync errors', ['vault_name'])
vault_info = Info('safekey_vault_info', 'Vault information', ['vault_name'])

def collect_metrics():
    """Collect SafeKey metrics"""
    try:
        # Get vault list
        result = subprocess.run(['safekey', 'vault', 'list', '--format', 'json'],
                              capture_output=True, text=True, check=True)
        vaults = json.loads(result.stdout)

        for vault in vaults['vaults']:
            vault_name = vault['name']

            # Secret count
            vault_secrets_total.labels(vault_name=vault_name).set(vault['secret_count'])

            # Vault size
            vault_size_bytes.labels(vault_name=vault_name).set(vault['size_bytes'])

            # Last sync time
            if 'last_sync' in vault:
                vault_last_sync.labels(vault_name=vault_name).set(vault['last_sync'])

            # Vault info
            vault_info.labels(vault_name=vault_name).info({
                'description': vault.get('description', ''),
                'created': vault.get('created', ''),
                'cloud_provider': vault.get('cloud_provider', 'none')
            })

    except Exception as e:
        print(f"Error collecting metrics: {e}")

def main():
    start_http_server(8000)
    print("SafeKey exporter started on port 8000")

    while True:
        collect_metrics()
        time.sleep(60)  # Collect every minute

if __name__ == "__main__":
    main()
```

### Grafana Dashboard

Grafana dashboard configuration:

```json
{
  "dashboard": {
    "title": "SafeKey Monitoring",
    "panels": [
      {
        "title": "Vault Secret Count",
        "type": "stat",
        "targets": [
          {
            "expr": "safekey_vault_secrets_total",
            "legendFormat": "{{vault_name}}"
          }
        ]
      },
      {
        "title": "Vault Sync Status",
        "type": "table",
        "targets": [
          {
            "expr": "time() - safekey_vault_last_sync_timestamp",
            "legendFormat": "{{vault_name}}"
          }
        ]
      },
      {
        "title": "Sync Errors",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(safekey_vault_sync_errors_total[5m])",
            "legendFormat": "{{vault_name}}"
          }
        ]
      }
    ]
  }
}
```

### Slack Integration

Slack webhook for SafeKey notifications:

```bash
#!/bin/bash
# slack-notify.sh

SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
VAULT_NAME="$1"
EVENT_TYPE="$2"
MESSAGE="$3"

send_slack_notification() {
    local vault="$1"
    local event="$2"
    local message="$3"

    payload=$(cat <<EOF
{
    "channel": "#security",
    "username": "SafeKey",
    "icon_emoji": ":lock:",
    "text": "SafeKey Alert",
    "attachments": [
        {
            "color": "warning",
            "fields": [
                {
                    "title": "Vault",
                    "value": "$vault",
                    "short": true
                },
                {
                    "title": "Event",
                    "value": "$event",
                    "short": true
                },
                {
                    "title": "Message",
                    "value": "$message",
                    "short": false
                }
            ]
        }
    ]
}
EOF
)

    curl -X POST -H 'Content-type: application/json' \
         --data "$payload" \
         "$SLACK_WEBHOOK_URL"
}

send_slack_notification "$VAULT_NAME" "$EVENT_TYPE" "$MESSAGE"
```

For more integration examples and implementations, see the [Integration Examples Repository](https://github.com/Vasudevshetty/safekey-integrations).
