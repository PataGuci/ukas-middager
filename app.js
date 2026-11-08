/* Ukas middager – UI og synk mot GitHub. Logikken ligger i lib.js. */
(function () {
  const L = window.Lib;
  const OWNER = (location.hostname.endsWith('.github.io') ? location.hostname.split('.')[0] : '') || '';
  const REPO = 'ukas-middager-data';
  const API = 'https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/';
  const POLL_MS = 6000;
  const TAGS = [['alle', 'Alle'], ['superrask', 'Superrask'], ['rask', 'Rask'], ['comfort', 'Comfort food'], ['italiensk', 'Italiensk'],
    ['meksikansk', 'Meksikansk'], ['asiatisk', 'Asiatisk'], ['norsk', 'Norsk'], ['kylling', 'Kylling'], ['kjott', 'Kjøtt'],
    ['fisk', 'Fisk'], ['pasta', 'Pasta'], ['ovn', 'I ovnen'], ['gryte', 'Gryte'], ['suppe', 'Suppe'], ['fredagskos', 'Fredagskos'], ['budsjett', 'Budsjett']];
  const TAGNAME = Object.fromEntries(TAGS);

  const CHECK_SVG = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const $ = id => document.getElementById(id);
  const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } } };
  const kr = n => Math.round(n).toLocaleString('nb-NO') + ' kr';

  if (location.hash.startsWith('#k=')) ls.set('ghkey', decodeURIComponent(location.hash.slice(3)));
  let KEY = ls.get('ghkey');
  let ME = ls.get('name');

  const S = { cat: null, lib: null, plan: null, planEtag: null, st: null, stSha: null, stEtag: null, queue: [], busy: false,
    hideDone: ls.get('hideDone') === '1', view: 'liste', sheetDay: null, filter: 'alle', q: '' };
  try { const c = JSON.parse(ls.get('cache2') || 'null'); if (c && c.plan && c.plan.v === 2) { S.plan = c.plan; S.st = c.st; } } catch (e) { }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function todayISO() { const d = new Date(), p = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
  function setStatus(t) { const s = $('status'); if (!t) { s.classList.add('hidden'); return; } s.innerHTML = t; s.classList.remove('hidden'); }
  function setSync(t, err) { const s = $('sync'); s.textContent = t; s.classList.toggle('err', !!err); }
  function b64enc(str) { return btoa(unescape(encodeURIComponent(str))); }
  function b64dec(b) { return decodeURIComponent(escape(atob(b.replace(/\n/g, '')))); }
  function saveCache() { ls.set('cache2', JSON.stringify({ plan: S.plan, st: S.st })); }

  // ---------- Setup ----------
  function showSetup() {
    $('setup').classList.remove('hidden'); $('app').classList.add('hidden');
    if (!KEY || !OWNER) { $('setupMsg').textContent = 'Åpne delingslenken du fikk tilsendt én gang på denne telefonen. Den inneholder nøkkelen til listen.'; $('nameForm').classList.add('hidden'); }
    else { $('setupMsg').textContent = 'Navnet vises ved det du krysser av, så dere ser hvem som har tatt hva.'; $('nameForm').classList.remove('hidden'); }
  }
  $('nameForm').addEventListener('submit', e => { e.preventDefault(); const v = $('nameInput').value.trim(); if (!v) return; ME = v; ls.set('name', v); boot(); });

  // ---------- GitHub ----------
  async function gh(path, opts) {
    opts = opts || {};
    const headers = Object.assign({ 'Authorization': 'Bearer ' + KEY, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }, opts.headers || {});
    return fetch(API + path, { method: opts.method || 'GET', headers, body: opts.body, cache: 'no-store' });
  }
  async function loadPlan() {
    const r = await gh('plan.json', { headers: S.planEtag ? { 'If-None-Match': S.planEtag } : {} });
    if (r.status === 304) return false;
    if (r.status === 404) { S.plan = null; return true; }
    if (r.status === 401 || r.status === 403) throw { auth: true };
    if (!r.ok) throw { status: r.status };
    S.planEtag = r.headers.get('ETag');
    S.plan = JSON.parse(b64dec((await r.json()).content));
    return true;
  }
  async function loadState(force) {
    const r = await gh('state.json', { headers: (!force && S.stEtag) ? { 'If-None-Match': S.stEtag } : {} });
    if (r.status === 304) return false;
    if (r.status === 404) { S.st = null; S.stSha = null; S.stEtag = null; return true; }
    if (r.status === 401 || r.status === 403) throw { auth: true };
    if (!r.ok) throw { status: r.status };
    S.stEtag = r.headers.get('ETag');
    const j = await r.json(); S.stSha = j.sha; S.st = JSON.parse(b64dec(j.content));
    return true;
  }
  function curState() {
    if (!S.plan) return L.rollover(null, '');
    if (S.st && S.st.weekId === S.plan.weekId) return S.st;
    return L.rollover(S.st, S.plan.weekId); // ny uke: egne varer som ikke er kjøpt blir med videre
  }
  function viewState() { return S.queue.reduce((st, op) => L.applyOp(st, op, ME), curState()); }

  async function flush() {
    if (S.busy || !S.queue.length) return;
    S.busy = true; setSync('lagrer …');
    try {
      for (let attempt = 0; attempt < 4 && S.queue.length; attempt++) {
        const ops = S.queue.slice();
        const next = ops.reduce((st, op) => L.applyOp(st, op, ME), curState());
        const body = { message: 'Handleliste: ' + ops.map(o => o.t).join(','), content: b64enc(JSON.stringify(next)) };
        if (S.stSha) body.sha = S.stSha;
        const r = await gh('state.json', { method: 'PUT', body: JSON.stringify(body) });
        if (r.ok) {
          const j = await r.json(); S.st = next; S.stSha = j.content.sha; S.stEtag = null;
          S.queue = S.queue.slice(ops.length); saveCache();
        } else if (r.status === 409 || r.status === 422) { await loadState(true); }
        else if (r.status === 401 || r.status === 403) throw { auth: true };
        else throw { status: r.status };
      }
      setSync(S.queue.length ? 'ikke lagret' : 'lagret', !!S.queue.length);
    } catch (e) { setSync(e && e.auth ? 'nøkkel avvist' : 'frakoblet – prøver igjen', true); }
    finally { S.busy = false; render(); }
  }
  function enqueue(op) { op.at = new Date().toISOString(); S.queue.push(op); render(); flush(); }

  async function poll() {
    if (document.hidden) return;
    try {
      const a = await loadPlan(), b = await loadState(false);
      if (a || b) { saveCache(); render(); }
      if (!S.queue.length) setSync('oppdatert ' + new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }));
      setStatus(!S.plan ? 'Ingen liste ennå. Ukas liste kommer søndag kveld.' : (S.plan.v !== 2 ? 'Ukeplanen har et gammelt format. Den nye kommer søndag.' : ''));
      flush();
    } catch (e) {
      if (e && e.auth) setStatus('Nøkkelen ble avvist. Den kan ha utløpt. Be om en ny delingslenke.');
      setSync('frakoblet', true);
    }
  }

  // ---------- Derived week ----------
  function week() {
    const st = viewState();
    if (!S.plan || S.plan.v !== 2 || !S.cat || !S.lib) return null;
    const recipes = L.indexRecipes(S.lib, S.plan);
    const days = L.effectiveDays(S.plan, st, recipes);
    const items = L.buildList(days, S.cat, S.plan.offers);
    return { st, recipes, days, items, total: L.weekTotal(items, st.extras, st, S.cat, S.plan.offers) };
  }

  // ---------- Render ----------
  function itemRow(o) {
    // o: {kind:'item'|'extra', id, name, qty, sub, chips, done, have, who}
    const data = o.kind === 'item' ? 'data-item' : 'data-extra';
    return '<li class="item' + (o.done ? ' done' : '') + (o.pantry ? ' pantry' : '') + '">' +
      '<button class="tick" type="button" ' + data + '="' + esc(o.id) + '" aria-pressed="' + !!o.done + '"><span class="box">' + CHECK_SVG + '</span>' +
      '<span class="nm"><span class="t">' + esc(o.name) + '</span>' + (o.chips ? '<span class="meta">' + o.chips + '</span>' : '') + '</span>' +
      '<span class="qty">' + esc(o.qty || '') + '</span></button>' +
      '<button class="have" type="button" ' + (o.kind === 'item' ? 'data-have' : 'data-xhave') + '="' + esc(o.id) + '" aria-label="Har allerede ' + esc(o.name) + '">' + (o.have ? 'Angre' : 'Har') + '</button>' +
      (o.kind === 'extra' && !o.have ? '<button class="del" type="button" data-del="' + esc(o.id) + '" aria-label="Fjern ' + esc(o.name) + '">×</button>' : '') +
      '</li>';
  }
  const who = by => (by && by !== ME) ? '<span class="chip who">' + esc(by) + '</span>' : '';

  function renderList(w) {
    const st = w.st, sections = S.cat.sections;
    const rows = {}; sections.forEach(s => rows[s] = []);
    const haveRows = [];
    let done = 0, total = 0;
    const dayShort = i => (w.days[i] && w.days[i].label || '').slice(0, 3).toLowerCase();
    w.items.forEach(i => {
      const isHave = !!st.have[i.id], isDone = !!st.checks[i.id];
      let chips = '';
      if (i.offer) chips += '<span class="chip offer">' + esc(i.offer) + '</span>';
      if (i.pantry) chips += '<span class="chip">sjekk skapet</span>';
      if (i.needText) chips += '<span class="chip">' + esc(i.needText) + '</span>';
      chips += '<span class="chip">' + Array.from(new Set(i.days.map(dayShort))).join(', ') + '</span>';
      if (isDone) chips += who(st.checks[i.id].by);
      const row = { kind: 'item', id: i.id, name: i.name, qty: i.qty, chips, done: isDone, have: isHave, pantry: i.pantry };
      if (isHave) { haveRows.push(row); return; }
      total++; if (isDone) done++;
      if (S.hideDone && isDone) return;
      (rows[i.section] = rows[i.section] || []).push(row);
    });
    st.extras.forEach(x => {
      const p = x.p && S.cat.byId[x.p];
      let chips = '<span class="chip">lagt til</span>';
      if (x.carried) chips += '<span class="chip">fra forrige uke</span>';
      if (!p) chips += '<span class="chip">uten pris</span>';
      chips += who(x.checked ? x.by : x.addedBy);
      const row = { kind: 'extra', id: x.id, name: x.name, qty: p ? (p.sz === 1 && p.u === 'stk' ? '1 stk' : '1 pk') : '', chips, done: !!x.checked, have: !!x.have };
      if (x.have) { haveRows.push(row); return; }
      total++; if (x.checked) done++;
      if (S.hideDone && x.checked) return;
      const sec = x.s && rows[x.s] ? x.s : 'Annet';
      rows[sec].push(row);
    });
    $('count').textContent = done + ' av ' + total;
    $('barfill').style.width = total ? (100 * done / total) + '%' : '0';

    let h = '';
    sections.forEach(sec => {
      const r = rows[sec]; if (!r || !r.length) return;
      h += '<div class="sec"><h2>' + esc(sec) + ' <span class="cnt">' + r.filter(x => x.done).length + '/' + r.length + '</span></h2><ul class="items">' + r.map(itemRow).join('') + '</ul></div>';
    });
    $('sections').innerHTML = h || '<p class="note">Alt er krysset av.</p>';
    $('haveBox').innerHTML = haveRows.length ? '<details class="havebox"><summary>Har hjemme (' + haveRows.length + ')</summary><ul class="items">' + haveRows.map(itemRow).join('') + '</ul></details>' : '';

    const t = w.total;
    $('sum').innerHTML = '<div class="big"><span>Anslått sum</span><span>ca. ' + kr(t.total) + '</span></div>' +
      '<div><span>I kurven</span><span>ca. ' + kr(t.inCart) + '</span></div>' +
      '<small>Prisene er anslag for Kiwi' + (t.unpriced ? ', ' + t.unpriced + ' vare' + (t.unpriced > 1 ? 'r' : '') + ' uten pris' : '') + '. Varer du har hjemme er trukket fra.</small>';
  }

  function renderDays(w) {
    const today = todayISO(); let dh = '';
    if (S.plan.offerStatus) dh += '<div class="note">' + esc(S.plan.offerStatus) + '</div>';
    w.days.forEach((d, idx) => {
      const r = d.r, t = d.date === today;
      if (!r) return;
      const conf = L.conflicts(w.days, idx, r, S.cat);
      dh += '<details class="day' + (t ? ' today' : '') + '"' + (t ? ' open' : '') + ' id="dag-' + esc(d.key) + '"><summary><span class="dl">' + esc((d.label || '').slice(0, 3)) + '<b>' + (d.date ? Number(d.date.slice(8, 10)) : '') + '</b></span>' +
        '<span class="dish">' + esc(r.name) + (t ? '<span class="today-tag">i dag</span>' : '') + '</span><span class="min">' + r.minutes + ' min</span></summary><div class="body">' +
        '<div class="rm" style="display:flex;gap:6px;flex-wrap:wrap">' + (d.swapped ? '<span class="chip swap">byttet</span>' : '') + r.tags.map(tg => '<span class="chip">' + esc(TAGNAME[tg] || tg) + '</span>').join('') + conf.map(c => '<span class="chip warn">' + esc(c) + '</span>').join('') + '</div>' +
        '<div><h3>Ingredienser</h3><ul>' + r.ing.map(x => '<li>' + esc(x.t) + '</li>').join('') + '</ul></div>' +
        '<div><h3>Slik gjør du</h3><ol>' + r.steps.map(x => '<li>' + esc(x) + '</li>').join('') + '</ol></div>' +
        '<div class="daybtns"><button class="btn" type="button" data-swap="' + esc(d.key) + '">Bytt middag</button>' +
        (d.swapped && w.recipes[d.original] ? '<button class="ghost" type="button" data-unswap="' + esc(d.key) + '">Tilbake til ' + esc(w.recipes[d.original].name.split(' med ')[0].toLowerCase()) + '</button>' : '') + '</div>' +
        '</div></details>';
    });
    const fl = L.freezeHints(w.days, S.cat).concat(L.leftoverHints(w.items));
    if (fl.length) dh += '<div class="freeze"><h2>Frys og rester</h2><ul>' + fl.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>';
    const open = new Set([...document.querySelectorAll('details.day')].filter(d => d.open).map(d => d.id));
    const had = document.querySelectorAll('details.day').length > 0;
    $('days').innerHTML = dh;
    if (had) document.querySelectorAll('details.day').forEach(d => { d.open = open.has(d.id); });
  }

  function renderSheet(w) {
    if (!S.sheetDay) { $('sheet').classList.add('hidden'); return; }
    const idx = w.days.findIndex(d => d.key === S.sheetDay);
    const d = w.days[idx]; if (!d) { S.sheetDay = null; $('sheet').classList.add('hidden'); return; }
    $('sheet').classList.remove('hidden');
    $('sheetTitle').textContent = 'Bytt ' + (d.label || '').toLowerCase();
    const ranked = L.rankSwaps(w.days, idx, w.recipes, S.cat, S.plan.offers).filter(x => x.r.id !== d.rid);
    const card = (x, best) => '<button type="button" class="rcard' + (best ? ' best' : '') + '" data-pick="' + esc(x.r.id) + '"><span class="rn">' + esc(x.r.name) + '</span>' +
      '<span class="rm"><span class="chip">' + x.r.minutes + ' min</span>' + x.r.tags.slice(0, 3).map(tg => '<span class="chip">' + esc(TAGNAME[tg] || tg) + '</span>').join('') +
      '<span class="delta">' + (x.delta > 0 ? '+' : '') + x.delta + ' kr</span></span>' +
      ((x.uses.length || x.conflicts.length || x.inWeek) ? '<span class="rm">' + (x.uses.length ? '<span class="chip good">bruker opp: ' + esc(x.uses.slice(0, 4).join(', ').toLowerCase()) + '</span>' : '') +
        x.conflicts.map(c => '<span class="chip warn">' + esc(c) + '</span>').join('') + (x.inWeek ? '<span class="chip warn">står allerede på uka</span>' : '') + '</span>' : '') + '</button>';
    let h = '';
    const best = ranked.filter(x => !x.conflicts.length && !x.inWeek).slice(0, 3);
    if (best.length && S.filter === 'alle' && !S.q) h += '<h3>Forslag som bruker opp ukas råvarer</h3><div class="rlist">' + best.map(x => card(x, true)).join('') + '</div>';
    h += '<h3>Bibliotek</h3><input type="search" id="rq" placeholder="Søk i oppskrifter" value="' + esc(S.q) + '">' +
      '<div class="filters">' + TAGS.map(([k, n]) => '<button type="button" data-filter="' + k + '" aria-pressed="' + (S.filter === k) + '">' + n + '</button>').join('') + '</div>';
    const nq = L.norm(S.q);
    const list = ranked.filter(x => (S.filter === 'alle' || x.r.tags.includes(S.filter)) && (!nq || L.norm(x.r.name).includes(nq) || x.r.ing.some(i => L.norm(i.t).includes(nq))))
      .sort((a, b) => a.r.name.localeCompare(b.r.name, 'nb'));
    h += '<div class="rlist">' + (list.length ? list.map(x => card(x, false)).join('') : '<p class="note">Ingen oppskrifter passer.</p>') + '</div>';
    const hadFocus = document.activeElement && document.activeElement.id === 'rq';
    const pos = hadFocus ? document.activeElement.selectionStart : null;
    $('sheetBody').innerHTML = h;
    if (hadFocus) { const i = $('rq'); i.focus(); try { i.setSelectionRange(pos, pos); } catch (e) { } }
  }

  function render() {
    $('me').textContent = ME ? 'Du er ' + ME : '';
    $('tab-liste').setAttribute('aria-selected', S.view === 'liste');
    $('tab-middager').setAttribute('aria-selected', S.view === 'middager');
    $('view-liste').classList.toggle('hidden', S.view !== 'liste');
    $('view-middager').classList.toggle('hidden', S.view !== 'middager');
    const p = S.plan;
    if (p) { $('kicker').textContent = (p.weekLabel || '') + (p.dates ? ' · ' + p.dates : '') + ' · Kiwi'; $('title').textContent = p.title || 'Ukas middager'; }
    const w = week();
    if (!w) { $('sections').innerHTML = ''; $('days').innerHTML = ''; $('sum').innerHTML = ''; $('haveBox').innerHTML = ''; $('count').textContent = '–'; return; }
    renderList(w); renderDays(w); renderSheet(w);
  }

  // ---------- Autocomplete ----------
  let suggIdx = -1, suggItems = [];
  function renderSugg() {
    const q = $('addInput').value.trim();
    if (!q || !S.cat) { $('sugg').classList.add('hidden'); $('addInput').setAttribute('aria-expanded', 'false'); suggItems = []; return; }
    const hits = L.searchCatalog(S.cat, q, 7);
    suggItems = hits.map(p => ({ p, name: p.n, s: p.s }));
    const exact = hits.some(p => L.norm(p.n) === L.norm(q));
    if (!exact) suggItems.push({ p: null, name: q, s: L.guessSection(S.cat, q) });
    if (suggIdx >= suggItems.length) suggIdx = -1;
    $('sugg').innerHTML = suggItems.map((x, i) => '<li><button type="button" role="option" data-sugg="' + i + '" class="' + (i === suggIdx ? 'act' : '') + '"><span>' + (x.p ? esc(x.name) : 'Legg til «' + esc(x.name) + '»') + '</span><small>' + esc(x.s) + (x.p && x.p.pr ? ' · ' + kr(x.p.pr) : '') + '</small></button></li>').join('');
    $('sugg').classList.remove('hidden'); $('addInput').setAttribute('aria-expanded', 'true');
  }
  function addSugg(x) {
    if (!x || !S.plan) return;
    enqueue({ t: 'add', x: { id: 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), p: x.p ? x.p.id : null, name: x.p ? x.p.n : x.name, s: x.s, checked: false, addedBy: ME } });
    $('addInput').value = ''; suggIdx = -1; renderSugg(); $('addInput').focus();
  }
  $('addInput').addEventListener('input', () => { suggIdx = -1; renderSugg(); });
  $('addInput').addEventListener('keydown', e => {
    if (!suggItems.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); suggIdx = (suggIdx + 1) % suggItems.length; renderSugg(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); suggIdx = (suggIdx - 1 + suggItems.length) % suggItems.length; renderSugg(); }
    else if (e.key === 'Escape') { $('addInput').value = ''; renderSugg(); }
  });
  $('addInput').addEventListener('blur', () => setTimeout(() => { $('sugg').classList.add('hidden'); }, 200));
  $('addInput').addEventListener('focus', renderSugg);
  $('sugg').addEventListener('mousedown', e => e.preventDefault());
  $('sugg').addEventListener('click', e => { const b = e.target.closest('[data-sugg]'); if (b) addSugg(suggItems[+b.dataset.sugg]); });
  $('addForm').addEventListener('submit', e => {
    e.preventDefault(); if (!$('addInput').value.trim()) return;
    if (!suggItems.length) renderSugg();
    addSugg(suggItems[suggIdx >= 0 ? suggIdx : 0]);
  });

  // ---------- Events ----------
  $('tab-liste').addEventListener('click', () => { S.view = 'liste'; render(); });
  $('tab-middager').addEventListener('click', () => { S.view = 'middager'; render(); });
  $('hideDone').checked = S.hideDone;
  $('hideDone').addEventListener('change', e => { S.hideDone = e.target.checked; ls.set('hideDone', S.hideDone ? '1' : '0'); render(); });
  function listClick(e) {
    const t = e.target.closest('[data-item],[data-extra],[data-del],[data-have],[data-xhave]'); if (!t || !S.plan) return;
    const st = viewState();
    if (t.dataset.item) enqueue({ t: 'check', id: t.dataset.item, v: !st.checks[t.dataset.item] });
    else if (t.dataset.have) enqueue({ t: 'have', id: t.dataset.have, v: !st.have[t.dataset.have] });
    else if (t.dataset.extra) { const x = st.extras.find(x => x.id === t.dataset.extra); if (x) enqueue({ t: 'xcheck', id: x.id, v: !x.checked }); }
    else if (t.dataset.xhave) { const x = st.extras.find(x => x.id === t.dataset.xhave); if (x) enqueue({ t: 'xhave', id: x.id, v: !x.have }); }
    else if (t.dataset.del) enqueue({ t: 'del', id: t.dataset.del });
  }
  $('sections').addEventListener('click', listClick);
  $('haveBox').addEventListener('click', listClick);
  $('days').addEventListener('click', e => {
    const s = e.target.closest('[data-swap]'); if (s) { S.sheetDay = s.dataset.swap; S.filter = 'alle'; S.q = ''; render(); $('sheetBody').scrollTop = 0; return; }
    const u = e.target.closest('[data-unswap]'); if (u) enqueue({ t: 'swap', day: u.dataset.unswap, r: null });
  });
  $('sheetClose').addEventListener('click', () => { S.sheetDay = null; render(); });
  $('sheet').addEventListener('click', e => { if (e.target === $('sheet')) { S.sheetDay = null; render(); } });
  $('sheetBody').addEventListener('click', e => {
    const f = e.target.closest('[data-filter]'); if (f) { S.filter = f.dataset.filter; render(); return; }
    const p = e.target.closest('[data-pick]');
    if (p) { const day = S.sheetDay; S.sheetDay = null; const orig = S.plan.days.find(d => d.key === day); enqueue({ t: 'swap', day, r: orig && orig.recipe === p.dataset.pick ? null : p.dataset.pick }); }
  });
  $('sheetBody').addEventListener('input', e => { if (e.target.id === 'rq') { S.q = e.target.value; render(); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.sheetDay) { S.sheetDay = null; render(); } });
  $('shareBtn').addEventListener('click', async () => {
    const link = location.origin + location.pathname + '#k=' + encodeURIComponent(KEY);
    try { await navigator.clipboard.writeText(link); $('shareBtn').textContent = 'Lenke kopiert – send den til den andre'; }
    catch (e) { $('shareBtn').textContent = 'Kunne ikke kopiere'; }
    setTimeout(() => { $('shareBtn').textContent = 'Kopier delingslenke'; }, 4000);
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
  window.addEventListener('online', () => { flush(); poll(); });

  // ---------- Boot ----------
  async function loadStatic() {
    try {
      const [c, r] = await Promise.all([fetch('data/catalog.json', { cache: 'no-cache' }).then(x => x.json()), fetch('data/recipes.json', { cache: 'no-cache' }).then(x => x.json())]);
      S.cat = L.indexCatalog(c); S.lib = r; render();
    } catch (e) { setStatus('Kunne ikke laste varekatalogen. Sjekk nettet og åpne appen på nytt.'); }
  }
  let timer = null;
  function boot() {
    if (!KEY || !OWNER || !ME) { showSetup(); return; }
    $('setup').classList.add('hidden'); $('app').classList.remove('hidden');
    render(); loadStatic(); poll();
    if (!timer) timer = setInterval(poll, POLL_MS);
  }
  boot();
})();
