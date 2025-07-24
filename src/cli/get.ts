import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import clipboardy from 'clipboardy';
import { Vault } from '../core/vault.js';
import { Config } from '../config/config.js';
import {
  VaultNotFoundError,
  InvalidKeyError,
  SecretNotFoundError,
} from '../core/types.js';

export interface GetOptions {
  vault?: string;
  profile?: string;
  copy?: boolean;
  show?: boolean;
}

export async function getCommand(
  key: string,
  options: GetOptions
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

    // Get secret
    const secret = vault.getSecret(key);

    // Display secret information
    console.log(chalk.blue.bold(`\n🔑 Secret: ${secret.key}`));

    if (secret.description) {
      console.log(chalk.gray(`Description: ${secret.description}`));
    }

    console.log(chalk.gray(`Created: ${secret.createdAt.toLocaleString()}`));
    console.log(chalk.gray(`Updated: ${secret.updatedAt.toLocaleString()}`));
    console.log(chalk.gray(`Version: ${secret.version}`));

    // Handle value display/copy
    if (options.copy) {
      try {
        await clipboardy.write(secret.value);
        console.log(chalk.green('✓ Secret copied to clipboard'));

        // Auto-clear clipboard after configured time
        const securityConfig = config.get('security');
        if (securityConfig.clearClipboardSeconds > 0) {
          setTimeout(() => {
            clipboardy.write('').catch(() => {
              // Ignore clipboard clear errors
            });
          }, securityConfig.clearClipboardSeconds * 1000);

          console.log(
            chalk.gray(
              `Clipboard will be cleared in ${securityConfig.clearClipboardSeconds} seconds`
            )
          );
        }
      } catch (error) {
        console.error(
          chalk.yellow('Failed to copy to clipboard:'),
          (error as Error).message
        );
        console.log(chalk.cyan(`Value: ${secret.value}`));
      }
    } else if (options.show) {
      console.log(chalk.cyan(`Value: ${secret.value}`));
    } else {
      // Ask what to do with the secret
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: '📋 Copy to clipboard', value: 'copy' },
            { name: '👁️  Show value', value: 'show' },
            { name: '❌ Cancel', value: 'cancel' },
          ],
        },
      ]);

      switch (action) {
        case 'copy':
          try {
            await clipboardy.write(secret.value);
            console.log(chalk.green('✓ Secret copied to clipboard'));

            const securityConfig = config.get('security');
            if (securityConfig.clearClipboardSeconds > 0) {
              setTimeout(() => {
                clipboardy.write('').catch(() => {
                  // Ignore errors
                });
              }, securityConfig.clearClipboardSeconds * 1000);

              console.log(
                chalk.gray(
                  `Clipboard will be cleared in ${securityConfig.clearClipboardSeconds} seconds`
                )
              );
            }
          } catch (error) {
            console.error(chalk.yellow('Failed to copy to clipboard'));
          }
          break;
        case 'show':
          console.log(chalk.cyan(`Value: ${secret.value}`));
          break;
        case 'cancel':
          console.log(chalk.gray('Operation cancelled.'));
          break;
      }
    }
  } catch (error) {
    if (error instanceof VaultNotFoundError) {
      console.error(chalk.red('Vault not found. Run "safekey init" first.'));
    } else if (error instanceof InvalidKeyError) {
      console.error(chalk.red('Invalid password or corrupted vault.'));
    } else if (error instanceof SecretNotFoundError) {
      console.error(chalk.red(`Secret '${key}' not found.`));
    } else {
      console.error(
        chalk.red('Error retrieving secret:'),
        (error as Error).message
      );
    }
    process.exit(1);
  }
}

export function createGetCommand(): Command {
  return new Command('get')
    .description('Retrieve a secret from the vault')
    .argument('<key>', 'Secret key name')
    .option('-v, --vault <path>', 'Vault file path')
    .option('-p, --profile <name>', 'Profile name')
    .option('-c, --copy', 'Copy secret to clipboard')
    .option('-s, --show', 'Show secret value in terminal')
    .action(getCommand);
}
