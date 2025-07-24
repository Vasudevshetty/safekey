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

const program = new Command();

// CLI Header
console.log(chalk.blue.bold('🛡️  SafeKey: Secure Secrets Manager'));
console.log(
  chalk.gray('Offline-first, developer-friendly secrets management\n')
);

program
  .name('safekey')
  .description('🛡️ SafeKey: Secure Secrets Manager CLI')
  .version('1.0.0');

// Add commands
program.addCommand(createInitCommand());
program.addCommand(createAddCommand());
program.addCommand(createGetCommand());
program.addCommand(createListCommand());
program.addCommand(createRemoveCommand());
program.addCommand(createExportCommand());
program.addCommand(createImportCommand());

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
