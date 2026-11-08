// Panel admin de demostración. Edita los mismos datos que lee la tienda (data.js → localStorage).
// shortcut: sin login ni servidor; para producción va detrás de autenticación y guarda en una base de datos.

let data = loadData();
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const ALL_SIZES = [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
const COLOR_KEYS = { upper: 'Capellada', panel: 'Paneles', accent: 'Acento', mid: 'Mediasuela', sole: 'Suela', lace: 'Cordones' };
const ACCENTS = ['#ff4d1a', '#c8ff3d', '#2a5bff', '#e9c46a', '#ff3d7f', '#f1ede6'];
const TITLES = { dash: 'Resumen', products: 'Productos', orders: 'Pedidos', content: 'Contenido', look: 'Apariencia' };
const STATUS = ['Pendiente', 'Pagado', 'Enviado', 'Entregado', 'Cancelado'];
const CITIES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Pereira', 'Cartagena'];
const NAMES = ['Valentina Gómez', 'Santiago Ríos', 'Camila Herrera', 'Andrés Pardo', 'Laura Mejía', 'Juan Esteban Cruz', 'Mariana López', 'Felipe Ortiz'];

let toastT;
function toast(msg, err) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.toggle('err', !!err);
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 2600);
}

function persist(msg = 'Cambios guardados') {
  try {
    saveData(data);
    toast(msg);
    return true;
  } catch {
    toast('No hay espacio en el navegador: usa imágenes más livianas o una URL', true);
    data = loadData();
    return false;
  }
}

// ---------- Pedidos de demostración ----------
function demoOrders() {
  const saved = (() => { try { return JSON.parse(localStorage.getItem('asfalto-orders')); } catch { return null; } })();
  if (Array.isArray(saved)) return saved;
  const ps = DEFAULT_DATA.products;
  return Array.from({ length: 12 }, (_, i) => {
    const p = ps[(i * 5) % ps.length];
    const qty = 1 + (i % 3 === 0);
    return {
      id: `#10${48 - i}`, customer: NAMES[i % NAMES.length], city: CITIES[i % CITIES.length],
      item: `${p.name} · ${p.colorway}`, size: p.sizes[(i * 3) % p.sizes.length], qty, total: p.price * qty,
      date: new Date(Date.now() - i * 16 * 3600e3).toISOString(), status: STATUS[Math.min(i % 5, 3)],
    };
  });
}
let orders = demoOrders();
const saveOrders = () => { try { localStorage.setItem('asfalto-orders', JSON.stringify(orders)); } catch { /* demo */ } };
const fmtDate = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
const statusPill = (s) => `<span class="pill ${s === 'Entregado' || s === 'Pagado' ? 'ok' : s === 'Cancelado' ? 'bad' : 'warn'}">${s}</span>`;
const stockPill = (n) => `<span class="pill ${n <= 0 ? 'bad' : n <= 5 ? 'warn' : 'ok'}">${n <= 0 ? 'Agotado' : `${n} uds`}</span>`;

// ---------- Navegación ----------
function show(view) {
  $$('.view').forEach((v) => { v.hidden = v.id !== `view-${view}`; });
  $$('#sideNav button').forEach((b) => b.setAttribute('aria-current', b.dataset.view === view));
  $('#viewTitle').textContent = TITLES[view];
  location.hash = view;
  render();
}
document.addEventListener('click', (e) => {
  const v = e.target.closest('[data-view]');
  if (v) show(v.dataset.view);
});

// ---------- Resumen ----------
function renderDash() {
  const active = data.products.filter((p) => p.active !== false);
  const units = data.products.reduce((t, p) => t + Number(p.stock || 0), 0);
  const invValue = data.products.reduce((t, p) => t + Number(p.stock || 0) * p.price, 0);
  const sales = orders.filter((o) => o.status !== 'Cancelado').reduce((t, o) => t + o.total, 0);
  const low = data.products.filter((p) => Number(p.stock) <= 5);
  $('#kpis').innerHTML = [
    ['Ventas (demo)', money(sales), '▲ 12% vs semana anterior'],
    ['Pedidos', orders.length, `${orders.filter((o) => o.status === 'Pendiente').length} pendientes`],
    ['Productos activos', `${active.length}/${data.products.length}`, `${units} pares en bodega`],
    ['Valor inventario', money(invValue), `${low.length} con stock bajo`, low.length],
  ].map(([l, v, s, warn]) => `<div class="kpi"><span>${l}</span><b>${v}</b><small class="${warn ? 'down' : ''}">${s}</small></div>`).join('');

  const days = [3.2, 4.1, 2.6, 5.4, 4.8, 6.9, 5.7]; // millones COP, ejemplo
  const max = Math.max(...days);
  const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  $('#salesChart').innerHTML = days.map((d, i) => `<div class="bar"><i style="height:${(d / max) * 85}%" data-v="$${d}M"></i><span>${labels[i]}</span></div>`).join('');

  $('#lowStock').innerHTML = low.length ? low.map((p) => `<li><div class="thumb">${shoeSVG(p)}</div><div><b>${esc(p.name)}</b><small>${esc(p.colorway)}</small></div>${stockPill(Number(p.stock))}</li>`).join('')
    : '<li class="muted">Todo el inventario está bien.</li>';

  $('#recentOrders').innerHTML = orderHead(false) + `<tbody>${orders.slice(0, 5).map((o) => orderRow(o, false)).join('')}</tbody>`;
}

// ---------- Pedidos ----------
const orderHead = (full) => `<thead><tr><th>Pedido</th><th>Cliente</th><th>Producto</th>${full ? '<th>Talla</th><th>Cant.</th>' : ''}<th>Total</th><th>Fecha</th><th>Estado</th></tr></thead>`;
const orderRow = (o, full) => `<tr>
  <td><b>${esc(o.id)}</b></td>
  <td>${esc(o.customer)}<small>${esc(o.city)}</small></td>
  <td>${esc(o.item)}</td>
  ${full ? `<td>${o.size}</td><td>${o.qty}</td>` : ''}
  <td>${money(o.total)}</td>
  <td>${fmtDate(o.date)}</td>
  <td>${full ? `<select data-order="${esc(o.id)}" aria-label="Estado de ${esc(o.id)}">${STATUS.map((s) => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select>` : statusPill(o.status)}</td>
</tr>`;
function renderOrders() {
  $('#orderTable').innerHTML = orderHead(true) + `<tbody>${orders.map((o) => orderRow(o, true)).join('')}</tbody>`;
}
$('#orderTable').addEventListener('change', (e) => {
  const o = orders.find((x) => x.id === e.target.dataset.order);
  if (!o) return;
  o.status = e.target.value;
  saveOrders();
  toast(`Pedido ${o.id}: ${o.status}`);
});

// ---------- Productos ----------
$('#pCatFilter').innerHTML += ['tenis', 'altos', 'botas', 'chelsea'].map((c) => `<option value="${c}">${CATS[c]}</option>`).join('');

function renderProducts() {
  const q = $('#pSearch').value.trim().toLowerCase();
  const cat = $('#pCatFilter').value;
  const list = data.products.filter((p) => (!cat || p.cat === cat) && (!q || `${p.name} ${p.colorway} ${p.material || ''}`.toLowerCase().includes(q)));
  $('#productTable').innerHTML = `<thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Visible</th><th></th></tr></thead>
  <tbody>${list.map((p) => `<tr>
    <td><div class="cell-product"><div class="thumb">${shoeSVG(p)}</div><div><b>${esc(p.name)}</b><small>${esc(p.colorway)}${p.tag ? ` · ${esc(p.tag)}` : ''}</small></div></div></td>
    <td>${CATS[p.cat] || esc(p.cat)}</td>
    <td>${money(p.price)}${p.was ? `<small><s>${money(p.was)}</s></small>` : ''}</td>
    <td>${stockPill(Number(p.stock))}</td>
    <td><button class="toggle" data-toggle="${p.id}" aria-pressed="${p.active !== false}" aria-label="Visible ${esc(p.name)}"></button></td>
    <td><div class="actions"><button data-edit="${p.id}">Editar</button><button data-dup="${p.id}">Duplicar</button></div></td>
  </tr>`).join('') || '<tr><td colspan="6" class="muted">Sin resultados.</td></tr>'}</tbody>`;
}
$('#pSearch').addEventListener('input', renderProducts);
$('#pCatFilter').addEventListener('change', renderProducts);
$('#productTable').addEventListener('click', (e) => {
  const t = e.target.closest('[data-toggle]');
  const ed = e.target.closest('[data-edit]');
  const dup = e.target.closest('[data-dup]');
  if (t) {
    const p = data.products.find((x) => x.id === t.dataset.toggle);
    p.active = p.active === false;
    persist(p.active ? 'Producto visible en la tienda' : 'Producto oculto de la tienda');
    renderProducts();
  }
  if (ed) openEditor(ed.dataset.edit);
  if (dup) {
    const src = data.products.find((x) => x.id === dup.dataset.dup);
    const copy = { ...structuredClone(src), id: newId(), colorway: `${src.colorway} (copia)`, active: false };
    data.products.splice(data.products.indexOf(src) + 1, 0, copy);
    persist('Producto duplicado (oculto hasta que lo actives)');
    renderProducts();
    openEditor(copy.id);
  }
});

const newId = () => `p${Date.now().toString(36)}`;

// ---------- Editor ----------
const editor = $('#editor');
const form = $('#productForm');
let editing = null; // copia de trabajo
let isNew = false;

$('#sizePicks').innerHTML = ALL_SIZES.map((s) => `<label><input type="checkbox" value="${s}"><span>${s}</span></label>`).join('');
$('#colorPicks').innerHTML = Object.entries(COLOR_KEYS).map(([k, l]) => `<label><input type="color" data-color="${k}">${l}</label>`).join('');

function openEditor(id) {
  isNew = !id;
  editing = id ? structuredClone(data.products.find((p) => p.id === id)) : {
    id: newId(), name: '', colorway: '', cat: 'tenis', type: 'low', price: 0, stock: 0, active: true, rating: 5, reviews: 0,
    sizes: [38, 39, 40, 41, 42], desc: '', material: '', c: { ...DEFAULT_DATA.products[0].c },
  };
  $('#editorTitle').textContent = isNew ? 'Nuevo producto' : 'Editar producto';
  $('#deleteProduct').hidden = isNew;
  for (const el of form.elements) {
    if (!el.name) continue;
    if (el.type === 'checkbox') el.checked = editing[el.name] !== false;
    else el.value = editing[el.name] ?? '';
  }
  $$('#sizePicks input').forEach((i) => { i.checked = (editing.sizes || []).includes(Number(i.value)); });
  $$('#colorPicks input').forEach((i) => { i.value = editing.c?.[i.dataset.color] || '#888888'; });
  $('#imgFile').value = '';
  updatePreview();
  editor.showModal();
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
  $('#previewPrice').innerHTML = `${money(editing.price)}${editing.was ? ` <s>${money(editing.was)}</s>` : ''} · ${editing.stock} en stock`;
}
form.addEventListener('input', updatePreview);

// Reduce la foto antes de guardarla para no llenar el almacenamiento del navegador; WebP conserva la transparencia.
$('#imgFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
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
  };
  img.onerror = () => toast('No se pudo leer esa imagen', true);
  img.src = URL.createObjectURL(file);
});
$('#clearImg').addEventListener('click', () => { form.elements.img.value = ''; $('#imgFile').value = ''; updatePreview(); });

form.addEventListener('submit', (e) => {
  e.preventDefault();
  readForm();
  if (!editing.sizes.length) return toast('Selecciona al menos una talla', true);
  if (editing.was && editing.was <= editing.price) return toast('El precio anterior debe ser mayor al precio actual', true);
  const idx = data.products.findIndex((p) => p.id === editing.id);
  if (idx >= 0) data.products[idx] = editing; else data.products.unshift(editing);
  if (persist(isNew ? 'Producto creado' : 'Producto actualizado')) editor.close();
  render();
});
$('#deleteProduct').addEventListener('click', () => {
  if (!confirm(`¿Eliminar "${editing.name} · ${editing.colorway}"? No se puede deshacer.`)) return;
  data.products = data.products.filter((p) => p.id !== editing.id);
  persist('Producto eliminado');
  editor.close();
  render();
});
editor.addEventListener('click', (e) => { if (e.target === editor || e.target.closest('[data-close]')) editor.close(); });
$('#newProduct').addEventListener('click', () => openEditor(null));

// ---------- Contenido y apariencia ----------
function fillSiteForms() {
  const opts = data.products.map((p) => `<option value="${p.id}">${esc(p.name)} · ${esc(p.colorway)}</option>`).join('');
  $$('.product-select').forEach((s) => { s.innerHTML = opts; });
  for (const f of [$('#contentForm'), $('#lookForm')]) {
    for (const el of f.elements) if (el.name) el.value = data.site[el.name] ?? '';
  }
  $('#accentPreview').style.setProperty('--preview', data.site.accent);
}

function saveSiteForm(e) {
  e.preventDefault();
  for (const el of e.target.elements) {
    if (!el.name) continue;
    data.site[el.name] = el.type === 'number' ? Number(el.value) : el.value.trim();
  }
  if (persist()) applyBrand();
}
$('#contentForm').addEventListener('submit', saveSiteForm);
$('#lookForm').addEventListener('submit', saveSiteForm);

$('#presets').innerHTML = ACCENTS.map((c) => `<button type="button" data-accent="${c}" style="background:${c}" aria-label="Usar ${c}"></button>`).join('');
$('#presets').addEventListener('click', (e) => {
  const b = e.target.closest('[data-accent]');
  if (!b) return;
  $('#accentInput').value = b.dataset.accent;
  $('#accentPreview').style.setProperty('--preview', b.dataset.accent);
});
$('#accentInput').addEventListener('input', (e) => $('#accentPreview').style.setProperty('--preview', e.target.value));

function applyBrand() {
  document.documentElement.style.setProperty('--accent', data.site.accent);
  $('#brandLogo').innerHTML = `${esc(data.site.brand)}<span>®</span>`;
  document.title = `Panel admin — ${data.site.brand}`;
}

// ---------- Exportar / importar / restablecer ----------
$('#exportBtn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = 'tienda-datos.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('#importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const d = JSON.parse(await file.text());
    if (!Array.isArray(d.products) || typeof d.site !== 'object') throw new Error('formato');
    if (d.products.some((p) => !p.id || !p.name || typeof p.price !== 'number')) throw new Error('productos');
    data = { site: { ...DEFAULT_DATA.site, ...d.site }, products: d.products };
    persist('Datos importados');
    render();
  } catch {
    toast('Archivo inválido: debe ser un JSON exportado desde este panel', true);
  }
  e.target.value = '';
});
$('#resetBtn').addEventListener('click', () => {
  if (!confirm('¿Restablecer todos los productos, textos y pedidos a la demo original? Perderás tus cambios.')) return;
  try { localStorage.removeItem(DATA_KEY); localStorage.removeItem('asfalto-orders'); } catch { /* demo */ }
  data = loadData();
  orders = demoOrders();
  toast('Demo restablecida');
  render();
});

function render() {
  applyBrand();
  renderDash();
  renderProducts();
  renderOrders();
  fillSiteForms();
}

show(TITLES[location.hash.slice(1)] ? location.hash.slice(1) : 'dash');
