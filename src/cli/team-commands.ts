#!/usr/bin/env node

/**
 * Team Commands
 * CLI commands for team collaboration features
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { TeamManager } from '../team/team-manager.js';
import { randomUUID } from 'crypto';

const teamManager = new TeamManager();

/**
 * Create a new team
 */
async function createTeam(options: {
  name?: string;
  description?: string;
  interactive?: boolean;
}) {
  try {
    await teamManager.initialize();

    let teamName = options.name;
    let description = options.description;

    if (options.interactive || !teamName) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Team name:',
          default: teamName,
          validate: (input: string) =>
            input.trim().length > 0 || 'Team name is required',
        },
        {
          type: 'input',
          name: 'description',
          message: 'Team description (optional):',
          default: description,
        },
      ]);

      teamName = answers.name;
      description = answers.description;
    }

    if (!teamName) {
      console.error(chalk.red('Team name is required'));
      process.exit(1);
    }

    // For now, use a mock user ID (in real implementation, this would come from auth)
    const userId = randomUUID();
    const userEmail = 'user@example.com';

    const team = await teamManager.createTeam(
      teamName,
      description || '',
      userId,
      userEmail
    );

    console.log(chalk.green('✓ Team created successfully'));
    console.log(`Team ID: ${team.id}`);
    console.log(`Name: ${team.name}`);
    if (team.description) {
      console.log(`Description: ${team.description}`);
    }
    console.log(`Created: ${team.createdAt.toLocaleDateString()}`);
  } catch (error) {
    console.error(
      chalk.red('Error creating team:'),
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

/**
 * List user's teams
 */
async function listTeams() {
  try {
    await teamManager.initialize();

    // Mock user ID (in real implementation, this would come from auth)
    const userId = randomUUID();

    const teams = await teamManager.getUserTeams(userId);

    if (teams.length === 0) {
      console.log(chalk.yellow('No teams found'));
      return;
    }

    console.log(chalk.blue('Your Teams:'));
    console.log('');

    teams.forEach((team, index) => {
      console.log(`${index + 1}. ${chalk.bold(team.name)}`);
      console.log(`   ID: ${team.id}`);
      if (team.description) {
        console.log(`   Description: ${team.description}`);
      }
      console.log(`   Members: ${team.members.length}`);
      console.log(`   Created: ${team.createdAt.toLocaleDateString()}`);
      console.log('');
    });
  } catch (error) {
    console.error(
      chalk.red('Error listing teams:'),
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

/**
 * Invite user to team
 */
async function inviteUser(
  teamId: string,
  email: string,
  options: { role?: string }
) {
  try {
    await teamManager.initialize();

    const team = await teamManager.getTeam(teamId);
    if (!team) {
      console.error(chalk.red('Team not found'));
      process.exit(1);
    }

    // Mock inviter ID (in real implementation, this would come from auth)
    const inviterId = randomUUID();
    const role = (options.role as any) || 'member';

    const invitation = await teamManager.inviteUser(
      teamId,
      inviterId,
      email,
      role
    );

    console.log(chalk.green('✓ Invitation sent successfully'));
    console.log(`Team: ${team.name}`);
    console.log(`Invited: ${email}`);
    console.log(`Role: ${role}`);
    console.log(`Invitation token: ${invitation.token}`);
    console.log(`Expires: ${invitation.expiresAt.toLocaleDateString()}`);
  } catch (error) {
    console.error(
      chalk.red('Error sending invitation:'),
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

/**
 * Accept team invitation
 */
async function acceptInvitation(token: string, options: { name?: string }) {
  try {
    await teamManager.initialize();

    // Mock user ID (in real implementation, this would come from auth)
    const userId = randomUUID();

    await teamManager.acceptInvitation(token, userId, options.name);

    console.log(chalk.green('✓ Invitation accepted successfully'));
    console.log('You are now a member of the team');
  } catch (error) {
    console.error(
      chalk.red('Error accepting invitation:'),
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

/**
 * Show team details
 */
async function showTeam(teamId: string) {
  try {
    await teamManager.initialize();

    const team = await teamManager.getTeam(teamId);
    if (!team) {
      console.error(chalk.red('Team not found'));
      process.exit(1);
    }

    console.log(chalk.blue('Team Details:'));
    console.log('');
    console.log(`Name: ${chalk.bold(team.name)}`);
    console.log(`ID: ${team.id}`);
    if (team.description) {
      console.log(`Description: ${team.description}`);
    }
    console.log(`Created: ${team.createdAt.toLocaleDateString()}`);
    console.log(`Updated: ${team.updatedAt.toLocaleDateString()}`);
    console.log('');

    console.log(chalk.blue('Members:'));
    team.members.forEach((member, index) => {
      const statusIcon = member.status === 'active' ? '✓' : '○';
      const roleColor =
        member.role === 'owner'
          ? chalk.red
          : member.role === 'admin'
            ? chalk.yellow
            : chalk.green;

      console.log(`${index + 1}. ${statusIcon} ${member.email || member.id}`);
      console.log(`   Role: ${roleColor(member.role)}`);
      if (member.name) {
        console.log(`   Name: ${member.name}`);
      }
      console.log(`   Joined: ${member.joinedAt.toLocaleDateString()}`);
      if (member.lastActive) {
        console.log(
          `   Last Active: ${member.lastActive.toLocaleDateString()}`
        );
      }
      console.log('');
    });

    console.log(chalk.blue('Settings:'));
    console.log(
      `Default Vault Permissions: ${team.settings.defaultVaultPermissions.join(', ')}`
    );
    console.log(
      `Require Invite Approval: ${team.settings.requireInviteApproval ? 'Yes' : 'No'}`
    );
    console.log(
      `Allow Guest Access: ${team.settings.allowGuestAccess ? 'Yes' : 'No'}`
    );
    console.log(`Audit Retention: ${team.settings.auditRetentionDays} days`);
    console.log(
      `Enforce Password Policy: ${team.settings.enforcePasswordPolicy ? 'Yes' : 'No'}`
    );
    console.log(`Require MFA: ${team.settings.requireMFA ? 'Yes' : 'No'}`);
  } catch (error) {
    console.error(
      chalk.red('Error showing team:'),
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

/**
 * Create shared vault
 */
async function createVault(
  teamId: string,
  name: string,
  options: { description?: string }
) {
  try {
    await teamManager.initialize();

    // Mock user ID (in real implementation, this would come from auth)
    const userId = randomUUID();

    const vault = await teamManager.createSharedVault(
      teamId,
      userId,
      name,
      options.description
    );

    console.log(chalk.green('✓ Shared vault created successfully'));
    console.log(`Vault ID: ${vault.id}`);
    console.log(`Name: ${vault.name}`);
    if (vault.description) {
      console.log(`Description: ${vault.description}`);
    }
    console.log(`Created: ${vault.createdAt.toLocaleDateString()}`);
  } catch (error) {
    console.error(
      chalk.red('Error creating vault:'),
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

/**
 * Show audit log
 */
async function showAuditLog(teamId: string, options: { limit?: number }) {
  try {
    await teamManager.initialize();

    // Mock user ID (in real implementation, this would come from auth)
    const userId = randomUUID();

    const auditEntries = await teamManager.getAuditLog(teamId, userId);
    const limit = options.limit || 50;
    const limitedEntries = auditEntries.slice(-limit);

    if (limitedEntries.length === 0) {
      console.log(chalk.yellow('No audit entries found'));
      return;
    }

    console.log(
      chalk.blue(`Audit Log (last ${limitedEntries.length} entries):`)
    );
    console.log('');

    limitedEntries.forEach((entry, index) => {
      const actionColor =
        entry.action === 'create'
          ? chalk.green
          : entry.action === 'delete'
            ? chalk.red
            : entry.action === 'update'
              ? chalk.yellow
              : chalk.blue;

      console.log(
        `${index + 1}. ${actionColor(entry.action.toUpperCase())} ${entry.resource}`
      );
      console.log(`   User: ${entry.userName || entry.userId}`);
      console.log(`   Resource ID: ${entry.resourceId}`);
      console.log(`   Time: ${entry.timestamp.toLocaleString()}`);
      if (entry.details && Object.keys(entry.details).length > 0) {
        console.log(`   Details: ${JSON.stringify(entry.details, null, 2)}`);
      }
      console.log('');
    });
  } catch (error) {
    console.error(
      chalk.red('Error showing audit log:'),
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

/**
 * Setup team commands
 */
export function setupTeamCommands(program: Command): void {
  const team = program
    .command('team')
    .description('Team collaboration commands');

  team
    .command('create')
    .description('Create a new team')
    .option('-n, --name <name>', 'Team name')
    .option('-d, --description <description>', 'Team description')
    .option('-i, --interactive', 'Interactive mode')
    .action(createTeam);

  team.command('list').description('List your teams').action(listTeams);

  team
    .command('show <teamId>')
    .description('Show team details')
    .action(showTeam);

  team
    .command('invite <teamId> <email>')
    .description('Invite user to team')
    .option('-r, --role <role>', 'User role (member, admin)', 'member')
    .action(inviteUser);

  team
    .command('accept <token>')
    .description('Accept team invitation')
    .option('-n, --name <name>', 'Your display name')
    .action(acceptInvitation);

  team
    .command('vault <teamId> <name>')
    .description('Create shared vault')
    .option('-d, --description <description>', 'Vault description')
    .action(createVault);

  team
    .command('audit <teamId>')
    .description('Show team audit log')
    .option('-l, --limit <limit>', 'Limit number of entries', '50')
    .action(showAuditLog);
}
