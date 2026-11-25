// The kitchen itself: tickets, stations, the hand, the plate, the score. No drawing here and
// no input handling — the loop feeds it fixed steps and resolved clicks, and it answers with
// event flags the loop turns into sounds and announcements.

import {
  EXPIRE_PENALTY,
  INGREDIENTS,
  ING_BY_ID,
  LEVELS,
  MAX_STRIKES,
  PLATE,
  PREP_CHOP,
  PREP_COOK,
  RECIPES,
  SCORE_BASE,
  SCORE_TIP_MAX,
  SHIFT_SECONDS,
  SPOIL_SECONDS,
  STATION,
  STEP,
} from './config.js';

export const EVENT_NONE = 0;
export const EVENT_CLICK = 1;
export const EVENT_CHOP = 2;
export const EVENT_COOK = 4;
export const EVENT_READY = 8;
export const EVENT_SERVE = 16;
export const EVENT_EXPIRE = 32;
export const EVENT_SPOIL = 64;
export const EVENT_OVER = 128;

/** The rectangles of the twelve station tiles, in ingredient order. */
export function stationRects() {
  return INGREDIENTS.map((ing, index) => {
    const col = index % STATION.cols;
    const row = Math.floor(index / STATION.cols);
    return {
      id: ing.id,
      x: STATION.x0 + col * (STATION.w + STATION.gapX),
      y: STATION.y0 + row * (STATION.h + STATION.gapY),
      w: STATION.w,
      h: STATION.h,
    };
  });
}

/** True when the plate holds exactly the ingredients of `recipe`, in any order. */
function plateMatches(plate, recipe) {
  if (plate.length !== recipe.ings.length) return false;
  return recipe.ings.every((id) => plate.includes(id));
}

export function createWorld(random) {
  const state = {
    elapsed: 0,
    shiftLeft: SHIFT_SECONDS,
    score: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    strikes: 0,
    tickets: [],
    stations: [],
    hand: null,
    plate: [],
    floaters: [],
    particles: [],
    shake: 0,
    over: false,
    overReason: '',
    spawnT: 2,
    nextTicket: 1,
  };

  function level() {
    for (let index = 0; index < LEVELS.length; index += 1) {
      if (state.elapsed < LEVELS[index].until) return LEVELS[index];
    }
    return LEVELS[LEVELS.length - 1];
  }

  function levelNumber() {
    for (let index = 0; index < LEVELS.length; index += 1) {
      if (state.elapsed < LEVELS[index].until) return index + 1;
    }
    return LEVELS.length;
  }

  function addFloater(x, y, text, color) {
    state.floaters.push({ x, y, text, color, t: 0, life: 1.3 });
    if (state.floaters.length > 12) state.floaters.shift();
  }

  function addSteam(x, y) {
    state.particles.push({
      x: x + (random.next() - 0.5) * 30,
      y,
      vx: (random.next() - 0.5) * 8,
      vy: -22 - random.next() * 14,
      t: 0,
      life: 0.9,
      color: 'rgba(255,255,255,0.55)',
      size: 5 + random.next() * 5,
    });
  }

  function spawnTicket(forceRecipe) {
    const cfg = level();
    // Prefer a dish that is not already on the board, so the tickets read as different
    // routes; only repeat when every recipe is already waiting.
    const onBoard = new Set(state.tickets.map((ticket) => ticket.recipe.id));
    const fresh = RECIPES.filter((recipe) => !onBoard.has(recipe.id));
    const recipe = forceRecipe ?? (fresh.length > 0 ? random.pick(fresh) : random.pick(RECIPES));
    state.tickets.push({
      uid: state.nextTicket,
      recipe,
      left: cfg.ticketSeconds,
      total: cfg.ticketSeconds,
    });
    state.nextTicket += 1;
  }

  function reset() {
    state.elapsed = 0;
    state.shiftLeft = SHIFT_SECONDS;
    state.score = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.served = 0;
    state.strikes = 0;
    state.tickets = [];
    state.stations = INGREDIENTS.map((ing) => ({ id: ing.id, state: 'idle', t: 0, dur: ing.prepTime, spoil: 0 }));
    state.hand = null;
    state.plate = [];
    state.floaters = [];
    state.particles = [];
    state.shake = 0;
    state.over = false;
    state.overReason = '';
    state.spawnT = 2;
    state.nextTicket = 1;
  }

  /** One resolved click: a station tile, the plate, the serve button or the trash. */
  function act(action) {
    let events = EVENT_NONE;
    if (state.over) return events;
    if (action.type === 'station') {
      const ing = ING_BY_ID[action.id];
      const station = state.stations.find((item) => item.id === action.id);
      if (!station) return events;
      if (station.state === 'idle') {
        station.state = 'working';
        station.t = 0;
        station.dur = ing.prepTime;
        events |= ing.prep === PREP_CHOP ? EVENT_CHOP : ing.prep === PREP_COOK ? EVENT_COOK : EVENT_CLICK;
        if (ing.prep === PREP_CHOP) addSteam(stationRectOf(action.id).x + 64, stationRectOf(action.id).y + 10);
      } else if (station.state === 'ready') {
        if (state.hand) {
          addFloater(PLATE.x, PLATE.y - 70, 'Tangan penuh!', '#c0392b');
        } else {
          state.hand = action.id;
          station.state = 'idle';
          station.spoil = 0;
          events |= EVENT_CLICK;
        }
      }
    } else if (action.type === 'plate') {
      if (!state.hand) return events;
      if (state.plate.includes(state.hand)) {
        addFloater(PLATE.x, PLATE.y - 70, 'Sudah ada!', '#c0392b');
      } else if (state.plate.length >= 4) {
        addFloater(PLATE.x, PLATE.y - 70, 'Piring penuh!', '#c0392b');
      } else {
        state.plate.push(state.hand);
        state.hand = null;
        events |= EVENT_CLICK;
      }
    } else if (action.type === 'serve') {
      const match = state.tickets.find((ticket) => plateMatches(state.plate, ticket.recipe));
      if (match && state.plate.length > 0) {
        const tip = Math.round(SCORE_TIP_MAX * (match.left / match.total));
        const mult = 1 + 0.1 * Math.min(state.combo, 10);
        const points = Math.round((SCORE_BASE + tip) * mult);
        state.score += points;
        state.combo += 1;
        state.bestCombo = Math.max(state.bestCombo, state.combo);
        state.served += 1;
        state.tickets = state.tickets.filter((ticket) => ticket.uid !== match.uid);
        state.plate = [];
        addFloater(PLATE.x, PLATE.y - 80, `+${points}`, '#3f9e4d');
        if (state.combo >= 2) addFloater(PLATE.x + 170, PLATE.y - 110, `KOMBO x${state.combo}!`, '#e2725b');
        events |= EVENT_SERVE;
      } else if (state.plate.length > 0) {
        addFloater(PLATE.x, PLATE.y - 80, 'Bukan pesanan!', '#c0392b');
        state.shake = 0.25;
        events |= EVENT_CLICK;
      }
    } else if (action.type === 'trash') {
      if (state.plate.length > 0) {
        state.plate = [];
        addFloater(PLATE.x, PLATE.y - 80, 'Dibuang', '#7a6a55');
        events |= EVENT_CLICK;
      }
    }
    return events;
  }

  function stationRectOf(id) {
    return stationRects().find((rect) => rect.id === id);
  }

  /** Advance the kitchen by one fixed step. `actions` are the resolved clicks this step. */
  function step(dt, actions) {
    let events = EVENT_NONE;
    if (state.over) return events;
    for (const action of actions) events |= act(action);

    state.elapsed += dt;
    state.shiftLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);

    // Tickets: spawn on schedule, count down, expire.
    const cfg = level();
    state.spawnT -= dt;
    if (state.spawnT <= 0 && state.tickets.length < cfg.maxTickets) {
      spawnTicket();
      state.spawnT = cfg.spawnSeconds * (0.9 + random.next() * 0.2);
    }
    for (let index = state.tickets.length - 1; index >= 0; index -= 1) {
      const ticket = state.tickets[index];
      ticket.left -= dt;
      if (ticket.left <= 0) {
        state.tickets.splice(index, 1);
        state.strikes += 1;
        state.combo = 0;
        state.score = Math.max(0, state.score - EXPIRE_PENALTY);
        addFloater(640, 215, 'Pesanan hangus!', '#c0392b');
        events |= EVENT_EXPIRE;
        if (state.strikes >= MAX_STRIKES) {
          state.over = true;
          state.overReason = 'strikes';
          events |= EVENT_OVER;
          return events;
        }
      }
    }

    // Stations: prep progresses, ready ones spoil, steam rises.
    for (const station of state.stations) {
      if (station.state === 'working') {
        station.t += dt;
        const ing = ING_BY_ID[station.id];
        if (ing.prep === PREP_COOK && random.next() < dt * 6) {
          const rect = stationRectOf(station.id);
          addSteam(rect.x + rect.w / 2, rect.y + 8);
        }
        if (station.t >= station.dur) {
          station.state = 'ready';
          station.spoil = SPOIL_SECONDS;
          events |= EVENT_READY;
        }
      } else if (station.state === 'ready') {
        station.spoil -= dt;
        if (station.spoil <= 0) {
          station.state = 'idle';
          const rect = stationRectOf(station.id);
          addFloater(rect.x + rect.w / 2, rect.y - 6, 'Hangus!', '#c0392b');
          events |= EVENT_SPOIL;
        }
      }
    }

    for (let index = state.floaters.length - 1; index >= 0; index -= 1) {
      state.floaters[index].t += dt;
      if (state.floaters[index].t > state.floaters[index].life) state.floaters.splice(index, 1);
    }
    for (let index = state.particles.length - 1; index >= 0; index -= 1) {
      const particle = state.particles[index];
      particle.t += dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      if (particle.t > particle.life) state.particles.splice(index, 1);
    }

    if (state.elapsed >= SHIFT_SECONDS) {
      state.over = true;
      state.overReason = 'shift';
      events |= EVENT_OVER;
    }
    return events;
  }

  reset();

  return {
    state,
    step,
    act,
    reset,
    level,
    levelNumber,
    stationRects,
    spawnTicket,
    /** For screenshots: jump the clock (rush level) without playing through it. */
    setElapsed(seconds) {
      state.elapsed = seconds;
      state.shiftLeft = Math.max(0, SHIFT_SECONDS - seconds);
      state.spawnT = 1;
    },
  };
}
