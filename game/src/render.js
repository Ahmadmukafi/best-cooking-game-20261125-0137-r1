// Everything the player sees, painted on one canvas: the warung wall, the order board, the
// counter with its twelve stations, the plate zone, the HUD and the title / pause / over
// screens. All art is drawn shapes — no images, no fonts to fetch.

import {
  FIELD,
  FONT,
  HAND,
  INGREDIENTS,
  ING_BY_ID,
  PALETTE,
  PLATE,
  RECIPES,
  SERVE,
  SHIFT_SECONDS,
  STATION,
  TICKET,
  TRASH,
} from './config.js';
import { stationRects } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, size, color, weight = '700', align = 'center') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** The little drawn icon for one ingredient, centred at (x, y) with radius r. */
export function drawIngredient(ctx, id, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  const ing = ING_BY_ID[id];
  ctx.fillStyle = ing.color;
  ctx.strokeStyle = 'rgba(43,29,18,0.55)';
  ctx.lineWidth = 2;
  switch (id) {
    case 'nasi': {
      ctx.beginPath();
      ctx.arc(0, 4, r * 0.95, 0, Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-r * 0.4, -r * 0.2, r * 0.45, 0, Math.PI * 2);
      ctx.arc(r * 0.35, -r * 0.25, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'telur': {
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.95, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f2a541';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'kecap': {
      ctx.fillStyle = '#2e1a0c';
      roundRect(ctx, -r * 0.4, -r * 0.7, r * 0.8, r * 1.4, r * 0.25);
      ctx.fill();
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(-r * 0.3, -r * 1.05, r * 0.6, r * 0.4);
      ctx.fillStyle = '#f5f0dc';
      ctx.fillRect(-r * 0.4, -r * 0.1, r * 0.8, r * 0.5);
      break;
    }
    case 'mie': {
      ctx.beginPath();
      ctx.arc(0, 2, r * 0.9, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#f2c94c';
      ctx.lineWidth = 3;
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.arc(i * r * 0.35, -r * 0.15, r * 0.32, Math.PI, 0);
        ctx.stroke();
      }
      break;
    }
    case 'ayam': {
      ctx.beginPath();
      ctx.arc(-r * 0.2, -r * 0.15, r * 0.62, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#f5f0dc';
      ctx.lineWidth = r * 0.26;
      ctx.beginPath();
      ctx.moveTo(r * 0.3, r * 0.3);
      ctx.lineTo(r * 0.8, r * 0.8);
      ctx.stroke();
      ctx.fillStyle = '#f5f0dc';
      ctx.beginPath();
      ctx.arc(r * 0.85, r * 0.85, r * 0.2, 0, Math.PI * 2);
      ctx.arc(r * 0.62, r * 0.98, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'bawang': {
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#3f9e4d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.85);
      ctx.quadraticCurveTo(r * 0.3, -r * 1.2, r * 0.55, -r * 1.05);
      ctx.stroke();
      break;
    }
    case 'teh': {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      roundRect(ctx, -r * 0.5, -r * 0.8, r, r * 1.6, r * 0.2);
      ctx.fill();
      ctx.fillStyle = '#c98a3d';
      roundRect(ctx, -r * 0.42, -r * 0.2, r * 0.84, r * 0.9, r * 0.15);
      ctx.fill();
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(r * 0.15, -r * 0.75);
      ctx.lineTo(r * 0.45, -r * 1.15);
      ctx.stroke();
      break;
    }
    case 'es': {
      ctx.fillStyle = '#a8d8ea';
      for (const [dx, dy, s] of [[-0.35, 0.1, 0.5], [0.3, -0.15, 0.55], [0.05, 0.45, 0.45]]) {
        ctx.save();
        ctx.translate(dx * r, dy * r);
        ctx.rotate(0.4);
        ctx.fillRect(-s * r / 2, -s * r / 2, s * r, s * r);
        ctx.restore();
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 2;
      ctx.strokeRect(-r * 0.5, -r * 0.5, r, r);
      break;
    }
    case 'gula': {
      ctx.fillStyle = '#e8e2d0';
      ctx.beginPath();
      ctx.arc(0, 4, r * 0.9, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(43,29,18,0.5)';
      ctx.lineWidth = 1.5;
      for (const [dx, dy] of [[-0.3, 0.1], [0.25, 0.0], [0, -0.35]]) {
        ctx.fillRect((dx - 0.22) * r, (dy - 0.22) * r, r * 0.44, r * 0.44);
        ctx.strokeRect((dx - 0.22) * r, (dy - 0.22) * r, r * 0.44, r * 0.44);
      }
      break;
    }
    case 'sate': {
      ctx.strokeStyle = '#d8c49a';
      ctx.lineWidth = 3;
      for (const dy of [-0.35, 0.05, 0.45]) {
        ctx.beginPath();
        ctx.moveTo(-r * 0.9, dy * r);
        ctx.lineTo(r * 0.9, dy * r);
        ctx.stroke();
      }
      ctx.fillStyle = '#8a5a2b';
      for (const dy of [-0.35, 0.05, 0.45]) {
        for (const dx of [-0.45, 0, 0.45]) {
          ctx.beginPath();
          ctx.arc(dx * r, dy * r, r * 0.22, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case 'kacang': {
      ctx.beginPath();
      ctx.arc(0, 2, r * 0.9, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#7a4a21';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -r * 0.1, r * 0.5, 0.3, Math.PI - 0.3);
      ctx.stroke();
      ctx.fillStyle = '#e8a34c';
      for (const [dx, dy] of [[-0.3, -0.3], [0.35, -0.2], [0, 0.1]]) {
        ctx.beginPath();
        ctx.arc(dx * r, dy * r, r * 0.14, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'lontong': {
      ctx.fillStyle = '#7fae5a';
      roundRect(ctx, -r * 0.95, -r * 0.5, r * 1.9, r, r * 0.3);
      ctx.fill();
      ctx.fillStyle = '#eef2d8';
      roundRect(ctx, -r * 0.8, -r * 0.38, r * 1.6, r * 0.76, r * 0.25);
      ctx.fill();
      ctx.strokeStyle = '#7fae5a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.5);
      ctx.lineTo(0, r * 0.5);
      ctx.stroke();
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

function drawTicket(ctx, ticket, x, y, index) {
  const { recipe, left, total } = ticket;
  const urgent = left < 12;
  ctx.save();
  if (urgent) {
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 180);
    ctx.shadowColor = '#c0392b';
    ctx.shadowBlur = 10 + pulse * 14;
  }
  ctx.fillStyle = PALETTE.ticket;
  ctx.strokeStyle = PALETTE.ticketEdge;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, TICKET.w, TICKET.h, 10);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = recipe.color;
  roundRect(ctx, x, y, 10, TICKET.h, 5);
  ctx.fill();
  text(ctx, `#${index + 1}  ${recipe.name.toUpperCase()}`, x + 24, y + 24, 19, PALETTE.text, '800', 'left');
  // Ingredient chips: the recipe, so the route is readable at a glance.
  let chipX = x + 24;
  for (const id of recipe.ings) {
    const ing = ING_BY_ID[id];
    ctx.fillStyle = ing.color;
    ctx.strokeStyle = 'rgba(43,29,18,0.5)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, chipX, y + 44, 66, 26, 13);
    ctx.fill();
    ctx.stroke();
    const dark = ['kecap', 'sate', 'kacang'].includes(id);
    text(ctx, ing.short, chipX + 33, y + 58, 14, dark ? '#fff8e6' : PALETTE.text, '800');
    chipX += 74;
  }
  // Countdown bar: green to red as the ticket runs out.
  const ratio = Math.max(0, left / total);
  ctx.fillStyle = '#e5d9bd';
  roundRect(ctx, x + 24, y + 82, TICKET.w - 48, 12, 6);
  ctx.fill();
  ctx.fillStyle = ratio > 0.5 ? '#3f9e4d' : ratio > 0.25 ? '#e8a33c' : '#c0392b';
  if (ratio > 0) {
    roundRect(ctx, x + 24, y + 82, (TICKET.w - 48) * ratio, 12, 6);
    ctx.fill();
  }
  text(ctx, `${Math.ceil(left)} dtk`, x + TICKET.w - 24, y + 24, 17, urgent ? '#c0392b' : PALETTE.muted, '800', 'right');
}

function drawStation(ctx, station, rect, time) {
  const ing = ING_BY_ID[station.id];
  const working = station.state === 'working';
  const ready = station.state === 'ready';
  ctx.save();
  if (ready) {
    const pulse = 0.5 + 0.5 * Math.sin(time * 6);
    ctx.shadowColor = '#f2c94c';
    ctx.shadowBlur = 12 + pulse * 12;
  }
  ctx.fillStyle = working ? '#f3e2b8' : ready ? '#fff3c4' : '#f7ead0';
  ctx.strokeStyle = ready ? '#e8a33c' : '#d8c49a';
  ctx.lineWidth = 2;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawIngredient(ctx, station.id, rect.x + rect.w / 2, rect.y + 34, 22);
  text(ctx, ing.name.toUpperCase(), rect.x + rect.w / 2, rect.y + 68, 14, PALETTE.text, '800');
  // Key shortcut, top-left; prep label, bottom.
  ctx.fillStyle = PALETTE.hud;
  roundRect(ctx, rect.x + 6, rect.y + 6, 20, 20, 5);
  ctx.fill();
  text(ctx, ing.key, rect.x + 16, rect.y + 17, 13, '#ffe9b8', '800');
  const prepLabel = ing.prep === 'chop' ? 'POTONG' : ing.prep === 'cook' ? 'MASAK' : 'AMBIL';
  text(ctx, prepLabel, rect.x + rect.w / 2, rect.y + 84, 11, PALETTE.muted, '700');

  if (working) {
    const ratio = Math.min(1, station.t / station.dur);
    ctx.fillStyle = '#e5d9bd';
    roundRect(ctx, rect.x + 10, rect.y + rect.h - 14, rect.w - 20, 7, 3.5);
    ctx.fill();
    ctx.fillStyle = ing.prep === 'chop' ? '#e2725b' : '#e8a33c';
    roundRect(ctx, rect.x + 10, rect.y + rect.h - 14, (rect.w - 20) * ratio, 7, 3.5);
    ctx.fill();
  } else if (ready) {
    text(ctx, 'SIAP!', rect.x + rect.w / 2, rect.y + rect.h - 11, 13, '#3f9e4d', '800');
  }
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const rects = stationRects();

  function drawBackdrop(state, time) {
    // Wall, floor and the wooden counter band.
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(0, 0, FIELD.width, 452);
    ctx.fillStyle = PALETTE.wallLow;
    ctx.fillRect(0, 196, FIELD.width, 8);
    ctx.fillStyle = PALETTE.floor;
    ctx.fillRect(0, 452, FIELD.width, 268);
    ctx.fillStyle = PALETTE.floorTile;
    for (let x = 0; x < FIELD.width; x += 80) {
      ctx.fillRect(x, 560, 2, 160);
    }
    ctx.fillRect(0, 560, FIELD.width, 2);
    // Window with a morning sky and a warung sign.
    ctx.fillStyle = '#bfe3f0';
    roundRect(ctx, 60, 216, 260, 150, 8);
    ctx.fill();
    ctx.strokeStyle = '#7a4a21';
    ctx.lineWidth = 6;
    ctx.strokeRect(60, 216, 260, 150);
    ctx.beginPath();
    ctx.moveTo(190, 216);
    ctx.lineTo(190, 366);
    ctx.moveTo(60, 291);
    ctx.lineTo(320, 291);
    ctx.stroke();
    ctx.fillStyle = '#f2c94c';
    ctx.beginPath();
    ctx.arc(110, 250, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7fae5a';
    ctx.beginPath();
    ctx.ellipse(240, 350, 70, 14, 0, Math.PI, 0);
    ctx.fill();
    // Hanging lamp and shelf with jars.
    ctx.strokeStyle = '#5d3717';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(700, 196);
    ctx.lineTo(700, 240);
    ctx.stroke();
    ctx.fillStyle = '#f2c94c';
    ctx.beginPath();
    ctx.arc(700, 252, 16 + Math.sin(time * 2) * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a4a21';
    ctx.fillRect(880, 300, 320, 12);
    const jarColors = ['#c98a3d', '#a0662c', '#3f9e4d', '#c0392b'];
    jarColors.forEach((color, i) => {
      ctx.fillStyle = color;
      roundRect(ctx, 900 + i * 76, 252, 52, 48, 6);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fillRect(900 + i * 76 + 8, 258, 12, 36);
    });
    // Counter band.
    ctx.fillStyle = PALETTE.counterTop;
    ctx.fillRect(0, 436, FIELD.width, 16);
    ctx.fillStyle = PALETTE.counter;
    ctx.fillRect(0, 452, FIELD.width, 12);
    // Steam particles drift up from the counter.
    for (const particle of state.particles) {
      const alpha = Math.max(0, 1 - particle.t / particle.life);
      ctx.fillStyle = particle.color.replace('0.55', String(0.55 * alpha));
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * (1 + particle.t), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawHud(state, screen) {
    ctx.fillStyle = PALETTE.hud;
    ctx.fillRect(0, 0, FIELD.width, 64);
    text(ctx, '🍳 DAPUR RUSH', 24, 33, 26, PALETTE.hudText, '900', 'left');
    text(ctx, `SKOR ${state.score}`, 300, 33, 22, '#ffffff', '800', 'left');
    if (state.combo >= 2) {
      text(ctx, `KOMBO x${state.combo}`, 500, 33, 18, PALETTE.gold, '800', 'left');
    }
    const shiftLeft = Math.max(0, state.shiftLeft);
    const low = shiftLeft <= 10 && screen === SCREEN_PLAY;
    text(ctx, 'WAKTU', 700, 16, 11, PALETTE.hudText, '700');
    text(ctx, formatTime(shiftLeft), 700, 42, 26, low ? '#ff6b5e' : '#ffffff', '900');
    text(ctx, `LEVEL ${state.elapsed < 60 ? 1 : state.elapsed < 120 ? 2 : 3}`, 880, 33, 20, PALETTE.hudText, '800', 'left');
    text(ctx, `SAJI ${state.served}`, 1010, 33, 20, PALETTE.hudText, '800', 'left');
    // Strikes as three little plates; a lost one is cracked (grey).
    for (let i = 0; i < 3; i += 1) {
      const x = 1140 + i * 34;
      ctx.fillStyle = i < 3 - state.strikes ? '#fdfdf6' : '#5d5348';
      ctx.beginPath();
      ctx.ellipse(x, 32, 13, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c9c2ae';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function drawPlateZone(state, time) {
    // Hand slot: what the cook is carrying.
    ctx.fillStyle = '#fff3d6';
    ctx.strokeStyle = '#d8c49a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(HAND.x, HAND.y, HAND.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (state.hand) {
      drawIngredient(ctx, state.hand, HAND.x, HAND.y, 20);
    } else {
      text(ctx, 'TANGAN', HAND.x, HAND.y, 11, PALETTE.muted, '700');
    }
    // The plate itself, with the dish mid-assembly.
    ctx.save();
    ctx.fillStyle = PALETTE.plate;
    ctx.strokeStyle = PALETTE.plateEdge;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(PLATE.x, PLATE.y, PLATE.rx, PLATE.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(PLATE.x, PLATE.y, PLATE.rx - 22, PLATE.ry - 12, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    state.plate.forEach((id, index) => {
      const angle = -0.7 + index * 0.7;
      drawIngredient(ctx, id, PLATE.x + Math.cos(angle) * 62, PLATE.y + Math.sin(angle) * 18 - 6, 17);
    });
    if (state.plate.length === 0) {
      text(ctx, 'Piring kosong — klik bahan, lalu klik piring', PLATE.x, PLATE.y - 4, 13, PALETTE.muted, '600');
    }
    // Serve and trash buttons.
    ctx.fillStyle = PALETTE.serve;
    roundRect(ctx, SERVE.x, SERVE.y, SERVE.w, SERVE.h, 10);
    ctx.fill();
    text(ctx, 'SAJIKAN  [Spasi]', SERVE.x + SERVE.w / 2, SERVE.y + SERVE.h / 2 + 1, 18, PALETTE.serveText, '800');
    ctx.fillStyle = PALETTE.trash;
    roundRect(ctx, TRASH.x, TRASH.y, TRASH.w, TRASH.h, 10);
    ctx.fill();
    text(ctx, '🗑', TRASH.x + TRASH.w / 2, TRASH.y + TRASH.h / 2 + 1, 20, '#ffffff', '800');
    // Floaters rise and fade above the plate.
    for (const floater of state.floaters) {
      const alpha = Math.max(0, 1 - floater.t / floater.life);
      ctx.globalAlpha = alpha;
      text(ctx, floater.text, floater.x, floater.y - floater.t * 34, 22, floater.color, '900');
      ctx.globalAlpha = 1;
    }
  }

  function drawScreen(state, screen, best, time) {
    const shakeX = state.shake > 0 ? Math.sin(time * 47) * 3 : 0;
    ctx.save();
    ctx.translate(shakeX, 0);
    drawBackdrop(state, time);
    drawHud(state, screen);
    // Order board.
    ctx.fillStyle = PALETTE.board;
    roundRect(ctx, 12, 66, FIELD.width - 24, 128, 12);
    ctx.fill();
    text(ctx, 'PAPAN PESANAN', 24, 84, 12, '#d8a860', '800', 'left');
    state.tickets.forEach((ticket, index) => {
      drawTicket(ctx, ticket, TICKET.x0 + index * (TICKET.w + TICKET.gap), TICKET.y, index);
    });
    if (state.tickets.length === 0 && screen === SCREEN_PLAY) {
      text(ctx, 'Belum ada pesanan — pelanggan segera datang…', 640, 140, 18, '#d8a860', '600');
    }
    // Stations and the plate zone.
    state.stations.forEach((station, index) => drawStation(ctx, station, rects[index], time));
    drawPlateZone(state, time);
    ctx.restore();

    if (screen === SCREEN_TITLE) {
      ctx.fillStyle = 'rgba(43,29,18,0.72)';
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      text(ctx, '🍳', 640, 190, 72, '#ffffff', '900');
      text(ctx, 'DAPUR RUSH', 640, 270, 64, '#ffe9b8', '900');
      text(ctx, 'Warung kecil, pesanan besar. Masak cepat, sajikan tepat waktu!', 640, 320, 22, '#ffffff', '600');
      text(ctx, 'Klik stasiun untuk memasak • Klik piring untuk merakit • Spasi untuk menyajikan', 640, 360, 18, '#ffe9b8', '600');
      text(ctx, '1–0, - , = : pilih bahan   •   Backspace: buang piring   •   P: jeda', 640, 390, 16, '#d8c49a', '600');
      const pulse = 0.6 + 0.4 * Math.sin(time * 3);
      ctx.globalAlpha = pulse;
      text(ctx, 'KLIK / SPASI UNTUK MULAI', 640, 450, 26, '#ffffff', '900');
      ctx.globalAlpha = 1;
      if (best > 0) text(ctx, `Skor terbaik: ${best}`, 640, 500, 20, PALETTE.gold, '800');
    } else if (screen === SCREEN_PAUSED) {
      ctx.fillStyle = 'rgba(43,29,18,0.66)';
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      text(ctx, 'JEDA', 640, 330, 56, '#ffe9b8', '900');
      text(ctx, 'Tekan P / Esc untuk lanjut', 640, 390, 20, '#ffffff', '600');
    } else if (screen === SCREEN_OVER) {
      ctx.fillStyle = 'rgba(43,29,18,0.78)';
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      text(ctx, state.overReason === 'strikes' ? 'WARUNG TUTUP!' : 'SHIFT SELESAI!', 640, 250, 52, '#ffe9b8', '900');
      text(ctx, state.overReason === 'strikes'
        ? 'Tiga pesanan hangus — pelanggan pulang kecewa.'
        : 'Tiga menit berlalu — dapur boleh bernapas.', 640, 300, 20, '#ffffff', '600');
      text(ctx, `SKOR AKHIR  ${state.score}`, 640, 370, 34, '#ffffff', '900');
      text(ctx, `Hidangan tersaji: ${state.served}   •   Kombo terbaik: x${state.bestCombo}   •   Terbaik: ${best}`, 640, 415, 19, PALETTE.gold, '700');
      text(ctx, 'Tekan Spasi / klik untuk main lagi', 640, 470, 20, '#ffe9b8', '600');
    }
  }

  return {
    /** Paint one frame. `time` is seconds since boot, for pulses and steam. */
    draw(state, screen, best, time = 0) {
      ctx.clearRect(0, 0, FIELD.width, FIELD.height);
      drawScreen(state, screen, best, time);
    },
  };
}
