// Pure helper functions extracted for testability

export function calcSpeedPoints(correct) {
  return Math.min(correct * 15, 150);
}

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
