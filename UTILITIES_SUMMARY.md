# Specchio CLI Utilities Implementation Summary

## Overview
Implemented three core utility modules for the Specchio CLI using Bun's native features and minimal dependencies.

## Directory Structure
```
cli/
├── src/
│   ├── utils/
│   │   ├── exec.ts       # Shell command execution
│   │   ├── output.ts     # Pretty CLI output
│   │   └── prompts.ts    # Interactive user prompts
│   └── index.ts          # Demo CLI entry point
├── package.json
├── tsconfig.json
├── README.md
└── test-utils.ts         # Test script
```

## 1. exec.ts - Shell Command Execution

### Functions Implemented:

- **`exec(command: string): Promise<string>`**
  - Executes shell commands using `Bun.spawn()`
  - Returns stdout on success
  - Throws `ExecError` on failure (non-zero exit code)
  - Includes debug logging with timing

- **`execWithSudo(command: string): Promise<string>`**
  - Executes commands with sudo privileges
  - Prompts user for password if needed
  - Same error handling as `exec()`

- **`execQuiet(command: string): Promise<ExecResult>`**
  - Executes commands without throwing on errors
  - Returns `{ stdout, stderr, exitCode }` object
  - Useful for checking command output regardless of success

- **`commandExists(command: string): Promise<boolean>`**
  - Checks if a command is available on the system
  - Uses `which` command internally

- **`directoryExists(path: string): Promise<boolean>`**
  - Checks if a directory exists using `test -d`

- **`fileExists(path: string): Promise<boolean>`**
  - Checks if a file exists using `test -f`

- **`ExecError` class**
  - Custom error for command failures
  - Contains command, exitCode, stdout, stderr
  - Provides `getDisplayMessage()` for user-friendly output

### Usage Example:
```typescript
import { exec, execWithSudo, commandExists } from './utils/exec.js';

const version = await exec('sw_vers -productVersion');
await execWithSudo('xcodebuild -license accept');
const hasBun = await commandExists('bun');
```

## 2. output.ts - Pretty CLI Output

### Functions Implemented:

- **`printSuccess(message: string)`** - Green ✓ symbol
- **`printError(message: string)`** - Red ✗ symbol
- **`printWarning(message: string)`** - Yellow ⚠ symbol
- **`printInfo(message: string)`** - Blue ℹ symbol
- **`printHeader(title: string)`** - Bold section title with divider
- **`printStep(step, total, description)`** - Numbered step display
- **`printBullet(message)`** - Bullet point with indentation
- **`printNumbered(num, message)`** - Numbered list item
- **`printCommand(command)`** - Formatted command display
- **`printLink(label, url)`** - Clickable URL display
- **`printBlank()`** - Empty line for spacing
- **`printHighlight(message)`** - Highlighted/bold text
- **`printDivider()`** - Visual divider

### Design Decisions:
- Uses ANSI escape codes directly instead of chalk dependency
- Terminal-agnostic color codes
- Minimal and lightweight approach

### Usage Example:
```typescript
import { printSuccess, printHeader, printCommand } from './utils/output.js';

printHeader('System Requirements');
printSuccess('macOS 14.0+ detected');
printCommand('brew install bun');
```

## 3. prompts.ts - Interactive User Prompts

### Functions Implemented:

- **`promptYesNo(question: string): Promise<boolean>`**
  - Yes/no confirmation prompt
  - Returns true for 'y' or 'yes'
  - Default: false (case-insensitive)

- **`promptContinue(message?: string): Promise<void>`**
  - Press Enter to continue
  - Useful for pacing multi-step processes

- **`promptText(question: string, defaultValue?: string): Promise<string>`**
  - Text input with optional default value
  - Returns default if user presses Enter without input

- **`promptSelect(question: string, options: string[]): Promise<number>`**
  - Select from numbered list
  - Returns index of selected option
  - Defaults to option 0 if invalid selection

### Design Decisions:
- Uses Node.js built-in `readline` module instead of prompts library
- Zero additional dependencies
- Simple and reliable user interaction

### Usage Example:
```typescript
import { promptYesNo, promptSelect, promptText } from './utils/prompts.js';

const install = await promptYesNo('Install Xcode?');
const name = await promptText('Enter your name', 'Developer');
const options = ['Option A', 'Option B', 'Option C'];
const index = await promptSelect('Choose:', options);
console.log(`Selected: ${options[index]}`);
```

## Testing

A test script (`test-utils.ts`) is provided to verify all utilities work correctly:

```bash
bun test-utils.ts
```

## Building

```bash
# Regular build
bun run build

# Standalone binary
bun run build:standalone

# Development mode with hot reload
bun run dev
```

## Key Benefits

1. **Bun-Native**: Uses `Bun.spawn()` for command execution
2. **Minimal Dependencies**: Only necessary packages, using built-in Node.js features where possible
3. **Type-Safe**: Full TypeScript support with proper types
4. **Error Handling**: Comprehensive error handling with custom error classes
5. **Observable**: Debug logging and timing information for all commands
6. **User-Friendly**: Clear output formatting and intuitive prompts

## Integration Ready

These utilities are ready to be used by:
- Command implementations (`src/commands/*.ts`)
- System checks (`src/checks/*.ts`)
- Setup guides (`src/guides/*.ts`)

All imports should use `.js` extension (ES modules) and relative paths from `src/`.
