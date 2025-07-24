/**
 * BulkOperations Component - Multi-select and bulk actions for TUI
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useBulkStore } from '../store/bulkStore.js';

interface BulkOperationsProps {
  secrets: string[];
  currentIndex: number;
  onBulkComplete?: () => void;
}

export function BulkOperations({
  secrets,
  currentIndex,
  onBulkComplete,
}: BulkOperationsProps) {
  const {
    isSelectionMode,
    selectedSecrets,
    isVisualMode,
    visualStart,
    visualEnd,
    availableOperations,
    pendingOperation,
    operationInput,
    isProcessing,
    processedCount,
    totalCount,
    currentOperation,
    toggleSelectionMode,
    toggleSecretSelection,
    selectAll,
    clearSelection,
    enterVisualMode,
    exitVisualMode,
    updateVisualSelection,
    confirmVisualSelection,
    setPendingOperation,
    setOperationInput,
    executeBulkOperation,
    cancelOperation,
  } = useBulkStore();

  const [showOperationsMenu, setShowOperationsMenu] = useState(false);
  const [selectedOperationIndex, setSelectedOperationIndex] = useState(0);

  useInput((input, key) => {
    // Handle visual mode
    if (isVisualMode) {
      if (key.escape) {
        exitVisualMode();
        return;
      }

      if (key.return) {
        confirmVisualSelection(secrets);
        exitVisualMode();
        return;
      }

      if (key.upArrow || input === 'k') {
        updateVisualSelection(Math.max(0, currentIndex - 1));
        return;
      }

      if (key.downArrow || input === 'j') {
        updateVisualSelection(Math.min(secrets.length - 1, currentIndex + 1));
        return;
      }

      return; // Don't process other inputs in visual mode
    }

    // Handle operation menu
    if (showOperationsMenu && !pendingOperation) {
      if (key.escape) {
        setShowOperationsMenu(false);
        return;
      }

      if (key.upArrow || input === 'k') {
        setSelectedOperationIndex(Math.max(0, selectedOperationIndex - 1));
        return;
      }

      if (key.downArrow || input === 'j') {
        setSelectedOperationIndex(
          Math.min(availableOperations.length - 1, selectedOperationIndex + 1)
        );
        return;
      }

      if (key.return) {
        const operation = availableOperations[selectedOperationIndex];
        setPendingOperation(operation);
        setShowOperationsMenu(false);
        return;
      }

      return;
    }

    // Handle operation input
    if (pendingOperation) {
      if (key.escape) {
        cancelOperation();
        return;
      }

      if (key.return) {
        if (!pendingOperation.requiresInput || operationInput.trim()) {
          executeBulkOperation((progress, message) => {
            // Progress callback
            console.log(`Progress: ${progress}% - ${message}`);
          })
            .then(() => {
              if (onBulkComplete) {
                onBulkComplete();
              }
            })
            .catch((error) => {
              console.error('Bulk operation failed:', error);
            });
        }
        return;
      }

      if (pendingOperation.requiresInput) {
        if (key.backspace || key.delete) {
          setOperationInput(operationInput.slice(0, -1));
          return;
        }

        if (input && !key.ctrl && !key.meta) {
          setOperationInput(operationInput + input);
          return;
        }
      }

      return;
    }

    // Handle bulk mode shortcuts
    if (input === 'V' && !isVisualMode) {
      enterVisualMode(currentIndex);
      return;
    }

    if (input === ' ' && isSelectionMode) {
      const secretKey = secrets[currentIndex];
      if (secretKey) {
        toggleSecretSelection(secretKey, currentIndex);
      }
      return;
    }

    if (key.ctrl && input === 'a') {
      selectAll(secrets);
      return;
    }

    if (input === 'd' && selectedSecrets.size > 0) {
      const deleteOp = availableOperations.find((op) => op.type === 'delete');
      if (deleteOp) {
        setPendingOperation(deleteOp);
      }
      return;
    }

    if (input === 'e' && selectedSecrets.size > 0) {
      const exportOp = availableOperations.find((op) => op.type === 'export');
      if (exportOp) {
        setPendingOperation(exportOp);
      }
      return;
    }

    if (input === 'o' && selectedSecrets.size > 0) {
      setShowOperationsMenu(true);
      setSelectedOperationIndex(0);
      return;
    }

    if (input === 'v') {
      toggleSelectionMode();
      return;
    }

    if (key.escape && isSelectionMode) {
      clearSelection();
      return;
    }
  });

  // Don't render if not in selection mode and no operations pending
  if (!isSelectionMode && !pendingOperation && !isProcessing) {
    return null;
  }

  return (
    <Box flexDirection="column">
      {/* Selection Info */}
      {isSelectionMode && (
        <Box paddingX={1} borderStyle="single" borderColor="yellow">
          <Text color="yellow">
            📋 Selection Mode: {selectedSecrets.size} selected
            {isVisualMode &&
              ` (Visual: ${Math.abs(visualEnd - visualStart) + 1})`}
          </Text>
        </Box>
      )}

      {/* Visual Mode Indicator */}
      {isVisualMode && (
        <Box paddingX={1} marginTop={1}>
          <Text color="magenta" bold>
            VISUAL MODE - Use j/k to select range, Enter to confirm, Esc to
            cancel
          </Text>
        </Box>
      )}

      {/* Operations Menu */}
      {showOperationsMenu && (
        <Box
          flexDirection="column"
          marginTop={1}
          paddingX={1}
          borderStyle="single"
          borderColor="cyan"
        >
          <Box marginBottom={1}>
            <Text color="cyan" bold>
              Bulk Operations
            </Text>
          </Box>
          {availableOperations.map((operation, index) => (
            <Box key={operation.type}>
              <Text
                color={index === selectedOperationIndex ? 'cyan' : 'white'}
                backgroundColor={
                  index === selectedOperationIndex ? 'blue' : undefined
                }
              >
                {index === selectedOperationIndex ? '▶ ' : '  '}
                {operation.icon} {operation.name}
                {operation.dangerous && <Text color="red"> ⚠️</Text>}
              </Text>
            </Box>
          ))}
          <Box marginTop={1}>
            <Text color="gray">↑/↓ Navigate • Enter Select • Esc Cancel</Text>
          </Box>
        </Box>
      )}

      {/* Operation Input */}
      {pendingOperation && !isProcessing && (
        <Box
          flexDirection="column"
          marginTop={1}
          paddingX={1}
          borderStyle="single"
          borderColor="magenta"
        >
          <Box marginBottom={1}>
            <Text color="magenta" bold>
              {pendingOperation.icon} {pendingOperation.name}
            </Text>
          </Box>

          <Box marginBottom={1}>
            <Text>{pendingOperation.description}</Text>
          </Box>

          <Box marginBottom={1}>
            <Text color="yellow">
              Targets: {selectedSecrets.size} secret
              {selectedSecrets.size === 1 ? '' : 's'}
            </Text>
          </Box>

          {pendingOperation.requiresInput && (
            <Box marginBottom={1}>
              <Text color="cyan">Input: </Text>
              <Text>{operationInput}</Text>
              <Text color="gray">█</Text>
            </Box>
          )}

          {pendingOperation.dangerous && (
            <Box marginBottom={1}>
              <Text color="red" bold>
                ⚠️ WARNING: This action cannot be undone!
              </Text>
            </Box>
          )}

          <Box>
            <Text color="gray">
              {pendingOperation.requiresInput ? 'Type input, then ' : ''}
              Enter to execute • Esc to cancel
            </Text>
          </Box>
        </Box>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <Box
          flexDirection="column"
          marginTop={1}
          paddingX={1}
          borderStyle="single"
          borderColor="green"
        >
          <Box marginBottom={1}>
            <Text color="green" bold>
              🔄 {currentOperation} in progress...
            </Text>
          </Box>

          <Box marginBottom={1}>
            <Text>
              Progress: {processedCount}/{totalCount} (
              {Math.round((processedCount / totalCount) * 100)}%)
            </Text>
          </Box>

          <Box>
            <Text color="gray">Processing secrets...</Text>
          </Box>
        </Box>
      )}

      {/* Keyboard Shortcuts Help */}
      {isSelectionMode &&
        !showOperationsMenu &&
        !pendingOperation &&
        !isProcessing && (
          <Box
            marginTop={1}
            paddingX={1}
            borderStyle="single"
            borderColor="gray"
          >
            <Text dimColor>
              Space Toggle • V Visual • v Selection • d Delete • e Export • o
              Operations • Ctrl+A All • Esc Clear
            </Text>
          </Box>
        )}
    </Box>
  );
}
