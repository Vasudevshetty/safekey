# Installation Guide

SafeKey can be installed in multiple ways depending on your preference and setup. Choose the method that best fits your workflow.

## Prerequisites

- **Node.js 18.0.0 or higher** - SafeKey is built with modern Node.js features
- **npm or yarn** - For package management (comes with Node.js)

## Installation Methods

### 1. NPM Global Installation (Recommended)

The easiest way to install SafeKey is through npm:

```bash
npm install -g @vasudevshetty/safekey
```

After installation, verify it works:

```bash
safekey --version
```

#### Benefits

- ✅ Easy one-command installation
- ✅ Automatic updates with `npm update -g @vasudevshetty/safekey`
- ✅ Available system-wide

### 2. From Source

For the latest features or to contribute to development:

```bash
# Clone the repository
git clone https://github.com/Vasudevshetty/safekey.git
cd safekey

# Install dependencies
npm install

# Build the project
npm run build

# Link for global usage
npm link
```

#### Benefits

- ✅ Latest development features
- ✅ Easy to modify and contribute
- ✅ Full source code access

### 3. Yarn Installation

If you prefer Yarn as your package manager:

```bash
# Global installation
yarn global add @vasudevshetty/safekey

# Verify installation
safekey --version
```

### 4. Using npx (No Installation)

For occasional use or testing:

```bash
npx @vasudevshetty/safekey --version
npx @vasudevshetty/safekey init
```

#### Benefits

- ✅ No permanent installation required
- ✅ Always uses the latest version
- ✅ Great for CI/CD environments

## Platform-Specific Instructions

### Windows

1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Open Command Prompt or PowerShell as Administrator
3. Run the installation command:
   ```cmd
   npm install -g @vasudevshetty/safekey
   ```

### macOS

Using Homebrew (if you have Node.js via Homebrew):

```bash
# Install Node.js if not already installed
brew install node

# Install SafeKey
npm install -g @vasudevshetty/safekey
```

### Linux

Most distributions:

```bash
# Install Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install SafeKey
npm install -g @vasudevshetty/safekey
```

For other distributions, use your package manager to install Node.js first.

## Verification

After installation, verify that SafeKey is working correctly:

```bash
# Check version
safekey --version

# View help
safekey --help

# Test initialization (optional)
safekey init --help
```

You should see output similar to:

```
SafeKey v1.2.1 - Secure Secrets Manager CLI
```

## Shell Completion (Optional)

Enable tab completion for better CLI experience:

### Bash

Add to your `~/.bashrc`:

```bash
eval "$(safekey completion bash)"
```

### Zsh

Add to your `~/.zshrc`:

```bash
eval "$(safekey completion zsh)"
```

### PowerShell (Windows)

Add to your PowerShell profile:

```powershell
Invoke-Expression (safekey completion powershell)
```

## Troubleshooting Installation

### Permission Errors (Linux/macOS)

If you encounter permission errors, don't use `sudo` with npm. Instead, configure npm to install packages globally in your home directory:

```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

Then retry the installation:

```bash
npm install -g @vasudevshetty/safekey
```

### Node.js Version Issues

If you have an older version of Node.js:

```bash
# Check your version
node --version

# Update Node.js using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### PATH Issues

If `safekey` command is not found after installation:

1. Check where npm installs global packages:

   ```bash
   npm config get prefix
   ```

2. Add the bin directory to your PATH:

   ```bash
   export PATH="$(npm config get prefix)/bin:$PATH"
   ```

3. Make it permanent by adding to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.)

## Updating SafeKey

### NPM Installation

```bash
npm update -g @vasudevshetty/safekey
```

### Source Installation

```bash
cd safekey
git pull origin main
npm install
npm run build
```

## Uninstalling SafeKey

### NPM Installation

```bash
npm uninstall -g @vasudevshetty/safekey
```

### Source Installation

```bash
npm unlink
```

## Next Steps

Now that SafeKey is installed, you're ready to start using it! Check out the [Quick Start Guide](quick-start.md) to create your first vault and add some secrets.

For detailed information about all available commands, see the [CLI Reference](../cli-reference/basic-commands.md).
