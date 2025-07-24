/**
 * Bulk Operations Store - Manages multi-select and bulk actions
 */

import { create } from 'zustand';

export interface BulkOperation {
  type: 'delete' | 'export' | 'copy' | 'move' | 'tag' | 'edit';
  name: string;
  description: string;
  icon: string;
  dangerous?: boolean;
  requiresInput?: boolean;
}

export interface BulkState {
  // Selection state
  isSelectionMode: boolean;
  selectedSecrets: Set<string>;
  lastSelectedIndex: number;
  anchorIndex: number;

  // Visual mode (vim-style)
  isVisualMode: boolean;
  visualStart: number;
  visualEnd: number;

  // Bulk operations
  availableOperations: BulkOperation[];
  pendingOperation: BulkOperation | null;
  operationInput: string;

  // Progress tracking
  isProcessing: boolean;
  processedCount: number;
  totalCount: number;
  currentOperation: string;

  // Actions
  toggleSelectionMode: () => void;
  toggleSecretSelection: (_key: string, _index: number) => void;
  selectRange: (
    _startIndex: number,
    _endIndex: number,
    _secrets: string[]
  ) => void;
  selectAll: (_secrets: string[]) => void;
  clearSelection: () => void;

  // Visual mode actions
  enterVisualMode: (_startIndex: number) => void;
  exitVisualMode: () => void;
  updateVisualSelection: (_endIndex: number) => void;
  confirmVisualSelection: (_secrets: string[]) => void;

  // Bulk operations
  setPendingOperation: (_operation: BulkOperation) => void;
  setOperationInput: (_input: string) => void;
  executeBulkOperation: (
    _onProgress?: (progress: number, message: string) => void
  ) => Promise<void>;
  cancelOperation: () => void;
}

const DEFAULT_OPERATIONS: BulkOperation[] = [
  {
    type: 'delete',
    name: 'Delete',
    description: 'Delete selected secrets',
    icon: '🗑️',
    dangerous: true,
  },
  {
    type: 'export',
    name: 'Export',
    description: 'Export selected secrets',
    icon: '📤',
    requiresInput: true,
  },
  {
    type: 'copy',
    name: 'Copy Values',
    description: 'Copy secret values to clipboard',
    icon: '📋',
  },
  {
    type: 'tag',
    name: 'Add Tags',
    description: 'Add tags to selected secrets',
    icon: '🏷️',
    requiresInput: true,
  },
];

export const useBulkStore = create<BulkState>((set, get) => ({
  // Initial state
  isSelectionMode: false,
  selectedSecrets: new Set(),
  lastSelectedIndex: -1,
  anchorIndex: -1,

  isVisualMode: false,
  visualStart: -1,
  visualEnd: -1,

  availableOperations: DEFAULT_OPERATIONS,
  pendingOperation: null,
  operationInput: '',

  isProcessing: false,
  processedCount: 0,
  totalCount: 0,
  currentOperation: '',

  // Actions
  toggleSelectionMode: () => {
    const { isSelectionMode } = get();
    if (isSelectionMode) {
      // Exit selection mode, clear selections
      set({
        isSelectionMode: false,
        selectedSecrets: new Set(),
        lastSelectedIndex: -1,
        anchorIndex: -1,
        isVisualMode: false,
        visualStart: -1,
        visualEnd: -1,
      });
    } else {
      // Enter selection mode
      set({ isSelectionMode: true });
    }
  },

  toggleSecretSelection: (key: string, index: number) => {
    const { selectedSecrets, isSelectionMode } = get();

    if (!isSelectionMode) {
      set({ isSelectionMode: true });
    }

    const newSelection = new Set(selectedSecrets);

    if (newSelection.has(key)) {
      newSelection.delete(key);
    } else {
      newSelection.add(key);
    }

    set({
      selectedSecrets: newSelection,
      lastSelectedIndex: index,
      anchorIndex: index,
    });
  },

  selectRange: (startIndex: number, endIndex: number, secrets: string[]) => {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);

    const newSelection = new Set<string>();
    for (let i = start; i <= end; i++) {
      if (secrets[i]) {
        newSelection.add(secrets[i]);
      }
    }

    set({
      selectedSecrets: newSelection,
      isSelectionMode: true,
      lastSelectedIndex: endIndex,
      anchorIndex: startIndex,
    });
  },

  selectAll: (secrets: string[]) => {
    set({
      selectedSecrets: new Set(secrets),
      isSelectionMode: true,
      lastSelectedIndex: secrets.length - 1,
      anchorIndex: 0,
    });
  },

  clearSelection: () => {
    set({
      selectedSecrets: new Set(),
      isSelectionMode: false,
      lastSelectedIndex: -1,
      anchorIndex: -1,
      isVisualMode: false,
      visualStart: -1,
      visualEnd: -1,
    });
  },

  // Visual mode actions
  enterVisualMode: (startIndex: number) => {
    set({
      isVisualMode: true,
      visualStart: startIndex,
      visualEnd: startIndex,
      isSelectionMode: true,
    });
  },

  exitVisualMode: () => {
    set({
      isVisualMode: false,
      visualStart: -1,
      visualEnd: -1,
    });
  },

  updateVisualSelection: (endIndex: number) => {
    const { isVisualMode } = get();
    if (!isVisualMode) return;

    set({ visualEnd: endIndex });
  },

  confirmVisualSelection: (secrets: string[]) => {
    const { visualStart, visualEnd, isVisualMode } = get();
    if (!isVisualMode) return;

    const start = Math.min(visualStart, visualEnd);
    const end = Math.max(visualStart, visualEnd);

    const newSelection = new Set<string>();
    for (let i = start; i <= end; i++) {
      if (secrets[i]) {
        newSelection.add(secrets[i]);
      }
    }

    set({
      selectedSecrets: newSelection,
      isVisualMode: false,
      visualStart: -1,
      visualEnd: -1,
      lastSelectedIndex: end,
      anchorIndex: start,
    });
  },

  // Bulk operations
  setPendingOperation: (operation: BulkOperation) => {
    set({ pendingOperation: operation, operationInput: '' });
  },

  setOperationInput: (input: string) => {
    set({ operationInput: input });
  },

  executeBulkOperation: async (
    onProgress?: (progress: number, message: string) => void
  ) => {
    const { pendingOperation, selectedSecrets } = get();

    if (!pendingOperation || selectedSecrets.size === 0) {
      return;
    }

    set({
      isProcessing: true,
      processedCount: 0,
      totalCount: selectedSecrets.size,
      currentOperation: pendingOperation.name,
    });

    const secretsArray = Array.from(selectedSecrets);
    let processed = 0;

    try {
      for (const secretKey of secretsArray) {
        // Simulate operation execution
        await new Promise((resolve) => setTimeout(resolve, 100));

        processed++;
        set({ processedCount: processed });

        const progress = (processed / secretsArray.length) * 100;
        const message = `${pendingOperation.name}: ${secretKey}`;

        if (onProgress) {
          onProgress(progress, message);
        }

        // TODO: Implement actual operation logic based on operation type
        switch (pendingOperation.type) {
          case 'delete':
            // Delete secret logic
            break;
          case 'export':
            // Export secret logic
            break;
          case 'copy':
            // Copy to clipboard logic
            break;
          case 'tag':
            // Add tags logic
            break;
        }
      }

      // Operation completed successfully
      set({
        isProcessing: false,
        pendingOperation: null,
        operationInput: '',
        selectedSecrets: new Set(),
        isSelectionMode: false,
      });
    } catch (error) {
      // Handle operation error
      set({
        isProcessing: false,
        currentOperation: '',
      });
      throw error;
    }
  },

  cancelOperation: () => {
    set({
      pendingOperation: null,
      operationInput: '',
      isProcessing: false,
      processedCount: 0,
      totalCount: 0,
      currentOperation: '',
    });
  },
}));
