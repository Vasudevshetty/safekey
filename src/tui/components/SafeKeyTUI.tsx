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
  const {
    currentView,
    setStatus,
    setError,
    setCurrentView,
    secrets,
    selectedSecretKey,
    vaultPath,
    setSelectedSecret,
    filteredSecrets,
  } = useTUIStore();

  useEffect(() => {
    setStatus(
      'Use ↑/↓/j/k to navigate, Enter to select, Tab to switch views, Ctrl+C to exit'
    );
  }, [setStatus]);

  const secretKeys = Object.keys(secrets);
  const currentIndex = selectedSecretKey
    ? secretKeys.indexOf(selectedSecretKey)
    : 0;

  const handleSecretSelect = (secretKey: string) => {
    setSelectedSecret(secretKey);
  };

  const handleNavigate = (direction: 'up' | 'down') => {
    const keys = filteredSecrets.length > 0 ? filteredSecrets : secretKeys;
    if (keys.length === 0) return;

    const currentIdx = selectedSecretKey ? keys.indexOf(selectedSecretKey) : 0;
    let newIndex = currentIdx;

    if (direction === 'up') {
      newIndex = currentIdx > 0 ? currentIdx - 1 : keys.length - 1;
    } else {
      newIndex = currentIdx < keys.length - 1 ? currentIdx + 1 : 0;
    }

    setSelectedSecret(keys[newIndex]);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'vault-selector':
        return <VaultSelector />;
      case 'dashboard':
        return <Dashboard />;
      case 'secrets':
        return (
          <SecretsList
            secrets={secretKeys}
            currentIndex={currentIndex}
            onSelect={handleSecretSelect}
            onNavigate={handleNavigate}
            vaultPath={vaultPath}
          />
        );
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
