/**
 * Unit tests for Xcode license check
 */

import { describe, it, expect, mock } from 'bun:test';
import { checkXcodeLicense } from '../../src/checks/license.js';

describe('Xcode license check', () => {
  describe('license status detection', () => {
    it('should pass when license is accepted', async () => {
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
        exited: Promise.resolve(0) // Exit code 0 means license accepted
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkXcodeLicense();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('license accepted');
      expect(result.fix).toBeUndefined();
    });

    it('should fail when license is not accepted', async () => {
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
        exited: Promise.resolve(1) // Non-zero exit code
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkXcodeLicense();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('license not accepted');
      expect(result.fix).toContain('sudo xcodebuild -license accept');
    });

    it('should provide helpful fix message', async () => {
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
        exited: Promise.resolve(69) // Specific exit code for license
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkXcodeLicense();

      expect(result.passed).toBe(false);
      expect(result.fix).toBeDefined();
      expect(result.fix).toContain('sudo');
      expect(result.fix).toContain('xcodebuild');
      expect(result.fix).toContain('license');
    });
  });

  describe('error handling', () => {
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
            controller.enqueue(new TextEncoder().encode('xcodebuild: error: unable to find utility "xcodebuild"'));
            controller.close();
          }
        }),
        exited: Promise.reject(new Error('Command failed'))
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkXcodeLicense();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('Unable to check');
      expect(result.fix).toContain('Xcode is properly installed');
    });

    it('should handle missing xcodebuild command', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(''));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('command not found: xcodebuild'));
            controller.close();
          }
        }),
        exited: Promise.resolve(127) // Command not found exit code
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkXcodeLicense();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('Unable to check');
    });

    it('should handle unexpected exit codes', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('unexpected error'));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('system error'));
            controller.close();
          }
        }),
        exited: Promise.resolve(255) // Unknown exit code
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkXcodeLicense();

      expect(result.passed).toBe(false);
      expect(result.fix).toBeDefined();
    });
  });

  describe('edge cases', () => {
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

      const result = await checkXcodeLicense();

      expect(result.passed).toBe(true);
    });

    it('should handle output with warnings but exit code 0', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(''));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('Warning: some warning message'));
            controller.close();
          }
        }),
        exited: Promise.resolve(0) // Exit code 0 despite warnings
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkXcodeLicense();

      expect(result.passed).toBe(true);
    });
  });
});
