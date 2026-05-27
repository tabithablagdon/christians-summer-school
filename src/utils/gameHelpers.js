/**
 * gameHelpers.js
 *
 * Pure helper functions extracted from App.jsx for testability.
 * No side effects — each function takes inputs and returns a value.
 * Used by the app at runtime and by Jest tests in *.test.js files.
 */

/**
 * Calculates the points awarded at the end of a Speed Spelling Round.
 * Each correct word is worth 15 points, capped at 150 (10 words max payout).
 * Called in App.jsx when the 60-second timer expires.
 */
export function calcSpeedPoints(correct) {
  return Math.min(correct * 15, 150);
}

/**
 * Clamps a week number to the inclusive range [min, max].
 * Handles bad data from localStorage (null, undefined, NaN, out-of-range).
 * Used in App.jsx during state hydration and when deriving the active
 * curriculum week, so an invalid stored value can never crash the app.
 */
export function clampWeek(week, min, max) {
  const n = Number(week);
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}

/**
 * Returns the week number after advancing forward one week,
 * clamped so it never exceeds maxWeek (the total number of curriculum weeks).
 * Called in App.jsx from the Parent Controls "Next Week" button.
 */
export function nextWeek(currentWeek, maxWeek) {
  return Math.min(currentWeek + 1, maxWeek);
}

/**
 * Returns the week number after going back one week,
 * clamped so it never goes below week 1.
 * Called in App.jsx from the Parent Controls "Previous Week" button.
 */
export function prevWeek(currentWeek) {
  return Math.max(currentWeek - 1, 1);
}

/**
 * Returns true if the user missed one or more days since their last login,
 * meaning the daily streak should reset to 0.
 * A gap of exactly 1 day (yesterday → today) preserves the streak.
 * Called in the login useEffect in App.jsx on every new-day session start.
 * lastLoginDate and todayStr both use the new Date().toDateString() format.
 */
export function shouldResetStreak(lastLoginDate, todayStr) {
  if (!lastLoginDate) return false;
  const last = new Date(lastLoginDate);
  const today = new Date(todayStr);
  const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));
  return diffDays > 1;
}

/**
 * Returns the background color for the quiz feedback banner.
 * Three distinct states:
 *   correct = true              → green  (#27ae60) — right answer
 *   correct = false, showAnswer → orange (#FD5A1E) — out of tries, answer shown
 *   correct = false, !showAnswer → navy  (#1a3a5c) — wrong, tries remaining
 * Used in App.jsx to set the fbBg variable in the spelling quiz screen.
 */
export function getQuizFeedbackColor(correct, showAnswer) {
  if (correct) return "#27ae60";
  if (showAnswer) return "#FD5A1E";
  return "#1a3a5c";
}

/**
 * Returns the left-border color for the sentence writing feedback card.
 * Three distinct states:
 *   both correct  → green  (#27ae60) — full marks
 *   one correct   → orange (#FD5A1E) — partial credit
 *   both wrong    → navy   (#1a3a5c) — no credit
 * Used in App.jsx on the borderLeft style of the sentFeedback result card.
 */
export function getSentenceFeedbackColor(spellingCorrect, usageCorrect) {
  if (spellingCorrect && usageCorrect) return "#27ae60";
  if (spellingCorrect || usageCorrect) return "#FD5A1E";
  return "#1a3a5c";
}

/**
 * Cancels any in-progress speech synthesis and resets the speaking UI state.
 * Called on every Back button in App.jsx to ensure audio stops immediately
 * when the user navigates away from a screen mid-speech.
 */
export function cancelSpeech(setIsSpeaking) {
  window.speechSynthesis.cancel();
  setIsSpeaking(false);
}

/**
 * Returns true if a section has not yet been completed today,
 * meaning points should be awarded for completing it.
 * Guards against replaying sections to farm extra points.
 * Called in markSectionDone in App.jsx before awarding section points.
 */
export function shouldAwardSection(completedSections, secIdx) {
  return !completedSections.includes(secIdx);
}
