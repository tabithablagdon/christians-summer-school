import { shouldResetStreak } from './gameHelpers';

describe('shouldResetStreak', () => {
  test('returns false when lastLoginDate is null (first ever login)', () => {
    expect(shouldResetStreak(null, 'Wed May 26 2026')).toBe(false);
  });

  test('returns false when last login was yesterday (streak continues)', () => {
    expect(shouldResetStreak('Mon May 25 2026', 'Tue May 26 2026')).toBe(false);
  });

  test('returns true when last login was 2 days ago (missed a day)', () => {
    expect(shouldResetStreak('Sun May 24 2026', 'Tue May 26 2026')).toBe(true);
  });

  test('returns true when last login was a week ago', () => {
    expect(shouldResetStreak('Tue May 19 2026', 'Tue May 26 2026')).toBe(true);
  });

  test('returns false when last login was today (same-day reload)', () => {
    expect(shouldResetStreak('Tue May 26 2026', 'Tue May 26 2026')).toBe(false);
  });
});
