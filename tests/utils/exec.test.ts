/**
 * Unit tests for exec utility functions
 */

import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { exec, execWithSudo, execQuiet, commandExists, directoryExists, fileExists, ExecError } from '../../src/utils/exec.js';

// Mock Bun.spawn to avoid real command execution
const mockSpawn = mock(() => ({
  stdout: new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('mocked output'));
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

describe('exec utility functions', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    mockSpawn.mockClear();
  });

  describe('exec', () => {
    it('should successfully execute a command and return stdout', async () => {
      const result = await exec('echo hello');
      expect(result).toBe('mocked output');
    });

    it('should throw ExecError on non-zero exit code', async () => {
      const failingSpawn = mock(() => ({
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

      // @ts-ignore - mocking Bun.spawn
      global.Bun = { ...global.Bun, spawn: failingSpawn };

      expect(exec('nonexistent_command')).rejects.toThrow();
    });

    it('should trim whitespace from output', async () => {
      const trimmingSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('  output with spaces  '));
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

      // @ts-ignore - mocking Bun.spawn
      global.Bun = { ...global.Bun, spawn: trimmingSpawn };

      const result = await exec('echo test');
      expect(result).toBe('output with spaces');
    });

    it('should handle empty output', async () => {
      const emptySpawn = mock(() => ({
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

      // @ts-ignore - mocking Bun.spawn
      global.Bun = { ...global.Bun, spawn: emptySpawn };

      const result = await exec('true');
      expect(result).toBe('');
    });
  });

  describe('execWithSudo', () => {
    it('should prepend sudo to command', async () => {
      const sudoSpawn = mock((opts: { cmd: string[] }) => {
        const command = opts.cmd.join(' ');
        expect(command).toContain('sudo');

        return {
          stdout: new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode('success'));
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

      // @ts-ignore - mocking Bun.spawn
      global.Bun = { ...global.Bun, spawn: sudoSpawn };

      const result = await execWithSudo('echo test');
      expect(result).toBe('success');
    });

    it('should throw on failure', async () => {
      const failingSudoSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(''));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('Permission denied'));
            controller.close();
          }
        }),
        exited: Promise.resolve(1)
      }));

      // @ts-ignore - mocking Bun.spawn
      global.Bun = { ...global.Bun, spawn: failingSudoSpawn };

      expect(execWithSudo('restricted_command')).rejects.toThrow();
    });
  });

  describe('execQuiet', () => {
    it('should return full result including exit code', async () => {
      const quietSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('stdout content'));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('stderr content'));
            controller.close();
          }
        }),
        exited: Promise.resolve(0)
      }));

      // @ts-ignore - mocking Bun.spawn
      global.Bun = { ...global.Bun, spawn: quietSpawn };

      const result = await execQuiet('test command');

      expect(result).toEqual({
        stdout: 'stdout content',
        stderr: 'stderr content',
        exitCode: 0
      });
    });

    it('should not throw on non-zero exit code', async () => {
      const quietSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(''));
            controller.close();
          }
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('error'));
            controller.close();
          }
        }),
        exited: Promise.resolve(1)
      }));

      // @ts-ignore - mocking Bun.spawn
      global.Bun = { ...global.Bun, spawn: quietSpawn };

      const result = await execQuiet('failing command');

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toBe('error');
    });
  });

  describe('commandExists', () => {
    it('should return true when command exists', async () => {
      const existingSpawn = mock(() => ({
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('/usr/bin/git'));
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

      // @ts-ignore - mocking Bun.spawn
      global.Bun = { ...global.Bun, spawn: existingSpawn };

      const result = await commandExists('git');
      expect(result).toBe(true);
    });

    it('should return false when command does not exist', async () => {
      const nonExistingSpawn = mock(() => ({
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
        exited: Promise.resolve(1)
      }));

      // @ts-ignore - mocking Bun.spawn
      global.Bun = { ...global.Bun, spawn: nonExistingSpawn };

      const result = await commandExists('nonexistent_command');
      expect(result).toBe(false);
    });
  });

  describe('directoryExists', () => {
    it('should return true when directory exists', async () => {
      const dirSpawn = mock(() => ({
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

      // @ts-ignore - mocking Bun.spawn
      global.Bun = { ...global.Bun, spawn: dirSpawn };

      const result = await directoryExists('/usr/local');
      expect(result).toBe(true);
    });

    it('should return false when directory does not exist', async () => {
      const noDirSpawn = mock(() => ({
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
        exited: Promise.resolve(1)
      }));

      // @ts-ignore - mocking Bun.spawn
      global.Bun = { ...global.Bun, spawn: noDirSpawn };

      const result = await directoryExists('/nonexistent/path');
      expect(result).toBe(false);
    });
  });

  describe('fileExists', () => {
    it('should return true when file exists', async () => {
      const fileSpawn = mock(() => ({
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

      // @ts-ignore - mocking Bun.spawn
      global.Bun = { ...global.Bun, spawn: fileSpawn };

      const result = await fileExists('/etc/hosts');
      expect(result).toBe(true);
    });

    it('should return false when file does not exist', async () => {
      const noFileSpawn = mock(() => ({
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
        exited: Promise.resolve(1)
      }));

      // @ts-ignore - mocking Bun.spawn
      global.Bun = { ...global.Bun, spawn: noFileSpawn };

      const result = await fileExists('/nonexistent/file.txt');
      expect(result).toBe(false);
    });
  });

  describe('ExecError', () => {
    it('should create error with correct properties', () => {
      const error = new ExecError('test command', 1, 'stdout', 'stderr');

      expect(error.command).toBe('test command');
      expect(error.exitCode).toBe(1);
      expect(error.stdout).toBe('stdout');
      expect(error.stderr).toBe('stderr');
      expect(error.name).toBe('ExecError');
      expect(error.message).toContain('test command');
      expect(error.message).toContain('1');
    });

    it('should generate display message', () => {
      const error = new ExecError('failing command', 127, 'output', 'error message');

      const display = error.getDisplayMessage();

      expect(display).toContain('failing command');
      expect(display).toContain('127');
      expect(display).toContain('error message');
      expect(display).toContain('output');
    });

    it('should handle empty stderr in display message', () => {
      const error = new ExecError('test', 1, 'stdout', '');

      const display = error.getDisplayMessage();

      expect(display).toContain('stdout');
      expect(display).not.toContain('Error output:');
    });
  });
});
