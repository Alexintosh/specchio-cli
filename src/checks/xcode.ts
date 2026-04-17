import { exec, execQuiet, directoryExists } from '../utils/exec.js';
import type { CheckResult } from '../types.js';

/**
 * Check if Xcode.app is installed and get version
 */
export async function checkXcodeInstallation(): Promise<CheckResult> {
  // Check if Xcode.app exists
  const xcodeExists = await directoryExists('/Applications/Xcode.app');

  if (!xcodeExists) {
    return {
      passed: false,
      message: 'Xcode.app not found',
      fix: 'Install Xcode from the App Store: https://apps.apple.com/app/xcode/id497799835'
    };
  }

  // Get Xcode version
  try {
    const result = await execQuiet('xcodebuild -version');
    const version = result.stdout.split('\n')[0]; // Get first line (version string)

    return {
      passed: true,
      message: `Xcode ${version}`
    };
  } catch (error) {
    return {
      passed: false,
      message: 'Xcode.app found but version check failed',
      fix: 'Open Xcode once to complete installation, then run: xcode-select --switch /Applications/Xcode.app/Contents/Developer'
    };
  }
}
