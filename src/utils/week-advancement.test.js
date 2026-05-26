import { nextWeek, prevWeek } from './gameHelpers';

const MAX_WEEK = 4;

describe('nextWeek', () => {
  test('advances from week 1 to week 2', () => {
    expect(nextWeek(1, MAX_WEEK)).toBe(2);
  });

  test('advances from week 3 to week 4', () => {
    expect(nextWeek(3, MAX_WEEK)).toBe(4);
  });

  test('clamps at maxWeek — cannot advance past week 4', () => {
    expect(nextWeek(4, MAX_WEEK)).toBe(4);
  });

  test('clamps at maxWeek when already beyond (edge case)', () => {
    expect(nextWeek(5, MAX_WEEK)).toBe(4);
  });
});

describe('prevWeek', () => {
  test('goes back from week 3 to week 2', () => {
    expect(prevWeek(3)).toBe(2);
  });

  test('goes back from week 2 to week 1', () => {
    expect(prevWeek(2)).toBe(1);
  });

  test('clamps at week 1 — cannot go below week 1', () => {
    expect(prevWeek(1)).toBe(1);
  });
});
