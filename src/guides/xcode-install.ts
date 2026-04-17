/**
 * Guide for Xcode installation
 */

import { printHeader, printStep, printNumbered, printBullet, printCommand, printLink, printSuccess, printError, printInfo, printDivider, printHighlight } from '../utils/output.js';
import { promptYesNo, promptContinue } from '../utils/prompts.js';
import { exec, execQuiet, commandExists } from '../utils/exec.js';

const XCODE_APP_STORE_URL = 'https://apps.apple.com/app/xcode/id497799835';
const XCODE_SIZE_GB = 15;
const ESTIMATED_TIME_MINUTES = 60;

/**
 * Guide user through Xcode installation process
 */
export async function guideXcodeInstallation(): Promise<boolean> {
  printHeader('Xcode Installation Guide');
  
  printInfo(`Xcode is required for Specchio to communicate with your iPhone.`);
  printInfo(`Size: ~${XCODE_SIZE_GB} GB | Estimated time: ${ESTIMATED_TIME_MINUTES} minutes`);
  printDivider();

  // Check if Xcode is already installed
  const alreadyInstalled = await checkXcodeExists();
  if (alreadyInstalled) {
    printSuccess('Xcode is already installed!');
    const version = await getXcodeVersion();
    printInfo(`Version: ${version}`);
    
    const proceed = await promptYesNo('Do you want to reinstall or update Xcode?');
    if (!proceed) {
      return true;
    }
  }

  // Present installation options
  printStep(1, 3, 'Choose Installation Method');
  printNumbered(1, 'App Store (Recommended) - Official, automatic updates');
  printNumbered(2, 'Terminal (mas CLI) - Faster if you have mas installed');
  printDivider();

  const useTerminal = await promptYesNo('Install via Terminal using mas CLI?');

  if (useTerminal) {
    await installViaMas();
  } else {
    await installViaAppStore();
  }

  // Wait for installation to complete
  printDivider();
  await waitForInstallation();

  // Verify installation
  const verified = await verifyInstallation();
  
  if (verified) {
    printSuccess('Xcode installation complete!');
    printInfo('Next step: Accept the Xcode license');
    return true;
  } else {
    printError('Xcode installation verification failed');
    printInfo('Please verify Xcode.app is in /Applications/');
    return false;
  }
}

/**
 * Check if Xcode.app exists
 */
async function checkXcodeExists(): Promise<boolean> {
  try {
    await exec('ls -la /Applications/Xcode.app');
    return true;
  } catch {
    return false;
  }
}

/**
 * Get Xcode version
 */
async function getXcodeVersion(): Promise<string> {
  try {
    const result = await execQuiet('xcodebuild -version');
    return result.stdout.split('\n')[0] || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

/**
 * Install Xcode via App Store (opens App Store)
 */
async function installViaAppStore(): Promise<void> {
  printStep(2, 3, 'Install via App Store');
  printDivider();
  
  printNumbered(1, 'Open App Store on your Mac');
  printNumbered(2, 'Search for "Xcode"');
  printNumbered(3, 'Click "Get" or "Download"');
  printNumbered(4, 'Wait for download to complete');
  printDivider();
  
  printLink('Xcode on App Store', XCODE_APP_STORE_URL);
  printDivider();
  
  const openAppStore = await promptYesNo('Open App Store now?');
  if (openAppStore) {
    await exec('open "macappstore://apps.apple.com/app/xcode/id497799835"');
    printInfo('App Store should open automatically');
  }
}

/**
 * Install Xcode via mas CLI
 */
async function installViaMas(): Promise<void> {
  printStep(2, 3, 'Install via Terminal (mas CLI)');
  printDivider();
  
  // Check if mas is installed
  const hasMas = await commandExists('mas');
  
  if (!hasMas) {
    printError('mas CLI is not installed');
    printInfo('Install mas first: brew install mas');
    printInfo('Or use the App Store method instead');
    printDivider();
    
    const installMas = await promptYesNo('Install mas now using Homebrew?');
    if (installMas) {
      try {
        printInfo('Installing mas...');
        await exec('brew install mas');
        printSuccess('mas installed successfully');
      } catch {
        printError('Failed to install mas');
        printInfo('Please install manually: brew install mas');
        await installViaAppStore();
        return;
      }
    } else {
      await installViaAppStore();
      return;
    }
  }

  printNumbered(1, 'Search for Xcode to confirm availability');
  printCommand('mas search xcode');
  printDivider();
  
  const searchConfirmed = await promptYesNo('Run search now to confirm Xcode is available?');
  if (searchConfirmed) {
    try {
      const searchResult = await execQuiet('mas search xcode');
      console.log(searchResult.stdout);
    } catch {
      printWarning('Search failed, but proceeding anyway');
    }
  }

  printDivider();
  printNumbered(2, 'Install Xcode (app ID: 497799835)');
  printCommand('mas install 497799835');
  printDivider();
  
  const installConfirmed = await promptYesNo('Install Xcode now?');
  if (installConfirmed) {
    try {
      printInfo('Starting Xcode download...');
      printInfo('This will take 30-60 minutes depending on your internet connection');
      await exec('mas install 497799835');
      printSuccess('Download started! Check the Applications folder for progress.');
    } catch (error) {
      printError('Failed to start download via mas');
      printInfo('You may need to use the App Store method instead');
    }
  }
}

/**
 * Wait for user to confirm installation is complete
 */
async function waitForInstallation(): Promise<void> {
  printStep(3, 3, 'Complete Installation');
  printDivider();
  
  printHighlight('Please wait for Xcode to finish downloading');
  printBullet('You can monitor progress in Launchpad or Applications folder');
  printBullet('Download size is ~15 GB, so this may take a while');
  printDivider();
  
  await promptContinue('Press Enter after Xcode has finished downloading...');
}

/**
 * Verify Xcode installation
 */
async function verifyInstallation(): Promise<boolean> {
  printInfo('Verifying Xcode installation...');
  
  try {
    // Check if Xcode.app exists
    await exec('test -d /Applications/Xcode.app');
    
    // Check if xcodebuild is available
    const version = await exec('xcodebuild -version');
    printSuccess(`Xcode installed: ${version.split('\n')[0]}`);
    return true;
  } catch {
    return false;
  }
}
