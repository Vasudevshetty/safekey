# 🔐 SafeKey CLI

> A blazing-fast, offline-first, open-source CLI tool to manage secrets securely using Go — ideal for developers, DevOps engineers, and small teams.

---

## ✨ Motivation

Managing secrets securely across local environments and lightweight projects often ends up with hardcoded `.env` files, insecure sharing via chats, or relying on cloud-based secret managers with complicated setup and pricing.

**SafeKey** aims to fix that:
- 🔐 **Encrypt secrets** using AES-256 or GPG
- 💻 **Offline-first**: works entirely on your machine
- 🧩 **Developer-first CLI UX**: like `git`, `npm`, etc.
- 🔄 **Team collaboration** with encrypted sharing
- 🛠️ **CI/CD ready** with secret injection capability

---

## ⚙️ Features

- `safekey init` – initialize secure vault
- `safekey add <key>` – add secret value
- `safekey get <key>` – retrieve decrypted value
- `safekey rm <key>` – remove secret
- `safekey export --gpg` – export encrypted vault
- `safekey import` – import encrypted secrets
- Optional:
  - `safekey push` / `pull` – Git-based syncing
  - `safekey inject` – inject secrets into shell/env
  - `safekey config` – manage profiles/vault locations

---

## 🧱 Tech Stack

- **Language:** Go (Golang)
- **Encryption:** Go crypto standard library (`crypto/aes`, `crypto/rand`, `crypto/cipher`)
- **CLI Framework:** [Cobra](https://github.com/spf13/cobra)
- **File system abstraction:** OS-native + JSON-based vault
- **Optional:** 
  - GPG support via shell exec (`os/exec`) or Go libraries
  - YAML/TOML parsing for `.env` or config injection

---

## 🚀 Getting Started

### 🛠️ Prerequisites

- Go 1.20+
- GPG installed (optional, for advanced sharing)
- Git (optional, for vault syncing)

### 🔧 Install (Locally)

```bash
git clone https://github.com/yourusername/safekey-cli.git
cd safekey-cli
go build -o safekey main.go
./safekey --help
```

## 📂 Folder Structure

safekey-cli/
├── cmd/                  # Cobra CLI commands
│   ├── add.go
│   ├── get.go
│   ├── rm.go
│   ├── init.go
│   ├── export.go
│   └── inject.go
├── internal/
│   ├── vault/            # Vault logic
│   │   ├── vault.go
│   │   └── store.go
│   ├── crypto/           # AES/GPG encryption
│   │   ├── aes.go
│   │   ├── gpg.go
│   │   └── utils.go
│   └── config/           # App config
├── test/
│   └── vault_test.go
├── go.mod
├── LICENSE
└── README.md
