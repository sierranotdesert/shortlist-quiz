/* screens-home.jsx — two home directions: Gallery + Collage */

/* Shared little brand mark */
function Logo({ light }) {
  return <div className={"logo script" + (light ? " light" : "")}>amoré</div>;
}

/* ---------- The Gallery (faithful to the Editions look) ---------- */
function HomeA({ onBegin, goStage }) {
  return (
    <div className="screen fade-enter">
      <section className="ha-hero">
        <img className="ha-bg" src={PAINT.creation(1600)} alt="The Creation of Adam" draggable="false" />
        <div className="ha-veil"></div>
        <header className="ha-top wrap">
          <Logo />
          <span className="eyebrow hide-mobile">Est. · MMXXVI</span>
        </header>
        <div className="ha-herocopy wrap">
          <span className="eyebrow">A brutally honest love reading</span>
          <h1 className="display ha-h1">THE<br />ONE?</h1>
          <p className="serif ha-sub">Are&nbsp;they your person — or your next cautionary tale?<br />Let the old masters be the judge.</p>
        </div>
      </section>
      <section className="ha-foot wrap">
        <div className="ha-foot-grid">
          <div>
            <span className="eyebrow">Choose your chapter</span>
            <div className="romannav ha-nav">
              {STAGES.map((s) => (
                <button key={s.id} className="rn-row" onClick={() => goStage(s.id)}>
                  <span><span className="rn-name">{s.label}</span> <span className="serif" style={{ color: "var(--fg-dim)", fontStyle: "italic" }}>— {s.tag}</span></span>
                  <span className="rn-num">{s.num}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="ha-cta">
            <button className="btn btn-primary" onClick={onBegin}>Begin the reading <span>♡</span></button>
            <span className="hint">↖ or skip to a stage</span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- The Cherub Collage (cutesy, blush, scrapbook) ---------- */
function HomeB({ onBegin }) {
  return (
    <div className="screen fade-enter hb">
      <div className="hb-wrap wrap">
        <div className="hb-left">
          <Logo />
          <span className="eyebrow" style={{ marginTop: 18 }}>The love audit</span>
          <h1 className="display hb-h1">Is this<br /><span className="hb-em">the&nbsp;one</span>,<br />or the one<br />to&nbsp;block?</h1>
          <p className="serif hb-sub">A flirty, slightly savage quiz that reads your situationship like a tarot card. Drag the stickers. Be honest. Brace yourself.</p>
          <div className="hb-actions">
            <button className="btn btn-primary" onClick={onBegin}>Read my love life ♡</button>
            <button className="btn btn-ghost" onClick={onBegin}>How it works</button>
          </div>
        </div>
        <div className="hb-collage">
          <div className="frame hb-f1"><img src={PAINT.klimt(700)} alt="The Kiss, Klimt" draggable="false" /></div>
          <div className="frame hb-f2"><img src={PAINT.hayez(600)} alt="The Kiss, Hayez" draggable="false" /></div>
          <div className="cameo hb-c1"><img src={PAINT.venus(500)} style={{ objectPosition: "62% 18%" }} alt="" draggable="false" /></div>
          <div className="cameo hb-c2"><img src={PAINT.bronzino(500)} style={{ objectPosition: "center 28%" }} alt="" draggable="false" /></div>
          <div className="hb-heart hb-h-a">💗</div>
          <div className="hb-heart hb-h-b">✨</div>
          <div className="hb-tape hb-tape-1"></div>
          <div className="hb-tape hb-tape-2"></div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomeA, HomeB, Logo });
