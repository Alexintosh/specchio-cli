# Specchio CLI Testing Strategy

## Overview

This document outlines a comprehensive testing strategy for the Specchio CLI to ensure reliable operation across different macOS versions, Xcode versions, and system architectures. The strategy balances automated testing with manual validation to catch platform-specific issues while maintaining development velocity.

## 1. Testing Matrix

### macOS Versions

The CLI must support macOS 14.0 (Sonoma) and later. Testing should cover:

- **Primary Support**
  - macOS 15.x (Sequoia) - Latest stable
  - macOS 14.x (Sonoma) - Minimum supported version

- **Extended Support** (if resources allow)
  - macOS 13.x (Ventura) - Best-effort support
  - macOS 16.x (future releases) - When available

### Xcode Versions

- **Current Stable**: Latest Xcode release
- **Minimum Supported**: Xcode 14.x (first with iOS 16 support)
- **Test Matrix**:
  - Xcode 15.x (current stable)
  - Xcode 16.x (when available)
  - Xcode 14.x (minimum version)

### Architectures

- **ARM64** (Apple Silicon) - Primary target
- **x86_64** (Intel) - Secondary target for legacy hardware

### Development Tools

- **Bun**: >= 1.0.0 (minimum required version)
- **Node.js**: Not directly required but may be present in user environments

## 2. Test Types

### 2.1 Unit Tests

**Purpose**: Test individual functions and modules in isolation

**Scope**:
- Version parsing logic (macOS version strings, Xcode version strings)
- Error handling and edge cases
- Data parsing functions (device info, certificate parsing)
- Utility functions that don't require system calls

**Example Test Cases**:
```typescript
// macOS version parsing
describe('parseVersion', () => {
  it('should parse standard version strings', () => {
    expect(parseVersion('14.5.2')).toEqual({ major: 14, minor: 5, patch: 2, fullVersion: '14.5.2' });
  });
  
  it('should handle two-part versions', () => {
    expect(parseVersion('14.5')).toEqual({ major: 14, minor: 5, patch: 0, fullVersion: '14.5' });
  });
  
  it('should handle edge cases', () => {
    expect(parseVersion('14.0.0')).toEqual({ major: 14, minor: 0, patch: 0, fullVersion: '14.0.0' });
  });
});

// Device info parsing
describe('parseDeviceInfo', () => {
  it('should parse device info from xcrun output', () => {
    const output = 'iPhone 15 Pro\t21F90\tiOS 17.5';
    const result = parseDeviceInfo(output);
    expect(result?.name).toBe('iPhone 15 Pro');
    expect(result?.model).toBe('21F90');
  });
});
```

### 2.2 Integration Tests

**Purpose**: Test complete workflows and command execution

**Scope**:
- Full check commands (e.g., `specchio check`)
- Command-line argument parsing
- Output formatting and user interactions
- Error handling across multiple components

**Example Test Cases**:
```typescript
// Integration test for check command
describe('check command', () => {
  it('should run all checks and report results', async () => {
    const result = await runCheck();
    expect(result).toHaveProperty('passed', 'failed');
    expect(result.passed + result.failed).toBeGreaterThan(0);
  });
  
  it('should handle individual check commands', async () => {
    const macosResult = await runCheck('macos');
    expect(macosResult).toHaveProperty('passed');
    expect(macosResult).toHaveProperty('message');
  });
});
```

### 2.3 Mock Tests

**Purpose**: Test system call handling without actual execution

**Scope**:
- System command execution (success and failure paths)
- File system operations
- Network operations (if any)
- External dependencies

**Mock Strategy**:
```typescript
// Mock system calls
import { mockExec } from './test-helpers';

describe('checkMacOSVersion', () => {
  it('should pass on macOS 14.0+', async () => {
    mockExec('sw_vers -productVersion', '14.5.0');
    const result = await checkMacOSVersion();
    expect(result.passed).toBe(true);
  });
  
  it('should fail on macOS 13.x', async () => {
    mockExec('sw_vers -productVersion', '13.5.0');
    const result = await checkMacOSVersion();
    expect(result.passed).toBe(false);
    expect(result.fix).toContain('Upgrade');
  });
  
  it('should handle command failures', async () => {
    mockExec('sw_vers -productVersion', null, { exitCode: 1 });
    const result = await checkMacOSVersion();
    expect(result.passed).toBe(false);
  });
});
```

### 2.4 Smoke Tests

**Purpose**: Validate basic functionality after changes

**Scope**:
- CLI can be invoked without crashing
- Help text displays correctly
- Version information is accurate
- Basic commands execute without errors

**Test Cases**:
```bash
# Basic smoke tests
specchio --version
specchio --help
specchio check --help
specchio doctor
```

## 3. Test Framework

### 3.1 Framework Selection: Bun Test

**Rationale**:
- Native support in Bun runtime
- Fast execution and low overhead
- Built-in mocking and spying capabilities
- TypeScript support out of the box
- Compatible with existing Bun infrastructure

**Installation**:
```bash
# Already included in package.json
bun test
```

### 3.2 Mock Strategy

**System Call Mocking**:
```typescript
// test-helpers.ts
export function mockExec(command: string, stdout: string, options?: { exitCode?: number, stderr?: string }) {
  const originalExec = globalThis.exec;
  globalThis.exec = jest.fn().mockResolvedValue({
    stdout,
    stderr: options?.stderr || '',
    exitCode: options?.exitCode || 0
  });
  
  return () => {
    globalThis.exec = originalExec;
  };
}
```

**File System Mocking**:
```typescript
export function mockFileExists(path: string, exists: boolean) {
  const originalExists = globalThis.fileExists;
  globalThis.fileExists = jest.fn().mockResolvedValue(exists);
  
  return () => {
    globalThis.fileExists = originalExists;
  };
}
```

### 3.3 Test Fixtures and Data

**Fixture Structure**:
```
tests/
├── fixtures/
│   ├── system-outputs/
│   │   ├── sw_vers-success.txt
│   │   ├── xcodebuild-version.txt
│   │   ├── devicectl-devices.txt
│   │   └── security-certificates.txt
│   └── test-data/
│       ├── versions.json
│       └── devices.json
├── unit/
│   ├── checks/
│   └── utils/
├── integration/
│   └── commands/
└── helpers/
    └── test-helpers.ts
```

**Example Fixtures**:
```json
// fixtures/test-data/versions.json
{
  "macos": {
    "sequoia": "15.0.0",
    "sonoma": "14.5.0",
    "ventura": "13.5.0",
    "unsupported": "12.7.0"
  },
  "xcode": {
    "16": "Xcode 16.0",
    "15": "Xcode 15.4",
    "14": "Xcode 14.3"
  }
}
```

## 4. CI/CD Integration

### 4.1 GitHub Actions Matrix

**Workflow Configuration**:
```yaml
# .github/workflows/test.yml
name: Test Matrix

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-14, macos-15]
        bun: [latest]
        include:
          - os: macos-14
            macos_version: "14.5"
          - os: macos-15
            macos_version: "15.0"
      fail-fast: false
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: ${{ matrix.bun }}
      
      - name: Install dependencies
        run: bun install
      
      - name: Run unit tests
        run: bun test tests/unit
      
      - name: Run integration tests
        run: bun test tests/integration
      
      - name: Build CLI
        run: bun run build
      
      - name: Run smoke tests
        run: |
          node dist/index.js --version
          node dist/index.js --help
          node dist/index.js doctor
```

### 4.2 Automated Testing on PRs

**Required Checks**:
- All unit tests pass
- All integration tests pass
- CLI builds successfully
- Smoke tests pass on at least one macOS version

**Optional Checks**:
- Cross-version testing (if resources allow)
- Performance regression tests
- Security vulnerability scans

### 4.3 Test Coverage Goals

**Minimum Coverage**:
- Unit tests: 80% code coverage
- Integration tests: 60% code coverage
- Critical paths (version checks, system calls): 90% coverage

## 5. Manual Testing

### 5.1 User Acceptance Testing (UAT)

**Test Scenarios**:
1. **Fresh Installation**
   - Clean macOS install
   - No Xcode installed
   - Follow full setup wizard

2. **Upgrade Path**
   - Existing Xcode installation
   - Upgrade CLI version
   - Verify existing setup still works

3. **Error Recovery**
   - Simulate failures (network issues, permissions)
   - Test error messages and fix suggestions
   - Verify recovery paths work

### 5.2 Beta Testing Program

**Structure**:
- **Beta Channel**: Homebrew tap with `--HEAD` version
- **Test Group**: 5-10 users with diverse configurations
- **Feedback Collection**: GitHub Issues with `beta-testing` label
- **Release Cadence**: Weekly beta builds during active development

**Test Group Requirements**:
- At least 2 users on macOS 14.x
- At least 2 users on macOS 15.x
- At least 1 user on Intel hardware
- Users with different Xcode versions

### 5.3 Platform-Specific Testing

**ARM64-Specific Tests**:
- Rosetta compatibility (does CLI work under Rosetta?)
- Apple Silicon-specific features
- Performance benchmarks

**x86_64-Specific Tests**:
- Legacy hardware compatibility
- Performance on older systems
- Memory usage patterns

## 6. Specific Test Cases for Check Functions

### 6.1 macOS Version Check (`checkMacOSVersion`)

```typescript
describe('checkMacOSVersion', () => {
  // Success cases
  it('should pass on macOS 14.0', async () => {
    mockSystemVersion('14.0.0');
    const result = await checkMacOSVersion();
    expect(result.passed).toBe(true);
    expect(result.message).toContain('14.0.0');
  });
  
  it('should pass on macOS 15.x', async () => {
    mockSystemVersion('15.2.1');
    const result = await checkMacOSVersion();
    expect(result.passed).toBe(true);
  });
  
  // Failure cases
  it('should fail on macOS 13.x', async () => {
    mockSystemVersion('13.5.0');
    const result = await checkMacOSVersion();
    expect(result.passed).toBe(false);
    expect(result.fix).toContain('Upgrade');
  });
  
  // Edge cases
  it('should handle version parsing errors', async () => {
    mockSystemVersion('invalid');
    const result = await checkMacOSVersion();
    expect(result.passed).toBe(false);
    expect(result.message).toContain('Unable to determine');
  });
  
  it('should handle missing sw_vers command', async () => {
    mockCommandFailure('sw_vers -productVersion');
    const result = await checkMacOSVersion();
    expect(result.passed).toBe(false);
  });
});
```

### 6.2 Xcode Installation Check (`checkXcodeInstallation`)

```typescript
describe('checkXcodeInstallation', () => {
  // Success cases
  it('should find Xcode.app', async () => {
    mockDirectoryExists('/Applications/Xcode.app', true);
    mockXcodeVersion('Xcode 15.4');
    const result = await checkXcodeInstallation();
    expect(result.passed).toBe(true);
    expect(result.message).toContain('15.4');
  });
  
  // Failure cases
  it('should fail when Xcode.app missing', async () => {
    mockDirectoryExists('/Applications/Xcode.app', false);
    const result = await checkXcodeInstallation();
    expect(result.passed).toBe(false);
    expect(result.fix).toContain('App Store');
  });
  
  it('should handle xcodebuild failures', async () => {
    mockDirectoryExists('/Applications/Xcode.app', true);
    mockCommandFailure('xcodebuild -version');
    const result = await checkXcodeInstallation();
    expect(result.passed).toBe(false);
    expect(result.fix).toContain('Open Xcode');
  });
  
  // Version-specific tests
  it('should accept Xcode 14.x', async () => {
    mockDirectoryExists('/Applications/Xcode.app', true);
    mockXcodeVersion('Xcode 14.3');
    const result = await checkXcodeInstallation();
    expect(result.passed).toBe(true);
  });
  
  it('should accept Xcode 16.x', async () => {
    mockDirectoryExists('/Applications/Xcode.app', true);
    mockXcodeVersion('Xcode 16.0');
    const result = await checkXcodeInstallation();
    expect(result.passed).toBe(true);
  });
});
```

### 6.3 License Check (`checkXcodeLicense`)

```typescript
describe('checkXcodeLicense', () => {
  // Success cases
  it('should pass when license accepted', async () => {
    mockLicenseCheck(true);
    const result = await checkXcodeLicense();
    expect(result.passed).toBe(true);
    expect(result.message).toContain('accepted');
  });
  
  // Failure cases
  it('should fail when license not accepted', async () => {
    mockLicenseCheck(false);
    const result = await checkXcodeLicense();
    expect(result.passed).toBe(false);
    expect(result.fix).toContain('sudo xcodebuild');
  });
  
  it('should handle missing xcodebuild', async () => {
    mockCommandFailure('xcodebuild -checkFirstLaunchStatus');
    const result = await checkXcodeLicense();
    expect(result.passed).toBe(false);
    expect(result.message).toContain('Unable to check');
  });
});
```

### 6.4 iOS SDK Check (`checkIOSSDK`)

```typescript
describe('checkIOSSDK', () => {
  // Success cases
  it('should find iOS SDK', async () => {
    mockSDKs('iOS 17.5\niOS Simulator 17.5');
    const result = await checkIOSSDK();
    expect(result.passed).toBe(true);
    expect(result.message).toContain('17.5');
  });
  
  it('should find iOS SDK without simulator', async () => {
    mockSDKs('iOS 16.4');
    const result = await checkIOSSDK();
    expect(result.passed).toBe(true);
  });
  
  // Failure cases
  it('should fail when no iOS SDK', async () => {
    mockSDKs('macOS 14.5\nwatchOS 10.4');
    const result = await checkIOSSDK();
    expect(result.passed).toBe(false);
    expect(result.fix).toContain('Preferences → Platforms');
  });
  
  it('should handle xcodebuild failures', async () => {
    mockCommandFailure('xcodebuild -showsdks');
    const result = await checkIOSSDK();
    expect(result.passed).toBe(false);
  });
});
```

### 6.5 Certificate Check (`checkCertificate`)

```typescript
describe('checkCertificate', () => {
  // Success cases
  it('should find Apple Development certificate', async () => {
    mockCertificates('  1) 1234567890ABCDEF "Apple Development: John Doe (ABC123)"');
    const result = await checkCertificate();
    expect(result.passed).toBe(true);
    expect(result.message).toContain('Apple Development certificate found');
  });
  
  it('should handle multiple certificates', async () => {
    mockCertificates(`
      1) 1111111111111111 "Apple Development: User 1"
      2) 2222222222222222 "Apple Development: User 2"
    `);
    const result = await checkCertificate();
    expect(result.passed).toBe(true);
  });
  
  // Failure cases
  it('should fail when no Apple Development certificate', async () => {
    mockCertificates('  1) 1234567890ABCDEF "iPhone Developer: Other Cert"');
    const result = await checkCertificate();
    expect(result.passed).toBe(false);
    expect(result.fix).toContain('Manage Certificates');
  });
  
  it('should fail when no certificates', async () => {
    mockCertificates('');
    const result = await checkCertificate();
    expect(result.passed).toBe(false);
  });
  
  it('should handle security command failures', async () => {
    mockCommandFailure('security find-identity -v -p codesigning');
    const result = await checkCertificate();
    expect(result.passed).toBe(false);
  });
});
```

### 6.6 Device Check (`checkConnectedDevice`)

```typescript
describe('checkConnectedDevice', () => {
  // Success cases
  it('should find connected iPhone', async () => {
    mockDeviceList('iPhone 15 Pro\t21F90\tiOS 17.5');
    const result = await checkConnectedDevice();
    expect(result.passed).toBe(true);
    expect(result.message).toContain('iPhone 15 Pro');
  });
  
  it('should find connected iPad', async () => {
    mockDeviceList('iPad Pro\t13F5\tiPadOS 17.5');
    const result = await checkConnectedDevice();
    expect(result.passed).toBe(true);
    expect(result.message).toContain('iPad Pro');
  });
  
  it('should find connected iPod', async () => {
    mockDeviceList('iPod touch\t28F60\tiOS 17.5');
    const result = await checkConnectedDevice();
    expect(result.passed).toBe(true);
  });
  
  // Failure cases
  it('should fail when no device', async () => {
    mockDeviceList('No devices found');
    const result = await checkConnectedDevice();
    expect(result.passed).toBe(false);
    expect(result.fix).toContain('Connect your iPhone');
  });
  
  it('should handle devicectl failures', async () => {
    mockCommandFailure('xcrun devicectl list devices');
    const result = await checkConnectedDevice();
    expect(result.passed).toBe(false);
    expect(result.message).toContain('Unable to check');
  });
  
  // Edge cases
  it('should handle malformed device output', async () => {
    mockDeviceList('iPhone\niOS');
    const result = await checkConnectedDevice();
    expect(result.passed).toBe(true); // Should still detect device
  });
});
```

## 7. Performance Testing

### 7.1 Response Time Benchmarks

**Target Metrics**:
- Individual checks: < 2 seconds
- Full check suite: < 10 seconds
- Doctor command: < 15 seconds

### 7.2 Memory Usage

**Targets**:
- Idle memory: < 50MB
- Peak memory during checks: < 200MB

### 7.3 Load Testing

**Scenarios**:
- Running checks in tight loops (100 iterations)
- Simulating slow system responses
- Testing with large device lists/certificate counts

## 8. Security Testing

### 8.1 Input Validation

**Test Cases**:
- Malformed command-line arguments
- Invalid file paths in system calls
- Special characters in user inputs

### 8.2 Permission Testing

**Scenarios**:
- Running without sudo access
- Restricted file system access
- Keychain access permissions

### 8.3 Dependency Security

**Practices**:
- Regular `bun audit` runs
- Dependency updates for security patches
- Supply chain security verification

## 9. Documentation Testing

### 9.1 Documentation Accuracy

**Checks**:
- All commands in README actually work
- Help text matches actual command behavior
- Fix suggestions are actionable and accurate

### 9.2 User Guide Testing

**Validation**:
- Walk through documented setup process
- Verify all links and references
- Test example commands

## 10. Release Testing Checklist

### Before Each Release:

- [ ] All tests pass on macOS 14.x
- [ ] All tests pass on macOS 15.x (if available)
- [ ] CLI builds successfully for ARM64
- [ ] CLI builds successfully for x86_64
- [ ] Smoke tests pass on both architectures
- [ ] Documentation is updated
- [ ] Version numbers are updated
- [ ] Beta testers have validated on diverse systems
- [ ] No critical bugs outstanding
- [ ] Performance benchmarks are acceptable

## 11. Continuous Improvement

### 11.1 Test Maintenance

**Regular Tasks**:
- Update test matrix with new macOS/Xcode versions
- Remove obsolete test cases
- Add tests for new features
- Refactor brittle tests

### 11.2 Metrics Tracking

**Key Metrics**:
- Test execution time trends
- Test failure rates by category
- Bug detection rate (bugs found by tests vs. users)
- Time to fix failing tests

### 11.3 Feedback Loop

**Process**:
- Review test failures from production issues
- Add regression tests for reported bugs
- Update test strategy based on learnings
- Share testing insights with team

## 12. Getting Started

### Initial Test Setup

```bash
# Create test structure
mkdir -p tests/{unit,integration,fixtures,helpers}
mkdir -p tests/fixtures/{system-outputs,test-data}

# Create test helper file
touch tests/helpers/test-helpers.ts

# Run initial tests
bun test
```

### Writing Your First Test

```typescript
// tests/unit/checks/macos.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { checkMacOSVersion } from '../../../src/checks/macos.js';
import { mockExec, unmockExec } from '../../helpers/test-helpers.js';

describe('checkMacOSVersion', () => {
  afterEach(() => {
    unmockExec();
  });

  it('should pass on macOS 14.0', async () => {
    mockExec('sw_vers -productVersion', '14.0.0');
    const result = await checkMacOSVersion();
    expect(result.passed).toBe(true);
  });
});
```

---

This testing strategy provides a comprehensive framework for ensuring the Specchio CLI works reliably across the diverse macOS ecosystem. It balances thoroughness with practicality, focusing automated testing on high-impact areas while using manual testing for platform-specific validation.