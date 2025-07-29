# Encryption in SafeKey

SafeKey employs industry-standard cryptographic algorithms to ensure your secrets remain secure. This document explains the encryption mechanisms, key derivation, and security model used throughout the application.

## Encryption Overview

SafeKey uses **AES-256-GCM** (Advanced Encryption Standard with Galois/Counter Mode) for all secret encryption. This provides:

- **Confidentiality**: Data is encrypted and unreadable without the key
- **Integrity**: Tampering with encrypted data is detectable
- **Authentication**: Ensures data comes from a trusted source

## Key Derivation

### PBKDF2 Key Derivation

Your master password is never stored directly. Instead, SafeKey uses **PBKDF2** (Password-Based Key Derivation Function 2) to derive encryption keys:

```
Key = PBKDF2(password, salt, iterations, keyLength)
```

**Parameters:**

- **Algorithm**: PBKDF2 with SHA-256
- **Iterations**: 100,000 (configurable)
- **Salt**: 32 random bytes (unique per vault)
- **Key Length**: 256 bits (32 bytes)

### Salt Generation

Each vault has a unique 32-byte salt generated using a cryptographically secure random number generator. This ensures:

- **Unique keys** even with identical passwords
- **Protection against rainbow table attacks**
- **Vault isolation** - compromising one vault doesn't affect others

## Encryption Process

### Secret Encryption

Each secret undergoes the following encryption process:

1. **Key Derivation**: Master password + vault salt → encryption key
2. **IV Generation**: 12 random bytes for GCM mode
3. **Encryption**: Secret data encrypted with AES-256-GCM
4. **Authentication**: GMAC tag generated for integrity verification

```typescript
interface EncryptedSecret {
  iv: string; // Base64-encoded initialization vector
  data: string; // Base64-encoded encrypted data
  tag: string; // Base64-encoded authentication tag
  algorithm: 'AES-256-GCM';
}
```

### Vault Structure Encryption

The entire vault payload is encrypted as a single unit:

```
Vault File = Header + Encrypted(Payload)
```

**Header (Unencrypted):**

- Version information
- Salt (32 bytes)
- Key derivation parameters
- Vault metadata

**Payload (Encrypted):**

- All secrets and their metadata
- Team information
- Access logs
- Configuration settings

## Security Properties

### Forward Secrecy

When you change your master password:

- A new salt is generated
- A new encryption key is derived
- All secrets are re-encrypted with the new key
- Old encrypted data becomes inaccessible

### Memory Protection

SafeKey implements several memory protection mechanisms:

- **Immediate cleanup**: Sensitive data is overwritten after use
- **Minimal exposure**: Keys and decrypted data exist in memory only when needed
- **Secure random**: All random values use cryptographically secure generators

### Defense Against Attacks

#### Brute Force Protection

- High iteration count (100,000) makes password cracking expensive
- Unique salts prevent precomputed attacks
- Strong key derivation parameters resist GPU acceleration

#### Side-Channel Resistance

- Constant-time operations where possible
- Memory clearing after sensitive operations
- Protection against timing attacks

## Cloud Sync Security

### End-to-End Encryption

When using cloud sync, your data remains encrypted:

1. Vault is encrypted locally with your master password
2. Encrypted vault is uploaded to cloud provider
3. Cloud provider stores only encrypted data
4. During download, encrypted data is decrypted locally

**Cloud providers cannot:**

- Access your secrets
- Decrypt your vault
- See your master password
- View secret metadata

### Additional Cloud Protections

- **Transport encryption**: All uploads/downloads use HTTPS
- **Provider authentication**: API keys/tokens for cloud access
- **Conflict resolution**: Secure merging of concurrent changes

## Key Management Best Practices

### Master Password

Your master password is the cornerstone of vault security:

- **Strength**: Use a strong, unique password (minimum 12 characters)
- **Uniqueness**: Never reuse your SafeKey password elsewhere
- **Storage**: Consider using a password manager for the master password
- **Backup**: Ensure you have a secure backup method

### Password Rotation

Regular password rotation enhances security:

```bash
# Change master password (re-encrypts entire vault)
safekey vault change-password

# Backup before rotation
safekey export --file backup.json
```

### Multiple Vaults

Consider using separate vaults for different security domains:

- **Personal vault**: Personal secrets and credentials
- **Work vault**: Professional/corporate secrets
- **Project vaults**: Specific to individual projects
- **Team vaults**: Shared secrets with appropriate access controls

## Encryption Algorithms Detail

### AES-256-GCM Specifications

- **Block Size**: 128 bits
- **Key Size**: 256 bits
- **IV Size**: 96 bits (12 bytes)
- **Tag Size**: 128 bits (16 bytes)
- **Mode**: Galois/Counter Mode (GCM)

### PBKDF2 Specifications

- **Hash Function**: SHA-256
- **Iteration Count**: 100,000 (default, configurable)
- **Salt Length**: 256 bits (32 bytes)
- **Output Length**: 256 bits (32 bytes)

## Cryptographic Libraries

SafeKey uses well-established cryptographic libraries:

- **Node.js Crypto**: Built-in cryptographic functions
- **Web Crypto API**: For browser compatibility (future)
- **Audited implementations**: No custom crypto implementations

## Verification and Auditing

### Integrity Verification

Every vault operation includes integrity checks:

```bash
# Verify vault integrity
safekey vault verify

# Check for corruption
safekey vault check
```

### Audit Trail

Vault access and modifications are logged:

- **Access timestamps**: When secrets were accessed
- **Modification history**: What changed and when
- **Team operations**: Member additions/removals
- **Sync activities**: Cloud synchronization events

## Common Encryption Questions

### Q: Can SafeKey decrypt my vault if I forget my password?

**No.** SafeKey cannot recover your vault without the master password. The password is never transmitted or stored - it only exists in your memory and temporarily in your device's memory during operations.

### Q: How secure is AES-256-GCM?

AES-256-GCM is approved by NIST and used by government agencies for classified information. It provides both encryption and authentication in a single operation.

### Q: What happens if someone gets my vault file?

Without your master password, the vault file is cryptographically useless. An attacker would need to perform a brute-force attack against PBKDF2, which is computationally expensive with 100,000 iterations.

### Q: Is the encryption quantum-resistant?

AES-256 provides some resistance to quantum attacks due to its key size, but like all symmetric encryption, it would eventually be vulnerable to sufficiently powerful quantum computers. SafeKey will migrate to post-quantum cryptography as standards mature.

## Security Updates

SafeKey's encryption implementation is regularly reviewed and updated:

- **Algorithm updates**: As new standards emerge
- **Parameter tuning**: Iteration counts and key sizes
- **Vulnerability patches**: Prompt fixes for any discovered issues
- **Compliance**: Adherence to security best practices and standards

For the latest security information, check the [Security Policy](../../SECURITY.md) and monitor our [security advisories](https://github.com/Vasudevshetty/safekey/security/advisories).
