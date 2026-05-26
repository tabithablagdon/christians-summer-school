// Pure helper functions extracted for testability

export function calcSpeedPoints(correct) {
  return Math.min(correct * 15, 150);
}
