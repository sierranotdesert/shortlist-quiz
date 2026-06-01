/* app.jsx — state machine, tweaks, mount */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "homeVariant": "gallery",
  "accent": "#FF5C8A",
  "heartCursor": true,
  "stickers": "med",
  "savage": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useState("home");
  const [stage, setStage] = useState("firstdate");
  const [score, setScore] = useState(0);
  const [breakdown, setBreakdown] = useState(null);

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
  const finish = (s, st, bd) => { setScore(s); setStage(st); setBreakdown(bd || null); setScreen("result"); };

  const Home = { gallery: HomeA, collage: HomeB, dossier: HomeC }[t.homeVariant] || HomeA;

  return (
    <div className="app-root">
      <HeartCursor enabled={t.heartCursor} />
      <StickerLayer density={t.stickers} paintings={PAINT} />
      <ProfilePill />

      {screen === "home" && <Home onBegin={() => setScreen("picker")} goStage={goStage} />}
      {screen === "picker" && <Picker onPick={startQuiz} onBack={() => setScreen("home")} />}
      {screen === "quiz" && <Quiz stage={stage} onDone={finish} onBack={() => setScreen("picker")} />}
      {screen === "result" && <Result score={score} stage={stage} breakdown={breakdown} onRetake={() => setScreen("picker")} onHome={() => setScreen("home")} />}

      {screen === "home" && (
        <div className="variant-switch">
          <span className="vs-label script">try a look:</span>
          {[["gallery", "Gallery"], ["collage", "Collage"], ["dossier", "Dossier"]].map(([v, l]) => (
            <button key={v} className={"vs-btn" + (t.homeVariant === v ? " on" : "")} onClick={() => setTweak("homeVariant", v)}>{l}</button>
          ))}
        </div>
      )}

      <TweaksPanel>
        <TweakSection label="Home screen" />
        <TweakRadio label="Direction" value={t.homeVariant} options={["gallery", "collage", "dossier"]} onChange={(v) => setTweak("homeVariant", v)} />
        <TweakSection label="Flirty details" />
        <TweakColor label="Accent" value={t.accent} options={["#FF5C8A", "#FF8A3D", "#E8C46B", "#C9184A", "#7A5AE0"]} onChange={(v) => setTweak("accent", v)} />
        <TweakToggle label="Heart cursor + sparkles" value={t.heartCursor} onChange={(v) => setTweak("heartCursor", v)} />
        <TweakSelect label="Sticker density" value={t.stickers} options={["off", "low", "med", "high"]} onChange={(v) => setTweak("stickers", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
