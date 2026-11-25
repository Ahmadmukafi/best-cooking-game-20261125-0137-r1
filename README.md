# DAPUR RUSH — Warung Kecil, Pesanan Besar

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/c/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Ahmadmukafi/best-cooking-game-20261125-0137-r1/rank.svg)](https://make.fun/c/best-cooking-game-20261125-0137/leaderboard)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Ahmadmukafi/best-cooking-game-20261125-0137-r1/reward.svg)](https://make.fun/c/best-cooking-game-20261125-0137)

A small Indonesian warung kitchen game for make.fun's **best-cooking-game-20261125-0137**:
orders land on the board, you chop, cook and plate four warung dishes — Nasi Goreng, Mie
Ayam, Es Teh Manis, Sate Ayam — and serve them before their tickets expire. Three-minute
shifts, combos for on-time serves, and a rush that grows as the shift goes on.

- **Play:** open `game/index.html` in desktop Chrome (no network, no build step).
  Click a station to prep an ingredient, click it again to pick it up, click the plate to
  add it, then **SAJIKAN** (or Space) when the plate matches a ticket. Keys `1–0`, `-`, `=`
  pick stations, `Backspace` clears the plate, `P` pauses.
- **Files:** `game/src/` is split by job — `config.js` (tuning/recipes), `world.js`
  (tickets, stations, scoring), `render.js` (all canvas art), `input.js`, `audio.js`
  (synthesized WebAudio), `shots.js` (deterministic screenshot scenes), `main.js` (loop).
- **Screenshots:** real renders of the running game (`?shot=cover|rush|serve|end&seed=7`).
