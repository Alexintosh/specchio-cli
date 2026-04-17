/**
 * Guide for enabling Developer Mode on iPhone
 */

import { printHeader, printStep, printNumbered, printBullet, printSuccess, printError, printInfo, printDivider, printHighlight } from '../utils/output.js';
import { promptYesNo, promptContinue } from '../utils/prompts.js';
import { exec, execQuiet } from '../utils/exec.js';

/**
 * Guide user through enabling Developer Mode on iPhone
 */
export async function guideDeveloperMode(): Promise<boolean> {
  printHeader('Developer Mode Enablement Guide');
  printDivider();
  
  printInfo('Developer Mode is required for Specchio to install and run WebDriverAgent on your iPhone.');
  printInfo('Developer Mode is an official Apple feature for running development tools.');
  printDivider();
  
  // Check if iPhone is connected
  const deviceConnected = await checkDeviceConnected();
  if (!deviceConnected) {
    printError('No iPhone detected');
    printInfo('Please connect your iPhone via USB and ensure it is unlocked');
    printDivider();
    await promptContinue('Press Enter after connecting your iPhone...');
  }
  
  // Provide instructions for enabling Developer Mode
  await provideInstructions();
  
  // Since we can't programmatically verify Developer Mode, just confirm
  printDivider();
  printSuccess('Developer Mode setup instructions provided!');
  printInfo('Please follow the steps above on your iPhone');
  printDivider();
  
  const confirmed = await promptYesNo('Have you enabled Developer Mode on your iPhone?');
  if (confirmed) {
    printSuccess('Developer Mode enabled!');
    return true;
  } else {
    printInfo('Please enable Developer Mode to continue with Specchio setup');
    return false;
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
 * Provide step-by-step instructions for enabling Developer Mode
 */
async function provideInstructions(): Promise<void> {
  printStep(1, 1, 'Enable Developer Mode on Your iPhone');
  printDivider();
  
  printHighlight('Prerequisites:');
  printBullet('iPhone must be running iOS 16 or later');
  printBullet('iPhone must be connected to your Mac via USB');
  printBullet('Xcode must be installed on your Mac');
  printDivider();
  
  printNumbered(1, 'On your iPhone, open Settings');
  printNumbered(2, 'Go to Privacy & Security');
  printNumbered(3, 'Scroll down and find Developer Mode');
  printNumbered(4, 'Tap it to open Developer Mode settings');
  printNumbered(5, 'Toggle Developer Mode to ON');
  printNumbered(6, 'You will see a warning — tap Restart to reboot your device');
  printNumbered(7, 'After restart, you will be prompted to confirm — tap Turn On');
  printDivider();
  
  printHighlight('After Your iPhone Restarts:');
  printBullet('Unlock your iPhone');
  printBullet('Reconnect to your Mac via USB if needed');
  printBullet('You may see a "Trust This Computer" prompt again — tap Trust');
  printBullet('Enter your passcode if prompted');
  printDivider();
  
  printInfo('Note: Developer Mode option only appears after:');
  printBullet('Xcode is installed on your Mac');
  printBullet('Your iPhone is connected to your Mac');
  printBullet('You have opened Xcode at least once');
  printDivider();
  
  // Troubleshooting
  printHighlight('Troubleshooting:');
  printBullet('If Developer Mode is missing: Update to iOS 16+');
  printBullet('If option still missing: Connect iPhone to Mac, open Xcode');
  printBullet('If issues persist: Restart both your Mac and iPhone');
  printDivider();
  
  const openXcode = await promptYesNo('Open Xcode to ensure device is detected?');
  if (openXcode) {
    try {
      await exec('open -a Xcode');
      printSuccess('Xcode opened');
      printInfo('Go to Window → Devices and Simulators to see your device');
    } catch {
      printError('Failed to open Xcode');
      printInfo('Please open Xcode manually');
    }
  }
}
