/**
 * Unit tests for macOS version check
 */

import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { checkMacOSVersion } from '../../src/checks/macos.js';

// Mock the exec module
const mockExecQuiet = mock(() => Promise.resolve({
  stdout: '14.0.0',
  stderr: '',
  exitCode: 0
}));

describe('macOS version check', () => {
  beforeEach(() => {
    mockExecQuiet.mockClear();
    // Reset the module to use the mock
    mock.module('../../src/checks/macos.js', () => ({
      checkMacOSVersion: () => checkMacOSVersion()
    }));
  });

  describe('version parsing', () => {
    it('should parse correct macOS 14.0.0 version', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('14.0.0'));
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

      const result = await checkMacOSVersion();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('14.0.0');
    });

    it('should parse macOS 15.0.0 version (Sonoma successor)', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('15.0.0'));
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

      const result = await checkMacOSVersion();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('15.0.0');
    });

    it('should parse macOS 14.5.2 version', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('14.5.2'));
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

      const result = await checkMacOSVersion();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('14.5.2');
    });

    it('should handle three-digit version numbers correctly', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('13.6.5'));
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

      const result = await checkMacOSVersion();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('13.6.5');
      expect(result.fix).toContain('upgrade');
    });
  });

  describe('version validation', () => {
    it('should fail on macOS 13.x versions (Ventura)', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('13.5.2'));
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

      const result = await checkMacOSVersion();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('requires 14.0+');
      expect(result.fix).toBeDefined();
    });

    it('should fail on macOS 12.x versions (Monterey)', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('12.7.5'));
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

      const result = await checkMacOSVersion();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('12.7.5');
    });

    it('should pass on macOS 14.0', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('14.0'));
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

      const result = await checkMacOSVersion();

      expect(result.passed).toBe(true);
    });

    it('should pass on macOS 14.1', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('14.1'));
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

      const result = await checkMacOSVersion();

      expect(result.passed).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle command failure gracefully', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(''));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('command not found'));
            controller.close();
          }
        }),
        exited: Promise.resolve(1)
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkMacOSVersion();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('Unable to determine');
      expect(result.fix).toBeDefined();
    });

    it('should handle malformed version string', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('not.a.version'));
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

      const result = await checkMacOSVersion();

      expect(result.passed).toBe(false);
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

      const result = await checkMacOSVersion();

      expect(result.passed).toBe(false);
    });

    it('should handle version with only major and minor', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('14.2'));
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

      const result = await checkMacOSVersion();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('14.2');
    });
  });
});
