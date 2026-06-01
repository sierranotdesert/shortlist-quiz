/* stickers.jsx — draggable stickers, cameo crops, custom heart cursor + sparkle trail */
const { useState, useEffect, useRef, useCallback } = React;

/* A single draggable sticker. Persists position by id in localStorage. */
function Sticker({ id, x, y, rot, children, className }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("stk_" + id) || "null");
      if (saved) return saved;
    } catch (e) {}
    return { x, y };
  });
  const drag = useRef(null);

  const onDown = (e) => {
    e.preventDefault();
    const p = e.touches ? e.touches[0] : e;
    drag.current = { dx: p.clientX - pos.x, dy: p.clientY - pos.y };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const nx = Math.max(-10, Math.min(window.innerWidth - 30, e.clientX - drag.current.dx));
    const ny = Math.max(-10, Math.min(window.innerHeight - 30, e.clientY - drag.current.dy));
    setPos({ x: nx, y: ny });
  };
  const onUp = () => {
    drag.current = null;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    setPos((p) => { try { localStorage.setItem("stk_" + id, JSON.stringify(p)); } catch (e) {} return p; });
  };

  return (
    <div
      ref={ref}
      className={"sticker " + (className || "")}
      style={{ left: pos.x, top: pos.y, transform: "rotate(" + (rot || 0) + "deg)" }}
      onPointerDown={onDown}
    >
      {children}
    </div>
  );
}

/* circular cameo crop of a painting */
function Cameo({ src, pos }) {
  return (
    <div className="cameo cameo-st" style={{ width: "100%", height: "100%" }}>
      <img src={src} style={{ objectPosition: pos || "center 22%" }} alt="" draggable="false" />
    </div>
  );
}

/* SVG heart shape */
function HeartSvg({ size, fill }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <path d="M16 28S3 19.6 3 11.4C3 7.3 6.2 4.4 10 4.4c2.4 0 4.6 1.2 6 3.2 1.4-2 3.6-3.2 6-3.2 3.8 0 7 2.9 7 7 0 8.2-13 16.6-13 16.6z"
        fill={fill} stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
    </svg>
  );
}

/* The scattered sticker layer. density: 'low' | 'med' | 'high'. seed picks layout. */
function StickerLayer({ density, paintings }) {
  if (density === "off") return null;
  // Positions hug the far left/right margins so stickers don't sit on top of the
  // centered text, buttons, or the bottom-row controls (login pill, switcher, tweaks).
  const all = [
    { id: "s-heart1", el: <div className="sticker shape" />, render: <HeartSvg size={42} fill="var(--pink)" />, x: 0.03, y: 0.46, rot: -12, kind: "shape" },
    { id: "s-emoji-love", emoji: "😍", x: 0.95, y: 0.12, rot: 10 },
    { id: "s-rose", emoji: "🌹", x: 0.96, y: 0.66, rot: -8 },
    { id: "s-wine", emoji: "🍷", x: 0.03, y: 0.2, rot: 8 },
    { id: "s-flag", emoji: "🚩", x: 0.95, y: 0.4, rot: 6 },
    { id: "s-spark", emoji: "✨", x: 0.1, y: 0.1, rot: -6 },
    { id: "s-coffee", emoji: "☕", x: 0.04, y: 0.64, rot: 12, lvl: "med" },
    { id: "s-cry", emoji: "🥹", x: 0.96, y: 0.52, rot: -10, lvl: "med" },
    { id: "s-kiss", emoji: "💋", x: 0.06, y: 0.32, rot: -14, lvl: "med" },
    { id: "s-cameo1", cameo: paintings.bronzino(360), cpos: "center 30%", x: 0.02, y: 0.78, rot: -6, lvl: "high" },
    { id: "s-cameo2", cameo: paintings.venus(360), cpos: "60% 18%", x: 0.93, y: 0.24, rot: 8, lvl: "high" },
    { id: "s-heart2", el: true, render: <HeartSvg size={28} fill="var(--ember)" />, x: 0.9, y: 0.82, rot: 14, kind: "shape", lvl: "high" }
  ];
  const levels = density === "low" ? ["base"] : density === "med" ? ["base", "med"] : ["base", "med", "high"];
  const show = all.filter((s) => levels.includes(s.lvl ? s.lvl : "base"));

  return (
    <>
      {show.map((s) => (
        <Sticker
          key={s.id}
          id={s.id}
          x={Math.round(s.x * (typeof window !== "undefined" ? window.innerWidth : 1200))}
          y={Math.round(s.y * (typeof window !== "undefined" ? window.innerHeight : 800))}
          rot={s.rot}
          className={s.emoji ? "emoji" : s.cameo ? "cameo-st" : "shape"}
        >
          {s.emoji ? s.emoji : s.cameo ? <Cameo src={s.cameo} pos={s.cpos} /> : s.render}
        </Sticker>
      ))}
    </>
  );
}

/* Custom heart cursor + sparkle trail. Disabled on touch / when off. */
function HeartCursor({ enabled }) {
  const dotRef = useRef(null);
  const lastSpark = useRef(0);
  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    if (!enabled || isTouch) {
      document.body.classList.remove("cursor-on");
      return;
    }
    document.body.classList.add("cursor-on");
    const move = (e) => {
      if (dotRef.current) {
        dotRef.current.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px) translate(-50%,-50%)";
      }
      const now = performance.now();
      if (now - lastSpark.current > 70 && Math.random() > 0.45) {
        lastSpark.current = now;
        spawnSparkle(e.clientX, e.clientY);
      }
    };
    const down = () => dotRef.current && dotRef.current.classList.add("press");
    const up = () => dotRef.current && dotRef.current.classList.remove("press");
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      document.body.classList.remove("cursor-on");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [enabled, isTouch]);

  if (!enabled || isTouch) return null;
  return <div ref={dotRef} className="heart-cursor">💗</div>;
}

function spawnSparkle(x, y) {
  const el = document.createElement("div");
  el.className = "sparkle";
  el.textContent = Math.random() > 0.5 ? "✨" : "💫";
  el.style.left = x + (Math.random() * 16 - 8) + "px";
  el.style.top = y + (Math.random() * 16 - 8) + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 720);
}

Object.assign(window, { Sticker, Cameo, HeartSvg, StickerLayer, HeartCursor });
