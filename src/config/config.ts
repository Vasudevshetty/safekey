import { join } from 'node:path';
import { homedir } from 'node:os';
import Conf from 'conf';

export interface SafeKeyConfig {
  defaultVaultPath: string;
  currentProfile: string;
  profiles: Record<string, ProfileConfig>;
  ui: UIConfig;
  security: SecurityConfig;
}

export interface ProfileConfig {
  name: string;
  vaultPath: string;
  description?: string;
  createdAt: string;
  lastUsed: string;
}

export interface UIConfig {
  theme: 'auto' | 'light' | 'dark';
  dateFormat: string;
  timezone: string;
}

export interface SecurityConfig {
  lockTimeoutMinutes: number;
  requirePasswordConfirmation: boolean;
  clearClipboardSeconds: number;
}

const DEFAULT_CONFIG: SafeKeyConfig = {
  defaultVaultPath: join(homedir(), '.safekey-vault.json'),
  currentProfile: 'default',
  profiles: {
    default: {
      name: 'default',
      vaultPath: join(homedir(), '.safekey-vault.json'),
      description: 'Default SafeKey vault',
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    },
  },
  ui: {
    theme: 'auto',
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  security: {
    lockTimeoutMinutes: 15,
    requirePasswordConfirmation: false,
    clearClipboardSeconds: 30,
  },
};

export class Config {
  private conf: Conf<SafeKeyConfig>;

  constructor() {
    this.conf = new Conf<SafeKeyConfig>({
      projectName: 'safekey',
      defaults: DEFAULT_CONFIG,
      schema: {
        defaultVaultPath: {
          type: 'string',
        },
        currentProfile: {
          type: 'string',
        },
        profiles: {
          type: 'object',
        },
        ui: {
          type: 'object',
          properties: {
            theme: {
              type: 'string',
              enum: ['auto', 'light', 'dark'],
            },
            dateFormat: {
              type: 'string',
            },
            timezone: {
              type: 'string',
            },
          },
        },
        security: {
          type: 'object',
          properties: {
            lockTimeoutMinutes: {
              type: 'number',
              minimum: 1,
            },
            requirePasswordConfirmation: {
              type: 'boolean',
            },
            clearClipboardSeconds: {
              type: 'number',
              minimum: 5,
            },
          },
        },
      },
    });
  }

  /**
   * Get the full configuration
   */
  getAll(): SafeKeyConfig {
    return this.conf.store;
  }

  /**
   * Get a specific configuration value
   */
  get<T extends keyof SafeKeyConfig>(key: T): SafeKeyConfig[T] {
    return this.conf.get(key);
  }

  /**
   * Set a configuration value
   */
  set<T extends keyof SafeKeyConfig>(key: T, value: SafeKeyConfig[T]): void {
    this.conf.set(key, value);
  }

  /**
   * Get the current profile configuration
   */
  getCurrentProfile(): ProfileConfig {
    const currentProfileName = this.get('currentProfile');
    const profiles = this.get('profiles');
    return profiles[currentProfileName];
  }

  /**
   * Set the current profile
   */
  setCurrentProfile(profileName: string): void {
    const profiles = this.get('profiles');
    if (!profiles[profileName]) {
      throw new Error(`Profile '${profileName}' does not exist`);
    }

    // Update last used timestamp
    profiles[profileName].lastUsed = new Date().toISOString();
    this.set('profiles', profiles);
    this.set('currentProfile', profileName);
  }

  /**
   * Create a new profile
   */
  createProfile(name: string, vaultPath: string, description?: string): void {
    const profiles = this.get('profiles');

    if (profiles[name]) {
      throw new Error(`Profile '${name}' already exists`);
    }

    const now = new Date().toISOString();
    profiles[name] = {
      name,
      vaultPath,
      description,
      createdAt: now,
      lastUsed: now,
    };

    this.set('profiles', profiles);
  }

  /**
   * Delete a profile
   */
  deleteProfile(name: string): void {
    if (name === 'default') {
      throw new Error('Cannot delete the default profile');
    }

    const profiles = this.get('profiles');
    if (!profiles[name]) {
      throw new Error(`Profile '${name}' does not exist`);
    }

    delete profiles[name];
    this.set('profiles', profiles);

    // If we're deleting the current profile, switch to default
    if (this.get('currentProfile') === name) {
      this.set('currentProfile', 'default');
    }
  }

  /**
   * List all profiles
   */
  listProfiles(): ProfileConfig[] {
    const profiles = this.get('profiles');
    return Object.values(profiles);
  }

  /**
   * Get profile by name
   */
  getProfile(name: string): ProfileConfig | undefined {
    const profiles = this.get('profiles');
    return profiles[name];
  }

  /**
   * Update UI configuration
   */
  updateUI(uiConfig: Partial<UIConfig>): void {
    const currentUI = this.get('ui');
    this.set('ui', { ...currentUI, ...uiConfig });
  }

  /**
   * Update security configuration
   */
  updateSecurity(securityConfig: Partial<SecurityConfig>): void {
    const currentSecurity = this.get('security');
    this.set('security', { ...currentSecurity, ...securityConfig });
  }

  /**
   * Reset configuration to defaults
   */
  reset(): void {
    this.conf.clear();
  }

  /**
   * Get the configuration file path
   */
  getConfigPath(): string {
    return this.conf.path;
  }

  /**
   * Check if this is the first run (no config exists)
   */
  isFirstRun(): boolean {
    return this.conf.size === 0;
  }
}
