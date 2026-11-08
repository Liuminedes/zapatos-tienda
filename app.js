// Productos y textos vienen de data.js (o de lo que se edite en /admin).
const DATA = loadData();
const SITE = DATA.site;
const PRODUCTS = DATA.products.filter((p) => p.active !== false);
const CAT_ORDER = ['tenis', 'altos', 'botas', 'chelsea'];

const $ = (s) => document.querySelector(s);
const byId = (id) => PRODUCTS.find((p) => p.id === id);
const siblings = (p) => PRODUCTS.filter((x) => x.name === p.name);
const stars = (r) => '★'.repeat(Math.round(r || 0)) + '☆'.repeat(5 - Math.round(r || 0));
const priceHTML = (p) => `${money(p.price)}${p.was ? `<s>${money(p.was)}</s>` : ''}`;
const soldOut = (p) => Number(p.stock) <= 0;

const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin storage: vive solo en esta visita */ } },
};

// ---------- Contenido editable del sitio ----------
function applySite() {
  document.documentElement.style.setProperty('--accent', SITE.accent);
  document.title = `${SITE.brand} — Calzado urbano premium`;
  $('#heroBg').textContent = SITE.brand.trim().split(/\s+/)[0];
  document.querySelectorAll('.logo').forEach((l) => { l.innerHTML = logoHTML(SITE.brand); });
  $('#announce').textContent = SITE.announce;
  $('#heroEyebrow').textContent = SITE.heroEyebrow;
  $('#heroTitle').innerHTML = esc(SITE.heroTitle).replace(/\*(.+?)\*/g, '<em>$1</em>');
  $('#heroLead').textContent = SITE.heroLead;
  $('#trustShip').textContent = `Desde ${money(SITE.freeShip)} · 1–3 días hábiles`;
  $('#trustInst').textContent = `Hasta ${SITE.installments} cuotas sin interés`;
  $('#edEyebrow').textContent = SITE.editorialEyebrow;
  $('#edTitle').textContent = SITE.editorialTitle;
  $('#edText').textContent = SITE.editorialText;
  $('#footerText').textContent = SITE.footerText;

  const hero = byId(SITE.heroProduct) || PRODUCTS[0];
  const ed = byId(SITE.editorialProduct) || PRODUCTS[0];
  if (hero) {
    $('#heroShoe').innerHTML = shoeSVG(hero);
    $('#heroTag').dataset.open = hero.id;
    $('#heroTag').innerHTML = `<span>${esc(hero.name)}</span><b>${money(hero.price)}</b>`;
  }
  if (ed) {
    $('#editorialShoe').innerHTML = shoeSVG(ed);
    $('#edBtn').dataset.open = ed.id;
    $('#edBtn').textContent = `Comprar ${ed.name} · ${money(ed.price)}`;
  }
}

// ---------- Favoritos ----------
let favs = new Set(store.get('zypher-favs', []).filter(byId));
function toggleFav(id) {
  favs.has(id) ? favs.delete(id) : favs.add(id);
  store.set('zypher-favs', [...favs]);
  renderFavCount();
  renderFilters();
  renderGrid();
  if (current?.id === id) $('#pFav').setAttribute('aria-pressed', favs.has(id));
  toast(favs.has(id) ? 'Agregado a favoritos' : 'Quitado de favoritos');
}
function renderFavCount() {
  $('#favCount').textContent = favs.size;
  $('#favCount').hidden = !favs.size;
}

// ---------- Categorías ----------
$('#cats').innerHTML = CAT_ORDER.map((cat) => {
  const list = PRODUCTS.filter((p) => p.cat === cat);
  if (!list.length) return '';
  return `<button class="cat" data-goto="${cat}">
    <div><h3>${CATS[cat]}</h3><small>${list.length} ${list.length === 1 ? 'modelo' : 'modelos'}</small></div>
    ${shoeSVG(list[list.length - 1])}
    <span class="go">Comprar →</span>
  </button>`;
}).join('');

// ---------- Catálogo ----------
let filter = 'todo';
let sort = 'feat';
let query = '';

function renderFilters() {
  $('#filters').innerHTML = Object.entries(CATS).map(([k, v]) =>
    `<button role="tab" aria-selected="${k === filter}" data-cat="${k}">${v}${k === 'favs' && favs.size ? ` (${favs.size})` : ''}</button>`).join('');
}

function visible() {
  const q = query.trim().toLowerCase();
  const list = PRODUCTS.filter((p) =>
    (filter === 'todo' || p.cat === filter || (filter === 'ofertas' && p.was) || (filter === 'favs' && favs.has(p.id))) &&
    (!q || `${p.name} ${p.colorway} ${p.cat} ${p.material || ''}`.toLowerCase().includes(q)));
  const by = { asc: (a, b) => a.price - b.price, desc: (a, b) => b.price - a.price, rating: (a, b) => (b.rating || 0) - (a.rating || 0) };
  return by[sort] ? [...list].sort(by[sort]) : list;
}

function badgeHTML(p) {
  if (soldOut(p)) return '<span class="badge out">Agotado</span>';
  if (p.was) return `<span class="badge sale">-${Math.round((1 - p.price / p.was) * 100)}%</span>`;
  return p.tag ? `<span class="badge">${esc(p.tag)}</span>` : '';
}

function renderGrid() {
  const list = visible();
  $('#resultCount').textContent = `${list.length} ${list.length === 1 ? 'producto' : 'productos'}`;
  $('#grid').innerHTML = list.length ? list.map((p) => {
    const sw = siblings(p);
    return `<article class="card">
      ${badgeHTML(p)}
      <button class="icon-btn fav" data-fav="${p.id}" aria-pressed="${favs.has(p.id)}" aria-label="Favorito ${esc(p.name)} ${esc(p.colorway)}"><svg><use href="#i-heart"/></svg></button>
      <div class="card-art">
        <button data-open="${p.id}" aria-label="Ver ${esc(p.name)} ${esc(p.colorway)}" style="width:100%">${shoeSVG(p)}</button>
        <button class="quick" data-open="${p.id}">${soldOut(p) ? 'Ver detalles' : 'Agregar rápido'}</button>
      </div>
      <div class="card-body">
        ${sw.length > 1 ? `<div class="swatches">${sw.map((s) => `<button data-open="${s.id}" style="background:${esc(s.c?.upper)}" aria-current="${s.id === p.id}" aria-label="${esc(s.colorway)}"></button>`).join('')}</div>` : ''}
        <h3><a href="#" data-open="${p.id}">${esc(p.name)}</a></h3>
        <p class="cw">${esc(p.colorway)}${sw.length > 1 ? ` · ${sw.length} colores` : ''}</p>
        <div class="card-meta"><span class="price-line">${priceHTML(p)}</span><span class="rating">${p.rating || '–'} (${p.reviews || 0})</span></div>
      </div>
    </article>`;
  }).join('') : `<p class="empty-state">${filter === 'favs' ? 'Aún no tienes favoritos. Toca el ♡ de cualquier par.' : 'No encontramos pares con esa búsqueda.'}</p>`;
}

function goTo(cat) {
  filter = cat;
  query = '';
  $('#search').value = '';
  renderFilters();
  renderGrid();
  $('#catalogo').scrollIntoView();
}

$('#filters').addEventListener('click', (e) => {
  const b = e.target.closest('[data-cat]');
  if (!b) return;
  filter = b.dataset.cat;
  renderFilters();
  renderGrid();
});
$('#sort').addEventListener('change', (e) => { sort = e.target.value; renderGrid(); });
$('#search').addEventListener('input', (e) => { query = e.target.value; renderGrid(); });
$('#searchBtn').addEventListener('click', () => { $('#catalogo').scrollIntoView(); $('#search').focus({ preventScroll: true }); });
$('#favBtn').addEventListener('click', () => goTo('favs'));
$('#userBtn').addEventListener('click', () => toast('Demo: aquí iría el inicio de sesión'));

// ---------- Detalle ----------
const dlg = $('#product');
let current = null;
let size = null;

function openProduct(id) {
  current = byId(id);
  if (!current) return;
  size = null;
  const sw = siblings(current);
  $('#pArt').innerHTML = shoeSVG(current);
  $('#pThumbs').innerHTML = sw.length > 1 ? sw.map((s) => `<button data-open="${s.id}" aria-current="${s.id === id}" aria-label="${esc(s.colorway)}">${shoeSVG(s)}</button>`).join('') : '';
  $('#pCat').textContent = `Inicio / ${CATS[current.cat] || current.cat}`;
  $('#pName').textContent = current.name;
  $('#pRating').innerHTML = `<span class="stars">${stars(current.rating)}</span>${current.rating || '–'} · ${current.reviews || 0} reseñas`;
  $('#pPrice').innerHTML = priceHTML(current);
  $('#pDesc').textContent = current.desc || '';
  $('#pMaterial').textContent = current.material || '';
  $('#pMaterial').hidden = !current.material;
  $('#pColor').textContent = current.colorway;
  $('#pSwatches').innerHTML = sw.map((s) => `<button data-open="${s.id}" style="background:${esc(s.c?.upper)}" aria-current="${s.id === id}" aria-label="${esc(s.colorway)}"></button>`).join('');
  $('#pSizes').innerHTML = (current.sizes || []).map((s) => `<button data-size="${s}" aria-pressed="false" ${soldOut(current) ? 'disabled' : ''}>${s}</button>`).join('');
  $('#pStock').textContent = soldOut(current) ? 'Agotado · vuelve pronto' : current.stock <= 5 ? `¡Solo quedan ${current.stock} pares!` : '';
  $('#pInstN').textContent = SITE.installments;
  $('#pMsi').textContent = money(Math.ceil(current.price / SITE.installments));
  $('#pFav').setAttribute('aria-pressed', favs.has(id));
  updateAddBtn();
  if (!dlg.open) dlg.showModal();
}

function updateAddBtn() {
  const b = $('#pAdd');
  b.disabled = soldOut(current) || size === null;
  b.textContent = soldOut(current) ? 'Agotado' : size === null ? 'Elige tu talla' : `Agregar al carrito · ${money(current.price)}`;
}

$('#pSizes').addEventListener('click', (e) => {
  const b = e.target.closest('[data-size]');
  if (!b) return;
  size = Number(b.dataset.size);
  $('#pSizes').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
  updateAddBtn();
});
$('#pAdd').addEventListener('click', () => {
  addToCart(current.id, size);
  dlg.close();
  toggleCart(true);
});
$('#pFav').addEventListener('click', () => toggleFav(current.id));
$('#sizeGuide').addEventListener('click', () => toast('Talla COL: mide tu pie en cm. 24 cm → 38 · 25 cm → 39 · 26 cm → 40 · 27 cm → 42'));
dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
dlg.addEventListener('close', () => { current = null; });

document.addEventListener('click', (e) => {
  const o = e.target.closest('[data-open]');
  const g = e.target.closest('[data-goto]');
  const f = e.target.closest('[data-fav]');
  if (f) return toggleFav(f.dataset.fav);
  if (o) { e.preventDefault(); openProduct(o.dataset.open); }
  if (g) { e.preventDefault(); goTo(g.dataset.goto); }
});

// ---------- Carrito ----------
let cart = store.get('zypher-cart', []).filter((i) => byId(i.id));
const subtotal = (items) => items.reduce((t, i) => t + byId(i.id).price * i.qty, 0);

function addToCart(id, s) {
  const hit = cart.find((i) => i.id === id && i.size === s);
  if (hit) hit.qty++;
  else cart.push({ id, size: s, qty: 1 });
  store.set('zypher-cart', cart);
  renderCart();
}

function renderCart() {
  const count = cart.reduce((t, i) => t + i.qty, 0);
  $('#cartCount').textContent = count;
  $('#cartCount').hidden = !count;
  $('#cartItems').innerHTML = cart.length ? cart.map((i, idx) => {
    const p = byId(i.id);
    return `<li>
      <div class="ci-art">${shoeSVG(p)}</div>
      <div class="ci-info">
        <b>${esc(p.name)}</b><span class="muted small">${esc(p.colorway)} · Talla ${i.size}</span>
        <div class="qty">
          <button data-q="${idx}" data-d="-1" aria-label="Quitar uno">−</button><span>${i.qty}</span><button data-q="${idx}" data-d="1" aria-label="Agregar uno">+</button>
        </div>
      </div>
      <b>${money(p.price * i.qty)}</b>
    </li>`;
  }).join('') : '<li class="empty">Tu carrito está vacío.<br><a href="#catalogo" data-close-cart>Explorar catálogo</a></li>';
  const total = subtotal(cart);
  $('#cartTotal').textContent = money(total);
  $('#shipNote').textContent = total >= SITE.freeShip ? '¡Tienes envío gratis!' : `Te faltan ${money(SITE.freeShip - total)} para envío gratis`;
  $('#shipFill').style.width = `${Math.min(100, (total / SITE.freeShip) * 100)}%`;
  $('#checkout').disabled = !cart.length;
}

$('#cartItems').addEventListener('click', (e) => {
  const b = e.target.closest('[data-q]');
  if (b) {
    const i = cart[b.dataset.q];
    i.qty += Number(b.dataset.d);
    if (i.qty <= 0) cart.splice(b.dataset.q, 1);
    store.set('zypher-cart', cart);
    renderCart();
  }
  if (e.target.closest('[data-close-cart]')) toggleCart(false);
});

function toggleCart(open) {
  $('#cart').classList.toggle('open', open);
  $('#cart').setAttribute('aria-hidden', !open);
  $('#scrim').hidden = !open;
}
$('#openCart').addEventListener('click', () => toggleCart(true));
$('#closeCart').addEventListener('click', () => toggleCart(false));
$('#scrim').addEventListener('click', () => toggleCart(false));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleCart(false); });
// Demo: aquí conectarías Wompi / PayU / Mercado Pago / Shopify.
$('#checkout').addEventListener('click', () => toast('Demo: aquí se conecta la pasarela de pago (Wompi, PayU…)'));

// ---------- Varios ----------
let tt;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(tt);
  tt = setTimeout(() => t.classList.remove('show'), 2800);
}

$('#newsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  $('#newsMsg').textContent = '¡Listo! Tu código de 10% va en camino.';
  e.target.reset();
});

applySite();
renderFavCount();
renderFilters();
renderGrid();
renderCart();

if (byId('a1') && byId('b1')) console.assert(subtotal([{ id: 'a1', qty: 2 }, { id: 'b1', qty: 1 }]) === byId('a1').price * 2 + byId('b1').price, 'subtotal incorrecto');
