/* helpers.js — image URLs, painting set, and quiz data. Attaches to window. */
(function () {
  // Public-domain paintings via Wikimedia Special:FilePath (verified to load).
  function IMG(file, width) {
    return "https://commons.wikimedia.org/wiki/Special:FilePath/" +
      encodeURIComponent(file) + "?width=" + (width || 1000);
  }
  var FILES = {
    creation: "Michelangelo_-_Creation_of_Adam_(cropped).jpg",
    venus: "Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg",
    primavera: "Botticelli-primavera.jpg",
    klimt: "The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg",
    mona: "Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg",
    bronzino: "Angelo_Bronzino_-_Venus,_Cupid,_Folly_and_Time_-_National_Gallery,_London.jpg",
    hayez: "Francesco_Hayez_008.jpg",
    swing: "Fragonard,_The_Swing.jpg"
  };
  var PAINT = {};
  Object.keys(FILES).forEach(function (k) {
    PAINT[k] = function (w) { return IMG(FILES[k], w); };
  });

  // The four relationship stages. tier gates which traits unlock.
  var STAGES = [
    { id: "firstdate", num: "I",   label: "First Date",  short: "1 date",  tier: 0,
      tag: "The vibe check", blurb: "One coffee in. 10 first-impression traits on the table." },
    { id: "month",     num: "II",  label: "One Month",   short: "1 month", tier: 1,
      tag: "The honeymoon haze", blurb: "Four weeks deep. 13 more traits unlock — character (and chemistry) start showing." },
    { id: "threemonth",num: "III", label: "Three Months",short: "3 months", tier: 2,
      tag: "The mask slips", blurb: "The 90-day trial. The hard stuff — conflict, money, family — is fair game." },
    { id: "year",      num: "IV",  label: "One Year",    short: "1 year",  tier: 2,
      tag: "The full audit", blurb: "A whole trip around the sun. All 28 traits, full weight, no excuses." }
  ];
  var TIER_MAX = { firstdate: 0, month: 1, threemonth: 2, year: 2 };

  // 23 must-have traits. tier gates the stage they unlock at.
  // type drives the interaction. weight defaults to 1 (attraction is half).
  function cards(a, b, c, d) {
    return [
      { label: a[0], note: a[1], score: 4, flag: false },
      { label: b[0], note: b[1], score: 3, flag: false },
      { label: c[0], note: c[1], score: 1, flag: false },
      { label: d[0], note: d[1], score: 0, flag: true }
    ];
  }
  var TRAITS = [
    // ---- Tier 0 · available after the first date ----
    { id: "spark", tier: 0, name: "Intellectual Spark", icon: "🧠", type: "slider",
      prompt: "Could you talk to them for six hours straight?", low: "brain's asleep", high: "six hours, easy" },
    { id: "geo", tier: 0, name: "Location Fit", icon: "📍", type: "cards",
      prompt: "Do your lives actually fit in the same place?",
      options: cards(["Same city, easy", "Logistics solved. Love that."], ["A doable distance", "Annoying, but survivable."],
        ["Different worlds, vibes only", "Cute now. Cancelled dates later."], ["They won't even discuss it", "Avoidance in a trench coat. 🚩"]) },
    { id: "conscious", tier: 0, name: "Tuned-In", icon: "🫶", type: "cards",
      prompt: "How do they treat restaurant staff when nothing's in it for them?",
      options: cards(["A gem to everyone", "How they treat staff = how they'll treat you."], ["Polite enough", "Fine. Keep watching."],
        ["Kind of ignores them", "Hmm. Noted."], ["Actually rude", "That's the whole personality test, failed. 🚩"]) },
    { id: "drive", tier: 0, name: "Drive", icon: "🚀", type: "slider",
      prompt: "Are they chasing something they genuinely love?", low: "pure coast", high: "absolutely on fire" },
    { id: "humble", tier: 0, name: "Humble", icon: "🙇", type: "swipe",
      prompt: "Can they tell a story where they aren't the hero?", yes: "They totally can", no: "Never not the hero" },
    { id: "optimism", tier: 0, name: "Optimism", icon: "☀️", type: "cards",
      prompt: "Something goes sideways — do they solve or sulk?",
      options: cards(["Solves it, calmly", "Green flag energy."], ["Vents, then solves", "Honestly relatable."],
        ["Spirals a little", "You'll be the emotional support human."], ["Makes it YOUR problem", "Their bad day = your job. 🚩"]) },
    { id: "affable", tier: 0, name: "Affable", icon: "🥂", type: "hearts",
      prompt: "Would your closest friends actually like them?", label: "Tap how much your people would adore them" },
    { id: "attractive", tier: 0, name: "Attraction", icon: "🔥", type: "hearts", weight: 0.5,
      prompt: "On a normal, unstyled day — are you into them?", label: "Tap your honest, unstyled attraction (half weight)" },
    { id: "chemistry", tier: 0, name: "Chemistry", icon: "💥", type: "slider",
      prompt: "Real physical chemistry — the kind you feel across a room?", low: "zero spark", high: "electric" },
    { id: "ambition", tier: 0, name: "Ambition", icon: "🎯", type: "slider",
      prompt: "Do they have a real vision for their life — not just vibes?", low: "just drifting", high: "knows exactly where they're headed" },

    // ---- Tier 1 · unlocks ~1 month ----
    { id: "competence", tier: 1, name: "Competence", icon: "✅", type: "slider",
      prompt: "Do they actually finish what they start?", low: "all talk", high: "gets it done" },
    { id: "secure", tier: 1, name: "Secure", icon: "🧷", type: "meter",
      prompt: "How clingy do they get when you go off-grid for a few days?", low: "rock steady", high: "meltdown 🚩" },
    { id: "growth", tier: 1, name: "Growth", icon: "🌱", type: "swipe",
      prompt: "Can they take feedback without going full defense lawyer?", yes: "Takes it well", no: "Objection! Defensive." },
    { id: "generous", tier: 1, name: "Generous", icon: "🎁", type: "slider",
      prompt: "Do they give without keeping a scoreboard?", low: "keeps receipts", high: "gives freely" },
    { id: "mindbody", tier: 1, name: "Mind & Body", icon: "🧗", type: "slider",
      prompt: "Could they keep up on an adventure and handle their own mind?", low: "neither, really", high: "both, sorted" },
    { id: "resilience", tier: 1, name: "Resilience", icon: "🛡️", type: "cards",
      prompt: "Life roughed them up — wiser, or just bitter?",
      options: cards(["Wiser and kinder for it", "That's the good stuff."], ["Still healing, but honest", "Respect."],
        ["Holds a bit of a grudge", "Watch the pattern."], ["Bitter about everything", "Old wounds as weapons. 🚩"]) },
    { id: "depth", tier: 1, name: "Sees Me", icon: "👁️", type: "slider",
      prompt: "Do they see the real you, not just the highlight reel?", low: "the surface", high: "the real me" },
    { id: "prioritizes", tier: 1, name: "Prioritizes Me", icon: "📌", type: "cards",
      prompt: "Do you feel like a priority — or a convenient option?",
      options: cards(["A clear, obvious priority", "As it should be."], ["Most of the time", "Decent."],
        ["Only when convenient", "You deserve more than crumbs."], ["Basically an option", "Babe. No. 🚩"]) },
    { id: "trust", tier: 1, name: "Trust & Integrity", icon: "🔐", type: "meter",
      prompt: "Any 'that doesn't quite add up' flicker you keep ignoring?", low: "no doubts", high: "lies everywhere 🚩" },
    { id: "worldview", tier: 1, name: "Worldview", icon: "🗳️", type: "cards",
      prompt: "On the things you'd never compromise — are you aligned?",
      options: cards(["Scarily aligned", "Easy."], ["Mostly same page", "Workable."],
        ["A few real fault lines", "Have the talk now, not later."], ["Constant cold war", "Exhausting forever. 🚩"]) },
    { id: "intimacy", tier: 1, name: "Intimacy", icon: "🌙", type: "slider",
      prompt: "Once it's just the two of you — how's the chemistry in private?", low: "awkward, honestly", high: "off the charts" },
    { id: "desire", tier: 1, name: "Desire Match", icon: "🌡️", type: "cards",
      prompt: "Do your appetites — how much, how often — actually line up?",
      options: cards(["Perfectly in sync", "Green flag, frankly."], ["Close enough", "Workable."],
        ["There's a real gap", "Name it before it festers."], ["Total mismatch", "This quietly ends relationships. 🚩"]) },
    { id: "achievement", tier: 1, name: "Achievement", icon: "🏆", type: "cards",
      prompt: "Have they actually built something they're genuinely proud of?",
      options: cards(["Yes — real, earned wins", "Backs the talk. Love it."], ["Getting there, steadily", "Promising."],
        ["Mostly potential so far", "Potential isn't a personality."], ["All talk, no receipts", "Ambition that only shows at dinner. 🚩"]) },

    // ---- Tier 2 · unlocks ~3 months ----
    { id: "closerel", tier: 2, name: "Their People", icon: "👯", type: "swipe",
      prompt: "Do they have long-term friends who clearly love them?", yes: "Beloved by their people", no: "No real friends 🚩" },
    { id: "harmony", tier: 2, name: "Harmony", icon: "🕊️", type: "cards",
      prompt: "Your first real fight — conversation or war?",
      options: cards(["Stayed a calm conversation", "Rare and beautiful."], ["Tense, but fair", "Normal. Fine."],
        ["They went ice cold", "Stonewalling is a tax you'll pay forever."], ["Full-blown war", "Home shouldn't be a battlefield. 🚩"]) },
    { id: "repair", tier: 2, name: "Repair", icon: "🤝", type: "swipe",
      prompt: "Can they say a real sorry — no 'but' attached?", yes: "A real, clean sorry", no: "'Sorry, but...' 🚩" },
    { id: "money", tier: 2, name: "Money Values", icon: "💸", type: "slider",
      prompt: "Could you merge a life financially without dread?", low: "pure dread", high: "totally in sync" },
    { id: "lifestyle", tier: 2, name: "Lifestyle Match", icon: "🏡", type: "slider",
      prompt: "A normal Tuesday in five years — does it work for you both?", low: "different planets", high: "same dream Tuesday" }
  ];

  function getQuestions(stage) {
    var max = TIER_MAX[stage] != null ? TIER_MAX[stage] : 0;
    return TRAITS.filter(function (q) { return q.tier <= max; });
  }

  // Result archetypes, chosen by score band.
  var RESULTS = [
    { min: 88, title: "Certified Soulmate", emoji: "💞", verdict: "Soulmate Material",
      copy: "Okay, show-off. This is the disgustingly-in-love, ruin-everyone-else's-standards kind of right. If you sabotage this one out of boredom or fear, that's a YOU problem — don't you dare. Lock it down." },
    { min: 70, title: "The Slow Burn", emoji: "🔥", verdict: "Genuinely Promising",
      copy: "Not fireworks — embers, and embers are how people actually stay warm in February. The bones are good. The only thing that kills this is your own commitment-phobia, so quit waiting for a flaw to justify bailing." },
    { min: 48, title: "The Situationship Survivor", emoji: "🌫️", verdict: "It's... Complicated",
      copy: "Be honest: you already knew it was foggy, you just wanted a second opinion to feel less crazy. There's a real spark in here somewhere, but you're surviving on crumbs and calling it a meal. Define it or free yourself." },
    { min: 25, title: "Cute, But Chaos", emoji: "🎢", verdict: "Proceed With Caution",
      copy: "The chemistry is screaming and so are the red flags — and right now the flags are winning. Fun? Obviously. A future? The data just put its head in its hands. Enjoy the ride, but stop pretending it's a destination." },
    { min: 0,  title: "Red Flag Royalty", emoji: "🚩", verdict: "Babe. Run.",
      copy: "We say this with so much love: this is not a person, it's a cautionary tale you're volunteering for. You already know. Block, breathe, delete the thread, and go be someone else's green flag. Future-you is begging." }
  ];

  // ---- Combination analysis: read the relationships BETWEEN trait groups,
  // not just the overall average. Each theme averages its answered traits. ----
  var THEMES = {
    attraction:  { label: "Attraction",  ids: ["attractive", "chemistry", "intimacy", "desire"] },
    ambition:    { label: "Drive",       ids: ["drive", "ambition", "competence", "achievement"] },
    character:   { label: "Character",   ids: ["conscious", "humble", "optimism", "growth", "resilience", "trust", "repair"] },
    partnership: { label: "Partnership", ids: ["spark", "geo", "affable", "secure", "generous", "mindbody", "depth", "prioritizes", "worldview", "closerel", "harmony", "money", "lifestyle"] }
  };

  function themeScores(data) {
    var byId = {};
    (data || []).forEach(function (d) { byId[d.id] = d.s; });
    var out = { _byId: byId };
    Object.keys(THEMES).forEach(function (k) {
      var vals = THEMES[k].ids.map(function (id) { return byId[id]; }).filter(function (v) { return v != null; });
      out[k] = vals.length ? Math.round(vals.reduce(function (a, b) { return a + b; }, 0) / vals.length) : null;
    });
    return out;
  }

  // Returns up to 3 tailored takeaways based on how the themes relate to each other.
  function comboInsights(data) {
    if (!data || !data.length) return [];
    var T = themeScores(data), byId = T._byId;
    var A = T.attraction, Am = T.ambition, C = T.character, P = T.partnership;
    var HI = 68, LO = 45, out = [];
    function add(tag, text) { out.push({ tag: tag, text: text }); }

    if (byId.trust != null && byId.trust < 38) {
      add("The trust problem", "Forget the average — the trust number IS the verdict. Everything else can be a 10, but if you're quietly fact-checking them, that's not a relationship, it's surveillance. This is the one you don't 'work on,' you walk on.");
    }
    if (A != null && C != null) {
      if (A >= HI && C < LO) add("Chemistry vs. character", "The attraction is doing Olympic-level heavy lifting here. You're magnetised to someone your gut doesn't fully trust — thrilling, sure, but that's a fantastic trailer for a genuinely bad movie.");
      else if (C >= HI && A < LO) add("Catch on paper", "On paper, a real catch — kind, steady, the type your friends nod approvingly at. But you're rating the résumé, not the romance. Forcing a spark that won't catch is just the scenic route to a great friendship.");
    }
    if (Am != null && P != null) {
      if (Am >= HI && P < LO) add("Empire, no 'us'", "All engine, no passenger seat. They're building something huge and you're currently a line item in the budget. Make sure the life they're sprinting toward actually has a chair with your name on it.");
      else if (P >= HI && Am < LO) add("Cozy but coasting", "Warm, present, easy to be around — and going precisely nowhere, fast. Lovely for now; just be honest about whether 'comfortable' is your forever or your settling.");
    }
    if (A != null && Am != null && A >= HI && Am >= HI && out.length < 3) {
      add("Magnetic and motivated", "Unreal highlight reel — the chemistry crackles and the drive is real. The only open question is whether they show up on a boring, unglamorous Tuesday, not just the big nights out.");
    }
    var present = [A, Am, C, P].filter(function (v) { return v != null; });
    if (present.length >= 3) {
      var mn = Math.min.apply(null, present), mx = Math.max.apply(null, present);
      if (out.length === 0 && mn >= HI) add("No notes", "Annoyingly, the data just shrugs and says 'yeah, this one's good.' Attraction, drive, character, partnership — all lit. The rare clean sweep. Try very hard not to self-sabotage it.");
      else if (out.length === 0 && mx < LO) add("Quietly not working", "There's no single villain here — it's just softly not landing across the board. That flatness is actually the clearest answer you'll get all day. Believe it.");
      else if (mx - mn >= 32 && out.length < 3) add("Two different people", "Huge spread. They're spectacular at some things and a real liability at others — you're not confused, you're just averaging two very different partners into one hopeful number.");
    }
    if (out.length === 0) {
      add("Steady, unspectacular", "No screaming strengths, no blaring alarms — a solid, slightly beige middle. Fine is fine. Just make sure you're choosing this, not defaulting to it because leaving sounds like effort.");
    }
    return out.slice(0, 3);
  }

  Object.assign(window, { IMG: IMG, PAINT: PAINT, STAGES: STAGES, TRAITS: TRAITS, getQuestions: getQuestions, RESULTS: RESULTS, THEMES: THEMES, themeScores: themeScores, comboInsights: comboInsights });
})();
