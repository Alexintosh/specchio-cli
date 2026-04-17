import { exec, execQuiet } from '../utils/exec.js';
import type { CheckResult } from '../types.js';

interface MacOSVersion {
  major: number;
  minor: number;
  patch: number;
  fullVersion: string;
}

/**
 * Parse macOS version string from sw_vers output
 * Example: "13.5.2" -> { major: 13, minor: 5, patch: 2 }
 */
function parseVersion(versionString: string): MacOSVersion {
  const parts = versionString.split('.').map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
    fullVersion: versionString
  };
}

/**
 * Get macOS version from sw_vers command
 */
async function getMacOSVersion(): Promise<MacOSVersion | null> {
  try {
    const output = await execQuiet('sw_vers -productVersion');
    return parseVersion(output.stdout);
  } catch {
    return null;
  }
}

/**
 * Check macOS version is 14.0 or higher (Sonoma or later)
 */
export async function checkMacOSVersion(): Promise<CheckResult> {
  const version = await getMacOSVersion();

  if (!version) {
    return {
      passed: false,
      message: 'Unable to determine macOS version',
      fix: 'Ensure you are running on macOS'
    };
  }

  // Check if version is 14.0 or higher
  if (version.major > 14 || (version.major === 14 && version.minor >= 0)) {
    return {
      passed: true,
      message: `macOS ${version.fullVersion}`
    };
  }

  return {
    passed: false,
    message: `macOS ${version.fullVersion} (requires 14.0+)`,
    fix: 'Upgrade to macOS Sonoma (14.0) or later from System Settings → General → Software Update'
  };
}
