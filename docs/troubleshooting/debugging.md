# Debugging SafeKey

This comprehensive debugging guide helps developers and advanced users diagnose and resolve complex SafeKey issues. Learn how to use debugging tools, analyze logs, troubleshoot performance problems, and contribute to SafeKey development.

## Overview

This guide covers:

- Setting up debugging environments
- Using built-in debugging tools
- Log analysis and interpretation
- Performance profiling and optimization
- Network debugging for cloud sync
- Development debugging for contributors
- Advanced troubleshooting techniques

## Setting Up Debug Environment

### Enable Debug Mode

```bash
# Enable global debug mode
export SAFEKEY_DEBUG=true
export SAFEKEY_LOG_LEVEL=debug

# Enable specific debug categories
export SAFEKEY_DEBUG_VAULT=true
export SAFEKEY_DEBUG_CLOUD=true
export SAFEKEY_DEBUG_CRYPTO=true
export SAFEKEY_DEBUG_AUTH=true

# Set debug output file
export SAFEKEY_DEBUG_FILE=~/.safekey/debug.log

# Run commands with debug output
safekey vault list
```

### Configure Detailed Logging

```bash
# Create logging configuration
cat > ~/.safekey/logging.json << 'EOF'
{
  "level": "debug",
  "format": "json",
  "timestamp": true,
  "file": {
    "enabled": true,
    "path": "~/.safekey/logs/",
    "maxSize": "10MB",
    "maxFiles": 5,
    "rotate": true
  },
  "console": {
    "enabled": true,
    "colorize": true,
    "level": "info"
  },
  "categories": {
    "vault": "debug",
    "cloud": "debug",
    "crypto": "debug",
    "auth": "debug",
    "performance": "debug",
    "network": "debug"
  }
}
EOF

# Apply logging configuration
safekey config set logging.config ~/.safekey/logging.json
```

### Debug-Specific Configuration

```yaml
# ~/.safekey/debug-config.yaml
debug:
  enabled: true
  verbose: true
  trace_function_calls: true
  log_crypto_operations: false # Security: never log in production

  performance:
    enabled: true
    threshold_ms: 1000 # Log operations taking > 1 second
    memory_monitoring: true

  network:
    log_requests: true
    log_responses: false # May contain sensitive data
    timeout_debugging: true

  vault:
    log_access_patterns: true
    log_operations: true

  cloud:
    log_sync_details: true
    log_conflicts: true
    retry_debugging: true
```

## Built-in Debugging Tools

### SafeKey Doctor

```bash
# Comprehensive health check
safekey doctor --verbose

# Check specific components
safekey doctor --component vault
safekey doctor --component cloud
safekey doctor --component auth
safekey doctor --component performance

# Generate detailed diagnostic report
safekey doctor --report --output-format json > diagnostic-report.json

# Include system information
safekey doctor --system-info --network-tests --performance-benchmarks
```

### Debug Commands

```bash
# Debug vault operations
safekey debug vault --vault-name "test-vault"
safekey debug vault --list-internals
safekey debug vault --check-integrity --deep

# Debug cloud sync
safekey debug cloud --provider github
safekey debug cloud --sync-status --verbose
safekey debug cloud --test-connectivity --trace

# Debug authentication
safekey debug auth --check-tokens
safekey debug auth --verify-permissions
safekey debug auth --test-2fa

# Debug performance
safekey debug performance --profile-operations
safekey debug performance --memory-usage
safekey debug performance --benchmark
```

### Interactive Debug Shell

```bash
# Start interactive debug session
safekey debug --interactive

# Available commands in debug shell:
> vault.list()
> vault.info('vault-name')
> cloud.status()
> auth.check()
> performance.profile('operation-name')
> logs.tail(100)
> config.dump()
```

## Log Analysis and Interpretation

### Log Structure and Format

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "debug",
  "category": "vault",
  "operation": "secret_access",
  "vault": "production-secrets",
  "secret": "DATABASE_URL",
  "user": "alice@company.com",
  "duration_ms": 45,
  "success": true,
  "metadata": {
    "access_pattern": "api",
    "client_ip": "192.168.1.100",
    "user_agent": "SafeKey CLI v1.2.1"
  }
}
```

### Log Analysis Tools

```bash
# Analyze logs with jq
cat ~/.safekey/logs/debug.log | jq '.category == "vault"'

# Find errors and warnings
cat ~/.safekey/logs/debug.log | jq 'select(.level == "error" or .level == "warn")'

# Analyze performance issues
cat ~/.safekey/logs/debug.log | jq 'select(.duration_ms > 1000)'

# Track specific operations
cat ~/.safekey/logs/debug.log | jq 'select(.operation == "cloud_sync")'

# Analyze access patterns
cat ~/.safekey/logs/debug.log | jq 'select(.category == "vault") | .secret' | sort | uniq -c
```

### Log Analysis Script

```python
#!/usr/bin/env python3
# log-analyzer.py

import json
import sys
from datetime import datetime, timedelta
from collections import defaultdict, Counter

class SafeKeyLogAnalyzer:
    def __init__(self, log_file):
        self.log_file = log_file
        self.logs = []
        self.load_logs()

    def load_logs(self):
        """Load and parse log file"""
        try:
            with open(self.log_file, 'r') as f:
                for line in f:
                    try:
                        self.logs.append(json.loads(line.strip()))
                    except json.JSONDecodeError:
                        continue
        except FileNotFoundError:
            print(f"Log file not found: {self.log_file}")
            sys.exit(1)

    def analyze_errors(self):
        """Analyze error patterns"""
        errors = [log for log in self.logs if log.get('level') == 'error']

        print(f"=== Error Analysis ===")
        print(f"Total errors: {len(errors)}")

        if not errors:
            print("No errors found!")
            return

        # Group by error type
        error_types = Counter(log.get('error_type', 'unknown') for log in errors)
        print("\nError types:")
        for error_type, count in error_types.most_common():
            print(f"  {error_type}: {count}")

        # Recent errors (last 24 hours)
        now = datetime.now()
        recent_errors = [
            log for log in errors
            if datetime.fromisoformat(log['timestamp'].replace('Z', '+00:00')) > now - timedelta(days=1)
        ]

        print(f"\nRecent errors (24h): {len(recent_errors)}")
        for error in recent_errors[-5:]:  # Last 5 errors
            print(f"  {error['timestamp']}: {error.get('message', 'No message')}")

    def analyze_performance(self):
        """Analyze performance metrics"""
        perf_logs = [log for log in self.logs if 'duration_ms' in log]

        print(f"\n=== Performance Analysis ===")
        print(f"Operations with timing: {len(perf_logs)}")

        if not perf_logs:
            return

        durations = [log['duration_ms'] for log in perf_logs]

        print(f"Average duration: {sum(durations) / len(durations):.2f}ms")
        print(f"Max duration: {max(durations)}ms")
        print(f"Min duration: {min(durations)}ms")

        # Slow operations (> 1 second)
        slow_ops = [log for log in perf_logs if log['duration_ms'] > 1000]
        print(f"Slow operations (>1s): {len(slow_ops)}")

        # Group by operation type
        op_durations = defaultdict(list)
        for log in perf_logs:
            op_durations[log.get('operation', 'unknown')].append(log['duration_ms'])

        print("\nAverage duration by operation:")
        for op, durations in op_durations.items():
            avg_duration = sum(durations) / len(durations)
            print(f"  {op}: {avg_duration:.2f}ms ({len(durations)} operations)")

    def analyze_cloud_sync(self):
        """Analyze cloud sync patterns"""
        sync_logs = [log for log in self.logs if log.get('category') == 'cloud']

        print(f"\n=== Cloud Sync Analysis ===")
        print(f"Cloud operations: {len(sync_logs)}")

        if not sync_logs:
            return

        # Sync success rate
        successful_syncs = len([log for log in sync_logs if log.get('success')])
        success_rate = (successful_syncs / len(sync_logs)) * 100
        print(f"Success rate: {success_rate:.1f}%")

        # Provider breakdown
        providers = Counter(log.get('provider', 'unknown') for log in sync_logs)
        print("\nOperations by provider:")
        for provider, count in providers.items():
            print(f"  {provider}: {count}")

        # Sync conflicts
        conflicts = [log for log in sync_logs if 'conflict' in log.get('operation', '')]
        print(f"\nSync conflicts: {len(conflicts)}")

    def analyze_access_patterns(self):
        """Analyze vault access patterns"""
        access_logs = [log for log in self.logs if log.get('category') == 'vault']

        print(f"\n=== Access Pattern Analysis ===")
        print(f"Vault operations: {len(access_logs)}")

        if not access_logs:
            return

        # Most accessed secrets
        accessed_secrets = Counter(log.get('secret') for log in access_logs if log.get('secret'))
        print("\nMost accessed secrets:")
        for secret, count in accessed_secrets.most_common(10):
            print(f"  {secret}: {count}")

        # User activity
        users = Counter(log.get('user') for log in access_logs if log.get('user'))
        print(f"\nActive users: {len(users)}")
        for user, count in users.most_common(5):
            print(f"  {user}: {count} operations")

        # Vault usage
        vaults = Counter(log.get('vault') for log in access_logs if log.get('vault'))
        print("\nVault usage:")
        for vault, count in vaults.items():
            print(f"  {vault}: {count} operations")

    def generate_report(self):
        """Generate comprehensive analysis report"""
        print("SafeKey Log Analysis Report")
        print("=" * 50)
        print(f"Analysis of {len(self.logs)} log entries")
        print(f"Log file: {self.log_file}")
        print(f"Generated: {datetime.now()}")

        self.analyze_errors()
        self.analyze_performance()
        self.analyze_cloud_sync()
        self.analyze_access_patterns()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 log-analyzer.py <log-file>")
        sys.exit(1)

    analyzer = SafeKeyLogAnalyzer(sys.argv[1])
    analyzer.generate_report()
```

### Real-time Log Monitoring

```bash
# Monitor logs in real-time
tail -f ~/.safekey/logs/debug.log | jq .

# Filter for specific categories
tail -f ~/.safekey/logs/debug.log | jq 'select(.category == "cloud")'

# Monitor errors in real-time
tail -f ~/.safekey/logs/debug.log | jq 'select(.level == "error")'

# Monitor performance issues
tail -f ~/.safekey/logs/debug.log | jq 'select(.duration_ms > 1000)'
```

## Performance Debugging

### Profiling Operations

```bash
# Profile specific operations
safekey debug profile --operation vault_list
safekey debug profile --operation cloud_sync
safekey debug profile --operation secret_encrypt

# Profile with detailed timing
safekey debug profile --operation vault_list --detailed --output profile-report.json

# Continuous profiling
safekey debug profile --continuous --duration 300 --output continuous-profile.json
```

### Memory Usage Analysis

```javascript
// memory-profiler.js - Node.js memory profiling
const SafeKey = require('@vasudevshetty/safekey');

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function logMemoryUsage(label) {
  const usage = process.memoryUsage();
  console.log(`${label}:`);
  console.log(`  RSS: ${formatBytes(usage.rss)}`);
  console.log(`  Heap Used: ${formatBytes(usage.heapUsed)}`);
  console.log(`  Heap Total: ${formatBytes(usage.heapTotal)}`);
  console.log(`  External: ${formatBytes(usage.external)}`);
}

async function profileMemoryUsage() {
  logMemoryUsage('Initial');

  const safekey = new SafeKey();
  logMemoryUsage('After SafeKey init');

  // Profile vault operations
  const vaults = await safekey.listVaults();
  logMemoryUsage('After listing vaults');

  for (const vault of vaults) {
    await safekey.switchVault(vault.name);
    const secrets = await safekey.listSecrets();
    logMemoryUsage(
      `After loading vault: ${vault.name} (${secrets.length} secrets)`
    );

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      logMemoryUsage(`After GC for vault: ${vault.name}`);
    }
  }
}

// Run with: node --expose-gc memory-profiler.js
profileMemoryUsage().catch(console.error);
```

### Performance Benchmarking

```python
#!/usr/bin/env python3
# performance-benchmark.py

import subprocess
import time
import json
import statistics
from typing import List, Dict

class SafeKeyBenchmark:
    def __init__(self):
        self.results = {}

    def run_command_benchmark(self, command: List[str], iterations: int = 5) -> Dict:
        """Benchmark a SafeKey command"""
        times = []

        for i in range(iterations):
            start_time = time.time()

            try:
                result = subprocess.run(
                    command,
                    capture_output=True,
                    text=True,
                    timeout=60
                )
                end_time = time.time()

                if result.returncode == 0:
                    times.append(end_time - start_time)
                else:
                    print(f"Command failed: {' '.join(command)}")

            except subprocess.TimeoutExpired:
                print(f"Command timed out: {' '.join(command)}")

        if not times:
            return {"error": "No successful runs"}

        return {
            "mean": statistics.mean(times),
            "median": statistics.median(times),
            "min": min(times),
            "max": max(times),
            "std_dev": statistics.stdev(times) if len(times) > 1 else 0,
            "iterations": len(times)
        }

    def benchmark_vault_operations(self):
        """Benchmark common vault operations"""
        print("Benchmarking vault operations...")

        # Vault listing
        self.results['vault_list'] = self.run_command_benchmark(['safekey', 'vault', 'list'])

        # Secret listing (assuming a test vault exists)
        self.results['secret_list'] = self.run_command_benchmark(['safekey', 'list'])

        # Secret retrieval
        self.results['secret_get'] = self.run_command_benchmark(['safekey', 'get', 'TEST_SECRET'])

        # Secret addition
        self.results['secret_add'] = self.run_command_benchmark([
            'safekey', 'add', 'BENCHMARK_SECRET', 'test-value', '--description', 'Benchmark test'
        ])

        # Secret removal
        self.results['secret_remove'] = self.run_command_benchmark([
            'safekey', 'remove', 'BENCHMARK_SECRET'
        ])

    def benchmark_cloud_operations(self):
        """Benchmark cloud sync operations"""
        print("Benchmarking cloud operations...")

        # Cloud status check
        self.results['cloud_status'] = self.run_command_benchmark(['safekey', 'cloud', 'status'])

        # Cloud sync
        self.results['cloud_sync'] = self.run_command_benchmark(['safekey', 'cloud', 'sync'])

    def generate_report(self):
        """Generate benchmark report"""
        print("\n" + "="*50)
        print("SafeKey Performance Benchmark Report")
        print("="*50)

        for operation, stats in self.results.items():
            if "error" in stats:
                print(f"\n{operation}: {stats['error']}")
                continue

            print(f"\n{operation}:")
            print(f"  Mean time: {stats['mean']:.3f}s")
            print(f"  Median time: {stats['median']:.3f}s")
            print(f"  Min time: {stats['min']:.3f}s")
            print(f"  Max time: {stats['max']:.3f}s")
            print(f"  Std deviation: {stats['std_dev']:.3f}s")
            print(f"  Iterations: {stats['iterations']}")

            # Performance assessment
            if stats['mean'] < 0.1:
                assessment = "Excellent"
            elif stats['mean'] < 0.5:
                assessment = "Good"
            elif stats['mean'] < 2.0:
                assessment = "Fair"
            else:
                assessment = "Poor"

            print(f"  Assessment: {assessment}")

    def save_results(self, filename: str):
        """Save benchmark results to file"""
        with open(filename, 'w') as f:
            json.dump(self.results, f, indent=2)

if __name__ == "__main__":
    benchmark = SafeKeyBenchmark()

    try:
        benchmark.benchmark_vault_operations()
        benchmark.benchmark_cloud_operations()
        benchmark.generate_report()
        benchmark.save_results(f"benchmark-{int(time.time())}.json")
    except KeyboardInterrupt:
        print("\nBenchmark interrupted by user")
    except Exception as e:
        print(f"Benchmark failed: {e}")
```

## Network Debugging

### Cloud Sync Network Analysis

```bash
# Monitor network traffic during sync
sudo tcpdump -i any -w safekey-sync.pcap host github.com &
TCPDUMP_PID=$!

# Perform sync operation
safekey cloud sync --verbose

# Stop monitoring
sudo kill $TCPDUMP_PID

# Analyze captured traffic
wireshark safekey-sync.pcap
```

### HTTP Request Debugging

```bash
# Enable HTTP request logging
export SAFEKEY_DEBUG_HTTP=true
export NODE_TLS_REJECT_UNAUTHORIZED=0  # Only for debugging HTTPS issues

# Log HTTP requests and responses
export SAFEKEY_LOG_HTTP_REQUESTS=true
export SAFEKEY_LOG_HTTP_RESPONSES=true  # Be careful with sensitive data

# Run with detailed HTTP logging
safekey cloud sync --provider github --verbose
```

### Network Connectivity Testing

```python
#!/usr/bin/env python3
# network-debug.py

import socket
import ssl
import requests
import time
from urllib.parse import urlparse

class NetworkDebugger:
    def __init__(self):
        self.providers = {
            'github': 'https://api.github.com',
            'aws-s3': 'https://s3.amazonaws.com',
            'azure-blob': 'https://blob.core.windows.net'
        }

    def test_dns_resolution(self, hostname):
        """Test DNS resolution"""
        try:
            ip = socket.gethostbyname(hostname)
            print(f"✓ DNS resolution for {hostname}: {ip}")
            return True
        except socket.gaierror as e:
            print(f"✗ DNS resolution failed for {hostname}: {e}")
            return False

    def test_tcp_connection(self, hostname, port):
        """Test TCP connection"""
        try:
            sock = socket.create_connection((hostname, port), timeout=10)
            sock.close()
            print(f"✓ TCP connection to {hostname}:{port} successful")
            return True
        except Exception as e:
            print(f"✗ TCP connection to {hostname}:{port} failed: {e}")
            return False

    def test_ssl_connection(self, hostname, port=443):
        """Test SSL/TLS connection"""
        try:
            context = ssl.create_default_context()
            sock = socket.create_connection((hostname, port), timeout=10)
            ssock = context.wrap_socket(sock, server_hostname=hostname)
            cert = ssock.getpeercert()
            ssock.close()
            print(f"✓ SSL connection to {hostname} successful")
            print(f"  Certificate subject: {cert['subject']}")
            print(f"  Certificate expires: {cert['notAfter']}")
            return True
        except Exception as e:
            print(f"✗ SSL connection to {hostname} failed: {e}")
            return False

    def test_http_request(self, url, timeout=30):
        """Test HTTP request"""
        try:
            start_time = time.time()
            response = requests.get(url, timeout=timeout)
            end_time = time.time()

            print(f"✓ HTTP request to {url} successful")
            print(f"  Status code: {response.status_code}")
            print(f"  Response time: {(end_time - start_time)*1000:.0f}ms")
            print(f"  Response size: {len(response.content)} bytes")
            return True
        except Exception as e:
            print(f"✗ HTTP request to {url} failed: {e}")
            return False

    def test_provider_connectivity(self, provider_name):
        """Test connectivity to a specific provider"""
        if provider_name not in self.providers:
            print(f"Unknown provider: {provider_name}")
            return False

        url = self.providers[provider_name]
        parsed = urlparse(url)
        hostname = parsed.hostname
        port = parsed.port or (443 if parsed.scheme == 'https' else 80)

        print(f"\n=== Testing {provider_name} connectivity ===")

        # Test DNS
        if not self.test_dns_resolution(hostname):
            return False

        # Test TCP
        if not self.test_tcp_connection(hostname, port):
            return False

        # Test SSL (if HTTPS)
        if parsed.scheme == 'https':
            if not self.test_ssl_connection(hostname, port):
                return False

        # Test HTTP
        if not self.test_http_request(url):
            return False

        return True

    def run_full_test(self):
        """Run full network connectivity test"""
        print("SafeKey Network Connectivity Test")
        print("=" * 40)

        all_passed = True
        for provider in self.providers:
            if not self.test_provider_connectivity(provider):
                all_passed = False

        print(f"\n{'✓ All tests passed' if all_passed else '✗ Some tests failed'}")
        return all_passed

if __name__ == "__main__":
    debugger = NetworkDebugger()
    debugger.run_full_test()
```

## Development Debugging

### Source Code Debugging

```bash
# Clone SafeKey repository for development
git clone https://github.com/vasudevshetty/safekey.git
cd safekey

# Install development dependencies
npm install

# Build in development mode
npm run build:dev

# Run with source maps
node --inspect --enable-source-maps dist/cli/index.js vault list

# Debug specific module
node --inspect-brk --enable-source-maps dist/cli/index.js vault list
```

### TypeScript Debugging Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug SafeKey CLI",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/cli/index.ts",
      "args": ["vault", "list"],
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "sourceMaps": true,
      "console": "integratedTerminal",
      "env": {
        "SAFEKEY_DEBUG": "true",
        "SAFEKEY_LOG_LEVEL": "debug"
      },
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug SafeKey Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/vitest",
      "args": ["run", "--no-coverage"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "env": {
        "NODE_ENV": "test"
      }
    }
  ]
}
```

### Unit Test Debugging

```typescript
// debug-test.ts - Debug helper for unit tests
import { describe, it, beforeEach, afterEach } from 'vitest';
import { SafeKey } from '../src/index';

describe('Debug SafeKey Operations', () => {
  let safekey: SafeKey;

  beforeEach(async () => {
    // Set up debug environment
    process.env.SAFEKEY_DEBUG = 'true';
    process.env.SAFEKEY_LOG_LEVEL = 'debug';

    safekey = new SafeKey({
      configDir: '/tmp/safekey-debug',
      debug: true,
    });
  });

  afterEach(() => {
    // Clean up
    delete process.env.SAFEKEY_DEBUG;
    delete process.env.SAFEKEY_LOG_LEVEL;
  });

  it('should debug vault operations', async () => {
    // Create test vault
    const vault = await safekey.createVault('debug-vault');

    // Add debug logging
    console.log('Vault created:', vault);

    // Add secret with debugging
    await safekey.addSecret('TEST_SECRET', 'test-value');

    // Verify with debugging
    const secret = await safekey.getSecret('TEST_SECRET');
    console.log('Retrieved secret:', secret);
  });
});
```

### Custom Debug Hooks

```typescript
// debug-hooks.ts - Custom debugging utilities
export class DebugHooks {
  private static instance: DebugHooks;
  private hooks: Map<string, Function[]> = new Map();

  static getInstance(): DebugHooks {
    if (!DebugHooks.instance) {
      DebugHooks.instance = new DebugHooks();
    }
    return DebugHooks.instance;
  }

  on(event: string, callback: Function): void {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }
    this.hooks.get(event)!.push(callback);
  }

  emit(event: string, data: any): void {
    const callbacks = this.hooks.get(event) || [];
    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Debug hook error for event ${event}:`, error);
      }
    });
  }

  // Pre-defined debug hooks
  onVaultOperation(
    callback: (operation: string, vault: string, data: any) => void
  ): void {
    this.on('vault.operation', callback);
  }

  onCloudSync(
    callback: (provider: string, operation: string, data: any) => void
  ): void {
    this.on('cloud.sync', callback);
  }

  onPerformanceIssue(
    callback: (operation: string, duration: number, data: any) => void
  ): void {
    this.on('performance.issue', callback);
  }
}

// Usage in SafeKey core
const debug = DebugHooks.getInstance();

// In vault operations
debug.emit('vault.operation', {
  operation: 'addSecret',
  vault: this.currentVault,
  secret: secretName,
  timestamp: Date.now(),
});

// In performance monitoring
if (duration > 1000) {
  debug.emit('performance.issue', {
    operation: operationName,
    duration,
    details: operationDetails,
  });
}
```

## Advanced Troubleshooting Techniques

### Core Dump Analysis

```bash
# Enable core dumps
ulimit -c unlimited

# Run SafeKey with core dump enabled
safekey vault list

# Analyze core dump (if crash occurs)
gdb node core
# In gdb:
# bt (backtrace)
# info threads
# print variable_name
```

### Memory Leak Detection

```bash
# Install valgrind (Linux)
sudo apt-get install valgrind

# Run with memory leak detection
valgrind --tool=memcheck --leak-check=full --show-leak-kinds=all node dist/cli/index.js vault list

# Use Node.js built-in memory profiling
node --inspect --heap-prof dist/cli/index.js vault list

# Analyze heap profile
node --prof-process isolate-*.log > processed.txt
```

### Debugging Encrypted Data

```typescript
// crypto-debug.ts - Debug crypto operations (NEVER in production)
import { createCipher, createDecipher } from 'crypto';

export class CryptoDebugger {
  static debugEncryption(data: string, key: string): void {
    if (!process.env.SAFEKEY_DEBUG_CRYPTO) {
      console.warn('Crypto debugging disabled for security');
      return;
    }

    console.log('=== CRYPTO DEBUG (INSECURE) ===');
    console.log('Original data length:', data.length);
    console.log('Key length:', key.length);

    // Show encryption process (NEVER in production)
    const cipher = createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    console.log('Encrypted data length:', encrypted.length);
    console.log(
      'Encryption ratio:',
      (encrypted.length / data.length).toFixed(2)
    );

    // Verify decryption
    const decipher = createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    console.log('Decryption successful:', decrypted === data);
    console.log('=== END CRYPTO DEBUG ===');
  }
}
```

### Debugging Cloud Provider APIs

```typescript
// cloud-api-debug.ts
export class CloudAPIDebugger {
  static async debugGitHubAPI(token: string): Promise<void> {
    const responses = [];

    // Test authentication
    try {
      const authResponse = await fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${token}` },
      });
      responses.push({
        endpoint: '/user',
        status: authResponse.status,
        headers: Object.fromEntries(authResponse.headers.entries()),
      });
    } catch (error) {
      console.error('GitHub auth test failed:', error);
    }

    // Test gist creation
    try {
      const gistResponse = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: 'SafeKey Debug Test',
          public: false,
          files: {
            'debug-test.json': {
              content: JSON.stringify({ test: true, timestamp: Date.now() }),
            },
          },
        }),
      });

      responses.push({
        endpoint: '/gists',
        method: 'POST',
        status: gistResponse.status,
        headers: Object.fromEntries(gistResponse.headers.entries()),
      });

      // Clean up test gist
      if (gistResponse.ok) {
        const gistData = await gistResponse.json();
        await fetch(`https://api.github.com/gists/${gistData.id}`, {
          method: 'DELETE',
          headers: { Authorization: `token ${token}` },
        });
      }
    } catch (error) {
      console.error('GitHub gist test failed:', error);
    }

    console.log(
      'GitHub API Debug Results:',
      JSON.stringify(responses, null, 2)
    );
  }
}
```

## Debugging Best Practices

### Security Considerations

1. **Never log sensitive data in production**
2. **Disable crypto debugging in production**
3. **Rotate credentials used in debugging**
4. **Remove debug statements before committing**
5. **Use secure channels for sharing debug information**

### Performance Impact

1. **Disable debugging in production**
2. **Use conditional logging**
3. **Implement log level filtering**
4. **Monitor debug overhead**
5. **Clean up debug files regularly**

### Collaboration

1. **Document debug procedures**
2. **Share debug configurations**
3. **Use consistent debug formats**
4. **Maintain debug tool versions**
5. **Create reproducible debug environments**

### Debugging Checklist

Before debugging:

- [ ] Backup important data
- [ ] Set up isolated environment
- [ ] Enable appropriate logging
- [ ] Document the issue
- [ ] Gather system information

During debugging:

- [ ] Follow systematic approach
- [ ] Document findings
- [ ] Test hypotheses
- [ ] Preserve evidence
- [ ] Consider security implications

After debugging:

- [ ] Document solution
- [ ] Clean up debug artifacts
- [ ] Update documentation
- [ ] Share learnings with team
- [ ] Implement prevention measures

## Contributing Debug Improvements

### Reporting Debug Information

When reporting issues:

1. **Include debug output**: Use `safekey doctor --report`
2. **Provide reproduction steps**: Clear, step-by-step instructions
3. **Share relevant logs**: Sanitized debug logs
4. **Include environment details**: OS, Node.js version, SafeKey version
5. **Describe expected vs. actual behavior**

### Debug Tool Development

Contributing debug tools:

1. **Follow security best practices**
2. **Include comprehensive tests**
3. **Document usage clearly**
4. **Consider performance impact**
5. **Ensure cross-platform compatibility**

This debugging guide provides comprehensive tools and techniques for diagnosing SafeKey issues. Remember to always follow security best practices and never expose sensitive information during debugging.
