# Setting Up Team Vaults

This comprehensive guide walks you through setting up team vaults for collaborative secret management in SafeKey. Learn how to create teams, manage members, configure permissions, and establish best practices for secure collaboration.

## Overview

Team vaults in SafeKey enable secure collaboration by allowing multiple team members to access shared secrets with appropriate permissions and audit trails. This guide covers:

- Planning your team structure
- Creating and configuring team vaults
- Managing team members and permissions
- Establishing workflows and best practices
- Monitoring and auditing team activities

## Prerequisites

Before setting up team vaults, ensure you have:

- SafeKey installed and configured
- Cloud sync provider configured (GitHub, AWS S3, or Azure Blob)
- Understanding of your team's secret management needs
- Administrative permissions for your organization's accounts

## Planning Your Team Structure

### Team Hierarchy Design

Consider your organization's structure when planning teams:

```
Organization
├── Core Team (owners/admins)
├── Development Teams
│   ├── Frontend Team
│   ├── Backend Team
│   └── DevOps Team
├── Environment Teams
│   ├── Production Team
│   ├── Staging Team
│   └── Development Team
└── Project Teams
    ├── Project Alpha
    └── Project Beta
```

### Permission Strategy

Plan your permission model:

- **Owners**: Full control, can manage all aspects
- **Admins**: Can manage members and most settings
- **Editors**: Can modify secrets but not team structure
- **Viewers**: Read-only access to secrets

### Vault Organization

Decide on vault organization patterns:

**By Environment:**

- `production-secrets`
- `staging-secrets`
- `development-secrets`

**By Service:**

- `auth-service-secrets`
- `payment-service-secrets`
- `notification-service-secrets`

**By Team:**

- `frontend-team-secrets`
- `backend-team-secrets`
- `devops-team-secrets`

## Step 1: Create Your First Team

### Using the CLI

```bash
# Create a team with basic configuration
safekey team create "DevOps Team" \
  --description "DevOps team secrets and infrastructure" \
  --vault-name "devops-secrets"

# Create a team with advanced configuration
safekey team create "Production Team" \
  --description "Production environment secrets" \
  --vault-name "production-secrets" \
  --private \
  --max-members 5 \
  --require-2fa
```

### Using the API

```typescript
import { SafeKey } from '@vasudevshetty/safekey';

const safekey = new SafeKey();

const team = await safekey.createTeam('DevOps Team', {
  description: 'DevOps team secrets and infrastructure',
  vaultName: 'devops-secrets',
  isPrivate: true,
  maxMembers: 10,
  defaultRole: 'viewer',
  requireTwoFactor: true,
  cloudSync: {
    enabled: true,
    provider: 'github',
    autoSync: true,
  },
});

console.log(`Team created: ${team.name} with vault: ${team.vault.name}`);
```

### Team Configuration Options

```yaml
# Team configuration example
team:
  name: 'DevOps Team'
  description: 'DevOps team secrets and infrastructure'

  vault:
    name: 'devops-secrets'
    description: 'DevOps team vault'

  settings:
    private: true
    max_members: 10
    default_role: 'viewer'
    auto_approve_requests: false
    require_2fa: true
    invite_expiry: '7d'

  permissions:
    allow_secret_creation: true
    allow_secret_deletion: false
    require_approval_for_changes: true

  audit:
    log_secret_access: true
    log_member_changes: true
    retention_period: '1y'

  cloud_sync:
    enabled: true
    provider: 'github'
    auto_sync: true
    sync_interval: '5m'
```

## Step 2: Configure Cloud Synchronization

### GitHub Configuration

```bash
# Configure GitHub for team vault sync
safekey cloud configure github --interactive

# Test the configuration
safekey cloud providers test github

# Enable sync for the team vault
safekey vault switch devops-secrets
safekey cloud sync --provider github
```

### AWS S3 Configuration

```bash
# Configure AWS S3
safekey cloud configure aws-s3 \
  --access-key-id AKIA... \
  --secret-access-key ... \
  --region us-east-1 \
  --bucket safekey-team-vaults

# Create dedicated S3 path for team
safekey cloud configure aws-s3 set prefix "teams/devops/"

# Enable sync
safekey cloud sync --provider aws-s3
```

### Azure Blob Configuration

```bash
# Configure Azure Blob Storage
safekey cloud configure azure-blob \
  --account-name teamvaults \
  --account-key ... \
  --container-name safekey-vaults

# Set up team-specific container path
safekey cloud configure azure-blob set prefix "teams/devops/"

# Enable sync
safekey cloud sync --provider azure-blob
```

## Step 3: Invite Team Members

### Basic Member Invitation

```bash
# Invite a team member with default role
safekey team invite "DevOps Team" alice@company.com

# Invite with specific role and message
safekey team invite "DevOps Team" bob@company.com \
  --role admin \
  --message "Welcome to the DevOps team! You'll have admin access to manage our infrastructure secrets." \
  --expires "48h"

# Bulk invite from file
cat team-members.txt | while read email role; do
  safekey team invite "DevOps Team" "$email" --role "$role"
done
```

### Advanced Invitation Management

```typescript
// Programmatic team invitation
const team = await safekey.getTeam('DevOps Team');

// Invite with detailed configuration
const invitation = await team.inviteMember('charlie@company.com', {
  role: 'editor',
  message: 'Welcome to our team!',
  expiresIn: '7d',
  permissions: {
    canCreateSecrets: true,
    canDeleteSecrets: false,
    canInviteMembers: false,
  },
  onboardingTasks: [
    'Setup 2FA authentication',
    'Read team security guidelines',
    'Complete SafeKey training',
  ],
});

console.log(`Invitation sent: ${invitation.token}`);
console.log(`Expires at: ${invitation.expiresAt}`);

// Send custom notification
await invitation.sendCustomNotification({
  subject: 'Welcome to DevOps Team - SafeKey Access',
  template: 'team-welcome',
  variables: {
    teamName: team.name,
    inviterName: 'DevOps Manager',
    onboardingUrl: 'https://company.com/devops-onboarding',
  },
});
```

### Invitation Templates

Create reusable invitation templates:

```yaml
# .safekey/templates/team-invitations.yaml
templates:
  developer:
    role: 'editor'
    message: |
      Welcome to the development team! You now have access to our shared secrets.

      Please:
      1. Set up 2FA authentication
      2. Review our security guidelines at: https://company.com/security
      3. Join our Slack channel: #dev-team

      If you have questions, contact the team lead.
    expires_in: '7d'

  admin:
    role: 'admin'
    message: |
      Welcome to the team with admin privileges! 

      With great power comes great responsibility. Please:
      1. Enable 2FA immediately
      2. Review team member permissions
      3. Familiarize yourself with audit logs

      Contact IT security if you have questions.
    expires_in: '48h'
    permissions:
      can_invite_members: true
      can_manage_permissions: true
```

Use templates for consistent invitations:

```bash
# Apply invitation template
safekey team invite "DevOps Team" newdev@company.com --template developer
safekey team invite "DevOps Team" teamlead@company.com --template admin
```

## Step 4: Member Onboarding Process

### Automated Onboarding Workflow

```bash
#!/bin/bash
# onboard-team-member.sh

TEAM_NAME="$1"
MEMBER_EMAIL="$2"
ROLE="$3"

echo "Starting onboarding process for $MEMBER_EMAIL..."

# Send invitation
safekey team invite "$TEAM_NAME" "$MEMBER_EMAIL" \
  --role "$ROLE" \
  --template "$ROLE" \
  --expires "7d"

# Create onboarding checklist
cat > "onboarding-${MEMBER_EMAIL}.md" << EOF
# Onboarding Checklist for $MEMBER_EMAIL

## Security Setup
- [ ] Accept team invitation
- [ ] Set up 2FA authentication
- [ ] Verify email address
- [ ] Complete security training

## Team Integration
- [ ] Join team Slack/chat channels
- [ ] Meet with team lead
- [ ] Review team documentation
- [ ] Access development environment

## SafeKey Training
- [ ] Complete SafeKey basics tutorial
- [ ] Learn team secret naming conventions
- [ ] Practice secret retrieval and updates
- [ ] Understand audit and compliance requirements

## Sign-off
- [ ] Team Lead approval: ___________
- [ ] IT Security approval: ___________
- [ ] HR completion: ___________
EOF

echo "Onboarding checklist created: onboarding-${MEMBER_EMAIL}.md"

# Schedule follow-up
echo "safekey team audit '$TEAM_NAME' --member '$MEMBER_EMAIL'" | at now + 7 days

echo "Onboarding process initiated for $MEMBER_EMAIL"
```

### Member Acceptance Process

When members receive invitations, they should follow this process:

```bash
# Accept team invitation
safekey team join inv_abc123def456

# Verify team access
safekey team list --my-teams

# Switch to team vault
safekey vault switch devops-secrets

# Verify secret access
safekey list

# Set up local 2FA if required
safekey auth setup-2fa

# Test secret operations (if permitted)
safekey get DATABASE_URL
safekey add TEST_SECRET "test-value" --description "Testing access"
safekey remove TEST_SECRET
```

### Verification and Validation

```typescript
// Automated verification of new member setup
async function verifyMemberOnboarding(teamName: string, memberEmail: string) {
  const team = await safekey.getTeam(teamName);
  const member = await team.getMember(memberEmail);

  const checks = {
    memberExists: !!member,
    hasAcceptedInvitation: member?.status === 'active',
    has2FAEnabled: member?.twoFactorEnabled || false,
    hasAccessedVault: member?.lastVaultAccess !== null,
    hasValidRole: ['viewer', 'editor', 'admin', 'owner'].includes(member?.role),
  };

  const allChecksPass = Object.values(checks).every(Boolean);

  if (!allChecksPass) {
    console.log(`Onboarding incomplete for ${memberEmail}:`);
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`  ${check}: ${passed ? '✓' : '✗'}`);
    });
  }

  return allChecksPass;
}

// Run verification
const isComplete = await verifyMemberOnboarding(
  'DevOps Team',
  'alice@company.com'
);
```

## Step 5: Configure Permissions and Roles

### Role-Based Access Control

```bash
# View current team members and roles
safekey team roles list "DevOps Team"

# Update member roles
safekey team roles set "DevOps Team" alice@company.com admin
safekey team roles set "DevOps Team" bob@company.com editor

# Create custom role permissions
safekey team config "DevOps Team" set custom_roles.senior_developer '{
  "can_read_secrets": true,
  "can_write_secrets": true,
  "can_delete_secrets": false,
  "can_invite_members": false,
  "can_approve_changes": true
}'

# Apply custom role
safekey team roles set "DevOps Team" charlie@company.com senior_developer
```

### Fine-Grained Permissions

```yaml
# Team permission configuration
permissions:
  roles:
    viewer:
      secrets:
        read: true
        write: false
        delete: false
      members:
        view: true
        invite: false
        remove: false
      vault:
        backup: false
        restore: false
        configure: false

    editor:
      secrets:
        read: true
        write: true
        delete: false # Configurable per team
      members:
        view: true
        invite: false
        remove: false
      vault:
        backup: true
        restore: false
        configure: false

    admin:
      secrets:
        read: true
        write: true
        delete: true
      members:
        view: true
        invite: true
        remove: true
      vault:
        backup: true
        restore: true
        configure: true

  # Secret-level permissions
  secret_patterns:
    'PROD_*':
      required_role: 'admin'
      require_approval: true
      audit_access: true

    'DEV_*':
      required_role: 'editor'
      require_approval: false
      audit_access: false

  # Operation restrictions
  restrictions:
    bulk_operations:
      max_secrets: 10
      required_role: 'admin'

    dangerous_operations:
      vault_deletion: 'owner'
      member_removal: 'admin'
      role_changes: 'admin'
```

Apply advanced permissions:

```bash
# Set up pattern-based permissions
safekey team config "DevOps Team" set permissions.secret_patterns.PROD_.required_role admin
safekey team config "DevOps Team" set permissions.secret_patterns.PROD_.require_approval true

# Configure approval workflows
safekey team config "DevOps Team" set approval_workflows.secret_changes.enabled true
safekey team config "DevOps Team" set approval_workflows.secret_changes.approvers '["teamlead@company.com"]'
```

## Step 6: Establish Team Workflows

### Secret Naming Conventions

Establish clear naming conventions for your team:

```bash
# Create team naming convention guide
cat > team-naming-conventions.md << 'EOF'
# Team Secret Naming Conventions

## Naming Pattern
`{ENVIRONMENT}_{SERVICE}_{TYPE}_{DESCRIPTION}`

## Examples
- `PROD_API_KEY_STRIPE` - Production Stripe API key
- `STAGE_DATABASE_URL_POSTGRES` - Staging PostgreSQL connection
- `DEV_TOKEN_GITHUB` - Development GitHub token

## Environment Prefixes
- `PROD_` - Production environment
- `STAGE_` - Staging environment
- `DEV_` - Development environment
- `TEST_` - Testing environment

## Service Identifiers
- `API_` - API services
- `DATABASE_` - Database connections
- `CACHE_` - Caching services
- `AUTH_` - Authentication services

## Secret Types
- `KEY` - API keys and access keys
- `TOKEN` - Access tokens and JWTs
- `URL` - Connection strings and URLs
- `CERT` - Certificates and keys
- `PASSWORD` - Passwords and passphrases

## Tagging Strategy
Always include relevant tags:
- Environment: `production`, `staging`, `development`
- Service: `api`, `database`, `frontend`, `backend`
- Sensitivity: `low`, `medium`, `high`, `critical`
- Rotation: `monthly`, `quarterly`, `manual`
EOF

# Set up naming validation
safekey team config "DevOps Team" set validation.naming_pattern '^(PROD|STAGE|DEV|TEST)_[A-Z_]+$'
safekey team config "DevOps Team" set validation.required_tags '["environment", "service"]'
```

### Change Management Process

Implement a structured change management process:

```bash
#!/bin/bash
# change-secret.sh - Structured secret change process

SECRET_NAME="$1"
NEW_VALUE="$2"
CHANGE_REASON="$3"
TEAM_NAME="DevOps Team"

# Validate inputs
if [[ -z "$SECRET_NAME" || -z "$NEW_VALUE" || -z "$CHANGE_REASON" ]]; then
  echo "Usage: $0 <secret-name> <new-value> <change-reason>"
  exit 1
fi

echo "Initiating secret change process..."

# Create change request
CHANGE_ID="CHG-$(date +%Y%m%d-%H%M%S)"
echo "Change ID: $CHANGE_ID"

# Backup current value
CURRENT_VALUE=$(safekey get "$SECRET_NAME" --quiet)
echo "Current value backed up"

# Create change log entry
cat >> "change-log-${TEAM_NAME}.md" << EOF

## Change Request: $CHANGE_ID
- **Date**: $(date -u '+%Y-%m-%d %H:%M:%S UTC')
- **Secret**: $SECRET_NAME
- **Requested by**: $(whoami)
- **Reason**: $CHANGE_REASON
- **Status**: Pending Approval

EOF

# Check if approval is required
if safekey team config "$TEAM_NAME" get approval_workflows.secret_changes.enabled | grep -q true; then
  echo "Approval required for this change"

  # Create approval request
  safekey team approval request \
    --type "secret_change" \
    --secret "$SECRET_NAME" \
    --reason "$CHANGE_REASON" \
    --change-id "$CHANGE_ID"

  echo "Approval request submitted. Waiting for approval..."
  echo "Track status with: safekey team approval status $CHANGE_ID"

else
  # Direct change (no approval required)
  echo "Updating secret..."

  safekey add "$SECRET_NAME" "$NEW_VALUE" \
    --update \
    --description "Updated via change process $CHANGE_ID: $CHANGE_REASON"

  echo "Secret updated successfully"

  # Update change log
  sed -i "s/Status: Pending Approval/Status: Completed/g" "change-log-${TEAM_NAME}.md"
fi

echo "Change process completed for $CHANGE_ID"
```

### Emergency Access Procedures

Set up emergency access for critical situations:

```bash
# Emergency access script
#!/bin/bash
# emergency-access.sh

TEAM_NAME="$1"
EMERGENCY_CONTACT="$2"
REASON="$3"

echo "🚨 EMERGENCY ACCESS REQUEST 🚨"
echo "Team: $TEAM_NAME"
echo "Requester: $(whoami)"
echo "Emergency Contact: $EMERGENCY_CONTACT"
echo "Reason: $REASON"
echo "Timestamp: $(date -u)"

# Enable emergency mode
safekey team config "$TEAM_NAME" set emergency_mode.enabled true
safekey team config "$TEAM_NAME" set emergency_mode.activated_by "$(whoami)"
safekey team config "$TEAM_NAME" set emergency_mode.reason "$REASON"

# Grant temporary admin access
safekey team roles set "$TEAM_NAME" "$(whoami)" admin --temporary "2h"

# Send notifications
echo "Emergency access activated for team $TEAM_NAME" | \
  mail -s "🚨 SafeKey Emergency Access Activated" \
  "$EMERGENCY_CONTACT" \
  security@company.com

# Log emergency access
echo "$(date -u): Emergency access activated by $(whoami) for team $TEAM_NAME. Reason: $REASON" >> \
  /var/log/safekey/emergency-access.log

echo "Emergency access granted for 2 hours"
echo "Remember to disable emergency mode when complete:"
echo "safekey team config '$TEAM_NAME' set emergency_mode.enabled false"
```

## Step 7: Monitoring and Auditing

### Set Up Audit Logging

```bash
# Enable comprehensive audit logging
safekey team config "DevOps Team" set audit.enabled true
safekey team config "DevOps Team" set audit.log_secret_access true
safekey team config "DevOps Team" set audit.log_member_changes true
safekey team config "DevOps Team" set audit.log_permission_changes true
safekey team config "DevOps Team" set audit.retention_period "2y"

# Configure audit alerting
safekey team config "DevOps Team" set audit.alerts.failed_access.enabled true
safekey team config "DevOps Team" set audit.alerts.failed_access.threshold 5
safekey team config "DevOps Team" set audit.alerts.bulk_access.enabled true
safekey team config "DevOps Team" set audit.alerts.bulk_access.threshold 10
```

### Regular Audit Reviews

```bash
# Weekly audit review script
#!/bin/bash
# weekly-audit-review.sh

TEAM_NAME="DevOps Team"
REPORT_DATE=$(date +%Y-%m-%d)

echo "Generating weekly audit report for $TEAM_NAME..."

# Generate audit report
safekey team audit "$TEAM_NAME" \
  --since "7 days ago" \
  --export "audit-report-$REPORT_DATE.json"

# Analyze audit data
python3 << 'EOF'
import json
import sys
from collections import Counter
from datetime import datetime, timedelta

with open(f'audit-report-{sys.argv[1]}.json') as f:
    audit_data = json.load(f)

print(f"=== Audit Report for {sys.argv[1]} ===\n")

# Activity summary
actions = [entry['action'] for entry in audit_data['entries']]
action_counts = Counter(actions)

print("Activity Summary:")
for action, count in action_counts.most_common():
    print(f"  {action}: {count}")

# Most active users
users = [entry['user'] for entry in audit_data['entries']]
user_counts = Counter(users)

print("\nMost Active Users:")
for user, count in user_counts.most_common(5):
    print(f"  {user}: {count} actions")

# Security events
security_events = [
    entry for entry in audit_data['entries']
    if entry['action'] in ['failed_authentication', 'permission_denied', 'suspicious_activity']
]

if security_events:
    print(f"\n⚠️  Security Events Found: {len(security_events)}")
    for event in security_events[:5]:  # Show first 5
        print(f"  {event['timestamp']}: {event['action']} by {event['user']}")

# Recommendations
print("\n📝 Recommendations:")
if action_counts['secret_accessed'] > 100:
    print("  - High secret access volume. Consider caching strategies.")
if len(user_counts) < 3:
    print("  - Low team engagement. Ensure all members are trained.")
if security_events:
    print("  - Security events detected. Review access patterns.")

EOF

echo "Audit report generated: audit-report-$REPORT_DATE.json"
```

### Automated Monitoring

```typescript
// Automated team monitoring
import { SafeKey, TeamMonitor } from '@vasudevshetty/safekey';

class TeamMonitoring {
  private safekey: SafeKey;
  private monitor: TeamMonitor;

  constructor() {
    this.safekey = new SafeKey();
    this.monitor = new TeamMonitor();
  }

  async setupAlerts(teamName: string) {
    const team = await this.safekey.getTeam(teamName);

    // Monitor failed access attempts
    this.monitor.on('failedAccess', async (event) => {
      if (event.attempts > 5) {
        await this.sendAlert('security', {
          team: teamName,
          user: event.user,
          message: `Multiple failed access attempts: ${event.attempts}`,
          severity: 'high',
        });
      }
    });

    // Monitor unusual access patterns
    this.monitor.on('unusualAccess', async (event) => {
      await this.sendAlert('audit', {
        team: teamName,
        user: event.user,
        message: `Unusual access pattern detected: ${event.pattern}`,
        severity: 'medium',
      });
    });

    // Monitor member changes
    team.on('memberAdded', async (member) => {
      await this.sendAlert('team', {
        team: teamName,
        message: `New member added: ${member.email} (${member.role})`,
        severity: 'info',
      });
    });

    team.on('memberRemoved', async (member) => {
      await this.sendAlert('team', {
        team: teamName,
        message: `Member removed: ${member.email}`,
        severity: 'warning',
      });
    });

    // Monitor secret changes
    team.vault.on('secretModified', async (secret) => {
      if (secret.metadata.sensitivity === 'critical') {
        await this.sendAlert('security', {
          team: teamName,
          message: `Critical secret modified: ${secret.name}`,
          severity: 'high',
        });
      }
    });
  }

  private async sendAlert(type: string, details: any) {
    // Implementation depends on your alerting system
    // Examples: Slack, email, PagerDuty, etc.
    console.log(`Alert [${type}]:`, details);

    // Send to Slack
    await this.sendSlackAlert(details);

    // Send email for high severity
    if (details.severity === 'high') {
      await this.sendEmailAlert(details);
    }
  }

  private async sendSlackAlert(details: any) {
    // Slack integration
  }

  private async sendEmailAlert(details: any) {
    // Email integration
  }
}

// Start monitoring
const monitoring = new TeamMonitoring();
await monitoring.setupAlerts('DevOps Team');
```

## Best Practices and Recommendations

### Security Best Practices

1. **Principle of Least Privilege**
   - Grant minimum necessary permissions
   - Regular review and audit of member roles
   - Use temporary access for special situations

2. **Strong Authentication**
   - Require 2FA for all team members
   - Regular password rotation policies
   - Monitor authentication failures

3. **Access Monitoring**
   - Enable comprehensive audit logging
   - Set up alerts for unusual activities
   - Regular review of access patterns

4. **Secret Management**
   - Use consistent naming conventions
   - Implement proper tagging strategies
   - Regular rotation of sensitive secrets

### Operational Best Practices

1. **Team Onboarding**
   - Standardized onboarding process
   - Security training requirements
   - Verification of setup completion

2. **Change Management**
   - Approval workflows for critical changes
   - Change documentation and tracking
   - Rollback procedures for emergencies

3. **Communication**
   - Clear team communication channels
   - Regular team meetings and updates
   - Documentation of procedures and policies

4. **Disaster Recovery**
   - Regular backup procedures
   - Tested recovery processes
   - Emergency access procedures

## Troubleshooting Common Issues

### Member Access Issues

```bash
# Debug member access problems
safekey team info "DevOps Team" --members
safekey team roles list "DevOps Team"
safekey vault info devops-secrets --permissions

# Check individual member status
safekey team member status alice@company.com

# Verify cloud sync status
safekey cloud status devops-secrets
```

### Sync Problems

```bash
# Diagnose sync issues
safekey cloud status --all
safekey cloud history devops-secrets --limit 10

# Force sync if needed
safekey cloud sync devops-secrets --force

# Check for conflicts
safekey cloud conflicts list devops-secrets
```

### Permission Conflicts

```bash
# Review permission configuration
safekey team config "DevOps Team" show
safekey team roles permissions "DevOps Team"

# Reset permissions if needed
safekey team roles reset "DevOps Team" alice@company.com
```

## Next Steps

After setting up your team vault:

1. **Scale to Multiple Teams**: Create additional teams for different departments or projects
2. **Integrate with CI/CD**: Set up automated secret injection in your deployment pipelines
3. **Advanced Monitoring**: Implement comprehensive monitoring and alerting
4. **Compliance**: Ensure your setup meets regulatory requirements
5. **Training**: Conduct regular training sessions for team members

For more advanced team management topics, see:

- [Advanced Team Management](advanced-team-management.md)
- [Team Security Policies](team-security-policies.md)
- [Compliance and Governance](compliance-governance.md)
