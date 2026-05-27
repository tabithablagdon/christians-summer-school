# Christian's Summer School

An interactive educational app built for Christian (born 2017) to practice spelling and writing over summer break. Combines arcade-style game mechanics — streaks, leveling, a prize store — with Claude AI-powered grading and audio so the work actually feels like playing.

Themes rotate weekly across Baseball, Roblox, and WWE to keep the vocabulary relevant and engaging.

---

## What the App Does

Christian works through 4 themed weeks of spelling and writing activities:

| Week | Theme | Focus |
|------|-------|-------|
| 1 | Baseball Season Opener | Long vowels & blends |
| 2 | Roblox Adventure | Sight words & sentences |
| 3 | WWE Championship | Prefixes & suffixes |
| 4 | All-Star Showcase | Review & creative writing |

Each week has 15 words. Each day has 4 sections:

1. **Word Intro** — Hear each word, its definition, and example sentences read aloud. Claude rewrites them for natural speech; Web Speech API plays them back.
2. **Spelling Quiz** — Type each word. 3 tries per word with instant color-coded feedback.
3. **Sentence Writing** — Write a sentence using the word. Claude grades it on spelling correctness and whether the word is used correctly in context.
4. **Home Run Derby** — Fast-paced spelling review game where correct spellings hit home runs and wrong ones count as strikes.

### Points and Rewards

- Completing sections earns points (partial credit available)
- Daily login bonus: 25 pts
- Streak bonus: 700 pts every 3 consecutive days
- Leveling system: Rookie → Pro → All-Star → Champion → Legend
- Prize store: points redeem for real prizes (Pokemon cards up to an SF trip), managed by a parent

### Extra Credit

Four bonus activities available any time:

- Surprise Spelling Quiz — 10 random words, up to 250 pts
- Creative Writing Challenge — short story using 5 words, up to 200 pts
- Speed Spelling Round — 60 seconds, up to 150 pts
- Bonus Sentence Builder — 3 sentences, up to 150 pts

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/tabithablagdon/christians-summer-school.git
cd christians-summer-school
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your API key

```bash
cp .env.example .env
```

Open `.env` and add your [Anthropic API key](https://console.anthropic.com/):

```
REACT_APP_ANTHROPIC_API_KEY=your_key_here
```

The app calls the Claude API directly from the browser for two things: rewriting word definitions for natural text-to-speech, and grading sentence writing. Without the key those two features will fail — everything else works offline.

### 4. Start the dev server

```bash
npm start
```

Opens at [http://localhost:3000](http://localhost:3000). Hot reload is on — changes to any file in `src/` apply instantly without a restart.

---

## Running Tests

```bash
npm test
```

Runs 45 unit tests across 8 test files covering game logic, point calculations, color states, streak detection, and week navigation. All tests are pure function tests — no browser or API required.

To run a specific test file:

```bash
npm test -- --testPathPattern=gameHelpers --watchAll=false
```

---

## Project Structure

```
src/
  App.jsx                  # Full application — all screens and state
  config/
    curriculum.js          # 4 weeks × 15 words, definitions, and sentences
    prizes.js              # Prize store items and point costs
  utils/
    ai.js                  # Claude API call for sentence grading
    speech.js              # Text-to-speech with Claude rewrite for natural audio
    gameHelpers.js         # Pure helper functions (points, colors, streak logic)
public/
  index.html               # CSS variables, color tokens, baseball field background
```

To add or change spelling words, edit `src/config/curriculum.js`. Each word entry:

```js
{
  word: "strategy",
  definition: "A plan for achieving a goal.",
  sentences: [
    "The coach explained his strategy before the game.",
    "We need a strategy to win.",
    "Her strategy worked perfectly."
  ]
}
```

To add or change prizes, edit `src/config/prizes.js`.

---

## Deploying to GitHub Pages

```bash
npm run deploy
```

Builds the app and pushes to the `gh-pages` branch automatically. Then go to **Settings → Pages** in the GitHub repo and set the source to `gh-pages`.

Live at: `https://tabithablagdon.github.io/christians-summer-school`

---

## Tech Stack

- [React 18](https://react.dev/) — single-page app, no router or external state library
- [Anthropic Claude API](https://docs.anthropic.com/) — sentence grading and TTS rewriting
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) — in-browser text-to-speech, no external audio service
- [Create React App](https://create-react-app.dev/) — build tooling
- [gh-pages](https://github.com/tschaub/gh-pages) — one-command GitHub Pages deployment
