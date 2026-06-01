/* profile.jsx — username login + local result history.
   No backend: a username + results are kept in localStorage, per-browser. window.LQ
   is the storage layer; ProfilePill is the persistent UI. Relies on
   useState/useEffect being globally bound by stickers.jsx (loaded earlier). */
(function () {
  const KEY_ACTIVE = "lovequiz.user";
  const KEY_HIST = "lovequiz.history";

  function readHist() {
    try { return JSON.parse(localStorage.getItem(KEY_HIST) || "{}") || {}; } catch (e) { return {}; }
  }
  function writeHist(h) { try { localStorage.setItem(KEY_HIST, JSON.stringify(h)); } catch (e) {} }
  function normName(s) { return String(s || "").replace(/\s+/g, " ").trim().slice(0, 24); }
  function ping() { window.dispatchEvent(new Event("lq-profile")); }

  const LQ = {
    normName,
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
      h[v] = [entry].concat(h[v] || []).slice(0, 30);
      writeHist(h);
      ping();
    }
  };
  window.LQ = LQ;

  // Reactive view of the active user + their history.
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

  // Persistent pill, bottom-left. Log in, view history, switch/sign out.
  function ProfilePill() {
    const { active, history } = useProfile();
    const [open, setOpen] = useState(false);
    return (
      <div className="lq-pill-wrap">
        {open && (
          <div className="lq-panel">
            <div className="lq-panel-hd">
              <span className="eyebrow">{active ? "Your readings" : "Save your scores"}</span>
              <button className="lq-x" onClick={() => setOpen(false)} aria-label="Close">✕</button>
            </div>
            {active ? (
              <>
                <div className="lq-who">Logged in as <b>{active}</b></div>
                {history.length ? (
                  <div className="lq-hist">
                    {history.map((e, i) => (
                      <div className="lq-hist-row" key={i}>
                        <span className="lq-hist-emoji">{e.emoji}</span>
                        <span className="lq-hist-meta"><b>{e.score}%</b> · {e.stageLabel} <em>{fmtDate(e.t)}</em></span>
                        <span className="lq-hist-verdict">{e.verdict}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="lq-empty serif">No readings yet — take the quiz and your score lands here.</p>}
                <NameForm placeholder="switch user" onSave={(v) => LQ.setActive(v)} />
                <button className="lq-signout" onClick={() => { LQ.setActive(""); setOpen(false); }}>Log out</button>
              </>
            ) : (
              <>
                <p className="lq-empty serif">Pick a username to keep a private history of your love readings on this device.</p>
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
