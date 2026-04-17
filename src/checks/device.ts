import { execQuiet } from '../utils/exec.js';
import type { CheckResult } from '../types.js';

interface DeviceInfo {
  name: string;
  model: string;
  osVersion: string;
}

/**
 * Parse device information from xcrun devicectl output
 */
function parseDeviceInfo(output: string): DeviceInfo | null {
  const lines = output.split('\n');

  let deviceInfo: DeviceInfo | null = null;

  for (const line of lines) {
    // Look for device name (usually appears as "iPhone", "iPad", etc.)
    if (line.includes('iPhone') || line.includes('iPad') || line.includes('iPod')) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        deviceInfo = {
          name: parts[0],
          model: parts[1] || 'Unknown',
          osVersion: 'Unknown'
        };
      }
    }

    // Try to extract OS version if available
    if (deviceInfo && line.includes('iOS') && !line.includes('Simulator')) {
      const osMatch = line.match(/iOS\s+(\d+\.\d+)/);
      if (osMatch) {
        deviceInfo.osVersion = osMatch[1];
      }
    }
  }

  return deviceInfo;
}

/**
 * Check for connected iOS device
 */
export async function checkConnectedDevice(): Promise<CheckResult> {
  try {
    const result = await execQuiet('xcrun devicectl list devices');

    // Check if any iOS device is connected
    const hasiPhone = result.stdout.includes('iPhone');
    const hasiPad = result.stdout.includes('iPad');
    const hasiPod = result.stdout.includes('iPod');

    if (hasiPhone || hasiPad || hasiPod) {
      const deviceInfo = parseDeviceInfo(result.stdout);
      if (deviceInfo) {
        return {
          passed: true,
          message: `Connected: ${deviceInfo.name} (${deviceInfo.model})`
        };
      }

      // Fallback if parsing fails but we know a device is connected
      const deviceType = hasiPhone ? 'iPhone' : hasiPad ? 'iPad' : 'iPod';
      return {
        passed: true,
        message: `Connected: ${deviceType}`
      };
    }

    return {
      passed: false,
      message: 'No iOS device found',
      fix: 'Connect your iPhone via USB cable and ensure it is unlocked. You may need to trust this computer on the device.'
    };
  } catch (error) {
    return {
      passed: false,
      message: 'Unable to check for connected devices',
      fix: 'Ensure Developer Tools are installed: xcode-select --install'
    };
  }
}
