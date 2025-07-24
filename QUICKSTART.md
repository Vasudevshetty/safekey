# 🛡️ SafeKey CLI - Quick Start Guide

SafeKey is a secure, offline-first secrets manager designed for developers. This guide will get you up and running in minutes.

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/safekey.git
cd safekey

# Install dependencies
npm install

# Build the project
npm run build

# Install globally (optional)
npm link
```

## Quick Start

### 1. Initialize Your First Vault

```bash
# Initialize a new vault
safekey init

# Or initialize with a specific path
safekey init --vault ./my-project-secrets.json
```

You'll be prompted to create a master password. Choose a strong password - this encrypts all your secrets!

### 2. Add Your First Secret

```bash
# Add a secret
safekey add API_KEY

# Add with description
safekey add DB_PASSWORD --description "Production database password"
```

### 3. Retrieve Secrets

```bash
# Get a secret (interactive menu)
safekey get API_KEY

# Copy directly to clipboard
safekey get API_KEY --copy

# Show value in terminal
safekey get API_KEY --show
```

### 4. List All Secrets

```bash
# Simple list
safekey list

# Detailed view
safekey list --verbose

# JSON output
safekey list --format json
```

### 5. Export/Import

```bash
# Export to .env file
safekey export --format env --output .env

# Export to JSON
safekey export --format json --output secrets.json

# Import from file
safekey import secrets.json
```

## Core Commands

| Command         | Description            | Example                       |
| --------------- | ---------------------- | ----------------------------- |
| `init`          | Initialize a new vault | `safekey init`                |
| `add <key>`     | Add a new secret       | `safekey add API_KEY`         |
| `get <key>`     | Retrieve a secret      | `safekey get API_KEY --copy`  |
| `list`          | List all secrets       | `safekey list --verbose`      |
| `remove <key>`  | Delete a secret        | `safekey remove OLD_KEY`      |
| `export`        | Export secrets         | `safekey export --format env` |
| `import <file>` | Import secrets         | `safekey import .env`         |

## Security Features

- **AES-256-GCM Encryption**: Military-grade encryption for your secrets
- **PBKDF2 Key Derivation**: 100,000 iterations for password-based encryption
- **Offline-First**: No cloud dependencies, your secrets stay local
- **Secure Memory**: Keys are wiped from memory when possible
- **Auto-clear Clipboard**: Clipboard is automatically cleared after 30 seconds

## Common Workflows

### Development Environment Setup

```bash
# Initialize project vault
safekey init --vault ./.secrets.json

# Add environment variables
safekey add DATABASE_URL
safekey add JWT_SECRET
safekey add STRIPE_API_KEY

# Export to .env for your app
safekey export --format env --output .env
```

### Team Secret Sharing

```bash
# Export encrypted secrets
safekey export --format json --output team-secrets.json

# Team member imports (after sharing the file + master password securely)
safekey import team-secrets.json
```

### Multiple Projects

```bash
# Create project-specific vaults
safekey init --vault ./project-a-secrets.json --profile project-a
safekey init --vault ./project-b-secrets.json --profile project-b

# Switch between projects
safekey add API_KEY --profile project-a
safekey get API_KEY --profile project-b
```

## Tips & Best Practices

1. **Strong Master Password**: Use a unique, strong password for your vault
2. **Regular Backups**: Export your vault regularly to a secure location
3. **Git Ignore**: Add `*.json` vault files to your `.gitignore`
4. **Separate Vaults**: Use different vaults for different environments/projects
5. **Clipboard Security**: Use `--copy` instead of `--show` when possible

## Troubleshooting

### Common Issues

**"Vault not found"**

```bash
# Initialize a vault first
safekey init
```

**"Invalid password"**

```bash
# Make sure you're using the correct master password
# If forgotten, you'll need to initialize a new vault
```

**"Permission denied"**

```bash
# Check file permissions
chmod 600 ~/.safekey-vault.json
```

### Need Help?

```bash
# Get help for any command
safekey help
safekey init --help
safekey add --help
```

## What's Next?

- Check out the full documentation in the main README
- Explore advanced features like profiles and custom vault locations
- Consider setting up automated exports for backup purposes

---

**Security Note**: Always keep your master password secure and never commit vault files to version control!
