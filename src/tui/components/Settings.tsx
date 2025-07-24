import React from 'react';
import { Box, Text } from 'ink';

export function Settings() {
  return (
    <Box flexDirection="column" padding={2}>
      <Box marginBottom={2}>
        <Text bold color="cyan">
          ⚙️ Settings
        </Text>
      </Box>

      <Box>
        <Text>Settings panel coming soon...</Text>
      </Box>
    </Box>
  );
}
