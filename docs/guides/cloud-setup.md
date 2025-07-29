# Cloud Setup Guide

This comprehensive guide walks you through setting up cloud synchronization for SafeKey across different cloud providers. Learn how to configure, secure, and optimize cloud storage for your secrets management workflow.

## Overview

SafeKey supports multiple cloud storage providers for secure vault synchronization:

- **GitHub Gist**: Simple, Git-based synchronization
- **AWS S3**: Enterprise-grade object storage with advanced security
- **Azure Blob Storage**: Microsoft cloud storage with enterprise integration

This guide covers provider selection, configuration, security hardening, and optimization strategies.

## Prerequisites

Before setting up cloud synchronization, ensure you have:

- SafeKey installed and configured locally
- Active accounts with your chosen cloud provider(s)
- Appropriate permissions to create storage resources
- Understanding of your organization's cloud policies
- Network access to cloud provider APIs

## Provider Selection Guide

### GitHub Gist

**Best for:** Individual developers, small teams, Git-based workflows

**Pros:**

- Simple setup and management
- Git-based versioning and history
- Free tier available
- Easy sharing and collaboration
- Built-in access control

**Cons:**

- Limited to small file sizes
- Less enterprise features
- Dependent on GitHub availability
- Limited encryption options

**Use Cases:**

- Personal secret management
- Small development teams
- Git-centric workflows
- Quick prototyping

### AWS S3

**Best for:** Enterprise environments, high security requirements, AWS-based infrastructure

**Pros:**

- Enterprise-grade security and compliance
- Advanced access control (IAM)
- Encryption at rest and in transit
- High availability and durability
- Integration with AWS ecosystem
- Lifecycle management

**Cons:**

- More complex setup
- Cost considerations for storage and API calls
- Requires AWS knowledge
- More configuration options to manage

**Use Cases:**

- Enterprise organizations
- High-security environments
- AWS-based infrastructure
- Compliance requirements (SOC2, HIPAA, etc.)

### Azure Blob Storage

**Best for:** Microsoft-centric organizations, Office 365 integration

**Pros:**

- Integration with Microsoft ecosystem
- Advanced security features
- Role-based access control
- Compliance certifications
- Cost-effective storage tiers

**Cons:**

- Azure-specific knowledge required
- Complex permission model
- Limited free tier
- Microsoft ecosystem dependency

**Use Cases:**

- Microsoft-centric organizations
- Office 365 integration
- Azure-based infrastructure
- Hybrid cloud scenarios

## GitHub Gist Setup

### Basic Configuration

```bash
# Configure GitHub provider interactively
safekey cloud configure github --interactive

# Manual configuration
safekey cloud configure github \
  --token ghp_xxxxxxxxxxxxxxxxxxxx \
  --username your-github-username

# Test the configuration
safekey cloud providers test github
```

### Advanced GitHub Configuration

```bash
# Configure with custom settings
safekey cloud configure github \
  --token ghp_xxxxxxxxxxxxxxxxxxxx \
  --username your-github-username \
  --gist-description "SafeKey Vault Sync" \
  --private true \
  --auto-sync true \
  --sync-interval "5m"

# Set up organization-level gists (GitHub Enterprise)
safekey cloud configure github \
  --token ghp_xxxxxxxxxxxxxxxxxxxx \
  --username your-github-username \
  --organization your-org \
  --enterprise-url https://github.your-company.com

# Configure multiple GitHub accounts
safekey cloud configure github \
  --profile personal \
  --token ghp_personal_token \
  --username personal-account

safekey cloud configure github \
  --profile work \
  --token ghp_work_token \
  --username work-account \
  --organization company-org
```

### GitHub Token Setup

1. **Create Personal Access Token**:

   ```bash
   # Navigate to GitHub Settings > Developer settings > Personal access tokens
   # Or use GitHub CLI
   gh auth token
   ```

2. **Required Scopes**:
   - `gist` - Create and manage gists
   - `read:user` - Read user profile information

3. **Token Security**:

   ```bash
   # Store token securely in SafeKey itself
   safekey add GITHUB_SAFEKEY_TOKEN ghp_xxxxxxxxxxxxxxxxxxxx \
     --description "GitHub token for SafeKey cloud sync" \
     --tags "github,cloud,token"

   # Use token from SafeKey
   GITHUB_TOKEN=$(safekey get GITHUB_SAFEKEY_TOKEN --quiet)
   safekey cloud configure github --token "$GITHUB_TOKEN"
   ```

### Gist Management

```bash
# List all SafeKey gists
safekey cloud list github

# View gist details
safekey cloud info github --gist-id abc123

# Clean up old gists
safekey cloud cleanup github --older-than "30d"

# Backup gist URLs
safekey cloud backup github --export-urls gist-urls.txt
```

## AWS S3 Setup

### Prerequisites

1. **AWS Account Setup**:

   ```bash
   # Install AWS CLI
   pip install awscli

   # Configure AWS CLI
   aws configure
   ```

2. **Create S3 Bucket**:

   ```bash
   # Create bucket with appropriate settings
   aws s3 mb s3://your-safekey-bucket --region us-east-1

   # Enable versioning
   aws s3api put-bucket-versioning \
     --bucket your-safekey-bucket \
     --versioning-configuration Status=Enabled

   # Enable encryption
   aws s3api put-bucket-encryption \
     --bucket your-safekey-bucket \
     --server-side-encryption-configuration '{
       "Rules": [{
         "ApplyServerSideEncryptionByDefault": {
           "SSEAlgorithm": "AES256"
         }
       }]
     }'
   ```

### Basic S3 Configuration

```bash
# Configure S3 provider
safekey cloud configure aws-s3 \
  --access-key-id AKIA... \
  --secret-access-key ... \
  --region us-east-1 \
  --bucket your-safekey-bucket

# Test configuration
safekey cloud providers test aws-s3

# Enable synchronization
safekey cloud sync --provider aws-s3
```

### Advanced S3 Configuration

```bash
# Configure with advanced settings
safekey cloud configure aws-s3 \
  --access-key-id AKIA... \
  --secret-access-key ... \
  --region us-east-1 \
  --bucket your-safekey-bucket \
  --prefix "safekey/vaults/" \
  --storage-class STANDARD_IA \
  --server-side-encryption AES256 \
  --versioning true

# Configure with IAM role (for EC2 instances)
safekey cloud configure aws-s3 \
  --use-iam-role \
  --region us-east-1 \
  --bucket your-safekey-bucket

# Configure with custom endpoint (for S3-compatible services)
safekey cloud configure aws-s3 \
  --endpoint-url https://minio.your-company.com \
  --access-key-id minioaccess \
  --secret-access-key miniosecret \
  --bucket safekey-vaults \
  --force-path-style true
```

### S3 Security Configuration

```bash
# Create IAM policy for SafeKey S3 access
cat > safekey-s3-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-safekey-bucket",
        "arn:aws:s3:::your-safekey-bucket/safekey/*"
      ]
    }
  ]
}
EOF

# Create IAM user and attach policy
aws iam create-user --user-name safekey-sync
aws iam put-user-policy \
  --user-name safekey-sync \
  --policy-name SafeKeyS3Access \
  --policy-document file://safekey-s3-policy.json

# Create access keys
aws iam create-access-key --user-name safekey-sync
```

### S3 Lifecycle Management

```bash
# Configure S3 lifecycle for cost optimization
cat > lifecycle-config.json << 'EOF'
{
  "Rules": [
    {
      "ID": "SafeKeyVaultLifecycle",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "safekey/"
      },
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ],
      "NoncurrentVersionTransitions": [
        {
          "NoncurrentDays": 7,
          "StorageClass": "STANDARD_IA"
        },
        {
          "NoncurrentDays": 30,
          "StorageClass": "GLACIER"
        }
      ],
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 365
      }
    }
  ]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket your-safekey-bucket \
  --lifecycle-configuration file://lifecycle-config.json
```

## Azure Blob Storage Setup

### Prerequisites

1. **Azure CLI Setup**:

   ```bash
   # Install Azure CLI
   pip install azure-cli

   # Login to Azure
   az login
   ```

2. **Create Storage Account**:

   ```bash
   # Create resource group
   az group create --name safekey-rg --location eastus

   # Create storage account
   az storage account create \
     --name safekeystorage \
     --resource-group safekey-rg \
     --location eastus \
     --sku Standard_LRS \
     --encryption-services blob

   # Create container
   az storage container create \
     --name safekey-vaults \
     --account-name safekeystorage
   ```

### Basic Azure Configuration

```bash
# Get storage account key
STORAGE_KEY=$(az storage account keys list \
  --resource-group safekey-rg \
  --account-name safekeystorage \
  --query '[0].value' -o tsv)

# Configure Azure Blob provider
safekey cloud configure azure-blob \
  --account-name safekeystorage \
  --account-key "$STORAGE_KEY" \
  --container-name safekey-vaults

# Test configuration
safekey cloud providers test azure-blob
```

### Advanced Azure Configuration

```bash
# Configure with SAS token
SAS_TOKEN="?sv=2021-06-08&ss=b&srt=sco&sp=rwdlacupx&se=2023-12-31T23:59:59Z&st=2023-01-01T00:00:00Z&spr=https&sig=..."

safekey cloud configure azure-blob \
  --account-name safekeystorage \
  --sas-token "$SAS_TOKEN" \
  --container-name safekey-vaults \
  --prefix "vaults/"

# Configure with Azure AD authentication
safekey cloud configure azure-blob \
  --account-name safekeystorage \
  --use-azure-ad \
  --container-name safekey-vaults \
  --tenant-id your-tenant-id \
  --client-id your-app-id \
  --client-secret your-app-secret

# Configure with managed identity (for Azure VMs)
safekey cloud configure azure-blob \
  --account-name safekeystorage \
  --use-managed-identity \
  --container-name safekey-vaults
```

### Azure Security Configuration

```bash
# Create service principal for SafeKey
az ad sp create-for-rbac \
  --name "SafeKey-CloudSync" \
  --role "Storage Blob Data Contributor" \
  --scopes "/subscriptions/{subscription-id}/resourceGroups/safekey-rg/providers/Microsoft.Storage/storageAccounts/safekeystorage"

# Configure network access rules
az storage account network-rule add \
  --resource-group safekey-rg \
  --account-name safekeystorage \
  --ip-address 203.0.113.0/24

# Enable soft delete
az storage blob service-properties delete-policy update \
  --account-name safekeystorage \
  --enable true \
  --days-retained 30
```

## Multi-Provider Setup

### Configure Multiple Providers

```bash
# Set up primary and backup providers
safekey cloud configure github --profile primary
safekey cloud configure aws-s3 --profile backup

# Configure automatic failover
safekey cloud config set failover.enabled true
safekey cloud config set failover.primary_provider github
safekey cloud config set failover.backup_providers '["aws-s3"]'
safekey cloud config set failover.health_check_interval "60s"
```

### Provider Sync Strategies

```yaml
# .safekey/cloud-config.yaml
sync_strategy:
  mode: 'multi_provider' # single, multi_provider, active_passive

  providers:
    github:
      priority: 1
      sync_frequency: 'immediate'
      conflict_resolution: 'last_write_wins'

    aws-s3:
      priority: 2
      sync_frequency: '5m'
      conflict_resolution: 'merge'

    azure-blob:
      priority: 3
      sync_frequency: 'hourly'
      conflict_resolution: 'manual'

  conflict_resolution:
    default_strategy: 'prompt' # auto, prompt, last_write_wins
    backup_before_resolve: true
    notify_on_conflicts: true

  health_monitoring:
    enabled: true
    check_interval: '30s'
    failure_threshold: 3
    recovery_check_interval: '5m'
```

## Security Hardening

### Encryption Configuration

```bash
# Configure client-side encryption
safekey config set encryption.cloud_sync.enabled true
safekey config set encryption.cloud_sync.algorithm "AES-256-GCM"
safekey config set encryption.cloud_sync.key_derivation "PBKDF2"

# Set up encryption key
safekey encryption setup-cloud-key \
  --provider all \
  --key-file ~/.safekey/cloud-encryption.key

# Use hardware security module (if available)
safekey encryption setup-cloud-key \
  --provider all \
  --hsm-slot 0 \
  --hsm-pin-file ~/.safekey/hsm-pin
```

### Access Control

```bash
# Configure IP allowlisting
safekey cloud security set-ip-allowlist \
  --provider aws-s3 \
  --ips "203.0.113.0/24,198.51.100.0/24"

# Set up VPC endpoints (AWS)
safekey cloud configure aws-s3 set vpc_endpoint_id vpce-12345678

# Configure private endpoints (Azure)
safekey cloud configure azure-blob set private_endpoint true
safekey cloud configure azure-blob set virtual_network vnet-safekey
```

### Audit and Monitoring

```bash
# Enable cloud access logging
safekey cloud audit enable --all-providers
safekey cloud audit set-retention 90d

# Configure alerting
safekey cloud alerts add \
  --type "unusual_access" \
  --provider all \
  --threshold 10 \
  --action "email:security@company.com"

# Set up monitoring dashboard
safekey cloud monitor setup \
  --providers "github,aws-s3,azure-blob" \
  --metrics "sync_frequency,error_rate,latency" \
  --dashboard-url "https://monitoring.company.com/safekey"
```

## Optimization and Performance

### Sync Optimization

```bash
# Configure intelligent sync
safekey cloud config set sync.intelligent_batching true
safekey cloud config set sync.batch_size 50
safekey cloud config set sync.max_concurrent_uploads 5

# Set up compression
safekey cloud config set compression.enabled true
safekey cloud config set compression.algorithm "gzip"
safekey cloud config set compression.level 6

# Configure caching
safekey cloud config set cache.enabled true
safekey cloud config set cache.ttl "15m"
safekey cloud config set cache.max_size "100MB"
```

### Network Optimization

```bash
# Configure connection pooling
safekey cloud config set network.connection_pool_size 10
safekey cloud config set network.keep_alive true
safekey cloud config set network.timeout "30s"

# Set up retry logic
safekey cloud config set retry.max_attempts 3
safekey cloud config set retry.backoff_strategy "exponential"
safekey cloud config set retry.initial_delay "1s"

# Configure bandwidth limits
safekey cloud config set bandwidth.upload_limit "10MB/s"
safekey cloud config set bandwidth.download_limit "50MB/s"
```

## Monitoring and Maintenance

### Health Checks

```bash
# Automated health check script
#!/bin/bash
# cloud-health-check.sh

PROVIDERS=("github" "aws-s3" "azure-blob")
ALERT_EMAIL="devops@company.com"

for provider in "${PROVIDERS[@]}"; do
  echo "Checking $provider..."

  if safekey cloud providers test "$provider" --quiet; then
    echo "✓ $provider is healthy"
  else
    echo "✗ $provider is down"

    # Send alert
    echo "Cloud provider $provider is experiencing issues" | \
      mail -s "SafeKey Cloud Alert: $provider Down" "$ALERT_EMAIL"

    # Try fallback
    safekey cloud failover "$provider"
  fi
done

# Test sync performance
sync_time=$(time safekey cloud sync --dry-run 2>&1 | grep real | awk '{print $2}')
echo "Sync performance: $sync_time"

# Check storage usage
safekey cloud usage --all-providers
```

### Backup and Recovery

```bash
# Create backup of cloud configuration
safekey cloud backup-config --output cloud-config-backup.json

# Backup all cloud data
safekey cloud backup --all-providers --output-dir ./cloud-backups/

# Test recovery procedure
safekey cloud restore --config cloud-config-backup.json --dry-run

# Automated backup script
#!/bin/bash
# daily-cloud-backup.sh

BACKUP_DIR="/backup/safekey/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

# Backup configuration
safekey cloud backup-config --output "$BACKUP_DIR/config.json"

# Backup all vaults
safekey cloud backup --all-providers --output-dir "$BACKUP_DIR/vaults/"

# Cleanup old backups (keep 30 days)
find /backup/safekey/ -type d -mtime +30 -exec rm -rf {} \;

echo "Cloud backup completed: $BACKUP_DIR"
```

### Performance Monitoring

```typescript
// Cloud performance monitoring
import { SafeKey, CloudMonitor } from '@vasudevshetty/safekey';

class CloudPerformanceMonitor {
  private safekey: SafeKey;
  private monitor: CloudMonitor;
  private metrics: Map<string, any> = new Map();

  constructor() {
    this.safekey = new SafeKey();
    this.monitor = new CloudMonitor();
  }

  async startMonitoring() {
    // Monitor sync performance
    this.monitor.on('syncStarted', (event) => {
      this.metrics.set(`sync_${event.provider}_start`, Date.now());
    });

    this.monitor.on('syncCompleted', (event) => {
      const startTime = this.metrics.get(`sync_${event.provider}_start`);
      const duration = Date.now() - startTime;

      this.recordMetric('sync_duration', {
        provider: event.provider,
        duration,
        secrets_count: event.secretsCount,
        bytes_transferred: event.bytesTransferred,
      });
    });

    // Monitor error rates
    this.monitor.on('syncError', (event) => {
      this.recordMetric('sync_error', {
        provider: event.provider,
        error: event.error,
        retry_count: event.retryCount,
      });
    });

    // Generate hourly reports
    setInterval(
      () => {
        this.generatePerformanceReport();
      },
      60 * 60 * 1000
    ); // Every hour
  }

  private recordMetric(type: string, data: any) {
    const timestamp = new Date().toISOString();
    console.log(`Metric [${type}] ${timestamp}:`, data);

    // Send to monitoring system
    this.sendToMonitoring(type, data, timestamp);
  }

  private async generatePerformanceReport() {
    const providers = ['github', 'aws-s3', 'azure-blob'];
    const report = {
      timestamp: new Date().toISOString(),
      providers: {},
    };

    for (const provider of providers) {
      const status = await this.safekey.cloud.getProviderStatus(provider);
      report.providers[provider] = {
        healthy: status.healthy,
        lastSync: status.lastSync,
        errorRate: status.errorRate,
        averageLatency: status.averageLatency,
      };
    }

    console.log('Performance Report:', JSON.stringify(report, null, 2));

    // Send to dashboard
    await this.sendToDashboard(report);
  }

  private async sendToMonitoring(type: string, data: any, timestamp: string) {
    // Implementation depends on your monitoring system
    // Examples: Prometheus, DataDog, CloudWatch, etc.
  }

  private async sendToDashboard(report: any) {
    // Send to dashboard system
  }
}

// Start monitoring
const monitor = new CloudPerformanceMonitor();
await monitor.startMonitoring();
```

## Troubleshooting Common Issues

### Connection Problems

```bash
# Test network connectivity
safekey cloud test-connectivity --provider github --verbose
safekey cloud test-connectivity --provider aws-s3 --verbose

# Check authentication
safekey cloud auth-test --all-providers

# Verify DNS resolution
nslookup api.github.com
nslookup s3.amazonaws.com
nslookup blob.core.windows.net
```

### Sync Conflicts

```bash
# List current conflicts
safekey cloud conflicts list --all-providers

# Resolve conflicts interactively
safekey cloud conflicts resolve --interactive

# Automated conflict resolution
safekey cloud conflicts resolve --strategy last_write_wins
safekey cloud conflicts resolve --strategy merge
```

### Performance Issues

```bash
# Analyze sync performance
safekey cloud analyze --provider github --days 7
safekey cloud analyze --provider aws-s3 --include-bandwidth

# Check for rate limiting
safekey cloud limits status --all-providers

# Optimize configuration
safekey cloud optimize --provider aws-s3 --metric latency
```

### Provider-Specific Issues

**GitHub:**

```bash
# Check GitHub API status
curl -s https://www.githubstatus.com/api/v2/status.json

# Verify token permissions
safekey cloud configure github --verify-permissions

# Check rate limits
safekey cloud providers status github --rate-limits
```

**AWS S3:**

```bash
# Check AWS service status
aws s3api head-bucket --bucket your-safekey-bucket

# Verify IAM permissions
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::123456789012:user/safekey-sync \
  --action-names s3:GetObject s3:PutObject \
  --resource-arns arn:aws:s3:::your-safekey-bucket/*

# Test regional connectivity
aws s3 ls s3://your-safekey-bucket --region us-east-1
```

**Azure Blob:**

```bash
# Check Azure service status
az storage blob list --container-name safekey-vaults --account-name safekeystorage

# Verify permissions
az role assignment list --assignee your-service-principal-id

# Test connectivity
az storage blob exists \
  --name test-connectivity \
  --container-name safekey-vaults \
  --account-name safekeystorage
```

## Best Practices Summary

### Security

- Always enable encryption in transit and at rest
- Use least-privilege access policies
- Regularly rotate access keys and tokens
- Monitor access patterns for anomalies
- Implement proper network security controls

### Performance

- Choose geographically close providers
- Enable compression for large vaults
- Use appropriate sync frequencies
- Monitor and optimize based on usage patterns
- Implement caching strategies

### Reliability

- Configure multiple provider redundancy
- Set up automated health checks
- Implement proper retry and fallback logic
- Regular backup and recovery testing
- Monitor provider service status

### Cost Optimization

- Choose appropriate storage classes
- Implement lifecycle policies
- Monitor usage and costs
- Optimize sync frequencies
- Use compression and deduplication

## Next Steps

After setting up cloud synchronization:

1. **Team Collaboration**: Configure team vaults with cloud sync
2. **CI/CD Integration**: Set up automated secret injection
3. **Monitoring and Alerting**: Implement comprehensive monitoring
4. **Compliance**: Ensure setup meets regulatory requirements
5. **Disaster Recovery**: Test backup and recovery procedures

For more cloud-related topics, see:

- [Advanced Cloud Security](advanced-cloud-security.md)
- [Multi-Region Deployment](multi-region-deployment.md)
- [Cloud Cost Optimization](cloud-cost-optimization.md)
