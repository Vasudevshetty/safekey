import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useTUIStore } from '../store/tuiStore.js';

export function Dashboard() {
  const { vault, secrets, vaultPath, setCurrentView } = useTUIStore();

  useInput((input) => {
    if (input === 's') {
      setCurrentView('secrets');
    } else if (input === 'c') {
      setCurrentView('settings');
    } else if (input === 'v') {
      setCurrentView('vault-selector');
    }
  });

  if (!vault) {
    return (
      <Box justifyContent="center" alignItems="center">
        <Text>No vault loaded</Text>
      </Box>
    );
  }

  const secretCount = Object.keys(secrets).length;

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="yellow">
          📊 Dashboard
        </Text>
      </Box>

      <Box flexDirection="column">
        <Box>
          <Text bold>Vault: </Text>
          <Text>{vaultPath}</Text>
        </Box>

        <Box>
          <Text bold>Secrets: </Text>
          <Text color={secretCount > 0 ? 'green' : 'gray'}>
            {secretCount} stored
          </Text>
        </Box>

        {secretCount > 0 && (
          <Box marginTop={1}>
            <Text bold>Quick Actions:</Text>
          </Box>
        )}
      </Box>

      <Box marginTop={1} paddingX={1} borderStyle="single" borderColor="gray">
        <Text dimColor>
          s Secrets • c Settings • v Switch Vault • j/k or ↑/↓ Navigate
        </Text>
      </Box>
    </Box>
  );
}
