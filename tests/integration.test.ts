/**
 * Integration test suite
 *
 * Tests that all components work together properly
 */

import { describe, test, expect, mock } from 'bun:test';

describe('Integration Tests', () => {
  test('utils can be imported', async () => {
    const execModule = await import('../src/utils/exec.js');
    const outputModule = await import('../src/utils/output.js');
    const promptsModule = await import('../src/utils/prompts.js');

    expect(execModule).toBeDefined();
    expect(execModule.exec).toBeInstanceOf(Function);
    expect(outputModule).toBeDefined();
    expect(outputModule.printSuccess).toBeInstanceOf(Function);
    expect(promptsModule).toBeDefined();
    expect(promptsModule.promptYesNo).toBeInstanceOf(Function);
  });

  test('checks can be imported', async () => {
    const macosModule = await import('../src/checks/macos.js');
    const xcodeModule = await import('../src/checks/xcode.js');
    const licenseModule = await import('../src/checks/license.js');
    const iosSdkModule = await import('../src/checks/ios-sdk.js');
    const certModule = await import('../src/checks/certificate.js');
    const deviceModule = await import('../src/checks/device.js');

    expect(macosModule).toBeDefined();
    expect(macosModule.checkMacOSVersion).toBeInstanceOf(Function);
    expect(xcodeModule).toBeDefined();
    expect(xcodeModule.checkXcodeInstallation).toBeInstanceOf(Function);
    expect(licenseModule).toBeDefined();
    expect(licenseModule.checkXcodeLicense).toBeInstanceOf(Function);
    expect(iosSdkModule).toBeDefined();
    expect(iosSdkModule.checkIOSSDK).toBeInstanceOf(Function);
    expect(certModule).toBeDefined();
    expect(certModule.checkCertificate).toBeInstanceOf(Function);
    expect(deviceModule).toBeDefined();
    expect(deviceModule.checkConnectedDevice).toBeInstanceOf(Function);
  });

  test('types can be imported', async () => {
    const typesModule = await import('../src/types.js');

    expect(typesModule).toBeDefined();
  });

  test('exec functions are properly exported', async () => {
    const execModule = await import('../src/utils/exec.js');

    // Check that all expected functions are exported
    const expectedFunctions = [
      'exec',
      'execWithSudo',
      'execQuiet',
      'commandExists',
      'directoryExists',
      'fileExists'
    ];

    for (const funcName of expectedFunctions) {
      expect(execModule[funcName]).toBeInstanceOf(Function);
    }

    // Check that ExecError is exported
    expect(execModule.ExecError).toBeDefined();
    expect(execModule.ExecError).toBeInstanceOf(Function);
  });

  test('output functions are properly exported', async () => {
    const outputModule = await import('../src/utils/output.js');

    const expectedFunctions = [
      'printSuccess',
      'printError',
      'printWarning',
      'printInfo',
      'printHeader',
      'printStep',
      'printBullet',
      'printNumbered',
      'printDivider',
      'printLink',
      'printCommand',
      'printBlank',
      'printHighlight'
    ];

    for (const funcName of expectedFunctions) {
      expect(outputModule[funcName]).toBeInstanceOf(Function);
    }
  });

  test('prompt functions are properly exported', async () => {
    const promptsModule = await import('../src/utils/prompts.js');

    const expectedFunctions = [
      'promptYesNo',
      'promptContinue',
      'promptText',
      'promptSelect'
    ];

    for (const funcName of expectedFunctions) {
      expect(promptsModule[funcName]).toBeInstanceOf(Function);
    }
  });

  test('check functions return proper structure', async () => {
    const execModule = await import('../src/utils/exec.js');

    // Mock Bun.spawn for all tests
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

    const macosModule = await import('../src/checks/macos.js');
    const result = await macosModule.checkMacOSVersion();

    // Check that result has proper structure
    expect(result).toHaveProperty('passed');
    expect(result).toHaveProperty('message');
    expect(typeof result.passed).toBe('boolean');
    expect(typeof result.message).toBe('string');
  });

  test('ExecError can be thrown and caught', async () => {
    const { ExecError } = await import('../src/utils/exec.js');

    const error = new ExecError('test command', 1, 'stdout', 'stderr');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ExecError');
    expect(error.command).toBe('test command');
    expect(error.exitCode).toBe(1);
    expect(error.stdout).toBe('stdout');
    expect(error.stderr).toBe('stderr');
    expect(error.getDisplayMessage()).toBeDefined();
  });

  test('modules can work together', async () => {
    const outputModule = await import('../src/utils/output.js');
    const execModule = await import('../src/utils/exec.js');

    // Mock console.log
    const consoleSpy = mock(() => {});
    const originalLog = console.log;
    console.log = consoleSpy;

    // Mock Bun.spawn
    const mockSpawn = mock(() => ({
      stdout: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('test'));
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

    // Use output function
    outputModule.printSuccess('Test message');

    // Verify it was called
    expect(consoleSpy).toHaveBeenCalled();

    // Restore console.log
    console.log = originalLog;
  });
});
