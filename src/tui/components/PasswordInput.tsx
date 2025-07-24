import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface PasswordInputProps {
  onSubmit: (password: string) => void;
  onCancel: () => void;
  prompt?: string;
}

export function PasswordInput({
  onSubmit,
  onCancel,
  prompt = 'Enter password:',
}: PasswordInputProps) {
  const [password, setPassword] = useState('');
  const [showMask, setShowMask] = useState(true);

  useInput((input, key) => {
    if (key.return) {
      onSubmit(password);
    } else if (key.escape) {
      onCancel();
    } else if (key.backspace) {
      setPassword((prev) => prev.slice(0, -1));
    } else if (key.ctrl && input === 'c') {
      onCancel();
    } else if (input && !key.ctrl && !key.meta) {
      setPassword((prev) => prev + input);
    }
  });

  return (
    <Box
      flexDirection="column"
      padding={2}
      borderStyle="round"
      borderColor="cyan"
    >
      <Box marginBottom={1}>
        <Text bold color="cyan">
          🔒 Vault Authentication
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text>{prompt}</Text>
      </Box>

      <Box>
        <Text>Password: </Text>
        <Text color="yellow">
          {showMask ? '●'.repeat(password.length) : password}
        </Text>
      </Box>

      <Box marginTop={2}>
        <Text dimColor>Enter: Submit • Esc: Cancel • Ctrl+C: Exit</Text>
      </Box>
    </Box>
  );
}
