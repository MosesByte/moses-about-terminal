const input = document.getElementById("cmd");
const output = document.getElementById("output");


const LASTFM_USER = "Moses762";
const LASTFM_KEY  = " a752fb4d51a7933ef4288d72fa86f087";

const themeMap = ["purple", "red", "blue"];

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

  about: `Hi`,

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

const allCommands = [...Object.keys(commands), "theme", "neofetch", "music", "time", "date", "clear", "logs"];
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

    print(raw,
      `<span class="label">OS</span>       ${os}<br>` +
      `<span class="label">Browser</span>  ${browser}<br>` +
      `<span class="label">Resolution</span> ${res}<br>` +
      `<span class="label">Theme</span>    ${theme}<br>` +
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
      const current = localStorage.getItem("theme") || "purple";
      const options = themeMap.map(t => t === current ? `<strong>${t} ✓</strong>` : t).join(" | ");
      print(raw, `Usage: <strong>theme</strong> ${options}`);
    } else if (themeMap.includes(arg)) {
      setTheme(arg);
      print(raw, `Theme changed to <strong>${arg}</strong>`);
    } else {
      print(raw, `Unknown theme`);
    }
    input.value = "";
    return;
  }

  if (base === "logs") {
    const pw = parts[1];
    if (!pw) {
      print(raw, `Usage: <strong>logs</strong> &lt;password&gt;`);
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

fetch("/api/views", { headers: { "X-Log-Consent": "1" } })
  .then(r => r.json())
  .then(d => { document.getElementById("view-count").textContent = d.count; })
  .catch(() => { document.getElementById("view-count").textContent = "N/A"; });
