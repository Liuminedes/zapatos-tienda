// Panel admin de demostración. Edita los mismos datos que lee la tienda (data.js → localStorage).
// shortcut: sin login ni servidor; para producción va detrás de autenticación y guarda en una base de datos.

let data = loadData();
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const ALL_SIZES = [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
const COLOR_KEYS = { upper: 'Capellada', panel: 'Paneles', accent: 'Acento', mid: 'Mediasuela', sole: 'Suela', lace: 'Cordones' };
const ACCENTS = ['#ff4d1a', '#c8ff3d', '#2a5bff', '#e9c46a', '#ff3d7f', '#3ecf8e', '#f1ede6'];
const CAT_KEYS = ['tenis', 'altos', 'botas', 'chelsea'];
const VIEWS = {
  dash: ['Resumen', 'Así va tu tienda hoy'],
  products: ['Productos', 'Catálogo, precios, inventario e imágenes'],
  orders: ['Pedidos', 'Seguimiento y estados de envío'],
  content: ['Contenido', 'Textos y secciones de la página principal'],
  look: ['Apariencia', 'Nombre de la marca y color de la tienda'],
};
const STATUS = ['Pendiente', 'Pagado', 'Enviado', 'Entregado', 'Cancelado'];
const STATUS_PILL = { Pendiente: 'warn', Pagado: 'info', Enviado: 'info', Entregado: 'ok', Cancelado: 'bad' };
const CITIES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Pereira', 'Cartagena'];
const NAMES = ['Valentina Gómez', 'Santiago Ríos', 'Camila Herrera', 'Andrés Pardo', 'Laura Mejía', 'Juan Esteban Cruz', 'Mariana López', 'Felipe Ortiz'];
const SALES = { // millones COP, ejemplo
  week: { labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'], values: [3.2, 4.1, 2.6, 5.4, 4.8, 6.9, 5.7] },
  month: { labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'], values: [21.4, 26.8, 24.1, 32.7] },
};
const ORDERS_KEY = 'zypher-orders-v1';
const RAIL_KEY = 'zypher-admin-rail';
const ls = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* demo */ } },
};

let view = 'dash';
let range = 'week';
let catFilter = '';
let statusFilter = '';

// ---------- Toasts ----------
function toast(msg, type = 'ok') {
  const el = document.createElement('div');
  el.className = `toast ${type === 'err' ? 'err' : ''}`;
  el.innerHTML = `<span class="t-ico"><svg><use href="#${type === 'err' ? 'i-alert' : 'i-check'}"/></svg></span><span></span>`;
  el.lastChild.textContent = msg;
  $('#toasts').append(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 2800);
}

function persist(msg = 'Cambios guardados') {
  try {
    saveData(data);
    if (msg) toast(msg);
    return true;
  } catch {
    toast('No hay espacio en el navegador: usa imágenes más livianas o una URL', 'err');
    data = loadData();
    return false;
  }
}

// ---------- Diálogos con animación de salida ----------
function closeDialog(d) {
  if (!d.open || d.classList.contains('closing')) return;
  d.classList.add('closing');
  // fallback por si la animación no corre (movimiento reducido, pestaña en segundo plano)
  const done = () => { if (!d.classList.contains('closing')) return; d.classList.remove('closing'); d.close(); };
  d.addEventListener('animationend', done, { once: true });
  setTimeout(done, 350);
}
$$('dialog').forEach((d) => {
  d.addEventListener('cancel', (e) => { e.preventDefault(); closeDialog(d); });
  d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) closeDialog(d); });
});

function confirmDialog({ title, text, ok = 'Confirmar' }) {
  const d = $('#confirmDlg');
  $('#confirmTitle').textContent = title;
  $('#confirmText').textContent = text;
  $('#confirmYes').textContent = ok;
  d.showModal();
  $('#confirmNo').focus();
  return new Promise((resolve) => {
    const done = (v) => { cleanup(); closeDialog(d); resolve(v); };
    const yes = () => done(true);
    const no = () => done(false);
    const onClose = () => { cleanup(); resolve(false); };
    function cleanup() {
      $('#confirmYes').removeEventListener('click', yes);
      $('#confirmNo').removeEventListener('click', no);
      d.removeEventListener('close', onClose);
    }
    $('#confirmYes').addEventListener('click', yes);
    $('#confirmNo').addEventListener('click', no);
    d.addEventListener('close', onClose);
  });
}

// ---------- Sidebar / cajón móvil ----------
if (ls.get(RAIL_KEY)) document.body.classList.add('rail');
$('#collapseBtn').addEventListener('click', () => {
  const on = document.body.classList.toggle('rail');
  ls.set(RAIL_KEY, on);
});
const setDrawer = (open) => document.body.classList.toggle('drawer-open', open);
document.addEventListener('click', (e) => {
  const d = e.target.closest('[data-drawer]');
  if (d) setDrawer(d.dataset.drawer === 'open');
});

// ---------- Popovers ----------
function togglePop(btn, pop, force) {
  const open = force ?? pop.hidden;
  $$('.popover').forEach((p) => { p.hidden = true; });
  $$('[aria-controls]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  pop.hidden = !open;
  btn.setAttribute('aria-expanded', open);
}
$('#bellBtn').addEventListener('click', (e) => { e.stopPropagation(); togglePop($('#bellBtn'), $('#bellPop')); });
$('#moreBtn').addEventListener('click', (e) => { e.stopPropagation(); togglePop($('#moreBtn'), $('#morePop')); });
document.addEventListener('click', (e) => { if (!e.target.closest('.popover')) $$('.popover').forEach((p) => { p.hidden = true; }); });
$('#morePop').addEventListener('click', (e) => { if (e.target.closest('button')) $('#morePop').hidden = true; });

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { setDrawer(false); $$('.popover').forEach((p) => { p.hidden = true; }); }
  if (e.key === '/' && !e.target.closest('input, textarea, select') && !document.querySelector('dialog[open]')) {
    e.preventDefault();
    $('#globalSearch').offsetParent ? $('#globalSearch').focus() : (show('products'), $('#pSearch').focus());
  }
});

// ---------- Navegación ----------
async function show(next) {
  if (dirty.size && next !== view && !(await confirmDiscard())) return;
  view = next;
  $$('.view').forEach((v) => {
    const on = v.id === `view-${next}`;
    v.hidden = !on;
    v.classList.remove('enter');
    if (on) { void v.offsetWidth; v.classList.add('enter'); }
  });
  $$('#sideNav [data-view], #tabbar [data-view]').forEach((b) => b.setAttribute('aria-current', b.dataset.view === next));
  [$('#viewTitle').textContent, $('#viewSub').textContent] = VIEWS[next];
  history.replaceState(null, '', `#${next}`);
  setDrawer(false);
  window.scrollTo({ top: 0 });
  render();
}
document.addEventListener('click', (e) => {
  const v = e.target.closest('[data-view]');
  if (v) show(v.dataset.view);
});

$('#globalSearch').addEventListener('input', (e) => {
  $('#pSearch').value = e.target.value;
  if (view !== 'products') show('products');
  else renderProducts();
});

// ---------- Pedidos de demostración ----------
function demoOrders() {
  const saved = ls.get(ORDERS_KEY);
  if (Array.isArray(saved)) return saved;
  const ps = DEFAULT_DATA.products;
  return Array.from({ length: 14 }, (_, i) => {
    const p = ps[(i * 5) % ps.length];
    const qty = 1 + (i % 4 === 0);
    return {
      id: `#10${52 - i}`, pid: p.id, cat: p.cat, customer: NAMES[i % NAMES.length], city: CITIES[i % CITIES.length],
      item: `${p.name} · ${p.colorway}`, size: p.sizes[(i * 3) % p.sizes.length], qty, total: p.price * qty,
      date: new Date(Date.now() - i * 14 * 3600e3).toISOString(), status: i === 6 ? 'Cancelado' : STATUS[i % 4],
    };
  });
}
let orders = demoOrders();
const fmtDate = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
const statusPill = (s) => `<span class="pill ${STATUS_PILL[s]}">${s}</span>`;
const stockPill = (n) => `<span class="pill ${n <= 0 ? 'bad' : n <= 5 ? 'warn' : 'ok'}">${n <= 0 ? 'Agotado' : `${n} uds`}</span>`;
const lowStock = () => data.products.filter((p) => Number(p.stock) <= 5);

// ---------- Contadores animados ----------
function countUp(el, to, fmt) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt(to); return; }
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / 900);
    el.textContent = fmt(Math.round(to * (1 - (1 - k) ** 3)));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ---------- Resumen ----------
function renderDash() {
  const valid = orders.filter((o) => o.status !== 'Cancelado');
  const sales = valid.reduce((t, o) => t + o.total, 0);
  const active = data.products.filter((p) => p.active !== false).length;
  const units = data.products.reduce((t, p) => t + Number(p.stock || 0), 0);
  const low = lowStock();
  const kpis = [
    ['Ventas', sales, money, 'i-cash', '12,4% vs semana anterior', false],
    ['Pedidos', orders.length, String, 'i-receipt', `${orders.filter((o) => o.status === 'Pendiente').length} por despachar`, false],
    ['Productos activos', active, (n) => `${n}/${data.products.length}`, 'i-box', `${units} pares en bodega`, false],
    ['Ticket promedio', valid.length ? Math.round(sales / valid.length) : 0, money, 'i-layers', `${low.length} con stock bajo`, low.length > 0],
  ];
  $('#kpis').innerHTML = kpis.map(([l, , , ico, sub, warn], i) => `<div class="kpi" style="--i:${i}">
    <div class="kpi-top"><span>${l}</span><span class="kpi-ico"><svg><use href="#${ico}"/></svg></span></div>
    <b data-k="${i}">0</b>
    <small class="${warn ? 'warn' : ''}">${warn ? '<svg><use href="#i-alert"/></svg>' : '<svg><use href="#i-trend"/></svg>'}${sub}</small>
  </div>`).join('');
  kpis.forEach(([, v, fmt], i) => countUp($(`[data-k="${i}"]`), v, fmt));

  renderChart();

  const byCat = Object.fromEntries(CAT_KEYS.map((c) => [c, 0]));
  valid.forEach((o) => { if (o.cat in byCat) byCat[o.cat] += o.total; });
  const totalCat = Object.values(byCat).reduce((a, b) => a + b, 0) || 1;
  $('#catBars').innerHTML = CAT_KEYS.map((c) => `<li><div class="cb-row"><b>${CATS[c]}</b><span>${money(byCat[c])} · ${Math.round((byCat[c] / totalCat) * 100)}%</span></div><div class="track"><i data-w="${(byCat[c] / totalCat) * 100}"></i></div></li>`).join('');
  requestAnimationFrame(() => requestAnimationFrame(() => $$('#catBars i').forEach((i) => { i.style.width = `${i.dataset.w}%`; })));

  $('#lowStock').innerHTML = low.length
    ? low.map((p) => `<li data-edit="${p.id}"><div class="thumb">${shoeSVG(p)}</div><div><b>${esc(p.name)}</b><small>${esc(p.colorway)}</small></div>${stockPill(Number(p.stock))}</li>`).join('')
    : '<li class="empty"><svg><use href="#i-check"/></svg>Todo el inventario está bien</li>';

  $('#recentOrders').innerHTML = orderTable(orders.slice(0, 5), false);
}

function renderChart() {
  const { labels, values } = SALES[range];
  const max = Math.max(...values);
  const top = values.indexOf(max);
  $('#salesChart').innerHTML = values.map((v, i) => `<div class="bar ${i === top ? 'top' : ''}"><i style="--i:${i}" data-h="${(v / max) * 88}" data-v="$${String(v).replace('.', ',')}M"></i><span>${labels[i]}</span></div>`).join('');
  requestAnimationFrame(() => requestAnimationFrame(() => $$('#salesChart i').forEach((i) => { i.style.height = `${i.dataset.h}%`; })));
  $$('#rangeSeg button').forEach((b) => b.setAttribute('aria-selected', b.dataset.range === range));
}
$('#rangeSeg').addEventListener('click', (e) => {
  const b = e.target.closest('[data-range]');
  if (b) { range = b.dataset.range; renderChart(); }
});

// ---------- Notificaciones ----------
function renderBell() {
  const low = lowStock();
  const pending = orders.filter((o) => o.status === 'Pendiente');
  const items = [
    ...pending.slice(0, 3).map((o) => `<li data-view="orders"><i class="dot ok"></i><div><b>Pedido ${esc(o.id)} por despachar</b><small>${esc(o.customer)} · ${money(o.total)}</small></div></li>`),
    ...low.slice(0, 4).map((p) => `<li data-edit="${p.id}"><i class="dot"></i><div><b>${Number(p.stock) <= 0 ? 'Agotado' : 'Stock bajo'}: ${esc(p.name)}</b><small>${esc(p.colorway)} · ${p.stock} uds</small></div></li>`),
  ];
  $('#bellList').innerHTML = items.join('') || '<li class="empty">Sin novedades</li>';
  $('#bellDot').hidden = !items.length;
  $('#navOrders').textContent = pending.length || '';
  $('#navStock').textContent = low.length || '';
}

// ---------- Pedidos ----------
function orderTable(list, full) {
  if (!list.length) return '<tbody><tr><td class="c-main"><p class="empty">No hay pedidos con este estado</p></td></tr></tbody>';
  return `<thead><tr><th>Pedido</th><th>Cliente</th><th>Producto</th>${full ? '<th>Talla</th>' : ''}<th>Total</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>${list.map((o, i) => `<tr style="--i:${i}">
    <td class="c-main"><b>${esc(o.id)}</b></td>
    <td data-label="Cliente"><span>${esc(o.customer)}<small>${esc(o.city)}</small></span></td>
    <td data-label="Producto"><span>${esc(o.item)}${o.qty > 1 ? ` <small>× ${o.qty}</small>` : ''}</span></td>
    ${full ? `<td data-label="Talla"><span>${o.size}</span></td>` : ''}
    <td data-label="Total"><span class="num">${money(o.total)}</span></td>
    <td data-label="Fecha"><span>${fmtDate(o.date)}</span></td>
    <td data-label="Estado">${full ? `<select class="status-select" data-order="${esc(o.id)}" aria-label="Estado de ${esc(o.id)}">${STATUS.map((s) => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select>` : statusPill(o.status)}</td>
  </tr>`).join('')}</tbody>`;
}
function renderOrders() {
  $('#statusSeg').innerHTML = [['', 'Todos', orders.length], ...STATUS.map((s) => [s, s, orders.filter((o) => o.status === s).length])]
    .map(([k, l, n]) => `<button role="tab" data-status="${k}" aria-selected="${k === statusFilter}">${l}<em>${n}</em></button>`).join('');
  $('#orderTable').innerHTML = orderTable(orders.filter((o) => !statusFilter || o.status === statusFilter), true);
}
$('#statusSeg').addEventListener('click', (e) => {
  const b = e.target.closest('[data-status]');
  if (b) { statusFilter = b.dataset.status; renderOrders(); }
});
$('#orderTable').addEventListener('change', (e) => {
  const o = orders.find((x) => x.id === e.target.dataset.order);
  if (!o) return;
  o.status = e.target.value;
  ls.set(ORDERS_KEY, orders);
  toast(`Pedido ${o.id} → ${o.status}`);
  renderOrders();
  renderBell();
});

// ---------- Productos ----------
function renderProducts() {
  $('#catSeg').innerHTML = [['', 'Todos', data.products.length], ...CAT_KEYS.map((c) => [c, CATS[c], data.products.filter((p) => p.cat === c).length])]
    .map(([k, l, n]) => `<button role="tab" data-cat="${k}" aria-selected="${k === catFilter}">${l}<em>${n}</em></button>`).join('');
  const q = $('#pSearch').value.trim().toLowerCase();
  const list = data.products.filter((p) => (!catFilter || p.cat === catFilter) && (!q || `${p.name} ${p.colorway} ${p.material || ''}`.toLowerCase().includes(q)));
  $('#productTable').innerHTML = list.length ? `<thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Visible</th><th></th></tr></thead>
  <tbody>${list.map((p, i) => `<tr style="--i:${i}">
    <td class="c-main"><div class="cell-product"><div class="thumb">${shoeSVG(p)}</div><div><b>${esc(p.name)}</b><small>${esc(p.colorway)}${p.tag ? ` · ${esc(p.tag)}` : ''}</small></div></div></td>
    <td data-label="Categoría"><span>${CATS[p.cat] || esc(p.cat)}</span></td>
    <td data-label="Precio"><span class="num">${money(p.price)}${p.was ? `<small><s>${money(p.was)}</s></small>` : ''}</span></td>
    <td data-label="Stock">${stockPill(Number(p.stock))}</td>
    <td data-label="Visible en tienda"><button class="toggle" data-toggle="${p.id}" aria-pressed="${p.active !== false}" aria-label="Visible ${esc(p.name)} ${esc(p.colorway)}"></button></td>
    <td class="c-actions"><div class="row-actions">
      <button class="icon-btn" data-edit="${p.id}" title="Editar" aria-label="Editar ${esc(p.name)}"><svg><use href="#i-edit"/></svg></button>
      <button class="icon-btn" data-dup="${p.id}" title="Duplicar" aria-label="Duplicar ${esc(p.name)}"><svg><use href="#i-copy"/></svg></button>
      <button class="icon-btn danger" data-del="${p.id}" title="Eliminar" aria-label="Eliminar ${esc(p.name)}"><svg><use href="#i-trash"/></svg></button>
    </div></td>
  </tr>`).join('')}</tbody>`
    : '<tbody><tr><td class="c-main"><div class="empty"><svg><use href="#i-search"/></svg>No hay productos que coincidan</div></td></tr></tbody>';
}
$('#catSeg').addEventListener('click', (e) => {
  const b = e.target.closest('[data-cat]');
  if (b) { catFilter = b.dataset.cat; renderProducts(); }
});
$('#pSearch').addEventListener('input', renderProducts);

async function deleteProduct(p) {
  const ok = await confirmDialog({ title: 'Eliminar producto', text: `“${p.name} · ${p.colorway}” desaparecerá de la tienda. Esta acción no se puede deshacer.`, ok: 'Eliminar' });
  if (!ok) return false;
  data.products = data.products.filter((x) => x.id !== p.id);
  persist('Producto eliminado');
  render();
  return true;
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-toggle]');
  const ed = e.target.closest('[data-edit]');
  const dup = e.target.closest('[data-dup]');
  const del = e.target.closest('[data-del]');
  const find = (id) => data.products.find((x) => x.id === id);
  if (t) {
    const p = find(t.dataset.toggle);
    p.active = p.active === false;
    t.setAttribute('aria-pressed', p.active);
    persist(p.active ? 'Ahora es visible en la tienda' : 'Oculto de la tienda');
    renderDash();
  }
  if (ed) { $$('.popover').forEach((p) => { p.hidden = true; }); openEditor(ed.dataset.edit); }
  if (del) deleteProduct(find(del.dataset.del));
  if (dup) {
    const src = find(dup.dataset.dup);
    const copy = { ...structuredClone(src), id: newId(), colorway: `${src.colorway} (copia)`, active: false };
    data.products.splice(data.products.indexOf(src) + 1, 0, copy);
    persist('Duplicado · queda oculto hasta que lo actives');
    render();
    openEditor(copy.id);
  }
});

const newId = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

// ---------- Editor ----------
const editor = $('#editor');
const form = $('#productForm');
let editing = null;
let isNew = false;

$('#sizePicks').innerHTML = ALL_SIZES.map((s) => `<label><input type="checkbox" value="${s}"><span>${s}</span></label>`).join('');
$('#colorPicks').innerHTML = Object.entries(COLOR_KEYS).map(([k, l]) => `<label><input type="color" data-color="${k}">${l}</label>`).join('');

function setTab(tab) {
  $$('#editorTabs [data-tab]').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === tab));
  $$('.ed-tab').forEach((p) => { p.hidden = p.dataset.panel !== tab; });
}
$('#editorTabs').addEventListener('click', (e) => {
  const b = e.target.closest('[data-tab]');
  if (b) setTab(b.dataset.tab);
});

function openEditor(id) {
  isNew = !id;
  editing = id ? structuredClone(data.products.find((p) => p.id === id)) : {
    id: newId(), name: '', colorway: '', cat: 'tenis', type: 'low', price: 0, stock: 0, active: true, rating: 5, reviews: 0,
    sizes: [38, 39, 40, 41, 42], desc: '', material: '', c: { ...DEFAULT_DATA.products[0].c },
  };
  $('#editorTitle').textContent = isNew ? 'Nuevo producto' : 'Editar producto';
  $('#editorSub').textContent = isNew ? 'Completa la información y guarda' : `ID ${editing.id}`;
  $('#deleteProduct').hidden = isNew;
  for (const el of form.elements) {
    el.removeAttribute('aria-invalid');
    if (!el.name) continue;
    if (el.type === 'checkbox') el.checked = editing[el.name] !== false;
    else el.value = editing[el.name] ?? '';
  }
  $$('#sizePicks input').forEach((i) => { i.checked = (editing.sizes || []).includes(Number(i.value)); });
  $$('#colorPicks input').forEach((i) => { i.value = editing.c?.[i.dataset.color] || '#888888'; });
  $('#imgFile').value = '';
  setTab('info');
  updatePreview();
  editor.showModal();
  editor.querySelector('.m-body').scrollTop = 0;
}

function readForm() {
  const f = form.elements;
  const num = (n) => (f[n].value === '' ? undefined : Number(f[n].value));
  Object.assign(editing, {
    name: f.name.value.trim(), colorway: f.colorway.value.trim(), cat: f.cat.value, tag: f.tag.value.trim() || undefined,
    desc: f.desc.value.trim(), material: f.material.value.trim(), price: num('price') || 0, was: num('was') || undefined,
    stock: num('stock') || 0, type: f.type.value, rating: num('rating'), reviews: num('reviews'), active: f.active.checked,
    img: f.img.value.trim() || undefined,
    sizes: $$('#sizePicks input:checked').map((i) => Number(i.value)),
    c: Object.fromEntries($$('#colorPicks input').map((i) => [i.dataset.color, i.value])),
  });
}

function updatePreview() {
  readForm();
  $('#previewArt').innerHTML = shoeSVG(editing);
  $('#previewName').textContent = `${editing.name || 'Sin nombre'} · ${editing.colorway || '—'}`;
  $('#previewPrice').innerHTML = `${money(editing.price)}${editing.was ? `<s>${money(editing.was)}</s>` : ''} · ${editing.stock} en stock`;
}
form.addEventListener('input', (e) => { e.target.removeAttribute('aria-invalid'); updatePreview(); });
form.addEventListener('change', updatePreview);

form.addEventListener('click', (e) => {
  const b = e.target.closest('[data-sizes]');
  if (!b) return;
  $$('#sizePicks input').forEach((i) => { i.checked = b.dataset.sizes === 'all'; });
  updatePreview();
});

// Reduce la foto antes de guardarla para no llenar el almacenamiento del navegador; WebP conserva la transparencia.
function loadImage(file) {
  if (!file || !file.type.startsWith('image/')) return toast('Ese archivo no es una imagen', 'err');
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, 900 / Math.max(img.width, img.height));
    const cv = document.createElement('canvas');
    cv.width = Math.round(img.width * scale);
    cv.height = Math.round(img.height * scale);
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    form.elements.img.value = cv.toDataURL('image/webp', 0.85);
    URL.revokeObjectURL(img.src);
    updatePreview();
    toast('Imagen lista · recuerda guardar');
  };
  img.onerror = () => toast('No se pudo leer esa imagen', 'err');
  img.src = URL.createObjectURL(file);
}
$('#imgFile').addEventListener('change', (e) => loadImage(e.target.files[0]));
const dz = $('#dropzone');
['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('over'); }));
['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, () => dz.classList.remove('over')));
dz.addEventListener('drop', (e) => { e.preventDefault(); loadImage(e.dataTransfer.files[0]); });
$('#clearImg').addEventListener('click', () => { form.elements.img.value = ''; $('#imgFile').value = ''; updatePreview(); });

function invalid(name, tab, msg) {
  setTab(tab);
  const el = name && form.elements[name];
  if (el) { el.setAttribute('aria-invalid', 'true'); el.focus(); }
  toast(msg, 'err');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  readForm();
  if (!editing.name) return invalid('name', 'info', 'Ponle un nombre al producto');
  if (!editing.colorway) return invalid('colorway', 'info', 'Indica el color o la variante');
  if (!(editing.price > 0)) return invalid('price', 'stock', 'El precio debe ser mayor a 0');
  if (editing.was && editing.was <= editing.price) return invalid('was', 'stock', 'El precio anterior debe ser mayor al actual');
  if (!editing.sizes.length) return invalid(null, 'stock', 'Selecciona al menos una talla');
  const idx = data.products.findIndex((p) => p.id === editing.id);
  if (idx >= 0) data.products[idx] = editing; else data.products.unshift(editing);
  if (persist(isNew ? 'Producto creado' : 'Producto actualizado')) closeDialog(editor);
  render();
});
$('#deleteProduct').addEventListener('click', async () => {
  const p = data.products.find((x) => x.id === editing.id);
  if (p && (await deleteProduct(p))) closeDialog(editor);
});
$('#newProduct').addEventListener('click', () => openEditor(null));
$('#tabAdd').addEventListener('click', () => openEditor(null));

// ---------- Contenido y apariencia (con barra de guardado) ----------
const dirty = new Set();
function fillSiteForms() {
  const opts = data.products.map((p) => `<option value="${p.id}">${esc(p.name)} · ${esc(p.colorway)}</option>`).join('');
  $$('.product-select').forEach((s) => { s.innerHTML = opts; });
  for (const f of $$('[data-dirty-form]')) {
    for (const el of f.elements) if (el.name) el.value = data.site[el.name] ?? '';
  }
  updateMock();
}

function updateMock() {
  const f = $('#lookForm').elements;
  $('.mock-site').style.setProperty('--pv', f.accent.value);
  $('#mockBrand').textContent = (f.brand.value || 'MARCA').trim().split(/\s+/)[0];
  $$('#presets button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.accent.toLowerCase() === f.accent.value.toLowerCase()));
}

function markDirty(form) {
  dirty.add(form);
  $('#savebar').hidden = false;
}
$$('[data-dirty-form]').forEach((f) => {
  f.addEventListener('input', () => { markDirty(f); if (f.id === 'lookForm') updateMock(); });
  f.addEventListener('submit', (e) => { e.preventDefault(); saveDirty(); });
});

function saveDirty() {
  for (const f of dirty) {
    if (!f.reportValidity()) return;
    for (const el of f.elements) {
      if (!el.name) continue;
      data.site[el.name] = el.type === 'number' ? Number(el.value) : el.value.trim();
    }
  }
  if (persist('Cambios publicados en la tienda')) {
    dirty.clear();
    $('#savebar').hidden = true;
    applyBrand();
  }
}
function discardDirty() {
  dirty.clear();
  $('#savebar').hidden = true;
  fillSiteForms();
}
async function confirmDiscard() {
  const ok = await confirmDialog({ title: 'Cambios sin guardar', text: 'Si sales ahora perderás los cambios que hiciste en esta sección.', ok: 'Salir sin guardar' });
  if (ok) discardDirty();
  return ok;
}
$('#saveBtn').addEventListener('click', saveDirty);
$('#discardBtn').addEventListener('click', discardDirty);
window.addEventListener('beforeunload', (e) => { if (dirty.size) e.preventDefault(); });

$('#presets').innerHTML = ACCENTS.map((c) => `<button type="button" data-accent="${c}" style="background:${c}" aria-label="Usar color ${c}" aria-pressed="false"></button>`).join('');
$('#presets').addEventListener('click', (e) => {
  const b = e.target.closest('[data-accent]');
  if (!b) return;
  $('#accentInput').value = b.dataset.accent;
  markDirty($('#lookForm'));
  updateMock();
});

function applyBrand() {
  document.documentElement.style.setProperty('--accent', data.site.accent);
  $('#brandLogo').innerHTML = logoHTML(data.site.brand);
  document.title = `Panel admin — ${data.site.brand}`;
}

// ---------- Exportar / importar / restablecer ----------
$('#exportBtn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = 'tienda-datos.json';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Archivo descargado');
});
$('#importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  $('#morePop').hidden = true;
  if (!file) return;
  try {
    const d = JSON.parse(await file.text());
    if (!Array.isArray(d.products) || typeof d.site !== 'object') throw new Error('formato');
    if (d.products.some((p) => !p.id || !p.name || typeof p.price !== 'number')) throw new Error('productos');
    data = { site: { ...DEFAULT_DATA.site, ...d.site }, products: d.products };
    persist('Datos importados');
    render();
  } catch {
    toast('Archivo inválido: debe ser un JSON exportado desde este panel', 'err');
  }
  e.target.value = '';
});
$('#resetBtn').addEventListener('click', async () => {
  const ok = await confirmDialog({ title: 'Restablecer demo', text: 'Se borrarán tus productos, textos, colores y pedidos editados, y volverán los datos originales.', ok: 'Restablecer' });
  if (!ok) return;
  try { localStorage.removeItem(DATA_KEY); localStorage.removeItem(ORDERS_KEY); } catch { /* demo */ }
  data = loadData();
  orders = demoOrders();
  discardDirty();
  toast('Demo restablecida');
  render();
});

function render() {
  applyBrand();
  renderBell();
  if (view === 'dash') renderDash();
  if (view === 'products') renderProducts();
  if (view === 'orders') renderOrders();
  if (!dirty.size) fillSiteForms();
}

const viewFromHash = () => (VIEWS[location.hash.slice(1)] ? location.hash.slice(1) : 'dash');
window.addEventListener('hashchange', () => show(viewFromHash()));
show(viewFromHash());
