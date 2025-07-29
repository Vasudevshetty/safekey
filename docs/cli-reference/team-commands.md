# Team Commands

SafeKey provides comprehensive team collaboration features allowing secure sharing of vaults and secrets. This guide covers all team-related commands and workflows.

## Overview

Team functionality in SafeKey enables:

- Shared vault creation and management
- Member invitation and access control
- Role-based permissions
- Team audit and activity tracking
- Secure secret sharing workflows

## Core Team Commands

### `safekey team`

Main command for team operations and management.

**Syntax:**

```bash
safekey team <subcommand> [options]
```

**Subcommands:**

- [`create`](#team-create) - Create a new team
- [`list`](#team-list) - List teams and members
- [`join`](#team-join) - Join an existing team
- [`leave`](#team-leave) - Leave a team
- [`invite`](#team-invite) - Invite members to team
- [`remove`](#team-remove) - Remove team members
- [`roles`](#team-roles) - Manage member roles
- [`info`](#team-info) - Show team information
- [`audit`](#team-audit) - View team activity logs

---

## Team Management Commands

### `team create`

Create a new team and associated shared vault.

**Syntax:**

```bash
safekey team create <team-name> [options]
```

**Options:**

```bash
  -d, --description <desc>    Team description
  -v, --vault-name <name>     Name for team vault (default: team name)
  --private                   Create private team (invite-only)
  --public                    Create public team (discoverable)
  -m, --max-members <num>     Maximum team members (default: unlimited)
  --auto-approve              Auto-approve join requests
```

**Examples:**

```bash
# Create basic team
safekey team create "DevOps Team"

# Create team with custom vault and description
safekey team create "Frontend" \
  --vault-name "frontend-secrets" \
  --description "Frontend development team secrets"

# Create private team with member limit
safekey team create "Core Team" --private --max-members 5
```

**Team Creation Process:**

1. Creates team metadata
2. Generates team vault
3. Sets creator as team owner
4. Configures default permissions

### `team list`

List all teams you're a member of or can discover.

**Syntax:**

```bash
safekey team list [options]
```

**Options:**

```bash
  -v, --verbose               Show detailed information
  -j, --json                 Output in JSON format
  --my-teams                 Show only teams I'm a member of
  --public                   Show discoverable public teams
  --role <role>              Filter by my role in teams
  -s, --search <pattern>     Search teams by name or description
```

**Examples:**

```bash
# List all my teams
safekey team list --my-teams

# List public teams I can join
safekey team list --public

# Search for teams
safekey team list --search "frontend"

# Show teams where I'm an owner
safekey team list --role owner
```

**Output Example:**

```
My Teams
────────
DevOps Team (Owner)
  ├── Members: 5
  ├── Vault: devops-secrets (42 secrets)
  └── Last Activity: 2 hours ago

Frontend Team (Editor)
  ├── Members: 3
  ├── Vault: frontend-secrets (18 secrets)
  └── Last Activity: 1 day ago
```

### `team info`

Display detailed information about a specific team.

**Syntax:**

```bash
safekey team info <team-name> [options]
```

**Options:**

```bash
  -v, --verbose               Show all details
  -j, --json                 Output in JSON format
  --members                  Show member details
  --permissions              Show permission matrix
  --activity                 Show recent activity
  --vault-info               Include vault information
```

**Examples:**

```bash
# Basic team info
safekey team info "DevOps Team"

# Detailed info with members and activity
safekey team info "DevOps Team" --verbose --members --activity

# Show team permissions
safekey team info "DevOps Team" --permissions
```

---

## Member Management Commands

### `team invite`

Invite new members to a team.

**Syntax:**

```bash
safekey team invite <team-name> <email> [options]
```

**Options:**

```bash
  -r, --role <role>           Member role (viewer|editor|admin)
  -m, --message <text>        Custom invitation message
  --expires <duration>        Invitation expiry (e.g., "7d", "24h")
  --auto-accept              Auto-accept if member is known
  --send-email               Send email invitation
```

**Examples:**

```bash
# Basic invitation
safekey team invite "DevOps Team" alice@example.com

# Invite as admin with custom message
safekey team invite "DevOps Team" bob@example.com \
  --role admin \
  --message "Welcome to the DevOps team!"

# Invite with expiration
safekey team invite "DevOps Team" charlie@example.com \
  --expires "48h"
```

**Invitation Process:**

1. Validates team permissions (you must be admin/owner)
2. Generates secure invitation token
3. Creates invitation record
4. Sends notification (if configured)

### `team join`

Join a team using an invitation or team code.

**Syntax:**

```bash
safekey team join <invitation-token|team-code> [options]
```

**Options:**

```bash
  --accept                    Auto-accept invitation
  --vault-path <path>         Custom path for team vault
  --role <role>              Request specific role (if allowed)
```

**Examples:**

```bash
# Join using invitation token
safekey team join inv_abc123def456

# Join and auto-accept
safekey team join team_xyz789 --accept

# Join with custom vault location
safekey team join inv_abc123def456 --vault-path "~/teams/devops"
```

### `team remove`

Remove a member from a team.

**Syntax:**

```bash
safekey team remove <team-name> <member-email> [options]
```

**Options:**

```bash
  --confirm                   Skip confirmation prompt
  --revoke-access            Immediately revoke all access
  --transfer-secrets          Transfer owned secrets to another member
  --notify                   Send removal notification
```

**Examples:**

```bash
# Remove team member
safekey team remove "DevOps Team" alice@example.com

# Remove with immediate access revocation
safekey team remove "DevOps Team" alice@example.com \
  --revoke-access --confirm

# Remove and transfer secrets
safekey team remove "DevOps Team" alice@example.com \
  --transfer-secrets bob@example.com
```

### `team leave`

Leave a team you're currently a member of.

**Syntax:**

```bash
safekey team leave <team-name> [options]
```

**Options:**

```bash
  --confirm                   Skip confirmation prompt
  --transfer-ownership        Transfer ownership (if you're owner)
  --delete-local-vault        Delete local copy of team vault
  --keep-secrets              Keep local copies of secrets
```

**Examples:**

```bash
# Leave team
safekey team leave "DevOps Team"

# Leave and transfer ownership
safekey team leave "DevOps Team" \
  --transfer-ownership alice@example.com

# Leave and clean up local data
safekey team leave "DevOps Team" \
  --delete-local-vault --confirm
```

---

## Role Management Commands

### `team roles`

Manage member roles and permissions within a team.

**Syntax:**

```bash
safekey team roles <subcommand> <team-name> [options]
```

**Subcommands:**

- `list` - List all members and their roles
- `set` - Change a member's role
- `permissions` - Show role permissions

**Examples:**

```bash
# List all member roles
safekey team roles list "DevOps Team"

# Change member role
safekey team roles set "DevOps Team" alice@example.com admin

# Show role permissions
safekey team roles permissions "DevOps Team"
```

### Role Types

#### Owner

- Full team control
- Can delete team
- Can manage all members and roles
- Can modify team settings
- Full vault access

#### Admin

- Can invite/remove members (except owners)
- Can change member roles (except owners)
- Can modify team vault settings
- Full vault access

#### Editor

- Can read, create, and modify secrets
- Can view team member list
- Cannot manage members or roles
- Cannot modify team settings

#### Viewer

- Read-only access to secrets
- Can view team member list
- Cannot modify anything
- Cannot invite members

**Permission Matrix:**

| Action               | Owner | Admin | Editor | Viewer |
| -------------------- | ----- | ----- | ------ | ------ |
| View secrets         | ✓     | ✓     | ✓      | ✓      |
| Add/Edit secrets     | ✓     | ✓     | ✓      | ✗      |
| Delete secrets       | ✓     | ✓     | ✓      | ✗      |
| View members         | ✓     | ✓     | ✓      | ✓      |
| Invite members       | ✓     | ✓     | ✗      | ✗      |
| Remove members       | ✓     | ✓     | ✗      | ✗      |
| Change roles         | ✓     | ⚠️\*  | ✗      | ✗      |
| Modify team settings | ✓     | ✗     | ✗      | ✗      |
| Delete team          | ✓     | ✗     | ✗      | ✗      |

_⚠️ Admins can only change roles for non-owners_

---

## Team Audit and Monitoring

### `team audit`

View team activity logs and audit information.

**Syntax:**

```bash
safekey team audit <team-name> [options]
```

**Options:**

```bash
  --since <date>              Show activity since date
  --member <email>            Filter by specific member
  --action <action>           Filter by action type
  -n, --limit <number>        Limit number of entries
  -j, --json                 Output in JSON format
  --export <file>            Export audit log to file
```

**Action Types:**

- `secret_accessed` - Secret was viewed
- `secret_created` - New secret added
- `secret_modified` - Secret was changed
- `secret_deleted` - Secret was removed
- `member_invited` - New member invited
- `member_joined` - Member joined team
- `member_removed` - Member was removed
- `role_changed` - Member role modified
- `team_modified` - Team settings changed

**Examples:**

```bash
# Show recent team activity
safekey team audit "DevOps Team"

# Show activity for specific member
safekey team audit "DevOps Team" --member alice@example.com

# Show all secret modifications in last week
safekey team audit "DevOps Team" \
  --action secret_modified \
  --since "7 days ago"

# Export audit log
safekey team audit "DevOps Team" --export audit-report.json
```

**Output Example:**

```
Team Audit Log: DevOps Team
──────────────────────────
2025-01-29 15:30:00  alice@example.com   secret_modified  Updated API_KEY
2025-01-29 14:15:00  bob@example.com     secret_accessed  Viewed DATABASE_URL
2025-01-29 13:45:00  alice@example.com   member_invited   Invited charlie@example.com
2025-01-29 12:30:00  admin@example.com   role_changed     Promoted alice to admin
2025-01-29 11:00:00  bob@example.com     secret_created   Added REDIS_URL
```

---

## Team Vault Operations

### Shared Vault Access

Team vaults are automatically accessible to all team members based on their role permissions:

```bash
# Switch to team vault
safekey vault switch "devops-team-vault"

# List team secrets
safekey list

# Add secret to team vault
safekey add API_KEY "team-api-key-value"

# Access team secret
safekey get DATABASE_URL
```

### Team Vault Synchronization

Team vaults support automatic synchronization:

```bash
# Sync team vault with cloud
safekey cloud sync

# Check sync status
safekey cloud status

# Resolve sync conflicts
safekey cloud resolve-conflicts
```

---

## Team Settings and Configuration

### Team Configuration

Configure team-wide settings:

```bash
# Show team configuration
safekey team config <team-name> show

# Set team setting
safekey team config <team-name> set <key> <value>

# Available settings:
safekey team config "DevOps Team" set auto_sync true
safekey team config "DevOps Team" set invite_expiry "7d"
safekey team config "DevOps Team" set max_members 10
safekey team config "DevOps Team" set require_2fa true
```

### Team Templates

Create and use team templates for consistent setup:

```bash
# Create team template
safekey team template create "standard-dev-team" \
  --roles "owner,admin,editor,viewer" \
  --default-role "viewer" \
  --auto-sync \
  --invite-expiry "48h"

# Apply template to new team
safekey team create "New Team" --template "standard-dev-team"

# List available templates
safekey team template list
```

---

## Advanced Team Features

### Team Inheritance

Set up hierarchical team structures:

```bash
# Create parent team
safekey team create "Engineering" --type parent

# Create child team with inheritance
safekey team create "Frontend" --parent "Engineering"

# Members of parent team automatically get access to child teams
```

### Team Notifications

Configure team notification settings:

```bash
# Enable email notifications
safekey team notifications enable email

# Set notification preferences
safekey team notifications set member_changes true
safekey team notifications set secret_changes false
safekey team notifications set security_events true
```

### Team Backup and Recovery

Backup and restore team configurations:

```bash
# Backup team configuration
safekey team backup "DevOps Team" --output team-backup.json

# Restore team from backup
safekey team restore team-backup.json

# Migrate team to new infrastructure
safekey team migrate "DevOps Team" --destination new-server
```

## Best Practices

### Team Organization

- Use clear, descriptive team names
- Implement role-based access control appropriately
- Regular audit of team membership and permissions
- Document team purposes and access policies

### Security Practices

- Regular review of team member access
- Prompt removal of departed members
- Use invitation expiration for security
- Enable two-factor authentication where possible

### Collaboration Workflows

- Establish clear secret naming conventions
- Use team channels for secret-related discussions
- Document secret purposes and usage
- Implement change approval processes for critical secrets

### Monitoring and Maintenance

- Regular audit log reviews
- Monitor team vault sizes and activity
- Keep team configurations updated
- Plan for team leadership transitions

## Troubleshooting

### Common Issues

**Invitation not received:**

```bash
# Check invitation status
safekey team invite status <invitation-token>

# Resend invitation
safekey team invite resend <team-name> <email>
```

**Access denied errors:**

```bash
# Check your role in team
safekey team info <team-name> --members

# Verify team vault permissions
safekey vault info <team-vault>
```

**Sync conflicts:**

```bash
# Check team vault sync status
safekey cloud status

# Resolve conflicts manually
safekey cloud resolve-conflicts --interactive
```

For more troubleshooting help, see the [Team Troubleshooting Guide](../troubleshooting/common-issues.md#team-issues).
