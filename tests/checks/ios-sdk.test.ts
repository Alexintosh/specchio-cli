/**
 * Unit tests for iOS SDK check
 */

import { describe, it, expect, mock } from 'bun:test';
import { checkIOSSDK } from '../../src/checks/ios-sdk.js';

describe('iOS SDK check', () => {
  describe('SDK detection', () => {
    it('should detect iOS SDK successfully', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
iOS SDKs:
iOS 17.0          	-sdk ios17.0
iOS Simulator SDKs:
iOS Simulator 17.0	-sdk iphonesimulator17.0
macOS SDKs:
macOS 14.0         	-sdk macosx14.0
            `));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(''));
            controller.close();
          }
        }),
        exited: Promise.resolve(0)
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkIOSSDK();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('iOS SDK');
      expect(result.message).toContain('17.0');
    });

    it('should detect both iOS and simulator SDKs', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
iOS SDKs:
iOS 16.5          	-sdk ios16.5
iOS Simulator SDKs:
iOS Simulator 16.5	-sdk iphonesimulator16.5
            `));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(''));
            controller.close();
          }
        }),
        exited: Promise.resolve(0)
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkIOSSDK();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('16.5');
    });

    it('should handle iOS SDK without simulator SDK', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
iOS SDKs:
iOS 15.4          	-sdk ios15.4
            `));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(''));
            controller.close();
          }
        }),
        exited: Promise.resolve(0)
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkIOSSDK();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('15.4');
    });
  });

  describe('version parsing', () => {
    it('should parse single digit version', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('iOS 8.0 \t-sdk ios8.0'));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(''));
            controller.close();
          }
        }),
        exited: Promise.resolve(0)
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkIOSSDK();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('8.0');
    });

    it('should parse triple digit version', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('iOS 17.2.1 \t-sdk ios17.2.1'));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(''));
            controller.close();
          }
        }),
        exited: Promise.resolve(0)
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkIOSSDK();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('17.2.1');
    });

    it('should extract version number correctly', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('iOS 17.0          	-sdk ios17.0'));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(''));
            controller.close();
          }
        }),
        exited: Promise.resolve(0)
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkIOSSDK();

      expect(result.passed).toBe(true);
      expect(result.message).not.toContain('iOS'); // Should be just the version
      expect(result.message).toContain('17.0');
    });
  });

  describe('error handling', () => {
    it('should fail when no iOS SDK found', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
macOS SDKs:
macOS 14.0         	-sdk macosx14.0
watchOS SDKs:
watchOS 10.0       	-sdk watchos10.0
            `));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(''));
            controller.close();
          }
        }),
        exited: Promise.resolve(0)
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkIOSSDK();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('not found');
      expect(result.fix).toContain('Preferences → Platforms');
    });

    it('should handle command failure', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(''));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('xcodebuild: error: unable to find utility "xcodebuild"'));
            controller.close();
          }
        }),
        exited: Promise.reject(new Error('Command failed'))
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkIOSSDK();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('Unable to check');
      expect(result.fix).toBeDefined();
    });

    it('should handle empty output', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(''));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(''));
            controller.close();
          }
        }),
        exited: Promise.resolve(0)
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkIOSSDK();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('not found');
    });
  });

  describe('edge cases', () => {
    it('should handle malformed output', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('Invalid output format'));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(''));
            controller.close();
          }
        }),
        exited: Promise.resolve(0)
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkIOSSDK();

      expect(result.passed).toBe(false);
    });

    it('should handle multiple iOS SDK versions', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
iOS SDKs:
iOS 16.5          	-sdk ios16.5
iOS 17.0          	-sdk ios17.0
iOS 17.2          	-sdk ios17.2
            `));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(''));
            controller.close();
          }
        }),
        exited: Promise.resolve(0)
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkIOSSDK();

      expect(result.passed).toBe(true);
      // Should match the first iOS SDK found
      expect(result.message).toContain('16.5');
    });

    it('should handle beta SDK versions', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('iOS 18.0 Beta   \t-sdk ios18.0.beta'));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(''));
            controller.close();
          }
        }),
        exited: Promise.resolve(0)
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkIOSSDK();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('18.0');
    });
  });
});
