// The screenshot scenes behind ?shot=cover|rush|serve|end. Each one plays the real rules
// forward from a fresh world for a fixed number of steps, steered by a simple autopilot that
// works the oldest ticket first, so the frame is what a short game really looks like and the
// same seed always gives the same frame.

import { PLATE, STEP } from './config.js';
import { EVENT_OVER, EVENT_SERVE, stationRects } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const rects = stationRects();

function rectCentre(rect) {
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
}

/**
 * One autopilot decision: work the oldest ticket. Serve when the plate matches it, put the
 * carried ingredient on the plate, collect a ready ingredient the ticket needs, or start
 * prepping one it needs. Returns a resolved click action, or null when nothing is useful.
 */
function autopilot(world) {
  const state = world.state;
  const ticket = state.tickets[0];
  if (!ticket) return null;
  const recipe = ticket.recipe;
  if (state.plate.length === recipe.ings.length && recipe.ings.every((id) => state.plate.includes(id))) {
    return { type: 'serve' };
  }
  if (state.hand) return { type: 'plate' };
  const needed = recipe.ings.filter((id) => !state.plate.includes(id));
  for (const id of needed) {
    const station = state.stations.find((item) => item.id === id);
    if (station.state === 'ready') return { type: 'station', id };
  }
  for (const id of needed) {
    const station = state.stations.find((item) => item.id === id);
    const busy = state.stations.some((item) => item.state === 'working' && needed.includes(item.id));
    if (station.state === 'idle' && !busy) return { type: 'station', id };
  }
  return null;
}

/** A sloppy autopilot: acts rarely and often picks the wrong station, so tickets expire. */
function sloppyAutopilot(world, random) {
  if (random.next() < 0.6) return null;
  if (random.next() < 0.4) {
    const station = random.pick(rects);
    return { type: 'station', id: station.id };
  }
  return autopilot(world);
}

/** Step the world for `seconds`, one autopilot decision per step, until `stop` says halt. */
function runFor(world, seconds, policy, stop) {
  const steps = Math.floor(seconds / STEP);
  let served = 0;
  for (let index = 0; index < steps; index += 1) {
    const action = policy(world);
    const events = world.step(STEP, action ? [action] : []);
    if (events & EVENT_SERVE) served += 1;
    if (events & EVENT_OVER) break;
    if (stop && stop(world, served)) break;
  }
  return served;
}

/** Start prepping the ticket's missing ingredient, so a working station is in the frame. */
function ensureWorking(world) {
  const state = world.state;
  if (state.stations.some((item) => item.state === 'working')) return;
  const ticket = state.tickets[0];
  if (!ticket) return;
  const missing = ticket.recipe.ings.find((id) => !state.plate.includes(id) && state.hand !== id);
  if (missing) world.act({ type: 'station', id: missing });
}

/**
 * Set `world` to the named scene and return the screen to draw over it and the best score
 * to show. Names: cover (mid-assembly, two tickets), rush (level 3, three tickets, full
 * plate), serve (the moment a dish lands), end (three strikes, game over); anything else
 * is the title screen.
 */
export function stageShot(name, world, random) {
  world.reset();
  if (name === 'cover') {
    world.spawnTicket();
    world.spawnTicket();
    runFor(world, 40, autopilot, (w) => w.state.plate.length >= 2 && w.state.tickets.length >= 1);
    // Freeze mid-assembly: two ingredients on the plate, the third one on the stove.
    ensureWorking(world);
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'rush') {
    world.setElapsed(132);
    world.spawnTicket();
    world.spawnTicket();
    world.spawnTicket();
    runFor(world, 40, autopilot, (w) => w.state.plate.length >= 2 && w.state.tickets.length >= 2);
    ensureWorking(world);
    return { screen: SCREEN_PLAY, best: 340 };
  }
  if (name === 'serve') {
    world.spawnTicket();
    world.spawnTicket();
    runFor(world, 60, autopilot, (w, served) => served >= 1);
    // Freeze a moment after the serve, while the +points floater is still up.
    runFor(world, 0.4, () => null, null);
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'end') {
    world.spawnTicket();
    runFor(world, 400, (w) => sloppyAutopilot(w, random), (w) => w.state.over);
    return { screen: SCREEN_OVER, best: 120 };
  }
  world.spawnTicket();
  world.spawnTicket();
  return { screen: SCREEN_TITLE, best: 0 };
}

/** The shot definitions the screenshot run uses, in cover order. */
export const SHOTS = [
  { name: '1-cover.jpg', query: '?shot=cover&seed=7' },
  { name: '2-rush.jpg', query: '?shot=rush&seed=7' },
  { name: '3-serve.jpg', query: '?shot=serve&seed=7' },
  { name: '4-end.jpg', query: '?shot=end&seed=7' },
];
