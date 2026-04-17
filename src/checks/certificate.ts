import { execQuiet } from '../utils/exec.js';
import type { CheckResult } from '../types.js';

/**
 * Check for Apple Development certificate in keychain
 */
export async function checkCertificate(): Promise<CheckResult> {
  try {
    const result = await execQuiet('security find-identity -v -p codesigning');

    // Look for Apple Development certificate
    if (result.stdout.includes('Apple Development')) {
      // Extract the certificate identity for better messaging
      const lines = result.stdout.split('\n');
      for (const line of lines) {
        if (line.includes('Apple Development')) {
          return {
            passed: true,
            message: 'Apple Development certificate found'
          };
        }
      }
    }

    return {
      passed: false,
      message: 'No Apple Development certificate found',
      fix: 'Create a certificate in Xcode: Xcode → Settings → Accounts → Select Apple ID → Manage Certificates → + → Apple Development'
    };
  } catch (error) {
    return {
      passed: false,
      message: 'Unable to check for code signing certificates',
      fix: 'Create a certificate in Xcode: Xcode → Settings → Accounts → Select Apple ID → Manage Certificates → + → Apple Development'
    };
  }
}
