/**
 * Cloud Sync CLI Commands
 * Provides command-line interface for cloud synchronization
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { SyncManager } from '../cloud/sync-manager.js';
import { CloudProviderRegistry } from '../cloud/base-provider.js';
import { GitHubGistProvider } from '../cloud/providers/github-gist.js';
import { SyncConflictError } from '../cloud/types.js';

// Register available providers
CloudProviderRegistry.register('github-gist', () => new GitHubGistProvider());

export function createCloudCommand(): Command {
  const command = new Command('cloud');
  command.description('🌥️  Manage cloud synchronization');

  // Setup command
  const setupCommand = new Command('setup')
    .description('Configure a cloud provider')
    .argument('<provider>', 'Cloud provider name (github-gist)')
    .option('--token <token>', 'Authentication token')
    .option('--vault <path>', 'Vault path to configure', 'default')
    .action(async (provider, options) => {
      try {
        const syncManager = new SyncManager();

        if (provider === 'github-gist') {
          if (!options.token) {
            console.error(chalk.red('❌ GitHub token is required'));
            console.log(
              chalk.gray(
                'Create a token at: https://github.com/settings/tokens'
              )
            );
            console.log(chalk.gray('Required scopes: gist'));
            process.exit(1);
          }

          await syncManager.enableSync(
            options.vault,
            'github-gist',
            { token: options.token },
            { autoSync: false }
          );

          console.log(
            chalk.green('✅ GitHub Gist provider configured successfully')
          );
          console.log(chalk.gray(`   Vault: ${options.vault}`));
          console.log(
            chalk.gray('   Use "safekey sync now" to sync your vault')
          );
        } else {
          console.error(chalk.red(`❌ Unknown provider: ${provider}`));
          console.log(chalk.gray('Available providers: github-gist'));
          process.exit(1);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(chalk.red(`❌ Setup failed: ${err.message}`));
        process.exit(1);
      }
    });

  // List providers command
  const listCommand = new Command('list')
    .description('List available cloud providers')
    .action(() => {
      console.log(chalk.blue.bold('🌥️  Available Cloud Providers:'));
      console.log();

      const providers = CloudProviderRegistry.listProviders();
      providers.forEach((providerName) => {
        const provider = CloudProviderRegistry.getProvider(providerName);
        console.log(chalk.cyan(`  • ${provider.displayName}`));
        console.log(chalk.gray(`    Name: ${provider.name}`));
        console.log(
          chalk.gray(
            `    Auth Required: ${provider.requiresAuth ? 'Yes' : 'No'}`
          )
        );
        console.log();
      });

      if (providers.length === 0) {
        console.log(chalk.gray('  No providers available'));
      }
    });

  command.addCommand(setupCommand);
  command.addCommand(listCommand);

  return command;
}

export function createSyncCommand(): Command {
  const command = new Command('sync');
  command.description('🔄 Synchronize vaults with cloud providers');

  // Sync now command
  const nowCommand = new Command('now')
    .description('Sync vault immediately')
    .option('--vault <path>', 'Vault path to sync', 'default')
    .action(async (options) => {
      try {
        const syncManager = new SyncManager();

        console.log(chalk.blue('🔄 Syncing vault...'));
        const result = await syncManager.syncVault(options.vault);

        if (result.success) {
          switch (result.action) {
            case 'upload':
              console.log(chalk.green('✅ Vault uploaded to cloud'));
              break;
            case 'download':
              console.log(chalk.green('✅ Vault downloaded from cloud'));
              break;
            case 'no-change':
              console.log(chalk.gray('✓ Vault already in sync'));
              break;
          }
        } else {
          console.error(chalk.red(`❌ Sync failed: ${result.error}`));
          process.exit(1);
        }
      } catch (error) {
        if (error instanceof SyncConflictError) {
          console.error(chalk.red('⚠️  Sync conflict detected!'));
          console.log(
            chalk.yellow('Use "safekey sync resolve" to resolve conflicts')
          );
          process.exit(1);
        }

        const err = error instanceof Error ? error : new Error(String(error));
        console.error(chalk.red(`❌ Sync failed: ${err.message}`));
        process.exit(1);
      }
    });

  // Status command
  const statusCommand = new Command('status')
    .description('Show sync status')
    .option('--vault <path>', 'Vault path to check', 'default')
    .action(async (options) => {
      try {
        const syncManager = new SyncManager();
        const status = await syncManager.getSyncStatus(options.vault);

        console.log(chalk.blue.bold('🔄 Sync Status'));
        console.log();
        console.log(`  Vault: ${chalk.cyan(options.vault)}`);
        console.log(`  Provider: ${chalk.cyan(status.provider)}`);
        console.log(
          `  Configured: ${status.isConfigured ? chalk.green('Yes') : chalk.red('No')}`
        );

        if (status.lastSync) {
          console.log(
            `  Last Sync: ${chalk.gray(status.lastSync.toLocaleString())}`
          );
        }

        const statusColor = {
          synced: 'green',
          pending: 'yellow',
          conflict: 'red',
          error: 'red',
          disconnected: 'gray',
        }[status.status] as 'green' | 'yellow' | 'red' | 'gray';

        console.log(
          `  Status: ${chalk[statusColor](status.status.toUpperCase())}`
        );

        if (status.error) {
          console.log(`  Error: ${chalk.red(status.error)}`);
        }

        if (status.conflictCount > 0) {
          console.log(`  Conflicts: ${chalk.red(status.conflictCount)}`);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(chalk.red(`❌ Failed to get status: ${err.message}`));
        process.exit(1);
      }
    });

  // Resolve conflicts command
  const resolveCommand = new Command('resolve')
    .description('Resolve sync conflicts')
    .option('--vault <path>', 'Vault path to resolve', 'default')
    .option(
      '--strategy <strategy>',
      'Resolution strategy (local, remote, merge)',
      'local'
    )
    .action(async (options) => {
      try {
        const syncManager = new SyncManager();

        console.log(
          chalk.yellow(
            `🔧 Resolving conflicts using "${options.strategy}" strategy...`
          )
        );
        const result = await syncManager.resolveConflicts(
          options.vault,
          options.strategy
        );

        if (result.success) {
          console.log(chalk.green('✅ Conflicts resolved successfully'));
          if (result.action === 'upload') {
            console.log(chalk.gray('   Local version was uploaded to cloud'));
          } else if (result.action === 'download') {
            console.log(
              chalk.gray('   Remote version was downloaded from cloud')
            );
          }
        } else {
          console.error(
            chalk.red(`❌ Failed to resolve conflicts: ${result.error}`)
          );
          process.exit(1);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(chalk.red(`❌ Resolution failed: ${err.message}`));
        process.exit(1);
      }
    });

  // Disable command
  const disableCommand = new Command('disable')
    .description('Disable sync for a vault')
    .option('--vault <path>', 'Vault path to disable sync', 'default')
    .action(async (options) => {
      try {
        const syncManager = new SyncManager();
        await syncManager.disableSync(options.vault);

        console.log(chalk.green('✅ Sync disabled for vault'));
        console.log(chalk.gray(`   Vault: ${options.vault}`));
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(chalk.red(`❌ Failed to disable sync: ${err.message}`));
        process.exit(1);
      }
    });

  command.addCommand(nowCommand);
  command.addCommand(statusCommand);
  command.addCommand(resolveCommand);
  command.addCommand(disableCommand);

  return command;
}
