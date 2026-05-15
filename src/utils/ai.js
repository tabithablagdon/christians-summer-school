const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL   = "claude-sonnet-4-20250514";

// Rewrites text to sound natural and warm for a 9-year-old, used before TTS
export async function rewriteForSpeech(text) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        messages: [{
          role: "user",
          content: `Rewrite this text to sound warm, enthusiastic, and natural when read aloud to a 9-year-old boy learning to spell. Keep it short, clear, and encouraging. Return ONLY the rewritten text, no quotes or explanation:\n\n${text}`
        }]
      })
    });
    const data = await res.json();
    return data?.content?.[0]?.text?.trim() || text;
  } catch {
    return text;
  }
}

// Grades a sentence on spelling of target word and correct usage in context
export async function gradeSentence(word, definition, sentence) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        messages: [{
          role: "user",
          content: `You are grading a 9-year-old's sentence writing exercise. The target word is "${word}" (definition: ${definition}).

The student wrote: "${sentence}"

Grade TWO things separately:
1. SPELLING: Did the student spell "${word}" correctly somewhere in their sentence? (true/false)
2. USAGE: Did the student use "${word}" correctly and meaningfully in context? Be generous — if it makes grammatical sense and shows they understand the word, mark true. (true/false)

Also write a short, warm, encouraging feedback message (1-2 sentences max) for a 9-year-old. Be specific about what they did right or wrong.

Respond ONLY with valid JSON like this:
{"spellingCorrect": true, "usageCorrect": false, "feedback": "Great try! You used the word in a sentence, but..."}`
        }]
      })
    });
    const data = await res.json();
    const raw   = data?.content?.[0]?.text?.trim() || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    const spellingCorrect = sentence.toLowerCase().includes(word.toLowerCase());
    return {
      spellingCorrect,
      usageCorrect: spellingCorrect,
      feedback: spellingCorrect ? "Good job using the word!" : "Try including the word in your sentence."
    };
  }
}
