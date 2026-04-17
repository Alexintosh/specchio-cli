#!/usr/bin/env bun

/**
 * Specchio Setup CLI
 * Interactive setup tool for Specchio iOS development environment
 */

import { printSuccess, printError, printWarning, printInfo, printHeader, printCommand, printDivider, printBlank, printHighlight, printBullet } from './utils/output.js';
import { promptYesNo, promptContinue, promptSelect, promptText } from './utils/prompts.js';
import { exec, execQuiet, commandExists } from './utils/exec.js';

// Import all checks
import {
  checkMacOSVersion,
  checkXcodeInstallation,
  checkXcodeLicense,
  checkIOSSDK,
  checkCertificate,
  checkConnectedDevice
} from './checks/index.js';

// Import all guides
import {
  guideXcodeInstallation,
  guideLicenseAcceptance,
  guideIOSSDKInstallation,
  guideCertificateCreation,
  guideDeveloperMode,
  guideTrustMac
} from './guides/index.js';

const VERSION = '1.0.0';
const CLI_NAME = 'specchio';

/**
 * Parse command line arguments
 */
interface ParsedArgs {
  command: string;
  args: string[];
  flags: Map<string, string | boolean>;
}

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  const flags = new Map<string, string | boolean>();
  let command = 'setup'; // Default command
  const commandArgs: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      // Long flag
      const flagName = arg.slice(2);
      if (flagName.includes('=')) {
        const [name, value] = flagName.split('=');
        flags.set(name, value);
      } else {
        flags.set(flagName, true);
      }
    } else if (arg.startsWith('-')) {
      // Short flag
      const flagName = arg.slice(1);
      flags.set(flagName, true);
    } else {
      // Positional argument
      if (!command || command === 'setup') {
        command = arg;
      } else {
        commandArgs.push(arg);
      }
    }
  }

  return { command, args: commandArgs, flags };
}

/**
 * Display help message
 */
function showHelp(command?: string): void {
  printHeader(`${CLI_NAME} - Specchio Setup CLI`);
  printBlank();

  printInfo('Interactive setup tool for Specchio iOS development environment');
  printBlank();

  if (command === 'check') {
    printHighlight('Check Commands:');
    printBlank();
    printCommand('specchio check');
    printBullet('Run all system checks');
    printBlank();
    printCommand('specchio check <name>');
    printBullet('Run a specific check');
    printBlank();
    printHighlight('Available checks:');
    printBullet('macos       - Check macOS version');
    printBullet('xcode       - Check Xcode installation');
    printBullet('license     - Check Xcode license status');
    printBullet('ios-sdk     - Check iOS SDK installation');
    printBullet('certificate - Check code signing certificate');
    printBullet('device      - Check connected iOS device');
    return;
  }

  printHighlight('Usage:');
  printBlank();
  printCommand(`${CLI_NAME} [command] [options]`);
  printBlank();

  printHighlight('Commands:');
  printBlank();
  printCommand('specchio');
  printBullet('Interactive setup wizard (default)');
  printBlank();
  printCommand('specchio setup');
  printBullet('Start interactive setup wizard');
  printBlank();
  printCommand('specchio check [name]');
  printBullet('Run all checks or a specific check');
  printBlank();
  printCommand('specchio fix');
  printBullet('Attempt to automatically fix issues');
  printBlank();
  printCommand('specchio doctor');
  printBullet('Show diagnostic information');
  printBlank();
  printCommand('specchio verify');
  printBullet('Verify current setup status');
  printBlank();

  printHighlight('Options:');
  printBlank();
  printBullet('--help, -h     Show this help message');
  printBullet('--version, -v  Show version information');
  printBullet('--verbose      Show detailed output');
  printBlank();

  printHighlight('Examples:');
  printBlank();
  printCommand(`${CLI_NAME}                    # Start setup wizard`);
  printCommand(`${CLI_NAME} check              # Run all checks`);
  printCommand(`${CLI_NAME} check xcode        # Check Xcode only`);
  printCommand(`${CLI_NAME} fix                # Attempt fixes`);
  printCommand(`${CLI_NAME} doctor             # Show diagnostics`);
  printBlank();

  printHighlight('Documentation:');
  printBlank();
  printBullet('https://specchio.dev/installation');
  printBullet('https://specchio.dev/device-setup');
}

/**
 * Display version information
 */
function showVersion(): void {
  printInfo(`${CLI_NAME} v${VERSION}`);
  printInfo('Interactive setup tool for Specchio iOS development');
}

/**
 * Show diagnostic information (doctor command)
 */
async function showDoctor(): Promise<void> {
  printHeader('Specchio Setup - Diagnostics');
  printBlank();

  printInfo('Collecting system information...');
  printBlank();

  try {
    // System information
    printHighlight('System Information:');
    printBlank();

    const macosResult = await checkMacOSVersion();
    printBullet(`macOS: ${macosResult.message}`);

    const arch = await execQuiet('uname -m');
    printBullet(`Architecture: ${arch.stdout}`);

    const bunVersion = await execQuiet('bun --version');
    printBullet(`Bun: ${bunVersion.stdout}`);

    printBlank();

    // Xcode information
    printHighlight('Xcode Information:');
    printBlank();

    try {
      const xcodeVersion = await execQuiet('xcodebuild -version');
      printBullet(`Xcode: ${xcodeVersion.stdout.split('\n').join(', ')}`);
    } catch {
      printError('Xcode: Not installed or not accessible');
    }

    try {
      const licenseStatus = await execQuiet('xcodebuild -checkFirstLaunchStatus');
      printBullet(`License: ${licenseStatus.stdout}`);
    } catch {
      printError('License: Status unknown');
    }

    printBlank();

    // Development tools
    printHighlight('Development Tools:');
    printBlank();

    const tools = ['git', 'brew', 'node', 'bun'];
    for (const tool of tools) {
      const exists = await commandExists(tool);
      if (exists) {
        try {
          const version = await execQuiet(`${tool} --version`);
          printSuccess(`${tool}: ${version.stdout.split('\n')[0]}`);
        } catch {
          printSuccess(`${tool}: Installed`);
        }
      } else {
        printWarning(`${tool}: Not found`);
      }
    }

    printBlank();

    // Certificate information
    printHighlight('Code Signing:');
    printBlank();

    try {
      const certResult = await execQuiet('security find-identity -v -p codesigning');
      if (certResult.stdout.includes('Apple Development')) {
        printSuccess('Apple Development certificate found');
      } else {
        printWarning('No Apple Development certificate found');
      }
    } catch {
      printError('Could not check certificates');
    }

    printBlank();

    // Device information
    printHighlight('Connected Devices:');
    printBlank();

    try {
      const deviceResult = await execQuiet('xcrun devicectl list devices');
      if (deviceResult.stdout.includes('iPhone') || deviceResult.stdout.includes('iPad')) {
        printSuccess('iOS device detected');
        // Extract device info
        const lines = deviceResult.stdout.split('\n');
        for (const line of lines) {
          if (line.includes('iPhone') || line.includes('iPad')) {
            printBullet(line.trim());
          }
        }
      } else {
        printWarning('No iOS device detected');
      }
    } catch {
      printWarning('Could not check for devices');
    }

    printBlank();
    printInfo('Diagnostic complete. Include this output when reporting issues.');

  } catch (error) {
    printError(`Error collecting diagnostics: ${error}`);
  }
}

/**
 * Run a specific check by name
 */
async function runCheck(checkName?: string): Promise<boolean> {
  if (!checkName) {
    // Run all checks
    printHeader('Specchio Setup - System Checks');
    printBlank();

    const checks = [
      { name: 'macOS Version', fn: checkMacOSVersion },
      { name: 'Xcode Installation', fn: checkXcodeInstallation },
      { name: 'Xcode License', fn: checkXcodeLicense },
      { name: 'iOS SDK', fn: checkIOSSDK },
      { name: 'Code Signing Certificate', fn: checkCertificate },
      { name: 'Connected Device', fn: checkConnectedDevice }
    ];

    let passed = 0;
    let failed = 0;

    for (const check of checks) {
      try {
        const result = await check.fn();
        if (result.passed) {
          printSuccess(result.message);
          passed++;
        } else {
          printError(result.message);
          if (result.fix) {
            printInfo(`Fix: ${result.fix}`);
          }
          failed++;
        }
      } catch (error) {
        printError(`${check.name}: ${error}`);
        failed++;
      }
    }

    printBlank();
    printHighlight(`Results: ${passed} passed, ${failed} failed`);

    return failed === 0;
  }

  // Run specific check
  const checkMap: Record<string, () => Promise<import('./types.js').CheckResult>> = {
    'macos': checkMacOSVersion,
    'xcode': checkXcodeInstallation,
    'license': checkXcodeLicense,
    'ios-sdk': checkIOSSDK,
    'certificate': checkCertificate,
    'device': checkConnectedDevice
  };

  const checkFn = checkMap[checkName.toLowerCase()];
  if (!checkFn) {
    printError(`Unknown check: ${checkName}`);
    printInfo('Available checks: macos, xcode, license, ios-sdk, certificate, device');
    return false;
  }

  try {
    const result = await checkFn();
    if (result.passed) {
      printSuccess(result.message);
      return true;
    } else {
      printError(result.message);
      if (result.fix) {
        printInfo(`Fix: ${result.fix}`);
      }
      return false;
    }
  } catch (error) {
    printError(`Check failed: ${error}`);
    return false;
  }
}

/**
 * Attempt to fix issues automatically
 */
async function runFix(): Promise<void> {
  printHeader('Specchio Setup - Fix Issues');
  printBlank();

  printInfo('This command will attempt to automatically fix common issues.');
  printBlank();

  let fixed = 0;
  let notFixed = 0;

  // Check Xcode license
  try {
    const licenseResult = await checkXcodeLicense();
    if (!licenseResult.passed) {
      printInfo('Attempting to accept Xcode license...');
      try {
        await execWithSudo('xcodebuild -license accept');
        printSuccess('Xcode license accepted');
        fixed++;
      } catch {
        printError('Failed to accept Xcode license automatically');
        printInfo('Please run: sudo xcodebuild -license accept');
        notFixed++;
      }
    }
  } catch (error) {
    printError(`Error checking license: ${error}`);
  }

  // Check Xcode developer tools
  try {
    const xcodeResult = await checkXcodeInstallation();
    if (xcodeResult.passed) {
      try {
        await exec('xcode-select --install 2>&1 | grep "installed" || true');
        printSuccess('Xcode developer tools configured');
      } catch {
        // Ignore errors, might already be installed
      }
    }
  } catch (error) {
    // Ignore
  }

  printBlank();
  printHighlight(`Fixed: ${fixed}, Not fixed: ${notFixed}`);

  if (notFixed > 0) {
    printBlank();
    printInfo('Some issues require manual intervention. See the fix suggestions above.');
  }
}

/**
 * Verify current setup status
 */
async function runVerify(): Promise<void> {
  printHeader('Specchio Setup - Verification');
  printBlank();

  printInfo('Checking your current setup status...');
  printBlank();

  const allPassed = await runCheck();

  printBlank();

  if (allPassed) {
    printSuccess('All checks passed! Your system is ready for Specchio development.');
    printBlank();
    printInfo('Next steps:');
    printBullet('Connect your iPhone via USB');
    printBullet('Enable Developer Mode on your iPhone');
    printBullet('Trust this Mac on your iPhone');
    printBlank();
    printInfo('See https://specchio.dev/device-setup for detailed instructions');
  } else {
    printWarning('Some checks failed. Run "specchio fix" to attempt automatic fixes.');
    printBlank();
    printInfo('Or run the interactive setup wizard:');
    printCommand('specchio');
  }
}

/**
 * Run interactive setup wizard
 */
async function runSetup(): Promise<void> {
  printHeader('Specchio Setup Wizard');
  printBlank();

  printInfo('Welcome to Specchio! This wizard will guide you through setting up');
  printInfo('your development environment for iOS app deployment.');
  printBlank();

  printInfo('You will need:');
  printBullet('A Mac with macOS 14.0 (Sonoma) or later');
  printBullet('Xcode from the App Store (~15 GB download)');
  printBullet('An Apple ID (free)');
  printBullet('An iPhone or iPad for testing');
  printBlank();

  const shouldContinue = await promptYesNo('Ready to begin?');
  if (!shouldContinue) {
    printInfo('Setup cancelled. Run this command again when you\'re ready.');
    return;
  }

  printBlank();

  // Phase 1: Mac Setup
  printHighlight('Phase 1: Mac Setup');
  printBlank();

  // Check macOS version
  const macosResult = await checkMacOSVersion();
  if (!macosResult.passed) {
    printError(macosResult.message);
    printInfo(macosResult.fix || 'Please upgrade your macOS version');
    return;
  }
  printSuccess(macosResult.message);

  // Check Xcode
  const xcodeResult = await checkXcodeInstallation();
  if (!xcodeResult.passed) {
    printError(xcodeResult.message);
    const shouldInstall = await promptYesNo('Would you like to install Xcode now?');
    if (shouldInstall) {
      await guideXcodeInstallation();
    } else {
      printInfo('Xcode is required to continue. Please install it and run this wizard again.');
      return;
    }
  } else {
    printSuccess(xcodeResult.message);
  }

  // Check license
  const licenseResult = await checkXcodeLicense();
  if (!licenseResult.passed) {
    printWarning(licenseResult.message);
    const shouldAccept = await promptYesNo('Accept Xcode license now? (requires sudo)');
    if (shouldAccept) {
      await guideLicenseAcceptance();
    } else {
      printInfo('License must be accepted to continue');
      return;
    }
  } else {
    printSuccess(licenseResult.message);
  }

  // Check iOS SDK
  const sdkResult = await checkIOSSDK();
  if (!sdkResult.passed) {
    printWarning(sdkResult.message);
    const shouldInstall = await promptYesNo('Install iOS SDK now?');
    if (shouldInstall) {
      await guideIOSSDKInstallation();
    }
  } else {
    printSuccess(sdkResult.message);
  }

  // Check certificate
  const certResult = await checkCertificate();
  if (!certResult.passed) {
    printWarning(certResult.message);
    const shouldCreate = await promptYesNo('Create Apple Development certificate now?');
    if (shouldCreate) {
      await guideCertificateCreation();
    }
  } else {
    printSuccess(certResult.message);
  }

  printBlank();

  // Phase 2: Device Setup
  printHighlight('Phase 2: Device Setup');
  printBlank();

  // Check for connected device
  const deviceResult = await checkConnectedDevice();
  if (!deviceResult.passed) {
    printWarning(deviceResult.message);
    printInfo('Please connect your iPhone via USB and ensure it\'s unlocked');
    await promptContinue('Press Enter when your device is connected...');

    const retryResult = await checkConnectedDevice();
    if (!retryResult.passed) {
      printError('Device not detected. Please check:');
      printBullet('USB cable is properly connected');
      printBullet('iPhone is unlocked');
      printBullet('You\'ve trusted this computer on the iPhone');
      return;
    }
  }

  printSuccess(deviceResult.message);

  // Guide developer mode
  await guideDeveloperMode();

  // Guide trust
  await guideTrustMac();

  // WiFi debugging (optional)
  printBlank();
  const enableWiFi = await promptYesNo('Enable WiFi debugging? (allows wireless deployment)');
  if (enableWiFi) {
    printInfo('To enable WiFi debugging:');
    printBullet('Keep your device connected via USB');
    printBullet('In Xcode: Window → Devices and Simulators');
    printBullet('Select your device → Check "Connect via network"');
    printBlank();
    await promptContinue('Press Enter when you\'ve enabled WiFi debugging');
  }

  printBlank();
  printSuccess('Setup complete!');
  printBlank();
  printInfo('Your system is now ready for Specchio development!');
  printInfo('For more information, visit: https://specchio.dev');
}

/**
 * Main entry point
 */
async function main() {
  const { command, args, flags } = parseArgs();

  // Handle global flags
  if (flags.has('help') || flags.has('h')) {
    showHelp(command);
    return;
  }

  if (flags.has('version') || flags.has('v')) {
    showVersion();
    return;
  }

  // Route to appropriate command
  switch (command) {
    case 'help':
      showHelp(args[0]);
      break;

    case 'version':
      showVersion();
      break;

    case 'check':
      await runCheck(args[0]);
      break;

    case 'fix':
      await runFix();
      break;

    case 'doctor':
      await showDoctor();
      break;

    case 'verify':
      await runVerify();
      break;

    case 'setup':
    default:
      await runSetup();
      break;
  }
}

main().catch(error => {
  printError(`Error: ${error.message}`);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
