/* =============================================================================
 *  App de Requerimientos — frontend (GitHub Pages)
 *  Funciona sin internet: guarda todo en el teléfono y envía al recuperar señal.
 * ========================================================================== */
'use strict';

const CONFIG = {
  API: 'https://script.google.com/macros/s/AKfycbwq6B0wu3CWQhyL_MjU-ec4q_RWX1RYu9qet-j4WJ4QITQgCJh9lJQDF7uog3NPOJPu8A/exec',
  EMPRESA: 'MDK Soluciones',
  SYNC_CADA_MS: 60000,
  MAX_ADJUNTOS: 10,
  MAX_ADJUNTO_MB: 8,
  FOTO_MAX_PX: 1600
};

/* ---------------------------------------------------------------- Íconos -- */
const svg = (d, s = 24, w = 1.8) =>
  `<svg aria-hidden="true" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const IC = {
  back: '<path d="m15 6-6 6 6 6"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  off: '<path d="M3 3l18 18"/><path d="M8.5 6.2A6 6 0 0 1 17.7 10H18a4 4 0 0 1 2.3 7.3M16 18H7a5 5 0 0 1-2.2-9.5"/>',
  sync: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  clip: '<path d="M21 12.5 12.6 21a5 5 0 0 1-7.1-7.1l9-9a3.3 3.3 0 0 1 4.7 4.7l-9 9a1.7 1.7 0 0 1-2.4-2.4l8.3-8.3"/>',
  viaticos: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  almacen: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  compras: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.4 11.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L22 7H6"/>',
  lista: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h4"/>',
  inbox: '<path d="M3 13h5l2 3h4l2-3h5"/><path d="M5 5h14l2 8v6H3v-6z"/>',
  shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v.01M14 21h3M21 18v3"/>',
  file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'
};

/* ------------------------------------------------------------ Utilidades -- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v) => { const n = Number(String(v ?? '').replace(/[$\s,]/g, '')); return isFinite(n) ? n : 0; };
const money = (n) => '$' + (Math.round(num(n) * 100) / 100).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtNum = (n) => { const x = num(n); return Number.isInteger(x) ? String(x) : x.toLocaleString('es-MX', { maximumFractionDigits: 2 }); };
const norm = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2));
const fmtFecha = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d)) return '';
  const hoy = new Date();
  const hora = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === hoy.toDateString()) return 'Hoy, ' + hora;
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' · ' + hora;
};
const iniciales = (n) => String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

/* ------------------------------------------------------------- IndexedDB -- */
const DB = {
  _db: null,
  open() {
    if (this._db) return Promise.resolve(this._db);
    return new Promise((ok, mal) => {
      const r = indexedDB.open('requerimientos', 1);
      r.onupgradeneeded = () => {
        const db = r.result;
        db.createObjectStore('kv');
        db.createObjectStore('outbox', { keyPath: 'idLocal' });
        db.createObjectStore('drafts', { keyPath: 'idLocal' });
      };
      r.onsuccess = () => { this._db = r.result; ok(this._db); };
      r.onerror = () => mal(r.error);
    });
  },
  async tx(store, modo, fn) {
    const db = await this.open();
    return new Promise((ok, mal) => {
      const t = db.transaction(store, modo);
      const req = fn(t.objectStore(store));
      t.oncomplete = () => ok(req && req.result);
      t.onerror = () => mal(t.error);
    });
  },
  get(store, key) { return this.tx(store, 'readonly', (s) => s.get(key)); },
  put(store, val, key) { return this.tx(store, 'readwrite', (s) => (key === undefined ? s.put(val) : s.put(val, key))); },
  del(store, key) { return this.tx(store, 'readwrite', (s) => s.delete(key)); },
  all(store) { return this.tx(store, 'readonly', (s) => s.getAll()); },
  clear(store) { return this.tx(store, 'readwrite', (s) => s.clear()); }
};

/* ---------------------------------------------------------------- Estado -- */
const S = {
  token: null,
  usuario: null,
  online: navigator.onLine,
  syncing: false,
  ultimaSync: null,
  catalogo: { version: null, articulos: [] },
  mis: [],
  pendientes: [],
  outbox: [],
  drafts: [],
  form: null
};
const tieneRol = (r) => !!(S.usuario && S.usuario.roles && S.usuario.roles.includes(r));

/* ------------------------------------------------------------------- API -- */
async function api(accion, datos = {}, auth = true) {
  const cuerpo = Object.assign({ accion }, datos);
  if (auth) cuerpo.token = S.token;
  let res;
  try {
    // Sin encabezados personalizados: así Apps Script acepta la llamada desde GitHub Pages (CORS).
    res = await fetch(CONFIG.API, { method: 'POST', body: JSON.stringify(cuerpo), redirect: 'follow' });
  } catch (e) {
    marcarConexion(false);
    const err = new Error('Sin conexión con el servidor.');
    err.red = true;
    throw err;
  }
  let j;
  try { j = await res.json(); } catch (_) {
    const err = new Error('El servidor respondió algo inesperado (' + res.status + ').');
    err.red = true;
    throw err;
  }
  marcarConexion(true);
  if (!j.ok) {
    const err = new Error(j.error || 'Error del servidor');
    err.codigo = j.codigo;
    if (/^SESION_/.test(j.codigo || '')) { await cerrarSesionLocal(); toast(j.error); }
    throw err;
  }
  return j;
}

function marcarConexion(ok) {
  if (S.online !== ok) { S.online = ok; refrescarIndicadores(); }
}

/* ---------------------------------------------------------- Sincronizar -- */
async function cargarLocal() {
  S.token = await DB.get('kv', 'token');
  S.usuario = await DB.get('kv', 'usuario');
  S.catalogo = (await DB.get('kv', 'catalogo')) || { version: null, articulos: [] };
  S.mis = (await DB.get('kv', 'mis')) || [];
  S.pendientes = (await DB.get('kv', 'pendientes')) || [];
  S.ultimaSync = await DB.get('kv', 'ultimaSync');
  S.outbox = await DB.all('outbox');
  S.drafts = await DB.all('drafts');
}

async function sincronizar(manual) {
  if (!S.token || S.syncing) return;
  S.syncing = true;
  refrescarIndicadores();
  try {
    // 1) Enviar lo que quedó guardado sin señal
    for (const p of await DB.all('outbox')) {
      if (p.estado === 'enviada') continue;
      try {
        const r = await api('crearSolicitud', p.payload);
        Object.assign(p, { estado: 'enviada', folio: r.folio, error: null, enviada: Date.now() });
      } catch (e) {
        if (e.red || /^SESION_/.test(e.codigo || '')) throw e;
        Object.assign(p, { estado: 'error', error: e.message });
      }
      await DB.put('outbox', p);
    }
    // 2) Catálogo (solo si cambió)
    const c = await api('catalogo', { version: S.catalogo.version });
    if (!c.sinCambios) {
      S.catalogo = { version: c.version, articulos: c.articulos };
      await DB.put('kv', S.catalogo, 'catalogo');
    }
    // 3) Mis solicitudes y bandeja
    S.mis = (await api('misSolicitudes')).solicitudes;
    await DB.put('kv', S.mis, 'mis');
    if (tieneRol('ASISTENTE') || tieneRol('DIRECTOR')) {
      S.pendientes = (await api('pendientes')).solicitudes;
      await DB.put('kv', S.pendientes, 'pendientes');
    }
    // 4) Limpiar de la cola lo que el servidor ya confirmó
    const folios = new Set(S.mis.map((s) => s.folio));
    for (const p of await DB.all('outbox')) if (p.estado === 'enviada' && folios.has(p.folio)) await DB.del('outbox', p.idLocal);
    S.ultimaSync = Date.now();
    await DB.put('kv', S.ultimaSync, 'ultimaSync');
    if (manual) toast('Todo sincronizado.');
  } catch (e) {
    if (manual) toast(e.red ? 'Sin conexión. Se intentará de nuevo automáticamente.' : e.message);
  } finally {
    S.outbox = await DB.all('outbox');
    S.syncing = false;
    refrescarIndicadores();
    const r = ruta();
    if (['', 'mis', 'bandeja'].includes(r.vista)) render();
  }
}

window.addEventListener('online', () => { S.online = true; sincronizar(); });
window.addEventListener('offline', () => marcarConexion(false));
setInterval(() => { if (S.token && navigator.onLine) sincronizar(); }, CONFIG.SYNC_CADA_MS);
document.addEventListener('visibilitychange', () => { if (!document.hidden && S.token) sincronizar(); });

/* ------------------------------------------------------- Interfaz común -- */
const app = $('#app');
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 4200);
}

function netPill() {
  if (S.syncing) return `<span class="net" data-net>${svg(IC.sync, 16, 2)}Sincronizando</span>`;
  return S.online ? '' : `<span class="net" data-net>${svg(IC.off, 16, 2)}Sin conexión</span>`;
}

function appbar(titulo, sub, atras = '#/') {
  return `<header class="appbar">
    <a class="iconbtn" href="${atras}" aria-label="Volver">${svg(IC.back, 24, 2)}</a>
    <div class="titles"><h1>${esc(titulo)}</h1>${sub ? `<span class="sub">${esc(sub)}</span>` : ''}</div>
    <span data-netwrap>${netPill()}</span>
  </header>`;
}

function refrescarIndicadores() {
  $$('[data-netwrap]').forEach((el) => { el.innerHTML = netPill(); });
  const st = $('#estado');
  if (st) st.outerHTML = tarjetaEstado();
}

function pillEstado(estado, texto) {
  const color = { POR_REVISAR: 'amber', POR_AUTORIZAR: 'amber', AUTORIZADA: 'teal', RECHAZADA: 'red', CAMBIOS_SOLICITADOS: 'red', CANCELADA: 'red',
    pendiente: 'amber', error: 'red', borrador: 'gray', enviada: 'teal' }[estado] || 'gray';
  return `<span class="pill ${color}">${esc(texto)}</span>`;
}

/** Diálogo modal reutilizable. Devuelve los valores o null si se cancela. */
function dialogo({ titulo, texto, campos = [], confirmar = 'Aceptar', peligro = false }) {
  return new Promise((resolver) => {
    const d = document.createElement('dialog');
    d.innerHTML = `<form method="dialog" novalidate>
      <h2>${esc(titulo)}</h2>${texto ? `<p>${esc(texto)}</p>` : ''}
      ${campos.map((c) => `<label class="f">${esc(c.l)}${c.tipo === 'textarea'
        ? `<textarea name="${c.k}" rows="3" ${c.req ? 'required' : ''} placeholder="${esc(c.ph || '')}"></textarea>`
        : `<input name="${c.k}" type="${c.tipo || 'text'}" ${c.tipo === 'password' ? 'inputmode="numeric" autocomplete="off" maxlength="6"' : ''} ${c.req ? 'required' : ''} placeholder="${esc(c.ph || '')}">`}</label>`).join('')}
      <div class="err" hidden></div>
      <div class="btns"><button type="button" class="btn sec" value="no">Cancelar</button><button type="submit" class="btn ${peligro ? 'danger' : ''}" value="si">${esc(confirmar)}</button></div>
    </form>`;
    document.body.appendChild(d);
    const f = $('form', d);
    const cerrar = (v) => { d.close(); d.remove(); resolver(v); };
    $('button[value="no"]', d).onclick = () => cerrar(null);
    d.addEventListener('cancel', (e) => { e.preventDefault(); cerrar(null); });
    f.onsubmit = (e) => {
      e.preventDefault();
      const vals = {};
      for (const c of campos) {
        const v = f.elements[c.k].value.trim();
        if (c.req && !v) { const er = $('.err', d); er.hidden = false; er.textContent = 'Completa: ' + c.l; return; }
        vals[c.k] = v;
      }
      cerrar(vals);
    };
    d.showModal();
    const primero = $('input,textarea', d);
    if (primero) primero.focus();
  });
}

function descargarBase64(nombre, mime, b64) {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/* --------------------------------------------------------------- Rutas -- */
function ruta() {
  const partes = location.hash.replace(/^#\/?/, '').split('/');
  return { vista: partes[0] || '', arg: decodeURIComponent(partes[1] || ''), arg2: decodeURIComponent(partes[2] || '') };
}
window.addEventListener('hashchange', render);

function render() {
  if (!S.token) return renderLogin();
  const r = ruta();
  window.scrollTo(0, 0);
  if (r.vista === 'nueva') return renderFormulario(r.arg, r.arg2);
  if (r.vista === 'mis') return renderMis();
  if (r.vista === 'sol') return renderDetalle(r.arg);
  if (r.vista === 'local') return renderLocal(r.arg);
  if (r.vista === 'bandeja') return renderBandeja();
  if (r.vista === 'verificar') return renderVerificar(r.arg);
  return renderInicio();
}

/* --------------------------------------------------------------- Login -- */
function renderLogin(error, correoPrevio) {
  app.innerHTML = `<div class="login">
    <div class="logo">${svg(IC.lista, 30)}</div>
    <div><h1>Requerimientos</h1><p class="muted">${esc(CONFIG.EMPRESA)}</p></div>
    <form id="flogin" class="card" novalidate>
      <label class="f">Correo<input name="correo" type="email" autocomplete="username" required placeholder="tu@correo.com" value="${esc(correoPrevio || '')}"></label>
      <label class="f">PIN<input name="pin" type="password" inputmode="numeric" autocomplete="current-password" maxlength="6" required placeholder="4 a 6 dígitos"></label>
      ${error ? `<div class="err">${esc(error)}</div>` : ''}
      <button class="btn" type="submit">Entrar</button>
      <p class="muted" style="margin:0">La primera vez necesitas internet. Después la app funciona sin conexión.</p>
    </form>
  </div>`;
  $('#flogin').onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target;
    const btn = $('button', f);
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';
    try {
      const r = await api('login', { correo: f.correo.value, pin: f.pin.value, dispositivo: navigator.userAgent.slice(0, 80) }, false);
      S.token = r.token;
      S.usuario = r.usuario;
      await DB.put('kv', S.token, 'token');
      await DB.put('kv', S.usuario, 'usuario');
      location.hash = '#/';
      render();
      sincronizar();
    } catch (err) {
      renderLogin(err.red ? 'No hay conexión. Para entrar la primera vez necesitas internet.' : err.message, f.correo.value);
      const pinInput = $('#flogin input[name=pin]');
      if (pinInput) pinInput.focus();
    }
  };
}

async function cerrarSesionLocal() {
  const tok = S.token;
  S.token = null;
  S.usuario = null;
  for (const k of ['token', 'usuario', 'mis', 'pendientes', 'ultimaSync']) await DB.del('kv', k);
  await DB.clear('outbox');
  await DB.clear('drafts');
  S.outbox = []; S.drafts = []; S.mis = []; S.pendientes = [];
  if (tok && navigator.onLine) fetch(CONFIG.API, { method: 'POST', body: JSON.stringify({ accion: 'cerrarSesion', token: tok }) }).catch(() => {});
  render();
}

async function menuPerfil() {
  const sinEnviar = S.outbox.filter((o) => o.estado !== 'enviada').length;
  const ok = await dialogo({
    titulo: S.usuario.nombre,
    texto: (S.usuario.puesto ? S.usuario.puesto + ' · ' : '') + S.usuario.correo +
      (sinEnviar ? `. Atención: tienes ${sinEnviar} solicitud(es) sin enviar; si cierras sesión se borrarán del teléfono.` : ''),
    confirmar: 'Cerrar sesión',
    peligro: true
  });
  if (ok) cerrarSesionLocal();
}

/* -------------------------------------------------------------- Inicio -- */
function tarjetaEstado() {
  const pend = S.outbox.filter((o) => o.estado === 'pendiente').length;
  const errs = S.outbox.filter((o) => o.estado === 'error').length;
  if (!S.online) {
    return `<section id="estado" class="status off" aria-label="Estado de conexión">${svg(IC.off)}
      <div><strong>Sin conexión</strong><span>Puedes seguir trabajando.${pend ? ` ${pend} solicitud(es) se enviarán al recuperar señal.` : ' Todo se guarda en el teléfono.'}</span></div></section>`;
  }
  const txt = S.syncing ? 'Sincronizando…'
    : errs ? `${errs} solicitud(es) con error. Revisa "Mis solicitudes".`
      : pend ? `${pend} solicitud(es) por enviar.`
        : 'Todo sincronizado' + (S.ultimaSync ? ' · ' + fmtFecha(S.ultimaSync) : '');
  return `<section id="estado" class="status on" aria-label="Estado de conexión">${svg(IC.sync)}
    <div><strong>Conectado</strong><span>${esc(txt)}</span></div>
    <button type="button" data-sync ${S.syncing ? 'disabled' : ''}>Sincronizar</button></section>`;
}

function tile(href, icono, titulo, desc, count) {
  return `<a class="tile" href="${href}"><span class="ic">${svg(icono)}</span>
    <span class="tx"><strong>${esc(titulo)}</strong><span>${esc(desc)}</span></span>
    ${count ? `<span class="count" aria-label="${count} pendientes">${count}</span>` : svg(IC.chev, 20, 2)}</a>`;
}

function renderInicio() {
  const porRevisar = S.pendientes.filter((s) => s.estado === 'POR_REVISAR').length;
  const porAutorizar = S.pendientes.filter((s) => s.estado === 'POR_AUTORIZAR').length;
  const bandeja = [];
  if (tieneRol('DIRECTOR')) bandeja.push(tile('#/bandeja', IC.inbox, 'Por autorizar', 'Solicitudes que esperan tu autorización', porAutorizar));
  if (tieneRol('ASISTENTE')) bandeja.push(tile('#/bandeja', IC.inbox, 'Por revisar', 'Revisa y envía al director', porRevisar));

  app.innerHTML = `<header class="homehead">
      <div class="brand"><div class="logo">${svg(IC.lista)}</div>
        <div style="flex:1;min-width:0"><b>Requerimientos</b><span>${esc(CONFIG.EMPRESA)}</span></div>
        <button class="iconbtn" id="perfil" aria-label="Mi perfil" style="border:1px solid #D5D8D2;border-radius:22px;background:#F4F5F2;color:#3D4249;font-weight:650">${esc(iniciales(S.usuario.nombre))}</button>
      </div>
      <h1>Hola, ${esc(S.usuario.nombre.split(' ')[0])}. ¿Qué necesitas solicitar?</h1>
    </header>
    <main>
      ${tarjetaEstado()}
      ${bandeja.join('')}
      <nav aria-label="Nuevas solicitudes" style="display:flex;flex-direction:column;gap:10px">
        ${tile('#/nueva/VIATICOS', IC.viaticos, 'Solicitud de viáticos', 'Hospedaje, alimentos y transporte para viajes de trabajo')}
        ${tile('#/nueva/SALIDA_ALMACEN', IC.almacen, 'Salida de almacén', 'Busca en el catálogo y retira material o herramienta')}
        ${tile('#/nueva/COMPRAS', IC.compras, 'Solicitud de compras', 'Pide la compra de artículos o servicios')}
        ${tile('#/nueva/LISTA_MATERIALES', IC.lista, 'Lista de materiales y costos', 'Cuantifica materiales y calcula el costo de una obra')}
      </nav>
      <h2 class="sectiontitle">Más</h2>
      ${tile('#/mis', IC.history, 'Mis solicitudes', 'Borradores, por enviar y su estado')}
      ${tile('#/verificar', IC.qr, 'Verificar una autorización', 'Escanea o escribe el código del documento')}
    </main>`;
  $('#perfil').onclick = menuPerfil;
}

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-sync]')) sincronizar(true);
});

/* ---------------------------------------------------------- Formularios -- */
const UNIDADES = ['pza', 'm', 'm²', 'm³', 'kg', 'ton', 'lt', 'bulto', 'caja', 'rollo', 'juego', 'servicio'];
const FORMS = {
  VIATICOS: {
    titulo: 'Solicitud de viáticos', obra: 'Proyecto o centro de costo', precios: true, conceptos: true,
    campos: [
      { k: 'puesto', l: 'Puesto / área', ph: 'Ej. Supervisor de obra' },
      { k: 'destino', l: 'Destino', ph: 'Ciudad, estado', req: true },
      { k: 'motivo', l: 'Motivo del viaje', tipo: 'textarea', ph: 'Actividad que vas a realizar' },
      { k: 'fechaSalida', l: 'Fecha de salida', tipo: 'date', mitad: true },
      { k: 'fechaRegreso', l: 'Fecha de regreso', tipo: 'date', mitad: true }
    ]
  },
  SALIDA_ALMACEN: {
    titulo: 'Salida de almacén', obra: 'Obra o centro de costo', precios: false, catalogo: true,
    campos: [
      { k: 'almacen', l: 'Almacén', tipo: 'select', ops: ['General', 'De obra', 'Herramienta', 'Refacciones'] },
      { k: 'uso', l: 'Uso o destino del material', ph: '¿Para qué se usará?', req: true },
      { k: 'recibe', l: 'Recibe', ph: 'Nombre de quien recibe' }
    ]
  },
  COMPRAS: {
    titulo: 'Solicitud de compras', obra: 'Obra o centro de costo', precios: true,
    campos: [
      { k: 'area', l: 'Área o departamento', ph: 'Ej. Mantenimiento' },
      { k: 'prioridad', l: 'Prioridad', tipo: 'seg', ops: ['Baja', 'Normal', 'Urgente'], def: 'Normal' },
      { k: 'fechaRequerida', l: 'Fecha en que se necesita', tipo: 'date' },
      { k: 'proveedor', l: 'Proveedor sugerido', ph: 'Opcional' }
    ]
  },
  LISTA_MATERIALES: {
    titulo: 'Lista de materiales y costos', obra: 'Proyecto u obra', precios: true, catalogo: true, iva: true,
    campos: [{ k: 'partida', l: 'Partida o etapa', ph: 'Ej. Albañilería' }]
  }
};
const CONCEPTOS_VIATICOS = ['Hospedaje', 'Alimentación', 'Transporte (avión, autobús, taxi)', 'Combustible y casetas', 'Otros gastos'];

function formularioVacio(tipo) {
  const def = FORMS[tipo];
  const datos = {};
  def.campos.forEach((c) => { if (c.def) datos[c.k] = c.def; if (c.tipo === 'select') datos[c.k] = c.ops[0]; });
  if (def.iva) datos.ivaPct = 16;
  return {
    tipo, idLocal: uuid(), obra: '', justificacion: '', datos,
    items: def.catalogo || def.conceptos ? [] : [itemVacio()],
    conceptos: {}, adjuntos: []
  };
}
const itemVacio = () => ({ k: uuid(), codigo: '', descripcion: '', unidad: 'pza', cantidad: '', precio: '', enCatalogo: false });

async function renderFormulario(tipo, idBorrador) {
  const def = FORMS[tipo];
  if (!def) { location.hash = '#/'; return; }
  if (!S.form || S.form.tipo !== tipo || (idBorrador && S.form.idLocal !== idBorrador)) {
    S.form = (idBorrador && ((await DB.get('drafts', idBorrador)) || (await DB.get('outbox', idBorrador))?.form)) || formularioVacio(tipo);
  }
  const F = S.form;
  const campo = (c) => {
    const v = F.datos[c.k] ?? '';
    const req = c.req ? ' <span class="req" aria-hidden="true">*</span>' : '';
    if (c.tipo === 'select') return `<label class="f">${esc(c.l)}<select data-b="datos.${c.k}">${c.ops.map((o) => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
    if (c.tipo === 'textarea') return `<label class="f"><span>${esc(c.l)}${req}</span><textarea data-b="datos.${c.k}" rows="2" placeholder="${esc(c.ph || '')}">${esc(v)}</textarea></label>`;
    if (c.tipo === 'seg') return `<div class="f" style="display:flex;flex-direction:column;gap:6px"><span id="lb-${c.k}" style="font-size:13px;font-weight:600;color:var(--ink-2)">${esc(c.l)}</span>
      <div class="seg" role="group" aria-labelledby="lb-${c.k}">${c.ops.map((o) => `<button type="button" data-seg="${c.k}" data-v="${esc(o)}" aria-pressed="${o === v}">${esc(o)}</button>`).join('')}</div></div>`;
    return `<label class="f"><span>${esc(c.l)}${req}</span><input data-b="datos.${c.k}" type="${c.tipo || 'text'}" value="${esc(v)}" placeholder="${esc(c.ph || '')}"></label>`;
  };
  const campos = [];
  for (let i = 0; i < def.campos.length; i++) {
    const c = def.campos[i];
    if (c.mitad && def.campos[i + 1] && def.campos[i + 1].mitad) { campos.push(`<div class="grid2">${campo(c)}${campo(def.campos[i + 1])}</div>`); i++; }
    else campos.push(campo(c));
  }

  app.innerHTML = `${appbar(def.titulo, S.usuario.nombre)}
  <main>
    <form id="fsol" novalidate style="display:flex;flex-direction:column;gap:14px">
      <section class="card" aria-labelledby="t-gen"><h2 id="t-gen">Datos generales</h2>
        <label class="f">${esc(def.obra)}<input data-b="obra" value="${esc(F.obra)}" placeholder="Ej. Obra Planta Norte"></label>
        ${campos.join('')}
      </section>

      <section class="card" aria-labelledby="t-items">
        <div class="head"><h2 id="t-items">${def.conceptos ? 'Conceptos solicitados' : tipo === 'COMPRAS' ? 'Artículos o servicios' : tipo === 'LISTA_MATERIALES' ? 'Materiales' : 'Artículos'}</h2><span class="muted" id="cuenta"></span></div>
        ${def.catalogo ? `<div class="search"><label class="f">Buscar en el catálogo <span class="hint">(${S.catalogo.articulos.length} artículos guardados en el teléfono)</span>
          <input id="buscar" type="search" autocomplete="off" placeholder="Escribe una palabra o código"></label><div id="resultados"></div></div>` : ''}
        <div id="items" style="display:flex;flex-direction:column;gap:10px"></div>
        ${def.conceptos ? '' : `<button type="button" class="btn dash" id="agregar">${svg(IC.plus, 20, 2)}${def.catalogo ? 'Agregar renglón manual' : 'Agregar renglón'}</button>`}
        <div id="totales"></div>
      </section>

      <section class="card" aria-labelledby="t-just"><h2 id="t-just">Justificación y soporte</h2>
        <label class="f"><span>¿Por qué se necesita? <span class="req" aria-hidden="true">*</span></span>
          <textarea data-b="justificacion" rows="3" placeholder="Explica para qué y por qué ahora (obligatorio)">${esc(F.justificacion)}</textarea></label>
        <div class="files" id="adjuntos"></div>
        <div class="grid2">
          <label class="btn sec" style="cursor:pointer">${svg(IC.camera, 20)}Tomar foto<input type="file" accept="image/*" capture="environment" data-adj hidden></label>
          <label class="btn sec" style="cursor:pointer">${svg(IC.clip, 20)}Adjuntar<input type="file" accept="image/*,application/pdf" multiple data-adj hidden></label>
        </div>
        <p class="muted" style="margin:0">Fotos de avance, cotizaciones o documentos. Se guardan en el teléfono y se suben al enviar.</p>
      </section>

      <div class="actions">
        <button type="button" class="btn sec" id="borrador">Guardar borrador</button>
        <button type="submit" class="btn">Enviar</button>
      </div>
    </form>
  </main>`;

  pintarItems();
  pintarAdjuntos();
  const form = $('#fsol');

  form.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.b) {
      const [a, b] = el.dataset.b.split('.');
      if (b) F.datos[b] = el.value; else F[a] = el.value;
    } else if (el.dataset.i !== undefined) {
      const it = F.items.find((x) => x.k === el.dataset.i);
      if (it) it[el.dataset.f] = el.value;
      pintarTotales();
      const imp = $(`[data-imp="${el.dataset.i}"]`);
      if (imp && it) imp.textContent = money(num(it.cantidad) * num(it.precio));
    } else if (el.dataset.concepto !== undefined) {
      F.conceptos[el.dataset.concepto] = el.value;
      pintarTotales();
    } else if (el.id === 'buscar') {
      pintarResultados(el.value);
    } else if (el.dataset.iva !== undefined) {
      F.datos.ivaPct = el.value;
      pintarTotales();
    }
  });
  form.addEventListener('change', (e) => {
    if (e.target.matches('[data-adj]')) { agregarAdjuntos(e.target.files); e.target.value = ''; }
    if (e.target.matches('select[data-i]')) { const it = F.items.find((x) => x.k === e.target.dataset.i); if (it) it.unidad = e.target.value; }
  });
  form.addEventListener('click', (e) => {
    const seg = e.target.closest('[data-seg]');
    if (seg) {
      F.datos[seg.dataset.seg] = seg.dataset.v;
      $$(`[data-seg="${seg.dataset.seg}"]`).forEach((b) => b.setAttribute('aria-pressed', String(b === seg)));
    }
    const quitar = e.target.closest('[data-quitar]');
    if (quitar) { F.items = F.items.filter((x) => x.k !== quitar.dataset.quitar); pintarItems(); }
    const quitarAdj = e.target.closest('[data-quitar-adj]');
    if (quitarAdj) { F.adjuntos.splice(Number(quitarAdj.dataset.quitarAdj), 1); pintarAdjuntos(); }
    const res = e.target.closest('[data-res]');
    if (res) elegirResultado(res.dataset.res);
    if (e.target.closest('#agregar')) { const it = itemVacio(); F.items.push(it); pintarItems(); enfocar(it.k, 'descripcion'); }
  });
  $('#borrador').onclick = guardarBorrador;
  form.onsubmit = (e) => { e.preventDefault(); enviarFormulario(); };
}

function enfocar(k, campo) {
  const el = $(`[data-i="${k}"][data-f="${campo}"]`);
  if (el) { el.focus(); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
}

function pintarItems() {
  const F = S.form;
  const def = FORMS[F.tipo];
  const box = $('#items');
  if (def.conceptos) {
    box.innerHTML = CONCEPTOS_VIATICOS.map((c) => `<label class="concept"><span class="n">${esc(c)}</span>
      <span class="money"><span aria-hidden="true" class="muted">$</span><input type="text" inputmode="decimal" placeholder="0.00" data-concepto="${esc(c)}" value="${esc(F.conceptos[c] || '')}" aria-label="Monto de ${esc(c)}"></span></label>`).join('');
  } else if (!F.items.length) {
    box.innerHTML = `<p class="empty" style="margin:0">${def.catalogo ? 'Busca un artículo en el catálogo o agrégalo manualmente.' : 'Agrega al menos un renglón.'}</p>`;
  } else {
    box.innerHTML = F.items.map((it, i) => {
      const n = i + 1;
      const cant = `<label class="f">Cantidad<input type="text" inputmode="decimal" placeholder="0" data-i="${it.k}" data-f="cantidad" value="${esc(it.cantidad)}"></label>`;
      const precio = def.precios ? `<label class="f">P. unitario<input type="text" inputmode="decimal" placeholder="0.00" data-i="${it.k}" data-f="precio" value="${esc(it.precio)}"></label>` : '';
      const unidad = it.enCatalogo
        ? `<div class="f" style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:var(--ink-2)">Unidad<div style="min-height:44px;display:flex;align-items:center;font-weight:400;font-size:16px;color:var(--ink)">${esc(it.unidad)}</div></div>`
        : `<label class="f">Unidad<select data-i="${it.k}" data-f="unidad">${UNIDADES.concat(UNIDADES.includes(it.unidad) ? [] : [it.unidad]).map((u) => `<option ${u === it.unidad ? 'selected' : ''}>${esc(u)}</option>`).join('')}</select></label>`;
      return `<div class="item">
        <div class="top"><span>Renglón ${n} ${it.enCatalogo ? '<span class="tag cat">Del catálogo</span>' : def.catalogo ? '<span class="tag man">Captura manual</span>' : ''}</span>
          <button type="button" class="del" data-quitar="${it.k}" aria-label="Quitar renglón ${n}">${svg(IC.trash, 20)}</button></div>
        ${it.enCatalogo
          ? `<div><b style="font-size:15px">${esc(it.descripcion)}</b><div class="muted">${esc(it.codigo)}${it.existencia != null ? ' · Existencia: ' + esc(fmtNum(it.existencia)) : ''}${it.ubicacion ? ' · ' + esc(it.ubicacion) : ''}</div></div>`
          : `<label class="f">Descripción<input data-i="${it.k}" data-f="descripcion" value="${esc(it.descripcion)}" placeholder="${def.catalogo ? 'Describe el artículo que no está en el catálogo' : 'Marca, modelo o especificación'}"></label>`}
        <div class="${def.precios ? 'grid3' : 'grid2'}">${unidad}${cant}${precio}</div>
        ${def.precios ? `<div class="imp"><span>Importe</span><b data-imp="${it.k}">${money(num(it.cantidad) * num(it.precio))}</b></div>` : ''}
      </div>`;
    }).join('');
  }
  const cuenta = $('#cuenta');
  if (cuenta && !def.conceptos) cuenta.textContent = F.items.length === 1 ? '1 renglón' : F.items.length + ' renglones';
  pintarTotales();
}

function totalesFormulario() {
  const F = S.form;
  const def = FORMS[F.tipo];
  let sub = 0;
  if (def.conceptos) CONCEPTOS_VIATICOS.forEach((c) => { sub += num(F.conceptos[c]); });
  else F.items.forEach((it) => { sub += num(it.cantidad) * num(it.precio); });
  const iva = def.iva ? sub * num(F.datos.ivaPct) / 100 : 0;
  return { sub, iva, total: sub + iva };
}

function pintarTotales() {
  const F = S.form;
  const def = FORMS[F.tipo];
  const box = $('#totales');
  if (!box || !def.precios) return;
  const t = totalesFormulario();
  if (def.iva) {
    const actual = $('[data-iva]');
    const ivaVal = actual ? actual.value : F.datos.ivaPct;
    box.innerHTML = `<div style="display:flex;flex-direction:column;gap:10px;padding-top:12px;border-top:1px solid var(--line)">
      <div class="sumrow"><span>Subtotal</span><span>${money(t.sub)}</span></div>
      <div class="sumrow" style="align-items:center"><label for="iva" style="color:var(--ink-2)">IVA (%)</label><input id="iva" data-iva type="text" inputmode="decimal" value="${esc(ivaVal)}" style="width:80px;text-align:right"></div>
      <div class="sumrow"><span>IVA</span><span>${money(t.iva)}</span></div>
      <div class="total"><span>Total</span><strong>${money(t.total)}</strong></div></div>`;
    if (actual && document.activeElement === actual) { const n = $('[data-iva]'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }
  } else {
    box.innerHTML = `<div class="total"><span>${def.conceptos ? 'Total solicitado' : 'Total estimado'}</span><strong>${money(t.total)}</strong></div>`;
  }
}

/* ------------------------------------------- Búsqueda en el catálogo ------ */
function buscarCatalogo(texto) {
  const palabras = norm(texto).split(/\s+/).filter(Boolean);
  if (!palabras.length) return [];
  const out = [];
  for (const a of S.catalogo.articulos) {
    const h = a._n || (a._n = norm(a.codigo + ' ' + a.descripcion + ' ' + (a.categoria || '')));
    if (palabras.every((p) => h.includes(p))) { out.push(a); if (out.length >= 30) break; }
  }
  return out;
}

function pintarResultados(texto) {
  const box = $('#resultados');
  const t = texto.trim();
  if (!t) { box.innerHTML = ''; return; }
  const res = buscarCatalogo(t);
  box.innerHTML = `<div class="results" role="listbox" aria-label="Resultados del catálogo">
    ${res.map((a, i) => `<button type="button" data-res="${i}" role="option"><b>${esc(a.descripcion)}</b>
      <span>${esc(a.codigo)} · ${esc(a.unidad)}${a.existencia != null && !isNaN(a.existencia) ? ' · Existencia: ' + esc(fmtNum(a.existencia)) : ''}</span></button>`).join('')}
    <button type="button" data-res="manual" class="manual">${svg(IC.plus, 18, 2)}${res.length ? 'No es ninguno: agregar' : 'No se encontró. Agregar'} "${esc(t)}" manualmente</button>
  </div>`;
  box._res = res;
  box._texto = t;
}

function elegirResultado(cual) {
  const box = $('#resultados');
  const F = S.form;
  let it;
  if (cual === 'manual') {
    it = Object.assign(itemVacio(), { descripcion: box._texto });
  } else {
    const a = box._res[Number(cual)];
    const ya = F.items.find((x) => x.enCatalogo && x.codigo === a.codigo);
    if (ya) { toast('Ese artículo ya está en la lista.'); enfocar(ya.k, 'cantidad'); return; }
    it = Object.assign(itemVacio(), { codigo: a.codigo, descripcion: a.descripcion, unidad: a.unidad || 'pza', enCatalogo: true, existencia: a.existencia, ubicacion: a.ubicacion });
  }
  F.items.push(it);
  $('#buscar').value = '';
  box.innerHTML = '';
  pintarItems();
  enfocar(it.k, 'cantidad');
}

/* ------------------------------------------------------------ Adjuntos -- */
async function agregarAdjuntos(lista) {
  const F = S.form;
  for (const f of Array.from(lista)) {
    if (F.adjuntos.length >= CONFIG.MAX_ADJUNTOS) { toast('Máximo ' + CONFIG.MAX_ADJUNTOS + ' archivos.'); break; }
    try {
      let blob = f;
      let mime = f.type || 'application/octet-stream';
      let nombre = f.name || 'foto.jpg';
      if (/^image\/(jpeg|png|webp)$/.test(mime) || (mime.startsWith('image/') && mime !== 'image/heic')) {
        const r = await comprimirFoto(f).catch(() => null);
        if (r) { blob = r; mime = 'image/jpeg'; nombre = nombre.replace(/\.[^.]+$/, '') + '.jpg'; }
      }
      if (blob.size > CONFIG.MAX_ADJUNTO_MB * 1048576) { toast(nombre + ' pesa más de ' + CONFIG.MAX_ADJUNTO_MB + ' MB.'); continue; }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'].includes(mime)) { toast(nombre + ': solo fotos o PDF.'); continue; }
      F.adjuntos.push({ nombre, mimeType: mime, base64: await aBase64(blob), tam: blob.size });
    } catch (e) {
      toast('No se pudo adjuntar ' + f.name);
    }
  }
  pintarAdjuntos();
}

function comprimirFoto(file) {
  return new Promise((ok, mal) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, CONFIG.FOTO_MAX_PX / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? ok(b) : mal(new Error('foto'))), 'image/jpeg', 0.8);
    };
    img.onerror = () => { URL.revokeObjectURL(url); mal(new Error('foto')); };
    img.src = url;
  });
}

function aBase64(blob) {
  return new Promise((ok, mal) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(',')[1]);
    r.onerror = () => mal(r.error);
    r.readAsDataURL(blob);
  });
}

function pintarAdjuntos() {
  const box = $('#adjuntos');
  if (!box) return;
  box.innerHTML = S.form.adjuntos.map((a, i) => `<div class="file">${svg(a.mimeType === 'application/pdf' ? IC.file : IC.camera, 20)}
    <span>${esc(a.nombre)} <span class="muted">· ${Math.max(1, Math.round(a.tam / 1024))} KB</span></span>
    <button type="button" class="del" data-quitar-adj="${i}" aria-label="Quitar ${esc(a.nombre)}">${svg(IC.trash, 20)}</button></div>`).join('');
}

/* ------------------------------------------------- Guardar y enviar ------ */
async function guardarBorrador() {
  const F = S.form;
  F.actualizado = Date.now();
  await DB.put('drafts', JSON.parse(JSON.stringify(F)));
  S.drafts = await DB.all('drafts');
  toast('Borrador guardado en este teléfono.');
}

function construirPayload(F) {
  const def = FORMS[F.tipo];
  const items = def.conceptos
    ? CONCEPTOS_VIATICOS.filter((c) => num(F.conceptos[c]) > 0).map((c) => ({ descripcion: c, unidad: 'servicio', cantidad: 1, precio: num(F.conceptos[c]) }))
    : F.items.map((it) => ({
      codigo: it.enCatalogo ? it.codigo : '',
      descripcion: it.descripcion.trim(),
      unidad: it.unidad,
      cantidad: num(it.cantidad),
      precio: def.precios ? num(it.precio) : 0
    }));
  const datos = {};
  Object.keys(F.datos).forEach((k) => { const v = F.datos[k]; if (v !== '' && v != null) datos[k] = k === 'ivaPct' ? num(v) : String(v).trim(); });
  return {
    idLocal: F.idLocal, tipo: F.tipo, obra: F.obra.trim(), justificacion: F.justificacion.trim(),
    datos, items, adjuntos: F.adjuntos.map((a) => ({ nombre: a.nombre, mimeType: a.mimeType, base64: a.base64 }))
  };
}

function validar(F, p) {
  const def = FORMS[F.tipo];
  for (const c of def.campos) if (c.req && !String(F.datos[c.k] || '').trim()) return 'Falta: ' + c.l;
  if (!p.items.length) return def.conceptos ? 'Captura el monto de al menos un concepto.' : 'Agrega al menos un renglón.';
  for (let i = 0; i < p.items.length; i++) {
    if (!p.items[i].descripcion && !p.items[i].codigo) return 'Renglón ' + (i + 1) + ': falta la descripción.';
    if (!(p.items[i].cantidad > 0)) return 'Renglón ' + (i + 1) + ': escribe la cantidad.';
  }
  if (p.justificacion.length < 10) return 'Escribe la justificación (mínimo 10 caracteres).';
  return null;
}

async function enviarFormulario() {
  const F = S.form;
  const p = construirPayload(F);
  const error = validar(F, p);
  if (error) { toast(error); return; }
  const t = totalesFormulario();
  await DB.put('outbox', {
    idLocal: F.idLocal, estado: 'pendiente', creada: Date.now(), payload: p,
    resumen: { tipo: F.tipo, obra: p.obra, total: FORMS[F.tipo].precios ? t.total : null, renglones: p.items.length },
    form: JSON.parse(JSON.stringify(F))
  });
  await DB.del('drafts', F.idLocal);
  S.outbox = await DB.all('outbox');
  S.drafts = await DB.all('drafts');
  S.form = null;
  toast(S.online ? 'Solicitud guardada. Enviando…' : 'Guardada en este teléfono. Se enviará automáticamente cuando haya conexión.');
  location.hash = '#/mis';
  sincronizar();
}

/* ------------------------------------------------------ Mis solicitudes -- */
const NOMBRE_TIPO = { VIATICOS: 'Viáticos', SALIDA_ALMACEN: 'Salida de almacén', COMPRAS: 'Compras', LISTA_MATERIALES: 'Lista de materiales' };

function renderMis() {
  const locales = [
    ...S.drafts.map((d) => ({ href: `#/nueva/${d.tipo}/${encodeURIComponent(d.idLocal)}`, titulo: NOMBRE_TIPO[d.tipo] + ' · borrador', sub: d.obra || 'Sin obra', fecha: d.actualizado, pill: pillEstado('borrador', 'Borrador') })),
    ...S.outbox.filter((o) => o.estado !== 'enviada').map((o) => ({
      href: '#/local/' + encodeURIComponent(o.idLocal), titulo: NOMBRE_TIPO[o.resumen.tipo] + (o.estado === 'error' ? ' · no se pudo enviar' : ' · por enviar'),
      sub: o.estado === 'error' ? o.error : (o.resumen.obra || 'Sin obra'), fecha: o.creada,
      pill: o.estado === 'error' ? pillEstado('error', 'Revisar') : pillEstado('pendiente', 'Por enviar')
    }))
  ].sort((a, b) => b.fecha - a.fecha);
  const fila = (r) => `<a class="row" href="${r.href}"><div class="tx"><b>${esc(r.titulo)}</b><span>${esc(r.sub)} · ${esc(fmtFecha(r.fecha))}</span></div>${r.pill}</a>`;
  const servidor = S.mis.map((s) => ({ href: '#/sol/' + encodeURIComponent(s.folio), titulo: NOMBRE_TIPO[s.tipo] + ' · ' + s.folio, sub: s.obra || s.justificacion, fecha: s.fecha, pill: pillEstado(s.estado, s.estadoTexto) }));
  app.innerHTML = `${appbar('Mis solicitudes', S.ultimaSync ? 'Actualizado ' + fmtFecha(S.ultimaSync) : '')}
  <main>
    ${tarjetaEstado()}
    ${locales.length ? `<h2 class="sectiontitle">En este teléfono</h2><div class="list">${locales.map(fila).join('')}</div>` : ''}
    <h2 class="sectiontitle">Enviadas</h2>
    <div class="list">${servidor.length ? servidor.map(fila).join('') : '<div class="empty">Todavía no hay solicitudes enviadas.</div>'}</div>
  </main>`;
}

async function renderLocal(idLocal) {
  const o = await DB.get('outbox', idLocal);
  if (!o) { location.hash = '#/mis'; return; }
  const p = o.payload;
  app.innerHTML = `${appbar(NOMBRE_TIPO[p.tipo], o.estado === 'error' ? 'No se pudo enviar' : 'Por enviar', '#/mis')}
  <main>
    ${o.estado === 'error'
      ? `<div class="err"><b>El servidor no aceptó esta solicitud:</b><br>${esc(o.error)}</div>`
      : `<section class="status off"><div><strong>Guardada en este teléfono</strong><span>Se enviará automáticamente cuando haya conexión.</span></div></section>`}
    <section class="card"><h2>Resumen</h2>
      <div class="kv"><span>Obra</span><b>${esc(p.obra || '—')}</b></div>
      <div class="kv"><span>Renglones</span><b>${p.items.length}</b></div>
      ${o.resumen.total != null ? `<div class="kv"><span>Total</span><b>${money(o.resumen.total)}</b></div>` : ''}
      <div class="kv"><span>Adjuntos</span><b>${p.adjuntos.length}</b></div>
      <div class="kv"><span>Guardada</span><b>${esc(fmtFecha(o.creada))}</b></div>
    </section>
    <a class="btn sec" href="#/nueva/${p.tipo}/${encodeURIComponent(o.idLocal)}" id="editar">Editar</a>
    <button class="btn danger" id="borrar">Eliminar del teléfono</button>
  </main>`;
  $('#editar').onclick = async (e) => {
    e.preventDefault();
    const borr = Object.assign(o.form, { actualizado: Date.now() });
    await DB.put('drafts', borr);
    await DB.del('outbox', o.idLocal);
    S.outbox = await DB.all('outbox');
    S.drafts = await DB.all('drafts');
    S.form = null;
    location.hash = `#/nueva/${p.tipo}/${encodeURIComponent(o.idLocal)}`;
  };
  $('#borrar').onclick = async () => {
    if (!(await dialogo({ titulo: '¿Eliminar esta solicitud?', texto: 'Se borrará del teléfono y no se enviará.', confirmar: 'Eliminar', peligro: true }))) return;
    await DB.del('outbox', o.idLocal);
    S.outbox = await DB.all('outbox');
    location.hash = '#/mis';
  };
}

/* ----------------------------------------------------------- Bandeja ----- */
function renderBandeja() {
  const grupos = [];
  if (tieneRol('DIRECTOR')) grupos.push(['Por autorizar', S.pendientes.filter((s) => s.estado === 'POR_AUTORIZAR')]);
  if (tieneRol('ASISTENTE')) grupos.push(['Por revisar', S.pendientes.filter((s) => s.estado === 'POR_REVISAR')]);
  app.innerHTML = `${appbar(tieneRol('DIRECTOR') ? 'Por autorizar' : 'Por revisar', S.ultimaSync ? 'Actualizado ' + fmtFecha(S.ultimaSync) : '')}
  <main>
    ${tarjetaEstado()}
    ${grupos.map(([t, lista]) => `<h2 class="sectiontitle">${esc(t)} (${lista.length})</h2>
      <div class="list">${lista.length ? lista.map((s) => `<a class="row" href="#/sol/${encodeURIComponent(s.folio)}"><div class="tx">
        <b>${esc(NOMBRE_TIPO[s.tipo])} · ${esc(s.folio)}</b><span>${esc(s.solicitante.nombre)} · ${esc(s.obra || '')} · ${esc(fmtFecha(s.fecha))}</span></div>
        ${s.total ? `<b style="font-size:14px">${money(s.total)}</b>` : ''}${svg(IC.chev, 20, 2)}</a>`).join('') : '<div class="empty">No hay solicitudes pendientes.</div>'}</div>`).join('')}
  </main>`;
}

/* ------------------------------------------------------------ Detalle ---- */
function buscarEnCache(folio) {
  return S.pendientes.find((s) => s.folio === folio) || S.mis.find((s) => s.folio === folio) || null;
}

async function renderDetalle(folio) {
  let s = buscarEnCache(folio);
  if (s) pintarDetalle(s);
  else app.innerHTML = `${appbar(folio, '')}<main><div class="loading"><span class="spinner"></span></div></main>`;
  try {
    s = (await api('detalle', { folio })).solicitud;
    if (ruta().arg === folio) pintarDetalle(s);
  } catch (e) {
    if (!buscarEnCache(folio)) app.innerHTML = `${appbar(folio, '')}<main><div class="err">${esc(e.red ? 'Sin conexión: esta solicitud no está guardada en el teléfono.' : e.message)}</div></main>`;
  }
}

function pintarDetalle(s) {
  const tipoDef = FORMS[s.tipo] || {};
  const etiquetas = {};
  (tipoDef.campos || []).forEach((c) => { etiquetas[c.k] = c.l; });
  etiquetas.ivaPct = 'IVA (%)';
  const datos = Object.keys(s.datos || {}).map((k) => `<div class="kv"><span>${esc(etiquetas[k] || k)}</span><b>${esc(s.datos[k])}</b></div>`).join('');
  const conPrecios = !!tipoDef.precios;
  const filas = s.items.map((it) => `<tr><td>${esc(it.descripcion)}${it.codigo ? `<div class="muted">${esc(it.codigo)}</div>` : ''}${s.tipo !== 'VIATICOS' && !it.enCatalogo ? '<span class="tag man">Captura manual</span>' : ''}</td>
    <td class="n">${esc(fmtNum(it.cantidad))} ${esc(it.unidad)}</td>${conPrecios ? `<td class="n">${money(it.importe)}</td>` : ''}</tr>`).join('');

  const acciones = [];
  if (tieneRol('ASISTENTE') && s.estado === 'POR_REVISAR') {
    acciones.push('<button class="btn" data-acc="aprobar">Aprobar y enviar al director</button>', '<button class="btn sec" data-acc="devolver">Devolver al solicitante</button>');
  }
  if (tieneRol('DIRECTOR') && s.estado === 'POR_AUTORIZAR') {
    acciones.push(`<button class="btn" data-acc="autorizar">${svg(IC.shield, 20)}Autorizar</button>`,
      '<div class="grid2"><button class="btn sec" data-acc="cambios">Pedir cambios</button><button class="btn danger" data-acc="rechazar">Rechazar</button></div>');
  }
  if (tieneRol('DIRECTOR') && s.estado === 'AUTORIZADA') acciones.push('<button class="btn danger" data-acc="cancelar">Cancelar autorización</button>');
  if (s.estado === 'CAMBIOS_SOLICITADOS' && S.usuario.correo === s.solicitante.correo) acciones.push('<button class="btn" data-acc="corregir">Corregir y enviar de nuevo</button>');

  app.innerHTML = `${appbar(NOMBRE_TIPO[s.tipo] + ' · ' + s.folio, s.solicitante.nombre, history.length > 1 ? 'javascript:history.back()' : '#/')}
  <main>
    <section class="card">
      <div class="head"><h2>${esc(s.tipoNombre)}</h2>${pillEstado(s.estado, s.estadoTexto)}</div>
      <div class="kv"><span>Folio</span><b>${esc(s.folio)}</b></div>
      <div class="kv"><span>Fecha</span><b>${esc(fmtFecha(s.fecha))}</b></div>
      <div class="kv"><span>Solicitante</span><b>${esc(s.solicitante.nombre)}</b></div>
      <div class="kv"><span>Obra</span><b>${esc(s.obra || '—')}</b></div>
      ${datos}
    </section>
    ${s.estado === 'AUTORIZADA' ? `<section class="status on"><div><strong>Autorizada por ${esc(s.autorizo)}</strong>
      <span>${esc(fmtFecha(s.fechaAutorizacion))} · Código ${esc(s.codigoVerificacion)}</span></div></section>` : ''}
    <section class="card"><h2>${s.tipo === 'VIATICOS' ? 'Conceptos' : 'Artículos'}</h2>
      <table class="items"><thead><tr><th>Descripción</th><th class="n" style="text-align:right">Cantidad</th>${conPrecios ? '<th style="text-align:right">Importe</th>' : ''}</tr></thead><tbody>${filas}</tbody></table>
      ${conPrecios ? `${s.total !== s.subtotal ? `<div class="sumrow"><span>Subtotal</span><span>${money(s.subtotal)}</span></div><div class="sumrow"><span>IVA</span><span>${money(s.total - s.subtotal)}</span></div>` : ''}
        <div class="total"><span>Total</span><strong>${money(s.total)}</strong></div>` : ''}
    </section>
    <section class="card"><h2>Justificación</h2><p style="margin:0;font-size:15px;line-height:1.45;white-space:pre-line">${esc(s.justificacion)}</p>
      ${s.adjuntos.length ? `<div class="files">${s.adjuntos.map((a) => `<button class="file" data-adj-dl="${a.indice}" style="border:none;text-align:left">${svg(IC.download, 20)}<span>${esc(a.nombre)}</span></button>`).join('')}</div>` : '<p class="muted" style="margin:0">Sin archivos adjuntos.</p>'}
    </section>
    <section class="card"><h2>Trayectoria</h2>
      <div class="kv"><span>Solicitó</span><b>${esc(s.solicitante.nombre)}<br><span class="muted">${esc(fmtFecha(s.fecha))}</span></b></div>
      <div class="kv"><span>Revisó</span><b>${esc(s.reviso || 'Pendiente')}${s.fechaRevision ? `<br><span class="muted">${esc(fmtFecha(s.fechaRevision))}</span>` : ''}</b></div>
      <div class="kv"><span>Autorizó</span><b>${esc(s.autorizo || 'Pendiente')}${s.fechaAutorizacion ? `<br><span class="muted">${esc(fmtFecha(s.fechaAutorizacion))}</span>` : ''}</b></div>
      ${s.comentarios ? `<div style="border-top:1px solid #ECEDEA;padding-top:10px"><div class="muted" style="margin-bottom:4px">Comentarios</div><div class="comments">${esc(s.comentarios)}</div></div>` : ''}
    </section>
    <button class="btn sec" data-acc="pdf">${svg(IC.download, 20)}${s.estado === 'AUTORIZADA' ? 'Descargar PDF autorizado' : 'Descargar PDF preliminar'}</button>
    ${acciones.join('')}
  </main>`;

  $$('[data-acc]').forEach((b) => { b.onclick = () => accionDetalle(s, b.dataset.acc, b); });
  $$('[data-adj-dl]').forEach((b) => {
    b.onclick = () => descargarArchivo({ folio: s.folio, que: 'adjunto', indice: Number(b.dataset.adjDl) }, b);
  });
}

async function descargarArchivo(params, boton) {
  if (!S.online) { toast('Necesitas conexión para descargar.'); return; }
  const antes = boton.innerHTML;
  boton.disabled = true;
  try {
    const r = await api('archivo', params);
    descargarBase64(r.nombre, r.mimeType, r.base64);
  } catch (e) {
    toast(e.message);
  } finally {
    boton.disabled = false;
    boton.innerHTML = antes;
  }
}

async function accionDetalle(s, acc, boton) {
  if (acc === 'pdf') return descargarArchivo({ folio: s.folio, que: 'pdf' }, boton);
  if (acc === 'corregir') {
    const F = formularioVacio(s.tipo);
    Object.assign(F, { obra: s.obra || '', justificacion: s.justificacion || '', datos: Object.assign(F.datos, s.datos || {}) });
    if (s.tipo === 'VIATICOS') s.items.forEach((it) => { F.conceptos[it.descripcion] = String(it.precio); });
    else F.items = s.items.map((it) => Object.assign(itemVacio(), { codigo: it.codigo, descripcion: it.descripcion, unidad: it.unidad, cantidad: String(it.cantidad), precio: it.precio ? String(it.precio) : '', enCatalogo: it.enCatalogo }));
    S.form = F;
    toast('Se creará una solicitud nueva con los datos de ' + s.folio + '.');
    location.hash = '#/nueva/' + s.tipo;
    return;
  }
  if (!S.online) { toast('Necesitas conexión para esta acción.'); return; }

  const pin = { k: 'pin', l: 'Tu PIN', tipo: 'password', req: true, ph: '••••' };
  const conf = {
    aprobar: { titulo: 'Enviar al director', texto: `${s.folio} pasará a "Por autorizar" y se avisará al director por correo.`, campos: [], confirmar: 'Enviar' },
    devolver: { titulo: 'Devolver al solicitante', campos: [{ k: 'comentario', l: '¿Qué debe corregir?', tipo: 'textarea', req: true }], confirmar: 'Devolver' },
    autorizar: { titulo: 'Autorizar ' + s.folio, texto: 'Confirma con tu PIN. Se generará el documento con código QR y se enviará por correo.', campos: [pin], confirmar: 'Autorizar' },
    cambios: { titulo: 'Pedir cambios', campos: [{ k: 'comentario', l: '¿Qué se debe cambiar?', tipo: 'textarea', req: true }, pin], confirmar: 'Enviar' },
    rechazar: { titulo: 'Rechazar ' + s.folio, campos: [{ k: 'comentario', l: 'Motivo', tipo: 'textarea', req: true }, pin], confirmar: 'Rechazar', peligro: true },
    cancelar: { titulo: 'Cancelar autorización', texto: 'El código QR de este documento pasará a decir CANCELADO.', campos: [{ k: 'motivo', l: 'Motivo', tipo: 'textarea', req: true }, pin], confirmar: 'Cancelar autorización', peligro: true }
  }[acc];
  const v = await dialogo(conf);
  if (!v) return;

  boton.disabled = true;
  try {
    let r;
    if (acc === 'aprobar' || acc === 'devolver') r = await api('revisar', { folio: s.folio, decision: acc === 'aprobar' ? 'APROBAR' : 'DEVOLVER', comentario: v.comentario || '' });
    else if (acc === 'cancelar') r = await api('cancelarAutorizacion', { folio: s.folio, pin: v.pin, motivo: v.motivo });
    else r = await api('autorizar', { folio: s.folio, decision: { autorizar: 'AUTORIZAR', cambios: 'CAMBIOS', rechazar: 'RECHAZAR' }[acc], pin: v.pin, comentario: v.comentario || '', dispositivo: dispositivo() });
    toast(acc === 'autorizar' ? `Autorizada. Código ${r.codigoVerificacion}. El PDF se envió por correo.` : 'Listo: ' + s.folio + ' actualizada.');
    await sincronizar();
    renderDetalle(s.folio);
  } catch (e) {
    toast(e.codigo === 'PIN_INCORRECTO' ? 'PIN incorrecto.' : e.message);
    boton.disabled = false;
  }
}

function dispositivo() {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) return 'Android';
  return 'Navegador';
}

/* --------------------------------------------------------- Verificar ----- */
function renderVerificar(codigoInicial) {
  const puedeEscanear = 'BarcodeDetector' in window && navigator.mediaDevices;
  app.innerHTML = `${appbar('Verificar autorización', 'Escanea o escribe el código')}
  <main>
    <form id="fver" class="card" novalidate>
      <label class="f">Código de verificación<input name="codigo" autocomplete="off" autocapitalize="characters" placeholder="Ej. 7F3K-92QA" value="${esc(codigoInicial || '')}" style="letter-spacing:.08em;text-transform:uppercase"></label>
      <button class="btn" type="submit">Verificar</button>
      ${puedeEscanear ? `<button class="btn sec" type="button" id="escanear">${svg(IC.qr, 20)}Escanear con la cámara</button>` : '<p class="muted" style="margin:0">También puedes escanear el QR con la cámara normal del teléfono: abre la página de verificación.</p>'}
    </form>
    <div id="scan"></div>
    <div id="resultado"></div>
  </main>`;
  $('#fver').onsubmit = (e) => { e.preventDefault(); verificar(e.target.codigo.value); };
  if (puedeEscanear) $('#escanear').onclick = escanearQR;
  if (codigoInicial) verificar(codigoInicial);
}

let streamQR = null;
function detenerCamara() { if (streamQR) { streamQR.getTracks().forEach((t) => t.stop()); streamQR = null; } }
window.addEventListener('hashchange', detenerCamara);

async function escanearQR() {
  const box = $('#scan');
  try {
    streamQR = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  } catch (e) {
    toast('No se pudo abrir la cámara.');
    return;
  }
  box.innerHTML = '<div class="scanner"><video playsinline muted aria-label="Vista de la cámara"></video></div><button class="btn sec" type="button" id="parar" style="margin-top:10px;width:100%">Detener cámara</button>';
  const video = $('video', box);
  video.srcObject = streamQR;
  await video.play();
  $('#parar').onclick = () => { detenerCamara(); box.innerHTML = ''; };
  const det = new BarcodeDetector({ formats: ['qr_code'] });
  const ciclo = async () => {
    if (!streamQR) return;
    try {
      const r = await det.detect(video);
      if (r.length) {
        const txt = r[0].rawValue;
        let cod = txt;
        try { cod = new URL(txt).searchParams.get('v') || txt; } catch (_) { /* no es URL */ }
        detenerCamara();
        box.innerHTML = '';
        $('#fver').codigo.value = cod;
        verificar(cod);
        return;
      }
    } catch (_) { /* sigue intentando */ }
    requestAnimationFrame(ciclo);
  };
  ciclo();
}

async function verificar(codigo) {
  const box = $('#resultado');
  if (!String(codigo).trim()) { toast('Escribe el código.'); return; }
  if (!S.online && !navigator.onLine) { box.innerHTML = '<div class="err">Para verificar se necesita conexión: el código se consulta en el servidor.</div>'; return; }
  box.innerHTML = '<div class="loading"><span class="spinner"></span></div>';
  try {
    const r = await api('verificar', { codigo }, false);
    const v = {
      AUTORIZADO: ['#0F5C55', '✓', 'AUTORIZADO', 'Esta autorización es auténtica y está vigente.'],
      MODIFICADO: ['#A12B0A', '!', 'NO VÁLIDO', 'La información cambió después de la autorización. No aceptes este documento.'],
      CANCELADO: ['#A12B0A', '✕', 'CANCELADO', 'El director canceló esta autorización.'],
      NO_AUTORIZADO: ['#7A4206', '!', 'NO AUTORIZADO', 'Esta solicitud todavía no tiene autorización.'],
      NO_ENCONTRADO: ['#A12B0A', '?', 'CÓDIGO NO ENCONTRADO', 'Este código no existe. El documento puede ser falso.']
    }[r.resultado];
    box.innerHTML = `<section class="verdict" style="background:${v[0]}"><div class="ic" style="color:${v[0]}">${v[1]}</div><h2>${v[2]}</h2><p>${v[3]}</p></section>
      ${r.autorizo ? `<section class="card" style="margin-top:14px"><h2>¿Quién autorizó?</h2>
        <div class="kv"><span>Autorizó</span><b>${esc(r.autorizo)}${r.puestoAutorizo ? `<br><span class="muted">${esc(r.puestoAutorizo)}</span>` : ''}</b></div>
        <div class="kv"><span>Fecha y hora</span><b>${esc(r.fechaAutorizacion)}</b></div>
        <div class="kv"><span>Código</span><b>${esc(r.codigo)}</b></div></section>` : ''}
      ${r.tipoNombre ? `<section class="card" style="margin-top:14px"><h2>¿Qué se autorizó?</h2>
        <div><b>${esc(r.tipoNombre)} ${esc(r.folio)}</b><div class="muted">${esc(r.solicitante)}${r.obra ? ' · ' + esc(r.obra) : ''}</div></div>
        ${(r.items || []).map((it) => `<div class="kv"><span style="color:var(--ink)">${esc(it.descripcion || it.codigo)}</span><b>${esc(fmtNum(it.cantidad))} ${esc(it.unidad)}</b></div>`).join('')}
        ${r.conPrecios ? `<div class="total"><span>Total autorizado</span><strong>${money(r.total)}</strong></div>` : ''}
        <div class="status off"><div><span>Compara con el documento que tienes en la mano. Si algo no coincide, no es válido.</span></div></div></section>` : ''}
      ${r.pdfUrl ? `<a class="btn" style="margin-top:14px" href="${esc(r.pdfUrl)}" target="_blank" rel="noopener">${svg(IC.download, 20)}Descargar PDF original</a>` : ''}`;
  } catch (e) {
    box.innerHTML = `<div class="err">${esc(e.red ? 'Sin conexión: no se pudo consultar el código.' : e.message)}</div>`;
  }
}

/* ------------------------------------------------------------- Inicio ---- */
(async function iniciar() {
  try {
    await cargarLocal();
  } catch (e) {
    app.innerHTML = '<div class="login"><div class="err">Este navegador no permite guardar datos (¿modo privado?). Abre la app en una ventana normal.</div></div>';
    return;
  }
  render();
  if (S.token) sincronizar();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
