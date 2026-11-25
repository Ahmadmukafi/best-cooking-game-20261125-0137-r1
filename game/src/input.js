// Keyboard and pointer input. Clicks are queued with their logical coordinates and taken
// once by the loop, so a click between two frames is never lost and never counted twice.
// One-shot presses (start, serve, trash, pause) are queued as bit flags the same way.

import { INGREDIENTS, SERVE, TRASH } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_SERVE = 4;
export const ACTION_TRASH = 8;

const PAUSE = new Set(['KeyP', 'Escape']);
const CONFIRM = new Set(['Space', 'Enter']);
const SERVE_KEYS = new Set(['KeyS']);
const TRASH_KEYS = new Set(['Backspace', 'Delete', 'KeyT']);

/** Convert a client point to logical field coordinates for a canvas of this size. */
export function toLogical(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = 1280 / rect.width;
  const scaleY = 720 / rect.height;
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

export function createInput(canvas) {
  let actions = 0;
  const clicks = [];

  window.addEventListener('keydown', (event) => {
    if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (SERVE_KEYS.has(event.code)) {
      if (!event.repeat) actions |= ACTION_SERVE;
    } else if (TRASH_KEYS.has(event.code)) {
      if (!event.repeat) actions |= ACTION_TRASH;
    } else {
      const ing = INGREDIENTS.find((item) => `Digit${item.key}` === event.code || `Key${item.key.toUpperCase()}` === event.code || event.key === item.key);
      if (ing) {
        if (!event.repeat) actions |= ACTION_CONFIRM;
        // Station shortcuts are delivered as clicks on the station, via the key map below.
        clicks.push({ kind: 'station', id: ing.id });
        return;
      }
      return;
    }
    event.preventDefault();
  });

  canvas.addEventListener('pointerdown', (event) => {
    const point = toLogical(canvas, event.clientX, event.clientY);
    clicks.push({ kind: 'point', x: point.x, y: point.y });
    actions |= ACTION_CONFIRM;
  });

  return {
    /** The one-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** The queued clicks since the last call, in order. */
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
  };
}

/** Map a raw click (point or station shortcut) to a world action. */
export function resolveClick(click, stationRects) {
  if (click.kind === 'station') return { type: 'station', id: click.id };
  const { x, y } = click;
  for (const rect of stationRects) {
    if (x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h) {
      return { type: 'station', id: rect.id };
    }
  }
  if (x >= SERVE.x && x < SERVE.x + SERVE.w && y >= SERVE.y && y < SERVE.y + SERVE.h) {
    return { type: 'serve' };
  }
  if (x >= TRASH.x && x < TRASH.x + TRASH.w && y >= TRASH.y && y < TRASH.y + TRASH.h) {
    return { type: 'trash' };
  }
  return { type: 'none' };
}
