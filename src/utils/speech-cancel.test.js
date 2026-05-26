import { cancelSpeech } from './gameHelpers';

beforeEach(() => {
  window.speechSynthesis = { cancel: jest.fn() };
});

describe('cancelSpeech', () => {
  test('calls speechSynthesis.cancel()', () => {
    cancelSpeech(jest.fn());
    expect(window.speechSynthesis.cancel).toHaveBeenCalledTimes(1);
  });

  test('calls setIsSpeaking with false', () => {
    const setIsSpeaking = jest.fn();
    cancelSpeech(setIsSpeaking);
    expect(setIsSpeaking).toHaveBeenCalledWith(false);
  });

  test('calls both cancel and setIsSpeaking on each invocation', () => {
    const setIsSpeaking = jest.fn();
    cancelSpeech(setIsSpeaking);
    cancelSpeech(setIsSpeaking);
    expect(window.speechSynthesis.cancel).toHaveBeenCalledTimes(2);
    expect(setIsSpeaking).toHaveBeenCalledTimes(2);
  });
});
