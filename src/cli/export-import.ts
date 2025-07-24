import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { promises as fs } from 'node:fs';
import { Vault } from '../core/vault.js';
import { Config } from '../config/config.js';
import { VaultNotFoundError, InvalidKeyError } from '../core/types.js';

export interface ExportOptions {
  vault?: string;
  profile?: string;
  format?: 'json' | 'env';
  output?: string;
}

export async function exportCommand(options: ExportOptions): Promise<void> {
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

    // Get export format if not specified
    let format = options.format;
    if (!format) {
      const { selectedFormat } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedFormat',
          message: 'Export format:',
          choices: [
            { name: 'JSON (.json)', value: 'json' },
            { name: 'Environment (.env)', value: 'env' },
          ],
        },
      ]);
      format = selectedFormat;
    }

    // Export data
    const exportedData = vault.exportSecrets(format);

    if (options.output) {
      // Write to file
      await fs.writeFile(options.output, exportedData, 'utf8');
      console.log(chalk.green(`✓ Secrets exported to ${options.output}`));
    } else {
      // Output to console
      console.log(chalk.blue('\n📄 Exported Secrets:\n'));
      console.log(exportedData);
    }

    const metadata = vault.getMetadata();
    console.log(
      chalk.gray(
        `\nExported ${metadata.keyCount} secrets in ${format!.toUpperCase()} format`
      )
    );
  } catch (error) {
    if (error instanceof VaultNotFoundError) {
      console.error(chalk.red('Vault not found. Run "safekey init" first.'));
    } else if (error instanceof InvalidKeyError) {
      console.error(chalk.red('Invalid password or corrupted vault.'));
    } else {
      console.error(
        chalk.red('Error exporting secrets:'),
        (error as Error).message
      );
    }
    process.exit(1);
  }
}

export interface ImportOptions {
  vault?: string;
  profile?: string;
  format?: 'json' | 'env';
  overwrite?: boolean;
}

export async function importCommand(
  filePath: string,
  options: ImportOptions
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

    // Read import file
    const importData = await fs.readFile(filePath, 'utf8');

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

    // Detect format if not specified
    let format = options.format;
    if (!format) {
      if (filePath.endsWith('.env')) {
        format = 'env';
      } else if (filePath.endsWith('.json')) {
        format = 'json';
      } else {
        const { selectedFormat } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedFormat',
            message: 'Import format:',
            choices: [
              { name: 'JSON', value: 'json' },
              { name: 'Environment', value: 'env' },
            ],
          },
        ]);
        format = selectedFormat;
      }
    }

    // Confirm overwrite if not specified
    let overwrite = options.overwrite;
    if (!overwrite) {
      const { shouldOverwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldOverwrite',
          message: 'Overwrite existing secrets?',
          default: false,
        },
      ]);
      overwrite = shouldOverwrite;
    }

    // Import secrets
    console.log(chalk.gray('Importing secrets...'));
    const importedCount = await vault.importSecrets(
      importData,
      format,
      overwrite
    );

    console.log(
      chalk.green(`✓ Successfully imported ${importedCount} secrets`)
    );

    const metadata = vault.getMetadata();
    console.log(chalk.gray(`Total secrets in vault: ${metadata.keyCount}`));
  } catch (error) {
    if (error instanceof VaultNotFoundError) {
      console.error(chalk.red('Vault not found. Run "safekey init" first.'));
    } else if (error instanceof InvalidKeyError) {
      console.error(chalk.red('Invalid password or corrupted vault.'));
    } else {
      console.error(
        chalk.red('Error importing secrets:'),
        (error as Error).message
      );
    }
    process.exit(1);
  }
}

export function createExportCommand(): Command {
  return new Command('export')
    .description('Export secrets from the vault')
    .option('-v, --vault <path>', 'Vault file path')
    .option('-p, --profile <name>', 'Profile name')
    .option('-f, --format <type>', 'Export format (json, env)', 'json')
    .option('-o, --output <file>', 'Output file path')
    .action(exportCommand);
}

export function createImportCommand(): Command {
  return new Command('import')
    .description('Import secrets into the vault')
    .argument('<file>', 'File to import from')
    .option('-v, --vault <path>', 'Vault file path')
    .option('-p, --profile <name>', 'Profile name')
    .option('-f, --format <type>', 'Import format (json, env)')
    .option('--overwrite', 'Overwrite existing secrets')
    .action(importCommand);
}
