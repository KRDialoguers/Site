// Map engine: the 3D topic-cloud constellation and the geography view.
// Written as plain DOM/SVG code (no 3D library) and driven from <MapExplorer>.
// createMap() closes over the site content so the same engine works with Sanity or seed data.
import { WORLD_DOTS as DOTS_RLE } from './worldDots';

export function createMap({ themes, people, conversations, regions }, navigate) {
  const THEMES = [...themes].sort((a, b) => a.order - b.order);
  const PEOPLE = people.filter(p => p.themes && p.themes.length && THEMES.some(t => t.id === p.themes[0]));
  const CONVERSATIONS = conversations;
  const REGIONS = regions;
  const P = Object.fromEntries(PEOPLE.map(p => [p.id, p]));
  const T = Object.fromEntries(THEMES.map(t => [t.id, t]));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const initials = n => n.split(/\s+/).map(w => w[0]).slice(0, 2).join('');
  const convsOf = pid => CONVERSATIONS.filter(c => c.guests.includes(pid));
  const $ = (s, el = document) => el.querySelector(s);
  const av = (id, size) => {
    const p = P[id], t1 = T[p.themes[0]], t2 = T[p.themes[1]] || t1;
    const bg = p.photo ? `background-image:url(${p.photo}?w=${size * 2}&h=${size * 2}&fit=crop);background-size:cover` : '';
    return `<span class="av" style="--s:${size}px;--a:${t1.color};--b:${t2 === t1 ? t1.deep : t2.deep};${bg}" title="${esc(p.name)}">${p.photo ? '' : initials(p.name)}</span>`;
  };
  const chipS = id => { const t = T[id]; return t ? `<span class="chip t" style="--soft:${t.soft};--deep:${t.deep}">${esc(t.short || t.name)}</span>` : ''; };
  const ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOBILE = matchMedia('(max-width: 640px)');
  const TOUCH = matchMedia('(hover: none)');

/* ---------------- Constellation (3D ring) ---------------- */
const CX = 500, CY = 312;
const labelLines = name => {
  const u = name.toUpperCase(), amp = u.indexOf(' & ');
  if (amp > -1) { const a = u.slice(0, amp), b = u.slice(amp + 3); return a.length <= 6 ? [a + ' &', b] : [a, '& ' + b]; }
  const w = u.split(' '); if (w.length < 2) return [u];
  const h = Math.ceil(w.length / 2); return [w.slice(0, h).join(' '), w.slice(h).join(' ')];
};
const CLABEL = Object.fromEntries(THEMES.map(t => [t.id, labelLines(t.name)]));
const RING = { RX: 410, R: 330, T: 98, D: 1250 };
const CLUSTER_ORDER = THEMES.map(t => t.id);
const BASE = Object.fromEntries(CLUSTER_ORDER.map((id, i) => [id, i * 2 * Math.PI / CLUSTER_ORDER.length]));
const LOCAL = (() => {
  const off = {};
  THEMES.forEach(t => {
    const mem = PEOPLE.filter(p => p.themes[0] === t.id), n = mem.length;
    mem.forEach((p, i) => {
      if (n === 1) off[p.id] = [0, 0];
      else if (n === 2) off[p.id] = i ? [50, 20] : [-50, -20];
      else { const b = -Math.PI / 2 + i * 2 * Math.PI / n; off[p.id] = [62 * Math.cos(b), 62 * Math.sin(b)]; }
    });
  });
  return off;
})();
const EDGES = (() => {
  const edges = [];
  CONVERSATIONS.forEach(c => { for (let i = 0; i < c.guests.length; i++) for (let j = i + 1; j < c.guests.length; j++) edges.push({ k: 'conv', a: c.guests[i], b: c.guests[j] }); });
  PEOPLE.forEach(p => (p.connections || []).forEach(q => { if (P[q] && !edges.some(e => e.k === 'manual' && ((e.a === p.id && e.b === q) || (e.a === q && e.b === p.id)))) edges.push({ k: 'manual', a: p.id, b: q }); }));
  PEOPLE.forEach((p, i) => PEOPLE.slice(i + 1).forEach(q => {
    if (p.themes[0] === q.themes[0]) return;
    const shared = p.themes.find(t => q.themes.includes(t));
    if (shared) edges.push({ k: 'theme', a: p.id, b: q.id, t: shared });
  }));
  return edges;
})();
const wrap = d => Math.atan2(Math.sin(d), Math.cos(d));


function mountConstellation(root, opts = {}) {
  root.classList.add('const'); root.innerHTML = '';
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const compact = !!opts.compact, NR = compact ? 34 : 31, mobile = MOBILE.matches, touch = TOUCH.matches;
  // Phones: taller 4:3 frame, zoomed so the side clouds are clipped ~25%, and a steeper tilt to use the extra height
  const ring = mobile ? { ...RING, T: 150 } : RING;
  const spread = mobile ? 1.45 : 1; // phones: spread guests apart so readable names fit
  const svg = mk('svg', { viewBox: mobile ? '19 60 962 721' : '-60 108 1120 560', role: 'img', 'aria-label': 'Topic clouds of Dialoguers guests arranged in 3D; select a theme to bring it forward' });
  root.appendChild(svg);
  const defs = mk('defs', {}, svg);
  defs.innerHTML = THEMES.map(t => `<radialGradient id="cg-${t.id}"><stop offset="0" stop-color="${t.soft}" stop-opacity=".9"/><stop offset=".72" stop-color="${t.soft}" stop-opacity=".55"/><stop offset="1" stop-color="${t.soft}" stop-opacity="0"/></radialGradient>
    <linearGradient id="ng-${t.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.color}"/><stop offset="1" stop-color="${t.deep}"/></linearGradient>`).join('');
  mk('ellipse', { cx: CX, cy: CY, rx: ring.RX * 1.08, ry: ring.T * 1.15, fill: 'none', stroke: '#16233A', 'stroke-opacity': '.07', 'stroke-dasharray': '2 8' }, svg);
  const world = mk('g', {}, svg);
  const C3 = {}, NODES = {};
  THEMES.forEach(t => {
    const g = mk('g', { class: 'cl', 'data-t': t.id }, world);
    const bg = mk('circle', { class: 'cl-bg', 'data-t': t.id, fill: `url(#cg-${t.id})` }, g);
    const label = mk('text', { class: 'clabel', 'text-anchor': 'middle', 'data-t': t.id }, g);
    const tsp = CLABEL[t.id].map(l => { const s = mk('tspan', {}, label); s.textContent = l; return s; });
    const slot = mk('g', {}, g);
    const members = PEOPLE.filter(p => p.themes[0] === t.id).map(p => {
      const ng = mk('g', { class: 'node', 'data-id': p.id, tabindex: 0, role: 'link', 'aria-label': `${p.name}, ${p.role}` }, g);
      const ring = mk('circle', { class: 'ring', fill: `url(#ng-${t.id})`, stroke: '#fff', 'stroke-width': 3.5 }, ng);
      const ini = mk('text', { 'text-anchor': 'middle', fill: '#fff', 'font-family': 'var(--font-caslon), Georgia, serif', 'pointer-events': 'none' }, ng); ini.textContent = initials(p.name);
      let nm = null; if (!compact) { nm = mk('text', { class: 'nlabel', 'text-anchor': 'middle', 'pointer-events': 'none' }, ng); nm.textContent = p.name; }
      NODES[p.id] = { g: ng, ring, ini, nm, t: t.id, x: 0, y: 0, r: NR };
      return p.id;
    });
    C3[t.id] = { g, bg, label, tsp, slot, members, z: 0, s: 1, x: 0, y: 0 };
  });
  const EL = EDGES.map(e => {
    const g = mk('g', { class: `edge e-${e.k}`, 'data-a': e.a, 'data-b': e.b });
    const path = e.k === 'manual'
      ? mk('path', { fill: 'none', stroke: '#16233A', 'stroke-opacity': '.55', 'stroke-width': 1.6 }, g)
      : e.k === 'conv'
      ? mk('path', { fill: 'none', stroke: '#BF6248', 'stroke-opacity': '.8', 'stroke-width': 1.6 }, g)
      : mk('path', { fill: 'none', stroke: T[e.t].deep, 'stroke-opacity': '.7', 'stroke-width': 1.5, 'stroke-dasharray': '1.5 5', 'stroke-linecap': 'round' }, g);
    const dot = e.k === 'conv' ? mk('circle', { r: 4.5, fill: '#BF6248' }, g) : null;
    return { ...e, g, path, dot, home: null };
  });
  const tip = document.createElement('div'); tip.className = 'tip'; tip.setAttribute('aria-hidden', 'true'); root.appendChild(tip);

  const state = { theme: true, conv: true, filter: null, ...opts.state };
  let dead = false;
  let theta = state.filter ? -BASE[state.filter] : -Math.PI / 12, target = theta, hovering = null, order = '', dragging = null, raf = 0;

  function layout() {
    THEMES.forEach(t => {
      const c = C3[t.id], a = BASE[t.id] + theta;
      const x = RING.RX * Math.sin(a), z = RING.R * Math.cos(a), y = ring.T * Math.cos(a);
      const s = RING.D / (RING.D - z);
      Object.assign(c, { x: CX + x * s, y: CY + y * s, z, s });
      c.bg.setAttribute('cx', c.x.toFixed(1)); c.bg.setAttribute('cy', c.y.toFixed(1)); c.bg.setAttribute('r', (125 * (mobile ? 1.2 : 1) * s).toFixed(1));
      const depth = (z + RING.R) / (2 * RING.R);
      const k = Math.min(1, Math.max(0, (depth - 0.38) / 0.24)), sm = k * k * (3 - 2 * k);
      const ly = c.y + ((compact ? -118 : -124) * (1 - sm) + (compact ? 128 : 136) * sm) * s;
      c.label.setAttribute('font-size', (15 * Math.min(s, 1.15)).toFixed(1));
      c.tsp.forEach((sp, i) => { sp.setAttribute('x', c.x.toFixed(1)); sp.setAttribute('y', (ly + i * 19 * Math.min(s, 1.15)).toFixed(1)); });
      c.g.style.opacity = (0.38 + 0.62 * depth).toFixed(3);
      c.members.forEach(id => {
        const n = NODES[id], [lx, ly2] = LOCAL[id];
        n.x = c.x + lx * spread * s; n.y = c.y + ly2 * spread * s; n.r = NR * s;
        n.ring.setAttribute('cx', n.x.toFixed(1)); n.ring.setAttribute('cy', n.y.toFixed(1)); n.ring.setAttribute('r', n.r.toFixed(1));
        n.ini.setAttribute('x', n.x.toFixed(1)); n.ini.setAttribute('y', (n.y + n.r * .22).toFixed(1)); n.ini.setAttribute('font-size', (n.r * .62).toFixed(1));
        if (n.nm) { const fs = mobile ? 30 : 13 * Math.min(s, 1.2); n.nm.setAttribute('x', n.x.toFixed(1)); n.nm.setAttribute('y', (n.y + n.r + fs + 4 * s).toFixed(1)); n.nm.style.fontSize = fs.toFixed(1) + 'px'; }
      });
    });
    const sorted = THEMES.map(t => t.id).sort((a, b) => C3[a].z - C3[b].z), key = sorted.join();
    if (key !== order) { sorted.forEach(id => world.appendChild(C3[id].g)); order = key; THEMES.forEach(t => C3[t.id].g.classList.toggle('front', t.id === sorted.at(-1))); }
    EL.forEach(e => {
      const A = NODES[e.a], B = NODES[e.b];
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, qx = mx + (CX - mx) * .22, qy = my + (CY - my) * .22;
      e.path.setAttribute('d', `M${A.x.toFixed(1)},${A.y.toFixed(1)} Q${qx.toFixed(1)},${qy.toFixed(1)} ${B.x.toFixed(1)},${B.y.toFixed(1)}`);
      if (e.dot) { e.dot.setAttribute('cx', ((A.x + 2 * qx + B.x) / 4).toFixed(1)); e.dot.setAttribute('cy', ((A.y + 2 * qy + B.y) / 4).toFixed(1)); }
      const front = C3[A.t].z >= C3[B.t].z ? A.t : B.t;
      if (e.home !== front) { C3[front].slot.appendChild(e.g); e.home = front; }
    });
    if (hovering) placeTip(hovering);
  }

  function tick() {
    if (dead || !root.isConnected) { cleanup.forEach(f => f()); return; }
    if (opts.auto && !REDUCED && !hovering && !dragging && !state.filter) { theta += 0.0016; target = theta; }
    const d = wrap(target - theta);
    if (Math.abs(d) > 0.0005) theta += REDUCED ? d : d * 0.09; else theta = target;
    layout();
    raf = requestAnimationFrame(tick);
  }

  const lit = () => { root.classList.remove('dim'); $$('.lit', root).forEach(x => x.classList.remove('lit')); };
  function apply() {
    EL.forEach(e => e.g.style.display = (e.k === 'conv' ? state.conv : e.k === 'manual' ? true : state.theme) ? '' : 'none');
    THEMES.forEach(t => C3[t.id].g.classList.toggle('sel', t.id === state.filter));
  }
  function select(id, notify) {
    state.filter = id || null;
    if (id) target = theta + wrap(-BASE[id] - theta);
    apply();
    if (notify && opts.onSelect) opts.onSelect(state.filter);
  }
  function placeTip(id) {
    const n = NODES[id], vb = svg.viewBox.baseVal, bw = root.clientWidth, bh = svg.clientHeight;
    const px = (n.x - vb.x) / vb.width * bw, below = (n.y + n.r - vb.y) / vb.height * bh, above = (n.y - n.r - vb.y) / vb.height * bh;
    const tw = tip.offsetWidth || 240, th = tip.offsetHeight || 90;
    tip.style.left = Math.min(Math.max(px - tw / 2, 8), bw - tw - 8) + 'px';
    tip.style.top = (below + 10 + th > bh && above - 10 - th > 0 ? above - 10 - th : below + 10) + 'px';
  }
  function focusNode(id) {
    hovering = id; lit(); root.classList.add('dim');
    const on = new Set([id]);
    EL.forEach(e => { if (e.g.style.display === 'none') return; if (e.a === id || e.b === id) { e.g.classList.add('lit'); on.add(e.a); on.add(e.b); } });
    Object.entries(NODES).forEach(([k, n]) => n.g.classList.toggle('lit', on.has(k)));
    const p = P[id], cnt = convsOf(id).length;
    tip.innerHTML = touch
      ? `<b>${esc(p.name)}</b><small>${esc(p.role)} · ${esc(p.city)}</small><span class="chips" style="margin-top:8px">${p.themes.map(chipS).join('')}</span><a class="tip-go" href="/people/${p.id}">View profile ${ARROW}</a>`
      : `<b>${esc(p.name)}</b><small>${esc(p.role)} · ${esc(p.city)}</small><small style="margin-top:6px">${cnt} conversation${cnt === 1 ? '' : 's'} — click to open</small>`;
    tip.classList.add('on'); placeTip(id);
  }
  function blurNode() { hovering = null; tip.classList.remove('on', 'pin'); lit(); }
  const cleanup = [];
  const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); cleanup.push(() => el.removeEventListener(ev, fn, o)); };

  Object.entries(NODES).forEach(([id, n]) => {
    if (touch) {
      // Touch: first tap opens a mini-profile popover; tapping the popover opens the profile
      n.g.addEventListener('click', e => { if (dragging && dragging.moved) return; e.stopPropagation(); focusNode(id); tip.classList.add('pin'); tip.dataset.id = id; });
    } else {
      n.g.addEventListener('mouseenter', () => focusNode(id)); n.g.addEventListener('focus', () => focusNode(id));
      n.g.addEventListener('mouseleave', blurNode); n.g.addEventListener('blur', blurNode);
      n.g.addEventListener('click', () => { if (dragging && dragging.moved) return; navigate('/people/' + id); });
    }
    n.g.addEventListener('keydown', e => { if (e.key === 'Enter') navigate('/people/' + id); });
  });
  if (touch) on(document, 'pointerdown', e => { if (hovering && !e.target.closest('.tip') && !e.target.closest('.node')) blurNode(); });

  if (!opts.static) {
    svg.addEventListener('pointerdown', e => { dragging = { x: e.clientX, moved: false, start: theta, t: e.target }; });
    on(window, 'pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - dragging.x;
      if (Math.abs(dx) > 4 && !dragging.moved) { dragging.moved = true; root.classList.add('dragging'); if (hovering) blurNode(); }
      if (dragging.moved) { theta = target = dragging.start + dx * 0.007; if (state.filter) select(null, true); }
    });
    on(window, 'pointerup', () => {
      if (!dragging) return;
      const d = dragging; setTimeout(() => { dragging = null; root.classList.remove('dragging'); }, 0);
      if (!d.moved) { const tId = d.t.closest && d.t.closest('[data-t]'); if (tId && !d.t.closest('.node')) select(tId.dataset.t === state.filter ? null : tId.dataset.t, true); }
    });
    svg.setAttribute('tabindex', '0');
    svg.addEventListener('keydown', e => {
      if (e.target !== svg) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { const ids = CLUSTER_ORDER, n = ids.length, cur = state.filter ? ids.indexOf(state.filter) : -1, dir = e.key === 'ArrowRight' ? 1 : -1; select(ids[cur < 0 ? 0 : (cur + dir + n) % n], true); e.preventDefault(); }
      if (e.key === 'Escape') select(null, true);
    });
  }
  apply(); layout(); raf = requestAnimationFrame(tick);
  return {
    set(k, v) { if (k === 'filter') select(v); else { state[k] = v; apply(); } },
    destroy() { dead = true; cancelAnimationFrame(raf); cleanup.forEach(f => f()); },
  };
}

/* ---------------- Geography ---------------- */
const DOTS = (() => {
  const out = [];
  DOTS_RLE.split('|').forEach((row, j) => {
    let x = 0, land = false;
    row.split('.').forEach(v => { const n = parseInt(v, 36); if (land) for (let k = 0; k < n; k++) out.push([x + k, j]); x += n; land = !land; });
  });
  return out;
})();
const proj = (lon, lat) => [lon + 180, 78 - lat];
// Geography frame: crops to inhabited longitudes so the map fills the same 2:1 panel as the Constellation
const GVB = { x: 52, y: -5, w: 290, h: 145 };
const GEO_LABELS = { 'North America': [-100, 58], 'Latin America': [-82, -6], 'Europe': [-2, 70], 'Africa': [20, -16], 'Middle East': [55, 20], 'Asia': [92, 50], 'Oceania': [128, -24] };

function mountGeo(root, opts = {}) {
  const state = { conv: true, host: false, filter: null, ...opts.state };
  const ppos = id => { const p = P[id]; const [x, y] = proj(p.lon, p.lat); const n = p.nudge || [0, 0]; return [x + n[0], y + n[1]]; };
  let arcs = '';
  const arc = (a, b, cls, extra) => { const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy); const qx = (a[0] + b[0]) / 2, qy = (a[1] + b[1]) / 2 - d * .28; return `<path class="arc ${cls}" ${extra} d="M${a[0].toFixed(1)},${a[1].toFixed(1)} Q${qx.toFixed(1)},${qy.toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}" fill="none"/>`; };
  PEOPLE.forEach((p, i) => PEOPLE.slice(i + 1).forEach(q => { const sh = p.themes.find(x => q.themes.includes(x)); if (sh) arcs += arc(ppos(p.id), ppos(q.id), 'a-theme', `data-a="${p.id}" data-b="${q.id}" stroke="${T[sh].deep}" stroke-width=".55" stroke-opacity=".7" stroke-dasharray=".6 1.6" stroke-linecap="round"`); }));
  PEOPLE.forEach(p => (p.connections || []).forEach(q => { if (P[q] && p.id < q) arcs += arc(ppos(p.id), ppos(q), 'a-manual', `data-a="${p.id}" data-b="${q}" stroke="#16233A" stroke-width=".6" stroke-opacity=".6"`); }));
  CONVERSATIONS.forEach(c => { if (c.guests.length > 1 && P[c.guests[0]] && P[c.guests[1]]) arcs += arc(ppos(c.guests[0]), ppos(c.guests[1]), 'a-conv', `data-a="${c.guests[0]}" data-b="${c.guests[1]}" stroke="#BF6248" stroke-width=".55" stroke-opacity=".8"`); });
  const counts = {}; REGIONS.forEach(r => counts[r] = CONVERSATIONS.filter(c => c.guests.some(g => P[g] && P[g].region === r)).length);
  const dots = DOTS.map(([x, y]) => `<circle cx="${x * 2 + 2}" cy="${y * 2}" r=".62"/>`).join('');
  root.classList.add('geo');
  root.innerHTML = `<svg viewBox="${GVB.x} ${GVB.y} ${GVB.w} ${GVB.h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="World map of Dialoguers guests"><g fill="#D6CCC1">${dots}</g>
<g>${arcs}</g></svg>
    ${Object.entries(GEO_LABELS).map(([r, [lo, la]]) => { const [x, y] = proj(lo, la); return `<div class="rlabel" style="left:${(x - GVB.x) / GVB.w * 100}%;top:${(y - GVB.y) / GVB.h * 100}%">${r}<small>${counts[r]} conversation${counts[r] === 1 ? '' : 's'}</small></div>`; }).join('')}
    ${PEOPLE.map(p => { const [x, y] = ppos(p.id); return `<a class="pin" data-id="${p.id}" href="/people/${p.id}" style="left:${(x - GVB.x) / GVB.w * 100}%;top:${(y - GVB.y) / GVB.h * 100}%" aria-label="${esc(p.name)}, ${esc(p.city)}">${av(p.id, 34)}</a>`; }).join('')}
    <div class="tip" aria-hidden="true"></div>`;
  const tip = $('.tip', root);
  const apply = () => {
    $$('.a-conv', root).forEach(e => e.style.display = state.conv ? '' : 'none');
    $$('.a-theme', root).forEach(e => e.style.display = state.theme ? '' : 'none');
    $$('.a-host', root).forEach(e => e.style.display = state.host ? '' : 'none');
    root.classList.remove('dim'); $$('.lit', root).forEach(x => x.classList.remove('lit'));
    if (state.filter) {
      root.classList.add('dim');
      const ids = new Set(PEOPLE.filter(p => p.themes.includes(state.filter)).map(p => p.id));
      $$('.pin', root).forEach(n => n.classList.toggle('lit', ids.has(n.dataset.id)));
      $$('.arc', root).forEach(e => e.classList.toggle('lit', ids.has(e.dataset.b) && ids.has(e.dataset.a)));
    }
  };
  $$('.pin', root).forEach(n => {
    const on = () => {
      const id = n.dataset.id, p = P[id];
      root.classList.add('dim'); $$('.lit', root).forEach(x => x.classList.remove('lit'));
      n.classList.add('lit');
      $$('.arc', root).forEach(e => { if (e.dataset.a === id || e.dataset.b === id) { e.classList.add('lit'); $$(`.pin[data-id="${e.dataset.a}"],.pin[data-id="${e.dataset.b}"]`, root).forEach(x => x.classList.add('lit')); } });
      const r = n.getBoundingClientRect(), rr = root.getBoundingClientRect();
      const n2 = convsOf(id).length;
      tip.innerHTML = `<b>${esc(p.name)}</b><small>${esc(p.role)} · ${esc(p.city)}</small><small style="margin-top:6px">${n2} conversation${n2 === 1 ? '' : 's'}</small>`;
      tip.style.left = Math.min(Math.max(r.left - rr.left - 105, 0), rr.width - 240) + 'px';
      tip.style.top = (r.bottom - rr.top + 8) + 'px'; tip.classList.add('on');
    };
    const off = () => { tip.classList.remove('on'); apply(); };
    n.addEventListener('mouseenter', on); n.addEventListener('focus', on);
    n.addEventListener('mouseleave', off); n.addEventListener('blur', off);
    n.addEventListener('click', e => { e.preventDefault(); navigate('/people/' + n.dataset.id); });
  });
  apply();
  return { set(k, v) { state[k] = v; apply(); }, destroy() {} };
}



  return { mountConstellation, mountGeo, MOBILE, TOUCH };
}
