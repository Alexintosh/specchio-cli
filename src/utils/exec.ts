/**
 * Shell command execution utilities using Bun.spawn()
 */

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Execute a shell command and return stdout
 * Throws an error if the command fails (non-zero exit code)
 */
export async function exec(command: string): Promise<string> {
  const startTime = Date.now();

  // Spawn the process through a shell to handle built-ins and pipes
  const proc = Bun.spawn({
    cmd: ['sh', '-c', command],
    stdout: 'pipe',
    stderr: 'pipe',
    stdin: 'inherit',
  });

  // Wait for process to complete
  const exited = proc.exited;
  const exitCode = await exited;

  // Get output
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();

  const duration = Date.now() - startTime;

  // Log for debugging
  console.debug(`[exec] ${command} (exit: ${exitCode}, ${duration}ms)`);

  // Throw on error
  if (exitCode !== 0) {
    throw new ExecError(command, exitCode, stdout, stderr);
  }

  return stdout.trim();
}

/**
 * Execute a shell command with sudo privileges
 * Throws an error if the command fails (non-zero exit code)
 */
export async function execWithSudo(command: string): Promise<string> {
  const startTime = Date.now();

  // Spawn the process with sudo through a shell
  const proc = Bun.spawn({
    cmd: ['sh', '-c', `sudo ${command}`],
    stdout: 'pipe',
    stderr: 'pipe',
    stdin: 'inherit',
  });

  // Wait for process to complete
  const exited = proc.exited;
  const exitCode = await exited;

  // Get output
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();

  const duration = Date.now() - startTime;

  // Log for debugging
  console.debug(`[exec:sudo] ${command} (exit: ${exitCode}, ${duration}ms)`);

  // Throw on error
  if (exitCode !== 0) {
    throw new ExecError(command, exitCode, stdout, stderr);
  }

  return stdout.trim();
}

/**
 * Execute a command and return full result (stdout, stderr, exitCode)
 * Does not throw on non-zero exit codes
 */
export async function execQuiet(command: string): Promise<ExecResult> {
  // Spawn the process through a shell
  const proc = Bun.spawn({
    cmd: ['sh', '-c', command],
    stdout: 'pipe',
    stderr: 'pipe',
    stdin: 'inherit',
  });

  // Wait for process to complete
  const exited = proc.exited;
  const exitCode = await exited;

  // Get output
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();

  return {
    stdout: stdout.trim(),
    stderr: stderr.trim(),
    exitCode,
  };
}

/**
 * Check if a command exists on the system
 */
export async function commandExists(command: string): Promise<boolean> {
  try {
    await exec(`which ${command}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a directory exists
 */
export async function directoryExists(path: string): Promise<boolean> {
  try {
    await exec(`test -d "${path}"`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    await exec(`test -f "${path}"`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Error thrown when a command fails
 */
export class ExecError extends Error {
  constructor(
    public readonly command: string,
    public readonly exitCode: number,
    public readonly stdout: string,
    public readonly stderr: string
  ) {
    super(`Command "${command}" failed with exit code ${exitCode}`);
    this.name = 'ExecError';
  }

  /**
   * Get a user-friendly error message
   */
  getDisplayMessage(): string {
    let message = `Command failed: ${this.command}\n`;
    message += `Exit code: ${this.exitCode}\n`;

    if (this.stderr) {
      message += `\nError output:\n${this.stderr}`;
    }

    if (this.stdout) {
      message += `\nStandard output:\n${this.stdout}`;
    }

    return message;
  }
}
