/**
 * Team Collaboration Types
 * Types for team management, permissions, and collaboration features
 */

export interface TeamMember {
  id: string;
  email: string;
  name?: string;
  role: TeamRole;
  status: MemberStatus;
  joinedAt: Date;
  lastActive?: Date;
  permissions: Permission[];
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  owner: string; // TeamMember.id
  members: TeamMember[];
  settings: TeamSettings;
}

export interface SharedVault {
  id: string;
  name: string;
  description?: string;
  teamId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  permissions: VaultPermissions;
  auditLog: AuditEntry[];
}

export type TeamRole = 'owner' | 'admin' | 'member' | 'readonly';

export type MemberStatus = 'active' | 'invited' | 'suspended' | 'removed';

export type Permission =
  | 'vault.create'
  | 'vault.read'
  | 'vault.write'
  | 'vault.delete'
  | 'vault.share'
  | 'secret.create'
  | 'secret.read'
  | 'secret.write'
  | 'secret.delete'
  | 'team.invite'
  | 'team.remove'
  | 'team.manage'
  | 'audit.read';

export interface VaultPermissions {
  [userId: string]: {
    role: VaultRole;
    permissions: Permission[];
    grantedBy: string;
    grantedAt: Date;
  };
}

export type VaultRole = 'owner' | 'editor' | 'viewer';

export interface TeamSettings {
  defaultVaultPermissions: Permission[];
  requireInviteApproval: boolean;
  allowGuestAccess: boolean;
  auditRetentionDays: number;
  enforcePasswordPolicy: boolean;
  requireMFA: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName?: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  details?: Record<string, any>;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  };
}

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'share'
  | 'unshare'
  | 'invite'
  | 'join'
  | 'leave'
  | 'remove'
  | 'promote'
  | 'demote'
  | 'suspend'
  | 'restore'
  | 'login'
  | 'logout'
  | 'sync';

export type AuditResource =
  | 'team'
  | 'vault'
  | 'secret'
  | 'member'
  | 'permission'
  | 'session';

export interface TeamInvitation {
  id: string;
  teamId: string;
  invitedBy: string;
  invitedEmail: string;
  role: TeamRole;
  permissions: Permission[];
  createdAt: Date;
  expiresAt: Date;
  status: InvitationStatus;
  token: string;
}

export type InvitationStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'revoked';

export interface CollaborationSession {
  id: string;
  vaultId: string;
  userId: string;
  startedAt: Date;
  lastActivity: Date;
  status: SessionStatus;
  changes: CollaborationChange[];
}

export type SessionStatus = 'active' | 'idle' | 'disconnected' | 'ended';

export interface CollaborationChange {
  id: string;
  sessionId: string;
  timestamp: Date;
  action: 'create' | 'update' | 'delete';
  secretKey: string;
  oldValue?: string;
  newValue?: string;
  conflict?: boolean;
}

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<TeamRole, Permission[]> = {
  owner: [
    'vault.create',
    'vault.read',
    'vault.write',
    'vault.delete',
    'vault.share',
    'secret.create',
    'secret.read',
    'secret.write',
    'secret.delete',
    'team.invite',
    'team.remove',
    'team.manage',
    'audit.read',
  ],
  admin: [
    'vault.create',
    'vault.read',
    'vault.write',
    'vault.delete',
    'vault.share',
    'secret.create',
    'secret.read',
    'secret.write',
    'secret.delete',
    'team.invite',
    'team.remove',
    'audit.read',
  ],
  member: [
    'vault.create',
    'vault.read',
    'vault.write',
    'secret.create',
    'secret.read',
    'secret.write',
    'secret.delete',
  ],
  readonly: ['vault.read', 'secret.read'],
};

export const VAULT_ROLE_PERMISSIONS: Record<VaultRole, Permission[]> = {
  owner: [
    'vault.read',
    'vault.write',
    'vault.delete',
    'vault.share',
    'secret.create',
    'secret.read',
    'secret.write',
    'secret.delete',
  ],
  editor: [
    'vault.read',
    'vault.write',
    'secret.create',
    'secret.read',
    'secret.write',
    'secret.delete',
  ],
  viewer: ['vault.read', 'secret.read'],
};
