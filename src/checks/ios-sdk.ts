import { execQuiet } from '../utils/exec.js';
import type { CheckResult } from '../types.js';

/**
 * Check if iOS SDK is installed
 */
export async function checkIOSSDK(): Promise<CheckResult> {
  try {
    const result = await execQuiet('xcodebuild -showsdks');

    // Look for iOS SDK in the output
    const iosSDKMatch = result.stdout.match(/iOS \d+\.\d+/);
    const simulatorSDKMatch = result.stdout.match(/iOS Simulator \d+\.\d+/);

    if (iosSDKMatch && simulatorSDKMatch) {
      return {
        passed: true,
        message: `iOS SDK ${iosSDKMatch[0].replace('iOS ', '')} installed`
      };
    }

    if (iosSDKMatch) {
      return {
        passed: true,
        message: `iOS SDK ${iosSDKMatch[0].replace('iOS ', '')} installed`
      };
    }

    return {
      passed: false,
      message: 'iOS SDK not found',
      fix: 'Open Xcode, go to Preferences → Platforms, and ensure iOS platform is installed'
    };
  } catch (error) {
    return {
      passed: false,
      message: 'Unable to check iOS SDK',
      fix: 'Ensure Xcode is properly installed with iOS platform tools'
    };
  }
}
