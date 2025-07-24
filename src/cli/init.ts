import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { Vault } from '../core/vault.js';
import { Config } from '../config/config.js';
import { VaultNotFoundError, InvalidKeyError } from '../core/types.js';

export interface InitOptions {
  vault?: string;
  profile?: string;
}

export async function initCommand(options: InitOptions): Promise<void> {
  try {
    const config = new Config();

    console.log(chalk.blue.bold('🛡️  SafeKey Vault Initialization\n'));

    // Get vault path
    let vaultPath: string;
    if (options.vault) {
      vaultPath = options.vault;
    } else {
      const { path } = await inquirer.prompt([
        {
          type: 'input',
          name: 'path',
          message: 'Vault file path:',
          default: config.get('defaultVaultPath'),
        },
      ]);
      vaultPath = path;
    }

    // Check if vault already exists
    const vault = new Vault(vaultPath);
    if (await vault.exists()) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: chalk.yellow('Vault already exists. Overwrite?'),
          default: false,
        },
      ]);

      if (!overwrite) {
        console.log(chalk.gray('Operation cancelled.'));
        return;
      }
    }

    // Get master password
    const { masterPassword } = await inquirer.prompt([
      {
        type: 'password',
        name: 'masterPassword',
        message: 'Enter master password:',
        mask: '*',
        validate: (input: string) => {
          if (input.length < 8) {
            return 'Password must be at least 8 characters long';
          }
          return true;
        },
      },
    ]);

    const { confirmPassword } = await inquirer.prompt([
      {
        type: 'password',
        name: 'confirmPassword',
        message: 'Confirm master password:',
        mask: '*',
        validate: (input: string) => {
          if (input !== masterPassword) {
            return 'Passwords do not match';
          }
          return true;
        },
      },
    ]);

    // Initialize vault
    console.log(chalk.gray('Creating vault...'));
    await vault.initialize(masterPassword);

    // Create or update profile
    if (options.profile) {
      try {
        config.createProfile(
          options.profile,
          vaultPath,
          'Custom vault profile'
        );
        config.setCurrentProfile(options.profile);
        console.log(chalk.green(`✓ Created profile '${options.profile}'`));
      } catch (error) {
        console.log(
          chalk.yellow(
            `Profile '${options.profile}' already exists, updating vault path.`
          )
        );
        const profiles = config.get('profiles');
        profiles[options.profile].vaultPath = vaultPath;
        config.set('profiles', profiles);
      }
    } else {
      // Update default profile
      const profiles = config.get('profiles');
      profiles.default.vaultPath = vaultPath;
      config.set('profiles', profiles);
    }

    console.log(chalk.green.bold('✓ Vault initialized successfully!'));
    console.log(chalk.gray(`   Location: ${vaultPath}`));

    const metadata = vault.getMetadata();
    console.log(chalk.gray(`   Version: ${metadata.version}`));
    console.log(
      chalk.gray(`   Created: ${metadata.createdAt.toLocaleString()}`)
    );
  } catch (error) {
    console.error(
      chalk.red('Error initializing vault:'),
      (error as Error).message
    );
    process.exit(1);
  }
}

export function createInitCommand(): Command {
  return new Command('init')
    .description('Initialize a new SafeKey vault')
    .option('-v, --vault <path>', 'Vault file path')
    .option('-p, --profile <name>', 'Profile name')
    .action(initCommand);
}
