import { shouldAwardSection } from './gameHelpers';

describe('shouldAwardSection', () => {
  test('returns true for a section not yet completed', () => {
    expect(shouldAwardSection([], 0)).toBe(true);
    expect(shouldAwardSection([1, 2], 0)).toBe(true);
  });

  test('returns false if the section was already completed', () => {
    expect(shouldAwardSection([0], 0)).toBe(false);
    expect(shouldAwardSection([0, 1, 2], 1)).toBe(false);
  });

  test('handles empty completedSections array', () => {
    expect(shouldAwardSection([], 3)).toBe(true);
  });

  test('does not confuse different section indices', () => {
    expect(shouldAwardSection([0, 2], 1)).toBe(true);
    expect(shouldAwardSection([0, 2], 2)).toBe(false);
  });
});
