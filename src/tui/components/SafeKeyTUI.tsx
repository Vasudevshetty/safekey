import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import { useTUIStore } from '../store/tuiStore.js';
import { VaultSelector } from './VaultSelector.js';
import { Dashboard } from './Dashboard.js';
import { SecretsList } from './SecretsList.js';
import { Settings } from './Settings.js';
import { StatusBar } from './StatusBar.js';

export function SafeKeyTUI() {
  const { currentView, setStatus } = useTUIStore();

  useEffect(() => {
    setStatus(
      'SafeKey TUI started - Use ↑/↓ to navigate, Enter to select, Ctrl+C to exit'
    );
  }, [setStatus]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'vault-selector':
        return <VaultSelector />;
      case 'dashboard':
        return <Dashboard />;
      case 'secrets':
        return <SecretsList />;
      case 'settings':
        return <Settings />;
      default:
        return <VaultSelector />;
    }
  };

  return (
    <Box flexDirection="column" height={process.stdout.rows}>
      {/* Header */}
      <Box borderStyle="round" paddingX={1} marginBottom={1}>
        <Text bold color="cyan">
          🔐 SafeKey TUI - Secure Secret Management
        </Text>
      </Box>

      {/* Main Content */}
      <Box flexGrow={1}>{renderCurrentView()}</Box>

      {/* Status Bar */}
      <StatusBar />
    </Box>
  );
}
