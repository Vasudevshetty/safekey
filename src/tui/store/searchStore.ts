/**
 * Search Store - Manages search state and functionality
 */

import { create } from 'zustand';

export interface SearchResult {
  key: string;
  value: string;
  description?: string;
  matchType: 'key' | 'value' | 'description';
  matchScore: number;
  highlightRanges: Array<{ start: number; end: number }>;
}

export interface SearchFilter {
  type: 'tag' | 'date' | 'size' | 'custom';
  field: string;
  operator:
    | 'equals'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'before'
    | 'after'
    | 'gt'
    | 'lt';
  value: string;
  active: boolean;
}

export interface SearchState {
  // Search query and mode
  isSearchMode: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
  selectedResultIndex: number;

  // Filters
  activeFilters: SearchFilter[];
  availableFilters: SearchFilter[];

  // Search options
  caseSensitive: boolean;
  useRegex: boolean;
  searchInValues: boolean;
  searchInDescriptions: boolean;

  // Search history
  searchHistory: string[];
  historyIndex: number;

  // Actions
  setSearchMode: (_isSearchMode: boolean) => void;
  setSearchQuery: (_query: string) => void;
  performSearch: (_secrets: Record<string, any>) => void;
  selectNextResult: () => void;
  selectPreviousResult: () => void;
  addFilter: (_filter: SearchFilter) => void;
  removeFilter: (_index: number) => void;
  toggleFilter: (_index: number) => void;
  clearSearch: () => void;
  addToHistory: (_query: string) => void;
  navigateHistory: (_direction: 'up' | 'down') => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  // Initial state
  isSearchMode: false,
  searchQuery: '',
  searchResults: [],
  selectedResultIndex: 0,

  activeFilters: [],
  availableFilters: [
    {
      type: 'date',
      field: 'createdAt',
      operator: 'after',
      value: '',
      active: false,
    },
    {
      type: 'date',
      field: 'updatedAt',
      operator: 'after',
      value: '',
      active: false,
    },
    {
      type: 'size',
      field: 'value',
      operator: 'gt',
      value: '',
      active: false,
    },
  ],

  caseSensitive: false,
  useRegex: false,
  searchInValues: true,
  searchInDescriptions: true,

  searchHistory: [],
  historyIndex: -1,

  // Actions
  setSearchMode: (isSearchMode: boolean) => {
    set({ isSearchMode });
    if (!isSearchMode) {
      set({ searchQuery: '', searchResults: [], selectedResultIndex: 0 });
    }
  },

  setSearchQuery: (searchQuery: string) => {
    set({ searchQuery, selectedResultIndex: 0 });
  },

  performSearch: (secrets: Record<string, any>) => {
    const state = get();
    if (!state.searchQuery.trim()) {
      set({ searchResults: [], selectedResultIndex: 0 });
      return;
    }

    const results = fuzzySearch(state.searchQuery, secrets, {
      caseSensitive: state.caseSensitive,
      useRegex: state.useRegex,
      searchInValues: state.searchInValues,
      searchInDescriptions: state.searchInDescriptions,
    });

    // Apply active filters
    const filteredResults = applyFilters(results, state.activeFilters);

    set({
      searchResults: filteredResults,
      selectedResultIndex: 0,
    });
  },

  selectNextResult: () => {
    const { searchResults, selectedResultIndex } = get();
    if (searchResults.length > 0) {
      set({
        selectedResultIndex: (selectedResultIndex + 1) % searchResults.length,
      });
    }
  },

  selectPreviousResult: () => {
    const { searchResults, selectedResultIndex } = get();
    if (searchResults.length > 0) {
      set({
        selectedResultIndex:
          selectedResultIndex === 0
            ? searchResults.length - 1
            : selectedResultIndex - 1,
      });
    }
  },

  addFilter: (filter: SearchFilter) => {
    const { activeFilters } = get();
    set({ activeFilters: [...activeFilters, { ...filter, active: true }] });
  },

  removeFilter: (index: number) => {
    const { activeFilters } = get();
    set({
      activeFilters: activeFilters.filter((_, i) => i !== index),
    });
  },

  toggleFilter: (index: number) => {
    const { activeFilters } = get();
    const newFilters = [...activeFilters];
    if (newFilters[index]) {
      newFilters[index].active = !newFilters[index].active;
      set({ activeFilters: newFilters });
    }
  },

  clearSearch: () => {
    set({
      searchQuery: '',
      searchResults: [],
      selectedResultIndex: 0,
      activeFilters: [],
    });
  },

  addToHistory: (query: string) => {
    const { searchHistory } = get();
    if (query.trim() && !searchHistory.includes(query)) {
      const newHistory = [query, ...searchHistory.slice(0, 19)]; // Keep last 20
      set({ searchHistory: newHistory, historyIndex: -1 });
    }
  },

  navigateHistory: (direction: 'up' | 'down') => {
    const { searchHistory, historyIndex } = get();
    if (searchHistory.length === 0) return;

    let newIndex = historyIndex;

    if (direction === 'up') {
      newIndex = Math.min(historyIndex + 1, searchHistory.length - 1);
    } else {
      newIndex = Math.max(historyIndex - 1, -1);
    }

    const query = newIndex >= 0 ? searchHistory[newIndex] : '';
    set({
      historyIndex: newIndex,
      searchQuery: query,
    });
  },
}));

/**
 * Fuzzy search implementation
 */
function fuzzySearch(
  query: string,
  secrets: Record<string, any>,
  options: {
    caseSensitive: boolean;
    useRegex: boolean;
    searchInValues: boolean;
    searchInDescriptions: boolean;
  }
): SearchResult[] {
  const results: SearchResult[] = [];
  const normalizedQuery = options.caseSensitive ? query : query.toLowerCase();

  let searchRegex: RegExp | null = null;
  if (options.useRegex) {
    try {
      searchRegex = new RegExp(query, options.caseSensitive ? 'g' : 'gi');
    } catch {
      // Invalid regex, fall back to normal search
    }
  }

  Object.entries(secrets).forEach(([key, secret]) => {
    const searchTargets: Array<{
      text: string;
      type: 'key' | 'value' | 'description';
    }> = [{ text: key, type: 'key' }];

    if (options.searchInValues && secret.value) {
      searchTargets.push({ text: secret.value, type: 'value' });
    }

    if (options.searchInDescriptions && secret.description) {
      searchTargets.push({ text: secret.description, type: 'description' });
    }

    searchTargets.forEach(({ text, type }) => {
      const normalizedText = options.caseSensitive ? text : text.toLowerCase();
      let match = false;
      let score = 0;
      let highlightRanges: Array<{ start: number; end: number }> = [];

      if (searchRegex) {
        const regexMatches = Array.from(text.matchAll(searchRegex));
        if (regexMatches.length > 0) {
          match = true;
          score = regexMatches.length * 10;
          highlightRanges = regexMatches.map((m) => ({
            start: m.index!,
            end: m.index! + m[0].length,
          }));
        }
      } else {
        // Fuzzy matching algorithm
        const matchResult = calculateFuzzyMatch(
          normalizedQuery,
          normalizedText
        );
        if (matchResult.score > 0) {
          match = true;
          score = matchResult.score;
          highlightRanges = matchResult.ranges;
        }
      }

      if (match) {
        // Boost score based on match type
        if (type === 'key') score *= 3;
        else if (type === 'description') score *= 1.5;

        results.push({
          key,
          value: secret.value,
          description: secret.description,
          matchType: type,
          matchScore: score,
          highlightRanges,
        });
      }
    });
  });

  // Sort by score (highest first)
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Calculate fuzzy match score and highlight ranges
 */
function calculateFuzzyMatch(
  query: string,
  text: string
): { score: number; ranges: Array<{ start: number; end: number }> } {
  if (!query || !text) return { score: 0, ranges: [] };

  // Exact match gets highest score
  const exactIndex = text.indexOf(query);
  if (exactIndex !== -1) {
    return {
      score: 100,
      ranges: [{ start: exactIndex, end: exactIndex + query.length }],
    };
  }

  // Starts with match gets high score
  if (text.startsWith(query)) {
    return {
      score: 80,
      ranges: [{ start: 0, end: query.length }],
    };
  }

  // Contains all characters in order
  let score = 0;
  let textIndex = 0;
  const ranges: Array<{ start: number; end: number }> = [];
  let currentRange: { start: number; end: number } | null = null;

  for (let i = 0; i < query.length; i++) {
    const char = query[i];
    const foundIndex = text.indexOf(char, textIndex);

    if (foundIndex === -1) {
      return { score: 0, ranges: [] };
    }

    score += 10;

    // Consecutive characters get bonus
    if (foundIndex === textIndex) {
      score += 5;
    }

    // Track highlight ranges
    if (currentRange && foundIndex === currentRange.end) {
      currentRange.end = foundIndex + 1;
    } else {
      if (currentRange) {
        ranges.push(currentRange);
      }
      currentRange = { start: foundIndex, end: foundIndex + 1 };
    }

    textIndex = foundIndex + 1;
  }

  if (currentRange) {
    ranges.push(currentRange);
  }

  return { score, ranges };
}

/**
 * Apply filters to search results
 */
function applyFilters(
  results: SearchResult[],
  filters: SearchFilter[]
): SearchResult[] {
  const activeFilters = filters.filter((f) => f.active);
  if (activeFilters.length === 0) return results;

  return results.filter((_result) => {
    return activeFilters.every((_filter) => {
      // TODO: Implement filter logic based on filter type and operator
      return true; // For now, return all results
    });
  });
}
