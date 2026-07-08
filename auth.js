// ═══════════════════════════════════════════════
//  BehaviorAuth — Behavioral Authentication Engine
//  Tracks: Keystrokes · Mouse Movements · Login Time
// ═══════════════════════════════════════════════

const STORAGE_KEY    = 'behaviorAuth_v3';
const THRESHOLD      = 0.60;
const USERNAME_REGEX = /^[a-zA-Z0-9]+$/;   // only letters + digits allowed

let keystrokeData = [];
let mouseData     = [];
let sessionStart  = Date.now();
let ksCount       = 0;
let msCount       = 0;
let timerInterval = null;

// ── Boot ─────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  attachKeyListeners();
  attachMouseListeners();
  startTimer();
});

// ═══════════════════════════════════════════════
//  USERNAME VALIDATION
//  Rules: letters (a-z A-Z) and digits (0-9) only
//         minimum 3 chars · maximum 20 chars
// ═══════════════════════════════════════════════
function validateUsername(input) {
  const val     = input.value;
  const wrap    = document.getElementById('usernameWrap');
  const status  = document.getElementById('usernameStatus');
  const hint    = document.getElementById('usernameHint');

  // Strip any invalid character the moment it is typed
  const cleaned = val.replace(/[^a-zA-Z0-9]/g, '');
  if (val !== cleaned) {
    input.value = cleaned;        // remove the bad character
    triggerFieldShake(input);     // shake the field as feedback
  }

  const len = cleaned.length;

  if (len === 0) {
    setFieldState(input, status, hint, 'neutral', '', '');
  } else if (len < 3) {
    setFieldState(input, status, hint, 'err', '\u2715', 'Too short — min 3 characters (' + len + '/20)');
  } else {
    setFieldState(input, status, hint, 'ok', '\u2713', 'Valid username (' + len + '/20)');
  }
}

function setFieldState(input, status, hint, state, icon, msg) {
  input.classList.remove('input-ok', 'input-err');
  status.classList.remove('ok', 'err', 'visible');
  hint.classList.remove('hint-ok', 'hint-err', 'hint-neu');

  if (state === 'ok') {
    input.classList.add('input-ok');
    status.classList.add('ok', 'visible');
    hint.classList.add('hint-ok');
  } else if (state === 'err') {
    input.classList.add('input-err');
    status.classList.add('err', 'visible');
    hint.classList.add('hint-err');
  } else {
    hint.classList.add('hint-neu');
  }
  status.textContent = icon;
  hint.textContent   = msg;
}

function triggerFieldShake(input) {
  input.classList.remove('shake-field');
  void input.offsetWidth;                     // force reflow to restart animation
  input.classList.add('shake-field');
  setTimeout(() => input.classList.remove('shake-field'), 400);
}

function isUsernameValid() {
  const val = document.getElementById('username').value.trim();
  return val.length >= 3 && USERNAME_REGEX.test(val);
}

// ═══════════════════════════════════════════════
//  KEYSTROKE TRACKING
// ═══════════════════════════════════════════════
function attachKeyListeners() {
  let lastDown = null;
  document.addEventListener('keydown', e => {
    if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    keystrokeData.push({ key: e.key, down: Date.now(), flight: lastDown ? Date.now() - lastDown : 0 });
    lastDown = Date.now();
    ksCount++;
    document.getElementById('ksCount').textContent = ksCount;
  });
  document.addEventListener('keyup', e => {
    if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    const entry = [...keystrokeData].reverse().find(k => k.key === e.key && !k.dwell);
    if (entry) entry.dwell = Date.now() - entry.down;
  });
}

// ═══════════════════════════════════════════════
//  MOUSE TRACKING
// ═══════════════════════════════════════════════
function attachMouseListeners() {
  let lastPos = null, lastT = null;
  document.addEventListener('mousemove', e => {
    const now = Date.now();
    let vx = 0, vy = 0;
    if (lastPos) {
      const dt = Math.max(now - lastT, 1);
      vx = (e.clientX - lastPos.x) / dt;
      vy = (e.clientY - lastPos.y) / dt;
    }
    mouseData.push({ x: e.clientX, y: e.clientY, vx, vy });
    lastPos = { x: e.clientX, y: e.clientY };
    lastT   = now;
    msCount++;
    document.getElementById('msCount').textContent = msCount;
  });
  document.addEventListener('click', e => {
    mouseData.push({ x: e.clientX, y: e.clientY, click: true });
  });
}

// ═══════════════════════════════════════════════
//  SESSION TIMER
// ═══════════════════════════════════════════════
function startTimer() {
  timerInterval = setInterval(() => {
    const s = Math.floor((Date.now() - sessionStart) / 1000);
    document.getElementById('tmVal').textContent = s + 's';
  }, 500);
}

// ═══════════════════════════════════════════════
//  PROFILE BUILDER
// ═══════════════════════════════════════════════
function buildProfile() {
  const dwells  = keystrokeData.filter(k => k.dwell).map(k => k.dwell);
  const flights = keystrokeData.filter(k => k.flight > 0).map(k => k.flight);
  const vxArr   = mouseData.filter(m => !m.click).map(m => Math.abs(m.vx));
  const vyArr   = mouseData.filter(m => !m.click).map(m => Math.abs(m.vy));
  return {
    avgDwell:       avg(dwells),
    avgFlight:      avg(flights),
    keystrokeCount: keystrokeData.length,
    avgVX:          avg(vxArr),
    avgVY:          avg(vyArr),
    mouseCount:     mouseData.length,
    clickCount:     mouseData.filter(m => m.click).length,
    loginHour:      new Date().getHours(),
    sessionMs:      Date.now() - sessionStart,
  };
}

// ═══════════════════════════════════════════════
//  SIMILARITY ENGINE
// ═══════════════════════════════════════════════
function similarity(p1, p2) {
  const features = [
    { key: 'avgDwell',       weight: 0.25, range: 250   },
    { key: 'avgFlight',      weight: 0.20, range: 500   },
    { key: 'keystrokeCount', weight: 0.10, range: 60    },
    { key: 'avgVX',          weight: 0.15, range: 2     },
    { key: 'avgVY',          weight: 0.10, range: 2     },
    { key: 'mouseCount',     weight: 0.08, range: 300   },
    { key: 'loginHour',      weight: 0.07, range: 12    },
    { key: 'sessionMs',      weight: 0.05, range: 30000 },
  ];
  let ws = 0, wt = 0;
  features.forEach(f => {
    const diff = Math.abs((p1[f.key] || 0) - (p2[f.key] || 0)) / f.range;
    ws += Math.max(0, 1 - diff) * f.weight;
    wt += f.weight;
  });
  return ws / wt;
}

// ═══════════════════════════════════════════════
//  LOGIN HANDLER
// ═══════════════════════════════════════════════
function handleLogin() {
  const userInput = document.getElementById('username');
  const user      = userInput.value.trim();
  const pass      = document.getElementById('password').value.trim();

  // ── Validate username first ──────────────────
  if (!user) {
    triggerFieldShake(userInput);
    setFieldState(userInput,
      document.getElementById('usernameStatus'),
      document.getElementById('usernameHint'),
      'err', '\u2715', 'Username cannot be empty');
    return;
  }
  if (!isUsernameValid()) {
    triggerFieldShake(userInput);
    setFieldState(userInput,
      document.getElementById('usernameStatus'),
      document.getElementById('usernameHint'),
      'err', '\u2715', 'Only letters and numbers allowed, min 3 chars');
    return;
  }
  if (!pass) {
    shakeCard();
    return;
  }

  const stored  = getStored(user);
  const current = buildProfile();
  clearInterval(timerInterval);

  if (!stored) {
    save(user, pass, current);
    showResult({ type: 'enroll', title: 'Profile Enrolled',
      sub: 'Behavioral fingerprint saved. Log in again to verify your identity.',
      score: null });
  } else {
    if (stored.password !== pass) {
      showResult({ type: 'denied', title: 'Wrong Password',
        sub: 'The password entered does not match our records.',
        score: 0 });
      return;
    }
    const score   = similarity(stored.profile, current);
    const granted = score >= THRESHOLD;
    showResult({
      type:  granted ? 'success' : 'denied',
      title: granted ? 'Access Granted' : 'Access Denied',
      sub:   granted
        ? 'Behavioral pattern matched with ' + pct(score) + '% similarity.'
        : 'Pattern mismatch — similarity ' + pct(score) + '%, threshold ' + pct(THRESHOLD) + '%.',
      score,
    });
  }
}

// ═══════════════════════════════════════════════
//  UI HELPERS
// ═══════════════════════════════════════════════
function showResult({ type, title, sub, score }) {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('resultScreen').classList.remove('hidden');

  const rc   = document.getElementById('resultCard');
  const glow = document.getElementById('resultGlow');
  rc.className = 'glass-card result-card';

  const icons  = { success: '\u2713', denied: '\u2715', enroll: '\u25CE' };
  const colors = {
    success: { emoji: '#00d4aa', glow: 'glow-success', title: '#00d4aa', bar: 'linear-gradient(90deg,#00d4aa,#3b82f6)' },
    denied:  { emoji: '#ff6b6b', glow: 'glow-denied',  title: '#ff6b6b', bar: 'linear-gradient(90deg,#ff6b6b,#f97316)' },
    enroll:  { emoji: '#a855f7', glow: 'glow-enroll',  title: '#a855f7', bar: 'linear-gradient(90deg,#a855f7,#3b82f6)' },
  };
  const c = colors[type];

  document.getElementById('resultEmoji').textContent  = icons[type];
  document.getElementById('resultEmoji').style.color  = c.emoji;
  document.getElementById('resultTitle').textContent  = title;
  document.getElementById('resultTitle').style.color  = c.title;
  document.getElementById('resultSub').textContent    = sub;
  glow.className = 'result-glow ' + c.glow;

  const ss = document.getElementById('scoreSection');
  if (score !== null && score !== undefined) {
    ss.style.display = 'block';
    document.getElementById('scorePct').textContent = pct(score) + '%';
    document.getElementById('scorePct').style.color = c.emoji;
    const fill = document.getElementById('scoreFill');
    fill.style.background = c.bar;
    setTimeout(() => fill.style.width = pct(score) + '%', 100);
  } else {
    ss.style.display = 'none';
  }
}

function resetAll() {
  document.getElementById('resultScreen').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';

  // Reset validation state
  const ui = document.getElementById('username');
  ui.classList.remove('input-ok', 'input-err');
  document.getElementById('usernameStatus').textContent = '';
  document.getElementById('usernameStatus').classList.remove('ok', 'err', 'visible');
  document.getElementById('usernameHint').textContent = '';

  keystrokeData = []; mouseData = [];
  ksCount = 0; msCount = 0;
  sessionStart = Date.now();
  document.getElementById('ksCount').textContent   = '0';
  document.getElementById('msCount').textContent   = '0';
  document.getElementById('tmVal').textContent     = '0s';
  document.getElementById('scoreFill').style.width = '0';
  startTimer();
}

function shakeCard() {
  const card = document.querySelector('.glass-card');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = 'shake 0.4s ease';
  setTimeout(() => card.style.animation = '', 400);
}

function togglePass() {
  const inp = document.getElementById('password');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

// ── Storage & Utils ───────────────────────────
function getStored(user) {
  return (JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'))[user] || null;
}
function save(user, password, profile) {
  const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  d[user] = { password, profile };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}
function avg(arr) { return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0; }
function pct(v)   { return Math.round(v * 100); }

// Inject keyframe animations
const s = document.createElement('style');
s.textContent = `
  @keyframes shake {
    0%,100%{transform:translateX(0)}
    20%{transform:translateX(-9px)}
    40%{transform:translateX(9px)}
    60%{transform:translateX(-5px)}
    80%{transform:translateX(5px)}
  }
`;
document.head.appendChild(s);