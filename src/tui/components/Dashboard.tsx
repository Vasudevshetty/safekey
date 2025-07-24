import React from 'react';
import { Box, Text } from 'ink';
import { useTUIStore } from '../store/tuiStore.js';

export function Dashboard() {
  const { vault, secrets, vaultPath } = useTUIStore();

  if (!vault) {
    return (
      <Box justifyContent="center" alignItems="center">
        <Text>No vault loaded</Text>
      </Box>
    );
  }

  const secretCount = Object.keys(secrets).length;

  return (
    <Box flexDirection="column" padding={2}>
      <Box marginBottom={2}>
        <Text bold color="cyan">
          📊 Vault Dashboard
        </Text>
      </Box>

      <Box flexDirection="column" gap={1}>
        <Box>
          <Text bold>Vault: </Text>
          <Text>{vaultPath}</Text>
        </Box>

        <Box>
          <Text bold>Secrets: </Text>
          <Text color="green">{secretCount} stored</Text>
        </Box>

        <Box marginTop={2} paddingX={1} borderStyle="round">
          <Text dimColor>
            Press 's' for secrets view • 'c' for settings • 'v' to switch vault
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
