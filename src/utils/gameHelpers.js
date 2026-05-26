// Pure helper functions extracted for testability

export function calcSpeedPoints(correct) {
  return Math.min(correct * 15, 150);
}

/**
 * Returns true if the user missed one or more days since their last login,
 * meaning the streak should reset to 0.
 * lastLoginDate uses the same format as new Date().toDateString().
 */
export function shouldResetStreak(lastLoginDate, todayStr) {
  if (!lastLoginDate) return false;
  const last = new Date(lastLoginDate);
  const today = new Date(todayStr);
  const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));
  return diffDays > 1;
}
