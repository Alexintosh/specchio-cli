# Specchio CLI Test Suite

Comprehensive unit tests for the Specchio CLI using Bun's built-in test framework.

## Test Structure

```
tests/
├── setup.ts                    # Test configuration and utilities
├── utils/
│   ├── exec.test.ts           # Command execution tests
│   ├── output.test.ts         # Output formatting tests
│   └── prompts.test.ts        # User prompt tests
└── checks/
    ├── macos.test.ts          # macOS version check tests
    ├── xcode.test.ts          # Xcode installation tests
    ├── license.test.ts        # Xcode license tests
    ├── ios-sdk.test.ts        # iOS SDK detection tests
    ├── certificate.test.ts    # Certificate check tests
    └── device.test.ts         # Device connection tests
```

## Running Tests

### Run all tests
```bash
bun test
```

### Run tests in watch mode
```bash
bun run test:watch
```

### Run specific test file
```bash
bun test tests/utils/exec.test.ts
```

### Run with verbose output
```bash
bun run test:verbose
```

## Test Coverage

### Utils

#### `exec.test.ts`
- ✓ Successful command execution
- ✓ Command failure handling
- ✓ Shell command execution
- ✓ Timeout handling
- ✓ Sudo command execution
- ✓ Command existence checking
- ✓ File/directory existence checking
- ✓ ExecError class behavior

#### `output.test.ts`
- ✓ All print functions (success, error, warning, info)
- ✓ Color code formatting
- ✓ Header and step printing
- ✓ Bullet points and numbered lists
- ✓ Links and command formatting
- ✓ Highlighted text

#### `prompts.test.ts`
- ✓ Yes/No prompts with various inputs
- ✓ Continue prompts
- ✓ Text input with defaults
- ✓ Option selection
- ✓ Case handling and trimming
- ✓ Edge cases (invalid input, empty input)

### Checks

#### `macos.test.ts`
- ✓ Version parsing (major.minor.patch)
- ✓ Version validation (14.0+ requirement)
- ✓ Command failure handling
- ✓ Malformed version handling
- ✓ Edge cases (empty output, partial versions)

#### `xcode.test.ts`
- ✓ Xcode.app detection
- ✓ Version parsing from xcodebuild
- ✓ Version check failure handling
- ✓ Multiple version formats
- ✓ Beta version support

#### `license.test.ts`
- ✓ License acceptance detection
- ✓ License rejection handling
- ✓ Command failure scenarios
- ✓ Fix message generation

#### `ios-sdk.test.ts`
- ✓ iOS SDK detection
- ✓ Simulator SDK detection
- ✓ Version parsing
- ✓ Multiple SDK handling
- ✓ Missing SDK scenarios

#### `certificate.test.ts`
- ✓ Apple Development certificate detection
- ✓ Multiple certificate handling
- ✓ Certificate parsing with special characters
- ✓ Empty keychain handling
- ✓ Malformed output handling

#### `device.test.ts`
- ✓ iPhone/iPad/iPod detection
- ✓ Device information parsing
- ✓ Multiple device handling
- ✓ Simulator exclusion
- ✓ Device connection errors

## Writing New Tests

### Test File Template

```typescript
/**
 * Unit tests for [feature name]
 */

import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { functionToTest } from '../../src/path/to/module.js';

describe('feature name', () => {
  beforeEach(() => {
    // Set up mocks before each test
  });

  describe('specific behavior', () => {
    it('should do something specific', async () => {
      // Arrange
      const mockSpawn = mock(() => createMockSpawnResult('output', '', 0));
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      // Act
      const result = await functionToTest();

      // Assert
      expect(result.passed).toBe(true);
    });
  });
});
```

### Best Practices

1. **Mock external dependencies**: Always mock `Bun.spawn` to avoid real command execution
2. **Test both success and failure cases**: Ensure comprehensive coverage
3. **Use descriptive test names**: Test names should clearly describe what is being tested
4. **Test edge cases**: Empty input, malformed data, boundary conditions
5. **Clean up mocks**: Use `beforeEach` to reset mock state
6. **Group related tests**: Use `describe` blocks to organize tests logically

### Mocking System Commands

```typescript
const mockSpawn = mock(() => ({
  stdout: createMockReadableStream('expected output'),
  stderr: createMockReadableStream(''),
  exited: Promise.resolve(0)
}));

// @ts-ignore
global.Bun = { ...global.Bun, spawn: mockSpawn };
```

### Testing Error Cases

```typescript
const mockSpawn = mock(() => ({
  stdout: createMockReadableStream(''),
  stderr: createMockReadableStream('error message'),
  exited: Promise.resolve(1) // Non-zero exit code
}));

// @ts-ignore
global.Bun = { ...global.Bun, spawn: mockSpawn };
```

## CI/CD Integration

The test suite is designed to run in CI/CD environments:

```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    cd cli
    bun install
    bun test
```

## Troubleshooting

### Tests failing with "Bun.spawn is not a function"
Ensure Bun is properly installed and the test environment is set up correctly.

### Mock not being applied
Make sure to use `// @ts-ignore` when mocking global.Bun to avoid TypeScript errors.

### Console output during tests
The test setup suppresses `console.debug` but other console methods will output during tests.

## Contributing

When adding new features to the CLI, please include corresponding tests:

1. Create a new test file or add to existing ones
2. Follow the naming convention: `*.test.ts`
3. Ensure all tests pass before submitting
4. Aim for high test coverage (target: 80%+)

## License

Same as the main Specchio project.
