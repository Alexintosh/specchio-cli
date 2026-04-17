/**
 * Unit tests for Xcode installation check
 */

import { describe, it, expect, mock } from 'bun:test';
import { checkXcodeInstallation } from '../../src/checks/xcode.js';

describe('Xcode installation check', () => {
  describe('Xcode.app detection', () => {
    it('should fail when Xcode.app is not installed', async () => {
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
        exited: Promise.resolve(1) // test command fails
      }));

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkXcodeInstallation();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('not found');
      expect(result.fix).toContain('Install Xcode');
      expect(result.fix).toContain('App Store');
    });

    it('should succeed when Xcode.app exists', async () => {
      let callCount = 0;
      const mockSpawn = mock(() => {
        callCount++;

        // First call checks for directory existence
        if (callCount === 1) {
          return {
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
            exited: Promise.resolve(0) // Directory exists
          };
        }

        // Second call checks xcodebuild version
        return {
          stdout: new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode('Xcode 15.0.1\nBuild version 15A507'));
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
        };
      });

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkXcodeInstallation();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('Xcode 15.0.1');
    });
  });

  describe('version parsing', () => {
    it('should parse Xcode version correctly', async () => {
      let callCount = 0;
      const mockSpawn = mock(() => {
        callCount++;

        if (callCount === 1) {
          // Directory check
          return {
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
          };
        }

        // xcodebuild version check
        return {
          stdout: new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode('Xcode 14.2.0\nBuild version 14B47b'));
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
        };
      });

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkXcodeInstallation();

      expect(result.passed).toBe(true);
      expect(result.message).toBe('Xcode Xcode 14.2.0');
    });

    it('should handle version from first line only', async () => {
      let callCount = 0;
      const mockSpawn = mock(() => {
        callCount++;

        if (callCount === 1) {
          return {
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
          };
        }

        return {
          stdout: new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode('Xcode 15.0\nBuild version 15A507\nExtra line'));
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
        };
      });

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkXcodeInstallation();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('Xcode 15.0');
    });
  });

  describe('error handling', () => {
    it('should handle version check failure', async () => {
      let callCount = 0;
      const mockSpawn = mock(() => {
        callCount++;

        if (callCount === 1) {
          // Directory exists
          return {
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
          };
        }

        // xcodebuild fails
        return {
          stdout: new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode(''));
              controller.close();
            }
          }),
          stderr: new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode('xcodebuild: error: Developer tools not installed'));
              controller.close();
            }
          }),
          exited: Promise.resolve(1)
        };
      });

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkXcodeInstallation();

      expect(result.passed).toBe(false);
      expect(result.message).toContain('version check failed');
      expect(result.fix).toContain('xcode-select');
    });

    it('should handle empty version output', async () => {
      let callCount = 0;
      const mockSpawn = mock(() => {
        callCount++;

        if (callCount === 1) {
          return {
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
          };
        }

        return {
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
        };
      });

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkXcodeInstallation();

      expect(result.passed).toBe(true);
      expect(result.message).toBe('Xcode ');
    });
  });

  describe('edge cases', () => {
    it('should handle Xcode.app with trailing slash', async () => {
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

      const result = await checkXcodeInstallation();

      // Should check for /Applications/Xcode.app
      expect(result.passed).toBe(true);
    });

    it('should handle beta versions', async () => {
      let callCount = 0;
      const mockSpawn = mock(() => {
        callCount++;

        if (callCount === 1) {
          return {
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
          };
        }

        return {
          stdout: new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode('Xcode 16.0 Beta\nBuild version 16A123'));
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
        };
      });

      // @ts-ignore
      global.Bun = { ...global.Bun, spawn: mockSpawn };

      const result = await checkXcodeInstallation();

      expect(result.passed).toBe(true);
      expect(result.message).toContain('16.0 Beta');
    });
  });
});
