/**
 * Guide for trusting the Mac on iPhone
 */

import { printHeader, printStep, printNumbered, printBullet, printSuccess, printError, printInfo, printDivider, printHighlight } from '../utils/output.js';
import { promptYesNo, promptContinue } from '../utils/prompts.js';
import { exec, execQuiet } from '../utils/exec.js';

/**
 * Guide user through trusting the Mac on iPhone
 */
export async function guideTrustMac(): Promise<boolean> {
  printHeader('Trust Your Mac on iPhone');
  printDivider();
  
  printInfo('Your iPhone needs to trust your Mac for development purposes.');
  printInfo('This allows Specchio to install and run apps on your device.');
  printDivider();
  
  // Check if device is connected
  const deviceConnected = await checkDeviceConnected();
  if (!deviceConnected) {
    printError('No iPhone detected');
    printInfo('Please connect your iPhone via USB and ensure it is unlocked');
    printDivider();
    await promptContinue('Press Enter after connecting your iPhone...');
  }
  
  // Provide trust instructions
  await provideTrustInstructions();
  
  // Wait for user to complete
  printDivider();
  await promptContinue('Press Enter after trusting your Mac...');
  
  // Verify by checking if device is accessible
  const verified = await verifyTrust();
  if (verified) {
    printSuccess('Your iPhone now trusts your Mac!');
    return true;
  } else {
    printWarning('Could not verify trust status');
    printInfo('If you completed the trust steps, you should be all set');
    return true; // Assume success since verification is limited
  }
}

/**
 * Check if an iOS device is connected
 */
async function checkDeviceConnected(): Promise<boolean> {
  try {
    const result = await execQuiet('xcrun devicectl list devices');
    return result.stdout.includes('iPhone') || result.stdout.includes('iPad');
  } catch {
    return false;
  }
}

/**
 * Provide instructions for trusting the Mac
 */
async function provideTrustInstructions(): Promise<void> {
  printStep(1, 1, 'Trust Your Mac on Your iPhone');
  printDivider();
  
  printHighlight('Method 1: Automatic Trust via Xcode (Recommended)');
  printNumbered(1, 'With your iPhone connected via USB, open Xcode');
  printNumbered(2, 'Go to Window → Devices and Simulators');
  printNumbered(3, 'Select your iPhone from the list');
  printNumbered(4, 'Click "Use for Development" or "Trust"');
  printNumbered(5, 'On your iPhone, tap "Trust" when prompted');
  printNumbered(6, 'Enter your passcode if prompted');
  printDivider();
  
  const openXcode = await promptYesNo('Open Xcode Devices and Simulators now?');
  if (openXcode) {
    try {
      // Open Xcode and navigate to Devices and Simulators
      await exec('open -a Xcode');
      await exec('osascript -e \'tell application "System Events" to keystroke "f" using {command down, shift down, control down}\'');
      printSuccess('Xcode opened');
      printInfo('Navigate to Window → Devices and Simulators');
      printInfo('Select your iPhone and click "Use for Development"');
    } catch {
      printError('Could not open Devices and Simulators directly');
      printInfo('Please open Xcode and go to Window → Devices and Simulators manually');
    }
  }
  
  printDivider();
  printHighlight('Method 2: Manual Trust via Device Settings');
  printInfo('If the automatic method does not work:');
  printNumbered(1, 'On your iPhone, open Settings');
  printNumbered(2, 'Go to General → VPN & Device Management');
  printNumbered(3, 'Look for your "Developer App" certificate');
  printNumbered(4, 'Tap it and tap "Trust [Your Name]"');
  printDivider();
  
  printHighlight('Verify Trust:');
  printBullet('Run this command on your Mac:');
  printCommand('xcrun devicectl list devices');
  printBullet('Your iPhone should appear in the list with its name and UDID');
  printDivider();
  
  const verifyNow = await promptYesNo('Run verification command now?');
  if (verifyNow) {
    try {
      const result = await execQuiet('xcrun devicectl list devices');
      console.log(result.stdout);
      
      if (result.stdout.includes('iPhone') || result.stdout.includes('iPad')) {
        printSuccess('Device detected! Your Mac should be trusted.');
      } else {
        printWarning('Device not detected. Ensure USB connection and try again.');
      }
    } catch {
      printError('Could not list devices');
    }
  }
}

/**
 * Verify that the Mac is trusted by checking device access
 */
async function verifyTrust(): Promise<boolean> {
  try {
    const result = await execQuiet('xcrun devicectl list devices');
    // If we can see the device, trust is likely established
    return result.stdout.includes('iPhone') || result.stdout.includes('iPad');
  } catch {
    return false;
  }
}
