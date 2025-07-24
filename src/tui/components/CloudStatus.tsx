/**
 * CloudStatus Component - Display cloud sync status and controls
 */

import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { SyncManager } from '../../cloud/sync-manager.js';
import { SyncStatus } from '../../cloud/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface CloudStatusProps {
  syncManager?: SyncManager;
  vaultPath: string;
  isVisible: boolean;
  onClose?: () => void;
  onSync?: () => void;
}

interface ComponentStatus {
  syncStatus?: SyncStatus;
  isOnline: boolean;
  error?: string;
  isSyncing: boolean;
}

export function CloudStatus({
  syncManager,
  vaultPath,
  isVisible,
  onClose,
  onSync,
}: CloudStatusProps) {
  const [status, setStatus] = useState<ComponentStatus>({
    isOnline: true, // Assume online in Node.js environment
    isSyncing: false,
  });
  const [showDetails, setShowDetails] = useState(false);

  // Check network connectivity (Node.js compatible)
  const checkOnlineStatus = async () => {
    try {
      await execAsync('ping -c 1 8.8.8.8', { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  };

  // Load sync status
  useEffect(() => {
    if (!syncManager || !isVisible) return;

    const loadStatus = async () => {
      try {
        const syncStatus = await syncManager.getSyncStatus(vaultPath);
        const isOnline = await checkOnlineStatus();

        setStatus({
          syncStatus,
          isOnline,
          isSyncing: false,
        });
      } catch (error) {
        setStatus((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    };

    loadStatus();
    const interval = setInterval(loadStatus, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [syncManager, vaultPath, isVisible]);

  useInput((input, key) => {
    if (!isVisible) return;

    if (key.escape || input === 'q') {
      onClose?.();
      return;
    }

    if (
      input === 's' &&
      !status.isSyncing &&
      status.syncStatus?.isConfigured &&
      status.isOnline
    ) {
      handleSync();
      return;
    }

    if (input === 'd') {
      setShowDetails(!showDetails);
      return;
    }

    if (input === 'r') {
      // Refresh status
      setStatus((prev) => ({ ...prev, error: undefined }));
      return;
    }
  });

  const handleSync = async () => {
    if (!syncManager || status.isSyncing) return;

    setStatus((prev) => ({ ...prev, isSyncing: true }));
    try {
      await syncManager.syncVault(vaultPath);
      onSync?.();

      // Refresh status after sync
      const syncStatus = await syncManager.getSyncStatus(vaultPath);
      const isOnline = await checkOnlineStatus();

      setStatus({
        syncStatus,
        isOnline,
        isSyncing: false,
      });
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sync failed',
        isSyncing: false,
      }));
    }
  };

  const getConnectionStatusIcon = () => {
    if (!status.isOnline) return '📶❌';
    if (!status.syncStatus?.isConfigured) return '☁️❌';
    if (status.error || status.syncStatus?.error) return '☁️⚠️';
    if (status.syncStatus?.status === 'conflict') return '☁️⚠️';
    if (status.syncStatus?.status === 'synced') return '☁️✅';
    return '☁️📝';
  };

  const getConnectionStatusText = () => {
    if (!status.isOnline) return 'Offline';
    if (!status.syncStatus?.isConfigured) return 'Not Configured';
    if (status.error || status.syncStatus?.error) return 'Error';
    if (status.syncStatus?.status === 'conflict') return 'Has Conflicts';
    if (status.syncStatus?.status === 'pending') return 'Pending Sync';
    if (status.syncStatus?.status === 'synced') return 'Synced';
    return 'Unknown';
  };

  const getConnectionStatusColor = () => {
    if (!status.isOnline || !status.syncStatus?.isConfigured) return 'red';
    if (
      status.error ||
      status.syncStatus?.error ||
      status.syncStatus?.status === 'conflict'
    )
      return 'yellow';
    if (status.syncStatus?.status === 'synced') return 'green';
    return 'yellow';
  };

  const formatLastSync = (date?: Date) => {
    if (!date) return 'Never';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (!isVisible) return null;

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box paddingX={1} borderStyle="single" borderColor="blue">
        <Text color="blue" bold>
          ☁️ Cloud Sync Status
        </Text>
      </Box>

      {/* Main Status */}
      <Box flexDirection="column" paddingX={1} marginTop={1}>
        <Box marginBottom={1}>
          <Text>{getConnectionStatusIcon()} Status:</Text>
          <Text color={getConnectionStatusColor()} bold>
            {' '}
            {getConnectionStatusText()}
          </Text>
          {status.isSyncing && <Text color="yellow"> (Syncing...)</Text>}
        </Box>

        {status.syncStatus?.provider && (
          <Box marginBottom={1}>
            <Text>🔗 Provider: </Text>
            <Text color="cyan">{status.syncStatus.provider}</Text>
          </Box>
        )}

        <Box marginBottom={1}>
          <Text>🕒 Last Sync: </Text>
          <Text color="gray">
            {formatLastSync(status.syncStatus?.lastSync)}
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text>� Status: </Text>
          <Text
            color={status.syncStatus?.status === 'synced' ? 'green' : 'yellow'}
          >
            {status.syncStatus?.status || 'unknown'}
          </Text>
        </Box>

        {status.syncStatus?.conflictCount &&
          status.syncStatus.conflictCount > 0 && (
            <Box marginBottom={1}>
              <Text>⚠️ Conflicts: </Text>
              <Text color="red">{status.syncStatus.conflictCount}</Text>
            </Box>
          )}

        {(status.error || status.syncStatus?.error) && (
          <Box marginBottom={1}>
            <Text color="red">
              ❌ Error: {status.error || status.syncStatus?.error}
            </Text>
          </Box>
        )}
      </Box>

      {/* Detailed Info */}
      {showDetails && status.syncStatus && (
        <Box
          flexDirection="column"
          marginTop={1}
          paddingX={1}
          borderStyle="single"
          borderColor="gray"
        >
          <Box marginBottom={1}>
            <Text color="gray" bold>
              Detailed Information
            </Text>
          </Box>

          <Box>
            <Text color="gray">Provider: </Text>
            <Text>{status.syncStatus.provider}</Text>
          </Box>

          <Box>
            <Text color="gray">Status: </Text>
            <Text>{status.syncStatus.status}</Text>
          </Box>

          <Box marginBottom={1}>
            <Text color="gray">Configured: </Text>
            <Text>{status.syncStatus.isConfigured ? 'Yes' : 'No'}</Text>
          </Box>

          {status.syncStatus.conflictCount > 0 && (
            <Box flexDirection="column" marginBottom={1}>
              <Text color="red" bold>
                Conflicts: {status.syncStatus.conflictCount}
              </Text>
              <Box paddingLeft={2}>
                <Text color="gray">
                  Use 'safekey cloud resolve' to resolve conflicts
                </Text>
              </Box>
            </Box>
          )}

          <Box marginBottom={1}>
            <Text color="gray">Network: </Text>
            <Text color={status.isOnline ? 'green' : 'red'}>
              {status.isOnline ? 'Online' : 'Offline'}
            </Text>
          </Box>
        </Box>
      )}

      {/* Controls */}
      <Box marginTop={1} paddingX={1} borderStyle="single" borderColor="gray">
        <Text dimColor>
          {status.syncStatus?.isConfigured &&
            status.isOnline &&
            !status.isSyncing &&
            's Sync • '}
          d Details • r Refresh • q Close
        </Text>
      </Box>

      {/* Sync Helper */}
      {status.syncStatus?.isConfigured &&
        status.isOnline &&
        status.syncStatus?.status === 'pending' &&
        !status.isSyncing && (
          <Box marginTop={1} paddingX={1}>
            <Text color="yellow">💡 Press 's' to sync pending changes</Text>
          </Box>
        )}

      {/* Offline Notice */}
      {!status.isOnline && (
        <Box marginTop={1} paddingX={1}>
          <Text color="gray">
            📶 You're offline. Changes will sync when connection is restored.
          </Text>
        </Box>
      )}

      {/* Not Configured Notice */}
      {status.isOnline && !status.syncStatus?.isConfigured && (
        <Box marginTop={1} paddingX={1}>
          <Text color="yellow">
            🔗 Run 'safekey cloud setup' to configure cloud sync
          </Text>
        </Box>
      )}
    </Box>
  );
}
