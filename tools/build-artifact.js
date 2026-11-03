// Genera artifact.html (versión para publicar como Artifact de Claude) a partir de index.html.
// Uso: node tools/build-artifact.js
// Cambios: Tailwind desde su CDN fijado, sin service worker, sin botón de descarga (el visor la bloquea)
// y sin doble margen de zona segura (el visor ya lo aplica).
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const a = src.indexOf('<!-- @artifact-start -->'), b = src.indexOf('<!-- @artifact-end -->');
if (a < 0 || b < 0) throw new Error('Faltan los marcadores @artifact-start / @artifact-end');
let body = src.slice(a + '<!-- @artifact-start -->'.length, b)
  .replace(/^\s*<\/head>\s*$/m, '')
  .replace(/^\s*<body>\s*$/m, '');
const out = body.replace('<title>Velada</title>', [
  '<title>Velada</title>',
  '<script>window.__ARTIFACT__ = true; document.documentElement.lang = "es";</script>',
  '<script src="https://cdn.tailwindcss.com/3.4.17"></script>'
].join('\n')).replace('</style>', '  :root { --sat: 0px !important; --sab: 0px !important; }\n</style>');
fs.writeFileSync(path.join(root, 'artifact.html'), out.trim() + '\n');
console.log('artifact.html escrito (' + Math.round(out.length / 1024) + ' KB)');
