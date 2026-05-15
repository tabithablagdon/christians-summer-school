# Christian's Summer School ⚾🎮🤼

An interactive spelling and writing app built for Christian — featuring arcade-style points, a prize store, Home Run Derby review games, and AI-powered sentence grading.

## Features

- 📖 Word intro lessons with audio (powered by Claude AI + Web Speech API)
- ⌨️ Spelling quizzes with 3 tries per word and instant feedback
- ✍️ Sentence writing graded by Claude AI on spelling + correct usage
- ⚾ Home Run Derby review game
- 🎟️ Arcade-style point system with prize redemption store
- 🔥 Daily streaks with bonus points
- ⭐ Roblox-style leveling system (Rookie → Legend)
- ⚡ Extra credit bonus activities
- 📊 Progress tracker with baseball diamond milestone map

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
Open `.env` and replace `your_api_key_here` with your [Anthropic API key](https://console.anthropic.com/).

### 4. Run the app
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Editing the Curriculum

All spelling words, definitions, and example sentences live in one file:

```
src/config/curriculum.js
```

Each word entry looks like this:
```js
{
  word: "train",
  definition: "A line of connected vehicles that travel on rails.",
  sentences: [
    "I rode the train to the city.",
    "The train whistled as it passed the station.",
    "We watched the long freight train go by."
  ]
}
```

To add or change prizes, edit `src/config/prizes.js`.

## Deploying to GitHub Pages

```bash
npm run deploy
```

This builds the app and pushes it to the `gh-pages` branch automatically.  
Then go to **Settings → Pages** in your GitHub repo and set the source to the `gh-pages` branch.

Your app will be live at:  
`https://tabithablagdon.github.io/christians-summer-school`

## Tech Stack

- [React 18](https://react.dev/)
- [Anthropic Claude API](https://docs.anthropic.com/) — AI grading & natural TTS rewriting
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) — in-browser text-to-speech
- [Create React App](https://create-react-app.dev/)
- [gh-pages](https://github.com/tschaub/gh-pages) — one-command GitHub Pages deployment
