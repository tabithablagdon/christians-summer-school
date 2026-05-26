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
  
 /**
 * Returns the background color for quiz feedback banners.
 * correct=true → green, showAnswer=true (max tries exhausted) → orange, else → navy (try again state)
 */
export function getQuizFeedbackColor(correct, showAnswer) {
  if (correct) return "#27ae60";
  if (showAnswer) return "#FD5A1E";
  return "#1a3a5c";
}

 /**
 * Returns the left-border color for sentence writing feedback.
 * Both correct → green, partial → orange, both wrong → navy
 */
export function getSentenceFeedbackColor(spellingCorrect, usageCorrect) {
  if (spellingCorrect && usageCorrect) return "#27ae60";
  if (spellingCorrect || usageCorrect) return "#FD5A1E";
  return "#1a3a5c";
  
export function cancelSpeech(setIsSpeaking) {
  window.speechSynthesis.cancel();
  setIsSpeaking(false);
  
export function shouldAwardSection(completedSections, secIdx) {
  return !completedSections.includes(secIdx);
}
