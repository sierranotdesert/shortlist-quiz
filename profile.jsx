/* profile.jsx — username login + local result history + personal ranking.
   No backend: your username, your readings, and who each reading is about are kept
   in localStorage, per-browser. window.LQ is the storage layer; ProfilePill is the
   persistent UI. Relies on useState/useEffect/useRef being globally bound by
   stickers.jsx (loaded earlier). */
(function () {
  const KEY_ACTIVE = "lovequiz.user";
  const KEY_HIST = "lovequiz.history";

  function readHist() {
    try { return JSON.parse(localStorage.getItem(KEY_HIST) || "{}") || {}; } catch (e) { return {}; }
  }
  function writeHist(h) { try { localStorage.setItem(KEY_HIST, JSON.stringify(h)); } catch (e) {} }
  function normName(s) { return String(s || "").replace(/\s+/g, " ").trim().slice(0, 24); }
  function ping() { window.dispatchEvent(new Event("lq-profile")); }
  function uid() {
    try { if (crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  // Optional central collection. Each saved reading is upserted (by client_id, so
  // edits to "who" update the same row) into a Supabase table. Fire-and-forget:
  // failures never block the local save. No-op until SUPABASE_URL/KEY are set.
  function remoteOn() {
    return window.SUPABASE_URL && window.SUPABASE_ANON_KEY && String(window.SUPABASE_URL).indexOf("http") === 0;
  }
  function logRemote(user, e) {
    if (!remoteOn() || !e) return;
    try {
      fetch(String(window.SUPABASE_URL).replace(/\/$/, "") + "/rest/v1/readings?on_conflict=client_id", {
        method: "POST",
        headers: {
          apikey: window.SUPABASE_ANON_KEY,
          Authorization: "Bearer " + window.SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal"
        },
        body: JSON.stringify({
          client_id: e.id, app_user: user, subject: e.who || null,
          stage: e.stage, stage_label: e.stageLabel, score: e.score, verdict: e.verdict
        })
      }).catch(function () {});
    } catch (err) {}
  }

  const LQ = {
    normName,
    uid,
    getActive() { try { return localStorage.getItem(KEY_ACTIVE) || ""; } catch (e) { return ""; } },
    setActive(name) {
      const v = normName(name);
      try { v ? localStorage.setItem(KEY_ACTIVE, v) : localStorage.removeItem(KEY_ACTIVE); } catch (e) {}
      ping();
      return v;
    },
    history(name) { return readHist()[normName(name)] || []; },
    save(name, entry) {
      const v = normName(name); if (!v) return;
      const h = readHist();
      h[v] = [entry].concat(h[v] || []).slice(0, 60);
      writeHist(h);
      logRemote(v, entry);
      ping();
    },
    // Patch the most recent reading (used to set "who" after an auto-save).
    patchLast(name, patch) {
      const v = normName(name); const h = readHist();
      if (h[v] && h[v].length) { h[v][0] = Object.assign({}, h[v][0], patch); writeHist(h); logRemote(v, h[v][0]); ping(); }
    },
    // Remove the most recent reading (opt out / undo).
    removeLast(name) {
      const v = normName(name); const h = readHist();
      if (h[v] && h[v].length) { h[v].shift(); writeHist(h); ping(); }
    },
    // Your personal leaderboard: each person you've rated, by their best score.
    ranking(name) {
      const by = {};
      LQ.history(name).forEach((e) => {
        const k = normName(e.who) || "Someone";
        if (!by[k]) by[k] = { who: k, best: e.score, latest: e, count: 0 };
        by[k].count++;
        if (e.score > by[k].best) by[k].best = e.score;
      });
      return Object.keys(by).map((k) => by[k]).sort((a, b) => b.best - a.best);
    }
  };
  window.LQ = LQ;

  function useProfile() {
    const [, force] = useState(0);
    useEffect(() => {
      const on = () => force((n) => n + 1);
      window.addEventListener("lq-profile", on);
      window.addEventListener("storage", on);
      return () => { window.removeEventListener("lq-profile", on); window.removeEventListener("storage", on); };
    }, []);
    const active = LQ.getActive();
    return { active, history: LQ.history(active) };
  }
  window.useProfile = useProfile;

  function fmtDate(t) {
    try { return new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch (e) { return ""; }
  }
  function bandColor(s) { return s >= 67 ? "#36d27a" : s >= 40 ? "#f5b942" : "#ff5c6b"; }

  function clientId() {
    const c = window.GOOGLE_CLIENT_ID;
    return c && String(c).trim() && String(c).indexOf("PASTE") < 0 ? String(c).trim() : "";
  }
  function decodeJwt(token) {
    try {
      const b = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(atob(b).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
      return JSON.parse(json);
    } catch (e) { return null; }
  }

  // "Sign in with Google" — renders only when a Client ID is configured.
  function GoogleSignIn() {
    const ref = useRef(null);
    useEffect(() => {
      const cid = clientId(); if (!cid) return;
      let stop = false;
      const init = () => {
        if (stop || !(window.google && google.accounts && google.accounts.id)) return false;
        google.accounts.id.initialize({
          client_id: cid,
          callback: (resp) => { const p = decodeJwt(resp.credential); if (p && p.name) LQ.setActive(p.name); }
        });
        if (ref.current) google.accounts.id.renderButton(ref.current, { theme: "filled_black", size: "large", shape: "pill", text: "signin_with" });
        return true;
      };
      if (!init()) {
        const iv = setInterval(() => { if (init()) clearInterval(iv); }, 300);
        const to = setTimeout(() => clearInterval(iv), 8000);
        return () => { stop = true; clearInterval(iv); clearTimeout(to); };
      }
    }, []);
    if (!clientId()) return null;
    return (
      <div className="lq-google">
        <div ref={ref}></div>
        <div className="lq-or"><span>or use a username</span></div>
      </div>
    );
  }
  window.GoogleSignIn = GoogleSignIn;

  // Username entry. primary => prominent "Save" styling; otherwise a quiet "Switch".
  function NameForm({ primary, placeholder, onSave }) {
    const [draft, setDraft] = useState("");
    const submit = () => { if (draft.trim()) onSave(draft); setDraft(""); };
    return (
      <div className="lq-switch">
        <input className="lq-input" maxLength={24} placeholder={placeholder || "your name"} value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/^\s+/, "").slice(0, 24))}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />
        <button className={"btn btn-sm " + (primary ? "btn-primary" : "btn-ghost")} disabled={!draft.trim()} onClick={submit}>
          {primary ? "Save ♡" : "Switch"}
        </button>
      </div>
    );
  }
  window.NameForm = NameForm;

  // Persistent pill, bottom-left. Log in, view readings + ranking, switch/log out.
  function ProfilePill() {
    const { active, history } = useProfile();
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState("readings");
    useEffect(() => {
      const openRanking = () => { setOpen(true); setTab("ranking"); };
      window.addEventListener("lq-open-ranking", openRanking);
      return () => window.removeEventListener("lq-open-ranking", openRanking);
    }, []);
    const ranking = active ? LQ.ranking(active) : [];

    return (
      <div className="lq-pill-wrap">
        {open && (
          <div className="lq-panel">
            <div className="lq-panel-hd">
              <span className="eyebrow">{active ? "Your log" : "Save your scores"}</span>
              <button className="lq-x" onClick={() => setOpen(false)} aria-label="Close">✕</button>
            </div>
            {active ? (
              <>
                <div className="lq-who">Logged in as <b>{active}</b></div>
                <div className="lq-tabs">
                  <button className={"lq-tab" + (tab === "readings" ? " on" : "")} onClick={() => setTab("readings")}>Readings</button>
                  <button className={"lq-tab" + (tab === "ranking" ? " on" : "")} onClick={() => setTab("ranking")}>Ranking</button>
                </div>
                {tab === "readings" ? (
                  history.length ? (
                    <div className="lq-hist">
                      {history.map((e, i) => (
                        <div className="lq-hist-row" key={i}>
                          <span className="lq-hist-emoji">{e.emoji}</span>
                          <span className="lq-hist-meta"><b>{e.score}%</b> · {e.who || "Someone"} <em>{e.stageLabel} · {fmtDate(e.t)}</em></span>
                          <span className="lq-hist-verdict">{e.verdict}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="lq-empty serif">No readings yet — take the quiz and your score lands here.</p>
                ) : (
                  ranking.length ? (
                    <div className="lq-rank">
                      {ranking.map((r, i) => (
                        <div className="lq-rank-row" key={r.who}>
                          <span className="lq-rank-n">{i + 1}</span>
                          <span className="lq-rank-name">{r.who}{r.count > 1 ? <em> · {r.count} reads</em> : null}</span>
                          <span className="lq-rank-score" style={{ color: bandColor(r.best) }}>{r.best}%</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="lq-empty serif">Rate a few people and your personal ranking shows up here.</p>
                )}
                <NameForm placeholder="switch user" onSave={(v) => LQ.setActive(v)} />
                <button className="lq-signout" onClick={() => { LQ.setActive(""); setOpen(false); }}>Log out</button>
              </>
            ) : (
              <>
                <p className="lq-empty serif">Sign in to keep a private history of your love readings, and a ranking of everyone you rate.</p>
                <GoogleSignIn />
                <NameForm primary onSave={(v) => LQ.setActive(v)} />
              </>
            )}
          </div>
        )}
        <button className="lq-pill" onClick={() => setOpen((o) => !o)} aria-label="Profile">
          <span className="lq-pill-heart">♡</span>
          {active ? <span className="lq-pill-init">{active}</span> : <span className="lq-pill-label">Log in</span>}
          {active && history.length ? <span className="lq-pill-badge">{history.length}</span> : null}
        </button>
      </div>
    );
  }
  window.ProfilePill = ProfilePill;
})();
