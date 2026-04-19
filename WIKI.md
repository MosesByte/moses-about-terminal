# moses.wtf — Project Wiki

> **Author:** This wiki was written by [Claude](https://claude.ai) (Anthropic AI).
> Liebe Grüße von Moses 🖤

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Live Demo](#live-demo)
3. [Features](#features)
4. [Command Reference](#command-reference)
5. [Themes](#themes)
6. [File Structure](#file-structure)
7. [Backend & Cloudflare Setup](#backend--cloudflare-setup)
8. [Configuration](#configuration)
9. [Deployment](#deployment)
10. [UX Details](#ux-details)
11. [Mobile Support](#mobile-support)

---

## Project Overview

**moses.wtf** is a personal "about me" website built entirely as an interactive terminal emulator running in the browser. Instead of a traditional portfolio page, visitors interact with a fake shell — typing commands to discover links, socials, system info, and more.

Built with **vanilla HTML, CSS, and JavaScript** — no frameworks, no dependencies.  
Hosted on **Cloudflare Pages** with serverless backend functions for the view counter and IP logging.

---

## Live Demo

[moses.wtf](https://moses.wtf)

---

## Features

### Terminal Shell
- Fully interactive command input with real terminal feel
- **Tab autocomplete** with inline ghost text showing the completion suffix
- **Command history** — navigate with Arrow Up / Arrow Down
- **Typo correction** — typing a misspelled command suggests the closest match (`did you mean: socials?`) with Tab-to-accept
- **Auto-clear** — after 3 commands the output automatically clears to stay clean
- **Clickable help commands** — after running `help`, every listed command is clickable and executes immediately
- **Quick-access hint bar** — persistent clickable command buttons below the input (`[help] [about] [socials] [neofetch] [music] [theme]`)
- Fully **mouse-navigable** — every action can be triggered without the keyboard

### Backend
- **Live view counter** via Cloudflare KV (increments on every visit)
- **IP logging** with country detection via Cloudflare headers (`CF-Connecting-IP`, `CF-IPCountry`)
- **Password-protected admin endpoint** — accessible via the `logs` command

---

## Command Reference

| Command | Description |
|---|---|
| `help` | Lists all available commands |
| `about` | Short info about Moses |
| `socials` | Social media links (Instagram, Steam, GitHub, guns.lol) |
| `linktree` | All profile links (fakecrime.bio, guns.lol, ysn.lol) |
| `theme [name]` | Switch color theme. Without argument, shows current theme with options |
| `neofetch` | Displays system info: OS, browser, resolution, theme, time |
| `music` | Shows currently playing or last played track via Last.fm |
| `time` | Current local time |
| `date` | Current local date |
| `privacy` | Privacy policy |
| `logs <password>` | Admin-only: fetches visit stats, country breakdown, IP log |
| `clear` | Clears the terminal output |

---

## Themes

Switch themes with `theme <name>`. The selected theme persists across page reloads via `localStorage`.

| Theme | Primary Color | Description |
|---|---|---|
| `purple` | `#B98CF7` | Default. Soft violet glow. |
| `red` | `#CD4747` | Warm red accent. |
| `blue` | `#4DA6FF` | Clean neon blue. |

Each theme changes the full color palette including background gradients, borders, text colors, and glow effects via CSS custom properties (`--text-main`, `--text-strong`, `--text-title`, `--bg-glow-1`, etc.).

---

## File Structure

```
moses-about-terminal/
├── index.html                  # Main HTML — terminal layout, hero section, ASCII art
├── style.css                   # All styling — themes, layout, responsive design
├── script.js                   # All terminal logic — commands, autocomplete, history
├── favicon.svg                 # Custom "m" terminal favicon
├── functions/
│   └── api/
│       ├── views.js            # Cloudflare Pages Function — view counter + IP logging
│       └── logs.js             # Cloudflare Pages Function — password-protected log viewer
└── WIKI.md                     # This file
```

---

## Backend & Cloudflare Setup

### View Counter (`/api/views`)

Every page load fires a `GET /api/views` request. The function:
1. Reads and increments the `hits` key in Cloudflare KV
2. Logs the visitor's IP and country under the key `ip:{unixMs}:{country}:{ip}` if the `X-Log-Consent: 1` header is present
3. Returns `{ count: N }` as JSON

### Log Viewer (`/api/logs?key=<password>`)

Authenticated with a secret stored as a Cloudflare Pages environment variable (`LOGS_KEY`). Returns plain text with:
- Total view count
- Number of logged IPs
- Country breakdown sorted by visit count
- Full IP log with timestamps and country names

### KV Namespace

Create a KV namespace named `moses-views` in Cloudflare and bind it as `VIEWS` in the Pages project settings under **Functions → KV namespace bindings**.

### Setting the Log Password

```bash
npx wrangler pages secret put LOGS_KEY --project-name moses-about-terminal
```

---

## Configuration

### Last.fm (music command)

To enable the `music` command, set your credentials at the top of `script.js`:

```js
const LASTFM_USER = "YourUsername";
const LASTFM_KEY  = "your_api_key_here";
```

Get a free API key at [last.fm/api](https://www.last.fm/api).  
Use **Web Scrobbler** (browser extension) to scrobble from YouTube Music, Spotify Web, etc.

---

## Deployment

The site is deployed automatically via **GitHub → Cloudflare Pages**.

1. Push changes to the `main` branch
2. Cloudflare Pages detects the push and rebuilds automatically
3. No build step needed — pure static files + Pages Functions

### Manual deploy steps

```bash
git add .
git commit -m "your message"
git push
```

Cloudflare will pick up the changes within ~30 seconds.

---

## UX Details

### Ghost Text Autocomplete

As you type, a faint suffix appears after the cursor showing the predicted completion. Pressing **Tab** accepts it. Works for commands and `theme <name>` arguments.

### Typo Correction

Uses **Levenshtein distance** (≤ 2 edits) to find the closest matching command. The suggestion is clickable in the output, or press **Tab** with an empty input to fill it.

### Auto-Clear

After every **3 executed commands**, the output area automatically clears. Manual `clear` resets the counter.

### Clickable Help

Running `help` renders each command name as a clickable element. Clicking executes the command immediately and returns focus to the input — fully mouse-navigable.

### Quick-Access Bar

Six persistent buttons sit between the input and the output:
`[help]` `[about]` `[socials]` `[neofetch]` `[music]` `[theme]`

Clicking executes the command directly.

---

## Mobile Support

On screens ≤ 900px:
- The ASCII art hero section (`hero-left`) is hidden
- The layout switches to a single-column flex column
- Font sizes are slightly reduced for readability
- The quick-access hint buttons are slightly larger for easier tapping
- The terminal height expands to fill the full viewport

---

*Wiki authored by Claude (Anthropic) — Liebe Grüße von Moses* 🖤
