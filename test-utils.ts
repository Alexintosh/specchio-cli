#!/usr/bin/env bun

/**
 * Simple test script for utility functions
 */

import { printSuccess, printError, printWarning, printInfo } from './src/utils/output.js';
import { exec, commandExists } from './src/utils/exec.js';

async function test() {
  console.log('=== Testing Utility Functions ===\n');

  // Test output functions
  printSuccess('This is a success message');
  printError('This is an error message');
  printWarning('This is a warning message');
  printInfo('This is an info message');

  // Test exec function
  try {
    const version = await exec('sw_vers -productVersion');
    printSuccess(`macOS version: ${version}`);
  } catch (error) {
    printError(`Failed to get macOS version: ${error}`);
  }

  // Test commandExists
  const hasBun = await commandExists('bun');
  const hasGit = await commandExists('git');

  if (hasBun) printSuccess('Bun is installed');
  else printWarning('Bun is not installed');

  if (hasGit) printSuccess('Git is installed');
  else printWarning('Git is not installed');

  console.log('\n=== Test Complete ===');
}

test().catch(error => {
  printError(`Test failed: ${error.message}`);
  process.exit(1);
});
