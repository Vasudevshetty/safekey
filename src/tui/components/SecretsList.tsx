import React from 'react';
import { Box, Text } from 'ink';

export function SecretsList() {
  return (
    <Box flexDirection="column" padding={2}>
      <Box marginBottom={2}>
        <Text bold color="cyan">
          🔑 Secrets Management
        </Text>
      </Box>

      <Box>
        <Text>Secrets list coming soon...</Text>
      </Box>
    </Box>
  );
}
