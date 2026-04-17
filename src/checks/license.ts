import { execQuiet } from '../utils/exec.js';
import type { CheckResult } from '../types.js';

/**
 * Check if Xcode license has been accepted
 */
export async function checkXcodeLicense(): Promise<CheckResult> {
  try {
    const result = await execQuiet('xcodebuild -checkFirstLaunchStatus');

    // Command exits with 0 and no output when license is already accepted
    // Command shows output (and exits non-zero) when license not accepted
    if (result.exitCode === 0) {
      return {
        passed: true,
        message: 'Xcode license accepted'
      };
    }

    // Non-zero exit code means license not accepted or other issue
    return {
      passed: false,
      message: 'Xcode license not accepted',
      fix: 'Accept the license by running: sudo xcodebuild -license accept'
    };
  } catch (error) {
    // Command fails when Xcode tools are not properly installed
    return {
      passed: false,
      message: 'Unable to check Xcode license status',
      fix: 'Ensure Xcode is properly installed, then accept the license: sudo xcodebuild -license accept'
    };
  }
}
