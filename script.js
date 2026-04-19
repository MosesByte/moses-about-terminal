const input = document.getElementById("cmd");
const output = document.getElementById("output");

const commands = {
  help: `about      About me
socials    Links
whoami     User info
date       Time
clear      Clear terminal`,
  about: "Ich bin Moses.",
  socials: "guns.lol/moses76",
  whoami: "User: Moses",
  date: () => new Date().toLocaleString("de-DE")
};

function print(cmd, res) {
  const entry = document.createElement("div");
  entry.className = "output-entry";

  const commandLine = document.createElement("div");
  commandLine.className = "command-line";
  commandLine.textContent = `> ${cmd}`;

  const responseLine = document.createElement("div");
  responseLine.className = "response-line";
  responseLine.textContent = res;

  entry.appendChild(commandLine);
  entry.appendChild(responseLine);
  output.appendChild(entry);

  output.scrollTop = output.scrollHeight;
}

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    const cmd = input.value.trim();
    if (!cmd) return;

    if (cmd.toLowerCase() === "clear") {
      output.innerHTML = "";
    } else {
      let res = commands[cmd.toLowerCase()];

      if (typeof res === "function") {
        res = res();
      }

      if (!res) {
        res = "Unknown command";
      }

      print(cmd, res);
    }

    input.value = "";
  }
});

document.addEventListener("click", () => input.focus());
window.addEventListener("load", () => input.focus());