import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTUIStore } from '../store/tuiStore.js';

export function SecretsList() {
  const {
    secrets,
    filteredSecrets,
    setSelectedSecret,
    searchQuery,
    setSearchQuery,
    setCurrentView,
  } = useTUIStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const secretKeys =
    filteredSecrets.length > 0 ? filteredSecrets : Object.keys(secrets);

  useEffect(() => {
    if (secretKeys.length > 0 && selectedIndex >= secretKeys.length) {
      setSelectedIndex(0);
    }
  }, [secretKeys.length, selectedIndex]);

  useInput((input, key) => {
    if (isSearching) {
      if (key.return) {
        setIsSearching(false);
      } else if (key.backspace) {
        setSearchQuery(searchQuery.slice(0, -1));
      } else if (input && input.length === 1) {
        setSearchQuery(searchQuery + input);
      }
      return;
    }

    // Navigation
    if ((key.upArrow || input === 'k') && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }

    if (
      (key.downArrow || input === 'j') &&
      selectedIndex < secretKeys.length - 1
    ) {
      setSelectedIndex(selectedIndex + 1);
    }

    // Actions
    if (key.return && secretKeys[selectedIndex]) {
      setSelectedSecret(secretKeys[selectedIndex]);
    }

    if (input === '/') {
      setIsSearching(true);
    }

    if (key.escape || input === 'q') {
      setCurrentView('dashboard');
    }
  });

  if (secretKeys.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text bold color="yellow">
            🔑 Secrets
          </Text>
        </Box>
        <Box>
          <Text dimColor>
            No secrets found. Add some using the CLI or dashboard.
          </Text>
        </Box>
        <Box marginTop={1} paddingX={1} borderStyle="single" borderColor="gray">
          <Text dimColor>q/Esc Back to Dashboard</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="yellow">
          🔑 Secrets {searchQuery && `(filtered: "${searchQuery}")`}
        </Text>
      </Box>

      {isSearching && (
        <Box
          marginBottom={1}
          paddingX={1}
          borderStyle="single"
          borderColor="cyan"
        >
          <Text>Search: {searchQuery}_</Text>
        </Box>
      )}

      <Box flexDirection="column">
        {secretKeys.slice(0, 10).map((key, index) => {
          const secret = secrets[key];
          return (
            <Box key={key}>
              <Text color={index === selectedIndex ? 'cyan' : 'white'}>
                {index === selectedIndex ? '▶ ' : '  '}
                <Text bold={index === selectedIndex}>{key}</Text>
                <Text dimColor>
                  {' '}
                  • {secret?.description || 'No description'}
                </Text>
              </Text>
            </Box>
          );
        })}
        {secretKeys.length > 10 && (
          <Box>
            <Text dimColor>... and {secretKeys.length - 10} more</Text>
          </Box>
        )}
      </Box>

      <Box marginTop={1} paddingX={1} borderStyle="single" borderColor="gray">
        <Text dimColor>
          ↑/↓ or j/k Navigate • Enter Select • / Search • q/Esc Back
        </Text>
      </Box>
    </Box>
  );
}
