/**
 * Pretty CLI output utilities with colors and formatting
 */

/**
 * Print a success message with green checkmark
 */
export function printSuccess(message: string): void {
  console.log(`\x1b[32m✓\x1b[0m ${message}`);
}

/**
 * Print an error message with red X
 */
export function printError(message: string): void {
  console.error(`\x1b[31m✗\x1b[0m ${message}`);
}

/**
 * Print a warning message with yellow warning symbol
 */
export function printWarning(message: string): void {
  console.log(`\x1b[33m⚠\x1b[0m ${message}`);
}

/**
 * Print an info message with blue info symbol
 */
export function printInfo(message: string): void {
  console.log(`\x1b[36mℹ\x1b[0m ${message}`);
}

/**
 * Print a header/section title
 */
export function printHeader(title: string): void {
  console.log(`\n\x1b[1m\x1b[36m${title}\x1b[0m`);
  console.log('\x1b[90m' + '─'.repeat(Math.min(80, title.length)) + '\x1b[0m');
}

/**
 * Print a step number with description
 */
export function printStep(step: number, total: number, description: string): void {
  console.log(`\n\x1b[1mStep ${step}/${total}:\x1b[0m ${description}`);
}

/**
 * Print a bullet point
 */
export function printBullet(message: string): void {
  console.log(`  \x1b[90m•\x1b[0m ${message}`);
}

/**
 * Print a numbered list item
 */
export function printNumbered(num: number, message: string): void {
  console.log(`  \x1b[90m${num}.\x1b[0m ${message}`);
}

/**
 * Print a divider line
 */
export function printDivider(): void {
  console.log('');
}

/**
 * Print a URL in a clickable format
 */
export function printLink(label: string, url: string): void {
  console.log(`  \x1b[34m${label}:\x1b[0m ${url}`);
}

/**
 * Print a command that user should run
 */
export function printCommand(command: string): void {
  console.log(`  \x1b[33m$\x1b[0m ${command}`);
}

/**
 * Print a blank line
 */
export function printBlank(): void {
  console.log('');
}

/**
 * Print a highlighted message (for emphasis)
 */
export function printHighlight(message: string): void {
  console.log(`\x1b[1m\x1b[33m${message}\x1b[0m`);
}
