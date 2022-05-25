import { areRegExpsEqual } from '../src/regexps';

describe('areRegExpsEqual', () => {
  it('should return false if the source values are different', () => {
    const a = new RegExp('foo');
    const b = new RegExp('bar');

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  it('should return false if the global flag is different', () => {
    const a = new RegExp('foo', 'g');
    const b = new RegExp('foo');

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  it('should return false if the ignoreCase flag is different', () => {
    const a = new RegExp('foo', 'i');
    const b = new RegExp('foo');

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  it('should return false if the multiline flag is different', () => {
    const a = new RegExp('foo', 'm');
    const b = new RegExp('foo');

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  it('should return false if the unicode flag is different', () => {
    const a = new RegExp('\u{61}', 'u');
    const b = new RegExp('\u{61}');

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  it('should return false if the sticky flag is different', () => {
    const a = new RegExp('foo', 'y');
    const b = new RegExp('foo');

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  it('should return true if the values and flags are equal', () => {
    const a = new RegExp('foo', 'gi');
    const b = new RegExp('foo', 'ig');

    expect(areRegExpsEqual(a, b)).toBe(true);
  });
});
