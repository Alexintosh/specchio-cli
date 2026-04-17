/**
 * Unit tests for output utility functions
 */

import { describe, it, expect, spyOn } from 'bun:test';
import {
  printSuccess,
  printError,
  printWarning,
  printInfo,
  printHeader,
  printStep,
  printBullet,
  printNumbered,
  printDivider,
  printLink,
  printCommand,
  printBlank,
  printHighlight
} from '../../src/utils/output.js';

describe('output utility functions', () => {
  describe('printSuccess', () => {
    it('should print success message with green checkmark', () => {
      const spy = spyOn(console, 'log');
      printSuccess('Operation completed');

      expect(spy).toHaveBeenCalled();
      const output = spy.mock.calls[0][0] as string;
      expect(output).toContain('✓');
      expect(output).toContain('Operation completed');
      expect(output).toContain('\x1b[32m'); // Green color
      spy.restore();
    });
  });

  describe('printError', () => {
    it('should print error message with red X', () => {
      const spy = spyOn(console, 'error');
      printError('Operation failed');

      expect(spy).toHaveBeenCalled();
      const output = spy.mock.calls[0][0] as string;
      expect(output).toContain('✗');
      expect(output).toContain('Operation failed');
      expect(output).toContain('\x1b[31m'); // Red color
      spy.restore();
    });
  });

  describe('printWarning', () => {
    it('should print warning message with yellow warning symbol', () => {
      const spy = spyOn(console, 'log');
      printWarning('This is a warning');

      expect(spy).toHaveBeenCalled();
      const output = spy.mock.calls[0][0] as string;
      expect(output).toContain('⚠');
      expect(output).toContain('This is a warning');
      expect(output).toContain('\x1b[33m'); // Yellow color
      spy.restore();
    });
  });

  describe('printInfo', () => {
    it('should print info message with blue info symbol', () => {
      const spy = spyOn(console, 'log');
      printInfo('Information message');

      expect(spy).toHaveBeenCalled();
      const output = spy.mock.calls[0][0] as string;
      expect(output).toContain('ℹ');
      expect(output).toContain('Information message');
      expect(output).toContain('\x1b[36m'); // Cyan color
      spy.restore();
    });
  });

  describe('printHeader', () => {
    it('should print header with title and divider', () => {
      const spy = spyOn(console, 'log');
      printHeader('Test Section');

      expect(spy).toHaveBeenCalledTimes(2);
      const titleCall = spy.mock.calls[0][0] as string;
      const dividerCall = spy.mock.calls[1][0] as string;

      expect(titleCall).toContain('Test Section');
      expect(dividerCall).toContain('─');
      expect(titleCall).toContain('\x1b[1m'); // Bold
      spy.restore();
    });

    it('should limit divider length to 80 characters', () => {
      const spy = spyOn(console, 'log');
      const longTitle = 'A'.repeat(100);
      printHeader(longTitle);

      const dividerCall = spy.mock.calls[1][0] as string;

      // Count divider characters (excluding ANSI codes)
      const dividerLength = (dividerCall.match(/─/g) || []).length;
      expect(dividerLength).toBeLessThanOrEqual(80);
      spy.restore();
    });
  });

  describe('printStep', () => {
    it('should print step with progress', () => {
      const spy = spyOn(console, 'log');
      printStep(3, 5, 'Configure settings');

      expect(spy).toHaveBeenCalled();
      const output = spy.mock.calls[0][0] as string;
      expect(output).toContain('Step 3/5');
      expect(output).toContain('Configure settings');
      expect(output).toContain('\x1b[1m'); // Bold
      spy.restore();
    });
  });

  describe('printBullet', () => {
    it('should print bullet point with message', () => {
      const spy = spyOn(console, 'log');
      printBullet('Item one');

      expect(spy).toHaveBeenCalled();
      const output = spy.mock.calls[0][0] as string;
      expect(output).toContain('•');
      expect(output).toContain('Item one');
      spy.restore();
    });
  });

  describe('printNumbered', () => {
    it('should print numbered list item', () => {
      const spy = spyOn(console, 'log');
      printNumbered(1, 'First item');

      expect(spy).toHaveBeenCalled();
      const output = spy.mock.calls[0][0] as string;
      expect(output).toContain('1.');
      expect(output).toContain('First item');
      spy.restore();
    });
  });

  describe('printDivider', () => {
    it('should print blank line', () => {
      const spy = spyOn(console, 'log');
      printDivider();

      expect(spy).toHaveBeenCalledWith('');
      spy.restore();
    });
  });

  describe('printLink', () => {
    it('should print clickable URL', () => {
      const spy = spyOn(console, 'log');
      printLink('Documentation', 'https://example.com/docs');

      expect(spy).toHaveBeenCalled();
      const output = spy.mock.calls[0][0] as string;
      expect(output).toContain('Documentation');
      expect(output).toContain('https://example.com/docs');
      expect(output).toContain('\x1b[34m'); // Blue color
      spy.restore();
    });
  });

  describe('printCommand', () => {
    it('should print command with dollar sign', () => {
      const spy = spyOn(console, 'log');
      printCommand('npm install');

      expect(spy).toHaveBeenCalled();
      const output = spy.mock.calls[0][0] as string;
      expect(output).toContain('$');
      expect(output).toContain('npm install');
      expect(output).toContain('\x1b[33m'); // Yellow color
      spy.restore();
    });
  });

  describe('printBlank', () => {
    it('should print blank line', () => {
      const spy = spyOn(console, 'log');
      printBlank();

      expect(spy).toHaveBeenCalledWith('');
      spy.restore();
    });
  });

  describe('printHighlight', () => {
    it('should print highlighted message', () => {
      const spy = spyOn(console, 'log');
      printHighlight('Important notice');

      expect(spy).toHaveBeenCalled();
      const output = spy.mock.calls[0][0] as string;
      expect(output).toContain('Important notice');
      expect(output).toContain('\x1b[1m'); // Bold
      expect(output).toContain('\x1b[33m'); // Yellow color
      spy.restore();
    });
  });
});
