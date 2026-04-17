/**
 * User prompt utilities for interactive CLI
 */

/**
 * Prompt user for a yes/no response
 */
export async function promptYesNo(question: string): Promise<boolean> {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/N): `, (answer: string) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === 'y' || normalized === 'yes');
    });
  });
}

/**
 * Prompt user to press Enter to continue
 */
export async function promptContinue(message: string = 'Press Enter to continue...'): Promise<void> {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${message} `, () => {
      rl.close();
      resolve();
    });
  });
}

/**
 * Prompt user for text input
 */
export async function promptText(question: string, defaultValue?: string): Promise<string> {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const promptText = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;

  return new Promise((resolve) => {
    rl.question(promptText, (answer: string) => {
      rl.close();
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

/**
 * Prompt user to select from a list of options
 */
export async function promptSelect(question: string, options: string[]): Promise<number> {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log(`\n${question}`);
    options.forEach((option, index) => {
      console.log(`  ${index + 1}. ${option}`);
    });

    rl.question('\nSelect option (number): ', (answer: string) => {
      rl.close();
      const num = parseInt(answer.trim(), 10);
      const index = num - 1;
      
      if (isNaN(num) || index < 0 || index >= options.length) {
        console.log('Invalid selection, defaulting to option 1');
        resolve(0);
      } else {
        resolve(index);
      }
    });
  });
}
