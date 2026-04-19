const input = document.getElementById("cmd");
const output = document.getElementById("output");

const commands = {
  help: `about      About me
socials    My links
whoami     Current user
date       Current time
clear      Clear terminal`,

  about: "Ich bin Moses.",
  socials: "guns.lol/moses76",
  whoami: "User: Moses",
  date: () => new Date().toLocaleString("de-DE")
};

function print(cmd, res) {
  output.innerHTML += `
    <div>> ${cmd}</div>
    <div>${res}</div>
  `;
}

input.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    e.preventDefault(); // WICHTIG

    const cmd = input.value.trim();

    if (cmd === "") return;

    if (cmd === "clear") {
      output.innerHTML = "";
    } else {
      let res = commands[cmd];

      if (typeof res === "function") {
        res = res();
      }

      if (!res) res = "Unknown command";

      print(cmd, res);
    }

    input.value = "";
  }
});


// 🔥 DAS IST DER WICHTIGE PART
// sorgt dafür dass du IMMER tippen kannst

document.addEventListener("click", () => input.focus());
window.onload = () => input.focus();