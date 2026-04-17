/**
 * Guide for Apple Development Certificate creation
 */

import { printHeader, printStep, printNumbered, printBullet, printCommand, printSuccess, printError, printInfo, printDivider, printHighlight } from '../utils/output.js';
import { promptYesNo, promptContinue } from '../utils/prompts.js';
import { exec, execQuiet } from '../utils/exec.js';

/**
 * Guide user through Apple Development Certificate creation
 */
export async function guideCertificateCreation(): Promise<boolean> {
  printHeader('Apple Development Certificate Guide');
  printDivider();
  
  // Check if certificate already exists
  const hasCertificate = await checkCertificateExists();
  if (hasCertificate) {
    printSuccess('Apple Development certificate already found!');
    const certInfo = await getCertificateInfo();
    printInfo(`Certificate: ${certInfo}`);
    return true;
  }

  printInfo('Specchio needs a code signing certificate to install components on your iPhone.');
  printInfo('You will need a free Apple ID to create this certificate.');
  printDivider();

  // Check if user has Apple ID
  const hasAppleID = await promptYesNo('Do you have an Apple ID?');
  if (!hasAppleID) {
    printInfo('You will need to create an Apple ID first');
    printLink('Create Apple ID', 'https://appleid.apple.com');
    printDivider();
    await promptContinue('Press Enter after creating your Apple ID...');
  }

  // Guide through certificate creation
  await guideCreationProcess();
  
  // Wait for user to complete
  printDivider();
  await promptContinue('Press Enter after creating the certificate...');
  
  // Verify
  const verified = await checkCertificateExists();
  if (verified) {
    const certInfo = await getCertificateInfo();
    printSuccess(`Certificate created successfully: ${certInfo}`);
    return true;
  } else {
    printError('Could not verify certificate creation');
    printInfo('Please verify the certificate was created in Xcode');
    return false;
  }
}

/**
 * Check if Apple Development certificate exists
 */
async function checkCertificateExists(): Promise<boolean> {
  try {
    const result = await execQuiet('security find-identity -v -p codesigning');
    return result.stdout.includes('Apple Development');
  } catch {
    return false;
  }
}

/**
 * Get certificate information
 */
async function getCertificateInfo(): Promise<string> {
  try {
    const result = await execQuiet('security find-identity -v -p codesigning');
    const lines = result.stdout.split('\n');
    const certLine = lines.find(line => line.includes('Apple Development'));
    if (certLine) {
      // Extract certificate name from the line
      const match = certLine.match(/"([^"]+)"/);
      return match ? match[1] : 'Apple Development Certificate';
    }
    return 'Apple Development Certificate';
  } catch {
    return 'Apple Development Certificate';
  }
}

/**
 * Guide through the certificate creation process
 */
async function guideCreationProcess(): Promise<void> {
  printStep(1, 1, 'Create Apple Development Certificate');
  printDivider();
  
  printNumbered(1, 'Open Xcode');
  printNumbered(2, 'Go to Xcode → Settings (or Preferences)');
  printNumbered(3, 'Click the "Accounts" tab');
  printNumbered(4, 'Click the "+" button in the bottom left');
  printNumbered(5, 'Select "Apple ID" from the dropdown');
  printNumbered(6, 'Sign in with your Apple ID and password');
  printDivider();
  
  printHighlight('After signing in with your Apple ID:');
  printNumbered(7, 'With your Apple ID selected, click "Manage Certificates..."');
  printNumbered(8, 'Click the "+" button');
  printNumbered(9, 'Select "Apple Development" from the dropdown');
  printNumbered(10, 'The certificate will be created automatically');
  printDivider();
  
  const openXcode = await promptYesNo('Open Xcode Settings now?');
  if (openXcode) {
    try {
      await exec('open "xcode://settings"');
      printSuccess('Xcode Settings opened');
      printInfo('Navigate to the "Accounts" tab to sign in and create certificate');
    } catch {
      printError('Failed to open Xcode Settings');
      printInfo('Please open Xcode manually and go to Settings → Accounts');
    }
  }
  
  printDivider();
  printHighlight('Important Notes:');
  printBullet('You must have a free Apple ID');
  printBullet('Two-Factor Authentication must be enabled on your Apple ID');
  printBullet('The certificate is created automatically when you select "Apple Development"');
  printBullet('You only need to do this once per Apple ID');
  printDivider();
}
