const input = document.getElementById("cmd");
const output = document.getElementById("output");


const LASTFM_USER = "Moses762";
const LASTFM_KEY  = " a752fb4d51a7933ef4288d72fa86f087";

const themeMap = ["purple", "red", "blue"];

const fontMap = {
  default:     "Consolas, monospace",
  jetbrains:   "'JetBrains Mono', monospace",
  fira:        "'Fira Code', monospace",
  ibm:         "'IBM Plex Mono', monospace",
  space:       "'Space Mono', monospace",
  inconsolata: "'Inconsolata', monospace",
  source:      "'Source Code Pro', monospace",
};
const fontList = Object.keys(fontMap);

function setFont(font) {
  document.documentElement.style.setProperty("--font-main", fontMap[font]);
  localStorage.setItem("font", font);
  const el = document.getElementById("font-info");
  if (el) el.textContent = font;
}

const themeData = {
  purple: { rgb: "185, 140, 247", hex: "#B98CF7" },
  red:    { rgb: "205, 71, 71",   hex: "#CD4747" },
  blue:     { rgb: "77, 166, 255",  hex: "#4DA6FF" },
};

const commands = {
  help: `<span class="cmd-name">about</span>About me<br>
<span class="cmd-name">socials</span>Social media links<br>
<span class="cmd-name">linktree</span>Link profiles<br>
<span class="cmd-name">theme</span>Change theme<br>
<span class="cmd-name">neofetch</span>System info<br>
<span class="cmd-name">music</span>Now playing<br>
<span class="cmd-name">time</span>Current time<br>
<span class="cmd-name">date</span>Current date<br>
<span class="cmd-name">privacy</span>Privacy policy<br>
<span class="cmd-name">clear</span>Clear terminal`,

  about: `
  
Hi, I’m Moses. <br>
I started with hvh in early 2018, but I haven’t really been active for a while. I still check the forums from time to time though.<br><br>

I’m interested in weapons, linktrees, anime, and games — and every now and then I build small pages like this.<br>

Thanks for stopping by.<br><br>

– moses

`,

  socials: `<strong>guns.lol:</strong> <a href="https://guns.lol/moses" target="_blank" rel="noopener noreferrer">moses</a><br>
    <strong>Instagram:</strong> <a href="https://instagram.com/mosesdercutter" target="_blank" rel="noopener noreferrer">mosesdercutter</a><br>
    <strong>Steam:</strong> <a href="https://steamcommunity.com/id/schwarzepillen" target="_blank" rel="noopener noreferrer">game main</a><br>
    <strong>Steam:</strong> <a href="https://steamcommunity.com/id/Affenfleisch" target="_blank" rel="noopener noreferrer">alt 1</a><br>
    <strong>Steam:</strong> <a href="https://steamcommunity.com/id/BlauePillen" target="_blank" rel="noopener noreferrer">alt 2</a><br>
    <strong>Git:</strong> <a href="https://github.com/MosesByte" target="_blank" rel="noopener noreferrer">mosesbyte</a><br>
  `,

  linktree: `<strong>fakecrime.bio</strong><br>
karlsruhe&nbsp;&nbsp;&nbsp;<a href="https://fakecrime.bio/karlsruhe" target="_blank" rel="noopener noreferrer">fakecrime.bio/karlsruhe</a><br>
cannabis&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://fakecrime.bio/cannabis" target="_blank" rel="noopener noreferrer">fakecrime.bio/cannabis</a><br>
moses76&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://fakecrime.bio/moses76" target="_blank" rel="noopener noreferrer">fakecrime.bio/moses76</a><br><br>
<strong>guns.lol</strong><br>
moses76&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://guns.lol/moses76" target="_blank" rel="noopener noreferrer">guns.lol/moses76</a><br><br>
<strong>ysn.lol</strong><br>
8&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://ysn.lol/8" target="_blank" rel="noopener noreferrer">ysn.lol/8</a><br>
moses&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://ysn.lol/moses" target="_blank" rel="noopener noreferrer">ysn.lol/moses</a><br>
neverlose&nbsp;&nbsp;&nbsp;<a href="https://ysn.lol/neverlose" target="_blank" rel="noopener noreferrer">ysn.lol/neverlose</a><br>
fatality&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://ysn.lol/fatality" target="_blank" rel="noopener noreferrer">ysn.lol/fatality</a>`,

  privacy: `<strong>Privacy Policy</strong><br><br>

We respect your privacy. <br><br>

This website does not collect or store any personal data, including IP addresses.<br>
We do not use tracking tools, analytics services, or cookies.<br><br>

We only maintain a simple, non-identifiable view count to understand general site usage. <br> This counter does not store any personal information and cannot be used to identify visitors.<br><br>

If you have any questions, feel free to reach out.<br>
Hosting: Cloudflare (US). Contact: <a href="mailto:contact@moses.wtf">contact@moses.wtf</a>`
};

const cmdList = ["help","about","socials","linktree","theme","neofetch","music","time","date","privacy","logs","clear"];

const cmdHistory = [];
let historyIndex = -1;
let lastSuggestion = null;
let cmdCount = 0;

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  );
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[a.length][b.length];
}

function setTheme(theme) {
  document.body.classList.remove("theme-purple", "theme-red", "theme-blue");
  document.body.classList.add(`theme-${theme}`);
  localStorage.setItem("theme", theme);
  const data = themeData[theme];
  if (data) {
    document.getElementById("theme-info").textContent = `RGB - ${data.rgb} | HEX - ${data.hex}`;
  }
}

function print(cmd, res) {
  const entry = document.createElement("div");
  entry.className = "output-entry";

  const commandLine = document.createElement("div");
  commandLine.className = "command-line";
  commandLine.textContent = `> ${cmd}`;

  const responseLine = document.createElement("div");
  responseLine.className = "response-line";
  responseLine.innerHTML = res;

  entry.appendChild(commandLine);
  entry.appendChild(responseLine);
  output.appendChild(entry);
  output.scrollTop = output.scrollHeight;
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme && themeMap.includes(savedTheme)) {
  setTheme(savedTheme);
} else {
  setTheme("purple");
}

const savedFont = localStorage.getItem("font");
if (savedFont && fontMap[savedFont]) {
  setFont(savedFont);
}

const allCommands = [...Object.keys(commands), "theme", "neofetch", "music", "time", "date", "clear", "logs", "font", "reset"];
const themeArgs = themeMap;

const ghost = document.getElementById("ghost");
const sizer = document.getElementById("input-sizer");

function getGhostSuffix(val) {
  const parts = val.split(/\s+/);
  if (parts.length === 1 && parts[0]) {
    const partial = parts[0].toLowerCase();
    const matches = allCommands.filter(c => c.startsWith(partial));
    if (matches.length === 1) return matches[0].slice(partial.length);
  } else if (parts.length === 2 && parts[0].toLowerCase() === "theme") {
    const partial = parts[1].toLowerCase();
    const matches = themeArgs.filter(t => t.startsWith(partial));
    if (matches.length === 1) return matches[0].slice(partial.length);
  } else if (parts.length === 2 && parts[0].toLowerCase() === "font") {
    const partial = parts[1].toLowerCase();
    const matches = fontList.filter(f => f.startsWith(partial));
    if (matches.length === 1) return matches[0].slice(partial.length);
  }
  return "";
}

function updateGhost() {
  const val = input.value;
  sizer.textContent = val;
  input.style.width = Math.max(sizer.offsetWidth, 2) + "px";
  ghost.textContent = getGhostSuffix(val);
}

input.addEventListener("input", () => { lastSuggestion = null; updateGhost(); });

input.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    if (!input.value && lastSuggestion) {
      input.value = lastSuggestion;
      lastSuggestion = null;
      updateGhost();
      return;
    }
    const raw = input.value;
    const parts = raw.split(/\s+/);
    if (parts.length === 1) {
      const partial = parts[0].toLowerCase();
      if (!partial) return;
      const matches = allCommands.filter(c => c.startsWith(partial));
      if (matches.length === 1) { input.value = matches[0]; updateGhost(); }
      else if (matches.length > 1) print(raw, matches.join("&nbsp;&nbsp;"));
    } else if (parts.length === 2 && parts[0].toLowerCase() === "theme") {
      const partial = parts[1].toLowerCase();
      const matches = themeArgs.filter(t => t.startsWith(partial));
      if (matches.length === 1) { input.value = `theme ${matches[0]}`; updateGhost(); }
      else if (matches.length > 1) print(raw, matches.join("&nbsp;&nbsp;"));
    } else if (parts.length === 2 && parts[0].toLowerCase() === "font") {
      const partial = parts[1].toLowerCase();
      const matches = fontList.filter(f => f.startsWith(partial));
      if (matches.length === 1) { input.value = `font ${matches[0]}`; updateGhost(); }
      else if (matches.length > 1) print(raw, matches.join("&nbsp;&nbsp;"));
    }
    return;
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (historyIndex < cmdHistory.length - 1) {
      historyIndex++;
      input.value = cmdHistory[cmdHistory.length - 1 - historyIndex];
      updateGhost();
    }
    return;
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      input.value = cmdHistory[cmdHistory.length - 1 - historyIndex];
    } else {
      historyIndex = -1;
      input.value = "";
    }
    updateGhost();
    return;
  }

  if (e.key !== "Enter") return;
  e.preventDefault();

  const raw = input.value.trim();
  const cmdLower = raw.toLowerCase();
  if (!cmdLower) return;

  cmdHistory.push(raw);
  historyIndex = -1;
  ghost.textContent = "";
  input.style.width = "2px";

  if (cmdLower === "clear") {
    output.innerHTML = "";
    cmdCount = 0;
    input.value = "";
    return;
  }

  cmdCount++;
  if (cmdCount > 3) {
    output.innerHTML = "";
    cmdCount = 1;
  }

  const parts = raw.split(/\s+/);
  const base = parts[0].toLowerCase();
  const arg = parts[1] ? parts[1].toLowerCase() : "";

  if (base === "time") {
    print(raw, new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    input.value = "";
    return;
  }

  if (base === "date") {
    print(raw, new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    input.value = "";
    return;
  }

  if (base === "neofetch") {
    const ua = navigator.userAgent;
    const browser =
      ua.includes("Firefox") ? "Firefox" :
      ua.includes("Edg")     ? "Edge" :
      ua.includes("Chrome")  ? "Chrome" :
      ua.includes("Safari")  ? "Safari" : "Unknown";
    const os =
      ua.includes("Windows") ? "Windows" :
      ua.includes("Mac")     ? "macOS" :
      ua.includes("Android") ? "Android" :
      ua.includes("iPhone") || ua.includes("iPad") ? "iOS" :
      ua.includes("Linux")   ? "Linux" : "Unknown";
    const res   = `${screen.width}x${screen.height}`;
    const theme = localStorage.getItem("theme") || "purple";
    const now   = new Date();
    const time  = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const font = localStorage.getItem("font") || "default";
    print(raw,
      `<span class="label">OS</span>       ${os}<br>` +
      `<span class="label">Browser</span>  ${browser}<br>` +
      `<span class="label">Resolution</span> ${res}<br>` +
      `<span class="label">Theme</span>    ${theme}<br>` +
      `<span class="label">Font</span>     ${font}<br>` +
      `<span class="label">Time</span>     ${time}`
    );
    input.value = "";
    return;
  }

  if (base === "music") {
    if (!LASTFM_USER || !LASTFM_KEY) {
      print(raw, "Music not configured. Set LASTFM_USER and LASTFM_KEY in script.js");
      input.value = "";
      return;
    }
    print(raw, "Fetching...");
    fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_KEY}&format=json&limit=1`)
      .then(r => r.json())
      .then(data => {
        const track     = data.recenttracks.track[0];
        const playing   = track["@attr"]?.nowplaying;
        const name      = track.name;
        const artist    = track.artist["#text"];
        const status    = playing ? "▶ Now playing" : "↩ Last played";
        const last = output.lastElementChild;
        if (last) last.querySelector(".response-line").innerHTML =
          `${status}: <strong>${name}</strong> — ${artist}`;
      })
      .catch(() => {
        const last = output.lastElementChild;
        if (last) last.querySelector(".response-line").textContent = "Could not fetch music.";
      });
    input.value = "";
    return;
  }

  if (base === "theme") {
    if (!arg) {
      const curTheme = localStorage.getItem("theme") || "purple";
      const curFont  = localStorage.getItem("font")  || "default";
      const themeOpts = themeMap.map(t => t === curTheme ? `<strong>${t} ✓</strong>` : t).join(" | ");
      const fontOpts  = fontList.map(f => f === curFont  ? `<strong>${f} ✓</strong>` : f).join(" | ");
      print(raw, `Theme: ${themeOpts}<br>Font:&nbsp; ${fontOpts}`);
    } else if (themeMap.includes(arg)) {
      setTheme(arg);
      const fontArg = parts[2] ? parts[2].toLowerCase() : null;
      if (fontArg && fontMap[fontArg]) {
        setFont(fontArg);
        print(raw, `Theme → <strong>${arg}</strong> &nbsp; Font → <strong>${fontArg}</strong>`);
      } else {
        print(raw, `Theme → <strong>${arg}</strong>`);
      }
    } else {
      print(raw, `Unknown theme`);
    }
    input.value = "";
    return;
  }

  if (base === "font") {
    if (!arg) {
      const cur = localStorage.getItem("font") || "default";
      const opts = fontList.map(f => f === cur ? `<strong>${f} ✓</strong>` : f).join(" | ");
      print(raw, `Usage: <strong>font</strong> ${opts}`);
    } else if (fontMap[arg]) {
      setFont(arg);
      print(raw, `Font → <strong>${arg}</strong>`);
    } else {
      print(raw, `Unknown font`);
    }
    input.value = "";
    return;
  }

  if (base === "reset") {
    localStorage.removeItem("theme");
    localStorage.removeItem("font");
    localStorage.removeItem("eggState");
    Object.keys(eggState).forEach(k => delete eggState[k]);
    setTheme("purple");
    setFont("default");
    print(raw, `Settings reset to default.`);
    input.value = "";
    return;
  }

  if (base === "open" && arg === "links") {
    openLinks();
    input.value = "";
    return;
  }

  if (base === "logs") {
    const pw     = parts[1];
    const action = parts[2];
    const target = parts[3];
    if (!pw) {
      print(raw, `Usage: <strong>logs</strong> &lt;password&gt;<br>Usage: <strong>logs</strong> &lt;password&gt; delete &lt;username&gt;`);
      input.value = "";
      return;
    }

    if (action === "delete" && target) {
      print(raw, `Deleting entries from <strong>${target}</strong>...`);
      fetch(`/api/guestbook?key=${encodeURIComponent(pw)}&name=${encodeURIComponent(target)}`, { method: "DELETE" })
        .then(r => { if (r.status === 401) throw new Error("Unauthorized"); return r.json(); })
        .then(d => {
          const last = output.lastElementChild;
          if (last) last.querySelector(".response-line").innerHTML =
            `Removed <strong>${d.removed}</strong> entr${d.removed !== 1 ? "ies" : "y"} from <strong>${target}</strong>`;
        })
        .catch(err => {
          const last = output.lastElementChild;
          if (last) last.querySelector(".response-line").textContent = err.message;
        });
      input.value = "";
      return;
    }

    print(raw, "Fetching logs...");
    fetch(`/api/logs?key=${encodeURIComponent(pw)}`)
      .then(r => {
        if (r.status === 401) throw new Error("Unauthorized");
        return r.text();
      })
      .then(text => {
        const lines = text.split("\n").map(l => l || "&nbsp;").join("<br>");
        const last = output.lastElementChild;
        if (last) last.querySelector(".response-line").innerHTML = lines;
      })
      .catch(err => {
        const last = output.lastElementChild;
        if (last) last.querySelector(".response-line").textContent = err.message;
      });
    input.value = "";
    return;
  }

  if (commands[base]) {
    print(raw, commands[base]);
  } else {
    const closest = allCommands.reduce((best, c) => {
      const d = levenshtein(base, c);
      return d < best.d ? { cmd: c, d } : best;
    }, { cmd: null, d: Infinity });
    if (closest.d <= 2) {
      lastSuggestion = closest.cmd;
      print(raw, `command not found<br>did you mean: <span class="did-you-mean">${closest.cmd}</span>? <span class="tab-hint">(Tab)</span>`);
    } else {
      print(raw, "Unknown command");
    }
  }
  input.value = "";
});

const linksOverlay = document.getElementById("links-overlay");
const terminal     = document.getElementById("terminal");

function openLinks() {
  linksOverlay.classList.add("open");
  terminal.classList.add("dimmed");
  showEasterEgg("linktree");
}

function closeLinks() {
  linksOverlay.classList.remove("open");
  terminal.classList.remove("dimmed");
}

document.getElementById("main-title").addEventListener("click", openLinks);
document.getElementById("links-close").addEventListener("click", closeLinks);
linksOverlay.addEventListener("click", e => { if (e.target === linksOverlay) closeLinks(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeLinks(); });

document.querySelectorAll(".hint-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation();
    input.value = btn.dataset.cmd;
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  });
});

output.addEventListener("click", e => {
  if (e.target.classList.contains("did-you-mean")) {
    input.value = e.target.textContent;
    lastSuggestion = null;
    input.focus();
    updateGhost();
  }
  if (e.target.classList.contains("cmd-name")) {
    input.value = e.target.textContent.trim();
    input.focus();
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  }
});

document.addEventListener("click", () => input.focus());
window.addEventListener("load", () => input.focus());

// ── Guestbook ────────────────────────���─────────────────────────────────────
const gbToggle  = document.getElementById("gb-toggle");
const gbPanel   = document.getElementById("gb-panel");
const gbEntries = document.getElementById("gb-entries");
const gbCount   = document.getElementById("gb-count");
const gbName    = document.getElementById("gb-name");
const gbMessage = document.getElementById("gb-message");
const gbSubmit  = document.getElementById("gb-submit");
let gbOpen = false;

function escapeHtml(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function renderEntries(entries) {
  gbCount.textContent = entries.length ? `${entries.length} signed` : "";
  if (!entries.length) {
    gbEntries.innerHTML = '<div class="gb-empty">no signatures yet — be the first</div>';
    return;
  }
  gbEntries.innerHTML = entries.map(e => {
    const date = new Date(e.ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `<div class="gb-entry">
      <span class="gb-entry-name">${escapeHtml(e.name)}:</span><span class="gb-entry-msg">${escapeHtml(e.message)}</span>
      <span class="gb-entry-date">${date}</span>
    </div>`;
  }).join("");
  gbEntries.scrollTop = gbEntries.scrollHeight;
}

async function fetchEntries() {
  gbEntries.innerHTML = '<div class="gb-loading">loading...</div>';
  try {
    const res  = await fetch("/api/guestbook");
    const data = await res.json();
    renderEntries(data);
  } catch {
    gbEntries.innerHTML = '<div class="gb-empty">could not load entries</div>';
  }
}

function toggleGuestbook() {
  gbOpen = !gbOpen;
  gbPanel.classList.toggle("open", gbOpen);
  gbToggle.classList.toggle("active", gbOpen);
  if (gbOpen) fetchEntries();
}

gbToggle.addEventListener("click", e => {
  e.stopPropagation();
  toggleGuestbook();
});

gbPanel.addEventListener("click", e => e.stopPropagation());

document.addEventListener("click", e => {
  if (gbOpen && !gbPanel.contains(e.target) && !gbToggle.contains(e.target)) {
    gbOpen = false;
    gbPanel.classList.remove("open");
    gbToggle.classList.remove("active");
  }
});

async function submitEntry() {
  const name    = gbName.value.trim();
  const message = gbMessage.value.trim();
  if (!name || !message) return;

  gbSubmit.textContent = "[signing...]";
  gbSubmit.disabled    = true;

  try {
    const res = await fetch("/api/guestbook", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, message })
    });
    if (res.ok) {
      gbName.value    = "";
      gbMessage.value = "";
      await fetchEntries();
    }
  } catch {}

  gbSubmit.textContent = "[sign]";
  gbSubmit.disabled    = false;
}

gbSubmit.addEventListener("click", submitEntry);
gbMessage.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); submitEntry(); } });
gbName.addEventListener("keydown",    e => { if (e.key === "Enter") { e.preventDefault(); gbMessage.focus(); } });

// ── Easter Egg System ──────────────────────────────────────────────────────
const EGG_TOTAL = 2;
const eggState  = JSON.parse(localStorage.getItem("eggState") || "{}");

function markEggFound(id) {
  if (eggState[id]) return false;
  eggState[id] = true;
  localStorage.setItem("eggState", JSON.stringify(eggState));
  return true;
}

function showEasterEgg(id) {
  const isNew = markEggFound(id);
  if (!isNew) return;
  const found = Object.keys(eggState).length;
  const toast = document.getElementById("egg-toast");
  toast.textContent = `[ ${found} / ${EGG_TOTAL} easter eggs found ]`;
  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 4100);
  const sfx = new Audio("/easteregg.mp3");
  sfx.volume = 0.5;
  sfx.play().catch(() => {});
}

// ── Matrix / Minimize ──────────────────────────────────────────────────────
const matrixOverlay = document.getElementById("matrix-overlay");
const matrixCanvas  = document.getElementById("matrix-canvas");
let matrixAnimId = null;
let matrixActive = false;

function getThemeRgb() {
  const theme = localStorage.getItem("theme") || "purple";
  const map = { purple: "185, 140, 247", red: "205, 71, 71", blue: "77, 166, 255" };
  return map[theme] || map.purple;
}

function startMatrix() {
  const ctx = matrixCanvas.getContext("2d");
  matrixCanvas.width  = window.innerWidth;
  matrixCanvas.height = window.innerHeight;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

  const chars = "01▪▫░╔╗╚╝║═◆□■<>[]|-_~?";
  const colW  = 28;
  const cols  = Math.floor(matrixCanvas.width / colW);
  const drops = Array.from({ length: cols }, () => ({
    y:     Math.random() * -120,
    speed: 0.3 + Math.random() * 0.55,
  }));

  function draw() {
    if (!matrixActive) return;
    const rgb = getThemeRgb();
    ctx.fillStyle = "rgba(0, 0, 0, 0.045)";
    ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    ctx.font = "13px Consolas, monospace";

    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      const y = d.y * 18;
      if (y > matrixCanvas.height + 80) { d.y = Math.random() * -120; continue; }
      if (y > 0) {
        ctx.fillStyle = `rgba(${rgb}, ${0.1 + Math.random() * 0.2})`;
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * colW, y);
      }
      d.y += d.speed;
    }
    matrixAnimId = requestAnimationFrame(draw);
  }
  matrixAnimId = requestAnimationFrame(draw);
}

function stopMatrix() {
  if (matrixAnimId) { cancelAnimationFrame(matrixAnimId); matrixAnimId = null; }
}

function minimizeTerminal() {
  matrixActive = true;
  terminal.classList.add("minimized");
  setTimeout(() => {
    matrixOverlay.classList.add("active");
    startMatrix();
  }, 280);
  showEasterEgg("minimize");
}

function restoreTerminal() {
  if (!matrixActive) return;
  matrixActive = false;
  stopMatrix();
  matrixOverlay.classList.remove("active");
  setTimeout(() => {
    terminal.classList.remove("minimized");
    input.focus();
  }, 150);
}

setTimeout(() => {
  document.getElementById("egg-hint").classList.add("visible");
}, 30000);

document.getElementById("egg-hint-close").addEventListener("click", e => {
  e.stopPropagation();
  document.getElementById("egg-hint").classList.remove("visible");
});

document.getElementById("dot-yellow").addEventListener("click", e => {
  e.stopPropagation();
  matrixActive ? restoreTerminal() : minimizeTerminal();
});

matrixOverlay.addEventListener("click", restoreTerminal);

document.addEventListener("keydown", e => {
  if (!matrixActive) return;
  restoreTerminal();
});

fetch("/api/views", { headers: { "X-Log-Consent": "1" } })
  .then(r => r.json())
  .then(d => { document.getElementById("view-count").textContent = d.count; })
  .catch(() => { document.getElementById("view-count").textContent = "N/A"; });
