// Pure helper functions extracted for testability

export function calcSpeedPoints(correct) {
  return Math.min(correct * 15, 150);
}

export function cancelSpeech(setIsSpeaking) {
  window.speechSynthesis.cancel();
  setIsSpeaking(false);
export function shouldAwardSection(completedSections, secIdx) {
  return !completedSections.includes(secIdx);
}
