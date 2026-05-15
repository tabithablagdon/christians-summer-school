import { rewriteForSpeech } from "./ai";

// Low-level: speak text directly via Web Speech API
export function speak(text, onStart, onEnd) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate  = 0.88;
  u.pitch = 1.05;
  const voices    = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.name.includes("Samantha") ||
    v.name.includes("Google US English") ||
    v.name.includes("Karen") ||
    v.lang === "en-US"
  );
  if (preferred) u.voice = preferred;
  if (onStart) u.onstart = onStart;
  if (onEnd)   u.onend   = onEnd;
  window.speechSynthesis.speak(u);
}

// High-level: rewrite via Claude for natural phrasing, then speak
export async function speakWithClaude(text, onStart, onEnd) {
  const natural = await rewriteForSpeech(text);
  speak(natural, onStart, onEnd);
}

// Speak a word + its first example sentence
export async function speakWord(wordObj, onStart, onEnd) {
  if (!wordObj) return;
  await speakWithClaude(`${wordObj.word}. ${wordObj.sentences[0]}`, onStart, onEnd);
}

// Speak full intro: word + definition + all example sentences
export async function speakIntroWord(wordObj, onStart, onEnd) {
  if (!wordObj) return;
  const text = `${wordObj.word}. ${wordObj.definition} Here are some examples. ${wordObj.sentences.join(" ")}`;
  await speakWithClaude(text, onStart, onEnd);
}
