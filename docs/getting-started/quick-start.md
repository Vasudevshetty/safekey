# Quick Start Guide

Get up and running with SafeKey in just a few minutes. This guide will walk you through the essential steps to start managing your secrets securely.

## Step 1: Initialize Your First Vault

A vault is where SafeKey stores all your encrypted secrets. Let's create your first one:

```bash
safekey init
```

You'll be prompted to:

1. **Choose a vault location** (press Enter for default)
2. **Create a master password** (choose something strong!)

```
🛡️  SafeKey: Secure Secrets Manager CLI

? Vault file path: (./secrets.vault)
? Master password: [hidden]
? Confirm master password: [hidden]

✅ Vault initialized successfully!
✅ Vault location: /home/user/secrets.vault
```

> **💡 Pro Tip**: Use a strong, unique master password. This encrypts all your secrets, so make it memorable but secure.

## Step 2: Add Your First Secret

Now let's add a secret to your vault:

```bash
safekey add API_KEY
```

SafeKey will prompt you for the secret value:

```
? Enter value for API_KEY: [hidden]
? Description (optional): Production API key for service X
? Tags (comma-separated, optional): api, production

✅ Secret 'API_KEY' added successfully!
```

### Adding Multiple Secrets

Add a few more secrets to get comfortable:

```bash
# Database password
safekey add DB_PASSWORD

# AWS credentials
safekey add AWS_ACCESS_KEY_ID
safekey add AWS_SECRET_ACCESS_KEY

# API endpoints
safekey add STRIPE_SECRET_KEY
```

## Step 3: Retrieve Secrets

Get a secret value (copies to clipboard by default):

```bash
safekey get API_KEY
```

```
✅ Secret 'API_KEY' copied to clipboard!
   Expires in 30 seconds for security.
```

### View Without Copying

To display the secret in terminal (less secure):

```bash
safekey get API_KEY --show
```

## Step 4: List Your Secrets

See all secrets in your vault:

```bash
safekey list
```

```
📋 Secrets in vault:

┌─────────────────────┬─────────────────────────┬──────────────┬─────────────────────┐
│ Key                 │ Description             │ Tags         │ Last Modified       │
├─────────────────────┼─────────────────────────┼──────────────┼─────────────────────┤
│ API_KEY            │ Production API key...   │ api, prod    │ 2025-01-29 10:30   │
│ DB_PASSWORD        │ Main database password  │ database     │ 2025-01-29 10:32   │
│ AWS_ACCESS_KEY_ID  │ AWS access credentials  │ aws, cloud   │ 2025-01-29 10:33   │
│ AWS_SECRET_ACCESS_KEY │ AWS secret key       │ aws, cloud   │ 2025-01-29 10:34   │
│ STRIPE_SECRET_KEY  │ Stripe API secret       │ payments     │ 2025-01-29 10:35   │
└─────────────────────┴─────────────────────────┴──────────────┴─────────────────────┘

Total: 5 secrets
```

## Step 5: Search and Filter

Find secrets quickly:

```bash
# Search by name
safekey list --search aws

# Filter by tags
safekey list --tags production,api

# Show only keys (no table)
safekey list --keys-only
```

## Step 6: Update or Remove Secrets

### Update a Secret

```bash
safekey add API_KEY  # Will prompt to update existing secret
```

### Remove a Secret

```bash
safekey remove API_KEY
```

```
? Are you sure you want to remove 'API_KEY'? (y/N) y
✅ Secret 'API_KEY' removed successfully!
```

## Essential Commands Summary

Here are the commands you'll use most often:

| Command                | Purpose                | Example                  |
| ---------------------- | ---------------------- | ------------------------ |
| `safekey init`         | Initialize a new vault | `safekey init`           |
| `safekey add <key>`    | Add or update a secret | `safekey add API_KEY`    |
| `safekey get <key>`    | Retrieve a secret      | `safekey get API_KEY`    |
| `safekey list`         | List all secrets       | `safekey list`           |
| `safekey remove <key>` | Remove a secret        | `safekey remove API_KEY` |

## Working with Multiple Vaults

You can have multiple vaults for different projects or environments:

```bash
# Create a vault for a specific project
safekey init --vault ./project-a-secrets.vault

# Use a specific vault
safekey add API_KEY --vault ./project-a-secrets.vault
safekey get API_KEY --vault ./project-a-secrets.vault
```

## Environment Integration

### Loading Secrets in Scripts

SafeKey makes it easy to use secrets in your applications:

```bash
# Export to environment variables
export API_KEY=$(safekey get API_KEY --output raw)

# Use in Node.js scripts
node -e "process.env.API_KEY = '$(safekey get API_KEY --output raw)'; require('./app.js')"

# Use in shell scripts
#!/bin/bash
API_KEY=$(safekey get API_KEY --output raw)
curl -H "Authorization: Bearer $API_KEY" https://api.example.com/
```

### .env File Generation

Generate .env files from your vault:

```bash
# Export all secrets to .env
safekey export --format env --output .env

# Export specific tags
safekey export --format env --tags development --output .env.development
```

## Security Best Practices

1. **Use strong master passwords** - Your vault is only as secure as your master password
2. **Don't share vault files directly** - Use SafeKey's team features instead
3. **Regular backups** - Keep encrypted backups of your vault file
4. **Audit access** - Use `safekey audit` to review vault access logs
5. **Lock when done** - Vaults auto-lock after inactivity for security

## Next Steps

Now that you're comfortable with the basics, explore more advanced features:

- **[Team Collaboration](../guides/team-setup.md)** - Share vaults securely with team members
- **[Cloud Sync](../guides/cloud-setup.md)** - Sync vaults across devices using cloud providers
- **[Configuration](../advanced/configuration.md)** - Customize SafeKey's behavior
- **[CLI Reference](../cli-reference/basic-commands.md)** - Complete command documentation

## Getting Help

- Run `safekey help` for built-in help
- Use `safekey <command> --help` for command-specific help
- Check the [FAQ](../troubleshooting/faq.md) for common questions
- Visit [GitHub Issues](https://github.com/Vasudevshetty/safekey/issues) for support

Happy secret managing! 🛡️
