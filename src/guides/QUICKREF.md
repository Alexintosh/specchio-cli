# Guide Functions Quick Reference

## Import Individual Guides

```typescript
// Xcode Installation
import { guideXcodeInstallation } from './guides/xcode-install.js';
await guideXcodeInstallation();

// License Acceptance
import { guideLicenseAcceptance } from './guides/license.js';
await guideLicenseAcceptance();

// iOS SDK Installation
import { guideIOSSDKInstallation } from './guides/ios-sdk.js';
await guideIOSSDKInstallation();

// Certificate Creation
import { guideCertificateCreation } from './guides/certificate.js';
await guideCertificateCreation();

// Developer Mode
import { guideDeveloperMode } from './guides/developer-mode.js';
await guideDeveloperMode();

// Trust Mac
import { guideTrustMac } from './guides/trust.js';
await guideTrustMac();
```

## Import All Guides

```typescript
import * as guides from './guides/index.js';

// Use any guide
await guides.guideXcodeInstallation();
await guides.guideLicenseAcceptance();
```

## Return Values

All guide functions return `Promise<boolean>`:
- `true` - Guide completed successfully
- `false` - Guide failed or was cancelled

## Typical Usage Pattern

```typescript
// Run setup sequence
async function runSetup() {
  // Step 1: Install Xcode
  const xcodeOk = await guides.guideXcodeInstallation();
  if (!xcodeOk) {
    console.error('Xcode installation failed');
    return;
  }
  
  // Step 2: Accept license
  const licenseOk = await guides.guideLicenseAcceptance();
  if (!licenseOk) {
    console.error('License acceptance failed');
    return;
  }
  
  // Continue with remaining steps...
}
```

## Output Functions

```typescript
import { printSuccess, printError, printWarning, printInfo } from './utils/output.js';

printSuccess('Operation completed!');
printError('Something went wrong');
printWarning('Please check this');
printInfo('Here is some information');
```

## Prompt Functions

```typescript
import { promptYesNo, promptContinue } from './utils/prompts.js';

// Yes/No prompt
const answer = await promptYesNo('Continue?');
if (answer) {
  // User said yes
}

// Continue prompt
await promptContinue('Press Enter to continue...');
```

## Exec Functions

```typescript
import { exec, execQuiet, execWithSudo } from './utils/exec.js';

// Execute command (throws on error)
const output = await exec('xcodebuild -version');

// Execute quietly (no throw)
const result = await execQuiet('xcodebuild -version');
console.log(result.stdout, result.stderr, result.exitCode);

// Execute with sudo
const sudoOutput = await execWithSudo('xcodebuild -license accept');
```

## Guide Flow

Each guide follows this pattern:

1. **Check** - Verify if task is already complete
2. **Inform** - Show what will be done
3. **Guide** - Provide step-by-step instructions
4. **Interact** - Prompt user for choices/confirmations
5. **Execute** - Open apps/run commands when helpful
6. **Wait** - Let user complete manual steps
7. **Verify** - Check if task completed successfully
8. **Return** - Boolean indicating success/failure

## Color Scheme

- ✓ Green (`\x1b[32m`) - Success
- ✗ Red (`\x1b[31m`) - Error  
- ⚠ Yellow (`\x1b[33m`) - Warning
- ℹ Cyan (`\x1b[36m`) - Info
- Bold (`\x1b[1m`) - Headers
- Dim (`\x1b[90m`) - Secondary text

## Testing

```bash
# Test all guides
bun run cli/src/guides/test.ts

# Test individual guide (if standalone)
bun run cli/src/guides/xcode-install.ts
```

## Integration Example

```typescript
#!/usr/bin/env bun

import * as guides from './guides/index.js';
import { printHeader, printSuccess, printError } from './utils/output.js';

async function main() {
  printHeader('Specchio Setup');
  
  try {
    // Mac setup phase
    await guides.guideXcodeInstallation();
    await guides.guideLicenseAcceptance();
    await guides.guideIOSSDKInstallation();
    await guides.guideCertificateCreation();
    
    // Device setup phase
    await guides.guideDeveloperMode();
    await guides.guideTrustMac();
    
    printSuccess('Setup complete!');
  } catch (error) {
    printError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

main();
```
