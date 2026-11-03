// Genera los iconos PNG de la app (luna creciente sobre índigo) sin dependencias.
// Uso: node tools/make-icons.js   → escribe velada/icons/*.png y los mipmap de Android si existe ../velada-apk
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, pixel) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x + 0.5, y + 0.5, size);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// Geometría del icono en coordenadas 0..1: luna creciente dorada y un destello sobre índigo nocturno
const TOP = [49, 46, 129], BOTTOM = [30, 27, 75], GOLD = [251, 191, 36], PALE = [254, 243, 199];
function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function sdRoundRect(px, py, r) { const dx = Math.abs(px - 0.5) - (0.5 - r), dy = Math.abs(py - 0.5) - (0.5 - r); return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - r; }
function sdCircle(px, py, cx, cy, r) { return Math.hypot(px - cx, py - cy) - r; }
function sdSparkle(px, py, cx, cy, r) { // estrella de cuatro puntas (astroide)
  const x = Math.abs(px - cx) / r, y = Math.abs(py - cy) / r;
  return (Math.pow(x, 0.5) + Math.pow(y, 0.5) - 1) * r * 0.35;
}
function shade(maskable) {
  return (x, y, size) => {
    const px = x / size, py = y / size, aa = 1 / size;
    const cov = (d) => Math.max(0, Math.min(1, 0.5 - d / aa));
    let alpha = maskable ? 1 : cov(sdRoundRect(px, py, 0.22));
    let col = mix(TOP, BOTTOM, py);
    const s = maskable ? 0.78 : 1, o = (v) => 0.5 + (v - 0.5) * s;
    // halo cálido detrás de la luna
    const glow = Math.max(0, 1 - Math.hypot(px - o(0.46), py - o(0.52)) / (0.42 * s));
    col = mix(col, GOLD, glow * glow * 0.22);
    // luna creciente: círculo menos un círculo desplazado
    const moon = Math.max(sdCircle(px, py, o(0.46), o(0.54), 0.27 * s), -sdCircle(px, py, o(0.58), o(0.45), 0.235 * s));
    col = mix(col, mix(PALE, GOLD, Math.min(1, Math.max(0, (px - o(0.2)) / (0.4 * s)))), cov(moon));
    // destello
    col = mix(col, PALE, cov(sdSparkle(px, py, o(0.73), o(0.3), 0.11 * s)));
    return [Math.round(col[0]), Math.round(col[1]), Math.round(col[2]), Math.round(alpha * 255)];
  };
}

const root = path.join(__dirname, '..');
const out = path.join(root, 'icons');
fs.mkdirSync(out, { recursive: true });
for (const s of [180, 192, 512]) fs.writeFileSync(path.join(out, `icon-${s}.png`), png(s, shade(false)));
fs.writeFileSync(path.join(out, 'icon-512-maskable.png'), png(512, shade(true)));
console.log('icons escritos en', out);

// Android (Capacitor): reemplaza los mipmap si el proyecto existe
const res = path.join(root, '..', 'velada-apk', 'android', 'app', 'src', 'main', 'res');
if (fs.existsSync(res)) {
  const dens = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
  for (const [d, s] of Object.entries(dens)) {
    const dir = path.join(res, `mipmap-${d}`);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'ic_launcher.png'), png(s, shade(false)));
    fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), png(s, shade(true)));
    fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), png(Math.round(s * 1.5), shade(true)));
  }
  const colors = path.join(res, 'values', 'ic_launcher_background.xml');
  if (fs.existsSync(colors)) fs.writeFileSync(colors, '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#312E81</color>\n</resources>\n');
  console.log('mipmap de Android actualizados');
}
