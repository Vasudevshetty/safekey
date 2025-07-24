import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { Vault } from '../core/vault.js';
import { Config } from '../config/config.js';
import {
  VaultNotFoundError,
  InvalidKeyError,
  SecretAlreadyExistsError,
} from '../core/types.js';

export interface AddOptions {
  vault?: string;
  profile?: string;
  description?: string;
  force?: boolean;
}

export async function addCommand(
  key: string,
  options: AddOptions
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

    // Check if secret already exists
    try {
      vault.getSecret(key);
      if (!options.force) {
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: chalk.yellow(`Secret '${key}' already exists. Overwrite?`),
            default: false,
          },
        ]);

        if (!overwrite) {
          console.log(chalk.gray('Operation cancelled.'));
          return;
        }
      }
    } catch (error) {
      // Secret doesn't exist, which is what we want
    }

    // Get secret value
    const { value } = await inquirer.prompt([
      {
        type: 'password',
        name: 'value',
        message: `Enter value for '${key}':`,
        mask: '*',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Value cannot be empty';
          }
          return true;
        },
      },
    ]);

    // Get description if not provided
    let description = options.description;
    if (!description) {
      const { desc } = await inquirer.prompt([
        {
          type: 'input',
          name: 'desc',
          message: 'Description (optional):',
        },
      ]);
      description = desc || undefined;
    }

    // Add or update secret
    try {
      await vault.addSecret(key, value, description);
      console.log(chalk.green(`✓ Secret '${key}' added successfully`));
    } catch (error) {
      if (error instanceof SecretAlreadyExistsError) {
        await vault.updateSecret(key, value, description);
        console.log(chalk.green(`✓ Secret '${key}' updated successfully`));
      } else {
        throw error;
      }
    }

    const metadata = vault.getMetadata();
    console.log(chalk.gray(`Total secrets: ${metadata.keyCount}`));
  } catch (error) {
    if (error instanceof VaultNotFoundError) {
      console.error(chalk.red('Vault not found. Run "safekey init" first.'));
    } else if (error instanceof InvalidKeyError) {
      console.error(chalk.red('Invalid password or corrupted vault.'));
    } else {
      console.error(
        chalk.red('Error adding secret:'),
        (error as Error).message
      );
    }
    process.exit(1);
  }
}

export function createAddCommand(): Command {
  return new Command('add')
    .description('Add a new secret to the vault')
    .argument('<key>', 'Secret key name')
    .option('-v, --vault <path>', 'Vault file path')
    .option('-p, --profile <name>', 'Profile name')
    .option('-d, --description <desc>', 'Secret description')
    .option('-f, --force', 'Overwrite existing secret without confirmation')
    .action(addCommand);
}
