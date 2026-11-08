// Modelos de calzado dibujados en SVG vectorial (fondo transparente, escalan sin perder calidad).
// Cada silueta recibe una paleta c = {upper, panel, accent, mid, sole, lace}.
// Para usar fotos reales, sube la imagen desde /admin (o pon `img: 'ruta.png'` en data.js) y se usará en lugar del SVG.

const lace = (pts, color) =>
  pts.map(([x1, y1, x2, y2]) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="5" stroke-linecap="round"/>`
  ).join('');

const toe = (c) => `<path d="M296 128 C330 130 360 140 372 150 C386 158 384 166 370 168 L288 166 C284 150 286 136 296 128Z" fill="${c.panel}"/>`;
const stitch = (d) => `<path d="${d}" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="2" stroke-dasharray="4 5"/>`;
const shine = `<path d="M210 126 C260 124 316 134 352 150" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="6" stroke-linecap="round"/>`;

const SILHOUETTES = {
  low: (c) => `
    <path d="M26 190 Q26 178 34 176 L374 180 Q390 182 388 196 Q386 208 368 208 L44 206 Q26 204 26 190Z" fill="${c.sole}"/>
    <path d="M30 158 L372 164 Q390 168 388 182 L28 180 Q22 168 30 158Z" fill="${c.mid}"/>
    <path d="M150 82 L166 44 C170 36 182 36 186 44 L206 72Z" fill="${c.panel}"/>
    <path d="M34 162 C28 130 34 100 52 84 C64 74 84 72 100 78 C114 84 128 84 142 78 L206 72 L236 110 C280 118 330 126 362 142 C384 152 390 162 372 168Z" fill="${c.upper}"/>
    <path d="M34 162 C28 130 34 100 52 84 C60 78 70 76 80 78 C72 108 74 140 94 165Z" fill="${c.panel}"/>
    ${toe(c)}
    <path d="M104 152 C150 120 214 108 282 118 L288 132 C222 124 170 136 120 162Z" fill="${c.accent}"/>
    <path d="M52 84 C66 76 86 76 100 82" fill="none" stroke="rgba(0,0,0,.3)" stroke-width="4"/>
    ${stitch('M40 166 L366 172')}
    ${shine}
    ${lace([[156, 88, 174, 80], [176, 98, 196, 90], [196, 108, 216, 100], [214, 116, 232, 110]], c.lace)}`,

  high: (c) => `
    <path d="M26 190 Q26 178 34 176 L374 180 Q390 182 388 196 Q386 208 368 208 L44 206 Q26 204 26 190Z" fill="${c.sole}"/>
    <path d="M30 158 L372 164 Q390 168 388 182 L28 180 Q22 168 30 158Z" fill="${c.mid}"/>
    <path d="M140 52 L150 16 C154 8 166 8 170 16 L190 62Z" fill="${c.panel}"/>
    <path d="M36 164 C28 120 30 70 38 36 C40 26 48 22 58 24 L124 30 C134 32 138 40 140 52 L206 72 L236 110 C280 118 330 126 362 142 C384 152 390 162 372 168Z" fill="${c.upper}"/>
    <path d="M38 40 C40 26 48 22 58 24 L124 30 C134 32 138 40 138 48 C110 44 70 42 38 46Z" fill="${c.panel}"/>
    <path d="M36 164 C28 120 30 76 38 46 L62 48 C56 92 62 132 90 166Z" fill="${c.panel}"/>
    ${toe(c)}
    <path d="M108 154 C150 124 214 110 282 118 L288 132 C222 124 172 138 124 164Z" fill="${c.accent}"/>
    <circle cx="98" cy="80" r="14" fill="${c.accent}"/><circle cx="98" cy="80" r="5" fill="${c.upper}"/>
    ${stitch('M40 166 L366 172')}
    ${shine}
    ${lace([[144, 62, 160, 56], [160, 72, 178, 66], [178, 82, 198, 76], [198, 94, 216, 88], [216, 108, 232, 102]], c.lace)}`,

  boot: (c) => `
    <path d="M28 178 L374 182 Q390 184 388 198 L388 206 Q388 214 378 214 L40 212 Q26 212 26 200Z" fill="${c.sole}"/>
    ${Array.from({ length: 15 }, (_, i) => `<rect x="${42 + i * 22}" y="208" width="12" height="9" rx="2" fill="${c.sole}"/>`).join('')}
    <path d="M30 160 L372 164 Q390 168 388 182 L28 180 Q22 168 30 160Z" fill="${c.mid}"/>
    ${stitch('M34 171 L382 175')}
    <path d="M148 18 L152 4 L178 6 L174 64Z" fill="${c.panel}"/>
    <path d="M36 162 C32 120 34 60 42 22 C44 14 52 12 60 12 L146 16 C154 16 156 22 156 30 L156 92 C196 106 246 112 302 122 C342 128 372 140 380 156 C384 164 378 168 370 168Z" fill="${c.upper}"/>
    <path d="M36 162 C32 120 34 70 40 40 C62 62 72 112 102 164Z" fill="${c.panel}"/>
    <path d="M42 22 C44 14 52 12 60 12 L146 16 C154 16 156 22 156 30 C120 26 80 24 42 32Z" fill="${c.panel}"/>
    <path d="M290 120 C336 124 370 138 380 154 C384 164 378 168 370 168 L280 166 C276 146 280 130 290 120Z" fill="${c.panel}"/>
    ${stitch('M292 126 C284 136 282 150 286 162')}
    <rect x="46" y="-6" width="18" height="28" rx="5" fill="none" stroke="${c.accent}" stroke-width="5"/>
    ${shine}
    ${lace([[144, 34, 164, 46], [144, 46, 164, 34], [144, 54, 164, 66], [144, 66, 164, 54], [144, 74, 164, 86], [144, 86, 164, 74]], c.lace)}
    ${[34, 54, 74].map((y) => `<circle cx="162" cy="${y}" r="3.5" fill="${c.accent}"/>`).join('')}`,

  chelsea: (c) => `
    <path d="M28 182 L372 184 Q390 186 388 198 Q386 208 368 208 L44 206 Q26 206 26 194Z" fill="${c.sole}"/>
    <path d="M30 170 L374 174 Q388 178 386 186 L28 184 Q24 176 30 170Z" fill="${c.mid}"/>
    ${stitch('M34 178 L380 181')}
    <path d="M36 172 C32 130 36 70 44 30 C46 22 54 20 62 20 L148 22 C156 22 160 28 160 36 L162 100 C200 112 250 118 300 126 C342 132 372 146 380 162 C384 172 378 178 370 178Z" fill="${c.upper}"/>
    <path d="M118 22 L150 22 L158 112 L132 106 C124 80 118 50 118 22Z" fill="${c.panel}"/>
    ${[126, 134, 142, 150].map((x) => `<line x1="${x}" y1="28" x2="${x + 4}" y2="104" stroke="rgba(255,255,255,.12)" stroke-width="2"/>`).join('')}
    <path d="M42 30 L42 4 C42 -4 58 -4 58 4 L58 30Z" fill="${c.accent}"/>
    <path d="M262 124 C282 140 288 160 286 176" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="3"/>
    <path d="M200 132 C250 128 316 138 352 156" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="6" stroke-linecap="round"/>`,
};

function shoeSVG(p) {
  if (p.img) return `<img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy">`;
  const c = Object.fromEntries(Object.entries(p.c || {}).map(([k, v]) => [k, esc(v)]));
  const draw = SILHOUETTES[p.type] || SILHOUETTES.low;
  return `<svg viewBox="0 -14 400 240" role="img" aria-label="${esc(p.name)} ${esc(p.colorway)}" xmlns="http://www.w3.org/2000/svg">${draw(c)}</svg>`;
}
