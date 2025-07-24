import React from 'react';
import { render } from 'ink';
import { SafeKeyTUI } from './components/SafeKeyTUI.js';

export function startTUI(): void {
  const { unmount } = render(<SafeKeyTUI />);

  // Handle cleanup on exit
  process.on('SIGINT', () => {
    unmount();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    unmount();
    process.exit(0);
  });
}

export default startTUI;
