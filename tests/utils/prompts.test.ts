/**
 * Unit tests for prompt utility functions
 */

import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import {
  promptYesNo,
  promptContinue,
  promptText,
  promptSelect
} from '../../src/utils/prompts.js';

describe('prompt utility functions', () => {
  let mockStdin: any;
  let mockStdout: any;
  let mockReadline: any;

  beforeEach(() => {
    // Mock process.stdin and process.stdout
    mockStdin = {
      on: mock(() => {}),
      resume: mock(() => {}),
      pause: mock(() => {}),
      setRawMode: mock(() => {}),
      isTTY: true
    };

    mockStdout = {
      write: mock(() => true),
      on: mock(() => {})
    };

    // Mock readline module
    mockReadline = {
      createInterface: mock(() => ({
        question: mock((prompt: string, callback: (answer: string) => void) => {
          callback(''); // Default empty answer
        }),
        close: mock(() => {})
      }))
    };
  });

  afterEach(() => {
    mockStdin.on.mockClear();
    mockStdout.write.mockClear();
    mockReadline.createInterface.mockClear();
  });

  describe('promptYesNo', () => {
    it('should return true for "y" response', async () => {
      const mockInterface = {
        question: mock((prompt: string, callback: (answer: string) => void) => {
          callback('y');
        }),
        close: mock(() => {})
      };

      mockReadline.createInterface = mock(() => mockInterface);

      // @ts-ignore
      global.require = mock((moduleName: string) => {
        if (moduleName === 'readline') {
          return mockReadline;
        }
        return require(moduleName);
      });

      const result = await promptYesNo('Continue?');

      expect(result).toBe(true);
      expect(mockInterface.question).toHaveBeenCalledWith(
        expect.stringContaining('Continue?'),
        expect.any(Function)
      );
      expect(mockInterface.close).toHaveBeenCalled();
    });

    it('should return true for "yes" response', async () => {
      const mockInterface = {
        question: mock((prompt: string, callback: (answer: string) => void) => {
          callback('yes');
        }),
        close: mock(() => {})
      };

      mockReadline.createInterface = mock(() => mockInterface);

      // @ts-ignore
      global.require = mock((moduleName: string) => {
        if (moduleName === 'readline') {
          return mockReadline;
        }
        return require(moduleName);
      });

      const result = await promptYesNo('Proceed?');

      expect(result).toBe(true);
    });

    it('should return false for "n" response', async () => {
      const mockInterface = {
        question: mock((prompt: string, callback: (answer: string) => void) => {
          callback('n');
        }),
        close: mock(() => {})
      };

      mockReadline.createInterface = mock(() => mockInterface);

      // @ts-ignore
      global.require = mock((moduleName: string) => {
        if (moduleName === 'readline') {
          return mockReadline;
        }
        return require(moduleName);
      });

      const result = await promptYesNo('Continue?');

      expect(result).toBe(false);
    });

    it('should return false for empty response', async () => {
      const mockInterface = {
        question: mock((prompt: string, callback: (answer: string) => void) => {
          callback('');
        }),
        close: mock(() => {})
      };

      mockReadline.createInterface = mock(() => mockInterface);

      // @ts-ignore
      global.require = mock((moduleName: string) => {
        if (moduleName === 'readline') {
          return mockReadline;
        }
        return require(moduleName);
      });

      const result = await promptYesNo('Continue?');

      expect(result).toBe(false);
    });

    it('should handle case-insensitive input', async () => {
      const mockInterface = {
        question: mock((prompt: string, callback: (answer: string) => void) => {
          callback('YES');
        }),
        close: mock(() => {})
      };

      mockReadline.createInterface = mock(() => mockInterface);

      // @ts-ignore
      global.require = mock((moduleName: string) => {
        if (moduleName === 'readline') {
          return mockReadline;
        }
        return require(moduleName);
      });

      const result = await promptYesNo('Continue?');

      expect(result).toBe(true);
    });

    it('should trim whitespace from input', async () => {
      const mockInterface = {
        question: mock((prompt: string, callback: (answer: string) => void) => {
          callback('  y  ');
        }),
        close: mock(() => {})
      };

      mockReadline.createInterface = mock(() => mockInterface);

      // @ts-ignore
      global.require = mock((moduleName: string) => {
        if (moduleName === 'readline') {
          return mockReadline;
        }
        return require(moduleName);
      });

      const result = await promptYesNo('Continue?');

      expect(result).toBe(true);
    });
  });

  describe('promptContinue', () => {
    it('should resolve without returning a value', async () => {
      const mockInterface = {
        question: mock((prompt: string, callback: () => void) => {
          callback();
        }),
        close: mock(() => {})
      };

      mockReadline.createInterface = mock(() => mockInterface);

      // @ts-ignore
      global.require = mock((moduleName: string) => {
        if (moduleName === 'readline') {
          return mockReadline;
        }
        return require(moduleName);
      });

      const result = await promptContinue();

      expect(result).toBeUndefined();
      expect(mockInterface.close).toHaveBeenCalled();
    });

    it('should use default message', async () => {
      const mockInterface = {
        question: mock((prompt: string, callback: () => void) => {
          callback();
        }),
        close: mock(() => {})
      };

      mockReadline.createInterface = mock(() => mockInterface);

      // @ts-ignore
      global.require = mock((moduleName: string) => {
        if (moduleName === 'readline') {
          return mockReadline;
        }
        return require(moduleName);
      });

      await promptContinue();

      expect(mockInterface.question).toHaveBeenCalledWith(
        expect.stringContaining('Press Enter to continue'),
        expect.any(Function)
      );
    });

    it('should use custom message', async () => {
      const mockInterface = {
        question: mock((prompt: string, callback: () => void) => {
          callback();
        }),
        close: mock(() => {})
      };

      mockReadline.createInterface = mock(() => mockInterface);

      // @ts-ignore
      global.require = mock((moduleName: string) => {
        if (moduleName === 'readline') {
          return mockReadline;
        }
        return require(moduleName);
      });

      await promptContinue('Press any key to proceed...');

      expect(mockInterface.question).toHaveBeenCalledWith(
        expect.stringContaining('Press any key to proceed'),
        expect.any(Function)
      );
    });
  });

  describe('promptText', () => {
    it('should return user input', async () => {
      const mockInterface = {
        question: mock((prompt: string, callback: (answer: string) => void) => {
          callback('User input text');
        }),
        close: mock(() => {})
      };

      mockReadline.createInterface = mock(() => mockInterface);

      // @ts-ignore
      global.require = mock((moduleName: string) => {
        if (moduleName === 'readline') {
          return mockReadline;
        }
        return require(moduleName);
      });

      const result = await promptText('Enter your name:');

      expect(result).toBe('User input text');
    });

    it('should trim whitespace from input', async () => {
      const mockInterface = {
        question: mock((prompt: string, callback: (answer: string) => void) => {
          callback('  text with spaces  ');
        }),
        close: mock(() => {})
      };

      mockReadline.createInterface = mock(() => mockInterface);

      // @ts-ignore
      global.require = mock((moduleName: string) => {
        if (moduleName === 'readline') {
          return mockReadline;
        }
        return require(moduleName);
      });

      const result = await promptText('Enter text:');

      expect(result).toBe('text with spaces');
    });

    it('should use default value when input is empty', async () => {
      const mockInterface = {
        question: mock((prompt: string, callback: (answer: string) => void) => {
          callback('');
        }),
        close: mock(() => {})
      };

      mockReadline.createInterface = mock(() => mockInterface);

      // @ts-ignore
      global.require = mock((moduleName: string) => {
        if (moduleName === 'readline') {
          return mockReadline;
        }
        return require(moduleName);
      });

      const result = await promptText('Enter name:', 'John Doe');

      expect(result).toBe('John Doe');
    });

    it('should display default value in prompt', async () => {
      const mockInterface = {
        question: mock((prompt: string, callback: (answer: string) => void) => {
          callback('');
        }),
        close: mock(() => {})
      };

      mockReadline.createInterface = mock(() => mockInterface);

      // @ts-ignore
      global.require = mock((moduleName: string) => {
        if (moduleName === 'readline') {
          return mockReadline;
        }
        return require(moduleName);
      });

      await promptText('Enter name:', 'Default Name');

      expect(mockInterface.question).toHaveBeenCalledWith(
        expect.stringContaining('(Default Name)'),
        expect.any(Function)
      );
    });
  });

  describe('promptSelect', () => {
    it('should return index of selected option', async () => {
      const mockInterface = {
        question: mock((prompt: string, callback: (answer: string) => void) => {
          callback('2');
        }),
        close: mock(() => {})
      };

      mockReadline.createInterface = mock(() => mockInterface);

      // @ts-ignore
      global.require = mock((moduleName: string) => {
        if (moduleName === 'readline') {
          return mockReadline;
        }
        return require(moduleName);
      });

      const options = ['Option 1', 'Option 2', 'Option 3'];
      const result = await promptSelect('Select an option:', options);

      expect(result).toBe(1); // Index 1 (user entered 2)
    });

    it('should handle first option selection', async () => {
      const mockInterface = {
        question: mock((prompt: string, callback: (answer: string) => void) => {
          callback('1');
        }),
        close: mock(() => {})
      };

      mockReadline.createInterface = mock(() => mockInterface);

      // @ts-ignore
      global.require = mock((moduleName: string) => {
        if (moduleName === 'readline') {
          return mockReadline;
        }
        return require(moduleName);
      });

      const options = ['First', 'Second'];
      const result = await promptSelect('Choose:', options);

      expect(result).toBe(0); // Index 0
    });

    it('should default to option 1 for invalid input', async () => {
      const mockInterface = {
        question: mock((prompt: string, callback: (answer: string) => void) => {
          callback('invalid');
        }),
        close: mock(() => {})
      };

      mockReadline.createInterface = mock(() => mockInterface);

      // @ts-ignore
      global.require = mock((moduleName: string) => {
        if (moduleName === 'readline') {
          return mockReadline;
        }
        return require(moduleName);
      });

      const options = ['Option 1', 'Option 2'];
      const result = await promptSelect('Select:', options);

      expect(result).toBe(0); // Defaults to first option
    });

    it('should handle out-of-range input', async () => {
      const mockInterface = {
        question: mock((prompt: string, callback: (answer: string) => void) => {
          callback('99');
        }),
        close: mock(() => {})
      };

      mockReadline.createInterface = mock(() => mockInterface);

      // @ts-ignore
      global.require = mock((moduleName: string) => {
        if (moduleName === 'readline') {
          return mockReadline;
        }
        return require(moduleName);
      });

      const options = ['Option 1', 'Option 2'];
      const result = await promptSelect('Select:', options);

      expect(result).toBe(0); // Defaults to first option
    });

    it('should handle empty input', async () => {
      const mockInterface = {
        question: mock((prompt: string, callback: (answer: string) => void) => {
          callback('');
        }),
        close: mock(() => {})
      };

      mockReadline.createInterface = mock(() => mockInterface);

      // @ts-ignore
      global.require = mock((moduleName: string) => {
        if (moduleName === 'readline') {
          return mockReadline;
        }
        return require(moduleName);
      });

      const options = ['Option 1', 'Option 2'];
      const result = await promptSelect('Select:', options);

      expect(result).toBe(0); // Defaults to first option
    });
  });
});
