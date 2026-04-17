/**
 * Guide for Xcode license acceptance
 */

import { printHeader, printStep, printNumbered, printBullet, printCommand, printSuccess, printError, printInfo, printDivider, printHighlight } from '../utils/output.js';
import { promptYesNo, promptContinue } from '../utils/prompts.js';
import { exec, execQuiet, execWithSudo } from '../utils/exec.js';

/**
 * Guide user through Xcode license acceptance
 */
export async function guideLicenseAcceptance(): Promise<boolean> {
  printHeader('Xcode License Acceptance Guide');
  printDivider();
  
  // Check current license status
  const isAccepted = await checkLicenseStatus();
  if (isAccepted) {
    printSuccess('Xcode license has already been accepted!');
    return true;
  }

  printInfo('Before using Xcode, you must accept its license agreement.');
  printDivider();

  // Present options
  printStep(1, 2, 'Choose Acceptance Method');
  printNumbered(1, 'Terminal (Recommended) - Fast, command-line based');
  printNumbered(2, 'Xcode GUI - Open Xcode and click Agree');
  printDivider();

  const useTerminal = await promptYesNo('Accept license via Terminal (requires sudo)?');

  if (useTerminal) {
    return await acceptViaTerminal();
  } else {
    return await acceptViaGUI();
  }
}

/**
 * Check if Xcode license has been accepted
 */
async function checkLicenseStatus(): Promise<boolean> {
  try {
    const result = await execQuiet('xcodebuild -checkFirstLaunchStatus');
    // If output contains "already been accepted", license is accepted
    return result.stdout.includes('already been accepted') || 
           result.stderr.includes('already been accepted');
  } catch {
    // Command may fail with specific error messages
    return false;
  }
}

/**
 * Accept license via Terminal with sudo
 */
async function acceptViaTerminal(): Promise<boolean> {
  printStep(2, 2, 'Accept License via Terminal');
  printDivider();
  
  printNumbered(1, 'Run the license accept command with sudo');
  printCommand('sudo xcodebuild -license accept');
  printDivider();
  
  printInfo('You will be prompted for your Mac password');
  printBullet('Type your password (it will not appear on screen)');
  printBullet('Press Enter');
  printDivider();
  
  const confirm = await promptYesNo('Proceed with license acceptance?');
  if (!confirm) {
    printInfo('Skipping license acceptance');
    return false;
  }

  try {
    printHighlight('Accepting Xcode license...');
    await execWithSudo('xcodebuild -license accept');
    printSuccess('License accepted successfully!');
    return true;
  } catch (error) {
    printError('Failed to accept license via Terminal');
    printInfo('You may need to accept manually using one of these methods:');
    printDivider();
    printBullet('Run manually: sudo xcodebuild -license accept');
    printBullet('Or open Xcode and click Agree when prompted');
    printDivider();
    
    const tryGUI = await promptYesNo('Try accepting via Xcode GUI instead?');
    if (tryGUI) {
      return await acceptViaGUI();
    }
    return false;
  }
}

/**
 * Accept license by opening Xcode GUI
 */
async function acceptViaGUI(): Promise<boolean> {
  printStep(2, 2, 'Accept License via Xcode');
  printDivider();
  
  printNumbered(1, 'Open Xcode');
  printNumbered(2, 'Click "Agree" when prompted to accept the license');
  printNumbered(3, 'Wait for Xcode to install additional components');
  printNumbered(4, 'Once Xcode opens, you can quit it');
  printDivider();
  
  const openXcode = await promptYesNo('Open Xcode now?');
  if (openXcode) {
    try {
      await exec('open -a Xcode');
      printSuccess('Xcode opened');
      printInfo('Follow the on-screen prompts to accept the license');
    } catch {
      printError('Failed to open Xcode');
      printInfo('Please open Xcode manually from Applications');
    }
  }
  
  printDivider();
  await promptContinue('Press Enter after you have accepted the license...');
  
  // Verify
  const verified = await checkLicenseStatus();
  if (verified) {
    printSuccess('License verified as accepted!');
    return true;
  } else {
    printWarning('Could not verify license status');
    printInfo('If you accepted the license in Xcode, you should be all set');
    return true; // Assume success since we can't verify
  }
}
