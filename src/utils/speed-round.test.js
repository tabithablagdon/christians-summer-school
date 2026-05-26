import { calcSpeedPoints } from './gameHelpers';

describe('calcSpeedPoints', () => {
  test('awards 0 points for 0 correct words', () => {
    expect(calcSpeedPoints(0)).toBe(0);
  });

  test('awards 15 points per correct word', () => {
    expect(calcSpeedPoints(1)).toBe(15);
    expect(calcSpeedPoints(5)).toBe(75);
  });

  test('caps at 150 points regardless of correct count', () => {
    expect(calcSpeedPoints(10)).toBe(150);
    expect(calcSpeedPoints(20)).toBe(150);
    expect(calcSpeedPoints(100)).toBe(150);
  });

  test('exactly 10 correct hits the cap', () => {
    expect(calcSpeedPoints(10)).toBe(150);
  });
});
