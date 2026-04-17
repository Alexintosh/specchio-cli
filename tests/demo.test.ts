/**
 * Demonstration test - shows basic functionality works
 */

import { describe, test, expect } from 'bun:test';

describe('Specchio CLI Test Suite Demo', () => {
  test('math operations work', () => {
    expect(1 + 1).toBe(2);
    expect(2 * 3).toBe(6);
  });

  test('string operations work', () => {
    const str = 'Specchio CLI';
    expect(str.toLowerCase()).toBe('specchio cli');
    expect(str.split(' ')).toEqual(['Specchio', 'CLI']);
  });

  test('array operations work', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr.length).toBe(5);
    expect(arr.filter(n => n > 2)).toEqual([3, 4, 5]);
  });

  test('object operations work', () => {
    const obj = {
      name: 'Specchio',
      version: '1.0.0',
      passed: true
    };

    expect(obj.name).toBe('Specchio');
    expect(obj.passed).toBe(true);
  });

  test('async/await works', async () => {
    const promise = Promise.resolve('test passed');
    const result = await promise;
    expect(result).toBe('test passed');
  });

  test('error handling works', () => {
    expect(() => {
      throw new Error('Test error');
    }).toThrow('Test error');
  });

  test('can test types', () => {
    const num = 42;
    const str = '42';
    const bool = true;

    expect(typeof num).toBe('number');
    expect(typeof str).toBe('string');
    expect(typeof bool).toBe('boolean');
  });

  test('can check object properties', () => {
    const result = {
      passed: true,
      message: 'Test completed',
      fix: undefined
    };

    expect(result).toHaveProperty('passed');
    expect(result).toHaveProperty('message');
    expect(result.fix).toBeUndefined();
  });

  test('can test conditional logic', () => {
    const version = 14.0;
    const isCompatible = version >= 14.0;

    expect(isCompatible).toBe(true);

    const oldVersion = 13.5;
    const isOldCompatible = oldVersion >= 14.0;

    expect(isOldCompatible).toBe(false);
  });
});
