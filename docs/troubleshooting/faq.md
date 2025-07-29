# Frequently Asked Questions

## General Questions

### What is SafeKey?

SafeKey is a secure, offline-first secrets manager CLI built specifically for developers. It provides military-grade encryption (AES-256-GCM) to protect your API keys, passwords, and other sensitive data while maintaining a developer-friendly experience.

### How is SafeKey different from other password managers?

SafeKey is designed specifically for developers with features like:

- **CLI-first interface** for seamless terminal integration
- **Offline-first architecture** - no internet required for core functionality
- **Team collaboration** with secure vault sharing
- **Development workflow integration** - easy to use in scripts and CI/CD
- **Multiple output formats** for different use cases

### Is SafeKey secure?

Yes, SafeKey uses industry-standard security practices:

- **AES-256-GCM encryption** for all data
- **PBKDF2 key derivation** with configurable iterations
- **Secure random salt generation** for each vault
- **Local encryption only** - your master password never leaves your device
- **Open source** for transparency and security audits

## Installation & Setup

### What are the system requirements?

- **Node.js 18.0.0 or higher**
- **npm or yarn** for package management
- **Operating System**: Windows, macOS, or Linux

### How do I install SafeKey?

The easiest way is through npm:

```bash
npm install -g @vasudevshetty/safekey
```

For other installation methods, see our [Installation Guide](../getting-started/installation.md).

### Can I use SafeKey without installing it globally?

Yes, you can use `npx` to run SafeKey without installing:

```bash
npx @vasudevshetty/safekey init
```

### How do I update SafeKey?

For npm installations:

```bash
npm update -g @vasudevshetty/safekey
```

For source installations:

```bash
cd safekey
git pull origin main
npm install
npm run build
```

## Usage & Configuration

### Where are my secrets stored?

Secrets are stored in encrypted vault files (`.vault` extension) on your local file system. By default, SafeKey creates `secrets.vault` in your current directory, but you can specify any location.

### Can I have multiple vaults?

Yes! You can create multiple vaults for different projects, environments, or teams:

```bash
safekey init --vault ./project-a.vault
safekey init --vault ./production.vault
safekey init --vault ./team-shared.vault
```

### How do I use a different vault?

Specify the vault path with the `--vault` option:

```bash
safekey add API_KEY --vault ./production.vault
safekey get API_KEY --vault ./production.vault
```

Or set the default vault:

```bash
export SAFEKEY_VAULT=./production.vault
safekey add API_KEY  # Uses production.vault
```

### What happens if I forget my master password?

Unfortunately, there's no way to recover your master password or decrypt your vault without it. This is by design for maximum security. Your options are:

1. Restore from an unencrypted backup (if you made one)
2. Use team recovery if the vault has other members
3. Start fresh with a new vault

### How long do secrets stay in the clipboard?

By default, secrets are automatically cleared from the clipboard after 30 seconds for security. You can disable this with:

```bash
safekey get API_KEY --no-expire
```

## Security & Best Practices

### Is it safe to store the vault file in version control?

The vault file itself is encrypted and safe to store in version control. However, consider:

- **Don't commit the master password** anywhere
- **Use `.gitignore`** for local development vaults
- **Consider team vaults** for shared repositories
- **Regular backups** are still recommended

### What makes a good master password?

A strong master password should be:

- **At least 12 characters long**
- **Mix of uppercase, lowercase, numbers, and symbols**
- **Not a common password** (SafeKey checks against known breaches)
- **Unique to this vault** - don't reuse passwords
- **Memorable but secure** - consider using a passphrase

### How often should I change my master password?

There's no need to change your master password regularly unless:

- You suspect it's been compromised
- You want to revoke access for former team members
- You're required by company policy

### Should I backup my vault?

Yes! Regular backups are essential:

```bash
# Simple file copy
cp secrets.vault secrets.vault.backup

# Export to encrypted format
safekey export --format encrypted --output backup.enc

# Automated backup with timestamp
safekey backup --output secrets-$(date +%Y%m%d).vault
```

## Team Collaboration

### How do I share a vault with my team?

1. Initialize a team vault:

   ```bash
   safekey init --team --vault ./team-secrets.vault
   ```

2. Invite team members:

   ```bash
   safekey team invite user@example.com --role editor
   ```

3. Share the vault file securely with your team

### What are the different team roles?

- **Owner**: Full access, can manage team members and vault settings
- **Editor**: Can add, modify, and remove secrets
- **Viewer**: Can only view and retrieve secrets
- **Auditor**: Can view secrets and access audit logs

### Can I see who accessed my secrets?

Yes, SafeKey maintains audit logs for team vaults:

```bash
safekey audit
safekey audit --secret API_KEY
safekey audit --user user@example.com
```

## Cloud Sync

### Which cloud providers are supported?

SafeKey supports:

- **GitHub Gist** (free and easy setup)
- **AWS S3** (scalable and reliable)
- **Azure Blob Storage** (enterprise-friendly)

### Is my data secure in the cloud?

Yes, your vault is encrypted locally before being uploaded to any cloud provider. The cloud provider only sees encrypted data and cannot access your secrets.

### How do I set up cloud sync?

1. Configure your provider:

   ```bash
   safekey cloud setup github-gist
   # Follow the prompts to authenticate
   ```

2. Enable sync for your vault:

   ```bash
   safekey sync enable --provider github-gist
   ```

3. Sync your vault:
   ```bash
   safekey sync push
   safekey sync pull
   ```

### What happens if there's a sync conflict?

SafeKey will detect conflicts and provide options to resolve them:

```bash
safekey sync resolve
# Choose: keep local, keep remote, or merge manually
```

## Troubleshooting

### SafeKey command not found

This usually means SafeKey isn't in your PATH. Try:

1. Reinstall with `npm install -g @vasudevshetty/safekey`
2. Check your npm global bin directory: `npm config get prefix`
3. Add the bin directory to your PATH

### Cannot access vault file

Check that:

- The vault file exists and you have read/write permissions
- You're in the correct directory or using the right `--vault` path
- The file isn't locked by another process

### Authentication failed

- Double-check your master password
- Ensure you're using the correct vault file
- Try unlocking manually: `safekey unlock`

### Vault appears corrupted

1. First, try to verify the vault:

   ```bash
   safekey verify --vault ./secrets.vault
   ```

2. If verification fails, restore from backup:

   ```bash
   cp secrets.vault.backup secrets.vault
   ```

3. If no backup exists, try repair:
   ```bash
   safekey repair --vault ./secrets.vault
   ```

### Performance issues with large vaults

- Consider splitting large vaults by project or environment
- Reduce key derivation iterations if security allows
- Use SSD storage for better I/O performance

## Integration & Development

### How do I use SafeKey in scripts?

Use the `--output raw` flag to get plain text output:

```bash
#!/bin/bash
API_KEY=$(safekey get API_KEY --output raw)
curl -H "Authorization: Bearer $API_KEY" https://api.example.com/
```

### Can I generate .env files from my vault?

Yes, use the export command:

```bash
# Export all secrets
safekey export --format env --output .env

# Export specific tags
safekey export --format env --tags development --output .env.dev
```

### How do I integrate with CI/CD?

1. Store the vault file in your repository (it's encrypted)
2. Store the master password as a CI secret
3. Use SafeKey in your build scripts:
   ```bash
   export SAFEKEY_MASTER_PASSWORD="$VAULT_PASSWORD"
   API_KEY=$(safekey get API_KEY --output raw)
   ```

### Is there an API or library I can use?

SafeKey is primarily a CLI tool, but you can:

- Use the CLI from any language that can execute shell commands
- Import SafeKey's TypeScript modules in Node.js projects
- Use the REST API (if running SafeKey server mode)

## Getting Help

### Where can I get support?

- **Documentation**: Check our comprehensive [docs](../getting-started/introduction.md)
- **GitHub Issues**: Report bugs or request features at [github.com/Vasudevshetty/safekey/issues](https://github.com/Vasudevshetty/safekey/issues)
- **Community**: Join discussions in GitHub Discussions
- **Built-in help**: Use `safekey help` or `safekey <command> --help`

### How do I report a security issue?

For security vulnerabilities, please:

1. **Don't open a public issue**
2. **Email security@safekey.dev** with details
3. **Use GPG encryption** if possible (key available on our website)
4. **Allow reasonable time** for us to respond and fix the issue

### How can I contribute?

We welcome contributions! See our [Contributing Guide](https://github.com/Vasudevshetty/safekey/blob/main/CONTRIBUTING.md) for:

- Code contributions
- Documentation improvements
- Bug reports and feature requests
- Community support
