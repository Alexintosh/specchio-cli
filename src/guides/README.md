# Specchio Setup Guides

Interactive guide functions for the Specchio CLI setup tool.

## Overview

Each guide provides step-by-step interactive instructions for completing a specific setup task. Guides use colored console output, user prompts, and automatic verification to make the setup process as smooth as possible.

## Available Guides

### 1. Xcode Installation (`xcode-install.ts`)

**Function:** `guideXcodeInstallation()`

Guides users through installing Xcode from either:
- App Store (recommended)
- Terminal using `mas` CLI

**Features:**
- Checks if Xcode is already installed
- Opens App Store to Xcode page
- Supports mas CLI installation
- Verifies installation after completion
- Displays Xcode version

**Documentation Reference:** `docs/installation.md#install-xcode`

---

### 2. License Acceptance (`license.ts`)

**Function:** `guideLicenseAcceptance()`

Guides users through accepting the Xcode license via:
- Terminal with sudo (recommended)
- Xcode GUI

**Features:**
- Checks current license status
- Accepts license via `sudo xcodebuild -license accept`
- Opens Xcode for GUI acceptance
- Verifies acceptance

**Documentation Reference:** `docs/installation.md#accept-the-xcode-license`

---

### 3. iOS SDK Installation (`ios-sdk.ts`)

**Function:** `guideIOSSDKInstallation()`

Guides users through installing the iOS Platform SDK via:
- Xcode Settings → Platforms (recommended)
- Terminal (limited support)

**Features:**
- Checks if iOS SDK is already installed
- Opens Xcode Settings to Platforms tab
- Displays iOS SDK version
- Verifies installation

**Documentation Reference:** `docs/installation.md#install-ios-platform-sdk`

---

### 4. Certificate Creation (`certificate.ts`)

**Function:** `guideCertificateCreation()`

Guides users through creating an Apple Development certificate.

**Features:**
- Checks for existing certificates
- Verifies Apple ID availability
- Opens Xcode Settings → Accounts
- Step-by-step certificate creation instructions
- Verifies certificate creation

**Documentation Reference:** `docs/installation.md#create-an-apple-development-certificate`

---

### 5. Developer Mode (`developer-mode.ts`)

**Function:** `guideDeveloperMode()`

Guides users through enabling Developer Mode on their iPhone.

**Features:**
- Checks for connected iPhone
- Provides detailed iOS 16+ instructions
- Includes troubleshooting tips
- Opens Xcode for device detection
- Explains prerequisites

**Documentation Reference:** `docs/device-setup.md#enable-developer-mode`

---

### 6. Trust Mac (`trust.ts`)

**Function:** `guideTrustMac()`

Guides users through trusting their Mac on their iPhone.

**Features:**
- Checks for connected device
- Automatic trust via Xcode (recommended)
- Manual trust via iPhone Settings
- Opens Xcode Devices and Simulators
- Verifies trust status

**Documentation Reference:** `docs/device-setup.md#trust-your-mac`

---

## Usage

### Import Individual Guides

```typescript
import { guideXcodeInstallation } from './guides/xcode-install.js';
import { guideLicenseAcceptance } from './guides/license.js';

// Run a specific guide
await guideXcodeInstallation();
```

### Import All Guides

```typescript
import * as guides from './guides/index.js';

// Access any guide
await guides.guideXcodeInstallation();
await guides.guideLicenseAcceptance();
```

## Guide Function Signature

All guide functions follow this signature:

```typescript
async function guideXxx(): Promise<boolean>
```

**Returns:**
- `true` - Guide completed successfully
- `false` - Guide failed or was cancelled

## Dependencies

Guides rely on these utility modules:

- `./utils/output.ts` - Colored console output (printSuccess, printError, etc.)
- `./utils/prompts.ts` - User interaction (promptYesNo, promptContinue)
- `./utils/exec.ts` - Shell command execution (exec, execQuiet)

## Design Principles

### 1. Clear Step-by-Step Instructions

Each guide breaks down complex tasks into numbered steps with clear descriptions.

### 2. User Choice

Users can choose between different methods (GUI vs Terminal) based on their preference.

### 3. Verification

After each guide, users are asked to confirm completion and the system verifies when possible.

### 4. Error Handling

Guides gracefully handle errors and provide fallback options or manual instructions.

### 5. Integration with Documentation

All guides reference the official documentation for detailed information.

## Color Scheme

- ✓ Green - Success messages
- ✗ Red - Error messages
- ⚠ Yellow - Warning messages
- ℹ Cyan - Informational messages
- → Bold text - Headers and emphasis

## Testing

To test all guides:

```bash
bun run cli/src/guides/test.ts
```

This will verify all guides are properly implemented and importable.

## Future Enhancements

Potential improvements:

- Add progress bars for long-running operations
- Save guide completion state to resume later
- Generate diagnostic reports
- Add silent mode for automation
- Support for additional languages
- Integration with Specchio app for in-app setup

## Contributing

When adding new guides:

1. Follow the existing naming convention: `xxx-guide.ts`
2. Use the output utilities for consistent formatting
3. Include verification logic when possible
4. Reference documentation sources
5. Export from `index.ts`
6. Update this README

## License

Part of the Specchio project. See main project LICENSE.
