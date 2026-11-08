// Datos de la tienda. El panel /admin guarda una copia editada en localStorage;
// si existe, la tienda usa esa copia. "Restablecer demo" en el panel vuelve a estos valores.
// shortcut: los datos viven en el navegador de quien edita; para producción hay que moverlos a un backend o CMS.

const SIZES_COL = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44];
const MEN = [38, 39, 40, 41, 42, 43, 44];

const DEFAULT_DATA = {
  site: {
    brand: 'Zypher Sport Shop',
    accent: '#ff4d1a',
    announce: 'Envío gratis en compras desde $300.000 · Paga hasta en 6 cuotas sin interés',
    freeShip: 300000,
    installments: 6,
    heroEyebrow: 'Drop 07 — Temporada 2026',
    heroTitle: 'Camina la ciudad a *tu* ritmo.',
    heroLead: 'Siluetas urbanas con acabados de sastrería. Cuero, gamuza y suelas que aguantan el asfalto, en ediciones de 300 pares.',
    heroProduct: 'a2',
    editorialProduct: 'd1',
    editorialEyebrow: 'Drop 07 · Distrito Chelsea',
    editorialTitle: 'Urbano de día. Elegante de noche.',
    editorialText: 'Cuero plena flor curtido al vegetal, elástico reforzado y una suela de caucho que no se rinde ante el pavimento. Diseñada para pasar de la calle a la cena sin cambiarte.',
    footerText: 'Calzado urbano premium hecho en Colombia. Ediciones cortas, materiales nobles.',
  },
  products: [
    { id: 'a1', name: 'Zypher 01 Low', cat: 'tenis', type: 'low', price: 459900, tag: 'Nuevo', colorway: 'Hueso / Señal', rating: 4.9, reviews: 312, stock: 42, active: true,
      material: 'Cuero plena flor · forro textil · suela vulcanizada de caucho', sizes: SIZES_COL,
      desc: 'Low-top de cuero con plantilla de memoria y suela vulcanizada. El par de todos los días.',
      c: { upper: '#f1ede6', panel: '#d6cfc2', accent: '#ff4d1a', mid: '#ffffff', sole: '#1a1a1a', lace: '#f1ede6' } },
    { id: 'a2', name: 'Zypher 02 High', cat: 'altos', type: 'high', price: 589900, tag: 'Drop 07', colorway: 'Noche / Señal', rating: 4.8, reviews: 204, stock: 18, active: true,
      material: 'Gamuza y cuero · collar acolchado · suela de caucho goma', sizes: SIZES_COL,
      desc: 'Bota de cancha con collar acolchado y parche de tobillo. Soporte y actitud.',
      c: { upper: '#1c1c1c', panel: '#2e2e2e', accent: '#ff4d1a', mid: '#f1ede6', sole: '#8a5a2b', lace: '#f1ede6' } },
    { id: 'b1', name: 'Bloque Boot', cat: 'botas', type: 'boot', price: 719900, colorway: 'Tabaco', rating: 4.7, reviews: 158, stock: 9, active: true,
      material: 'Cuero engrasado · costura Goodyear · suela de taco Vibram', sizes: MEN,
      desc: 'Cuero engrasado, suela de taco y costura Goodyear. Hecha para durar años, no temporadas.',
      c: { upper: '#6b4226', panel: '#4e2f1b', accent: '#d9a441', mid: '#2a1d14', sole: '#151515', lace: '#d9a441' } },
    { id: 'd1', name: 'Distrito Chelsea', cat: 'chelsea', type: 'chelsea', price: 649900, tag: 'Drop 07', colorway: 'Café', rating: 4.9, reviews: 97, stock: 23, active: true,
      material: 'Cuero plena flor curtido vegetal · elástico reforzado · cosido Blake', sizes: SIZES_COL,
      desc: 'Cuero plena flor con elástico reforzado. Se calza en un segundo, se nota toda la noche.',
      c: { upper: '#4a3022', panel: '#1a1a1a', accent: '#c08a5a', mid: '#1f1f1f', sole: '#111111' } },
    { id: 'a3', name: 'Zypher 01 Low', cat: 'tenis', type: 'low', price: 369900, was: 459900, colorway: 'Carbón / Ácido', rating: 4.8, reviews: 312, stock: 4, active: true,
      material: 'Cuero plena flor · forro textil · suela vulcanizada de caucho', sizes: SIZES_COL,
      desc: 'Low-top de cuero con plantilla de memoria y suela vulcanizada. El par de todos los días.',
      c: { upper: '#2a2a2a', panel: '#1b1b1b', accent: '#c8ff3d', mid: '#ece8e0', sole: '#111111', lace: '#111111' } },
    { id: 'a4', name: 'Concreto Runner', cat: 'tenis', type: 'low', price: 429900, colorway: 'Concreto', rating: 4.6, reviews: 88, stock: 30, active: true,
      material: 'Malla técnica y gamuza · mediasuela EVA · suela de caucho', sizes: SIZES_COL,
      desc: 'Runner urbano con mediasuela EVA ultraliviana. Para caminar la ciudad entera.',
      c: { upper: '#a19c92', panel: '#75716a', accent: '#f1ede6', mid: '#f1ede6', sole: '#3a3a3a', lace: '#f1ede6' } },
    { id: 'a5', name: 'Zypher 02 High', cat: 'altos', type: 'high', price: 589900, colorway: 'Arena', rating: 4.7, reviews: 204, stock: 15, active: true,
      material: 'Gamuza y cuero · collar acolchado · suela de caucho goma', sizes: SIZES_COL,
      desc: 'Bota de cancha con collar acolchado y parche de tobillo. Soporte y actitud.',
      c: { upper: '#d8c7a6', panel: '#bfa982', accent: '#3b2f22', mid: '#f4efe6', sole: '#7a4b25', lace: '#3b2f22' } },
    { id: 'b2', name: 'Bloque Boot', cat: 'botas', type: 'boot', price: 719900, tag: 'Últimos pares', colorway: 'Negro Total', rating: 4.8, reviews: 158, stock: 3, active: true,
      material: 'Cuero engrasado · costura Goodyear · suela de taco Vibram', sizes: MEN,
      desc: 'Cuero engrasado, suela de taco y costura Goodyear. Hecha para durar años, no temporadas.',
      c: { upper: '#1e1e1e', panel: '#121212', accent: '#ff4d1a', mid: '#262626', sole: '#0b0b0b', lace: '#ff4d1a' } },
    { id: 'a6', name: 'Cancha High', cat: 'altos', type: 'high', price: 449900, was: 529900, colorway: 'Blanco / Bosque', rating: 4.5, reviews: 61, stock: 12, active: true,
      material: 'Cuero liso · plantilla acolchada · suela de caucho', sizes: SIZES_COL,
      desc: 'Clásico de cancha con contrafuerte verde bosque. Va con todo.',
      c: { upper: '#f4f2ee', panel: '#1f4d3a', accent: '#1f4d3a', mid: '#ffffff', sole: '#e6e1d7', lace: '#f4f2ee' } },
    { id: 'b3', name: 'Trinchera Boot', cat: 'botas', type: 'boot', price: 769900, colorway: 'Oliva', rating: 4.7, reviews: 43, stock: 7, active: true,
      material: 'Nobuk impermeable · forro térmico · suela de taco', sizes: MEN,
      desc: 'Bota de nobuk impermeable con forro térmico. Lista para la lluvia de Bogotá.',
      c: { upper: '#4b5233', panel: '#383d26', accent: '#e9e4da', mid: '#2b2b2b', sole: '#1a1a1a', lace: '#e9e4da' } },
    { id: 'd2', name: 'Distrito Chelsea', cat: 'chelsea', type: 'chelsea', price: 649900, colorway: 'Ónix', rating: 4.9, reviews: 97, stock: 0, active: true,
      material: 'Cuero plena flor curtido vegetal · elástico reforzado · cosido Blake', sizes: SIZES_COL,
      desc: 'Cuero plena flor con elástico reforzado. Se calza en un segundo, se nota toda la noche.',
      c: { upper: '#151515', panel: '#2b2b2b', accent: '#8a8780', mid: '#1f1f1f', sole: '#0b0b0b' } },
    { id: 'a7', name: 'Concreto Runner', cat: 'tenis', type: 'low', price: 429900, tag: 'Nuevo', colorway: 'Hielo / Cobalto', rating: 4.6, reviews: 88, stock: 26, active: true,
      material: 'Malla técnica y gamuza · mediasuela EVA · suela de caucho', sizes: SIZES_COL,
      desc: 'Runner urbano con mediasuela EVA ultraliviana. Para caminar la ciudad entera.',
      c: { upper: '#dfe6ea', panel: '#a9b8c2', accent: '#2a5bff', mid: '#ffffff', sole: '#c9d3da', lace: '#dfe6ea' } },
  ],
};

const CATS = { todo: 'Todo', tenis: 'Tenis', altos: 'Altos', botas: 'Botas', chelsea: 'Chelsea', ofertas: 'Ofertas', favs: 'Favoritos' };
const DATA_KEY = 'zypher-data-v1';

function loadData() {
  try {
    const d = JSON.parse(localStorage.getItem(DATA_KEY));
    if (d && Array.isArray(d.products) && d.site) return { site: { ...DEFAULT_DATA.site, ...d.site }, products: d.products };
  } catch { /* datos corruptos o sin storage: usamos la demo */ }
  return structuredClone(DEFAULT_DATA);
}

// Lanza error si el navegador no tiene espacio (imágenes muy pesadas): el panel lo muestra.
function saveData(d) { localStorage.setItem(DATA_KEY, JSON.stringify(d)); }

const money = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
// Logo: isotipo (Z itálica cuya base es una suela con tacos + estelas de viento) y logotipo con el nombre de la marca.
const LOGO_MARK = `<g class="zbody">  <path class="ink" d="M20 12H56L52 22H16Z"/>  <path class="ink" d="M40 22H52L28 42H16Z"/>  <path class="acc" d="M12 42H29L25 52H8Z"/>  <path class="acc" d="M31 42H39L35 52H27Z"/>  <path class="acc" d="M41 42H48L44 52H37Z"/> </g> <path class="streak" d="M19 27H30"/> <path class="streak" d="M11 32H24"/> <path class="streak" d="M4 37H18"/>`;
const logoHTML = (brand) => {
  const [first, ...rest] = String(brand).trim().split(/\s+/);
  return `<svg class="mark" viewBox="0 0 64 64" role="img" aria-hidden="true">${LOGO_MARK}</svg><span class="wm"><b>${esc(first)}</b>${rest.length ? `<small>${esc(rest.join(' '))}</small>` : ''}</span>`;
};
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
