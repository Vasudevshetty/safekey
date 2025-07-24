import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Vault } from '../src/core/vault.js';
import {
  VaultNotFoundError,
  InvalidKeyError,
  SecretNotFoundError,
  SecretAlreadyExistsError,
} from '../src/core/types.js';

describe('Vault', () => {
  let vault: Vault;
  let tempVaultPath: string;
  const testPassword = 'test-password-123';

  beforeEach(async () => {
    // Create a temporary vault file path
    tempVaultPath = join(tmpdir(), `test-vault-${Date.now()}.json`);
    vault = new Vault(tempVaultPath);
  });

  afterEach(async () => {
    // Clean up temporary files
    try {
      await fs.unlink(tempVaultPath);
    } catch {
      // File might not exist
    }

    // Clear master key from memory
    vault.clearMasterKey();
  });

  describe('initialization', () => {
    it('should initialize a new vault', async () => {
      await vault.initialize(testPassword);

      const exists = await vault.exists();
      expect(exists).toBe(true);

      const metadata = vault.getMetadata();
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.keyCount).toBe(0);
      expect(metadata.salt).toBeDefined();
    });

    it('should load an existing vault', async () => {
      // First initialize the vault
      await vault.initialize(testPassword);

      // Create a new vault instance and load
      const newVault = new Vault(tempVaultPath);
      await newVault.load(testPassword);

      const metadata = newVault.getMetadata();
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.keyCount).toBe(0);
    });

    it('should throw VaultNotFoundError when loading non-existent vault', async () => {
      const nonExistentVault = new Vault('/non/existent/path.json');
      await expect(nonExistentVault.load(testPassword)).rejects.toThrow(
        VaultNotFoundError
      );
    });

    it('should throw InvalidKeyError with wrong password', async () => {
      await vault.initialize(testPassword);

      const newVault = new Vault(tempVaultPath);
      await expect(newVault.load('wrong-password')).rejects.toThrow(
        InvalidKeyError
      );
    });
  });

  describe('secret management', () => {
    beforeEach(async () => {
      await vault.initialize(testPassword);
    });

    it('should add a new secret', async () => {
      await vault.addSecret('test-key', 'test-value', 'Test description');

      const secret = vault.getSecret('test-key');
      expect(secret.key).toBe('test-key');
      expect(secret.value).toBe('test-value');
      expect(secret.description).toBe('Test description');
      expect(secret.version).toBe(1);
    });

    it('should throw SecretAlreadyExistsError when adding duplicate secret', async () => {
      await vault.addSecret('test-key', 'test-value');

      await expect(
        vault.addSecret('test-key', 'another-value')
      ).rejects.toThrow(SecretAlreadyExistsError);
    });

    it('should get a secret', async () => {
      await vault.addSecret('test-key', 'test-value', 'Test description');

      const secret = vault.getSecret('test-key');
      expect(secret.key).toBe('test-key');
      expect(secret.value).toBe('test-value');
      expect(secret.description).toBe('Test description');
    });

    it('should throw SecretNotFoundError when getting non-existent secret', () => {
      expect(() => vault.getSecret('non-existent')).toThrow(
        SecretNotFoundError
      );
    });

    it('should update an existing secret', async () => {
      await vault.addSecret('test-key', 'test-value', 'Original description');

      await vault.updateSecret(
        'test-key',
        'updated-value',
        'Updated description'
      );

      const secret = vault.getSecret('test-key');
      expect(secret.value).toBe('updated-value');
      expect(secret.description).toBe('Updated description');
      expect(secret.version).toBe(2);
    });

    it('should throw SecretNotFoundError when updating non-existent secret', async () => {
      await expect(vault.updateSecret('non-existent', 'value')).rejects.toThrow(
        SecretNotFoundError
      );
    });

    it('should remove a secret', async () => {
      await vault.addSecret('test-key', 'test-value');

      await vault.removeSecret('test-key');

      expect(() => vault.getSecret('test-key')).toThrow(SecretNotFoundError);
    });

    it('should throw SecretNotFoundError when removing non-existent secret', async () => {
      await expect(vault.removeSecret('non-existent')).rejects.toThrow(
        SecretNotFoundError
      );
    });

    it('should list all secret keys', async () => {
      await vault.addSecret('key1', 'value1');
      await vault.addSecret('key2', 'value2');
      await vault.addSecret('key3', 'value3');

      const keys = vault.listSecrets();
      expect(keys).toEqual(['key1', 'key2', 'key3']);
    });

    it('should get all secrets without values', async () => {
      await vault.addSecret('key1', 'value1', 'Description 1');
      await vault.addSecret('key2', 'value2', 'Description 2');

      const secrets = vault.getAllSecrets();
      expect(secrets).toHaveLength(2);

      secrets.forEach((secret) => {
        expect(secret).not.toHaveProperty('value');
        expect(secret).toHaveProperty('key');
        expect(secret).toHaveProperty('description');
        expect(secret).toHaveProperty('createdAt');
        expect(secret).toHaveProperty('updatedAt');
        expect(secret).toHaveProperty('version');
      });
    });
  });

  describe('export and import', () => {
    beforeEach(async () => {
      await vault.initialize(testPassword);
      await vault.addSecret('API_KEY', 'abc123');
      await vault.addSecret('DB_PASSWORD', 'secret123');
    });

    it('should export secrets as JSON', () => {
      const exported = vault.exportSecrets('json');
      const parsed = JSON.parse(exported);

      expect(parsed.API_KEY.value).toBe('abc123');
      expect(parsed.DB_PASSWORD.value).toBe('secret123');
    });

    it('should export secrets as ENV format', () => {
      const exported = vault.exportSecrets('env');

      expect(exported).toContain('API_KEY=abc123');
      expect(exported).toContain('DB_PASSWORD=secret123');
    });

    it('should import secrets from ENV format', async () => {
      const envData = 'NEW_KEY=new_value\nANOTHER_KEY=another_value';

      const importedCount = await vault.importSecrets(envData, 'env');

      expect(importedCount).toBe(2);
      expect(vault.getSecret('NEW_KEY').value).toBe('new_value');
      expect(vault.getSecret('ANOTHER_KEY').value).toBe('another_value');
    });

    it('should import secrets from JSON format', async () => {
      const jsonData = JSON.stringify({
        NEW_KEY: 'new_value',
        ANOTHER_KEY: 'another_value',
      });

      const importedCount = await vault.importSecrets(jsonData, 'json');

      expect(importedCount).toBe(2);
      expect(vault.getSecret('NEW_KEY').value).toBe('new_value');
      expect(vault.getSecret('ANOTHER_KEY').value).toBe('another_value');
    });
  });

  describe('persistence', () => {
    it('should persist secrets across vault reload', async () => {
      await vault.initialize(testPassword);
      await vault.addSecret(
        'persistent-key',
        'persistent-value',
        'Persistent secret'
      );

      // Create new vault instance and load
      const newVault = new Vault(tempVaultPath);
      await newVault.load(testPassword);

      const secret = newVault.getSecret('persistent-key');
      expect(secret.value).toBe('persistent-value');
      expect(secret.description).toBe('Persistent secret');
    });

    it('should update metadata on save', async () => {
      await vault.initialize(testPassword);
      const initialMetadata = vault.getMetadata();

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      await vault.addSecret('test-key', 'test-value');
      const updatedMetadata = vault.getMetadata();

      expect(updatedMetadata.keyCount).toBe(1);
      expect(updatedMetadata.updatedAt.getTime()).toBeGreaterThan(
        initialMetadata.updatedAt.getTime()
      );
    });
  });
});
