/**
 * Unit tests for certificate check
 */

import { describe, it, expect, mock } from 'bun:test';
import { checkCertificate } from '../../src/checks/certificate.js';

describe('certificate check', () => {
  describe('certificate detection', () => {
    it('should detect Apple Development certificate', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
  1) 1234567890ABCDEF1234567890ABCDEF12345678 "Apple Development: John Doe (ABCDEFGHIJ)"
  2) 0987654321FEDCBA0987654321FEDCBA09876543 "Apple Distribution: Acme Inc. (ZYXWVUTSRQ)"
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

      const result = await checkCertificate();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('Apple Development certificate found');
      expect(result.fix).toBeUndefined();
    });

    it('should handle multiple certificates', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
  1) 1111111111111111111111111111111111111111 "Apple Development: Developer One (AAAAAAAAAA)"
  2) 2222222222222222222222222222222222222222 "Apple Development: Developer Two (BBBBBBBBBB)"
  3) 3333333333333333333333333333333333333333 "Apple Distribution: Team (CCCCCCCCCC)"
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

      const result = await checkCertificate();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('Apple Development certificate found');
    });

    it('should fail when no Apple Development certificate found', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
  1) 9999999999999999999999999999999999999999 "Apple Distribution: Acme Inc. (ZYXWVUTSRQ)"
  2) 8888888888888888888888888888888888888888 "Developer ID Application: Developer (AAAAAAAAAA)"
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

      const result = await checkCertificate();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('No Apple Development certificate found');
      expect(result.fix).toContain('Xcode → Settings → Accounts');
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
            controller.enqueue(new TextEncoder().encode('security: SecKeychainItemCopyMatching: The specified item could not be found in the keychain.'));
            controller.close();
          }
        }),
        exited: Promise.reject(new Error('Command failed'))
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkCertificate();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('Unable to check');
      expect(result.fix).toBeDefined();
    });

    it('should handle empty keychain', async () => {
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

      const result = await checkCertificate();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('No Apple Development certificate found');
    });

    it('should handle security command not found', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(''));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('command not found: security'));
            controller.close();
          }
        }),
        exited: Promise.resolve(127)
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkCertificate();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('Unable to check');
    });
  });

  describe('edge cases', () => {
    it('should handle certificates with special characters', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
  1) ABCDEF1234567890ABCDEF1234567890ABCDEF12 "Apple Development: José María García (ÑÑÑÑÑÑÑÑÑ)"
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

      const result = await checkCertificate();

      expect(result.passed).toBe(true);
    });

    it('should handle expired certificates (still detected)', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
  1) 1234567890ABCDEF1234567890ABCDEF12345678 "Apple Development: Developer (AAAAAAAAAA)" (expired)
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

      const result = await checkCertificate();

      expect(result.passed).toBe(true);
    });

    it('should handle malformed output', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('Invalid certificate output format'));
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

      const result = await checkCertificate();

      expect(result.passed).toBe(false);
    });

    it('should handle certificates with similar names', async () => {
      const mockSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`
  1) 1234567890ABCDEF1234567890ABCDEF12345678 "Apple Development: Developer (AAAAAAAAAA)"
  2) 2345678901BCDEF012345678901BCDEF01234567 "iPhone Developer: Same Person (AAAAAAAAAA)"
  3) 3456789012CDEF0123456789012CDEF012345678 "Apple Development iOS: Developer (AAAAAAAAAA)"
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

      const result = await checkCertificate();

      expect(result.passed).toBe(true);
    });
  });
});
