import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, pixelFn) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  const raw = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      // 2x2 subpixel anti-aliasing for smooth edges
      let r = 0, g = 0, b = 0, a = 0;
      const subOffsets = [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]];
      for (const [sx, sy] of subOffsets) {
        const [sr, sg, sb, sa] = pixelFn(x + sx, y + sy, width, height);
        r += sr * (sa / 255);
        g += sg * (sa / 255);
        b += sb * (sa / 255);
        a += sa;
      }
      a /= 4;
      if (a > 0) {
        r = Math.round(r / (a / 255) / 4);
        g = Math.round(g / (a / 255) / 4);
        b = Math.round(b / (a / 255) / 4);
      }
      raw[offset++] = Math.min(255, Math.max(0, r));
      raw[offset++] = Math.min(255, Math.max(0, g));
      raw[offset++] = Math.min(255, Math.max(0, b));
      raw[offset++] = Math.min(255, Math.max(0, Math.round(a)));
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

// Distance helper functions
function distToRoundedRect(x, y, rx, ry, rw, rh, rad) {
  const cx = rx + rw / 2;
  const cy = ry + rh / 2;
  const dx = Math.abs(x - cx) - (rw / 2 - rad);
  const dy = Math.abs(y - cy) - (rh / 2 - rad);
  if (dx <= 0 && dy <= 0) return -Math.min(-dx, -dy);
  if (dx > 0 && dy > 0) return Math.sqrt(dx * dx + dy * dy) - rad;
  return Math.max(dx, dy) - rad;
}

function distToSegment(x, y, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(x - x1, y - y1);
  let t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / len2));
  const px = x1 + t * dx;
  const py = y1 + t * dy;
  return Math.hypot(x - px, y - py);
}

function renderIconPixel(x, y, w, h, isMaskable) {
  // Center is (w/2, h/2)
  const cx = w / 2;
  const cy = h / 2;
  const scale = w / 512;

  // Background
  let bgR = 11, bgG = 15, bgB = 25; // #0B0F19

  if (isMaskable) {
    // Full bleed background: dark navy with subtle radial glow
    const distCenter = Math.hypot(x - cx, y - cy);
    const maxR = cx * 1.4;
    const glowT = Math.max(0, 1 - distCenter / maxR);
    bgR = Math.round(11 + 25 * glowT);
    bgG = Math.round(15 + 10 * glowT);
    bgB = Math.round(25 + 50 * glowT);
  } else {
    // Standard icon has a squircle / rounded rect container
    const cardSize = 460 * scale;
    const cardRad = 100 * scale;
    const dCard = distToRoundedRect(x, y, cx - cardSize / 2, cy - cardSize / 2, cardSize, cardSize, cardRad);
    if (dCard > 0) {
      return [0, 0, 0, 0]; // transparent outside
    }
  }

  // Inner Badge (Rounded container for emblem)
  // Maskable keeps content in inner 75% safe area
  const badgeScale = isMaskable ? 0.72 : 0.85;
  const badgeW = 400 * scale * badgeScale;
  const badgeH = 400 * scale * badgeScale;
  const badgeRad = 88 * scale * badgeScale;
  const dBadge = distToRoundedRect(x, y, cx - badgeW / 2, cy - badgeH / 2, badgeW, badgeH, badgeRad);

  if (dBadge <= 0) {
    // Gradient inside badge: top-left violet #8B5CF6 to bottom-right indigo #5B21B6
    const gradT = Math.max(0, Math.min(1, ((x - (cx - badgeW/2)) + (y - (cy - badgeH/2))) / (badgeW + badgeH)));
    let r = Math.round(139 * (1 - gradT) + 91 * gradT);
    let g = Math.round(92 * (1 - gradT) + 33 * gradT);
    let b = Math.round(246 * (1 - gradT) + 182 * gradT);

    // Subtle inner border / glow
    if (dBadge > -3 * scale) {
      r = Math.min(255, r + 60);
      g = Math.min(255, g + 60);
      b = Math.min(255, b + 60);
    }

    // Now draw ExpenseFlow emblem:
    // A modern 'EF' wallet card + Upward Growth Arrow + Sparkle star
    const emScale = scale * badgeScale;

    // 1. Stylized Wallet / Card:
    // Centered rounded rect:
    const cw = 210 * emScale;
    const ch = 145 * emScale;
    const cr = 24 * emScale;
    const cardY = cy + 20 * emScale;
    const dWallet = distToRoundedRect(x, y, cx - cw / 2, cardY - ch / 2, cw, ch, cr);

    // Wallet card border or body
    if (dWallet <= 0) {
      // Wallet body: deep navy glass
      const glassT = Math.max(0, Math.min(1, (y - (cardY - ch/2)) / ch));
      r = Math.round(15 * (1 - glassT) + 26 * glassT);
      g = Math.round(22 * (1 - glassT) + 38 * glassT);
      b = Math.round(42 * (1 - glassT) + 68 * glassT);

      // Wallet card stripe
      const stripeY = cardY - 20 * emScale;
      if (Math.abs(y - stripeY) < 10 * emScale) {
        r = 139; g = 92; b = 246; // violet accent stripe
      }

      // Wallet card chip / latch
      const latchX = cx + 55 * emScale;
      const latchY = cardY + 5 * emScale;
      const dLatch = distToRoundedRect(x, y, latchX - 22 * emScale, latchY - 14 * emScale, 44 * emScale, 28 * emScale, 8 * emScale);
      if (dLatch <= 0) {
        r = 251; g = 191; b = 36; // Amber gold chip
      }

      // Card border
      if (dWallet > -2.5 * emScale) {
        r = 255; g = 255; b = 255;
      }
    }

    // 2. Upward Trend / Growth Arrow (Emerald green #10B981)
    // Shaft: from (cx - 70, cy + 40) to (cx + 50, cy - 80)
    const ax1 = cx - 65 * emScale;
    const ay1 = cy + 25 * emScale;
    const ax2 = cx + 30 * emScale;
    const ay2 = cy - 70 * emScale;
    const dShaft = distToSegment(x, y, ax1, ay1, ax2, ay2);

    // Arrowhead points
    const ah1 = distToSegment(x, y, ax2, ay2, ax2 - 35 * emScale, ay2 + 5 * emScale);
    const ah2 = distToSegment(x, y, ax2, ay2, ax2 - 5 * emScale, ay2 + 35 * emScale);

    const arrowDist = Math.min(dShaft, ah1, ah2);
    const strokeW = 14 * emScale;

    if (arrowDist <= strokeW) {
      // Glow and emerald color
      const edge = arrowDist / strokeW;
      r = Math.round(16 * (1 - edge) + 52 * edge);
      g = Math.round(185 * (1 - edge) + 211 * edge);
      b = Math.round(129 * (1 - edge) + 153 * edge);
      if (arrowDist <= 4 * emScale) {
        // Bright white-green core
        r = 240; g = 253; b = 244;
      }
    }

    // 3. Sparkle Star in top right (cx + 70, cy - 85)
    const spX = cx + 65 * emScale;
    const spY = cy - 75 * emScale;
    const spDx = Math.abs(x - spX);
    const spDy = Math.abs(y - spY);
    // 4-point sparkle equation: (dx^0.5 + dy^0.5) <= R^0.5
    const spR = 24 * emScale;
    const distSp = Math.sqrt(spDx) + Math.sqrt(spDy);
    if (distSp <= Math.sqrt(spR)) {
      r = 255; g = 255; b = 255; // Crisp white star
    }

    return [r, g, b, 255];
  }

  return [bgR, bgG, bgB, 255];
}

console.log('Generating PWA icons...');

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. icon-192x192.png
console.log('Writing icon-192x192.png...');
const icon192 = createPng(192, 192, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'icon-192x192.png'), icon192);

// 2. icon-512x512.png
console.log('Writing icon-512x512.png...');
const icon512 = createPng(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'icon-512x512.png'), icon512);

// 3. icon-maskable-192x192.png
console.log('Writing icon-maskable-192x192.png...');
const iconMaskable192 = createPng(192, 192, (x, y, w, h) => renderIconPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-192x192.png'), iconMaskable192);

// 4. icon-maskable-512x512.png
console.log('Writing icon-maskable-512x512.png...');
const iconMaskable512 = createPng(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-512x512.png'), iconMaskable512);

// 5. apple-touch-icon.png (180x180)
console.log('Writing apple-touch-icon.png...');
const appleIcon = createPng(180, 180, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

// 6. favicon.svg
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6"/>
      <stop offset="100%" stop-color="#5B21B6"/>
    </linearGradient>
    <linearGradient id="arrowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#34D399"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="115" fill="#0B0F19"/>
  <rect x="56" y="56" width="400" height="400" rx="90" fill="url(#bgGrad)" filter="url(#shadow)"/>
  
  <!-- Wallet / Ledger Card -->
  <rect x="156" y="210" width="200" height="135" rx="22" fill="#0F1626" stroke="#FFFFFF" stroke-width="3" opacity="0.95"/>
  <rect x="156" y="240" width="200" height="20" fill="#8B5CF6" opacity="0.6"/>
  <rect x="290" y="275" width="45" height="30" rx="8" fill="#FBBF24"/>
  
  <!-- Trending Arrow -->
  <path d="M190 285 L285 190" stroke="url(#arrowGrad)" stroke-width="26" stroke-linecap="round"/>
  <path d="M245 190 L285 190 L285 230" stroke="url(#arrowGrad)" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Sparkle Accent -->
  <path d="M335 150 Q335 170 355 170 Q335 170 335 190 Q335 170 315 170 Q335 170 335 150 Z" fill="#FFFFFF"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);

console.log('All icons generated successfully in public/');

