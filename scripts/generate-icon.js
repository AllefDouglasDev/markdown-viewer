const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const { execFileSync } = require('child_process');

const GLYPH_M = [
  '#...#',
  '##.##',
  '#.#.#',
  '#...#',
  '#...#',
  '#...#',
  '#...#',
];

const GLYPH_D = [
  '###..',
  '#..#.',
  '#...#',
  '#...#',
  '#...#',
  '#..#.',
  '###..',
];

const GLYPH_WIDTH = 5;
const GLYPH_GAP = 1;
const COLS = GLYPH_WIDTH * 2 + GLYPH_GAP;
const ROWS = 7;

const PAD_RATIO = 0.03;
const RADIUS_RATIO = 0.2;
const BORDER_RATIO = 0.02;
const TEXT_WIDTH_RATIO = 0.66;

function cellOn(col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;
  if (col < GLYPH_WIDTH) return GLYPH_M[row][col] === '#';
  if (col < GLYPH_WIDTH + GLYPH_GAP) return false;
  return GLYPH_D[row][col - GLYPH_WIDTH - GLYPH_GAP] === '#';
}

function insideRoundRect(x, y, x0, y0, x1, y1, r) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + r), x1 - r);
  const cy = Math.min(Math.max(y, y0 + r), y1 - r);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function geometry(size) {
  const pad = size * PAD_RATIO;
  const border = Math.max(size * BORDER_RATIO, 1);
  const cell = (size * TEXT_WIDTH_RATIO) / COLS;
  return {
    pad,
    border,
    cell,
    radius: size * RADIUS_RATIO,
    x0: pad,
    y0: pad,
    x1: size - pad,
    y1: size - pad,
    textX: (size - cell * COLS) / 2,
    textY: (size - cell * ROWS) / 2,
  };
}

function renderPixels(size) {
  const g = geometry(size);
  const innerRadius = Math.max(g.radius - g.border, 0);
  const samples = 4;
  const rgba = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let alphaSum = 0;
      let lumaSum = 0;

      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const px = x + (sx + 0.5) / samples;
          const py = y + (sy + 0.5) / samples;

          const inCard = insideRoundRect(
            px, py,
            g.x0 + g.border, g.y0 + g.border,
            g.x1 - g.border, g.y1 - g.border,
            innerRadius
          );

          if (inCard) {
            const col = Math.floor((px - g.textX) / g.cell);
            const row = Math.floor((py - g.textY) / g.cell);
            alphaSum += 1;
            lumaSum += cellOn(col, row) ? 0 : 1;
            continue;
          }

          if (insideRoundRect(px, py, g.x0, g.y0, g.x1, g.y1, g.radius)) {
            alphaSum += 1;
          }
        }
      }

      const total = samples * samples;
      const alpha = alphaSum / total;
      const offset = (y * size + x) * 4;

      if (alpha === 0) continue;

      const luma = Math.round((lumaSum / alphaSum) * 255);
      rgba[offset] = luma;
      rgba[offset + 1] = luma;
      rgba[offset + 2] = luma;
      rgba[offset + 3] = Math.round(alpha * 255);
    }
  }

  return rgba;
}

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i++) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

function encodePng(size, rgba) {
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);

  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function renderPng(size) {
  return encodePng(size, renderPixels(size));
}

function encodeIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entries = Buffer.alloc(16 * images.length);
  let offset = 6 + 16 * images.length;

  images.forEach((image, index) => {
    const at = index * 16;
    entries[at] = image.size >= 256 ? 0 : image.size;
    entries[at + 1] = image.size >= 256 ? 0 : image.size;
    entries.writeUInt16LE(1, at + 4);
    entries.writeUInt16LE(32, at + 6);
    entries.writeUInt32LE(image.png.length, at + 8);
    entries.writeUInt32LE(offset, at + 12);
    offset += image.png.length;
  });

  return Buffer.concat([header, entries, ...images.map((image) => image.png)]);
}

function renderSvg(size) {
  const g = geometry(size);
  const rects = [];

  for (let row = 0; row < ROWS; row++) {
    let col = 0;
    while (col < COLS) {
      if (!cellOn(col, row)) {
        col++;
        continue;
      }
      let run = 1;
      while (cellOn(col + run, row)) run++;
      const x = +(g.textX + col * g.cell).toFixed(2);
      const y = +(g.textY + row * g.cell).toFixed(2);
      const w = +(run * g.cell).toFixed(2);
      const h = +g.cell.toFixed(2);
      rects.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#000000"/>`);
      col += run;
    }
  }

  const inner = g.border;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    `  <rect x="${g.x0}" y="${g.y0}" width="${g.x1 - g.x0}" height="${g.y1 - g.y0}" rx="${g.radius}" fill="#000000"/>`,
    `  <rect x="${g.x0 + inner}" y="${g.y0 + inner}" width="${g.x1 - g.x0 - inner * 2}" height="${g.y1 - g.y0 - inner * 2}" rx="${Math.max(g.radius - inner, 0)}" fill="#ffffff"/>`,
    ...rects,
    '</svg>',
    '',
  ].join('\n');
}

function writeIcns(buildDir) {
  if (process.platform !== 'darwin') return false;

  const iconset = fs.mkdtempSync(path.join(os.tmpdir(), 'markify-icon-')) + '/icon.iconset';
  fs.mkdirSync(iconset, { recursive: true });

  const variants = [
    ['icon_16x16.png', 16],
    ['icon_16x16@2x.png', 32],
    ['icon_32x32.png', 32],
    ['icon_32x32@2x.png', 64],
    ['icon_128x128.png', 128],
    ['icon_128x128@2x.png', 256],
    ['icon_256x256.png', 256],
    ['icon_256x256@2x.png', 512],
    ['icon_512x512.png', 512],
    ['icon_512x512@2x.png', 1024],
  ];

  const cache = new Map();
  for (const [name, size] of variants) {
    if (!cache.has(size)) cache.set(size, renderPng(size));
    fs.writeFileSync(path.join(iconset, name), cache.get(size));
  }

  try {
    execFileSync('iconutil', ['-c', 'icns', iconset, '-o', path.join(buildDir, 'icon.icns')]);
    return true;
  } catch (error) {
    console.warn('Skipping icon.icns:', error.message);
    return false;
  } finally {
    fs.rmSync(path.dirname(iconset), { recursive: true, force: true });
  }
}

const buildDir = path.join(__dirname, '..', 'build');
fs.mkdirSync(buildDir, { recursive: true });

fs.writeFileSync(path.join(buildDir, 'icon.png'), renderPng(1024));
fs.writeFileSync(path.join(buildDir, 'icon.svg'), renderSvg(1024));
fs.writeFileSync(
  path.join(buildDir, 'icon.ico'),
  encodeIco([16, 32, 48, 64, 128, 256].map((size) => ({ size, png: renderPng(size) })))
);

const icns = writeIcns(buildDir);

console.log('build/icon.png');
console.log('build/icon.svg');
console.log('build/icon.ico');
if (icns) console.log('build/icon.icns');
