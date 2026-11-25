// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s steps
// (several in a slow frame, none in a fast one), and the renderer paints what is there. The
// game moves between four screens: title, play, paused and game over.
//
// ?seed=N fixes the ticket order. ?shot=cover|rush|serve|end (with &seed=N) stages that scene
// instead of running the loop, paints it twice and sets window.__shotReady for a screenshot.
import { BEST_KEY, FIELD, PLATE, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_EXPIRE, EVENT_OVER, EVENT_READY, EVENT_SERVE, EVENT_SPOIL, EVENT_CHOP, EVENT_COOK } from './world.js';
import { ACTION_CONFIRM, ACTION_PAUSE, ACTION_SERVE, ACTION_TRASH, createInput, resolveClick } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { soundChop, soundClick, soundFail, soundReady, soundServe, soundSizzle, soundTick, unlockAudio } from './audio.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world, createRandom(seed));
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, 12);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  let lastTickSecond = -1;

  function announce(message) {
    status.textContent = message;
  }

  function playEvents(events) {
    if (events & EVENT_SERVE) soundServe();
    else if (events & EVENT_EXPIRE) soundFail();
    else if (events & EVENT_SPOIL) soundFail();
    else if (events & EVENT_READY) soundReady();
    else if (events & EVENT_CHOP) soundChop();
    else if (events & EVENT_COOK) soundSizzle();
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    lastTickSecond = -1;
    screen = SCREEN_PLAY;
    announce('Bermain. Sajikan pesanan sebelum waktunya habis.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(`Selesai. Skor ${world.state.score}. Terbaik ${best}.`);
  }

  function handleClicks() {
    const clicks = input.takeClicks();
    const rects = world.stationRects();
    const actions = [];
    for (const click of clicks) {
      const resolved = resolveClick(click, rects);
      if (resolved.type === 'none') {
        // A click on the plate itself adds the carried ingredient to the dish.
        if (click.kind === 'point') {
          const dx = (click.x - PLATE.x) / PLATE.rx;
          const dy = (click.y - PLATE.y) / PLATE.ry;
          if (dx * dx + dy * dy <= 1) actions.push({ type: 'plate' });
        }
      } else {
        actions.push(resolved);
      }
    }
    return actions;
  }

  function stepGame() {
    const actions = input.takeActions();
    const clicks = handleClicks();
    if (actions & ACTION_SERVE) clicks.push({ type: 'serve' });
    if (actions & ACTION_TRASH) clicks.push({ type: 'trash' });
    if (screen === SCREEN_TITLE) {
      if (actions & ACTION_CONFIRM || clicks.length > 0) {
        unlockAudio();
        startGame();
      }
      return;
    }
    if (screen === SCREEN_OVER) {
      if (actions & ACTION_CONFIRM || clicks.length > 0) {
        unlockAudio();
        startGame();
      }
      return;
    }
    if (actions & ACTION_PAUSE) {
      screen = screen === SCREEN_PLAY ? SCREEN_PAUSED : SCREEN_PLAY;
      announce(screen === SCREEN_PAUSED ? 'Jeda.' : 'Bermain.');
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    if (clicks.length > 0) soundClick();
    const events = world.step(STEP, clicks);
    playEvents(events);
    const shiftLeft = world.state.shiftLeft;
    const whole = Math.ceil(shiftLeft);
    if (shiftLeft <= 10 && whole !== lastTickSecond) {
      lastTickSecond = whole;
      soundTick();
    }
    if (events & EVENT_OVER) endGame();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    while (accumulator >= STEP) {
      stepGame();
      accumulator -= STEP;
      if (screen === SCREEN_PAUSED) {
        accumulator = 0;
        break;
      }
    }
    renderer.draw(world.state, screen, best, now / 1000);
  }

  // Leaving the tab pauses a running game rather than letting tickets expire unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Jeda.');
    }
  });

  announce('Dapur Rush. Tekan Spasi atau klik untuk mulai.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
