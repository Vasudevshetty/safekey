/**
 * Team Manager
 * Handles team operations, member management, and permissions
 */

import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import {
  Team,
  TeamMember,
  SharedVault,
  TeamInvitation,
  AuditEntry,
  TeamRole,
  VaultRole,
  Permission,
  ROLE_PERMISSIONS,
  VAULT_ROLE_PERMISSIONS,
} from './types.js';
import { Config } from '../config/config.js';

export class TeamManager {
  private config: Config;
  private teams: Map<string, Team> = new Map();
  private invitations: Map<string, TeamInvitation> = new Map();
  private auditLog: AuditEntry[] = [];

  constructor() {
    this.config = new Config();
  }

  /**
   * Initialize team manager
   */
  async initialize(): Promise<void> {
    await this.loadTeams();
    await this.loadInvitations();
    await this.loadAuditLog();
  }

  /**
   * Create a new team
   */
  async createTeam(
    name: string,
    description: string,
    ownerId: string,
    ownerEmail: string
  ): Promise<Team> {
    const teamId = randomUUID();

    const owner: TeamMember = {
      id: ownerId,
      email: ownerEmail,
      role: 'owner',
      status: 'active',
      joinedAt: new Date(),
      lastActive: new Date(),
      permissions: ROLE_PERMISSIONS.owner,
    };

    const team: Team = {
      id: teamId,
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: ownerId,
      members: [owner],
      settings: {
        defaultVaultPermissions: ROLE_PERMISSIONS.member,
        requireInviteApproval: false,
        allowGuestAccess: false,
        auditRetentionDays: 90,
        enforcePasswordPolicy: true,
        requireMFA: false,
      },
    };

    this.teams.set(teamId, team);
    await this.saveTeams();

    await this.addAuditEntry({
      userId: ownerId,
      action: 'create',
      resource: 'team',
      resourceId: teamId,
      details: { teamName: name },
    });

    return team;
  }

  /**
   * Get team by ID
   */
  async getTeam(teamId: string): Promise<Team | undefined> {
    return this.teams.get(teamId);
  }

  /**
   * Get teams for a user
   */
  async getUserTeams(userId: string): Promise<Team[]> {
    return Array.from(this.teams.values()).filter((team) =>
      team.members.some(
        (member) => member.id === userId && member.status === 'active'
      )
    );
  }

  /**
   * Invite a user to a team
   */
  async inviteUser(
    teamId: string,
    invitedBy: string,
    invitedEmail: string,
    role: TeamRole = 'member'
  ): Promise<TeamInvitation> {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Check if inviter has permission
    if (!this.hasPermission(teamId, invitedBy, 'team.invite')) {
      throw new Error('Insufficient permissions to invite users');
    }

    // Check if user is already a member
    if (team.members.some((member) => member.email === invitedEmail)) {
      throw new Error('User is already a team member');
    }

    const invitationId = randomUUID();
    const invitation: TeamInvitation = {
      id: invitationId,
      teamId,
      invitedBy,
      invitedEmail,
      role,
      permissions: ROLE_PERMISSIONS[role],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'pending',
      token: randomUUID(),
    };

    this.invitations.set(invitationId, invitation);
    await this.saveInvitations();

    await this.addAuditEntry({
      userId: invitedBy,
      action: 'invite',
      resource: 'member',
      resourceId: invitedEmail,
      details: { teamId, role },
    });

    return invitation;
  }

  /**
   * Accept team invitation
   */
  async acceptInvitation(
    token: string,
    userId: string,
    userName?: string
  ): Promise<void> {
    const invitation = Array.from(this.invitations.values()).find(
      (inv) => inv.token === token && inv.status === 'pending'
    );

    if (!invitation) {
      throw new Error('Invalid or expired invitation');
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await this.saveInvitations();
      throw new Error('Invitation has expired');
    }

    const team = this.teams.get(invitation.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    const newMember: TeamMember = {
      id: userId,
      email: invitation.invitedEmail,
      name: userName,
      role: invitation.role,
      status: 'active',
      joinedAt: new Date(),
      lastActive: new Date(),
      permissions: invitation.permissions,
    };

    team.members.push(newMember);
    team.updatedAt = new Date();

    invitation.status = 'accepted';

    await this.saveTeams();
    await this.saveInvitations();

    await this.addAuditEntry({
      userId: userId,
      userName: userName,
      action: 'join',
      resource: 'team',
      resourceId: invitation.teamId,
      details: { role: invitation.role },
    });
  }

  /**
   * Remove team member
   */
  async removeMember(
    teamId: string,
    removedBy: string,
    memberId: string
  ): Promise<void> {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Check permissions
    if (!this.hasPermission(teamId, removedBy, 'team.remove')) {
      throw new Error('Insufficient permissions to remove members');
    }

    // Cannot remove team owner
    if (team.owner === memberId) {
      throw new Error('Cannot remove team owner');
    }

    const memberIndex = team.members.findIndex(
      (member) => member.id === memberId
    );
    if (memberIndex === -1) {
      throw new Error('Member not found');
    }

    const removedMember = team.members[memberIndex];
    team.members.splice(memberIndex, 1);
    team.updatedAt = new Date();

    await this.saveTeams();

    await this.addAuditEntry({
      userId: removedBy,
      action: 'remove',
      resource: 'member',
      resourceId: memberId,
      details: { teamId, memberEmail: removedMember.email },
    });
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    teamId: string,
    updatedBy: string,
    memberId: string,
    newRole: TeamRole
  ): Promise<void> {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Check permissions
    if (!this.hasPermission(teamId, updatedBy, 'team.manage')) {
      throw new Error('Insufficient permissions to manage members');
    }

    // Cannot change owner role
    if (team.owner === memberId) {
      throw new Error('Cannot change team owner role');
    }

    const member = team.members.find((m) => m.id === memberId);
    if (!member) {
      throw new Error('Member not found');
    }

    const oldRole = member.role;
    member.role = newRole;
    member.permissions = ROLE_PERMISSIONS[newRole];
    team.updatedAt = new Date();

    await this.saveTeams();

    await this.addAuditEntry({
      userId: updatedBy,
      action: 'update',
      resource: 'member',
      resourceId: memberId,
      details: { teamId, oldRole, newRole },
    });
  }

  /**
   * Create shared vault
   */
  async createSharedVault(
    teamId: string,
    createdBy: string,
    name: string,
    description?: string
  ): Promise<SharedVault> {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Check permissions
    if (!this.hasPermission(teamId, createdBy, 'vault.create')) {
      throw new Error('Insufficient permissions to create vaults');
    }

    const vaultId = randomUUID();
    const sharedVault: SharedVault = {
      id: vaultId,
      name,
      description,
      teamId,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: {
        [createdBy]: {
          role: 'owner',
          permissions: VAULT_ROLE_PERMISSIONS.owner,
          grantedBy: createdBy,
          grantedAt: new Date(),
        },
      },
      auditLog: [],
    };

    // Save vault info (actual vault creation would be handled by vault manager)
    await this.saveSharedVault(sharedVault);

    await this.addAuditEntry({
      userId: createdBy,
      action: 'create',
      resource: 'vault',
      resourceId: vaultId,
      details: { teamId, vaultName: name },
    });

    return sharedVault;
  }

  /**
   * Share vault with team member
   */
  async shareVault(
    vaultId: string,
    sharedBy: string,
    memberId: string,
    role: VaultRole = 'viewer'
  ): Promise<void> {
    const vault = await this.getSharedVault(vaultId);
    if (!vault) {
      throw new Error('Shared vault not found');
    }

    // Check if sharer has permission to share
    const sharerPermission = vault.permissions[sharedBy];
    if (
      !sharerPermission ||
      !sharerPermission.permissions.includes('vault.share')
    ) {
      throw new Error('Insufficient permissions to share vault');
    }

    vault.permissions[memberId] = {
      role,
      permissions: VAULT_ROLE_PERMISSIONS[role],
      grantedBy: sharedBy,
      grantedAt: new Date(),
    };

    vault.updatedAt = new Date();
    await this.saveSharedVault(vault);

    await this.addAuditEntry({
      userId: sharedBy,
      action: 'share',
      resource: 'vault',
      resourceId: vaultId,
      details: { memberId, role },
    });
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(
    teamId: string,
    userId: string,
    permission: Permission
  ): boolean {
    const team = this.teams.get(teamId);
    if (!team) return false;

    const member = team.members.find(
      (m) => m.id === userId && m.status === 'active'
    );
    if (!member) return false;

    return member.permissions.includes(permission);
  }

  /**
   * Get audit log for team
   */
  async getAuditLog(teamId: string, userId: string): Promise<AuditEntry[]> {
    if (!this.hasPermission(teamId, userId, 'audit.read')) {
      throw new Error('Insufficient permissions to read audit log');
    }

    return this.auditLog.filter(
      (entry) => entry.details?.teamId === teamId || entry.resourceId === teamId
    );
  }

  /**
   * Add audit log entry
   */
  private async addAuditEntry(
    entry: Omit<AuditEntry, 'id' | 'timestamp' | 'metadata'>
  ): Promise<void> {
    const auditEntry: AuditEntry = {
      id: randomUUID(),
      timestamp: new Date(),
      metadata: {
        // Add session info if available
      },
      ...entry,
    };

    this.auditLog.push(auditEntry);
    await this.saveAuditLog();

    // Cleanup old entries (keep only entries within retention period)
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - 90); // Default 90 days

    this.auditLog = this.auditLog.filter(
      (entry) => entry.timestamp > retentionDate
    );
  }

  /**
   * Data persistence methods
   */
  private async loadTeams(): Promise<void> {
    try {
      const teamsPath = path.join(this.config.getConfigDir(), 'teams.json');
      const data = await fs.readFile(teamsPath, 'utf-8');
      const teamsArray = JSON.parse(data);
      this.teams = new Map(teamsArray.map((team: Team) => [team.id, team]));
    } catch {
      // File doesn't exist or is invalid, start with empty teams
      this.teams = new Map();
    }
  }

  private async saveTeams(): Promise<void> {
    const teamsPath = path.join(this.config.getConfigDir(), 'teams.json');
    const teamsArray = Array.from(this.teams.values());
    await fs.writeFile(teamsPath, JSON.stringify(teamsArray, null, 2));
  }

  private async loadInvitations(): Promise<void> {
    try {
      const invitationsPath = path.join(
        this.config.getConfigDir(),
        'invitations.json'
      );
      const data = await fs.readFile(invitationsPath, 'utf-8');
      const invitationsArray = JSON.parse(data);
      this.invitations = new Map(
        invitationsArray.map((inv: TeamInvitation) => [inv.id, inv])
      );
    } catch {
      this.invitations = new Map();
    }
  }

  private async saveInvitations(): Promise<void> {
    const invitationsPath = path.join(
      this.config.getConfigDir(),
      'invitations.json'
    );
    const invitationsArray = Array.from(this.invitations.values());
    await fs.writeFile(
      invitationsPath,
      JSON.stringify(invitationsArray, null, 2)
    );
  }

  private async loadAuditLog(): Promise<void> {
    try {
      const auditPath = path.join(this.config.getConfigDir(), 'audit.json');
      const data = await fs.readFile(auditPath, 'utf-8');
      this.auditLog = JSON.parse(data);
    } catch {
      this.auditLog = [];
    }
  }

  private async saveAuditLog(): Promise<void> {
    const auditPath = path.join(this.config.getConfigDir(), 'audit.json');
    await fs.writeFile(auditPath, JSON.stringify(this.auditLog, null, 2));
  }

  private async getSharedVault(
    vaultId: string
  ): Promise<SharedVault | undefined> {
    try {
      const vaultPath = path.join(
        this.config.getConfigDir(),
        'shared-vaults',
        `${vaultId}.json`
      );
      const data = await fs.readFile(vaultPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return undefined;
    }
  }

  private async saveSharedVault(vault: SharedVault): Promise<void> {
    const vaultsDir = path.join(this.config.getConfigDir(), 'shared-vaults');
    await fs.mkdir(vaultsDir, { recursive: true });

    const vaultPath = path.join(vaultsDir, `${vault.id}.json`);
    await fs.writeFile(vaultPath, JSON.stringify(vault, null, 2));
  }
}
