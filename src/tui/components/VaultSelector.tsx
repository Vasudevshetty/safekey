import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { Vault } from '../../core/vault.js';
import { Config } from '../../config/config.js';
import { useTUIStore } from '../store/tuiStore.js';
import { PasswordInput } from './PasswordInput.js';

export function VaultSelector() {
  const [vaults, setVaults] = useState<Array<{ name: string; path: string }>>(
    []
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [selectedVaultForAuth, setSelectedVaultForAuth] = useState<{
    name: string;
    path: string;
  } | null>(null);
  const { setVault, setStatus, setError, loadSecrets } = useTUIStore();

  useEffect(() => {
    loadVaults();
  }, []);

  const loadVaults = async () => {
    try {
      const config = new Config();
      const profiles = config.listProfiles();

      const vaultList = profiles.map((profile) => ({
        name: profile.name,
        path: profile.vaultPath,
      }));

      // Add default vault if no profiles exist
      if (vaultList.length === 0) {
        vaultList.push({
          name: 'default',
          path: 'default.vault',
        });
      }

      setVaults(vaultList);
      setIsLoading(false);
      setStatus(
        `Found ${vaultList.length} vault(s). Use ↑/↓ to select, Enter to open.`
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to load vaults'
      );
      setIsLoading(false);
    }
  };

  const selectVault = async (index: number) => {
    const selectedVault = vaults[index];
    if (!selectedVault) return;

    try {
      setStatus('Checking vault...');
      const vault = new Vault(selectedVault.path);

      // Check if vault exists
      if (!(await vault.exists())) {
        setError(
          `Vault "${selectedVault.name}" not found. Please initialize it first.`
        );
        return;
      }

      // Show password input
      setSelectedVaultForAuth(selectedVault);
      setShowPasswordInput(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to open vault');
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!selectedVaultForAuth) return;

    try {
      setStatus('Authenticating...');
      const vault = new Vault(selectedVaultForAuth.path);

      // Try to load the vault with the password
      await vault.load(password);

      // Success! Set the vault and load secrets
      setVault(vault, selectedVaultForAuth.path);
      await loadSecrets();

      setStatus(`Vault "${selectedVaultForAuth.name}" loaded successfully!`);
      setShowPasswordInput(false);
      setSelectedVaultForAuth(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Authentication failed'
      );
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordInput(false);
    setSelectedVaultForAuth(null);
    setStatus('Vault selection cancelled');
  };

  useInput((input, key) => {
    if (isLoading || showPasswordInput) return;

    if (key.upArrow && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }

    if (key.downArrow && selectedIndex < vaults.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }

    if (key.return) {
      selectVault(selectedIndex);
    }
  });

  if (isLoading) {
    return (
      <Box justifyContent="center" alignItems="center">
        <Text>Loading vaults...</Text>
      </Box>
    );
  }

  if (showPasswordInput && selectedVaultForAuth) {
    return (
      <PasswordInput
        onSubmit={handlePasswordSubmit}
        onCancel={handlePasswordCancel}
        prompt={`Enter password for vault "${selectedVaultForAuth.name}":`}
      />
    );
  }

  return (
    <Box flexDirection="column" padding={2}>
      <Box marginBottom={1}>
        <Text bold>Select a Vault:</Text>
      </Box>

      {vaults.map((vault, index) => (
        <Box key={vault.name} marginBottom={1}>
          <Text color={index === selectedIndex ? 'cyan' : 'white'}>
            {index === selectedIndex ? '> ' : '  '}
            {vault.name}
            <Text dimColor> ({vault.path})</Text>
          </Text>
        </Box>
      ))}

      <Box marginTop={2} paddingX={1} borderStyle="round">
        <Text dimColor>↑/↓ Navigate • Enter Select • Ctrl+C Exit</Text>
      </Box>
    </Box>
  );
}
