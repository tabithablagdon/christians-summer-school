import { useState, useEffect, useRef } from "react";
import { CURRICULUM } from "./config/curriculum";
import { PRIZES } from "./config/prizes";
import { speakWord, speakIntroWord } from "./utils/speech";
import { gradeSentence as gradeWithClaude } from "./utils/ai";

const BONUS_ACTIVITIES = [
  { id: "bq", name: "Surprise Spelling Quiz", desc: "Spell 10 random words", maxPts: 250, icon: "⚡" },
  { id: "cw", name: "Creative Writing Challenge", desc: "Write a short story using 5 words", maxPts: 200, icon: "✍️" },
  { id: "ss", name: "Speed Spelling Round", desc: "Spell as many words as you can in 60s", maxPts: 150, icon: "⏱️" },
  { id: "sb", name: "Bonus Sentence Builder", desc: "Build 3 sentences using spelling words", maxPts: 150, icon: "🏗️" },
];

const DAILY_FACTS = [
  "⚾ Did you know? Babe Ruth hit 714 home runs in his career!",
  "🎮 Fun fact: Roblox was created in 2006 and has over 200 million players!",
  "🤼 WWE fact: John Cena has won the WWE Championship 16 times!",
  "⚾ Baseball fact: A regulation baseball has exactly 108 stitches!",
  "🎮 Roblox fact: Players create over 20 million games on Roblox!",
  "🤼 WWE fact: The first WrestleMania was held in 1985 at Madison Square Garden!",
];

const LEVELS = [
  { name: "Rookie",   min: 0,     max: 999 },
  { name: "Pro",      min: 1000,  max: 2999 },
  { name: "All-Star", min: 3000,  max: 5999 },
  { name: "Champion", min: 6000,  max: 9999 },
  { name: "Legend",   min: 10000, max: Infinity },
];

const SECTION_POINTS = {
  perfect:  [150, 200, 200, 150],
  partial:  [100, 130, 130, 100],
  complete: [75,  80,  80,  75],
};

const defaultState = {
  points: 0, totalEarned: 0, streak: 0, lastLoginDate: null,
  currentDay: 1, currentWeek: 1, completedDays: [], redeemedPrizes: [],
  loginBonus: false, todaySectionsCompleted: [], todayPointsEarned: 0,
};

function getLevel(pts)        { return LEVELS.find(l => pts >= l.min && pts <= l.max) || LEVELS[0]; }
function getNextLevel(pts)    { const i = LEVELS.findIndex(l => pts >= l.min && pts <= l.max); return i < LEVELS.length - 1 ? LEVELS[i + 1] : null; }
function getLevelProgress(pts){ const l = getLevel(pts); if (l.max === Infinity) return 100; return Math.round(((pts - l.min) / (l.max - l.min)) * 100); }

export default function App() {
  const [state, setState] = useState(() => {
    try { const s = localStorage.getItem("css_state_v2"); return s ? { ...defaultState, ...JSON.parse(s) } : defaultState; }
    catch { return defaultState; }
  });
  const [screen, setScreen] = useState("home");
  const [activeSection, setActiveSection] = useState(null);

  // Intro
  const [introWords,  setIntroWords]  = useState([]);
  const [introIndex,  setIntroIndex]  = useState(0);
  const [isSpeaking,  setIsSpeaking]  = useState(false);

  // Spelling quiz (sections 0, 1)
  const [quizWords,    setQuizWords]    = useState([]);
  const [quizIndex,    setQuizIndex]    = useState(0);
  const [userInput,    setUserInput]    = useState("");
  const [quizResults,  setQuizResults]  = useState([]);
  const [quizDone,     setQuizDone]     = useState(false);
  const [quizTries,    setQuizTries]    = useState(0);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [sessionPoints,setSessionPoints]= useState(0);

  // Sentence writing (section 2)
  const [sentWords,   setSentWords]   = useState([]);
  const [sentIndex,   setSentIndex]   = useState(0);
  const [sentInput,   setSentInput]   = useState("");
  const [sentResults, setSentResults] = useState([]);
  const [sentDone,    setSentDone]    = useState(false);
  const [sentGrading, setSentGrading] = useState(false);
  const [sentFeedback,setSentFeedback]= useState(null);

  // Home Run Derby (section 3)
  const [derbWords,    setDerbWords]    = useState([]);
  const [derbIndex,    setDerbIndex]    = useState(0);
  const [derbInput,    setDerbInput]    = useState("");
  const [derbStrikes,  setDerbStrikes]  = useState(0);
  const [derbHits,     setDerbHits]     = useState(0);
  const [derbOuts,     setDerbOuts]     = useState(0);
  const [derbFeedback, setDerbFeedback] = useState(null);
  const [derbDone,     setDerbDone]     = useState(false);
  const [derbAnim,     setDerbAnim]     = useState(null);

  // Shared
  const [showConfetti,   setShowConfetti]   = useState(false);
  const [notification,   setNotification]   = useState(null);
  const [showPrizeUnlock,setShowPrizeUnlock]= useState(false);
  const [redeemConfirm,  setRedeemConfirm]  = useState(null);

  // Bonus
  const [bonusScreen,  setBonusScreen]  = useState(null);
  const [bonusInput,   setBonusInput]   = useState("");
  const [bonusWords,   setBonusWords]   = useState([]);
  const [bonusIdx,     setBonusIdx]     = useState(0);
  const [bonusResults, setBonusResults] = useState([]);
  const [bonusDone,    setBonusDone]    = useState(false);
  const [speedActive,  setSpeedActive]  = useState(false);
  const [speedTimer,   setSpeedTimer]   = useState(60);
  const [speedWords,   setSpeedWords]   = useState([]);
  const [speedInput,   setSpeedInput]   = useState("");
  const [speedCorrect, setSpeedCorrect] = useState(0);
  const [speedWordIdx, setSpeedWordIdx] = useState(0);
  const [sentenceWords,setSentenceWords]= useState([]);
  const [sentences,    setSentences]    = useState(["", "", ""]);
  const [sentenceDone, setSentenceDone] = useState(false);
  const timerRef = useRef(null);
  const speedCorrectRef = useRef(0);

  const todayStr        = new Date().toDateString();
  const alreadyDoneToday= state.completedDays.includes(todayStr);
  const week            = CURRICULUM[state.currentWeek - 1];

  useEffect(() => {
    try { localStorage.setItem("css_state_v2", JSON.stringify(state)); } catch {}
  }, [state]);

  useEffect(() => {
    window.speechSynthesis.getVoices();
    if (state.lastLoginDate !== todayStr) {
      const fact = DAILY_FACTS[Math.floor(Math.random() * DAILY_FACTS.length)];
      setNotification({ type: "login", msg: fact });
      setState(s => ({ ...s, lastLoginDate: todayStr, points: s.points + 25, totalEarned: s.totalEarned + 25, todaySectionsCompleted: [], todayPointsEarned: 0 }));
    }
  }, []);

  const awardPoints = (pts) => {
    setState(s => ({ ...s, points: s.points + pts, totalEarned: s.totalEarned + pts, todayPointsEarned: s.todayPointsEarned + pts }));
    setSessionPoints(p => p + pts);
  };

  const completeDay = () => {
    if (alreadyDoneToday) return;
    setState(s => {
      const nc = [...s.completedDays, todayStr];
      const ns = s.streak + 1;
      const bp = ns % 3 === 0 ? 700 : 0;
      return { ...s, completedDays: nc, streak: ns, points: s.points + bp, totalEarned: s.totalEarned + bp };
    });
    if ((state.streak + 1) % 3 === 0) setShowPrizeUnlock(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  const markSectionDone = (secIdx, pts) => {
    if ((state.todaySectionsCompleted || []).includes(secIdx)) return;
    awardPoints(pts);
    const newCompleted = [...(state.todaySectionsCompleted || []), secIdx];
    setState(s => ({ ...s, todaySectionsCompleted: newCompleted }));
    if (newCompleted.length >= 4 && !alreadyDoneToday) completeDay();
  };

  // ── SECTION ROUTING ─────────────────────────────────────
  const startIntro = (secIdx) => {
    setActiveSection(secIdx);
    setSessionPoints(0);
    if (secIdx === 2) {
      const words = [...week.words].sort(() => Math.random() - 0.5).slice(0, 5);
      setSentWords(words); setSentIndex(0); setSentInput(""); setSentResults([]);
      setSentDone(false); setSentFeedback(null); setIsSpeaking(false);
      setScreen("sentenceWriter");
    } else if (secIdx === 3) {
      const dw = [...week.words].sort(() => Math.random() - 0.5);
      setDerbWords(dw); setDerbIndex(0); setDerbInput(""); setDerbStrikes(0);
      setDerbHits(0); setDerbOuts(0); setDerbFeedback(null); setDerbDone(false);
      setDerbAnim(null); setIsSpeaking(false);
      setScreen("derby");
    } else {
      const words = [...week.words].sort(() => Math.random() - 0.5).slice(0, 10);
      setIntroWords(words); setIntroIndex(0); setIsSpeaking(false);
      setScreen("intro");
    }
  };

  const goToQuiz = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSessionPoints(0);
    setQuizWords(introWords); setQuizIndex(0); setUserInput("");
    setQuizResults([]); setQuizDone(false); setQuizTries(0); setQuizFeedback(null);
    setScreen("quiz");
  };

  // ── INTRO ────────────────────────────────────────────────
  const handleSpeakIntro = (wo) => {
    setIsSpeaking(true);
    speakIntroWord(wo, () => setIsSpeaking(true), () => setIsSpeaking(false));
  };

  // ── SPELLING QUIZ ────────────────────────────────────────
  const POSITIVE_MSGS = ["🎉 Yes! You nailed it!", "🔥 That's right! On fire!", "⭐ Awesome work, Christian!", "💪 Boom! Got it!", "🏆 Champion spelling right there!"];
  const CLOSE_MSGS    = ["😅 So close! Almost had it!", "💪 Good try! Check the correct spelling.", "🤔 Not quite — keep trying!", "👀 Almost! Look at the answer."];
  const MISS_MSGS     = ["Keep going, champ! Mistakes help you learn.", "Don't give up! Check the word and remember it.", "It's okay — even the best players miss sometimes!"];
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const handleSpeakWord = (wo) => {
    setIsSpeaking(true);
    speakWord(wo, () => setIsSpeaking(true), () => setIsSpeaking(false));
  };

  const submitQuizAnswer = () => {
    const wo       = quizWords[quizIndex];
    const correct  = userInput.trim().toLowerCase() === wo.word.toLowerCase();
    const newTries = quizTries + 1;
    if (correct) {
      setQuizFeedback({ correct: true, word: wo.word, msg: rand(POSITIVE_MSGS) });
      const nr = [...quizResults, { word: wo.word, correct: true, tries: newTries }];
      setQuizResults(nr); setUserInput(""); setQuizTries(0);
      setTimeout(() => { setQuizFeedback(null); if (quizIndex + 1 >= quizWords.length) finishQuiz(nr); else setQuizIndex(i => i + 1); }, 1800);
    } else if (newTries >= 3) {
      setQuizFeedback({ correct: false, word: wo.word, msg: rand(MISS_MSGS), showAnswer: true });
      const nr = [...quizResults, { word: wo.word, correct: false, tries: newTries }];
      setQuizResults(nr); setUserInput(""); setQuizTries(0);
      setTimeout(() => { setQuizFeedback(null); if (quizIndex + 1 >= quizWords.length) finishQuiz(nr); else setQuizIndex(i => i + 1); }, 2500);
    } else {
      setQuizTries(newTries);
      setQuizFeedback({ correct: false, word: wo.word, msg: newTries === 2 ? rand(CLOSE_MSGS) : "❌ Not quite — try again!", showAnswer: false });
      setUserInput("");
      setTimeout(() => setQuizFeedback(null), 1800);
    }
  };

  const finishQuiz = (results) => {
    const c   = results.filter(r => r.correct).length;
    const pts = c === results.length ? SECTION_POINTS.perfect[activeSection]
              : c >= Math.floor(results.length * 0.7) ? SECTION_POINTS.partial[activeSection]
              : SECTION_POINTS.complete[activeSection];
    markSectionDone(activeSection, pts);
    setQuizDone(true);
  };

  // ── SENTENCE WRITER ──────────────────────────────────────
  const submitSentence = async () => {
    if (!sentInput.trim() || sentGrading) return;
    setSentGrading(true);
    const wo     = sentWords[sentIndex];
    const result = await gradeWithClaude(wo.word, wo.definition, sentInput.trim());
    setSentFeedback({ word: wo.word, sentence: sentInput.trim(), ...result });
    setSentGrading(false);
  };

  const nextSentWord = () => {
    const nr = [...sentResults, sentFeedback];
    setSentResults(nr); setSentInput(""); setSentFeedback(null);
    if (sentIndex + 1 >= sentWords.length) {
      const totalPts = nr.reduce((a, r) => a + (r.spellingCorrect ? 20 : 0) + (r.usageCorrect ? 20 : 0), 0);
      markSectionDone(2, totalPts);
      setSentDone(true);
    } else {
      setSentIndex(i => i + 1);
    }
  };

  // ── HOME RUN DERBY ───────────────────────────────────────
  const MAX_OUTS   = 3;
  const HITS_FOR_HR = 3;

  const submitDerbyAnswer = () => {
    if (!derbInput.trim() || derbFeedback) return;
    const wo      = derbWords[derbIndex % derbWords.length];
    const correct = derbInput.trim().toLowerCase() === wo.word.toLowerCase();
    setDerbInput("");
    if (correct) {
      const newHits = derbHits + 1;
      setDerbHits(newHits);
      setDerbAnim("hit");
      setDerbFeedback({ correct: true, word: wo.word, msg: newHits % HITS_FOR_HR === 0 ? "🏠 HOME RUN!! 💥" : newHits % HITS_FOR_HR === HITS_FOR_HR - 1 ? "🔥 One more for a homer!" : rand(POSITIVE_MSGS) });
      setTimeout(() => { setDerbAnim(null); setDerbFeedback(null); setDerbIndex(i => i + 1); }, 1800);
    } else {
      const newStrikes = derbStrikes + 1;
      if (newStrikes >= 3) {
        const newOuts = derbOuts + 1;
        setDerbOuts(newOuts); setDerbStrikes(0);
        setDerbAnim("out");
        setDerbFeedback({ correct: false, word: wo.word, msg: `⚾ Out! Correct spelling: "${wo.word}"`, showAnswer: true });
        if (newOuts >= MAX_OUTS) {
          const pts = Math.min(Math.floor(derbHits / HITS_FOR_HR) * 50 + derbHits * 10, SECTION_POINTS.perfect[3]);
          setTimeout(() => { markSectionDone(3, pts); setDerbDone(true); setDerbFeedback(null); setDerbAnim(null); }, 2000);
        } else {
          setTimeout(() => { setDerbFeedback(null); setDerbAnim(null); setDerbIndex(i => i + 1); }, 2000);
        }
      } else {
        setDerbStrikes(newStrikes);
        setDerbAnim("strike");
        setDerbFeedback({ correct: false, word: wo.word, msg: newStrikes === 2 ? `⚠️ Strike ${newStrikes}! One more and you're out!` : `Strike ${newStrikes}! Try again!`, showAnswer: false });
        setTimeout(() => { setDerbFeedback(null); setDerbAnim(null); }, 1800);
      }
    }
  };

  // ── BONUS ────────────────────────────────────────────────
  const startBonus = (activity) => {
    setBonusScreen(activity.id); setBonusInput(""); setBonusDone(false); setBonusResults([]); setBonusIdx(0);
    if (activity.id === "bq")      { setBonusWords(CURRICULUM.flatMap(w => w.words).sort(() => Math.random() - 0.5).slice(0, 10)); }
    else if (activity.id === "ss") { setSpeedWords(CURRICULUM.flatMap(w => w.words).sort(() => Math.random() - 0.5)); setSpeedTimer(60); setSpeedCorrect(0); speedCorrectRef.current = 0; setSpeedWordIdx(0); setSpeedInput(""); setSpeedActive(false); }
    else if (activity.id === "sb") { setSentenceWords([...week.words].sort(() => Math.random() - 0.5).slice(0, 5)); setSentences(["", "", ""]); setSentenceDone(false); }
    else if (activity.id === "cw") { setBonusWords([...week.words].sort(() => Math.random() - 0.5).slice(0, 5)); setBonusInput(""); }
    setScreen("bonus");
  };

  const submitBonusAnswer = () => {
    if (bonusScreen !== "bq") return;
    const wo   = bonusWords[bonusIdx];
    const correct = bonusInput.trim().toLowerCase() === wo.word.toLowerCase();
    const nr   = [...bonusResults, { word: wo.word, answer: bonusInput.trim(), correct }];
    setBonusResults(nr); setBonusInput("");
    if (bonusIdx + 1 >= bonusWords.length) { awardPoints(Math.round(250 * (nr.filter(r => r.correct).length / bonusWords.length))); setBonusDone(true); }
    else setBonusIdx(i => i + 1);
  };

  const startSpeedTimer = () => {
    setSpeedActive(true);
    timerRef.current = setInterval(() => {
      setSpeedTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); setSpeedActive(false); setBonusDone(true); awardPoints(Math.min(speedCorrectRef.current * 15, 150)); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const submitSpeedWord = () => {
    if (!speedActive) return;
    const wo = speedWords[speedWordIdx % speedWords.length];
    if (speedInput.trim().toLowerCase() === wo.word.toLowerCase()) setSpeedCorrect(c => { const n = c + 1; speedCorrectRef.current = n; return n; });
    setSpeedWordIdx(i => i + 1); setSpeedInput("");
  };

  // ── STYLES ───────────────────────────────────────────────
  const lvl     = getLevel(state.totalEarned);
  const nextLvl = getNextLevel(state.totalEarned);
  const lvlPct  = getLevelProgress(state.totalEarned);
  const sections     = ["Word Intro & Practice", "Spell & Type Exercises", "Sentence Writing", "Review Game"];
  const sectionIcons = ["📖", "⌨️", "✍️", "🎯"];

  const S = {
    app:       { fontFamily: "var(--font-sans)", padding: "0 0 40px", maxWidth: 680, margin: "0 auto" },
    header:    { background: "#ffffff", borderRadius: "0 0 20px 20px", padding: "20px 20px 16px", marginBottom: 16, borderBottom: "3px solid #FD5A1E" },
    hTitle:    { fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: -0.5, color: "#1a3a5c" },
    hSub:      { fontSize: 13, color: "#64748b", margin: "2px 0 12px" },
    statRow:   { display: "flex", gap: 10, flexWrap: "wrap" },
    statCard:  { background: "rgba(26, 58, 92, 0.07)", borderRadius: 10, padding: "8px 14px", flex: 1, minWidth: 90, textAlign: "center" },
    statNum:   { fontSize: 22, fontWeight: 700, lineHeight: 1, color: "#1a3a5c" },
    statLabel: { fontSize: 11, color: "#64748b", marginTop: 2 },
    card:      { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "14px 16px", marginBottom: 10 },
    secTitle:  { fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },
    btn:       { background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "10px 16px", fontSize: 14, cursor: "pointer", color: "var(--color-text-primary)", width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
    btnP:      { background: "#1a3a5c", color: "#fff", border: "none", borderRadius: 8, padding: "12px 20px", fontSize: 15, fontWeight: 500, cursor: "pointer", width: "100%" },
    btnD:      { background: "#FD5A1E", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 14, cursor: "pointer" },
    input:     { width: "100%", padding: "12px 14px", fontSize: 16, borderRadius: 8, border: "1.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box" },
    pBar:      { height: 8, borderRadius: 4, background: "var(--color-background-secondary)", overflow: "hidden", marginTop: 6 },
    pFill:     (pct, color) => ({ height: "100%", width: `${pct}%`, background: color || "#1a3a5c", borderRadius: 4, transition: "width 0.5s" }),
    badge:     (color) => ({ background: color, color: "#fff", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 500, display: "inline-block" }),
    tag:       { background: "var(--color-background-secondary)", borderRadius: 6, padding: "4px 10px", fontSize: 13, color: "var(--color-text-secondary)", display: "inline-block", margin: "2px 3px" },
    backBtn:   { background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "var(--color-text-primary)", fontSize: 14 },
  };

  // ── SCREENS ──────────────────────────────────────────────

  if (showConfetti) return (
    <div style={{ ...S.app, textAlign: "center", paddingTop: 60 }}>
      <div style={{ fontSize: 72 }}>🎉</div>
      <h2 style={{ color: "var(--color-text-primary)" }}>Amazing, Christian!</h2>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 16 }}>{showPrizeUnlock ? "🔥 3-Day Streak! +700 bonus points! Tell Mommy!" : "Keep crushing it!"}</p>
      <div style={{ fontSize: 48, marginBottom: 20 }}>⚾🎮🤼</div>
      <button style={{ ...S.btnP, maxWidth: 200, margin: "0 auto" }} onClick={() => { setShowConfetti(false); setShowPrizeUnlock(false); setScreen("home"); }}>Awesome!</button>
    </div>
  );

  if (notification?.type === "login") return (
    <div style={{ ...S.app, padding: 20 }}>
      <div style={{ textAlign: "center", paddingTop: 20 }}>
        <div style={{ fontSize: 52 }}>⚾</div>
        <h2 style={{ color: "var(--color-text-primary)" }}>Welcome back, Christian!</h2>
        <div style={{ ...S.card, background: "var(--color-background-success)", border: "none", textAlign: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: "var(--color-text-success)", fontWeight: 500 }}>Daily Login Bonus: +25 pts</div>
        </div>
        <div style={{ ...S.card, fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{notification.msg}</div>
        <button style={{ ...S.btnP, maxWidth: 220, margin: "0 auto" }} onClick={() => setNotification(null)}>Let's Go!</button>
      </div>
    </div>
  );

  // INTRO LESSON
  if (screen === "intro") {
    const wo = introWords[introIndex];
    if (!wo) return null;
    return (
      <div style={{ ...S.app, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button style={S.backBtn} onClick={() => { window.speechSynthesis.cancel(); setScreen("lesson"); }}>← Back</button>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Word {introIndex + 1} of {introWords.length}</span>
          <span style={S.badge("#1a3a5c")}>{Math.round((introIndex / introWords.length) * 100)}%</span>
        </div>
        <div style={S.pBar}><div style={S.pFill((introIndex / introWords.length) * 100)} /></div>
        <div style={{ ...S.card, textAlign: "center", padding: "28px 20px", marginTop: 14 }}>
          <div style={{ fontSize: 38, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: 2, marginBottom: 4 }}>{wo.word}</div>
          <button onClick={() => handleSpeakIntro(wo)} style={{ background: isSpeaking ? "#1a3a5c" : "var(--color-background-secondary)", border: isSpeaking ? "none" : "0.5px solid var(--color-border-secondary)", color: isSpeaking ? "#fff" : "var(--color-text-primary)", borderRadius: 20, padding: "6px 16px", cursor: "pointer", fontSize: 14, marginBottom: 16, display: "inline-flex", alignItems: "center", gap: 6 }}>
            {isSpeaking ? "🔊 Speaking..." : "🔊 Hear this word"}
          </button>
          <div style={{ ...S.card, background: "var(--color-background-secondary)", border: "none", textAlign: "left", marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Definition</div>
            <div style={{ fontSize: 15, color: "var(--color-text-primary)", lineHeight: 1.6 }}>{wo.definition}</div>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", fontWeight: 500, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Example sentences</div>
            {wo.sentences.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                <span style={{ ...S.badge("#FD5A1E"), flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                <span style={{ fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.6 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          {introIndex > 0 && <button style={{ ...S.btnP, background: "#555", flex: 1 }} onClick={() => { window.speechSynthesis.cancel(); setIntroIndex(i => i - 1); setIsSpeaking(false); }}>← Prev</button>}
          {introIndex < introWords.length - 1
            ? <button style={{ ...S.btnP, flex: 1 }} onClick={() => { window.speechSynthesis.cancel(); setIntroIndex(i => i + 1); setIsSpeaking(false); }}>Next →</button>
            : <button style={{ ...S.btnP, background: "#27ae60", flex: 1 }} onClick={goToQuiz}>I'm ready! Start quiz →</button>
          }
        </div>
        {introIndex === introWords.length - 1 && (
          <div style={{ ...S.card, background: "var(--color-background-success)", border: "none", textAlign: "center", marginTop: 8 }}>
            <span style={{ color: "var(--color-text-success)", fontSize: 14 }}>You reviewed all {introWords.length} words! Let's go!</span>
          </div>
        )}
      </div>
    );
  }

  // SPELLING QUIZ
  if (screen === "quiz") {
    if (quizDone) {
      const correct = quizResults.filter(r => r.correct).length;
      return (
        <div style={{ ...S.app, padding: 20 }}>
          <h2 style={{ color: "var(--color-text-primary)", textAlign: "center" }}>Section Complete! 🎯</h2>
          <div style={{ ...S.card, background: "var(--color-background-success)", border: "none", textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-text-success)" }}>+{sessionPoints} points earned!</div>
            <div style={{ fontSize: 14, color: "var(--color-text-success)", marginTop: 4 }}>{correct}/{quizWords.length} correct · {Math.round((correct / quizWords.length) * 100)}%</div>
          </div>
          {quizResults.map((r, i) => (
            <div key={i} style={{ ...S.card, display: "flex", justifyContent: "space-between", padding: "10px 14px" }}>
              <span style={{ fontWeight: 500 }}>{r.word}</span>
              <span style={{ color: r.correct ? "#27ae60" : "#FD5A1E", fontSize: 13 }}>{r.correct ? `✓ ${r.tries} ${r.tries === 1 ? "try" : "tries"}` : "✗ missed"}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button style={{ ...S.btnP, background: "#555" }} onClick={() => setScreen("lesson")}>Back to Lesson</button>
            <button style={S.btnP} onClick={() => setScreen("home")}>Home</button>
          </div>
        </div>
      );
    }
    const wo       = quizWords[quizIndex];
    const triesLeft = 3 - quizTries;
    const fbBg     = quizFeedback?.correct ? "#27ae60" : quizFeedback?.showAnswer ? "#FD5A1E" : "#FD5A1E";
    return (
      <div style={{ ...S.app, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button style={S.backBtn} onClick={() => { window.speechSynthesis.cancel(); setScreen("lesson"); }}>← Back</button>
          <span style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>{sections[activeSection]}</span>
          <span style={S.badge("#1a3a5c")}>{quizIndex + 1}/{quizWords.length}</span>
        </div>
        {quizFeedback && (
          <div style={{ background: fbBg, borderRadius: 10, padding: "12px 16px", marginBottom: 14, textAlign: "center", color: "#fff" }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{quizFeedback.msg}</div>
            {quizFeedback.showAnswer && <div style={{ marginTop: 6, fontSize: 14 }}>Correct spelling: <strong>{quizFeedback.word}</strong></div>}
          </div>
        )}
        <div style={{ ...S.card, textAlign: "center", padding: "24px 20px", marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8 }}>Spell this word:</p>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 4 }}>{"_ ".repeat(wo?.word.length).trim()}</div>
          <button onClick={() => handleSpeakWord(wo)} style={{ fontSize: 40, background: "none", border: "none", cursor: "pointer", marginTop: 8 }}>{isSpeaking ? "🔈" : "🔊"}</button>
          <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", marginTop: 4 }}>Tap to hear word + sentence</p>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 8 }}>
            {[1,2,3].map(n => <div key={n} style={{ width: 12, height: 12, borderRadius: "50%", background: n <= triesLeft ? "#1a3a5c" : "var(--color-background-secondary)", border: "1.5px solid var(--color-border-secondary)" }} />)}
            <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginLeft: 4 }}>{triesLeft} {triesLeft === 1 ? "try" : "tries"} left</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: "var(--color-text-secondary)" }}>Points so far: <strong>{sessionPoints}</strong></div>
        </div>
        <input style={S.input} placeholder="Type your spelling here..." value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === "Enter" && userInput.trim() && !quizFeedback && submitQuizAnswer()} autoFocus disabled={!!quizFeedback} />
        <button style={{ ...S.btnP, marginTop: 12, opacity: (!userInput.trim() || !!quizFeedback) ? 0.5 : 1 }} onClick={submitQuizAnswer} disabled={!userInput.trim() || !!quizFeedback}>Submit Answer</button>
      </div>
    );
  }

  // SENTENCE WRITER
  if (screen === "sentenceWriter") {
    if (sentDone) {
      const totalPts = sentResults.reduce((a, r) => a + (r.spellingCorrect ? 20 : 0) + (r.usageCorrect ? 20 : 0), 0);
      return (
        <div style={{ ...S.app, padding: 20 }}>
          <h2 style={{ color: "var(--color-text-primary)", textAlign: "center" }}>Writing Complete! ✍️</h2>
          <div style={{ ...S.card, background: "var(--color-background-success)", border: "none", textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-text-success)" }}>+{totalPts} points earned!</div>
          </div>
          {sentResults.map((r, i) => (
            <div key={i} style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontWeight: 500, fontSize: 15 }}>{r.word}</span>
                <span style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>+{(r.spellingCorrect ? 20 : 0) + (r.usageCorrect ? 20 : 0)} pts</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)", fontStyle: "italic", marginBottom: 6 }}>"{r.sentence}"</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={S.badge(r.spellingCorrect ? "#27ae60" : "#FD5A1E")}>{r.spellingCorrect ? "✓ Spelling" : "✗ Spelling"}</span>
                <span style={S.badge(r.usageCorrect   ? "#27ae60" : "#FD5A1E")}>{r.usageCorrect   ? "✓ Usage"    : "✗ Usage"}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 8 }}>{r.feedback}</div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button style={{ ...S.btnP, background: "#555" }} onClick={() => setScreen("lesson")}>Back to Lesson</button>
            <button style={S.btnP} onClick={() => setScreen("home")}>Home</button>
          </div>
        </div>
      );
    }
    const wo = sentWords[sentIndex];
    return (
      <div style={{ ...S.app, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button style={S.backBtn} onClick={() => { window.speechSynthesis.cancel(); setScreen("lesson"); }}>← Back</button>
          <span style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Sentence Writing</span>
          <span style={S.badge("#1a3a5c")}>{sentIndex + 1}/{sentWords.length}</span>
        </div>
        {sentFeedback ? (
          <div>
            <div style={{ ...S.card, borderLeft: `4px solid ${sentFeedback.spellingCorrect && sentFeedback.usageCorrect ? "#27ae60" : sentFeedback.spellingCorrect || sentFeedback.usageCorrect ? "#FD5A1E" : "#FD5A1E"}`, borderRadius: "0 12px 12px 0" }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Your sentence:</div>
              <div style={{ fontSize: 14, fontStyle: "italic", color: "var(--color-text-secondary)", marginBottom: 12 }}>"{sentFeedback.sentence}"</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                <div style={{ ...S.card, background: sentFeedback.spellingCorrect ? "var(--color-background-success)" : "var(--color-background-danger)", border: "none", padding: "10px 14px", flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 20 }}>{sentFeedback.spellingCorrect ? "✅" : "❌"}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: sentFeedback.spellingCorrect ? "var(--color-text-success)" : "var(--color-text-danger)" }}>Spelling of "{wo.word}"</div>
                  <div style={{ fontSize: 12, color: sentFeedback.spellingCorrect ? "var(--color-text-success)" : "var(--color-text-danger)" }}>{sentFeedback.spellingCorrect ? "+20 pts" : "0 pts"}</div>
                </div>
                <div style={{ ...S.card, background: sentFeedback.usageCorrect ? "var(--color-background-success)" : "var(--color-background-danger)", border: "none", padding: "10px 14px", flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 20 }}>{sentFeedback.usageCorrect ? "✅" : "❌"}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: sentFeedback.usageCorrect ? "var(--color-text-success)" : "var(--color-text-danger)" }}>Using it correctly</div>
                  <div style={{ fontSize: 12, color: sentFeedback.usageCorrect ? "var(--color-text-success)" : "var(--color-text-danger)" }}>{sentFeedback.usageCorrect ? "+20 pts" : "0 pts"}</div>
                </div>
              </div>
              <div style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>💬 {sentFeedback.feedback}</div>
              <button style={S.btnP} onClick={nextSentWord}>{sentIndex + 1 < sentWords.length ? "Next word →" : "See results! →"}</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ ...S.card, textAlign: "center", padding: "28px 20px", marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8 }}>Write a sentence using this word:</p>
              <div style={{ fontSize: 36, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: 2, marginBottom: 8 }}>{wo.word}</div>
              <button onClick={() => handleSpeakWord(wo)} style={{ fontSize: 36, background: "none", border: "none", cursor: "pointer" }}>{isSpeaking ? "🔈" : "🔊"}</button>
              <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 4 }}>Tap to hear the word, then write your sentence below</p>
              <div style={{ ...S.card, background: "var(--color-background-info)", border: "none", textAlign: "left", marginTop: 8 }}>
                <div style={{ fontSize: 13, color: "var(--color-text-info)" }}>+20 pts for spelling it right · +20 pts for using it correctly</div>
              </div>
            </div>
            <textarea style={{ ...S.input, height: 100, resize: "vertical" }} placeholder={`Write a full sentence using the word "${wo.word}"...`} value={sentInput} onChange={e => setSentInput(e.target.value)} autoFocus disabled={sentGrading} />
            <button style={{ ...S.btnP, marginTop: 12, opacity: (!sentInput.trim() || sentGrading) ? 0.6 : 1 }} onClick={submitSentence} disabled={!sentInput.trim() || sentGrading}>
              {sentGrading ? "Grading your sentence... ✨" : "Submit Sentence"}
            </button>
          </>
        )}
      </div>
    );
  }

  // HOME RUN DERBY
  if (screen === "derby") {
    const homeRuns    = Math.floor(derbHits / HITS_FOR_HR);
    const hitsInInning = derbHits % HITS_FOR_HR;
    const wo          = derbWords[derbIndex % derbWords.length];
    if (derbDone) return (
      <div style={{ ...S.app, padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 52 }}>🏟️</div>
        <h2 style={{ color: "var(--color-text-primary)" }}>Derby Done!</h2>
        <div style={{ ...S.card, background: "var(--color-background-success)", border: "none", marginBottom: 14 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-text-success)" }}>+{sessionPoints} points!</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[["🏠", `${homeRuns}`, "Home Runs"], ["⚾", `${derbHits}`, "Total Hits"], ["💀", `${derbOuts}`, "Outs"]].map(([ico, val, lbl]) => (
            <div key={lbl} style={{ ...S.card, textAlign: "center" }}>
              <div style={{ fontSize: 28 }}>{ico}</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{val}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{lbl}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...S.btnP, background: "#555" }} onClick={() => setScreen("lesson")}>Back to Lesson</button>
          <button style={S.btnP} onClick={() => setScreen("home")}>Home</button>
        </div>
      </div>
    );
    return (
      <div style={{ ...S.app, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button style={S.backBtn} onClick={() => setScreen("lesson")}>← Back</button>
          <span style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)" }}>⚾ Home Run Derby</span>
          <span style={S.badge("#1a3a5c")}>{sessionPoints} pts</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[["🏠", homeRuns, "Home Runs"], ["⚾", derbHits, "Total Hits"], ["💀", `${derbOuts}/${MAX_OUTS}`, "Outs"]].map(([ico, val, lbl]) => (
            <div key={lbl} style={{ ...S.card, textAlign: "center", padding: "10px 8px" }}>
              <div style={{ fontSize: 22 }}>{ico}</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{val}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{lbl}</div>
            </div>
          ))}
        </div>
        <div style={{ ...S.card, marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>Outs left:</div>
          <div style={{ display: "flex", gap: 6 }}>{Array.from({ length: MAX_OUTS }).map((_, i) => <span key={i} style={{ fontSize: 22 }}>{i < derbOuts ? "💀" : "⭕"}</span>)}</div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 8, marginBottom: 4 }}>Strikes this at-bat:</div>
          <div style={{ display: "flex", gap: 6 }}>{[0,1,2].map(i => <span key={i} style={{ fontSize: 20 }}>{i < derbStrikes ? "❌" : "◯"}</span>)}</div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 8 }}>
            Hit progress to home run: {hitsInInning}/{HITS_FOR_HR}
            <div style={S.pBar}><div style={S.pFill((hitsInInning / HITS_FOR_HR) * 100, "#FD5A1E")} /></div>
          </div>
        </div>
        {derbFeedback && (
          <div style={{ background: derbFeedback.correct ? "#27ae60" : derbAnim === "out" ? "#FD5A1E" : "#FD5A1E", borderRadius: 10, padding: "14px 16px", marginBottom: 12, textAlign: "center", color: "#fff" }}>
            <div style={{ fontWeight: 700, fontSize: derbFeedback.msg.includes("HOME RUN") ? 22 : 16 }}>{derbFeedback.msg}</div>
            {derbFeedback.showAnswer && <div style={{ marginTop: 6, fontSize: 14 }}>Correct: <strong>{derbFeedback.word}</strong></div>}
          </div>
        )}
        <div style={{ ...S.card, textAlign: "center", padding: "20px" }}>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8 }}>Spell this word to swing the bat:</p>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 3 }}>{"_ ".repeat(wo?.word.length).trim()}</div>
          <button onClick={() => handleSpeakWord(wo)} style={{ fontSize: 36, background: "none", border: "none", cursor: "pointer", marginTop: 6 }}>{isSpeaking ? "🔈" : "🔊"}</button>
          <p style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>3 hits in a row = ⚾ HOME RUN!</p>
        </div>
        <input style={S.input} placeholder="Spell it to swing!" value={derbInput} onChange={e => setDerbInput(e.target.value)} onKeyDown={e => e.key === "Enter" && derbInput.trim() && !derbFeedback && submitDerbyAnswer()} autoFocus disabled={!!derbFeedback} />
        <button style={{ ...S.btnP, marginTop: 12, opacity: (!derbInput.trim() || !!derbFeedback) ? 0.5 : 1 }} onClick={submitDerbyAnswer} disabled={!derbInput.trim() || !!derbFeedback}>⚾ Swing!</button>
      </div>
    );
  }

  // BONUS
  if (screen === "bonus") {
    if (bonusScreen === "bq") {
      if (bonusDone) return (
        <div style={{ ...S.app, padding: 20 }}>
          <h2 style={{ color: "var(--color-text-primary)", textAlign: "center" }}>Bonus Quiz Done! ⚡</h2>
          <div style={{ textAlign: "center", marginBottom: 16 }}><span style={S.badge("#FD5A1E")}>{bonusResults.filter(r => r.correct).length}/{bonusWords.length} correct</span></div>
          {bonusResults.map((r, i) => (
            <div key={i} style={{ ...S.card, display: "flex", justifyContent: "space-between", padding: "10px 14px" }}>
              <span style={{ fontWeight: 500 }}>{r.word}</span>
              <span style={{ color: r.correct ? "#27ae60" : "#FD5A1E", fontSize: 13 }}>{r.correct ? "✓" : `✗ "${r.answer}"`}</span>
            </div>
          ))}
          <button style={{ ...S.btnP, marginTop: 8 }} onClick={() => setScreen("extraCredit")}>Back</button>
        </div>
      );
      const bwo = bonusWords[bonusIdx];
      return (
        <div style={{ ...S.app, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <button style={S.backBtn} onClick={() => setScreen("extraCredit")}>← Back</button>
            <span style={S.badge("#FD5A1E")}>{bonusIdx + 1}/{bonusWords.length}</span>
          </div>
          <div style={{ ...S.card, textAlign: "center", padding: "24px 20px", marginBottom: 16 }}>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>Spell this word:</p>
            <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: 3 }}>{"_".repeat(bwo?.word.length)}</div>
            <button onClick={() => handleSpeakWord(bwo)} style={{ fontSize: 36, background: "none", border: "none", cursor: "pointer", marginTop: 8 }}>🔊</button>
          </div>
          <input style={S.input} placeholder="Spell it..." value={bonusInput} onChange={e => setBonusInput(e.target.value)} onKeyDown={e => e.key === "Enter" && bonusInput.trim() && submitBonusAnswer()} autoFocus />
          <button style={{ ...S.btnP, marginTop: 12 }} onClick={submitBonusAnswer} disabled={!bonusInput.trim()}>Submit</button>
        </div>
      );
    }
    if (bonusScreen === "ss") {
      if (bonusDone) return (
        <div style={{ ...S.app, padding: 20, textAlign: "center" }}>
          <h2 style={{ color: "var(--color-text-primary)" }}>Speed Round Done! ⏱️</h2>
          <p style={{ fontSize: 20, fontWeight: 600 }}>{speedCorrect} words correct!</p>
          <button style={{ ...S.btnP, maxWidth: 200, margin: "0 auto", marginTop: 12 }} onClick={() => setScreen("extraCredit")}>Back</button>
        </div>
      );
      return (
        <div style={{ ...S.app, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={S.badge("#e74c3c")}>⏱️ {speedTimer}s</span>
            <span style={S.badge("#27ae60")}>✓ {speedCorrect}</span>
          </div>
          {!speedActive ? (
            <div style={{ textAlign: "center", paddingTop: 20 }}>
              <h3 style={{ color: "var(--color-text-primary)" }}>Speed Spelling Round!</h3>
              <p style={{ color: "var(--color-text-secondary)" }}>Spell as many words as you can in 60 seconds!</p>
              <button style={{ ...S.btnP, maxWidth: 200, margin: "0 auto" }} onClick={startSpeedTimer}>Start!</button>
            </div>
          ) : (
            <>
              <div style={{ ...S.card, textAlign: "center", padding: "24px", marginBottom: 16 }}>
                <div style={{ fontSize: 32, fontWeight: 700 }}>{"_".repeat(speedWords[speedWordIdx % speedWords.length]?.word.length)}</div>
                <button onClick={() => handleSpeakWord(speedWords[speedWordIdx % speedWords.length])} style={{ fontSize: 36, background: "none", border: "none", cursor: "pointer", marginTop: 8 }}>🔊</button>
              </div>
              <input style={S.input} placeholder="Spell it fast!" value={speedInput} onChange={e => setSpeedInput(e.target.value)} onKeyDown={e => e.key === "Enter" && submitSpeedWord()} autoFocus />
              <button style={{ ...S.btnP, marginTop: 12 }} onClick={submitSpeedWord}>Next</button>
            </>
          )}
        </div>
      );
    }
    if (bonusScreen === "sb") {
      if (sentenceDone) return (
        <div style={{ ...S.app, padding: 20, textAlign: "center" }}>
          <h2 style={{ color: "var(--color-text-primary)" }}>Sentences done! 🏗️</h2>
          <button style={{ ...S.btnP, maxWidth: 200, margin: "12px auto 0" }} onClick={() => setScreen("extraCredit")}>Back</button>
        </div>
      );
      return (
        <div style={{ ...S.app, padding: 20 }}>
          <button style={{ ...S.backBtn, marginBottom: 12 }} onClick={() => setScreen("extraCredit")}>← Back</button>
          <h3 style={{ color: "var(--color-text-primary)" }}>Sentence Builder 🏗️</h3>
          <div style={{ marginBottom: 16 }}>{sentenceWords.map(w => <span key={w.word} style={S.tag}>{w.word}</span>)}</div>
          {sentences.map((s, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Sentence {i + 1}:</label>
              <input style={S.input} placeholder={`Write sentence ${i + 1}...`} value={s} onChange={e => setSentences(prev => { const n = [...prev]; n[i] = e.target.value; return n; })} />
            </div>
          ))}
          <button style={{ ...S.btnP, marginTop: 8 }} onClick={() => { awardPoints(Math.round((sentences.filter(s => s.trim().length > 5).length / 3) * 150)); setSentenceDone(true); }}>Submit</button>
        </div>
      );
    }
    if (bonusScreen === "cw") {
      if (bonusDone) return (
        <div style={{ ...S.app, padding: 20, textAlign: "center" }}>
          <h2 style={{ color: "var(--color-text-primary)" }}>Story done! ✍️</h2>
          <button style={{ ...S.btnP, maxWidth: 200, margin: "12px auto 0" }} onClick={() => setScreen("extraCredit")}>Back</button>
        </div>
      );
      return (
        <div style={{ ...S.app, padding: 20 }}>
          <button style={{ ...S.backBtn, marginBottom: 12 }} onClick={() => setScreen("extraCredit")}>← Back</button>
          <h3 style={{ color: "var(--color-text-primary)" }}>Creative Writing ✍️</h3>
          <div style={{ marginBottom: 14 }}>{bonusWords.map(w => <span key={w.word} style={S.tag}>{w.word}</span>)}</div>
          <textarea style={{ ...S.input, height: 160, resize: "vertical" }} placeholder="Once upon a time..." value={bonusInput} onChange={e => setBonusInput(e.target.value)} />
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 4 }}>{bonusInput.trim().split(/\s+/).filter(Boolean).length} words</div>
          <button style={{ ...S.btnP, marginTop: 12 }} onClick={() => { awardPoints(bonusInput.trim().split(/\s+/).length >= 50 ? 200 : bonusInput.trim().split(/\s+/).length >= 25 ? 130 : 80); setBonusDone(true); }} disabled={bonusInput.trim().length < 10}>Submit Story</button>
        </div>
      );
    }
  }

  // LESSON
  if (screen === "lesson") return (
    <div style={S.app}>
      <div style={{ ...S.header, borderRadius: 0, marginBottom: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={S.hTitle}>Week {state.currentWeek}: {week.title}</div><div style={S.hSub}>{week.focus}</div></div>
          <button style={{ background: "rgba(26,58,92,0.1)", border: "none", color: "#1a3a5c", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }} onClick={() => setScreen("home")}>← Home</button>
        </div>
      </div>
      <div style={{ padding: "16px 12px 0" }}>
        <div style={S.secTitle}>Today's Word List</div>
        <div style={{ ...S.card, marginBottom: 14 }}>
          <div style={{ display: "flex", flexWrap: "wrap" }}>{week.words.map(w => <span key={w.word} style={S.tag}>{w.word}</span>)}</div>
        </div>
        <div style={S.secTitle}>Daily Sections — complete all 4 for full points</div>
        {sections.map((sec, i) => {
          const done = (state.todaySectionsCompleted || []).includes(i);
          return (
            <button key={i} style={{ ...S.btn, opacity: (alreadyDoneToday || done) ? 0.6 : 1, justifyContent: "space-between" }} onClick={() => !(alreadyDoneToday || done) && startIntro(i)} disabled={alreadyDoneToday || done}>
              <span>{sectionIcons[i]} {sec}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{SECTION_POINTS.perfect[i]} pts max</span>
                {done && <span style={S.badge("#27ae60")}>✓ done</span>}
              </span>
            </button>
          );
        })}
        {alreadyDoneToday && <div style={{ ...S.card, background: "var(--color-background-success)", textAlign: "center", border: "none" }}><span style={{ color: "var(--color-text-success)", fontWeight: 500 }}>Day complete! Come back tomorrow! 🌟</span></div>}
      </div>
    </div>
  );

  // PRIZES
  if (screen === "prizes") return (
    <div style={S.app}>
      <div style={{ ...S.header, borderRadius: 0, marginBottom: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={S.hTitle}>🏆 Prize Store</div><div style={S.hSub}>{state.points.toLocaleString()} pts available</div></div>
          <button style={{ background: "rgba(26,58,92,0.1)", border: "none", color: "#1a3a5c", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }} onClick={() => setScreen("home")}>← Home</button>
        </div>
      </div>
      <div style={{ padding: "16px 12px 0" }}>
        {PRIZES.map(p => {
          const can = state.points >= p.points;
          return (
            <div key={p.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 12, opacity: can ? 1 : 0.6 }}>
              <div style={{ fontSize: 32 }}>{p.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{p.points.toLocaleString()} pts</div>
                <div style={S.pBar}><div style={S.pFill(Math.min((state.points / p.points) * 100, 100), can ? "#27ae60" : "#1a3a5c")} /></div>
              </div>
              {can && <button style={S.btnD} onClick={() => setRedeemConfirm(p)}>Redeem!</button>}
            </div>
          );
        })}
        {state.redeemedPrizes.length > 0 && (
          <>
            <div style={{ ...S.secTitle, marginTop: 16 }}>Redeemed</div>
            {state.redeemedPrizes.map((p, i) => (
              <div key={i} style={{ ...S.card, display: "flex", justifyContent: "space-between", padding: "10px 14px" }}>
                <span>{p.icon} {p.name}</span>
                <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{p.date}</span>
              </div>
            ))}
          </>
        )}
      </div>
      {redeemConfirm && (
        <div style={{ minHeight: 400, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16, borderRadius: 16 }}>
          <div style={{ ...S.card, maxWidth: 320, textAlign: "center" }}>
            <div style={{ fontSize: 48 }}>{redeemConfirm.icon}</div>
            <h3 style={{ color: "var(--color-text-primary)" }}>Redeem this prize?</h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>{redeemConfirm.name}</p>
            <p style={{ fontWeight: 500 }}>Cost: {redeemConfirm.points.toLocaleString()} pts</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Show Mom this screen to claim!</p>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button style={{ ...S.btnP, background: "#555" }} onClick={() => setRedeemConfirm(null)}>Cancel</button>
              <button style={S.btnP} onClick={() => { setState(s => ({ ...s, points: s.points - redeemConfirm.points, redeemedPrizes: [...s.redeemedPrizes, { ...redeemConfirm, date: new Date().toLocaleDateString() }] })); setRedeemConfirm(null); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 4000); }}>Yes, Redeem!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // EXTRA CREDIT
  if (screen === "extraCredit") return (
    <div style={S.app}>
      <div style={{ ...S.header, borderRadius: 0, marginBottom: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={S.hTitle}>⚡ Extra Credit</div><div style={S.hSub}>Earn bonus points anytime!</div></div>
          <button style={{ background: "rgba(26,58,92,0.1)", border: "none", color: "#1a3a5c", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }} onClick={() => setScreen("home")}>← Home</button>
        </div>
      </div>
      <div style={{ padding: "16px 12px 0" }}>
        {BONUS_ACTIVITIES.map(a => (
          <button key={a.id} style={{ ...S.btn, flexDirection: "column", alignItems: "flex-start", gap: 4 }} onClick={() => startBonus(a)}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <span style={{ fontWeight: 500 }}>{a.icon} {a.name}</span>
              <span style={S.badge("#FD5A1E")}>up to {a.maxPts} pts</span>
            </div>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{a.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // PROGRESS
  if (screen === "progress") {
    const bases = ["1st Base\nWeek 1", "2nd Base\nWeek 2", "3rd Base\nWeek 3", "Home Run!\nWeek 4"];
    return (
      <div style={S.app}>
        <div style={{ ...S.header, borderRadius: 0, marginBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={S.hTitle}>📊 My Progress</div><div style={S.hSub}>{state.completedDays.length} of 28 days done</div></div>
            <button style={{ background: "rgba(26,58,92,0.1)", border: "none", color: "#1a3a5c", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }} onClick={() => setScreen("home")}>← Home</button>
          </div>
        </div>
        <div style={{ padding: "16px 12px 0" }}>
          <div style={S.card}>
            <div style={S.secTitle}>Baseball Diamond Progress</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              {bases.map((b, i) => (
                <div key={i} style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 28 }}>{state.currentWeek > i + 1 ? "✅" : state.currentWeek === i + 1 ? "⚾" : "⬜"}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", whiteSpace: "pre-line", lineHeight: 1.3 }}>{b}</div>
                </div>
              ))}
            </div>
            <div style={S.pBar}><div style={S.pFill((state.completedDays.length / 28) * 100)} /></div>
            <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 4 }}>{Math.round((state.completedDays.length / 28) * 100)}% complete</div>
          </div>
          <div style={S.card}>
            <div style={S.secTitle}>Level Progress</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontWeight: 500, fontSize: 16 }}>{lvl.name}</span>
              {nextLvl && <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>→ {nextLvl.name}</span>}
            </div>
            <div style={S.pBar}><div style={S.pFill(lvlPct, "#FD5A1E")} /></div>
            <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 4 }}>{lvlPct}% to next level</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["🔥 Streak", state.streak + " days"], ["⭐ Total Pts Earned", state.totalEarned.toLocaleString()], ["🏆 Prizes Redeemed", state.redeemedPrizes.length], ["📅 Days Completed", state.completedDays.length]].map(([l, v]) => (
              <div key={l} style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{v}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ ...S.card, marginTop: 10 }}>
            <div style={S.secTitle}>Curriculum</div>
            {CURRICULUM.map((w, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 3 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                <div style={{ fontSize: 22 }}>{state.currentWeek > i + 1 ? "✅" : state.currentWeek === i + 1 ? "⚾" : "⬜"}</div>
                <div><div style={{ fontWeight: 500, fontSize: 14 }}>Week {w.week}: {w.title}</div><div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{w.focus}</div></div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button style={{ ...S.btn, background: "var(--color-background-danger)", color: "var(--color-text-danger)", border: "0.5px solid var(--color-border-danger)", justifyContent: "center", fontSize: 12, width: "auto", display: "inline-flex" }}
              onClick={() => { if (window.confirm("Reset all progress?")) { setState(defaultState); localStorage.removeItem("css_state_v2"); } }}>Reset Progress</button>
          </div>
        </div>
      </div>
    );
  }

  // HOME
  return (
    <div style={S.app}>
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 52, lineHeight: 1 }}>⚾</div>
          <div>
            <div style={S.hTitle}>Christian's Summer School</div>
            <div style={S.hSub}>Baseball · Roblox · WWE</div>
          </div>
        </div>
        <div style={S.statRow}>
          <div style={S.statCard}><div style={S.statNum}>{state.points.toLocaleString()}</div><div style={S.statLabel}>🎟️ Points</div></div>
          <div style={S.statCard}><div style={S.statNum}>{state.streak}</div><div style={S.statLabel}>🔥 Streak</div></div>
          <div style={S.statCard}><div style={S.statNum}>{lvl.name}</div><div style={S.statLabel}>⭐ Level</div></div>
          <div style={S.statCard}><div style={S.statNum}>{state.completedDays.length}</div><div style={S.statLabel}>📅 Days Done</div></div>
        </div>
        <div style={S.pBar}><div style={S.pFill(lvlPct, "#FD5A1E")} /></div>
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{lvl.name} → {nextLvl?.name || "Legend"} · {lvlPct}%</div>
      </div>
      <div style={{ padding: "0 12px" }}>
        {state.streak > 0 && state.streak % 3 !== 0 && (
          <div style={{ ...S.card, background: "var(--color-background-warning)", border: "none", textAlign: "center", marginBottom: 12 }}>
            <span style={{ color: "var(--color-text-warning)", fontSize: 14, fontWeight: 500 }}>🔥 {3 - (state.streak % 3)} more day{3 - (state.streak % 3) !== 1 ? "s" : ""} until +700 streak bonus!</span>
          </div>
        )}
        <div style={S.secTitle}>Today's Lesson</div>
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 16 }}>Week {state.currentWeek}: {week.title}</div>
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{week.focus}</div>
            </div>
            {alreadyDoneToday ? <span style={S.badge("#27ae60")}>Done today!</span> : <span style={S.badge("#1a3a5c")}>{4 - (state.todaySectionsCompleted?.length || 0)} sections left</span>}
          </div>
          {!alreadyDoneToday && <>
            <div style={S.pBar}><div style={S.pFill(((state.todaySectionsCompleted?.length || 0) / 4) * 100)} /></div>
            <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 4 }}>{state.todaySectionsCompleted?.length || 0}/4 sections complete today</div>
          </>}
          <button style={{ ...S.btnP, marginTop: 12 }} onClick={() => setScreen("lesson")}>{alreadyDoneToday ? "Review Today's Lesson" : "Start Today's Lesson →"}</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <button style={{ ...S.card, cursor: "pointer", textAlign: "center", border: "0.5px solid var(--color-border-secondary)" }} onClick={() => setScreen("prizes")}>
            <div style={{ fontSize: 28 }}>🏆</div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>Prize Store</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{state.points.toLocaleString()} pts</div>
          </button>
          <button style={{ ...S.card, cursor: "pointer", textAlign: "center", border: "0.5px solid var(--color-border-secondary)" }} onClick={() => setScreen("extraCredit")}>
            <div style={{ fontSize: 28 }}>⚡</div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>Extra Credit</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Earn bonus points</div>
          </button>
        </div>
        <button style={{ ...S.btn, justifyContent: "center" }} onClick={() => setScreen("progress")}>📊 View My Progress</button>
        <div style={S.secTitle}>Next prizes I can earn</div>
        {PRIZES.filter(p => p.points > state.points).slice(0, 2).map(p => (
          <div key={p.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 28 }}>{p.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Need {(p.points - state.points).toLocaleString()} more pts</div>
              <div style={S.pBar}><div style={S.pFill(Math.min((state.points / p.points) * 100, 100))} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
