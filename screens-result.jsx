/* screens-result.jsx — scored verdict: compat %, per-trait scorecard, advice + cheeky take */

function pickResult(score) {
  return RESULTS.find((r) => score >= r.min) || RESULTS[RESULTS.length - 1];
}

/* Pre-results gate: log in (email/password, Google, or a username) and name who
   you're tracking — BEFORE the verdict. You can also skip and just see results. */
function Gate({ reading, onReveal, onBack }) {
  const { active } = window.useProfile();
  const [who, setWho] = useState((reading && reading.who) || "");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const hasSb = !!(window.LQ.sbBase && window.LQ.sbBase());

  const reveal = () => {
    const w = window.LQ.normName(who);
    if (reading) reading.who = w;
    const id = window.LQ.getActive();
    if (id && reading) window.LQ.save(id, Object.assign({}, reading, { who: w }));
    onReveal();
  };
  const doEmail = () => {
    if (!email || !pw || busy) return;
    setBusy(true); setErr("");
    window.LQ.emailAuth(mode, email, pw)
      .then(() => setBusy(false))
      .catch((e) => { setErr(String(e.message || e)); setBusy(false); });
  };

  return (
    <div className="screen fade-enter gate wrap">
      <header className="gate-top">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
        <span className="eyebrow">One last thing</span>
      </header>
      <h1 className="display gate-h1">BEFORE THE VERDICT</h1>
      <p className="serif gate-sub">Save this reading so you can track them over time — and rank everyone you're seeing.</p>

      <div className="gate-card">
        <label className="gate-label">Who are you rating? <span>(private — just for your eyes)</span></label>
        <input className="lq-input gate-who" maxLength={40} placeholder={"name or initials, e.g. “A.M.”"} value={who}
          onChange={(e) => setWho(e.target.value.replace(/^\s+/, "").slice(0, 40))}
          onKeyDown={(e) => { if (e.key === "Enter" && active) reveal(); }} />

        {active ? (
          <p className="gate-loggedin">Saving to <b>{active}</b>'s log.</p>
        ) : (
          <div className="gate-auth">
            <window.GoogleSignIn />
            {hasSb ? (
              <>
                <div className="gate-fields">
                  <input className="lq-input" type="email" autoComplete="email" placeholder="email" value={email}
                    onChange={(e) => setEmail(e.target.value)} />
                  <input className="lq-input" type="password" autoComplete="current-password" placeholder="password" value={pw}
                    onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") doEmail(); }} />
                </div>
                {err ? <p className="gate-err">{err}</p> : null}
                <div className="rs-save-row">
                  <button className="btn btn-primary btn-sm" disabled={busy || !email || !pw} onClick={doEmail}>
                    {busy ? "…" : mode === "login" ? "Log in" : "Create account"}
                  </button>
                  <button className="lq-signout" onClick={() => { setErr(""); setMode(mode === "login" ? "signup" : "login"); }}>
                    {mode === "login" ? "New here? Create an account" : "Have an account? Log in"}
                  </button>
                </div>
                <div className="lq-or"><span>or just use a name</span></div>
              </>
            ) : null}
            <window.NameForm primary placeholder="a username" onSave={(v) => window.LQ.setActive(v)} />
          </div>
        )}
      </div>

      <div className="gate-actions">
        <button className="btn btn-primary" onClick={reveal}>Reveal my verdict ♡</button>
        {active ? null : <button className="btn btn-ghost" onClick={reveal}>Skip — just show me</button>}
      </div>
    </div>
  );
}
window.Gate = Gate;

/* Result-screen status: confirms the save made at the gate, lets you rename the
   subject, jump to your ranking, remove it, or save if you logged in after. */
function ResultSavedBar({ reading }) {
  const { active } = window.useProfile();
  const [who, setWho] = useState((reading && reading.who) || "");
  if (!reading) return null;
  const list = active ? window.LQ.history(active) : [];
  const isSaved = !!(active && list[0] && list[0].id === reading.id);

  useEffect(() => {
    if (isSaved && active) window.LQ.patchLast(active, { who: window.LQ.normName(who) });
  }, [who]);

  const openRanking = () => window.dispatchEvent(new Event("lq-open-ranking"));

  if (isSaved) {
    return (
      <div className="rs-save">
        <span className="eyebrow" style={{ color: "var(--accent)" }}>Saved to {active}'s log ♡</span>
        <p className="serif rs-save-lbl">Tracking as:</p>
        <input className="lq-input" maxLength={40} placeholder="private name or initials" value={who}
          onChange={(e) => setWho(e.target.value.replace(/^\s+/, "").slice(0, 40))} />
        <div className="rs-save-row">
          <button className="btn btn-ghost btn-sm" onClick={openRanking}>See your ranking ♡</button>
          <button className="lq-signout" onClick={() => window.LQ.removeLast(active)}>Remove from log</button>
        </div>
      </div>
    );
  }
  if (active) {
    return (
      <div className="rs-save">
        <span className="eyebrow" style={{ color: "var(--accent)" }}>Save this reading ♡</span>
        <p className="serif rs-save-lbl">Tracking as:</p>
        <input className="lq-input" maxLength={40} placeholder="private name or initials" value={who}
          onChange={(e) => setWho(e.target.value.replace(/^\s+/, "").slice(0, 40))} />
        <button className="btn btn-primary btn-sm" onClick={() => window.LQ.save(active, Object.assign({}, reading, { who: window.LQ.normName(who) }))}>Save to {active}'s log ♡</button>
      </div>
    );
  }
  return (
    <div className="rs-save">
      <span className="eyebrow" style={{ color: "var(--fg-dim)" }}>Not saved</span>
      <p className="serif rs-save-lbl" style={{ margin: 0 }}>You skipped logging this one. Log in with the ♡ button (bottom-left) to keep your readings and ranking.</p>
    </div>
  );
}
window.ResultSavedBar = ResultSavedBar;

function bandColor(s) { return s >= 67 ? "#36d27a" : s >= 40 ? "#f5b942" : "#ff5c6b"; }

function Result({ score, stage, breakdown, reading, onRetake, onHome }) {
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
          <ResultSavedBar reading={reading} />
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
          {data.map((d, i) => (
            <div className="sc-row" key={d.id + "-" + i}>
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
          {greens.length ? greens.map((d, i) => (
            <div className="rs-flag-line" key={d.id + "-" + i}><span>{d.icon}</span><span className="serif">{d.name}</span><b>{d.s}</b></div>
          )) : <p className="serif rs-empty">Slim pickings up here, babe. Be honest with yourself.</p>}
        </div>
        <div className="rs-flagbox red">
          <span className="eyebrow" style={{ color: "#ff5c6b" }}>Watch-outs — handle with care</span>
          {reds.length ? reds.map((d, i) => (
            <div className="rs-flag-line" key={d.id + "-" + i}><span>{d.icon}</span><span className="serif">{d.name}</span><b>{d.s}</b></div>
          )) : <p className="serif rs-empty">Genuinely no red flags. Suspicious, but we'll allow it.</p>}
        </div>
        <div className="rs-coach">
          <span className="eyebrow" style={{ color: "var(--ember)" }}>Cupid's unsolicited advice</span>
          <p className="serif rs-coach-line"><strong>Strongest:</strong> {top.name} ({top.s}). {top.s >= 70 ? "Whatever's working here, protect it with your life — most people never get this one to light up." : "Sit with this: your BEST score is this lukewarm. That's not a strength, that's the ceiling. Read that again."}</p>
          <p className="serif rs-coach-line"><strong>Weakest:</strong> {low.name} ({low.s}). {low.s <= 33 ? "This isn't a quirk, it's a fault line — and you keep stepping around it like it'll fix itself. It won't. Name it out loud before you get one year deeper." : low.s <= 55 ? "This is the exact crack the whole thing splits along in a year. Watch it like it owes you money." : "Even your weakest link is solid. Honestly? Annoyingly good problem to have."}</p>
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
  if (score >= 88) return yr ? "A whole year in and STILL scoring this high? Stop taking quizzes about it and go be obnoxiously happy. This is the one your friends will pretend not to be jealous of." : "Stupidly early to be this good — which means either it's the real thing or you're love-drunk. Keep showing up and let it cook before you propose, you menace.";
  if (score >= 70) return "This is genuinely promising, and the only documented threat to it is you bailing the second it gets comfortable. The bones are good. Stop auditioning for reasons to leave.";
  if (score >= 48) return "A literal coin-flip wearing a cute outfit. Decide what you actually want, then watch whether they build it with you or just keep you on the bench. No more 'but the vibes though.'";
  if (score >= 25) return "The butterflies are loud and the data is wincing. Have ONE honest conversation. If nothing changes, believe the score, not the serotonin — you're smarter than this and you know it.";
  return "Saying this as your meanest, most loving friend: the score is not being shy and neither will I. This is a parade, not a partner. Protect your peace, raise your bar, and give that calendar slot to someone who actually clears it.";
}

Object.assign(window, { Result, pickResult, bandColor, adviceTake });
