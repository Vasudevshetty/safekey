/**
 * SecretsList Component - Advanced secrets management interface
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { useSearchStore } from '../store/searchStore.js';
import { useBulkStore } from '../store/bulkStore.js';
import { SearchBar } from './SearchBar.js';
import { BulkOperations } from './BulkOperations.js';
import { CloudStatus } from './CloudStatus.js';
import { SyncManager } from '../../cloud/sync-manager.js';

interface SecretsListProps {
  secrets: string[];
  currentIndex: number;
  onSelect: (secretKey: string) => void;
  onNavigate: (direction: 'up' | 'down') => void;
  vaultPath: string;
  syncManager?: SyncManager;
}

export function SecretsList({
  secrets,
  currentIndex,
  onSelect,
  onNavigate,
  vaultPath,
  syncManager,
}: SecretsListProps) {
  const [mode, setMode] = useState<'normal' | 'search' | 'cloud'>('normal');
  const [filteredSecrets, setFilteredSecrets] = useState<string[]>(secrets);
  const [_currentFilteredIndex, setCurrentFilteredIndex] = useState(0);

  const {
    isSearchMode,
    searchQuery,
    searchResults,
    selectedResultIndex: searchSelectedIndex,
    clearSearch,
  } = useSearchStore();

  const { isSelectionMode, selectedSecrets, isVisualMode } = useBulkStore();

  // Update filtered secrets based on search
  useEffect(() => {
    if (isSearchMode && searchResults.length > 0) {
      const filteredKeys = searchResults.map((result) => result.key);
      setFilteredSecrets(filteredKeys);
      setCurrentFilteredIndex(searchSelectedIndex);
    } else {
      setFilteredSecrets(secrets);
      // Map current index to filtered index
      const currentSecret = secrets[currentIndex];
      const filteredIndex = filteredSecrets.findIndex(
        (key) => key === currentSecret
      );
      setCurrentFilteredIndex(filteredIndex >= 0 ? filteredIndex : 0);
    }
  }, [
    isSearchMode,
    searchResults,
    searchSelectedIndex,
    secrets,
    currentIndex,
    filteredSecrets,
  ]);

  useInput((input, key) => {
    // Handle search mode
    if (mode === 'search') {
      if (key.escape) {
        setMode('normal');
        clearSearch();
        return;
      }
      // Let SearchBar handle other inputs
      return;
    }

    // Handle cloud status mode
    if (mode === 'cloud') {
      if (key.escape) {
        setMode('normal');
        return;
      }
      // Let CloudStatus handle other inputs
      return;
    }

    // Handle normal mode shortcuts
    if (input === '/' && !isSelectionMode) {
      setMode('search');
      return;
    }

    if (input === 'c' && !isSelectionMode) {
      setMode('cloud');
      return;
    }

    if (input === '?' && !isSelectionMode) {
      // Show help (could be implemented later)
      return;
    }

    // Handle navigation
    if (key.upArrow || input === 'k') {
      if (isSearchMode) {
        // Let search handle navigation
        return;
      }
      onNavigate('up');
      return;
    }

    if (key.downArrow || input === 'j') {
      if (isSearchMode) {
        // Let search handle navigation
        return;
      }
      onNavigate('down');
      return;
    }

    // Handle selection
    if (key.return && !isSelectionMode) {
      const secretToSelect =
        isSearchMode && searchResults.length > 0
          ? searchResults[searchSelectedIndex]?.key
          : secrets[currentIndex];

      if (secretToSelect) {
        onSelect(secretToSelect);
      }
      return;
    }
  });

  const handleSearchComplete = () => {
    setMode('normal');
  };

  const handleBulkComplete = () => {
    // Refresh the list or handle completion
    console.log('Bulk operation completed');
  };

  const handleCloudSync = () => {
    // Refresh after sync
    console.log('Cloud sync completed');
  };

  const renderSecretItem = (
    secretKey: string,
    index: number,
    isCurrentItem: boolean
  ) => {
    const isSelected = selectedSecrets.has(secretKey);
    const isInVisualSelection = isVisualMode && isSelected;

    // Check if this item matches search
    const searchResult = searchResults.find(
      (result) => result.key === secretKey
    );
    const hasSearchMatch = isSearchMode && searchResult;

    let displayText = secretKey;
    let color = 'white';
    let backgroundColor: string | undefined;

    // Apply current selection styling
    if (isCurrentItem) {
      backgroundColor = 'blue';
      color = 'white';
    }

    // Apply bulk selection styling
    if (isSelected || isInVisualSelection) {
      color = 'yellow';
      if (!isCurrentItem) {
        backgroundColor = 'gray';
      }
    }

    // Apply search highlighting (simplified)
    if (hasSearchMatch && searchResult) {
      displayText = secretKey; // Keep original for now
    }

    return (
      <Box key={secretKey}>
        <Text color={color} backgroundColor={backgroundColor}>
          {isSelected ? '● ' : '  '}
          {displayText}
          {hasSearchMatch && searchResult && (
            <Text color="green"> ({searchResult.matchScore.toFixed(1)})</Text>
          )}
        </Text>
      </Box>
    );
  };

  const getDisplaySecrets = () => {
    return isSearchMode && searchResults.length > 0 ? filteredSecrets : secrets;
  };

  const getCurrentDisplayIndex = () => {
    if (isSearchMode && searchResults.length > 0) {
      return searchSelectedIndex;
    }
    return currentIndex;
  };

  return (
    <Box flexDirection="column" height="100%">
      {/* Search Bar */}
      {mode === 'search' && <SearchBar onSelectResult={handleSearchComplete} />}

      {/* Cloud Status */}
      {mode === 'cloud' && (
        <CloudStatus
          syncManager={syncManager}
          vaultPath={vaultPath}
          isVisible={true}
          onClose={() => setMode('normal')}
          onSync={handleCloudSync}
        />
      )}

      {/* Mode Indicators */}
      {mode === 'normal' && (
        <Box flexDirection="column">
          {/* Search Results Header */}
          {isSearchMode && (
            <Box paddingX={1} borderStyle="single" borderColor="green">
              <Text color="green">
                🔍 Search: "{searchQuery}" ({searchResults.length} results)
              </Text>
            </Box>
          )}

          {/* Bulk Operations */}
          <BulkOperations
            secrets={getDisplaySecrets()}
            currentIndex={getCurrentDisplayIndex()}
            onBulkComplete={handleBulkComplete}
          />

          {/* Secrets List */}
          <Box flexDirection="column" flexGrow={1} overflow="hidden">
            {getDisplaySecrets().length > 0 ? (
              getDisplaySecrets().map((secretKey, index) =>
                renderSecretItem(
                  secretKey,
                  index,
                  index === getCurrentDisplayIndex()
                )
              )
            ) : (
              <Box paddingX={1}>
                <Text color="gray">
                  {isSearchMode
                    ? 'No search results found'
                    : 'No secrets found'}
                </Text>
              </Box>
            )}
          </Box>

          {/* Status Bar */}
          <Box
            paddingX={1}
            borderStyle="single"
            borderColor="gray"
            marginTop={1}
          >
            <Text dimColor>
              {getDisplaySecrets().length > 0 &&
                `${getCurrentDisplayIndex() + 1}/${getDisplaySecrets().length} • `}
              / Search • c Cloud • v Bulk • ? Help
              {isSearchMode && ' • Esc Clear Search'}
              {isSelectionMode && ` • ${selectedSecrets.size} selected`}
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
