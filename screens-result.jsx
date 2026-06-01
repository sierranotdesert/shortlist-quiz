/* screens-result.jsx — scored verdict: compat %, per-trait scorecard, advice + cheeky take */

function pickResult(score) {
  return RESULTS.find((r) => score >= r.min) || RESULTS[RESULTS.length - 1];
}

/* Auto-saves this reading at the end. You can opt out, name who it's about
   ("do it for someone else"), and jump to your personal ranking. */
function ResultSaver({ entry }) {
  const { active } = window.useProfile();
  const [who, setWho] = useState("");
  const [yourName, setYourName] = useState("");
  const [saved, setSaved] = useState(false);
  const [out, setOut] = useState(false);
  const did = useRef(false);
  // Stable snapshot with one id, so re-saves/edits hit the same local + remote row.
  const eRef = useRef(null);
  if (!eRef.current) eRef.current = Object.assign({ id: window.LQ.uid(), who: "" }, entry);
  const E = eRef.current;

  // Logged in → auto-save once on arrival.
  useEffect(() => {
    if (did.current || out || !active) return;
    did.current = true; setSaved(true);
    window.LQ.save(active, E);
  }, [active]);

  // Keep the saved reading's subject in sync as you type.
  useEffect(() => {
    if (saved && active) window.LQ.patchLast(active, { who: window.LQ.normName(who) });
  }, [who]);

  const openRanking = () => window.dispatchEvent(new Event("lq-open-ranking"));
  const undo = () => { if (active) window.LQ.removeLast(active); did.current = true; setSaved(false); setOut(true); };
  const redo = () => { if (active) { window.LQ.save(active, Object.assign({}, E, { who: window.LQ.normName(who) })); did.current = true; setSaved(true); setOut(false); } };
  const saveAs = () => {
    const me = window.LQ.setActive(yourName);
    if (me) { window.LQ.save(me, Object.assign({}, E, { who: window.LQ.normName(who) })); did.current = true; setSaved(true); setOut(false); }
  };

  // Logged in + saved (default at the end).
  if (active && saved) {
    return (
      <div className="rs-save">
        <span className="eyebrow" style={{ color: "var(--accent)" }}>Saved to {active}'s log ♡</span>
        <p className="serif rs-save-lbl">Who is this reading about?</p>
        <input className="lq-input" maxLength={24} placeholder="their name (optional)" value={who}
          onChange={(e) => setWho(e.target.value.replace(/^\s+/, "").slice(0, 24))} />
        <div className="rs-save-row">
          <button className="btn btn-ghost btn-sm" onClick={openRanking}>See your ranking ♡</button>
          <button className="lq-signout" onClick={undo}>Don't save this one</button>
        </div>
      </div>
    );
  }
  // Logged in but opted out.
  if (active && out) {
    return (
      <div className="rs-save">
        <span className="eyebrow" style={{ color: "var(--fg-dim)" }}>Not saved</span>
        <p className="serif rs-save-lbl" style={{ margin: "0 0 12px" }}>This reading wasn't added to your log.</p>
        <button className="btn btn-primary btn-sm" onClick={redo}>Save it anyway ♡</button>
      </div>
    );
  }
  // Logged out, skipped.
  if (!active && out) {
    return (
      <div className="rs-save">
        <span className="eyebrow" style={{ color: "var(--fg-dim)" }}>Not saved</span>
        <p className="serif rs-save-lbl" style={{ margin: "0 0 12px" }}>Add a name any time to start keeping a log.</p>
        <button className="btn btn-primary btn-sm" onClick={() => setOut(false)}>Save this reading ♡</button>
      </div>
    );
  }
  // Logged out → offer to save (for yourself, or for someone else).
  return (
    <div className="rs-save">
      <span className="eyebrow" style={{ color: "var(--accent)" }}>Save this reading ♡</span>
      <p className="serif rs-save-lbl">Log it to track them over time and build your ranking:</p>
      <div className="rs-save-fields">
        <input className="lq-input" maxLength={24} placeholder="your name" value={yourName}
          onChange={(e) => setYourName(e.target.value.replace(/^\s+/, "").slice(0, 24))}
          onKeyDown={(e) => { if (e.key === "Enter") saveAs(); }} />
        <input className="lq-input" maxLength={24} placeholder="who you're rating (optional)" value={who}
          onChange={(e) => setWho(e.target.value.replace(/^\s+/, "").slice(0, 24))}
          onKeyDown={(e) => { if (e.key === "Enter") saveAs(); }} />
      </div>
      <div className="rs-save-row">
        <button className="btn btn-primary btn-sm" disabled={!yourName.trim()} onClick={saveAs}>Save ♡</button>
        <button className="lq-signout" onClick={() => setOut(true)}>Skip</button>
      </div>
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
  if (score >= 42) return "Genuinely a coin-flip. Define what you actually want, then see if they're building it with you — or just keeping you around. No more vibes-only.";
  if (score >= 20) return "The fun is loud and the warnings are louder. Have one honest conversation; if nothing changes, believe the data, not the butterflies.";
  return "We say this with love: the score isn't shy. Protect your peace, keep your standards, and free up the calendar for someone who clears the bar.";
}

Object.assign(window, { Result, pickResult, bandColor, adviceTake });
