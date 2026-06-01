/* screens-result.jsx — scored verdict: compat %, per-trait scorecard, advice + cheeky take */

function pickResult(score) {
  return RESULTS.find((r) => score >= r.min) || RESULTS[RESULTS.length - 1];
}

/* Saves this reading to the signed-in initials (once), and shows past scores
   for this stage so you can watch a person trend over time. */
function ResultSaver({ entry }) {
  const { active } = window.useProfile();
  const saved = useRef(false);
  useEffect(() => {
    if (!saved.current && active) { saved.current = true; window.LQ.save(active, entry); }
  }, [active]);

  if (!active) {
    return (
      <div className="rs-save">
        <span className="eyebrow" style={{ color: "var(--accent)" }}>Keep your scores ♡</span>
        <p className="serif rs-save-lbl">Pick a username to track this person over time:</p>
        <window.NameForm primary onSave={(v) => { window.LQ.setActive(v); window.LQ.save(v, entry); saved.current = true; }} />
      </div>
    );
  }
  const past = window.LQ.history(active).filter((e) => e.stage === entry.stage);
  return (
    <div className="rs-save">
      <span className="eyebrow" style={{ color: "var(--accent)" }}>Saved to {active} ♡</span>
      {past.length > 1 ? (
        <div className="rs-save-hist">
          <span className="serif rs-save-lbl" style={{ margin: 0 }}>Your {entry.stageLabel} scores:</span>
          {past.slice(0, 6).map((e, i) => (
            <span key={i} className={"rs-chip" + (i === 0 ? " now" : "")}>{e.score}%</span>
          ))}
        </div>
      ) : (
        <p className="serif rs-save-lbl" style={{ margin: 0 }}>Score this stage again later to see if the verdict shifts.</p>
      )}
    </div>
  );
}
function bandColor(s) { return s >= 67 ? "#36d27a" : s >= 40 ? "#f5b942" : "#ff5c6b"; }

function Result({ score, stage, breakdown, onRetake, onHome }) {
  const r = pickResult(score);
  const stageObj = STAGES.find((s) => s.id === stage) || STAGES[0];
  const [fill, setFill] = useState(0);
  const [count, setCount] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setFill(score), 250);
    let n = 0;
    const iv = setInterval(() => { n += Math.ceil(score / 28); if (n >= score) { n = score; clearInterval(iv); } setCount(n); }, 28);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [score]);

  // real breakdown, or synthesize a plausible one (for previews) so the scorecard always shows
  const data = (breakdown && breakdown.length ? breakdown : (window.getQuestions ? window.getQuestions(stage) : []).map((q, i) => ({
    id: q.id, name: q.name, icon: q.icon, s: Math.max(4, Math.min(99, Math.round(score + Math.sin(i * 1.9) * 24))), w: q.weight || 1
  }))).map((d) => ({ ...d, s: Math.round(d.s) }));

  const sorted = [...data].sort((a, b) => b.s - a.s);
  const greens = sorted.filter((d) => d.s >= 72).slice(0, 4);
  const reds = sorted.filter((d) => d.s <= 42).slice(-4).reverse();
  const top = sorted[0];
  const low = sorted[sorted.length - 1];
  const flagCount = data.filter((d) => d.s <= 33).length;

  const art = { firstdate: PAINT.swing(700), month: PAINT.primavera(800), threemonth: PAINT.bronzino(700), year: PAINT.klimt(700) }[stage];

  return (
    <div className="screen fade-enter rs wrap">
      <header className="rs-top">
        <Logo />
        <span className="eyebrow">{stageObj.label} · the verdict</span>
      </header>

      <div className="rs-grid">
        <div className="rs-left">
          <span className="eyebrow">Compatibility score</span>
          <div className="rs-score display">{count}<span className="rs-pct">%</span></div>
          <div className="love-bar"><div className="love-fill" style={{ width: fill + "%" }}></div></div>
          <div className="rs-statline">
            <span><strong>{greens.length}</strong> green flags</span>
            <span className="rs-dot">·</span>
            <span><strong>{flagCount}</strong> red flags</span>
            <span className="rs-dot">·</span>
            <span><strong>{data.length}</strong> traits scored</span>
          </div>
          <div className="rs-verdict">
            <span className="rs-emoji">{r.emoji}</span>
            <div>
              <span className="eyebrow" style={{ color: "var(--ember)" }}>The court rules</span>
              <h1 className="display rs-title">{r.title}</h1>
            </div>
          </div>
          <p className="serif rs-copy dropcap">{r.copy}</p>
          <ResultSaver entry={{ t: Date.now(), stage, score, stageLabel: stageObj.label, verdict: r.verdict, emoji: r.emoji }} />
        </div>
        <div className="rs-right">
          <div className="frame rs-frame frame-photo-tint">
            <img src={art} alt="" draggable="false" />
            <div className="rs-card-stamp">
              <span className="serif">verdict</span>
              <strong className="display">{r.verdict}</strong>
            </div>
          </div>
          <div className="rs-cameo cameo"><img src={PAINT.mona(500)} style={{ objectPosition: "center 18%" }} alt="" draggable="false" /></div>
          <div className="rs-float rs-f1">💘</div>
          <div className="rs-float rs-f2">{score < 42 ? "🚩" : "✨"}</div>
        </div>
      </div>

      {/* ---- the receipts ---- */}
      <div className="rs-section">
        <div className="rs-sec-head"><span className="eyebrow">The receipts</span><h2 className="serif rs-sec-title">Every trait, scored</h2></div>
        <div className="rs-scorecard">
          {data.map((d) => (
            <div className="sc-row" key={d.id}>
              <span className="sc-ico">{d.icon}</span>
              <span className="sc-name">{d.name}{d.w < 1 ? <em className="sc-half"> ½</em> : null}</span>
              <span className="sc-bar"><span className="sc-fill" style={{ width: d.s + "%", background: bandColor(d.s) }}></span></span>
              <span className="sc-num" style={{ color: bandColor(d.s) }}>{d.s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ---- advice + cheeky take ---- */}
      <div className="rs-advice-grid">
        <div className="rs-flagbox green">
          <span className="eyebrow" style={{ color: "#36d27a" }}>Green flags — lean in</span>
          {greens.length ? greens.map((d) => (
            <div className="rs-flag-line" key={d.id}><span>{d.icon}</span><span className="serif">{d.name}</span><b>{d.s}</b></div>
          )) : <p className="serif rs-empty">Slim pickings up here, babe. Be honest with yourself.</p>}
        </div>
        <div className="rs-flagbox red">
          <span className="eyebrow" style={{ color: "#ff5c6b" }}>Watch-outs — handle with care</span>
          {reds.length ? reds.map((d) => (
            <div className="rs-flag-line" key={d.id}><span>{d.icon}</span><span className="serif">{d.name}</span><b>{d.s}</b></div>
          )) : <p className="serif rs-empty">Genuinely no red flags. Suspicious, but we'll allow it.</p>}
        </div>
        <div className="rs-coach">
          <span className="eyebrow" style={{ color: "var(--ember)" }}>Cupid's unsolicited advice</span>
          <p className="serif rs-coach-line"><strong>Strongest:</strong> {top.name} ({top.s}). {top.s >= 70 ? "Whatever's working here, protect it — it's rarer than you think." : "Even your best score is lukewarm. That's the headline."}</p>
          <p className="serif rs-coach-line"><strong>Weakest:</strong> {low.name} ({low.s}). {low.s <= 33 ? "That's not a vibe, that's a conversation. Have it before you get more attached." : low.s <= 55 ? "Keep an eye on this one — it's the crack the relationship will widen." : "Even your low score is decent. Genuinely promising."}</p>
          <p className="serif rs-coach-line rs-coach-take">{adviceTake(score, stage)}</p>
        </div>
      </div>

      <div className="rs-actions">
        <button className="btn btn-primary" onClick={onRetake}>Score another stage ♡</button>
        <button className="btn btn-ghost" onClick={onHome}>Back to start</button>
        <span className="hint">results are 100% scientifically vibes-based ✨</span>
      </div>
    </div>
  );
}

function adviceTake(score, stage) {
  const yr = stage === "year";
  if (score >= 86) return yr ? "A year in and scoring this high? This is the one your friends will be insufferably happy about. Don't overthink it." : "Early, but this is rare air. Keep showing up and let it cook.";
  if (score >= 65) return "Real potential. The bones are good — the work now is consistency, not chemistry. Stop waiting for a reason to bail.";
  if (score >= 42) return "Genuinely a coin-flip. Define what you actually want, then see if he's building it with you — or just keeping you around. No more vibes-only.";
  if (score >= 20) return "The fun is loud and the warnings are louder. Have one honest conversation; if nothing changes, believe the data, not the butterflies.";
  return "We say this with love: the score isn't shy. Protect your peace, keep your standards, and free up the calendar for someone who clears the bar.";
}

Object.assign(window, { Result, pickResult, bandColor, adviceTake });
