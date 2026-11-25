// Every tuning number, colour, recipe and station in one place. The playfield is a fixed
// 1280x720 logical area; the renderer scales it to the window, so no rule below depends on
// the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** One shift lasts three minutes of play. */
export const SHIFT_SECONDS = 180;

/** A ticket that is left to expire costs one strike; three strikes end the shift. */
export const MAX_STRIKES = 3;

/** How long a ready ingredient waits on its station before it spoils. */
export const SPOIL_SECONDS = 4;

/** Prep kinds: instant (a quick grab), chop (knife work) and cook (heat). */
export const PREP_INSTANT = 'instant';
export const PREP_CHOP = 'chop';
export const PREP_COOK = 'cook';

/**
 * The twelve ingredients. `prep` is how the station treats it, `prepTime` how long that
 * takes, `key` the keyboard shortcut, `short` the two-letter chip on a ticket.
 */
export const INGREDIENTS = [
  { id: 'nasi', name: 'Nasi', short: 'NS', color: '#f5f0dc', prep: PREP_COOK, prepTime: 2.0, key: '1' },
  { id: 'telur', name: 'Telur', short: 'TL', color: '#fff3c4', prep: PREP_COOK, prepTime: 1.5, key: '2' },
  { id: 'kecap', name: 'Kecap', short: 'KC', color: '#4a2c14', prep: PREP_INSTANT, prepTime: 0.4, key: '3' },
  { id: 'mie', name: 'Mie', short: 'MI', color: '#f2c94c', prep: PREP_COOK, prepTime: 2.0, key: '4' },
  { id: 'ayam', name: 'Ayam', short: 'AY', color: '#e8a34c', prep: PREP_CHOP, prepTime: 1.5, key: '5' },
  { id: 'bawang', name: 'Bawang', short: 'BW', color: '#b678c2', prep: PREP_CHOP, prepTime: 1.2, key: '6' },
  { id: 'teh', name: 'Teh', short: 'TH', color: '#c98a3d', prep: PREP_COOK, prepTime: 1.2, key: '7' },
  { id: 'es', name: 'Es', short: 'ES', color: '#a8d8ea', prep: PREP_INSTANT, prepTime: 0.4, key: '8' },
  { id: 'gula', name: 'Gula', short: 'GL', color: '#ffffff', prep: PREP_INSTANT, prepTime: 0.4, key: '9' },
  { id: 'sate', name: 'Sate', short: 'ST', color: '#8a5a2b', prep: PREP_COOK, prepTime: 2.5, key: '0' },
  { id: 'kacang', name: 'Kacang', short: 'KG', color: '#a0662c', prep: PREP_INSTANT, prepTime: 0.4, key: '-' },
  { id: 'lontong', name: 'Lontong', short: 'LT', color: '#eef2d8', prep: PREP_INSTANT, prepTime: 0.4, key: '=' },
];

export const ING_BY_ID = Object.fromEntries(INGREDIENTS.map((ing) => [ing.id, ing]));

/** Four warung dishes, three ingredients each, so every ticket is a different route. */
export const RECIPES = [
  { id: 'nasi-goreng', name: 'Nasi Goreng', color: '#e2725b', ings: ['nasi', 'telur', 'kecap'] },
  { id: 'mie-ayam', name: 'Mie Ayam', color: '#f2a541', ings: ['mie', 'ayam', 'bawang'] },
  { id: 'es-teh', name: 'Es Teh Manis', color: '#c98a3d', ings: ['teh', 'es', 'gula'] },
  { id: 'sate-ayam', name: 'Sate Ayam', color: '#8a5a2b', ings: ['sate', 'kacang', 'lontong'] },
];

/** Rush level by elapsed seconds: more tickets, shorter fuses, faster spawns. */
export const LEVELS = [
  { until: 60, maxTickets: 1, ticketSeconds: 50, spawnSeconds: 9 },
  { until: 120, maxTickets: 2, ticketSeconds: 42, spawnSeconds: 7.5 },
  { until: Infinity, maxTickets: 3, ticketSeconds: 35, spawnSeconds: 6 },
];

export const SCORE_BASE = 100;
export const SCORE_TIP_MAX = 50;
export const EXPIRE_PENALTY = 25;

/** Station tiles: two rows of six on the counter, left of the plate zone. */
export const STATION = { x0: 24, y0: 464, w: 128, h: 108, gapX: 8, gapY: 12, cols: 6 };

/** The plate zone on the right: plate, serve button, trash and the hand slot. */
export const PLATE = { x: 1056, y: 556, rx: 132, ry: 48 };
export const SERVE = { x: 956, y: 636, w: 200, h: 44 };
export const TRASH = { x: 872, y: 636, w: 72, h: 44 };
export const HAND = { x: 880, y: 486, r: 30 };

/** Order tickets across the top, under the HUD. */
export const TICKET = { x0: 24, y: 76, w: 400, h: 108, gap: 16 };

export const PALETTE = {
  wall: '#f7d9a0',
  wallLow: '#eec27e',
  floor: '#c98f5f',
  floorTile: '#b57e50',
  counter: '#8b5a2b',
  counterTop: '#a06a35',
  counterEdge: '#6e4218',
  board: '#7a4a21',
  boardEdge: '#5d3717',
  ticket: '#fff8e6',
  ticketEdge: '#d8c49a',
  hud: '#2b1d12',
  hudText: '#ffe9b8',
  text: '#2b1d12',
  muted: '#7a6a55',
  plate: '#fdfdf6',
  plateEdge: '#c9c2ae',
  serve: '#3f9e4d',
  serveText: '#ffffff',
  trash: '#b0492f',
  danger: '#c0392b',
  gold: '#f2c94c',
  panel: '#fff3d6',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'dapur-rush.best';
