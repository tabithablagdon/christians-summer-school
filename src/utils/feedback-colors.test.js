import { getQuizFeedbackColor, getSentenceFeedbackColor } from './gameHelpers';

describe('getQuizFeedbackColor', () => {
  test('correct answer returns green', () => {
    expect(getQuizFeedbackColor(true, false)).toBe('#27ae60');
  });

  test('correct=true overrides showAnswer', () => {
    expect(getQuizFeedbackColor(true, true)).toBe('#27ae60');
  });

  test('wrong + show answer returns orange', () => {
    expect(getQuizFeedbackColor(false, true)).toBe('#FD5A1E');
  });

  test('wrong + try again returns navy', () => {
    expect(getQuizFeedbackColor(false, false)).toBe('#1a3a5c');
  });
});

describe('getSentenceFeedbackColor', () => {
  test('both correct returns green', () => {
    expect(getSentenceFeedbackColor(true, true)).toBe('#27ae60');
  });

  test('spelling correct only returns orange', () => {
    expect(getSentenceFeedbackColor(true, false)).toBe('#FD5A1E');
  });

  test('usage correct only returns orange', () => {
    expect(getSentenceFeedbackColor(false, true)).toBe('#FD5A1E');
  });

  test('both wrong returns navy', () => {
    expect(getSentenceFeedbackColor(false, false)).toBe('#1a3a5c');
  });
});
