/* app.jsx — state machine, tweaks, mount */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "homeVariant": "collage",
  "accent": "#FF5C8A",
  "heartCursor": true,
  "stickers": "low",
  "savage": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useState("home");
  const [stage, setStage] = useState("firstdate");
  const [score, setScore] = useState(0);
  const [breakdown, setBreakdown] = useState(null);
  const [reading, setReading] = useState(null);

  useEffect(() => { document.documentElement.style.setProperty("--accent", t.accent); }, [t.accent]);
  useEffect(() => { window.scrollTo(0, 0); }, [screen]);
  useEffect(() => {
    window.__set = (p) => {
      if (p.variant) setTweak("homeVariant", p.variant);
      if (p.stage) setStage(p.stage);
      if (p.score != null) setScore(p.score);
      if (p.screen) setScreen(p.screen);
    };
  }, []);

  const goStage = (id) => { setStage(id); setScreen("quiz"); };
  const startQuiz = (id) => { setStage(id); setScreen("quiz"); };
  // Quiz done → build a stable reading, then gate (login + who) before the verdict.
  const finish = (s, st, bd) => {
    setScore(s); setStage(st); setBreakdown(bd || null);
    const r = window.pickResult ? window.pickResult(s) : { verdict: "", emoji: "" };
    const stObj = STAGES.find((x) => x.id === st) || STAGES[0];
    setReading({ id: window.LQ.uid(), t: Date.now(), stage: st, stageLabel: stObj.label, score: s, verdict: r.verdict, emoji: r.emoji, who: "" });
    setScreen("gate");
  };

  const Home = t.homeVariant === "gallery" ? HomeA : HomeB;

  return (
    <div className="app-root">
      <HeartCursor enabled={t.heartCursor} />
      <StickerLayer density={t.stickers} paintings={PAINT} />
      <ProfilePill />

      {screen === "home" && <Home onBegin={() => setScreen("picker")} goStage={goStage} />}
      {screen === "picker" && <Picker onPick={startQuiz} onBack={() => setScreen("home")} />}
      {screen === "quiz" && <Quiz stage={stage} onDone={finish} onBack={() => setScreen("picker")} />}
      {screen === "gate" && <Gate reading={reading} onReveal={() => setScreen("result")} onBack={() => setScreen("quiz")} />}
      {screen === "result" && <Result score={score} stage={stage} breakdown={breakdown} reading={reading} onRetake={() => setScreen("picker")} onHome={() => setScreen("home")} />}

      {screen === "home" && (
        <div className="variant-switch">
          <span className="vs-label script">try a look:</span>
          {[["collage", "Collage"], ["gallery", "Gallery"]].map(([v, l]) => (
            <button key={v} className={"vs-btn" + (t.homeVariant === v ? " on" : "")} onClick={() => setTweak("homeVariant", v)}>{l}</button>
          ))}
        </div>
      )}

      <TweaksPanel>
        <TweakSection label="Home screen" />
        <TweakRadio label="Direction" value={t.homeVariant} options={["collage", "gallery"]} onChange={(v) => setTweak("homeVariant", v)} />
        <TweakSection label="Flirty details" />
        <TweakColor label="Accent" value={t.accent} options={["#FF5C8A", "#FF8A3D", "#E8C46B", "#C9184A", "#7A5AE0"]} onChange={(v) => setTweak("accent", v)} />
        <TweakToggle label="Heart cursor + sparkles" value={t.heartCursor} onChange={(v) => setTweak("heartCursor", v)} />
        <TweakSelect label="Sticker density" value={t.stickers} options={["off", "low", "med", "high"]} onChange={(v) => setTweak("stickers", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
