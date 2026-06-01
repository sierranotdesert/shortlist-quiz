/* screens-quiz.jsx — stage picker + adaptive question interactions */

/* ---------- Stage picker ---------- */
function Picker({ onPick, onBack }) {
  const art = { firstdate: PAINT.swing(700), month: PAINT.primavera(800), threemonth: PAINT.bronzino(700), year: PAINT.klimt(700) };
  const obj = { firstdate: "center 14%", month: "center 30%", threemonth: "center 22%", year: "center 16%" };
  return (
    <div className="screen fade-enter pk wrap">
      <header className="pk-top">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Home</button>
        <span className="eyebrow">Where are you in this?</span>
      </header>
      <h1 className="display pk-h1">PICK YOUR CHAPTER</h1>
      <p className="serif pk-sub">Same quiz, sharper questions. The deeper you are, the less we let you off the hook.</p>
      <div className="pk-grid">
        {STAGES.map((s) => (
          <button key={s.id} className="pk-card" onClick={() => onPick(s.id)}>
            <div className="pk-img"><img src={art[s.id]} style={{ objectPosition: obj[s.id] }} alt="" draggable="false" /><span className="pk-num serif">{s.num}</span></div>
            <div className="pk-body">
              <span className="pk-tag eyebrow">{s.tag}</span>
              <h3 className="pk-label">{s.label}</h3>
              <p className="serif pk-blurb">{s.blurb}</p>
              <span className="pk-go">Start →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Next button ---------- */
function QNext({ show, label, onClick }) {
  if (!show) return null;
  return <button className="btn btn-primary qnext fade-enter" onClick={onClick}>{label || "Next"} <span>♡</span></button>;
}

/* ---------- helper: map pointer to 0..100 along a ref ---------- */
function pctFrom(ref, clientX) {
  const r = ref.current.getBoundingClientRect();
  return Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
}

/* ---------- Cards ---------- */
function CardsQ({ q, onAnswer }) {
  const [sel, setSel] = useState(null);
  return (
    <div>
      <div className="opt-grid">
        {q.options.map((o, i) => (
          <button key={i} className={"opt-card" + (o.flag ? " flag" : "") + (sel === i ? " sel" : "")} onClick={() => setSel(i)}>
            <p className="ol">{o.label}</p>
            {sel === i && <p className="on fade-enter">{o.note}</p>}
          </button>
        ))}
      </div>
      <QNext show={sel !== null} onClick={() => onAnswer((q.options[sel].score / 4) * 100)} />
    </div>
  );
}

/* ---------- Slider ---------- */
function SliderQ({ q, onAnswer }) {
  const ref = useRef(null);
  const [v, setV] = useState(50);
  const [touched, setTouched] = useState(false);
  const dragging = useRef(false);
  const start = (e) => { dragging.current = true; setTouched(true); move(e); window.addEventListener("pointermove", move); window.addEventListener("pointerup", end); };
  const move = (e) => { if (ref.current) setV(pctFrom(ref, e.clientX)); };
  const end = () => { dragging.current = false; window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); };
  return (
    <div className="q-slider-wrap">
      <div className="fs-readout">{Math.round(v)}<span style={{ fontSize: 28 }}>%</span></div>
      <div className="flirt-slider">
        <div className="fs-track" ref={ref} onPointerDown={start}>
          <div className="fs-fill" style={{ width: v + "%" }}></div>
          <div className="fs-knob" style={{ left: v + "%" }} onPointerDown={start}>{v > 66 ? "😍" : v > 33 ? "🙂" : "😐"}</div>
        </div>
        <div className="fs-ends"><span>{q.low}</span><span>{q.high}</span></div>
      </div>
      <p className="serif q-note">{touched ? (v > 66 ? "Big green-flag energy." : v > 33 ? "Middling. The data is thinking." : "Oof. Be honest with yourself.") : "Drag the dial. No wrong answers — only revealing ones."}</p>
      <QNext show onClick={() => onAnswer(v)} />
    </div>
  );
}

/* ---------- Red-flag meter ---------- */
function MeterQ({ q, onAnswer }) {
  const ref = useRef(null);
  const [v, setV] = useState(null);
  const start = (e) => { move(e); window.addEventListener("pointermove", move); window.addEventListener("pointerup", end); };
  const move = (e) => { if (ref.current) setV(pctFrom(ref, e.clientX)); };
  const end = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); };
  const cur = v == null ? 50 : v;
  return (
    <div className="q-meter-wrap">
      <div className="meter-track" ref={ref} onPointerDown={start}>
        <div className="meter-ticks">{[0,1,2,3,4,5,6,7].map((i) => <span key={i}></span>)}</div>
        <div className="flag-handle" style={{ left: cur + "%" }}>🚩</div>
      </div>
      <div className="fs-ends"><span>{q.low}</span><span>{q.high}</span></div>
      <p className="serif q-note">{v == null ? "Drag the 🚩 along the scale, then drop it where it lands." : (v > 66 ? "Oof. The flag is waving with purpose." : v > 33 ? "A medium-sized flag. Noted." : "Barely a flag. Suspiciously perfect.")}</p>
      <QNext show={v != null} onClick={() => onAnswer(100 - v)} />
    </div>
  );
}

/* ---------- Swipe yes/no ---------- */
function SwipeQ({ q, stage, onAnswer }) {
  const [dx, setDx] = useState(0);
  const startX = useRef(null);
  const art = { firstdate: PAINT.swing(700), month: PAINT.venus(700), threemonth: PAINT.bronzino(700), year: PAINT.klimt(700) };
  const down = (e) => { startX.current = e.clientX; window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up); };
  const mv = (e) => { if (startX.current != null) setDx(e.clientX - startX.current); };
  const up = () => {
    window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up);
    if (dx > 110) commit(100); else if (dx < -110) commit(0); else setDx(0);
    startX.current = null;
  };
  const commit = (score) => { setDx(score === 100 ? 600 : -600); setTimeout(() => onAnswer(score), 260); };
  const rot = dx / 18;
  return (
    <div className="q-swipe-wrap">
      <div className="swipe-stage">
        <div className="swipe-card" style={{ transform: "translateX(" + dx + "px) rotate(" + rot + "deg)" }} onPointerDown={down}>
          <img src={art[stage]} alt="" draggable="false" />
          <div className="swipe-stamp yes" style={{ opacity: Math.max(0, dx / 110) }}>YES</div>
          <div className="swipe-stamp no" style={{ opacity: Math.max(0, -dx / 110) }}>NOPE</div>
          <div className="swipe-veil"></div>
        </div>
      </div>
      <div className="swipe-btns">
        <button className="swipe-btn no" onClick={() => commit(0)}>{q.no}</button>
        <button className="swipe-btn yes" onClick={() => commit(100)}>{q.yes}</button>
      </div>
      <p className="serif q-note">Drag the portrait, or tap. Your gut already knows.</p>
    </div>
  );
}

/* ---------- Tappable hearts ---------- */
const HEART_NOTES = ["Yikes. The bar is on the floor.", "Eh. Settling energy.", "Solid, not spectacular.", "Genuinely into it. Cute.", "Down bad. We love to see it."];
function HeartsQ({ q, onAnswer }) {
  const [n, setN] = useState(0);
  const [hover, setHover] = useState(0);
  const lit = hover || n;
  return (
    <div className="q-hearts-wrap">
      <div className="hearts-row" onPointerLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} className={"heart-btn" + (lit >= i ? " lit" : "")} onPointerEnter={() => setHover(i)} onClick={() => setN(i)} aria-label={i + " hearts"}>♥</button>
        ))}
      </div>
      <p className="serif q-note">{n ? HEART_NOTES[n - 1] : (q.label || "Tap the hearts")}</p>
      <QNext show={n > 0} onClick={() => onAnswer((n / 5) * 100)} />
    </div>
  );
}

/* ---------- Quiz controller ---------- */
function Quiz({ stage, onDone, onBack }) {
  const questions = (window.getQuestions ? window.getQuestions(stage) : []);
  const total = questions.length;
  const [step, setStep] = useState(0);
  const scores = useRef([]);
  const q = questions[step];
  const stageObj = STAGES.find((s) => s.id === stage);
  const answer = (score) => {
    scores.current.push({ id: q.id, name: q.name, icon: q.icon, s: score, w: q.weight || 1 });
    if (step + 1 < total) setStep(step + 1);
    else {
      const sumW = scores.current.reduce((a, b) => a + b.w, 0);
      const sumS = scores.current.reduce((a, b) => a + b.s * b.w, 0);
      onDone(Math.round(sumS / sumW), stage, scores.current.slice());
    }
  };
  const Comp = { cards: CardsQ, slider: SliderQ, meter: MeterQ, swipe: SwipeQ, hearts: HeartsQ }[q.type];
  return (
    <div className="screen fade-enter qz wrap" key={step}>
      <header className="qz-top">
        <button className="btn btn-ghost btn-sm" onClick={step === 0 ? onBack : () => setStep(step - 1)}>← Back</button>
        <div className="qz-prog">
          <div className="qz-prog-bar"><div className="qz-prog-fill" style={{ width: (step / total) * 100 + "%" }}></div></div>
          <span className="qz-prog-label">{step + 1} <span>/ {total}</span></span>
        </div>
        <span className="eyebrow qz-stage hide-mobile">{stageObj.label} · {stageObj.num}</span>
      </header>
      <div className="qz-body">
        <div className="qz-q">
          <span className="qz-icon">{q.icon}</span>
          <span className="eyebrow qz-trait">{q.name}</span>
          <h2 className="serif qz-prompt">{q.prompt}</h2>
        </div>
        <div className="qz-interaction"><Comp q={q} stage={stage} onAnswer={answer} /></div>
      </div>
    </div>
  );
}

Object.assign(window, { Picker, Quiz, CardsQ, SliderQ, MeterQ, SwipeQ, HeartsQ, QNext });
