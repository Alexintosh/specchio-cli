# Specchio Setup CLI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Homebrew](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/Alexintosh/homebrew-specchio/main/formula/specchio.json&label=homebrew&query=$.version&color=blue)](https://github.com/Alexintosh/homebrew-specchio)

**Interactive setup CLI for Specchio iOS development environment.**

Specchio Setup CLI simplifies the process of setting up a macOS development environment for the [Specchio App](https://specchio.space/) . It automatically checks your system configuration, guides you through installing required tools (Xcode, iOS SDK, code signing certificates), and helps you connect and configure your iOS devices for development.

## Installation

### Via Homebrew (Recommended)

The easiest way to install `specchio` is via Homebrew:

```bash
brew tap Alexintosh/specchio
brew install specchio
```

To upgrade to the latest version:

```bash
brew upgrade specchio
```

To uninstall:

```bash
brew uninstall specchio
```

### Manual Installation

Alternatively, you can download the binary directly from [GitHub Releases](https://github.com/Alexintosh/specchio/releases):

```bash
# For Apple Silicon (ARM64)
curl -L https://github.com/Alexintosh/specchio/releases/latest/download/specchio-arm64 -o specchio
chmod +x specchio
sudo mv specchio /usr/local/bin/

# For Intel (x86_64)
curl -L https://github.com/Alexintosh/specchio/releases/latest/download/specchio-x64 -o specchio
chmod +x specchio
sudo mv specchio /usr/local/bin/
```

## Features

- **Interactive Setup Wizard** - Step-by-step guidance through the entire setup process
- **System Health Checks** - Automatically verify macOS version, Xcode installation, iOS SDK, certificates, and connected devices
- **Automatic Issue Detection** - Identifies common configuration problems and suggests fixes
- **Diagnostic Information** - Gather detailed system information for troubleshooting
- **Developer Mode Guidance** - Helps enable Developer Mode on your iOS devices
- **WiFi Debugging Setup** - Configure wireless iOS deployment
- **Cross-Architecture Support** - Binaries available for both Apple Silicon and Intel Macs

## Usage

### Interactive Setup Wizard

The default command starts an interactive setup wizard that guides you through the entire process:

```bash
specchio
```

The wizard will:
1. Check your macOS version (requires 14.0 Sonoma or later)
2. Verify Xcode installation
3. Accept the Xcode license
4. Install the iOS SDK
5. Create a code signing certificate
6. Help you connect and configure your iOS device
7. Enable Developer Mode and trust settings

### Commands

#### `specchio check` - Run System Checks

Run all system checks to verify your development environment:

```bash
specchio check
```

Run a specific check:

```bash
specchio check macos         # Check macOS version
specchio check xcode         # Check Xcode installation
specchio check license       # Check Xcode license status
specchio check ios-sdk       # Check iOS SDK installation
specchio check certificate   # Check code signing certificate
specchio check device        # Check connected iOS device
```

#### `specchio fix` - Automatic Issue Resolution

Attempt to automatically fix common issues:

```bash
specchio fix
```

This command will try to:
- Accept the Xcode license
- Configure Xcode developer tools
- Fix common certificate issues

#### `specchio doctor` - Diagnostic Information

Display detailed diagnostic information about your system:

```bash
specchio doctor
```

Output includes:
- System information (OS version, architecture, Bun version)
- Xcode information (version, license status)
- Development tools (git, brew, node, bun)
- Code signing certificates
- Connected iOS devices

**Include this output when reporting bugs!**

#### `specchio verify` - Verify Setup Status

Check if your system is ready for Specchio development:

```bash
specchio verify
```

### Options

```bash
specchio --help, -h     # Show help message
specchio --version, -v  # Show version information
specchio --verbose      # Show detailed output
```

## Examples

### First-time Setup

```bash
# Start the interactive setup wizard
specchio

# Or run checks first to see what needs to be configured
specchio check

# Then fix any issues automatically
specchio fix
```

### Troubleshooting

```bash
# Get diagnostic information
specchio doctor

# Check a specific component
specchio check xcode

# Verify your setup is complete
specchio verify
```

### Quick Status Check

```bash
# Run all checks
specchio check

# Expected output:
# ✓ macOS 14.0 or later
# ✓ Xcode 15.0 or later installed
# ✓ Xcode license accepted
# ✓ iOS SDK installed
# ✓ Code signing certificate found
# ✓ iOS device connected
```

## Development

This project uses [Bun](https://bun.sh/) as the JavaScript runtime and build tool.

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- Git

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/Alexintosh/specchio.git
cd specchio/cli

# Install dependencies
bun install

# Run in development mode with hot reload
bun run dev
```

### Build Instructions

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
```

## Utility Functions

This CLI provides utility functions in `src/utils/`:

### exec.ts - Shell Command Execution

```typescript
import { exec, execWithSudo, execQuiet, commandExists } from './utils/exec.js';

// Execute command and get stdout
const output = await exec('sw_vers -productVersion');

// Execute with sudo privileges
await execWithSudo('xcodebuild -license accept');

// Execute without throwing on error
const result = await execQuiet('some-command');
console.log(result.stdout, result.stderr, result.exitCode);

// Check if command exists
const hasBun = await commandExists('bun');
```

### output.ts - Pretty CLI Output

```typescript
import { printSuccess, printError, printWarning, printInfo } from './utils/output.js';

printSuccess('Operation completed!');
printError('Something went wrong');
printWarning('This is a warning');
printInfo('Here is some info');

// Additional formatting functions
printHeader('Section Title');
printStep(1, 5, 'Installing dependencies');
printCommand('brew install bun');
printDivider();
```

### prompts.ts - Interactive Prompts

```typescript
import { promptYesNo, promptContinue, promptText, promptSelect } from './utils/prompts.js';

// Yes/no prompt
const answer = await promptYesNo('Do you want to continue?');

// Press Enter to continue
await promptContinue('Press Enter when ready...');

// Text input
const name = await promptText('Enter your name', 'Default Name');

// Select from list
const options = ['Option 1', 'Option 2', 'Option 3'];
const selectedIndex = await promptSelect('Choose an option', options);
console.log(`You selected: ${options[selectedIndex]}`);
```

## System Requirements

### macOS

- macOS 14.0 (Sonoma) or later
- Apple Silicon (M1/M2/M3/M4) or Intel processor

### Required Tools

- Xcode 15.0 or later (from App Store)
- Xcode Command Line Tools
- Apple ID (for code signing)
- iPhone or iPad running iOS 16.0 or later (for testing)

## Documentation

Extensive documentation is available in the docs website.
- [Installation Guide](https://docs.specchio.space/installation.html)

## Creating a Release

To create a new release:

1. Update the version in `package.json` and `src/index.ts`
2. Build binaries for both architectures:
   ```bash
   bun build --compile --target=bun-darwin-arm64 --outfile specchio-arm64 src/index.ts
   bun build --compile --target=bun-darwin-x64 --outfile specchio-x64 src/index.ts
   ```
3. Generate SHA256 checksums:
   ```bash
   shasum -a 256 specchio-arm64
   shasum -a 256 specchio-x64
   ```
4. Update the Homebrew formula with the new checksums
5. Create a new GitHub release with the binaries
6. Update the tag in the Homebrew formula

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
