#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createInitCommand } from './cli/init.js';
import { createAddCommand } from './cli/add.js';
import { createGetCommand } from './cli/get.js';
import { createListCommand } from './cli/list.js';
import { createRemoveCommand } from './cli/remove.js';
import {
  createExportCommand,
  createImportCommand,
} from './cli/export-import.js';
import { createCloudCommand, createSyncCommand } from './cli/cloud.js';
import { setupTeamCommands } from './cli/team-commands.js';
import { startTUI } from './tui/index.js';
import { displayBanner } from './utils/banner.js';

const program = new Command();

// Show banner only for main CLI (not for subcommands or TUI)
const shouldShowBanner =
  !process.argv.includes('tui') && process.argv.length <= 3;

if (shouldShowBanner) {
  displayBanner(true);
}

program
  .name('safekey')
  .description('🛡️ SafeKey: Secure Secrets Manager CLI')
  .version('1.2.0');

// Add commands
program.addCommand(createInitCommand());
program.addCommand(createAddCommand());
program.addCommand(createGetCommand());
program.addCommand(createListCommand());
program.addCommand(createRemoveCommand());
program.addCommand(createExportCommand());
program.addCommand(createImportCommand());
program.addCommand(createCloudCommand());
program.addCommand(createSyncCommand());

// Setup team commands
setupTeamCommands(program);

// TUI Command
program
  .command('tui')
  .description('🎨 Start the Terminal User Interface (TUI)')
  .action(() => {
    console.clear();
    startTUI();
  });

// Global error handler
process.on('uncaughtException', (error) => {
  console.error(chalk.red('\nUnexpected error:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('\nUnhandled promise rejection:'), reason);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.gray('\n\nGoodbye! 👋'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.gray('\n\nGoodbye! 👋'));
  process.exit(0);
});

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
