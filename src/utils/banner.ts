/**
 * ASCII Art Banner for SafeKey
 */

export const SAFEKEY_BANNER = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ███████  █████  ███████ ███████ ██   ██ ███████ ██  ██      ║
║   ██      ██   ██ ██      ██      ██  ██  ██      ██  ██      ║
║   ███████ ███████ █████   █████   █████   █████    ████       ║
║        ██ ██   ██ ██      ██      ██  ██  ██        ██        ║
║   ███████ ██   ██ ██      ███████ ██   ██ ███████   ██        ║
║                                                               ║
║                   Secure Secrets Manager                      ║
║                                                               ║
║                 Created by: Vasudev Shetty                    ║
║       GitHub: https://github.com/Vasudevshetty/safekey        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`;

export const COMPACT_BANNER = `
┌──────────────────────────────────────────────────────────────┐
│ ███████  █████  ███████ ███████ ██   ██  ███████ ██    ██    │
│ ██      ██   ██ ██      ██      ██  ██   ██      ██    ██    │
│ ███████ ███████ █████   █████   █████    █████    ██████     │
│      ██ ██   ██ ██      ██      ██  ██   ██         ██       │
│ ███████ ██   ██ ██      ███████ ██   ██  ███████    ██       │
│                                                              │
│                   Secure Secrets Manager                     │
│                  github.com/Vasudevshetty/                   │
└──────────────────────────────────────────────────────────────┘
`;

export function displayBanner(compact = false): void {
  console.log(compact ? COMPACT_BANNER : SAFEKEY_BANNER);
}
