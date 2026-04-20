import { tryStringify } from './try-stringify';

describe('tryStringify', () => {
  it('should return the input if it is already a string', () => {
    const input = 'test string';
    const result = tryStringify(input);
    expect(result).toBe(input);
  });

  it('should return a JSON string if the input is an object', () => {
    const input = { key: 'value' };
    const result = tryStringify(input);
    expect(result).toBe(JSON.stringify(input));
  });

  it('should return an empty string if JSON.stringify returns undefined', () => {
    const input = undefined;
    const result = tryStringify(input);
    expect(result).toBe('');
  });

  it('should return "*not stringifiable*" if JSON.stringify throws an error', () => {
    const input = {
      toJSON() {
        throw new Error('test error');
      },
    };
    const result = tryStringify(input);
    expect(result).toBe('*not stringifiable*');
  });
});