import { create } from 'zustand';
import { Vault } from '../../core/vault.js';
import { SecretEntry } from '../../core/types.js';

export interface TUIState {
  // Current vault
  vault: Vault | null;
  vaultPath: string;
  isVaultLoaded: boolean;

  // Secrets management
  secrets: Record<string, SecretEntry>;
  selectedSecretKey: string | null;

  // UI state
  currentView:
    | 'dashboard'
    | 'secrets'
    | 'settings'
    | 'vault-selector'
    | 'teams';
  searchQuery: string;
  filteredSecrets: string[];

  // Modal state
  isModalOpen: boolean;
  modalType:
    | 'add-secret'
    | 'edit-secret'
    | 'delete-secret'
    | 'export'
    | 'import'
    | null;

  // Status
  statusMessage: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  setVault: (_vault: Vault, _path: string) => void;
  loadSecrets: () => Promise<void>;
  setSelectedSecret: (_key: string | null) => void;
  setCurrentView: (_view: TUIState['currentView']) => void;
  setSearchQuery: (_query: string) => void;
  openModal: (_type: TUIState['modalType']) => void;
  closeModal: () => void;
  setStatus: (_message: string) => void;
  setError: (_error: string | null) => void;
  setLoading: (_loading: boolean) => void;
}

export const useTUIStore = create<TUIState>((set, get) => ({
  // Initial state
  vault: null,
  vaultPath: '',
  isVaultLoaded: false,
  secrets: {},
  selectedSecretKey: null,
  currentView: 'vault-selector',
  searchQuery: '',
  filteredSecrets: [],
  isModalOpen: false,
  modalType: null,
  statusMessage: 'Welcome to SafeKey TUI',
  isLoading: false,
  error: null,

  // Actions
  setVault: (vault: Vault, path: string) => {
    set({
      vault,
      vaultPath: path,
      isVaultLoaded: true,
      currentView: 'dashboard',
    });
  },

  loadSecrets: async () => {
    const { vault } = get();
    if (!vault) return;

    set({ isLoading: true, error: null });

    try {
      const secretsList = vault.getAllSecrets();
      const secretsMap: Record<string, SecretEntry> = {};

      for (const secretMeta of secretsList) {
        // Get the full secret with value
        const fullSecret = vault.getSecret(secretMeta.key);
        secretsMap[secretMeta.key] = fullSecret;
      }

      set({
        secrets: secretsMap,
        filteredSecrets: Object.keys(secretsMap),
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load secrets',
        isLoading: false,
      });
    }
  },

  setSelectedSecret: (key: string | null) => {
    set({ selectedSecretKey: key });
  },

  setCurrentView: (view: TUIState['currentView']) => {
    set({ currentView: view });
  },

  setSearchQuery: (query: string) => {
    const { secrets } = get();
    const filtered = Object.keys(secrets).filter(
      (key) =>
        key.toLowerCase().includes(query.toLowerCase()) ||
        secrets[key].value.toLowerCase().includes(query.toLowerCase())
    );

    set({ searchQuery: query, filteredSecrets: filtered });
  },

  openModal: (type: TUIState['modalType']) => {
    set({ isModalOpen: true, modalType: type });
  },

  closeModal: () => {
    set({ isModalOpen: false, modalType: null });
  },

  setStatus: (message: string) => {
    set({ statusMessage: message });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
