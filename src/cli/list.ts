import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { Vault } from '../core/vault.js';
import { Config } from '../config/config.js';
import { VaultNotFoundError, InvalidKeyError } from '../core/types.js';

export interface ListOptions {
  vault?: string;
  profile?: string;
  verbose?: boolean;
  format?: 'table' | 'json';
}

export async function listCommand(options: ListOptions): Promise<void> {
  try {
    const config = new Config();
    let vaultPath: string;

    if (options.vault) {
      vaultPath = options.vault;
    } else if (options.profile) {
      const profile = config.getProfile(options.profile);
      if (!profile) {
        console.error(chalk.red(`Profile '${options.profile}' not found`));
        process.exit(1);
      }
      vaultPath = profile.vaultPath;
    } else {
      const currentProfile = config.getCurrentProfile();
      vaultPath = currentProfile.vaultPath;
    }

    const vault = new Vault(vaultPath);

    // Check if vault exists
    if (!(await vault.exists())) {
      console.error(chalk.red('Vault not found. Run "safekey init" first.'));
      process.exit(1);
    }

    // Get master password
    const { masterPassword } = await inquirer.prompt([
      {
        type: 'password',
        name: 'masterPassword',
        message: 'Enter master password:',
        mask: '*',
      },
    ]);

    // Load vault
    console.log(chalk.gray('Loading vault...'));
    await vault.load(masterPassword);

    const metadata = vault.getMetadata();
    const secrets = vault.getAllSecrets();

    if (secrets.length === 0) {
      console.log(chalk.yellow('No secrets found in vault.'));
      console.log(
        chalk.gray('Use "safekey add <key>" to add your first secret.')
      );
      return;
    }

    // Display vault info
    console.log(chalk.blue.bold('\n🛡️  SafeKey Vault'));
    console.log(chalk.gray(`Path: ${vaultPath}`));
    console.log(chalk.gray(`Total secrets: ${metadata.keyCount}`));
    console.log(
      chalk.gray(`Last updated: ${metadata.updatedAt.toLocaleString()}\n`)
    );

    // Format output
    if (options.format === 'json') {
      console.log(JSON.stringify(secrets, null, 2));
      return;
    }

    // Table format (default)
    if (options.verbose) {
      console.log(
        chalk.cyan('Key'.padEnd(20)) +
          chalk.cyan('Description'.padEnd(30)) +
          chalk.cyan('Created'.padEnd(20)) +
          chalk.cyan('Updated'.padEnd(20)) +
          chalk.cyan('Version')
      );
      console.log('─'.repeat(90));

      secrets.forEach((secret) => {
        const key = secret.key.padEnd(20);
        const desc = (secret.description || '').substring(0, 28).padEnd(30);
        const created = secret.createdAt.toLocaleDateString().padEnd(20);
        const updated = secret.updatedAt.toLocaleDateString().padEnd(20);
        const version = `v${secret.version}`;

        console.log(
          chalk.white(key) +
            chalk.gray(desc) +
            chalk.gray(created) +
            chalk.gray(updated) +
            chalk.gray(version)
        );
      });
    } else {
      // Simple list
      console.log(chalk.cyan('Secrets:'));
      secrets.forEach((secret) => {
        const desc = secret.description
          ? chalk.gray(` - ${secret.description}`)
          : '';
        console.log(`  ${chalk.white(secret.key)}${desc}`);
      });
    }

    console.log(chalk.gray(`\nTotal: ${secrets.length} secrets`));
  } catch (error) {
    if (error instanceof VaultNotFoundError) {
      console.error(chalk.red('Vault not found. Run "safekey init" first.'));
    } else if (error instanceof InvalidKeyError) {
      console.error(chalk.red('Invalid password or corrupted vault.'));
    } else {
      console.error(
        chalk.red('Error listing secrets:'),
        (error as Error).message
      );
    }
    process.exit(1);
  }
}

export function createListCommand(): Command {
  return new Command('list')
    .description('List all secrets in the vault')
    .option('-v, --vault <path>', 'Vault file path')
    .option('-p, --profile <name>', 'Profile name')
    .option('--verbose', 'Show detailed information')
    .option('-f, --format <type>', 'Output format (table, json)', 'table')
    .action(listCommand);
}
