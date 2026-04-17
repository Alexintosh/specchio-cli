/**
 * Test setup and configuration
 */

// Set up test environment
global.console = {
  ...console,
  // Suppress console.debug during tests
  debug: jest.fn || (() => {}),
};

// Mock process.stdin and process.stdout for interactive prompts
process.stdin = {
  ...process.stdin,
  isTTY: true,
} as any;

process.stdout = {
  ...process.stdout,
  isTTY: true,
} as any;

// Add custom test matchers if needed
expect.extend({
  toBeValidVersion(received: string) {
    const pass = /^\d+\.\d+(\.\d+)?$/.test(received);
    return {
      pass,
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid version string`,
    };
  },
});

// Test utilities
export const createMockReadableStream = (content: string) => {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(content));
      controller.close();
    }
  });
};

export const createMockSpawnResult = (stdout: string, stderr: string, exitCode: number) => {
  return {
    stdout: createMockReadableStream(stdout),
    stderr: createMockReadableStream(stderr),
    exited: Promise.resolve(exitCode)
  };
};
