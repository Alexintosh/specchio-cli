# Contributing to Specchio Setup CLI

First off, thank you for considering contributing to the Specchio Setup CLI! It's people like you that make Specchio such a great tool.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Be constructive, be respectful, and be kind.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what you expected**
- **Include environment details**:
  - OS version (run `sw_vers`)
  - Xcode version (run `xcodebuild -version`)
  - CLI version (run `specchio --version`)
  - Output of `specchio doctor`

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some examples of how this feature would be used**
- **Include any relevant mockups or examples**

### Pull Requests

1. **Fork the repository** and create your branch from `main`.
2. **Install dependencies**:
   ```bash
   bun install
   ```
3. **Make your changes** and ensure they follow the project's code style.
4. **Write tests** for your changes (if applicable).
5. **Run tests** to ensure everything passes:
   ```bash
   bun test
   ```
6. **Commit your changes** with a clear commit message.
7. **Push to your fork** and submit a pull request.

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- Git
- macOS 14.0 (Sonoma) or later

### Installation

```bash
# Clone the repository
git clone https://github.com/Alexintosh/specchio-cli.git
cd specchio-cli

# Install dependencies
bun install

# Run in development mode with hot reload
bun run dev
```

### Building

```bash
# Build to dist/ (for npm/bun packaging)
bun run build

# Build standalone binary for current architecture
bun run build:standalone

# Build for specific architectures
bun build --compile --target=bun-darwin-arm64 --outfile specchio-arm64 src/index.ts
bun build --compile --target=bun-darwin-x64 --outfile specchio-x64 src/index.ts
```

### Testing

```bash
# Run tests
bun test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage

# Run tests with verbose output
bun run test:verbose
```

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Prefer `const` over `let`
- Use arrow functions for callbacks
- Add JSDoc comments for exported functions
- Use meaningful variable and function names

### Error Handling

- Always handle errors gracefully
- Provide clear error messages to users
- Include suggestions for fixing errors when possible
- Use the utility functions from `utils/output.ts` for consistent error display

### CLI Output

- Use the utility functions from `utils/output.ts` for all CLI output
- Use `printSuccess()` for successful operations
- Use `printError()` for errors
- Use `printWarning()` for warnings
- Use `printInfo()` for informational messages
- Use `printHighlight()` for important sections

### Testing

- Write unit tests for all utility functions
- Write integration tests for commands
- Test error cases as well as success cases
- Use descriptive test names

## Project Structure

```
cli/
├── src/
│   ├── checks/           # System check functions
│   ├── guides/           # Interactive guide functions
│   ├── utils/            # Utility functions
│   └── index.ts          # Main CLI entry point
├── tests/                # Test files
├── brew/                 # Homebrew formula
├── dist/                 # Build output
├── package.json
└── README.md
```

## Creating a Release

1. Update the version in `package.json`
2. Update the VERSION constant in `src/index.ts`
3. Build binaries for both architectures:
   ```bash
   bun build --compile --target=bun-darwin-arm64 --outfile specchio-arm64 src/index.ts
   bun build --compile --target=bun-darwin-x64 --outfile specchio-x64 src/index.ts
   ```
4. Generate SHA256 checksums:
   ```bash
   shasum -a 256 specchio-arm64
   shasum -a 256 specchio-x64
   ```
5. Update the Homebrew formula with the new checksums
6. Create a new GitHub release with the binaries
7. Update the tag in the Homebrew formula

## Questions?

Feel free to open an issue for any questions about contributing or using the Specchio Setup CLI.
