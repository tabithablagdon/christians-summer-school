import { clampWeek } from './gameHelpers';

const MIN = 1;
const MAX = 4;

describe('clampWeek', () => {
  test('valid week in range returns as-is', () => {
    expect(clampWeek(2, MIN, MAX)).toBe(2);
  });

  test('week at min boundary returns min', () => {
    expect(clampWeek(1, MIN, MAX)).toBe(1);
  });

  test('week at max boundary returns max', () => {
    expect(clampWeek(4, MIN, MAX)).toBe(4);
  });

  test('week below min clamps to min', () => {
    expect(clampWeek(0, MIN, MAX)).toBe(1);
  });

  test('negative week clamps to min', () => {
    expect(clampWeek(-3, MIN, MAX)).toBe(1);
  });

  test('week above max clamps to max', () => {
    expect(clampWeek(9, MIN, MAX)).toBe(4);
  });

  test('null clamps to min', () => {
    expect(clampWeek(null, MIN, MAX)).toBe(1);
  });

  test('undefined clamps to min', () => {
    expect(clampWeek(undefined, MIN, MAX)).toBe(1);
  });

  test('NaN clamps to min', () => {
    expect(clampWeek(NaN, MIN, MAX)).toBe(1);
  });

  test('string number is coerced correctly', () => {
    expect(clampWeek('3', MIN, MAX)).toBe(3);
  });
});
