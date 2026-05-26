// Pure helper functions extracted for testability

export function calcSpeedPoints(correct) {
  return Math.min(correct * 15, 150);
}

/**
 * Advances to the next week, clamped to maxWeek.
 */
export function nextWeek(currentWeek, maxWeek) {
  return Math.min(currentWeek + 1, maxWeek);
}

/**
 * Goes back to the previous week, clamped to week 1.
 */
export function prevWeek(currentWeek) {
  return Math.max(currentWeek - 1, 1);
}
