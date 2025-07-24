import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import { useTUIStore } from '../store/tuiStore.js';
import { VaultSelector } from './VaultSelector.js';
import { Dashboard } from './Dashboard.js';
import { SecretsList } from './SecretsList.js';
import { Settings } from './Settings.js';
import { TeamManagement } from './TeamManagement.js';
import { StatusBar } from './StatusBar.js';
import { COMPACT_BANNER } from '../../utils/banner.js';

export function SafeKeyTUI() {
  const { currentView, setStatus, setError, setCurrentView } = useTUIStore();

  useEffect(() => {
    setStatus(
      'Use ↑/↓/j/k to navigate, Enter to select, Tab to switch views, Ctrl+C to exit'
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
      case 'teams':
        return (
          <TeamManagement
            onBack={() => setCurrentView('dashboard')}
            onError={(error) => setError(error)}
          />
        );
      default:
        return <VaultSelector />;
    }
  };

  return (
    <Box flexDirection="column" height={process.stdout.rows}>
      {/* Compact Banner Header */}
      <Box marginBottom={1}>
        <Text color="cyan">{COMPACT_BANNER}</Text>
      </Box>

      {/* Main Content */}
      <Box flexGrow={1}>{renderCurrentView()}</Box>

      {/* Status Bar */}
      <StatusBar />
    </Box>
  );
}
