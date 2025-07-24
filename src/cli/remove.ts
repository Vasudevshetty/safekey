import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { Vault } from '../core/vault.js';
import { Config } from '../config/config.js';
import {
  VaultNotFoundError,
  InvalidKeyError,
  SecretNotFoundError,
} from '../core/types.js';

export interface RemoveOptions {
  vault?: string;
  profile?: string;
  force?: boolean;
}

export async function removeCommand(
  key: string,
  options: RemoveOptions
): Promise<void> {
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

    // Check if secret exists
    try {
      const secret = vault.getSecret(key);
      console.log(chalk.blue(`Found secret: ${secret.key}`));
      if (secret.description) {
        console.log(chalk.gray(`Description: ${secret.description}`));
      }
    } catch (error) {
      if (error instanceof SecretNotFoundError) {
        console.error(chalk.red(`Secret '${key}' not found.`));
        process.exit(1);
      }
      throw error;
    }

    // Confirm deletion
    if (!options.force) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: chalk.red(`Are you sure you want to delete '${key}'?`),
          default: false,
        },
      ]);

      if (!confirm) {
        console.log(chalk.gray('Operation cancelled.'));
        return;
      }
    }

    // Remove secret
    await vault.removeSecret(key);
    console.log(chalk.green(`✓ Secret '${key}' removed successfully`));

    const metadata = vault.getMetadata();
    console.log(chalk.gray(`Total secrets: ${metadata.keyCount}`));
  } catch (error) {
    if (error instanceof VaultNotFoundError) {
      console.error(chalk.red('Vault not found. Run "safekey init" first.'));
    } else if (error instanceof InvalidKeyError) {
      console.error(chalk.red('Invalid password or corrupted vault.'));
    } else {
      console.error(
        chalk.red('Error removing secret:'),
        (error as Error).message
      );
    }
    process.exit(1);
  }
}

export function createRemoveCommand(): Command {
  return new Command('remove')
    .alias('rm')
    .description('Remove a secret from the vault')
    .argument('<key>', 'Secret key name')
    .option('-v, --vault <path>', 'Vault file path')
    .option('-p, --profile <name>', 'Profile name')
    .option('-f, --force', 'Remove without confirmation')
    .action(removeCommand);
}
