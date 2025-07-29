# Contributing to SafeKey

Thank you for your interest in contributing to SafeKey! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/safekey.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`
5. Make your changes and test them
6. Submit a pull request

## 📋 Prerequisites

- Node.js 16+ and npm
- Git
- TypeScript knowledge for core development
- Basic understanding of cryptography for security features

## 🎯 How to Contribute

### 🐛 Reporting Bugs

1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Include:
   - OS and Node.js version
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages/logs

### 💡 Suggesting Features

1. Check existing feature requests
2. Open an issue with the feature request template
3. Describe:
   - Use case and motivation
   - Proposed solution
   - Alternative solutions considered

### 🔧 Code Contributions

#### Available Issues

Check our [GitHub Issues](https://github.com/Vasudevshetty/safekey/issues) for contribution opportunities:

- **Good First Issue**: Perfect for new contributors
- **High Priority**: Core functionality gaps
- **Medium Priority**: Integrations and enhancements
- **Low Priority**: Quality of life improvements

#### Major Feature Areas Needing Implementation

1. **Vault Management** ([Issue #2](https://github.com/Vasudevshetty/safekey/issues/2))
   - Multiple vault support
   - Vault templates and inheritance
   - Advanced search and filtering

2. **Cloud Sync** ([Issue #3](https://github.com/Vasudevshetty/safekey/issues/3))
   - AWS S3, Azure Blob Storage
   - Conflict resolution
   - Offline mode

3. **Team Management** ([Issue #4](https://github.com/Vasudevshetty/safekey/issues/4))
   - Role-based access control
   - Audit logging
   - Team synchronization

4. **Security Enhancements** ([Issue #7](https://github.com/Vasudevshetty/safekey/issues/7))
   - Hardware security module support
   - Zero-knowledge architecture
   - Security auditing

5. **Integrations** ([Issue #11](https://github.com/Vasudevshetty/safekey/issues/11))
   - Docker, Kubernetes
   - CI/CD platforms
   - Development tools

## 🏗️ Development Setup

### Environment Setup

```bash
# Clone the repository
git clone https://github.com/Vasudevshetty/safekey.git
cd safekey

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start development mode
npm run dev
```

### Project Structure

```
src/
├── cli/           # Command-line interface
├── core/          # Core vault and crypto logic
├── cloud/         # Cloud synchronization
├── team/          # Team management
├── config/        # Configuration management
├── crypto/        # Cryptographic utilities
├── tui/           # Terminal user interface
└── utils/         # Shared utilities

tests/             # Test files
docs/              # Documentation
bin/               # Executable scripts
```

### Coding Standards

#### TypeScript Guidelines

- Use TypeScript strict mode
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Follow functional programming patterns where possible

#### Code Style

- Use ESLint and Prettier (configs provided)
- 2 spaces for indentation
- Semicolons required
- Single quotes for strings
- Trailing commas in objects/arrays

#### Testing

- Write tests for all new features
- Maintain >80% code coverage
- Use descriptive test names
- Test both success and error cases

```typescript
// Example test structure
describe('VaultManager', () => {
  it('should create a new vault with encryption', async () => {
    // Test implementation
  });

  it('should throw error for invalid vault name', async () => {
    // Error case testing
  });
});
```

## 🔐 Security Considerations

### Cryptographic Standards

- Use only well-established algorithms (AES-256, PBKDF2, etc.)
- Never store passwords in plaintext
- Implement secure key derivation
- Follow OWASP guidelines

### Security Review Process

1. All crypto-related changes require security review
2. Sensitive functions must have comprehensive tests
3. Document security assumptions and threat models
4. Consider side-channel attacks and timing issues

## 📝 Documentation

### Code Documentation

- Use JSDoc for all public functions
- Include examples in documentation
- Document complex algorithms and security considerations

````typescript
/**
 * Encrypts data using AES-256-GCM with a derived key
 * @param data - The plaintext data to encrypt
 * @param password - The master password for key derivation
 * @returns Promise resolving to encrypted data with metadata
 * @example
 * ```typescript
 * const encrypted = await encryptData("secret", "password123");
 * ```
 */
async function encryptData(
  data: string,
  password: string
): Promise<EncryptedData>;
````

### Documentation Updates

- Update relevant docs when adding features
- Keep CLI help text current
- Update troubleshooting guides for new error cases

## 🧪 Testing Guidelines

### Test Categories

1. **Unit Tests**: Individual functions and classes
2. **Integration Tests**: Component interactions
3. **CLI Tests**: Command-line interface testing
4. **Security Tests**: Cryptographic function validation

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- vault.test.ts

# Run tests in watch mode
npm run test:watch
```

## 📦 Pull Request Process

### Before Submitting

1. ✅ Code follows style guidelines
2. ✅ Tests pass locally
3. ✅ Documentation updated
4. ✅ No merge conflicts
5. ✅ Commit messages are clear

### PR Checklist

- [ ] Descriptive title and description
- [ ] Links to related issues
- [ ] Screenshots for UI changes
- [ ] Breaking changes documented
- [ ] Security implications considered

### Review Process

1. Automated checks must pass
2. Code review by maintainers
3. Security review for sensitive changes
4. Final approval and merge

## 🎨 UI/UX Guidelines (for TUI)

### Terminal Interface

- Use consistent color scheme
- Provide clear navigation
- Include helpful shortcuts
- Show progress for long operations
- Handle terminal resizing gracefully

### User Experience

- Minimize required keystrokes
- Provide meaningful error messages
- Include contextual help
- Support both mouse and keyboard
- Follow terminal application conventions

## 🌍 Community

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: General questions and ideas
- **Security Issues**: Use private security reporting

### Code of Conduct

We follow the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Please be respectful and inclusive in all interactions.

## 🏷️ Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes

### Release Workflow

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release tag
4. Publish to npm
5. Update documentation site

## 🙏 Recognition

Contributors will be:

- Added to the contributors list
- Mentioned in release notes
- Credited in documentation (for significant contributions)

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- [Semantic Versioning](https://semver.org/)

## ❓ Questions?

If you have questions not covered here:

1. Check existing GitHub discussions
2. Open a new discussion
3. Reach out to maintainers

Thank you for contributing to SafeKey! 🔐✨
