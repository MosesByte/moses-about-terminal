const input = document.getElementById("cmd");
const output = document.getElementById("output");

const themeMap = ["purple", "red", "blue"];

const themeData = {
  purple: {
    rgb: "185, 140, 247",
    hex: "#B98CF7"
  },
  red: {
    rgb: "205, 71, 71",
    hex: "#CD4747"
  },
  blue: {
    rgb: "77, 166, 255",
    hex: "#4DA6FF"
  }
};

const commands = {
  help: `<span class="cmd-name">about</span>About me<br>
<span class="cmd-name">socials</span>social media links<br>
<span class="cmd-name">linktree</span>some linktree´s<br>
<span class="cmd-name">theme</span>change theme<br>
<span class="cmd-name">clear</span>clear terminal`,

  about: `Hi`,

  socials: `<strong>guns.lol:</strong> <a href="https://guns.lol/moses76" target="_blank" rel="noopener noreferrer">moses76</a><br>
<strong>fakecrime.bio:</strong> <a href="https://fakecrime.bio/moses76" target="_blank" rel="noopener noreferrer">moses76</a><br>
<strong>ysn.lol:</strong> <a href="https://ysn.lol/moses" target="_blank" rel="noopener noreferrer">moses</a>`,

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
fatality&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://ysn.lol/fatality" target="_blank" rel="noopener noreferrer">ysn.lol/fatality</a>`
};

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

input.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  e.preventDefault();

  const raw = input.value.trim();
  const cmdLower = raw.toLowerCase();

  if (!cmdLower) return;

  if (cmdLower === "clear") {
    output.innerHTML = "";
    input.value = "";
    return;
  }

  const parts = raw.split(/\s+/);
  const base = parts[0].toLowerCase();
  const arg = parts[1] ? parts[1].toLowerCase() : "";

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

  const res = commands[base] || "Unknown command";
  print(raw, res);
  input.value = "";
});

document.addEventListener("click", () => input.focus());
window.addEventListener("load", () => input.focus());

fetch("/api/views")
  .then(r => r.json())
  .then(d => { document.getElementById("view-count").textContent = d.count; })
  .catch(() => { document.getElementById("view-count").textContent = "N/A"; });
