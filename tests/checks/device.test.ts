/**
 * Unit tests for device connection check
 */

import { describe, it, expect, mock } from 'bun:test';
import { checkConnectedDevice } from '../../src/checks/device.js';

describe('device connection check', () => {
  describe('device detection', () => {
    it('should detect connected iPhone', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
[Some header]
    iPhone 15 Pro    [device serial]    iOS 17.0
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

      const result = await checkConnectedDevice();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('Connected');
      expect(result.message).toContain('iPhone');
    });

    it('should detect connected iPad', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
    iPad Pro 12.9    [device serial]    iOS 16.5
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

      const result = await checkConnectedDevice();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('iPad');
    });

    it('should detect connected iPod', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
    iPod touch        [device serial]    iOS 15.0
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

      const result = await checkConnectedDevice();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('iPod');
    });

    it('should fail when no device connected', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
No devices found
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

      const result = await checkConnectedDevice();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('No iOS device found');
      expect(result.fix).toContain('Connect your iPhone');
    });
  });

  describe('device information parsing', () => {
    it('should parse device name and model', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
    iPhone 14 Pro    ABC123XYZ456    iOS 17.0.1
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

      const result = await checkConnectedDevice();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('iPhone');
    });

    it('should handle iOS version extraction', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
    iPhone 13    [serial]    iOS 16.5.2
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

      const result = await checkConnectedDevice();

      expect(result.passed).toBe(true);
    });

    it('should handle devices with spaces in names', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
    iPhone SE (2nd generation)    [serial]    iOS 17.0
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

      const result = await checkConnectedDevice();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('iPhone');
    });
  });

  describe('error handling', () => {
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
            controller.enqueue(new TextEncoder().encode('xcrun: error: unable to find utility "devicectl"'));
            controller.close();
          }
        }),
        exited: Promise.reject(new Error('Command failed'))
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkConnectedDevice();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('Unable to check');
      expect(result.fix).toContain('xcode-select');
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

      const result = await checkConnectedDevice();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('No iOS device found');
    });
  });

  describe('edge cases', () => {
    it('should ignore iOS Simulator in device list', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
    iPhone Simulator    [simulator-id]    iOS 17.0
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

      const result = await checkConnectedDevice();

      expect(result.passed).toBe(false);
    });

    it('should handle multiple devices', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
    iPhone 13    [serial1]    iOS 17.0
    iPad Pro    [serial2]    iOS 16.5
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

      const result = await checkConnectedDevice();

      expect(result.passed).toBe(true);
      // Should detect at least one device
      expect(result.message).toContain('Connected');
    });

    it('should handle malformed device output', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('Invalid device output format'));
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

      const result = await checkConnectedDevice();

      expect(result.passed).toBe(false);
    });

    it('should handle device with unknown model', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('iPhone'));
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

      const result = await checkConnectedDevice();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('iPhone');
    });
  });
});
