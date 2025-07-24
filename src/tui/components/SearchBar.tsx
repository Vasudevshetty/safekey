/**
 * SearchBar Component - Advanced search functionality for TUI
 */

import React, { useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { useSearchStore } from '../store/searchStore.js';
import { useTUIStore } from '../store/tuiStore.js';

interface SearchBarProps {
  onSelectResult?: (_key: string) => void;
}

export function SearchBar({ onSelectResult }: SearchBarProps) {
  const {
    isSearchMode,
    searchQuery,
    searchResults,
    selectedResultIndex,
    searchHistory,
    historyIndex,
    setSearchMode,
    setSearchQuery,
    performSearch,
    selectNextResult,
    selectPreviousResult,
    clearSearch,
    addToHistory,
    navigateHistory,
  } = useSearchStore();

  const { secrets } = useTUIStore();

  // Perform search when query changes
  useEffect(() => {
    if (isSearchMode && searchQuery) {
      performSearch(secrets);
    }
  }, [isSearchMode, searchQuery, secrets, performSearch]);

  useInput((input, key) => {
    if (!isSearchMode) return;

    // Handle special keys
    if (key.escape) {
      setSearchMode(false);
      return;
    }

    if (key.return) {
      if (searchResults.length > 0) {
        const selectedResult = searchResults[selectedResultIndex];
        if (selectedResult && onSelectResult) {
          onSelectResult(selectedResult.key);
        }
        addToHistory(searchQuery);
        setSearchMode(false);
      }
      return;
    }

    // Navigation
    if (key.downArrow || input === 'j') {
      selectNextResult();
      return;
    }

    if (key.upArrow || input === 'k') {
      selectPreviousResult();
      return;
    }

    // History navigation
    if (key.upArrow && key.ctrl) {
      navigateHistory('up');
      return;
    }

    if (key.downArrow && key.ctrl) {
      navigateHistory('down');
      return;
    }

    // Clear search
    if (key.ctrl && input === 'c') {
      clearSearch();
      setSearchMode(false);
      return;
    }

    // Backspace
    if (key.backspace || key.delete) {
      setSearchQuery(searchQuery.slice(0, -1));
      return;
    }

    // Regular character input
    if (input && !key.ctrl && !key.meta) {
      setSearchQuery(searchQuery + input);
    }
  });

  if (!isSearchMode) {
    return null;
  }

  return (
    <Box flexDirection="column" marginBottom={1}>
      {/* Search Input */}
      <Box borderStyle="single" borderColor="cyan" paddingX={1}>
        <Text color="cyan">🔍 Search: </Text>
        <Text>{searchQuery}</Text>
        <Text color="gray">█</Text>
      </Box>

      {/* Search Results */}
      {searchQuery && (
        <Box flexDirection="column" marginTop={1} paddingX={1}>
          {searchResults.length > 0 ? (
            <>
              <Box marginBottom={1}>
                <Text color="gray">
                  Found {searchResults.length} result
                  {searchResults.length === 1 ? '' : 's'}
                  {searchResults.length > 5 && ` (showing first 5)`}
                </Text>
              </Box>
              {searchResults.slice(0, 5).map((result, index) => (
                <Box key={result.key} marginBottom={index < 4 ? 1 : 0}>
                  <Text
                    color={index === selectedResultIndex ? 'cyan' : 'white'}
                    backgroundColor={
                      index === selectedResultIndex ? 'blue' : undefined
                    }
                  >
                    {index === selectedResultIndex ? '▶ ' : '  '}
                    <Text bold>{result.key}</Text>
                    {result.matchType !== 'key' && (
                      <Text color="gray"> ({result.matchType})</Text>
                    )}
                  </Text>
                </Box>
              ))}
            </>
          ) : (
            <Box>
              <Text color="gray">No results found</Text>
            </Box>
          )}
        </Box>
      )}

      {/* Search Help */}
      <Box marginTop={1} paddingX={1} borderStyle="single" borderColor="gray">
        <Text dimColor>
          ↑/↓ or j/k Navigate • Enter Select • Esc Cancel • Ctrl+C Clear
          {searchHistory.length > 0 && ` • Ctrl+↑/↓ History`}
        </Text>
      </Box>

      {/* History Hint */}
      {historyIndex >= 0 && searchHistory.length > 0 && (
        <Box paddingX={1}>
          <Text color="yellow">
            History ({historyIndex + 1}/{searchHistory.length})
          </Text>
        </Box>
      )}
    </Box>
  );
}
