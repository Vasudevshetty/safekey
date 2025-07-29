# Utilities

SafeKey provides a comprehensive set of utility classes and functions to support common operations, data manipulation, and helper functionalities. This guide covers all available utilities with examples and best practices.

## Overview

SafeKey utilities are organized into the following categories:

- **Password utilities**: Generation and validation
- **Cryptographic utilities**: Hashing, random generation, and crypto helpers
- **Validation utilities**: Input validation and data verification
- **File utilities**: File operations and path handling
- **Data utilities**: Serialization, conversion, and formatting
- **Time utilities**: Date/time operations and scheduling
- **Network utilities**: HTTP clients and connectivity helpers
- **Configuration utilities**: Config management and environment handling

## Password Utilities

### PasswordGenerator

Generates secure passwords with customizable criteria.

```typescript
import { PasswordGenerator } from '@vasudevshetty/safekey/utils';

const generator = new PasswordGenerator();

// Basic password generation
const password = generator.generate();
console.log(password); // Random 16-character password

// Custom password generation
const customPassword = generator.generate({
  length: 24,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: true,
  excludeSimilar: true,
  customCharacters: '!@#$%^&*',
});

// Memorable password generation
const memorablePassword = generator.generateMemorable({
  wordCount: 4,
  separator: '-',
  includeNumbers: true,
  capitalize: true,
});
// Example: "Horse-Battery-Staple-123"

// Passphrase generation
const passphrase = generator.generatePassphrase({
  wordCount: 6,
  minWordLength: 4,
  maxWordLength: 8,
  separator: ' ',
  includeNumbers: false,
});
```

#### PasswordGeneratorOptions

```typescript
interface PasswordGeneratorOptions {
  length?: number; // Password length (default: 16)
  includeUppercase?: boolean; // Include A-Z (default: true)
  includeLowercase?: boolean; // Include a-z (default: true)
  includeNumbers?: boolean; // Include 0-9 (default: true)
  includeSymbols?: boolean; // Include symbols (default: true)
  excludeAmbiguous?: boolean; // Exclude 0,O,l,1,etc (default: false)
  excludeSimilar?: boolean; // Exclude similar chars (default: false)
  customCharacters?: string; // Custom character set
  minLength?: number; // Minimum length
  maxLength?: number; // Maximum length
  pattern?: RegExp; // Must match pattern
}
```

### PasswordValidator

Validates password strength and compliance with policies.

```typescript
import { PasswordValidator } from '@vasudevshetty/safekey/utils';

const validator = new PasswordValidator();

// Basic validation
const result = validator.validate('myPassword123!');
console.log(`Valid: ${result.isValid}`);
console.log(`Score: ${result.score}/100`);
console.log(`Strength: ${result.strength}`); // weak, fair, good, strong

// Custom validation rules
const customValidator = new PasswordValidator({
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
  forbiddenPatterns: [/password/i, /123456/],
  forbiddenWords: ['password', 'admin', 'user'],
  maxRepeatingChars: 2,
  checkCommonPasswords: true,
  checkPwnedPasswords: false, // Requires network call
});

const customResult = validator.validate(
  'SuperSecure123!',
  customValidator.options
);

// Get detailed feedback
if (!customResult.isValid) {
  console.log('Validation errors:');
  customResult.errors.forEach((error) => console.log(`- ${error}`));
}

// Check password age and rotation needs
const rotationCheck = validator.checkRotationNeeded('password', {
  lastChanged: new Date('2024-01-01'),
  maxAge: 90, // days
});

if (rotationCheck.needsRotation) {
  console.log(
    `Password should be rotated (age: ${rotationCheck.ageDays} days)`
  );
}
```

## Cryptographic Utilities

### CryptoUtils

Provides cryptographic operations and utilities.

```typescript
import { CryptoUtils } from '@vasudevshetty/safekey/utils';

// Hash operations
const sha256Hash = CryptoUtils.sha256('data to hash');
const sha512Hash = CryptoUtils.sha512('data to hash');
const md5Hash = CryptoUtils.md5('data to hash'); // Not recommended for security

// HMAC operations
const hmac = CryptoUtils.hmac('data', 'secret-key', 'sha256');

// Random data generation
const randomBytes = CryptoUtils.randomBytes(32);
const randomString = CryptoUtils.randomString(16);
const randomHex = CryptoUtils.randomHex(32);
const randomBase64 = CryptoUtils.randomBase64(32);

// UUID generation
const uuid4 = CryptoUtils.uuid4();
const uuid5 = CryptoUtils.uuid5('namespace', 'name');

// Secure comparison
const isEqual = CryptoUtils.timingSafeEqual(buffer1, buffer2);

// Encoding/decoding
const base64Encoded = CryptoUtils.base64Encode('data');
const base64Decoded = CryptoUtils.base64Decode(base64Encoded);
const hexEncoded = CryptoUtils.hexEncode(buffer);
const hexDecoded = CryptoUtils.hexDecode(hexEncoded);

// Key derivation
const derivedKey = await CryptoUtils.pbkdf2('password', 'salt', 100000, 32);
const scryptKey = await CryptoUtils.scrypt('password', 'salt', 32);

// Encryption helpers
const encryptionKey = CryptoUtils.generateEncryptionKey();
const keyPair = await CryptoUtils.generateKeyPair('rsa', 2048);
```

### SecureRandom

Cryptographically secure random number generation.

```typescript
import { SecureRandom } from '@vasudevshetty/safekey/utils';

const random = new SecureRandom();

// Random integers
const randomInt = random.nextInt(); // 0 to 2^32-1
const randomIntRange = random.nextIntRange(1, 100); // 1 to 100
const randomBigInt = random.nextBigInt(64); // 64-bit random number

// Random floats
const randomFloat = random.nextFloat(); // 0.0 to 1.0
const randomFloatRange = random.nextFloatRange(0.0, 10.0);

// Random booleans
const randomBool = random.nextBoolean();
const weightedBool = random.nextBooleanWeighted(0.7); // 70% chance of true

// Random choices
const fruits = ['apple', 'banana', 'cherry'];
const randomFruit = random.choice(fruits);
const multipleChoices = random.choices(fruits, 3); // Pick 3 with replacement
const sample = random.sample(fruits, 2); // Pick 2 without replacement

// Shuffle operations
const shuffled = random.shuffle([...fruits]);
random.shuffleInPlace(fruits); // Modifies original array

// Random sampling
const gaussianRandom = random.gaussian(0, 1); // Mean=0, StdDev=1
const exponentialRandom = random.exponential(1.0);
```

## Validation Utilities

### SecretValidator

Validates secret values and metadata according to policies.

```typescript
import { SecretValidator } from '@vasudevshetty/safekey/utils';

const validator = new SecretValidator();

// Validate secret value
const secret = {
  name: 'API_KEY',
  value: 'sk-1234567890abcdef',
  metadata: {
    type: 'api_key',
    sensitivity: 'high',
    tags: ['production', 'api'],
  },
};

const validation = validator.validate(secret);

if (!validation.isValid) {
  console.log('Validation errors:');
  validation.errors.forEach((error) => console.log(`- ${error.message}`));
}

// Custom validation rules
const customValidator = new SecretValidator({
  namePattern: /^[A-Z_][A-Z0-9_]*$/,
  valueMinLength: 8,
  valueMaxLength: 1024,
  requiredTags: ['environment'],
  forbiddenPatterns: [/password123/i],
  allowedTypes: ['api_key', 'token', 'password'],
  sensitivityLevels: ['low', 'medium', 'high', 'critical'],
});

// Validate specific aspects
const nameValid = validator.validateName('API_KEY');
const valueValid = validator.validateValue('secret-value');
const typeValid = validator.validateType('api_key');
const tagsValid = validator.validateTags(['production', 'api']);

// Security validation
const securityCheck = validator.validateSecurity(secret);
if (securityCheck.hasWeaknesses) {
  console.log('Security issues found:');
  securityCheck.weaknesses.forEach((w) => console.log(`- ${w}`));
}
```

### InputValidator

General input validation utilities.

```typescript
import { InputValidator } from '@vasudevshetty/safekey/utils';

const validator = new InputValidator();

// Email validation
const isValidEmail = validator.isEmail('user@example.com');

// URL validation
const isValidUrl = validator.isUrl('https://example.com');

// Path validation
const isValidPath = validator.isPath('/home/user/vault.safekey');
const isSafePath = validator.isSafePath('/home/user/vault.safekey'); // No path traversal

// Format validation
const isValidUuid = validator.isUuid('123e4567-e89b-12d3-a456-426614174000');
const isValidBase64 = validator.isBase64('SGVsbG8gV29ybGQ=');
const isValidHex = validator.isHex('48656c6c6f20576f726c64');

// String validation
const isEmpty = validator.isEmpty('  '); // true
const isAlphaNumeric = validator.isAlphaNumeric('abc123');
const isAscii = validator.isAscii('Hello World');

// Sanitization
const sanitized = validator.sanitize('<script>alert("xss")</script>');
const escaped = validator.escape('user"input');
const normalized = validator.normalize('  MIXED case  '); // "mixed case"

// Custom validation
const customRule = validator.custom(
  /^SK-[A-Z0-9]{16}$/,
  'Invalid API key format'
);
const isValidApiKey = customRule('SK-ABC123DEF456GHI7');
```

## File Utilities

### FileUtils

File and directory operations with security considerations.

```typescript
import { FileUtils } from '@vasudevshetty/safekey/utils';

// File existence and type checking
const exists = await FileUtils.exists('/path/to/file');
const isFile = await FileUtils.isFile('/path/to/file');
const isDirectory = await FileUtils.isDirectory('/path/to/dir');
const isReadable = await FileUtils.isReadable('/path/to/file');
const isWritable = await FileUtils.isWritable('/path/to/file');

// Safe file operations
const content = await FileUtils.readTextFile('/path/to/file');
const jsonData = await FileUtils.readJsonFile('/path/to/config.json');
const buffer = await FileUtils.readBinaryFile('/path/to/vault.safekey');

await FileUtils.writeTextFile('/path/to/output.txt', content);
await FileUtils.writeJsonFile('/path/to/config.json', data);
await FileUtils.writeBinaryFile('/path/to/vault.safekey', buffer);

// Atomic operations (write to temp file, then rename)
await FileUtils.writeTextFileAtomic('/path/to/important.txt', content);

// Directory operations
await FileUtils.ensureDirectory('/path/to/dir');
const files = await FileUtils.listFiles('/path/to/dir', {
  recursive: true,
  pattern: '*.safekey',
  includeHidden: false,
});

// File metadata
const stats = await FileUtils.getStats('/path/to/file');
console.log(`Size: ${stats.size} bytes`);
console.log(`Modified: ${stats.mtime}`);

// Secure file operations
await FileUtils.secureDelete('/path/to/sensitive-file');
const tempFile = await FileUtils.createTempFile('safekey-', '.tmp');
const tempDir = await FileUtils.createTempDirectory('safekey-work-');

// File locking
const lock = await FileUtils.lockFile('/path/to/vault.safekey');
try {
  // Perform operations while file is locked
} finally {
  await lock.release();
}

// Path utilities
const absolutePath = FileUtils.resolvePath('~/vault.safekey');
const safePath = FileUtils.sanitizePath('../../etc/passwd'); // Prevents traversal
const relativePath = FileUtils.relativePath('/base', '/base/sub/file');
const normalizedPath = FileUtils.normalizePath('/path//to/../file');
```

### PathUtils

Path manipulation and validation utilities.

```typescript
import { PathUtils } from '@vasudevshetty/safekey/utils';

// Path construction
const vaultPath = PathUtils.join(
  PathUtils.homeDir(),
  '.safekey',
  'vault.safekey'
);
const configPath = PathUtils.join(
  PathUtils.configDir(),
  'safekey',
  'config.yaml'
);

// Path information
const dirname = PathUtils.dirname('/path/to/file.txt'); // '/path/to'
const basename = PathUtils.basename('/path/to/file.txt'); // 'file.txt'
const extname = PathUtils.extname('/path/to/file.txt'); // '.txt'

// Platform-specific paths
const homeDir = PathUtils.homeDir();
const configDir = PathUtils.configDir();
const tempDir = PathUtils.tempDir();
const currentDir = PathUtils.currentDir();

// Path validation
const isAbsolute = PathUtils.isAbsolute('/absolute/path');
const isSafe = PathUtils.isSafePath('user/vault.safekey'); // No traversal
const isWithin = PathUtils.isWithinDirectory('/safe/dir', '/safe/dir/file');

// Glob pattern matching
const matches = PathUtils.glob('/path/**/*.safekey');
const isMatch = PathUtils.isGlobMatch('/path/vault.safekey', '**/*.safekey');
```

## Data Utilities

### Serialization

Data serialization and deserialization utilities.

```typescript
import { Serialization } from '@vasudevshetty/safekey/utils';

// JSON operations with error handling
const jsonString = Serialization.toJson(data, { pretty: true });
const parsed = Serialization.fromJson(jsonString);

// Safe JSON parsing
const safeResult = Serialization.safeFromJson(invalidJson);
if (safeResult.success) {
  console.log(safeResult.data);
} else {
  console.error(safeResult.error);
}

// YAML operations
const yamlString = Serialization.toYaml(data);
const yamlData = Serialization.fromYaml(yamlString);

// Binary serialization
const buffer = Serialization.toBinary(data);
const restored = Serialization.fromBinary(buffer);

// CSV operations
const csvString = Serialization.toCsv(arrayData, {
  headers: ['name', 'value', 'description'],
  delimiter: ',',
  quote: '"',
});
const csvData = Serialization.fromCsv(csvString);

// Custom serialization with encryption
const encrypted = await Serialization.toEncryptedJson(data, encryptionKey);
const decrypted = await Serialization.fromEncryptedJson(
  encrypted,
  encryptionKey
);
```

### DataTransform

Data transformation and manipulation utilities.

```typescript
import { DataTransform } from '@vasudevshetty/safekey/utils';

// Array operations
const chunked = DataTransform.chunk([1, 2, 3, 4, 5], 2); // [[1,2], [3,4], [5]]
const flattened = DataTransform.flatten([
  [1, 2],
  [3, 4],
]); // [1, 2, 3, 4]
const unique = DataTransform.unique([1, 2, 2, 3, 3, 3]); // [1, 2, 3]
const grouped = DataTransform.groupBy(objects, 'category');

// Object operations
const picked = DataTransform.pick(object, ['key1', 'key2']);
const omitted = DataTransform.omit(object, ['unwanted']);
const mapped = DataTransform.mapValues(object, (value) => value.toString());
const deep = DataTransform.deepClone(complexObject);

// String operations
const camelCase = DataTransform.toCamelCase('snake_case_string');
const snakeCase = DataTransform.toSnakeCase('camelCaseString');
const kebabCase = DataTransform.toKebabCase('PascalCaseString');
const titleCase = DataTransform.toTitleCase('lowercase string');

// Type conversion
const strings = DataTransform.toStringArray([1, 2, 3]); // ['1', '2', '3']
const numbers = DataTransform.toNumberArray(['1', '2', '3']); // [1, 2, 3]
const booleans = DataTransform.toBooleanArray(['true', 'false']); // [true, false]

// Filtering and sorting
const filtered = DataTransform.filterTruthy([0, 1, null, 2, undefined, 3]);
const sorted = DataTransform.sortBy(objects, 'name');
const sortedDesc = DataTransform.sortBy(objects, 'age', 'desc');
```

## Time Utilities

### TimeUtils

Date and time manipulation utilities.

```typescript
import { TimeUtils } from '@vasudevshetty/safekey/utils';

// Current time
const now = TimeUtils.now();
const utcNow = TimeUtils.utcNow();
const timestamp = TimeUtils.timestamp();
const unixTime = TimeUtils.unixTimestamp();

// Formatting
const iso = TimeUtils.toISOString(date);
const formatted = TimeUtils.format(date, 'YYYY-MM-DD HH:mm:ss');
const relative = TimeUtils.relative(date); // "2 hours ago"

// Parsing
const parsed = TimeUtils.parse('2024-01-15 10:30:00');
const fromUnix = TimeUtils.fromUnixTimestamp(1642248600);
const fromIso = TimeUtils.fromISOString('2024-01-15T10:30:00Z');

// Date arithmetic
const tomorrow = TimeUtils.addDays(now, 1);
const lastWeek = TimeUtils.subtractWeeks(now, 1);
const inHour = TimeUtils.addHours(now, 1);

// Duration calculations
const duration = TimeUtils.duration(startDate, endDate);
const humanDuration = TimeUtils.humanizeDuration(duration); // "2 hours 30 minutes"
const milliseconds = TimeUtils.durationToMilliseconds('1h 30m');

// Timezone operations
const utc = TimeUtils.toUTC(localDate);
const local = TimeUtils.toLocal(utcDate);
const timezone = TimeUtils.toTimezone(date, 'America/New_York');

// Validation
const isValid = TimeUtils.isValidDate(dateString);
const isFuture = TimeUtils.isFuture(date);
const isPast = TimeUtils.isPast(date);
const isToday = TimeUtils.isToday(date);

// Age calculations
const age = TimeUtils.age(birthDate);
const ageInDays = TimeUtils.ageInDays(createdDate);
const isExpired = TimeUtils.isExpired(expirationDate);
```

### ScheduleUtils

Scheduling and cron-like utilities.

```typescript
import { ScheduleUtils } from '@vasudevshetty/safekey/utils';

// Cron parsing and validation
const isValidCron = ScheduleUtils.isValidCron('0 2 * * *');
const nextRun = ScheduleUtils.getNextRun('0 2 * * *'); // Next 2 AM
const nextRuns = ScheduleUtils.getNextRuns('0 */6 * * *', 5); // Next 5 runs

// Schedule description
const description = ScheduleUtils.describeCron('0 2 * * *'); // "At 2:00 AM every day"

// Custom intervals
const everyHour = ScheduleUtils.every('1h');
const everyMinute = ScheduleUtils.every('1m');
const daily = ScheduleUtils.daily('02:00');
const weekly = ScheduleUtils.weekly('monday', '09:00');

// Timezone-aware scheduling
const nextInTimezone = ScheduleUtils.getNextRunInTimezone(
  '0 9 * * 1-5', // 9 AM weekdays
  'America/New_York'
);
```

## Network Utilities

### HttpClient

HTTP client with SafeKey-specific features.

```typescript
import { HttpClient } from '@vasudevshetty/safekey/utils';

const client = new HttpClient({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'User-Agent': 'SafeKey/1.2.1',
  },
});

// Basic requests
const response = await client.get('/secrets');
const created = await client.post('/secrets', {
  name: 'API_KEY',
  value: 'secret',
});
const updated = await client.put('/secrets/API_KEY', { value: 'new-secret' });
const deleted = await client.delete('/secrets/API_KEY');

// With authentication
const authenticatedClient = client.withAuth({
  type: 'bearer',
  token: 'auth-token',
});

const protectedData = await authenticatedClient.get('/protected');

// File uploads
const formData = new FormData();
formData.append('vault', fileBuffer, 'vault.safekey');
const uploadResponse = await client.post('/upload', formData);

// Progress tracking
const downloadResponse = await client.get('/large-file', {
  onProgress: (loaded, total) => {
    console.log(`Downloaded: ${((loaded / total) * 100).toFixed(1)}%`);
  },
});

// Request/response interceptors
client.interceptors.request.use((config) => {
  config.headers['X-Request-ID'] = generateRequestId();
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Request failed:', error.message);
    throw error;
  }
);
```

### NetworkUtils

Network connectivity and utility functions.

```typescript
import { NetworkUtils } from '@vasudevshetty/safekey/utils';

// Connectivity checks
const isOnline = await NetworkUtils.isOnline();
const canReachHost = await NetworkUtils.canReach('github.com', 443);
const dnsLookup = await NetworkUtils.resolveHostname('example.com');

// Network information
const publicIp = await NetworkUtils.getPublicIP();
const localIps = await NetworkUtils.getLocalIPs();
const networkInterfaces = await NetworkUtils.getNetworkInterfaces();

// URL utilities
const isValidUrl = NetworkUtils.isValidUrl('https://example.com');
const parsedUrl = NetworkUtils.parseUrl(
  'https://user:pass@example.com:8080/path?q=1#frag'
);
const joinedUrl = NetworkUtils.joinUrl(
  'https://api.example.com',
  '/v1/secrets'
);

// Proxy handling
const proxyConfig = NetworkUtils.getProxyConfig();
const tunneledRequest = await NetworkUtils.throughProxy(
  requestConfig,
  proxyConfig
);

// Rate limiting
const rateLimiter = NetworkUtils.createRateLimiter({
  requests: 100,
  window: '1m',
});

await rateLimiter.acquire(); // Wait if rate limit exceeded
```

## Configuration Utilities

### ConfigUtils

Configuration management utilities.

```typescript
import { ConfigUtils } from '@vasudevshetty/safekey/utils';

// Environment variables
const config = ConfigUtils.fromEnvironment({
  DATABASE_URL: { required: true, type: 'string' },
  PORT: { default: 3000, type: 'number' },
  DEBUG: { default: false, type: 'boolean' },
  FEATURES: { type: 'array', separator: ',' },
});

// Configuration merging
const merged = ConfigUtils.merge(defaultConfig, userConfig, envConfig);

// Validation
const validated = ConfigUtils.validate(config, schema);
if (!validated.isValid) {
  console.error('Configuration errors:', validated.errors);
}

// Environment detection
const env = ConfigUtils.getEnvironment(); // development, production, test
const isDev = ConfigUtils.isDevelopment();
const isProd = ConfigUtils.isProduction();

// Configuration templates
const template = ConfigUtils.createTemplate({
  vault: {
    name: '${VAULT_NAME:default-vault}',
    path: '${VAULT_PATH:~/.safekey/vault.safekey}',
  },
});

const expanded = ConfigUtils.expandTemplate(template, process.env);
```

### EnvUtils

Environment variable utilities with type safety.

```typescript
import { EnvUtils } from '@vasudevshetty/safekey/utils';

// Type-safe environment variables
const config = {
  port: EnvUtils.getNumber('PORT', 3000),
  debug: EnvUtils.getBoolean('DEBUG', false),
  urls: EnvUtils.getArray('ALLOWED_URLS', []),
  secret: EnvUtils.getString('SECRET_KEY'), // Required, throws if missing
  optional: EnvUtils.getString('OPTIONAL_KEY', 'default'),
};

// Environment validation
const requiredVars = ['DATABASE_URL', 'API_KEY', 'SECRET_KEY'];
const missing = EnvUtils.validateRequired(requiredVars);
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}`
  );
}

// Safe environment access
const result = EnvUtils.safeGet('MIGHT_NOT_EXIST');
if (result.exists) {
  console.log(`Value: ${result.value}`);
} else {
  console.log('Variable not set');
}

// Environment variable expansion
const expanded = EnvUtils.expand('Database: ${DATABASE_URL}');
const withDefaults = EnvUtils.expand('Port: ${PORT:-3000}');
```

## Usage Examples

### Complete Utility Integration

```typescript
import {
  PasswordGenerator,
  CryptoUtils,
  FileUtils,
  TimeUtils,
  HttpClient,
  ConfigUtils,
} from '@vasudevshetty/safekey/utils';

// Example: Secure vault backup utility
class VaultBackupUtility {
  private config: any;
  private httpClient: HttpClient;
  private passwordGenerator: PasswordGenerator;

  constructor() {
    this.config = ConfigUtils.fromEnvironment({
      BACKUP_URL: { required: true, type: 'string' },
      BACKUP_KEY: { required: true, type: 'string' },
      BACKUP_INTERVAL: { default: '24h', type: 'string' },
    });

    this.httpClient = new HttpClient({
      baseURL: this.config.BACKUP_URL,
      timeout: 60000,
    });

    this.passwordGenerator = new PasswordGenerator();
  }

  async createBackup(vaultPath: string): Promise<string> {
    // Generate secure backup filename
    const timestamp = TimeUtils.format(new Date(), 'YYYY-MM-DD-HH-mm-ss');
    const randomSuffix = CryptoUtils.randomHex(8);
    const backupName = `vault-backup-${timestamp}-${randomSuffix}.safekey`;

    // Read and encrypt vault
    const vaultData = await FileUtils.readBinaryFile(vaultPath);
    const encryptionKey = CryptoUtils.randomBytes(32);
    const encrypted = await CryptoUtils.encrypt(vaultData, encryptionKey);

    // Create backup metadata
    const metadata = {
      created: TimeUtils.toISOString(new Date()),
      size: vaultData.length,
      checksum: CryptoUtils.sha256(vaultData),
      encryptionKey: CryptoUtils.base64Encode(encryptionKey),
    };

    // Upload backup
    const uploadResponse = await this.httpClient.post(
      '/backups',
      {
        name: backupName,
        data: CryptoUtils.base64Encode(encrypted),
        metadata: metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${this.config.BACKUP_KEY}`,
        },
      }
    );

    return uploadResponse.data.id;
  }

  async restoreBackup(backupId: string, outputPath: string): Promise<void> {
    // Download backup
    const response = await this.httpClient.get(`/backups/${backupId}`, {
      headers: {
        Authorization: `Bearer ${this.config.BACKUP_KEY}`,
      },
    });

    const { data, metadata } = response.data;

    // Decrypt backup
    const encryptionKey = CryptoUtils.base64Decode(metadata.encryptionKey);
    const encryptedData = CryptoUtils.base64Decode(data);
    const decrypted = await CryptoUtils.decrypt(encryptedData, encryptionKey);

    // Verify integrity
    const checksum = CryptoUtils.sha256(decrypted);
    if (checksum !== metadata.checksum) {
      throw new Error('Backup integrity verification failed');
    }

    // Write restored vault
    await FileUtils.writeBinaryFileAtomic(outputPath, decrypted);
  }

  async scheduleRegularBackups(vaultPath: string): Promise<void> {
    const interval = TimeUtils.durationToMilliseconds(
      this.config.BACKUP_INTERVAL
    );

    setInterval(async () => {
      try {
        const backupId = await this.createBackup(vaultPath);
        console.log(`Backup created: ${backupId}`);
      } catch (error) {
        console.error('Backup failed:', error.message);
      }
    }, interval);
  }
}

// Usage
const backupUtility = new VaultBackupUtility();
await backupUtility.createBackup('/path/to/vault.safekey');
await backupUtility.scheduleRegularBackups('/path/to/vault.safekey');
```

For more utility examples and advanced patterns, see the [Utilities Cookbook](../examples/utilities-cookbook.md).
