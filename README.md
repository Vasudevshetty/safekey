# 🛡️ SafeKey: Secure Secrets Manager CLI

SafeKey is an offline-first, developer-friendly secrets manager CLI. Built in TypeScript, it supports advanced encryption, config injection, and a powerful extensible architecture. It is inspired by the Go-based prototype, but enhanced with modern Node.js and developer tooling. 

> Think of it as the "Vault meets Dotenv" — with CLI, TUI, and Web Dashboard phases.

---

## ✅ 1. Product Design Philosophy

### 📦 CLI (Must-Have – Phase 1)
- **Why**: Devs and DevOps engineers love fast, scriptable tools.
- **Built With**: TypeScript + `commander.js` (or `oclif`) + ESM support.
- **Usage**: `safekey init`, `safekey add <key>`, `safekey get <key>`, `safekey inject`

### 🖥️ TUI (Nice-to-Have – Phase 2)
- **Why**: Friendly dashboard for non-terminal folks.
- **Built With**: [`Ink`](https://github.com/vadimdemedes/ink`) (React-like CLI UIs).
- **Features**: Browse vault, edit secrets, copy to clipboard.

### 🌐 Web Dashboard (Optional – Phase 3+)
- **Why**: Visualize vault, sync across systems.
- **Built With**: `Next.js 15`, `TailwindCSS`, `shadcn/ui`, and optionally wrapped in Electron.

---

## 🧱 2. Architecture Overview (Clean + Scalable)

```
safekey/
├── bin/                 # CLI entry (compiled JS files here)
├── src/
│   ├── cli/             # CLI commands
│   │   ├── init.ts
│   │   ├── add.ts
│   │   ├── get.ts
│   │   ├── inject.ts
│   │   └── utils.ts
│   ├── tui/             # Ink-based terminal UI (optional)
│   │   └── App.tsx
│   ├── core/            # Vault + secrets management
│   │   ├── index.ts
│   │   ├── vault.ts
│   │   ├── secrets.ts
│   │   └── store.ts
│   ├── crypto/          # AES/GPG encryption utilities
│   │   ├── aes.ts
│   │   ├── gpg.ts
│   │   └── utils.ts
│   ├── config/          # User config profiles
│   │   └── config.ts
│   └── index.ts         # Main CLI entrypoint
├── tests/
│   └── vault.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ 3. Tech Stack & Tools

| Area              | Stack/Library                           | Reason                        |
| ----------------- | --------------------------------------- | ----------------------------- |
| CLI Framework     | `commander.js` or `oclif`               | Structured CLI with help docs |
| Module Format     | `type: module` (ESM) + `.mts` files     | Future-proof, cleaner syntax  |
| Packaging         | `pkg`, `nexe`, or `esbuild`             | Create native binaries        |
| TUI               | `Ink`, `React`, `ink-select-input`      | Interactive terminal UI       |
| Encryption        | Node.js `crypto` module                 | AES-256-GCM, secure randoms   |
| File Ops          | `fs/promises`, `path`, `os`             | Vault I/O and config loading  |
| Config Store      | `conf`, `cosmiconfig`, or custom JSON   | Persistent config management  |
| Formats Supported | `JSON`, `YAML`, `TOML` via `js-yaml`    | Interop and export/import     |
| Secrets Injection | `dotenv`, `child_process`, `.env`       | Auto inject to env or command |
| Web UI            | `Next.js 15`, `Tailwind`, `shadcn/ui`   | Web management panel          |
| State Mgmt (Web)  | `Zustand`, `Redux`                      | Web vault syncing             |
| Testing           | `vitest`, `jest`                        | Unit + integration tests      |
| Linting & Format  | `eslint`, `prettier`                    | Dev quality & consistency     |
| Security Audits   | `snyk`, `npm audit`, `node-sec-check`   | Safe dep check                |

---

## 📅 4. Feature Roadmap (By Phase)

### 🚀 Phase 1: CLI Core MVP
- `safekey init` – initializes an AES-256 encrypted vault (JSON-backed).
- `safekey add <key>` / `get <key>` / `rm <key>` – CRUD secrets.
- `safekey list` – view all keys.
- `safekey export` / `import` – move vault across machines.
- `.env` generator from stored secrets.
- `~/.safekeyrc.json` for config profiles.
- AES-GCM for confidentiality + integrity.
- Versioning support for vault entries.

### 🖥️ Phase 2: Optional TUI
- Ink-based terminal interface with panels and navigation.
- Display secrets, profiles, and vault metadata.
- Copy to clipboard, toggle reveal/hide secrets.

### 🔐 Phase 3: Inject Secrets into Shell/Commands
- `safekey inject -- <cmd>`:
    - Inject stored secrets as env vars.
    - Automatically wrap any `npm run`, `python`, etc.
    - Output `.env` file or execute inline with process.env.

### 🌍 Phase 4: Vault Sync & GitOps (Optional)
- `safekey push`: Encrypt + commit vault to Git repo (GPG/AES).
- `safekey pull`: Decrypt remote vault + restore.
- GitHub/GitLab integration for secrets-as-code workflows.

### 🧑‍💻 Phase 5: Web Dashboard
- Built with Next.js 15 + Tailwind CSS + Zustand.
- View/edit vault from local or synced file.
- Optional: Electron desktop wrapper.
- Secure local access with vault password (no cloud).

---

## 📁 5. Modular Folder Structure (Scalable)

> Everything is TypeScript + ESM (`type: module` in `package.json`).

```
safekey/
├── bin/                 → Compiled binaries
├── src/
│   ├── cli/             → All command line logic
│   ├── core/            → Vault core encryption logic
│   ├── crypto/          → AES + GPG handling
│   ├── tui/             → Optional Ink-based terminal UI
│   ├── config/          → Profile & vault config parsing
│   └── index.ts         → Entrypoint
├── tests/               → Unit + integration tests
├── package.json         → Scripts + dependencies
├── tsconfig.json        → ESM + strict TS options
└── README.md
```

---

## 🎓 6. Skills You’ll Master Along the Way

| Area            | Skills                               |
| --------------- | ------------------------------------- |
| TypeScript      | Advanced types, module systems (ESM) |
| CLI Dev         | Commander/Oclif, Ink (TUI)           |
| Cryptography    | AES, GPG, nonce, IV, secure randomness |
| File Systems    | Cross-platform, `os.homedir()`, etc. |
| Testing         | `vitest`, mocking `fs`, vault logic  |
| Config Mgmt     | JSON schemas, validation, profiles   |
| Web Dev (Later) | TailwindCSS, Zustand, UI UX          |
| Security        | Permissions, vault integrity checks  |
| DevOps Ready    | NPM packaging, CLI release, CI/CD    |
| OSS Publishing  | GitHub actions, releases, README     |

---

## 🧠 Next Steps to Start:

1. 🔧 Setup basic ESM Node.js CLI (`commander.js` + `tsconfig.json`)
2. 🔐 Implement `vault.ts` using AES-GCM encryption
3. 💾 Add file storage support (versioned JSON in `~/.safekey-vault.json`)
4. ✅ Build core commands: `init`, `add`, `get`, `list`
5. 🧪 Add unit tests with `vitest`
6. 🖥️ (Optional): Start building `TUI` in Ink after CLI is stable
7. 🚀 Package with `pkg` or `nexe`, publish to GitHub/NPM

Let me know when you’re ready to build the first file!
