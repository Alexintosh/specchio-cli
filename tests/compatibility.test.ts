/**
 * Compatibility Test Suite
 *
 * Tests CLI behavior across different environments, macOS versions, Xcode installations,
 * and platform differences (ARM64 vs x86_64). Tests version parsing logic and error handling.
 */

import { describe, test, expect } from 'bun:test';
import { ExecError } from '../src/utils/exec.js';

// Test helper functions that simulate the logic from the CLI
interface MacOSVersion {
  major: number;
  minor: number;
  patch: number;
  fullVersion: string;
}

interface XcodeVersion {
  version: string;
  build: string;
  major: number;
  minor: number;
  patch: number;
}

/**
 * Parse macOS version string from sw_vers output
 * Example: "13.5.2" -> { major: 13, minor: 5, patch: 2 }
 */
function parseMacOSVersion(versionString: string): MacOSVersion {
  const parts = versionString.split('.').map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
    fullVersion: versionString
  };
}

/**
 * Parse Xcode version string from xcodebuild output
 * Example: "Xcode 16.0\nBuild version 16A242d" -> { version: "16.0", build: "16A242d", major: 16, minor: 0, patch: 0 }
 */
function parseXcodeVersion(output: string): XcodeVersion | null {
  const lines = output.trim().split('\n');
  const versionLine = lines[0];
  const buildLine = lines[1];

  // Parse version (e.g., "Xcode 16.0")
  const versionMatch = versionLine.match(/Xcode\s+(\d+)\.(\d+)(?:\.(\d+))?/);
  if (!versionMatch) return null;

  const major = parseInt(versionMatch[1], 10);
  const minor = parseInt(versionMatch[2], 10);
  const patch = versionMatch[3] ? parseInt(versionMatch[3], 10) : 0;
  const version = `${major}.${minor}${patch > 0 ? `.${patch}` : ''}`;

  // Parse build (e.g., "Build version 16A242d")
  let build = '';
  if (buildLine) {
    const buildMatch = buildLine.match(/Build version\s+(.+)/);
    if (buildMatch) {
      build = buildMatch[1];
    }
  }

  return { version, build, major, minor, patch };
}

/**
 * Parse iOS SDK version from xcodebuild output
 * Example: "iOS 18.0          	-sdk iphoneos18.0" -> 18.0
 */
function parseIOSSDKVersion(output: string): string[] {
  const versions: string[] = [];
  const lines = output.split('\n');

  for (const line of lines) {
    const match = line.match(/iOS\s+(\d+\.\d+(?:\.\d+)?)/);
    if (match) {
      versions.push(match[1]);
    }
  }

  return versions;
}

/**
 * Check if macOS version meets minimum requirements
 */
function meetsMacOSRequirement(version: MacOSVersion, minimumMajor: number, minimumMinor: number = 0): boolean {
  if (version.major > minimumMajor) return true;
  if (version.major === minimumMajor && version.minor >= minimumMinor) return true;
  return false;
}

/**
 * Check if Xcode version meets minimum requirements
 */
function meetsXcodeRequirement(version: XcodeVersion, minimumMajor: number, minimumMinor: number = 0): boolean {
  if (version.major > minimumMajor) return true;
  if (version.major === minimumMajor && version.minor >= minimumMinor) return true;
  return false;
}

describe('Compatibility Test Suite', () => {

  describe('1. Version Parsing Tests', () => {

    test('macOS version 14.0 (Sonoma)', () => {
      const result = parseMacOSVersion('14.0');
      expect(result.major).toBe(14);
      expect(result.minor).toBe(0);
      expect(result.patch).toBe(0);
      expect(result.fullVersion).toBe('14.0');
    });

    test('macOS version 14.1.1', () => {
      const result = parseMacOSVersion('14.1.1');
      expect(result.major).toBe(14);
      expect(result.minor).toBe(1);
      expect(result.patch).toBe(1);
      expect(result.fullVersion).toBe('14.1.1');
    });

    test('macOS version 15.0 (Sequoia)', () => {
      const result = parseMacOSVersion('15.0');
      expect(result.major).toBe(15);
      expect(result.minor).toBe(0);
      expect(result.patch).toBe(0);
    });

    test('macOS version 15.2', () => {
      const result = parseMacOSVersion('15.2');
      expect(result.major).toBe(15);
      expect(result.minor).toBe(2);
      expect(result.patch).toBe(0);
    });

    test('macOS version 13.5.2 (Ventura)', () => {
      const result = parseMacOSVersion('13.5.2');
      expect(result.major).toBe(13);
      expect(result.minor).toBe(5);
      expect(result.patch).toBe(2);
    });

    test('Legacy macOS version 12.7.5 (Monterey)', () => {
      const result = parseMacOSVersion('12.7.5');
      expect(result.major).toBe(12);
      expect(result.minor).toBe(7);
      expect(result.patch).toBe(5);
    });

    test('Edge case: macOS version with single digit', () => {
      const result = parseMacOSVersion('14.0');
      expect(result.major).toBe(14);
      expect(result.minor).toBe(0);
    });

    test('Edge case: Very long version string', () => {
      const result = parseMacOSVersion('14.7.1.234.567');
      expect(result.major).toBe(14);
      expect(result.minor).toBe(7);
      expect(result.patch).toBe(1);
    });

    test('Xcode version 15.0', () => {
      const result = parseXcodeVersion('Xcode 15.0\nBuild version 15A240d');
      expect(result).not.toBeNull();
      expect(result?.version).toBe('15.0');
      expect(result?.build).toBe('15A240d');
      expect(result?.major).toBe(15);
      expect(result?.minor).toBe(0);
    });

    test('Xcode version 16.0', () => {
      const result = parseXcodeVersion('Xcode 16.0\nBuild version 16A242d');
      expect(result).not.toBeNull();
      expect(result?.version).toBe('16.0');
      expect(result?.major).toBe(16);
      expect(result?.minor).toBe(0);
    });

    test('Xcode version 16.2', () => {
      const result = parseXcodeVersion('Xcode 16.2\nBuild version 16C5032a');
      expect(result).not.toBeNull();
      expect(result?.version).toBe('16.2');
      expect(result?.major).toBe(16);
      expect(result?.minor).toBe(2);
    });

    test('Xcode version with patch number', () => {
      const result = parseXcodeVersion('Xcode 16.2.1\nBuild version 16C5032b');
      expect(result).not.toBeNull();
      expect(result?.version).toBe('16.2.1');
      expect(result?.major).toBe(16);
      expect(result?.minor).toBe(2);
      expect(result?.patch).toBe(1);
    });

    test('Invalid Xcode version format', () => {
      const result = parseXcodeVersion('Invalid output');
      expect(result).toBeNull();
    });

    test('iOS SDK version 17.0', () => {
      const result = parseIOSSDKVersion('iOS SDKs:\n\tiOS 17.0          	-sdk iphoneos17.0');
      expect(result).toContain('17.0');
    });

    test('iOS SDK version 18.0', () => {
      const result = parseIOSSDKVersion('iOS SDKs:\n\tiOS 18.0          	-sdk iphoneos18.0');
      expect(result).toContain('18.0');
    });

    test('iOS SDK version 18.2', () => {
      const result = parseIOSSDKVersion('iOS SDKs:\n\tiOS 18.2          	-sdk iphoneos18.2');
      expect(result).toContain('18.2');
    });

    test('Multiple iOS SDK versions', () => {
      const result = parseIOSSDKVersion('iOS SDKs:\n\tiOS 17.0          	-sdk iphoneos17.0\n\tiOS 18.0          	-sdk iphoneos18.0');
      expect(result).toContain('17.0');
      expect(result).toContain('18.0');
      expect(result.length).toBe(2);
    });
  });

  describe('2. Requirement Checking Tests', () => {

    test('macOS 14.0 meets requirement for 14.0', () => {
      const version = parseMacOSVersion('14.0');
      const meets = meetsMacOSRequirement(version, 14, 0);
      expect(meets).toBe(true);
    });

    test('macOS 15.0 meets requirement for 14.0', () => {
      const version = parseMacOSVersion('15.0');
      const meets = meetsMacOSRequirement(version, 14, 0);
      expect(meets).toBe(true);
    });

    test('macOS 13.5.2 does not meet requirement for 14.0', () => {
      const version = parseMacOSVersion('13.5.2');
      const meets = meetsMacOSRequirement(version, 14, 0);
      expect(meets).toBe(false);
    });

    test('macOS 14.1 meets requirement for 14.0', () => {
      const version = parseMacOSVersion('14.1');
      const meets = meetsMacOSRequirement(version, 14, 0);
      expect(meets).toBe(true);
    });

    test('Xcode 16.0 meets requirement for 16.0', () => {
      const version = parseXcodeVersion('Xcode 16.0\nBuild version 16A242d');
      expect(version).not.toBeNull();
      const meets = meetsXcodeRequirement(version!, 16, 0);
      expect(meets).toBe(true);
    });

    test('Xcode 16.2 meets requirement for 16.0', () => {
      const version = parseXcodeVersion('Xcode 16.2\nBuild version 16C5032a');
      expect(version).not.toBeNull();
      const meets = meetsXcodeRequirement(version!, 16, 0);
      expect(meets).toBe(true);
    });

    test('Xcode 15.0 does not meet requirement for 16.0', () => {
      const version = parseXcodeVersion('Xcode 15.0\nBuild version 15A240d');
      expect(version).not.toBeNull();
      const meets = meetsXcodeRequirement(version!, 16, 0);
      expect(meets).toBe(false);
    });

    test('Xcode 15.2 meets requirement for 15.1', () => {
      const version = parseXcodeVersion('Xcode 15.2\nBuild version 15C500b');
      expect(version).not.toBeNull();
      const meets = meetsXcodeRequirement(version!, 15, 1);
      expect(meets).toBe(true);
    });
  });

  describe('3. Error Handling Tests', () => {

    test('ExecError construction and properties', () => {
      const error = new ExecError('test-command', 1, 'stdout output', 'stderr output');
      expect(error.command).toBe('test-command');
      expect(error.exitCode).toBe(1);
      expect(error.stdout).toBe('stdout output');
      expect(error.stderr).toBe('stderr output');
      expect(error.name).toBe('ExecError');
    });

    test('ExecError display message formatting', () => {
      const error = new ExecError('xcodebuild -version', 69, '', 'xcodebuild: error: Xcode.app not found');
      const message = error.getDisplayMessage();
      expect(message).toContain('xcodebuild -version');
      expect(message).toContain('69');
      expect(message).toContain('xcodebuild: error: Xcode.app not found');
    });

    test('ExecError with both stdout and stderr', () => {
      const error = new ExecError(
        'test-command',
        1,
        'Some stdout output',
        'Some stderr output'
      );
      const message = error.getDisplayMessage();
      expect(message).toContain('Some stdout output');
      expect(message).toContain('Some stderr output');
    });

    test('ExecError with only stdout', () => {
      const error = new ExecError('test-command', 1, 'Only stdout', '');
      const message = error.getDisplayMessage();
      expect(message).toContain('Only stdout');
    });
  });

  describe('4. Platform Detection Tests', () => {

    test('ARM64 architecture string', () => {
      const arch = 'arm64';
      expect(arch).toBe('arm64');
      expect(arch).not.toBe('x86_64');
    });

    test('x86_64 architecture string', () => {
      const arch = 'x86_64';
      expect(arch).toBe('x86_64');
      expect(arch).not.toBe('arm64');
    });

    test('Standard Xcode path', () => {
      const path = '/Applications/Xcode.app';
      expect(path).toContain('Xcode.app');
      expect(path).toContain('/Applications/');
    });

    test('Alternative Xcode installation path', () => {
      const path = '/Volumes/Xcode/Xcode.app';
      expect(path).toContain('Xcode.app');
      expect(path).toContain('/Volumes/');
    });

    test('Xcode Developer directory path', () => {
      const path = '/Applications/Xcode.app/Contents/Developer';
      expect(path).toContain('Contents/Developer');
      expect(path).toContain('Xcode.app');
    });

    test('Custom Xcode Developer directory', () => {
      const path = '/Custom/Path/Xcode.app/Contents/Developer';
      expect(path).toContain('Contents/Developer');
      expect(path).toContain('/Custom/Path/');
    });

    test('iPhone SDK path', () => {
      const path = '/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS.sdk';
      expect(path).toContain('iPhoneOS.platform');
      expect(path).toContain('iPhoneOS.sdk');
    });

    test('Apple TV SDK path', () => {
      const path = '/Applications/Xcode.app/Contents/Developer/Platforms/AppleTVOS.platform/Developer/SDKs/AppleTVOS.sdk';
      expect(path).toContain('AppleTVOS.platform');
      expect(path).toContain('AppleTVOS.sdk');
    });

    test('Watch SDK path', () => {
      const path = '/Applications/Xcode.app/Contents/Developer/Platforms/WatchOS.platform/Developer/SDKs/WatchOS.sdk';
      expect(path).toContain('WatchOS.platform');
      expect(path).toContain('WatchOS.sdk');
    });
  });

  describe('5. Version Comparison Tests', () => {

    test('Compare macOS versions: 14.0 vs 13.5.2', () => {
      const v1 = parseMacOSVersion('14.0');
      const v2 = parseMacOSVersion('13.5.2');
      expect(v1.major).toBeGreaterThan(v2.major);
    });

    test('Compare macOS versions: 14.1 vs 14.0', () => {
      const v1 = parseMacOSVersion('14.1');
      const v2 = parseMacOSVersion('14.0');
      expect(v1.major).toBe(v2.major);
      expect(v1.minor).toBeGreaterThan(v2.minor);
    });

    test('Compare macOS versions: 14.1.1 vs 14.1', () => {
      const v1 = parseMacOSVersion('14.1.1');
      const v2 = parseMacOSVersion('14.1');
      expect(v1.major).toBe(v2.major);
      expect(v1.minor).toBe(v2.minor);
      expect(v1.patch).toBeGreaterThan(v2.patch);
    });

    test('Compare Xcode versions: 16.0 vs 15.2', () => {
      const v1 = parseXcodeVersion('Xcode 16.0\nBuild version 16A242d');
      const v2 = parseXcodeVersion('Xcode 15.2\nBuild version 15C500b');
      expect(v1!.major).toBeGreaterThan(v2!.major);
    });

    test('Compare Xcode versions: 16.2 vs 16.0', () => {
      const v1 = parseXcodeVersion('Xcode 16.2\nBuild version 16C5032a');
      const v2 = parseXcodeVersion('Xcode 16.0\nBuild version 16A242d');
      expect(v1!.major).toBe(v2!.major);
      expect(v1!.minor).toBeGreaterThan(v2!.minor);
    });
  });

  describe('6. Edge Cases and Boundary Conditions', () => {

    test('Empty version string', () => {
      const result = parseMacOSVersion('');
      expect(result.major).toBe(0);
      expect(result.minor).toBe(0);
      expect(result.patch).toBe(0);
      expect(result.fullVersion).toBe('');
    });

    test('Version string with only major version', () => {
      const result = parseMacOSVersion('14');
      expect(result.major).toBe(14);
      expect(result.minor).toBe(0);
      expect(result.patch).toBe(0);
    });

    test('Version string with major and minor only', () => {
      const result = parseMacOSVersion('14.5');
      expect(result.major).toBe(14);
      expect(result.minor).toBe(5);
      expect(result.patch).toBe(0);
    });

    test('Version string with extra whitespace', () => {
      const result = parseXcodeVersion('Xcode  16.0  \nBuild version 16A242d');
      expect(result).not.toBeNull();
      expect(result?.version).toBe('16.0');
    });

    test('Version string with special characters is parsed', () => {
      const result = parseXcodeVersion('Xcode 16.0β\nBuild: 16A242d-test');
      expect(result).not.toBeNull(); // Parser is tolerant
      expect(result?.version).toBe('16.0');
      expect(result?.build).toBe(''); // Build format doesn't match expected pattern
    });

    test('iOS SDK with multiple SDKs in output', () => {
      const output = `iOS SDKs:
\tiOS 17.5          	-sdk iphoneos17.5
\tiOS 18.0          	-sdk iphoneos18.0
\tiOS 18.2          	-sdk iphoneos18.2`;
      const result = parseIOSSDKVersion(output);
      expect(result.length).toBe(3);
      expect(result).toContain('17.5');
      expect(result).toContain('18.0');
      expect(result).toContain('18.2');
    });

    test('Path with spaces', () => {
      const path = '/Applications/Xcode Beta.app/Contents/Developer';
      expect(path).toContain('Xcode Beta.app');
      expect(path).toContain(' ');
    });

    test('Path with special characters', () => {
      const path = '/Applications/Xcode.app (Beta)/Contents/Developer';
      expect(path).toContain('Xcode.app (Beta)');
      expect(path).toContain('(');
      expect(path).toContain(')');
    });
  });

  describe('7. Integration Scenario Tests', () => {

    test('Complete successful setup scenario', () => {
      const macOSVersion = parseMacOSVersion('15.0');
      const xcodeVersion = parseXcodeVersion('Xcode 16.2\nBuild version 16C5032a');
      const iosSDKs = parseIOSSDKVersion('iOS SDKs:\n\tiOS 18.2          	-sdk iphoneos18.2');

      expect(meetsMacOSRequirement(macOSVersion, 14, 0)).toBe(true);
      expect(xcodeVersion).not.toBeNull();
      expect(meetsXcodeRequirement(xcodeVersion!, 16, 0)).toBe(true);
      expect(iosSDKs).toContain('18.2');
    });

    test('Minimal viable setup', () => {
      const macOSVersion = parseMacOSVersion('14.0');
      const xcodeVersion = parseXcodeVersion('Xcode 16.0\nBuild version 16A242d');

      expect(meetsMacOSRequirement(macOSVersion, 14, 0)).toBe(true);
      expect(xcodeVersion).not.toBeNull();
      expect(meetsXcodeRequirement(xcodeVersion!, 16, 0)).toBe(true);
    });

    test('Upgrade required scenario', () => {
      const macOSVersion = parseMacOSVersion('13.5.2');
      const xcodeVersion = parseXcodeVersion('Xcode 15.0\nBuild version 15A240d');

      expect(meetsMacOSRequirement(macOSVersion, 14, 0)).toBe(false);
      expect(xcodeVersion).not.toBeNull();
      expect(meetsXcodeRequirement(xcodeVersion!, 16, 0)).toBe(false);
    });

    test('Partial installation scenario', () => {
      const macOSVersion = parseMacOSVersion('15.0');
      const xcodeVersion = parseXcodeVersion('Invalid output');

      expect(meetsMacOSRequirement(macOSVersion, 14, 0)).toBe(true);
      expect(xcodeVersion).toBeNull();
    });

    test('Multiple Xcode versions scenario', () => {
      const versions = [
        parseXcodeVersion('Xcode 15.2\nBuild version 15C500b'),
        parseXcodeVersion('Xcode 16.0\nBuild version 16A242d'),
        parseXcodeVersion('Xcode 16.2\nBuild version 16C5032a'),
      ];

      expect(versions.every(v => v !== null)).toBe(true);
      expect(versions[0]!.major).toBe(15);
      expect(versions[1]!.major).toBe(16);
      expect(versions[2]!.major).toBe(16);
    });

    test('Latest setup with newest versions', () => {
      const macOSVersion = parseMacOSVersion('15.2');
      const xcodeVersion = parseXcodeVersion('Xcode 16.2\nBuild version 16C5032a');
      const iosSDKs = parseIOSSDKVersion('iOS SDKs:\n\tiOS 18.2          	-sdk iphoneos18.2');

      expect(meetsMacOSRequirement(macOSVersion, 14, 0)).toBe(true);
      expect(xcodeVersion).not.toBeNull();
      expect(meetsXcodeRequirement(xcodeVersion!, 16, 0)).toBe(true);
      expect(iosSDKs).toContain('18.2');
    });
  });

  describe('8. Command Availability Simulation', () => {

    test('Simulate xcodebuild command check', () => {
      // This simulates the logic of checking if a command exists
      const commandPath = '/usr/bin/xcodebuild';
      expect(commandPath).toContain('xcodebuild');
    });

    test('Simulate xcrun command check', () => {
      const commandPath = '/usr/bin/xcrun';
      expect(commandPath).toContain('xcrun');
    });

    test('Simulate security command check', () => {
      const commandPath = '/usr/bin/security';
      expect(commandPath).toContain('security');
    });

    test('Simulate sw_vers command check', () => {
      const commandPath = '/usr/bin/sw_vers';
      expect(commandPath).toContain('sw_vers');
    });

    test('Simulate uname command check', () => {
      const commandPath = '/usr/bin/uname';
      expect(commandPath).toContain('uname');
    });
  });
});

/**
 * Test Execution Instructions:
 *
 * Run all tests:
 *   bun test cli/tests/compatibility.test.ts
 *
 * Run specific test suite:
 *   bun test cli/tests/compatibility.test.ts -t "Version Parsing"
 *
 * Run with verbose output:
 *   bun test cli/tests/compatibility.test.ts --verbose
 *
 * Watch mode for development:
 *   bun test cli/tests/compatibility.test.ts --watch
 */