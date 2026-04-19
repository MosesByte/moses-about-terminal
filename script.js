const input = document.getElementById("cmd");
const output = document.getElementById("output");

const commands = {
  help: `<strong>about</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;About me<br>
<strong>socials</strong>&nbsp;&nbsp;&nbsp;&nbsp;Social links<br>
<strong>linktree</strong>&nbsp;&nbsp;&nbsp;Main profiles<br>
<strong>clear</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Clear terminal`,

  about: `Hi, ich bin Moses.<br>Willkommen auf meiner Seite.`,

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

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    const raw = input.value.trim();
    const cmd = raw.toLowerCase();

    if (!cmd) return;

    if (cmd === "clear") {
      output.innerHTML = "";
      input.value = "";
      return;
    }

    let res = commands[cmd];

    if (!res) {
      res = "Unknown command";
    }

    print(raw, res);
    input.value = "";
  }
});

document.addEventListener("click", () => input.focus());
window.addEventListener("load", () => input.focus());