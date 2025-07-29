# Introduction to SafeKey

SafeKey is a secure, offline-first secrets manager CLI designed specifically for developers and DevOps teams. Built with TypeScript and modern security practices, SafeKey provides a powerful yet simple way to manage sensitive data in your development workflow.

## What is SafeKey?

SafeKey is a command-line interface (CLI) tool that allows you to:

- **Store secrets securely** using military-grade encryption (AES-256-GCM)
- **Work offline-first** with no internet dependency for core functionality
- **Collaborate with teams** through secure vault sharing
- **Sync across devices** using optional cloud providers
- **Integrate seamlessly** into your development workflow

## Key Features

### 🔒 Security-First Design

- **AES-256-GCM encryption** with PBKDF2 key derivation
- **Local encryption** - your master password never leaves your device
- **Secure random salt generation** for each vault
- **Memory protection** to prevent secret leakage

### 🚀 Developer Experience

- **Intuitive CLI** with helpful prompts and error messages
- **Shell completion** for Bash and Zsh
- **Cross-platform** support (Windows, macOS, Linux)
- **TypeScript codebase** with full type safety

### 👥 Team Collaboration

- **Shared vaults** with role-based access control
- **Team member management** with secure invite system
- **Audit logs** to track vault access and modifications
- **Secure handoff** for team transitions

### ☁️ Optional Cloud Sync

- **Multiple providers** - GitHub Gist, AWS S3, Azure Blob Storage
- **End-to-end encryption** - cloud providers can't see your data
- **Conflict resolution** for simultaneous edits
- **Offline resilience** - sync when connection is available

## Philosophy

SafeKey is built on the principle that security tools should be **simple to use** and **hard to misuse**. We believe that:

1. **Security should be the default**, not an afterthought
2. **Developer tools should enhance workflow**, not complicate it
3. **Offline functionality is essential** for reliability and privacy
4. **Open source** enables trust through transparency

## Who Should Use SafeKey?

SafeKey is perfect for:

- **Individual developers** who need to manage API keys, database passwords, and other secrets
- **Development teams** that need to share secrets securely
- **DevOps engineers** who work with multiple environments and credentials
- **Security-conscious organizations** that require strong encryption standards

## How It Works

1. **Initialize** a vault with a master password
2. **Add secrets** using simple commands like `safekey add API_KEY`
3. **Retrieve secrets** instantly with `safekey get API_KEY`
4. **Share with team** members using secure vault sharing
5. **Sync across devices** using your preferred cloud provider

## Next Steps

Ready to get started? Check out our [Installation Guide](installation.md) to install SafeKey on your system, or jump straight to the [Quick Start Guide](quick-start.md) to begin using SafeKey in minutes.

For a deeper understanding of SafeKey's architecture and security model, explore our [Core Concepts](../core-concepts/vaults.md) section.
