import React from 'react';
import { Box, Text } from 'ink';
import { useTUIStore } from '../store/tuiStore.js';

export function StatusBar() {
  const { statusMessage, error, isLoading } = useTUIStore();

  return (
    <Box paddingX={1} borderStyle="single" borderColor="gray">
      {error ? (
        <Text color="red">❌ {error}</Text>
      ) : isLoading ? (
        <Text color="yellow">⏳ {statusMessage || 'Loading...'}</Text>
      ) : (
        <Text color="cyan">ℹ️ {statusMessage}</Text>
      )}
    </Box>
  );
}
