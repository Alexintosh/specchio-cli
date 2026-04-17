/**
 * Guide for iOS Platform SDK installation
 */

import { printHeader, printStep, printNumbered, printBullet, printCommand, printSuccess, printError, printInfo, printDivider, printHighlight } from '../utils/output.js';
import { promptYesNo, promptContinue } from '../utils/prompts.js';
import { exec, execQuiet } from '../utils/exec.js';

const IOS_SDK_SIZE_GB = 6;
const ESTIMATED_TIME_MINUTES = 20;

/**
 * Guide user through iOS SDK installation
 */
export async function guideIOSSDKInstallation(): Promise<boolean> {
  printHeader('iOS Platform SDK Installation Guide');
  printDivider();
  
  // Check current SDK status
  const installed = await checkIOSSDKInstalled();
  if (installed) {
    const version = await getIOSSDKVersion();
    printSuccess(`iOS SDK is already installed: ${version}`);
    return true;
  }

  printInfo('Specchio needs the iOS platform SDK to communicate with your iPhone.');
  printInfo(`Size: ~${IOS_SDK_SIZE_GB} GB | Estimated time: ${ESTIMATED_TIME_MINUTES} minutes`);
  printDivider();

  // Present installation options
  printStep(1, 2, 'Choose Installation Method');
  printNumbered(1, 'Xcode Settings (Recommended) - GUI, easiest');
  printNumbered(2, 'Terminal (Advanced) - Command-line based');
  printDivider();

  const useTerminal = await promptYesNo('Install via Terminal (advanced)?');

  if (useTerminal) {
    return await installViaTerminal();
  } else {
    return await installViaXcode();
  }
}

/**
 * Check if iOS SDK is installed
 */
async function checkIOSSDKInstalled(): Promise<boolean> {
  try {
    const result = await execQuiet('xcodebuild -showsdks');
    return result.stdout.includes('iphoneos');
  } catch {
    return false;
  }
}

/**
 * Get installed iOS SDK version
 */
async function getIOSSDKVersion(): Promise<string> {
  try {
    const result = await execQuiet('xcodebuild -showsdks');
    const lines = result.stdout.split('\n');
    const iosLine = lines.find(line => line.includes('iphoneos'));
    if (iosLine) {
      const match = iosLine.match(/iphoneos(\d+\.\d+)/);
      return match ? `iOS ${match[1]}` : 'iOS SDK';
    }
    return 'iOS SDK';
  } catch {
    return 'iOS SDK';
  }
}

/**
 * Install iOS SDK via Xcode Settings
 */
async function installViaXcode(): Promise<boolean> {
  printStep(2, 2, 'Install via Xcode Settings');
  printDivider();
  
  printNumbered(1, 'Open Xcode');
  printNumbered(2, 'Go to Xcode → Settings (or Preferences)');
  printNumbered(3, 'Click the "Platforms" tab');
  printNumbered(4, 'Find "iOS" in the list');
  printNumbered(5, 'Click "Get" or "Download" button');
  printNumbered(6, 'Wait for download to complete');
  printDivider();
  
  const openXcode = await promptYesNo('Open Xcode Settings now?');
  if (openXcode) {
    try {
      // Open Xcode directly to settings
      await exec('open "xcode://settings"');
      printSuccess('Xcode Settings opened');
      printInfo('Navigate to the "Platforms" tab to install iOS SDK');
    } catch {
      printError('Failed to open Xcode Settings');
      printInfo('Please open Xcode manually and go to Settings → Platforms');
    }
  }
  
  printDivider();
  printHighlight('Please install the iOS SDK in Xcode Settings');
  printBullet('Look for "iOS" under the Platforms tab');
  printBullet('Click "Get" or "Download" to start the download');
  printDivider();
  
  await promptContinue('Press Enter after iOS SDK has finished downloading...');
  
  // Verify
  const verified = await checkIOSSDKInstalled();
  if (verified) {
    const version = await getIOSSDKVersion();
    printSuccess(`iOS SDK installed: ${version}`);
    return true;
  } else {
    printError('Could not verify iOS SDK installation');
    printInfo('Please ensure iOS appears in Xcode → Settings → Platforms');
    return false;
  }
}

/**
 * Install iOS SDK via Terminal
 */
async function installViaTerminal(): Promise<boolean> {
  printStep(2, 2, 'Install via Terminal');
  printDivider();
  
  printInfo('Installing iOS SDK via Terminal requires using xcodebuild');
  printInfo('Note: This method may not work on all Xcode versions');
  printDivider();
  
  // First, show available SDKs
  printNumbered(1, 'Check available platforms');
  printCommand('xcodebuild -showsdks');
  printDivider();
  
  const showSDKs = await promptYesNo('Show available SDKs now?');
  if (showSDKs) {
    try {
      const result = await execQuiet('xcodebuild -showsdks');
      console.log(result.stdout);
    } catch {
      printWarning('Could not list SDKs');
    }
  }
  
  printDivider();
  printHighlight('Note: iOS SDK installation typically requires Xcode GUI');
  printInfo('The Terminal method is limited and may not work on all systems');
  printDivider();
  
  const tryGUI = await promptYesNo('Would you like to use the Xcode Settings method instead?');
  if (tryGUI) {
    return await installViaXcode();
  }
  
  printInfo('Please use Xcode Settings to install the iOS SDK:');
  printCommand('open "xcode://settings"');
  printDivider();
  
  await promptContinue('Press Enter after installing iOS SDK via Xcode Settings...');
  
  // Verify
  const verified = await checkIOSSDKInstalled();
  if (verified) {
    const version = await getIOSSDKVersion();
    printSuccess(`iOS SDK installed: ${version}`);
    return true;
  } else {
    printError('Could not verify iOS SDK installation');
    return false;
  }
}
