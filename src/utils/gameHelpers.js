// Pure helper functions extracted for testability

export function calcSpeedPoints(correct) {
  return Math.min(correct * 15, 150);
}

/**
 * Clamps a week number to the valid range [min, max].
 * Returns min for any non-finite input (null, undefined, NaN).
 */
export function clampWeek(week, min, max) {
  const n = Number(week);
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}
