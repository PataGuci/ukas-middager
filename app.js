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
  const MONTHS = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];

  const CHECK_SVG = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const $ = id => document.getElementById(id);
  const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } } };
  const kr = n => Math.round(n).toLocaleString('nb-NO') + ' kr';

  if (location.hash.startsWith('#k=')) ls.set('ghkey', decodeURIComponent(location.hash.slice(3)));
  let KEY = ls.get('ghkey');
  let ME = ls.get('name');

  const S = { cat: null, lib: null, plan: null, planEtag: null, st: null, stSha: null, stEtag: null, queue: [], busy: false,
    hist: null, histSha: null, histEtag: null, histBusy: false,
    rawCat: null, prices: null, pricesEtag: null, rdirEtag: null, receipts: {}, rsha: {}, edit: null, mapBusy: false, mapWait: {}, upBusy: false,
    pending: (() => { try { return JSON.parse(ls.get('pendingReceipt') || 'null'); } catch (e) { return null; } })(),
    hideDone: ls.get('hideDone') === '1', view: ls.get('view') || 'oversikt', sheet: null, filter: 'alle', q: '', month: null };
  try { const c = JSON.parse(ls.get('cache3') || 'null'); if (c && c.plan && c.plan.v === 2) { S.plan = c.plan; S.st = c.st; S.hist = c.hist; } } catch (e) { }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function todayISO() { const d = new Date(), p = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
  function setStatus(t) { const s = $('status'); if (!t) { s.classList.add('hidden'); return; } s.innerHTML = t; s.classList.remove('hidden'); }
  function setSync(t, err) { const s = $('sync'); s.textContent = t; s.classList.toggle('err', !!err); }
  function b64enc(str) { return btoa(unescape(encodeURIComponent(str))); }
  function b64dec(b) { return decodeURIComponent(escape(atob(b.replace(/\n/g, '')))); }
  function saveCache() { ls.set('cache3', JSON.stringify({ plan: S.plan, st: S.st, hist: S.hist })); }

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
  /** Read a JSON file. Returns {changed, data, sha, etag}. */
  async function readFile(name, etag) {
    const r = await gh(name, { headers: etag ? { 'If-None-Match': etag } : {} });
    if (r.status === 304) return { changed: false };
    if (r.status === 404) return { changed: true, data: null, sha: null, etag: null };
    if (r.status === 401 || r.status === 403) throw { auth: true };
    if (!r.ok) throw { status: r.status };
    const j = await r.json();
    return { changed: true, data: JSON.parse(b64dec(j.content)), sha: j.sha, etag: r.headers.get('ETag') };
  }
  async function writeFile(name, data, sha, msg) {
    const body = { message: msg, content: b64enc(JSON.stringify(data)) };
    if (sha) body.sha = sha;
    const r = await gh(name, { method: 'PUT', body: JSON.stringify(body) });
    if (r.ok) return { ok: true, sha: (await r.json()).content.sha };
    if (r.status === 409 || r.status === 422) return { conflict: true };
    if (r.status === 401 || r.status === 403) throw { auth: true };
    throw { status: r.status };
  }

  async function loadPlan() { const f = await readFile('plan.json', S.planEtag); if (!f.changed) return false; S.plan = f.data; S.planEtag = f.etag; return true; }
  async function loadState(force) { const f = await readFile('state.json', force ? null : S.stEtag); if (!f.changed) return false; S.st = f.data; S.stSha = f.sha; S.stEtag = f.etag; return true; }
  async function loadHist(force) { const f = await readFile('history.json', force ? null : S.histEtag); if (!f.changed) return false; S.hist = f.data; S.histSha = f.sha; S.histEtag = f.etag; return true; }

  async function loadPrices() {
    const f = await readFile('prices.json', S.pricesEtag); if (!f.changed) return false;
    S.prices = f.data; S.pricesEtag = f.etag; if (S.rawCat) S.cat = L.indexCatalog(L.applyPrices(S.rawCat, S.prices)); return true;
  }
  /** Kvitteringer: list mappen (med ETag), hent bare JSON-filer som er nye eller endret. */
  async function loadReceipts() {
    const r = await gh('receipts', { headers: S.rdirEtag ? { 'If-None-Match': S.rdirEtag } : {} });
    if (r.status === 304) return false;
    if (r.status === 404) { S.rdirEtag = null; return false; }
    if (r.status === 401 || r.status === 403) throw { auth: true };
    if (!r.ok) return false;
    S.rdirEtag = r.headers.get('ETag');
    const list = await r.json(); let changed = false;
    S.rimgs = new Set(list.filter(x => /\.(jpe?g|pdf)$/i.test(x.name)).map(x => x.name.replace(/\.[^.]+$/, '')));
    for (const x of list.filter(x => /\.json$/.test(x.name))) {
      const id = x.name.replace(/\.json$/, '');
      if (S.rsha[id] === x.sha) continue;
      const f = await readFile('receipts/' + x.name);
      if (f.data) { S.receipts[id] = f.data; S.rsha[id] = x.sha; delete S.mapWait[id]; changed = true; }
    }
    if (S.pending && S.receipts[S.pending.id]) { S.lastOther = S.pending.id; S.pending = null; ls.set('pendingReceipt', 'null'); changed = true; }
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
        const w = await writeFile('state.json', next, S.stSha, 'Handleliste: ' + ops.map(o => o.t).join(','));
        if (w.ok) { S.st = next; S.stSha = w.sha; S.stEtag = null; S.queue = S.queue.slice(ops.length); saveCache(); }
        else await loadState(true); // noen andre lagret først: hent og prøv igjen
      }
      setSync(S.queue.length ? 'ikke lagret' : 'lagret', !!S.queue.length);
    } catch (e) { setSync(e && e.auth ? 'nøkkel avvist' : 'frakoblet – prøver igjen', true); }
    finally { S.busy = false; render(); }
  }
  function enqueue(op) { op.at = new Date().toISOString(); S.queue.push(op); render(); flush(); }

  async function histOp(op) {
    if (S.histBusy) return;
    S.histBusy = true; setSync('lagrer …');
    try {
      for (let attempt = 0; attempt < 4; attempt++) {
        await loadHist(true);
        const next = L.applyHistOp(S.hist || L.emptyHistory(), op);
        const w = await writeFile('history.json', next, S.histSha, 'Budsjett: ' + op.t);
        if (w.ok) { S.hist = next; S.histSha = w.sha; S.histEtag = null; saveCache(); setSync('lagret'); return true; }
      }
      setSync('ikke lagret', true);
    } catch (e) { setSync(e && e.auth ? 'nøkkel avvist' : 'frakoblet', true); }
    finally { S.histBusy = false; render(); }
    return false;
  }

  async function poll() {
    if (document.hidden) return;
    try {
      const a = await loadPlan(), b = await loadState(false), c = await loadHist(false);
      // priser og kvitteringer endres sjelden: sjekk hvert 10. poll, eller oftere når en kvittering venter eller oversikten er åpen
      S.pollN = (S.pollN || 0) + 1;
      const slow = S.pollN % 10 === 1, recNow = slow || !!S.pending || Object.keys(S.mapWait).length > 0 || (S.view === 'oversikt' && S.pollN % 3 === 1);
      const d = slow ? await loadPrices().catch(() => false) : false;
      const e = recNow ? await loadReceipts().catch(err => { if (err && err.auth) throw err; return false; }) : false;
      if (a || b || c) saveCache();
      if (a || b || c || d || e) render();
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
    const items = L.buildList(days, S.cat, S.plan.offers, st);
    return { st, recipes, days, items, total: L.weekTotal(items, st.extras, st, S.cat, S.plan.offers) };
  }

  // ---------- Render: list ----------
  const who = by => (by && by !== ME) ? '<span class="chip who">' + esc(by) + '</span>' : '';
  function stepper(kind, id, text) {
    return '<span class="step"><button type="button" class="sb" data-' + kind + '="' + esc(id) + '" data-d="-1" aria-label="Færre">−</button>' +
      '<span class="sq">' + esc(text) + '</span><button type="button" class="sb" data-' + kind + '="' + esc(id) + '" data-d="1" aria-label="Flere">+</button></span>';
  }
  function row(o) {
    const data = o.kind === 'item' ? 'data-item' : 'data-extra';
    let right = '';
    if (o.restore) right = '<button class="have" type="button" data-restore="' + esc(o.id) + '" data-kind="' + o.kind + '">Angre</button>';
    else if (o.pantry) right = '<button class="have" type="button" data-have="' + esc(o.id) + '" aria-label="Har allerede ' + esc(o.name) + '">Har<br>hjemme</button>';
    else right = stepper(o.kind === 'item' ? 'qty' : 'xqty', o.id, o.qty);
    return '<li class="item' + (o.done ? ' done' : '') + (o.pantry ? ' pantry' : '') + '">' +
      '<button class="tick" type="button" ' + data + '="' + esc(o.id) + '" aria-pressed="' + !!o.done + '"><span class="box">' + CHECK_SVG + '</span>' +
      '<span class="nm"><span class="t">' + esc(o.name) + '</span>' + (o.chips ? '<span class="meta">' + o.chips + '</span>' : '') + '</span></button>' + right + '</li>';
  }

  function renderList(w) {
    const st = w.st, sections = S.cat.sections;
    const rows = {}; sections.forEach(s => rows[s] = []);
    const haveRows = [];
    let done = 0, total = 0;
    const dayShort = k => (L.DAYS.find(d => d[0] === k) || [k, k])[1].slice(0, 3).toLowerCase();
    w.items.forEach(i => {
      const have = L.isHave(i, st), isDone = !!st.checks[i.id];
      let chips = '';
      if (i.offer) chips += '<span class="chip offer">' + esc(i.offer) + '</span>';
      if (i.pantry) chips += '<span class="chip">sjekk skapet</span>';
      if (i.needText) chips += '<span class="chip">' + esc(i.needText) + '</span>';
      if (i.parts && i.parts.length > 1 && !i.pantry && i.p.sz !== 1) chips += '<span class="chip split">deles: ' + i.parts.map(x => esc(x.name.split(' ')[0]) + ' ' + L.fmtAmount(x.a, i.p.u)).join(' + ') + '</span>';
      if (i.adjusted) chips += '<span class="chip">listen sa ' + i.auto + '</span>';
      chips += '<span class="chip day">til ' + Array.from(new Set(i.days.map(dayShort))).join(' + ') + '</span>';
      if (isDone) chips += who(st.checks[i.id].by);
      const r = { kind: 'item', id: i.id, name: i.name, qty: i.qtyText, chips, done: isDone, pantry: i.pantry };
      if (have) { haveRows.push(Object.assign(r, { restore: true, done: false })); return; }
      total++; if (isDone) done++;
      if (S.hideDone && isDone) return;
      rows[i.section].push(r);
    });
    st.extras.forEach(x => {
      const p = x.p && S.cat.byId[x.p];
      let chips = '<span class="chip">lagt til</span>';
      if (x.carried) chips += '<span class="chip">fra forrige uke</span>';
      if (!p) chips += '<span class="chip">uten pris</span>';
      chips += who(x.checked ? x.by : x.addedBy);
      const n = x.n || 1;
      const r = { kind: 'extra', id: x.id, name: x.name, qty: n + (p && p.sz !== 1 ? ' pk' : ' stk'), chips, done: !!x.checked };
      if (x.have) { haveRows.push(Object.assign(r, { restore: true, done: false })); return; }
      total++; if (x.checked) done++;
      if (S.hideDone && x.checked) return;
      (rows[x.s] || rows['Annet']).push(r);
    });
    $('count').textContent = done + ' av ' + total;
    $('barfill').style.width = total ? (100 * done / total) + '%' : '0';
    let h = '';
    sections.forEach((sec, si) => {
      const r = rows[sec]; if (!r || !r.length) return;
      h += '<div class="sec c' + (si % 6) + (r.every(x => x.done) ? ' alldone' : '') + '"><h2>' + esc(sec) + ' <span class="cnt">' + r.filter(x => x.done).length + '/' + r.length + '</span></h2><ul class="items">' + r.map(row).join('') + '</ul></div>';
    });
    $('sections').innerHTML = (total && done === total ? '<div class="cheer"><b>Alt er i kurven!</b><span>God tur hjem.</span></div>' : '') + (h || (total ? '' : '<p class="note">Lista er tom.</p>'));
    $('haveBox').innerHTML = haveRows.length ? '<details class="havebox"><summary>Har hjemme (' + haveRows.length + ')</summary><ul class="items">' + haveRows.map(row).join('') + '</ul></details>' : '';
    const t = w.total;
    $('sum').innerHTML = '<div class="big"><span>Anslått sum</span><span>ca. ' + kr(t.total) + '</span></div>' +
      '<div><span>I kurven</span><span>ca. ' + kr(t.inCart) + '</span></div>' +
      '<small>' + (() => { const n = w.items.filter(i => i.p.obs).length; return n ? n + ' av varene har pris fra egne kvitteringer, resten er anslag for Kiwi' : 'Prisene er anslag for Kiwi'; })() + (t.unpriced ? ', ' + t.unpriced + ' vare' + (t.unpriced > 1 ? 'r' : '') + ' uten pris' : '') + '. Trykk − ned til 0 for varer dere har hjemme.</small>' + (S.plan.offerStatus ? '<div class="offerline">' + esc(S.plan.offerStatus) + '</div>' : '');
  }

  // ---------- Render: dinners ----------
  function renderDays(w) {
    const today = todayISO(); let dh = '';
    dh += '<p class="hint">Trykk på en dag for å se oppskriften. Fargen viser hva retten er laget av.</p><div class="legend"><span class="lg p-fisk">fisk</span><span class="lg p-kylling">kylling</span><span class="lg p-kjott">kjøtt</span><span class="lg p-annet">annet</span></div>';
    w.days.forEach((d, idx) => {
      const r = d.r, t = d.date === today;
      if (!r) return;
      const conf = L.conflicts(w.days, idx, r, S.cat);
      const prot = r.tags.includes('fisk') ? ' p-fisk' : r.tags.includes('kylling') ? ' p-kylling' : r.tags.includes('kjott') ? ' p-kjott' : ' p-annet';
      const hn = L.healthNotes(r);
      dh += '<details class="day' + prot + (t ? ' today' : '') + '"' + (t ? ' open' : '') + ' id="dag-' + esc(d.key) + '"><summary><span class="dl">' + esc((d.label || '').slice(0, 3)) + '<b>' + (d.date ? Number(d.date.slice(8, 10)) : '') + '</b></span>' +
        '<span class="dish">' + esc(r.name) + (t ? '<span class="today-tag">i dag</span>' : '') + '</span><span class="min">' + r.minutes + ' min<i class="chev" aria-hidden="true"></i></span></summary><div class="body">' +
        '<div class="rm">' + (d.swapped ? '<span class="chip swap">byttet</span>' : '') + (!d.planned ? '<span class="chip swap">lagt til</span>' : '') + r.tags.map(tg => '<span class="chip">' + esc(TAGNAME[tg] || tg) + '</span>').join('') + conf.map(c => '<span class="chip warn">' + esc(c) + '</span>').join('') + '</div>' +
        (hn.length ? '<div class="health"><h3>Bra for kroppen</h3><ul>' + hn.map(n => '<li class="h-' + n.kind + '">' + esc(n.text) + '.</li>').join('') + '</ul></div>' : '') +
        '<div class="porow"><span>Porsjoner</span><span class="step"><button type="button" class="sb" data-portions="' + esc(d.key) + '" data-d="-0.5" aria-label="Færre porsjoner">−</button><span class="sq">' + L.fmtNum(d.portions) + '</span><button type="button" class="sb" data-portions="' + esc(d.key) + '" data-d="0.5" aria-label="Flere porsjoner">+</button></span></div>' +
        '<button class="btn startcook" type="button" data-cook="' + esc(d.key) + '">Start matlagingen</button>' +
        '<div><h3>Ingredienser</h3><ul>' + r.ing.map(x => '<li>' + esc(L.ingText(x, d.portions)) + (x.add ? ' <span class="chip add">tillegg</span>' : '') + '</li>').join('') + '</ul></div>' +
        '<div><h3>Fremgangsmåte</h3><ol class="steps">' + r.steps.map(x => { const o = L.stepObj(x); return '<li>' + (o.h ? '<b>' + esc(o.h) + '.</b> ' : '') + esc(L.stepText(o, r, d.portions)) + (o.m ? ' <span class="chip">' + o.m + ' min</span>' : '') + '</li>'; }).join('') + '</ol></div>' +
        (r.src ? '<p class="src">Kilde: <a href="' + esc(r.src) + '" target="_blank" rel="noopener">' + esc(r.srcName || 'oppskriften') + '</a>' + (r.serves && r.serves !== 2.5 ? ', omregnet fra ' + r.serves + ' porsjoner' : '') + '.' + (r.note ? ' ' + esc(r.note) : '') + '</p>' : '') +
        '<div class="daybtns"><button class="btn" type="button" data-swap="' + esc(d.key) + '">Bytt middag</button>' +
        (d.swapped && w.recipes[d.original] ? '<button class="ghost" type="button" data-unswap="' + esc(d.key) + '">Tilbake til opprinnelig</button>' : '') +
        '<button class="ghost" type="button" data-rmday="' + esc(d.key) + '" data-planned="' + (d.planned ? 1 : 0) + '">Fjern dagen</button></div>' +
        '</div></details>';
    });
    const addable = L.addableDays(S.plan, w.st);
    if (addable.length) dh += '<div class="adddays"><h3>Legg til middag</h3><div class="daybtns">' + addable.map(a => '<button class="ghost" type="button" data-addday="' + a.key + '">' + (a.restore ? 'Ta tilbake ' : '+ ') + esc(a.label.toLowerCase()) + '</button>').join('') + '</div></div>';
    const fl = L.freezeHints(w.days, S.cat).concat(L.leftoverHints(w.items, w.st));
    if (fl.length) dh += '<div class="freeze"><h2>Frys og rester</h2><ul>' + fl.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>';
    const open = new Set([...document.querySelectorAll('details.day')].filter(d => d.open).map(d => d.id));
    const had = document.querySelectorAll('details.day').length > 0;
    $('days').innerHTML = dh;
    if (had) document.querySelectorAll('details.day').forEach(d => { d.open = open.has(d.id); });
  }

  // ---------- Render: swap/add sheet ----------
  function renderSheet(w) {
    if (!S.sheet) { $('sheet').classList.add('hidden'); return; }
    let days = w.days.slice(), idx = days.findIndex(d => d.key === S.sheet.key);
    if (S.sheet.add) {
      if (idx < 0) {
        days.push({ key: S.sheet.key, label: S.sheet.label, date: S.sheet.date, r: null, rid: null, planned: S.sheet.planned });
        days.sort((a, b) => L.DAYS.findIndex(x => x[0] === a.key) - L.DAYS.findIndex(x => x[0] === b.key));
        idx = days.findIndex(d => d.key === S.sheet.key);
      }
    } else if (idx < 0) { S.sheet = null; $('sheet').classList.add('hidden'); return; }
    const d = days[idx];
    $('sheet').classList.remove('hidden');
    $('sheetTitle').textContent = (S.sheet.add ? 'Middag ' : 'Bytt ') + (d.label || '').toLowerCase();
    const ranked = L.rankSwaps(days, idx, w.recipes, S.cat, S.plan.offers).filter(x => x.r.id !== d.rid);
    const card = (x, best) => '<button type="button" class="rcard' + (best ? ' best' : '') + '" data-pick="' + esc(x.r.id) + '"><span class="rn">' + esc(x.r.name) + '</span>' +
      '<span class="rm"><span class="chip">' + x.r.minutes + ' min</span>' + x.r.tags.slice(0, 3).map(tg => '<span class="chip">' + esc(TAGNAME[tg] || tg) + '</span>').join('') +
      '<span class="delta">' + (x.delta > 0 ? '+' : '') + x.delta + ' kr</span></span>' +
      ((x.uses.length || x.conflicts.length || x.inWeek) ? '<span class="rm">' + (x.uses.length ? '<span class="chip good">bruker opp: ' + esc(x.uses.slice(0, 4).join(', ').toLowerCase()) + '</span>' : '') +
        x.conflicts.map(c => '<span class="chip warn">' + esc(c) + '</span>').join('') + (x.inWeek ? '<span class="chip warn">står allerede på uka</span>' : '') + '</span>' : '') + '</button>';
    let h = '';
    const best = ranked.filter(x => !x.conflicts.length && !x.inWeek).slice(0, 3);
    if (best.length && S.filter === 'alle' && !S.q) h += '<h3>Forslag som bruker opp ukas råvarer</h3><div class="rlist">' + best.map(x => card(x, true)).join('') + '</div>';
    h += '<h3>Bibliotek (' + Object.keys(w.recipes).length + ' oppskrifter)</h3><input type="search" id="rq" placeholder="Søk i oppskrifter" value="' + esc(S.q) + '">' +
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

  // ---------- Render: overview / budget ----------
  function renderOverview(w) {
    const mon = L.weekMonday(S.plan) || todayISO();
    const ym = S.month || mon.slice(0, 7);
    const checked = w.items.filter(i => w.st.checks[i.id] && !L.isHave(i, w.st)).map(i => ({ n: i.name, q: i.qtyText }))
      .concat(w.st.extras.filter(x => x.checked && !x.have).map(x => ({ n: x.name, q: (x.n || 1) + '' })));
    const current = { id: S.plan.weekId, label: S.plan.weekLabel, date: mon, estimate: w.total.total };
    const H = L.withReceipts(S.hist, Object.values(S.receipts)); // ukas faktiske sum = summen av ukas kvitteringer
    const sum = L.monthSummary(H, ym, current);
    const hw = H.weeks[S.plan.weekId] || {};
    const [y, m] = ym.split('-').map(Number);
    const pct = sum.budget ? Math.min(100, 100 * (sum.spent + sum.planned) / sum.budget) : 0;
    const spentPct = sum.budget ? Math.min(100, 100 * sum.spent / sum.budget) : 0;
    let h = '<div class="ov">';
    h += '<div class="monthnav"><button class="ghost sm" type="button" data-month="-1" aria-label="Forrige måned">‹</button><h2>' + MONTHS[m - 1] + ' ' + y + '</h2><button class="ghost sm" type="button" data-month="1" aria-label="Neste måned">›</button></div>';
    h += '<div class="bignum"><span>Brukt</span><b>' + kr(sum.spent) + '</b>' + (sum.budget ? '<span>av ' + kr(sum.budget) + '</span>' : '') + '</div>';
    if (sum.budget) {
      h += '<div class="budgetbar" role="img" aria-label="Brukt ' + Math.round(spentPct) + ' prosent av budsjettet"><i class="spent" style="width:' + spentPct + '%"></i><i class="plan" style="width:' + Math.max(0, pct - spentPct) + '%"></i></div>';
      h += '<p class="small">' + (sum.planned ? 'Planlagt, ikke handlet ennå: ca. ' + kr(sum.planned) + '. ' : '') + (sum.left >= 0 ? 'Igjen: ca. ' + kr(sum.left) : '<span class="over">Over budsjett med ca. ' + kr(-sum.left) + '</span>') + '</p>';
    }
    h += '<form class="row budgetform" id="budgetForm"><label for="budgetInput">Budsjett per måned</label><input id="budgetInput" inputmode="numeric" placeholder="f.eks. 5000" value="' + (sum.budget || '') + '"><button class="ghost" type="submit">Lagre</button></form>';
    if (ym === mon.slice(0, 7)) {
      h += '<div class="thisweek"><h3>' + esc(S.plan.weekLabel || 'Denne uka') + '</h3><div class="pair"><span>Anslått</span><b>ca. ' + kr(w.total.total) + '</b></div>' +
        (hw.fromReceipts ? '<div class="pair"><span>Faktisk (' + hw.rcount + (hw.rcount === 1 ? ' handletur' : ' handleturer') + ')</span><b>' + kr(hw.actual) + '</b></div>' :
        '<form class="row" id="actualForm"><label for="actualInput" class="lbl">Hva ble totalen på kvitteringen?</label><input id="actualInput" inputmode="decimal" placeholder="kr" value="' + (typeof hw.actual === 'number' ? hw.actual : '') + '"><button class="btn" type="submit">Lagre</button></form>' +
        '<p class="small">Skanner du kvitteringene, regnes summen ut av seg selv.</p>') + receiptBox() + '</div>';
    }
    h += '<h3>Uker i ' + MONTHS[m - 1] + '</h3>';
    if (!sum.weeks.length) h += '<p class="note">Ingen uker registrert denne måneden.</p>';
    sum.weeks.forEach(wk => {
      const has = typeof wk.actual === 'number';
      const rs = L.receiptsForWeek(Object.values(S.receipts), wk.id), isCur = wk.id === S.plan.weekId && ym === mon.slice(0, 7);
      h += '<details class="wk" id="wk-' + esc(wk.id) + '"><summary><span>' + esc(wk.label || wk.id) + '</span><span class="wkn">' + (has ? kr(wk.actual) : 'ca. ' + kr(wk.estimate || 0) + ' <small>anslag</small>') + '</span></summary>' +
        (has && wk.estimate ? '<p class="small">Anslått: ca. ' + kr(wk.estimate) + ' · forskjell ' + (wk.actual - wk.estimate > 0 ? '+' : '') + kr(wk.actual - wk.estimate) + '</p>' : '') +
        (wk.fromReceipts ? '<p class="small">Summen er fra ' + wk.rcount + (wk.rcount === 1 ? ' kvittering' : ' kvitteringer') + (wk.rall > wk.rcount ? ' (' + (wk.rall - wk.rcount) + ' tatt ut av summen)' : '') + '.</p>' : '') +
        (rs.length ? (isCur ? '<p class="small">Kvitteringene står under ' + esc(S.plan.weekLabel) + ' over.</p>' : receiptCards(rs, wk.id)) :
        ((wk.items || []).length ? '<ul class="bought">' + wk.items.map(i => '<li>' + esc(i.n) + (i.q ? ' <small>' + esc(i.q) + '</small>' : '') + '</li>').join('') + '</ul>' : '<p class="small">Ingen kjøpsliste lagret.</p>')) + '</details>';
    });
    h += trendBox();
    h += '</div>';
    const focus = document.activeElement && document.activeElement.id;
    if (focus === 'actualInput' || focus === 'budgetInput') return;
    if (focus === 'mapq') { const box = $('mapres'); if (box) box.innerHTML = mapResults(); return; } // ikke tegn på nytt mens noen skriver
    const openIds = new Set([...$('overview').querySelectorAll('details[id]')].filter(d => d.open).map(d => d.id));
    $('overview').innerHTML = h;
    openIds.forEach(id => { const d = document.getElementById(id); if (d) d.open = true; });
    S._checkedSnapshot = checked;
    S._estimate = w.total.total; S._monday = mon;
  }

  // ---------- Render: kvitteringer og priser ----------
  const kr2 = n => (Math.round(n * 100) / 100).toLocaleString('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kr';
  const dShort = iso => { if (!iso) return ''; const [, mo, da] = iso.split('-').map(Number); return da + '. ' + MONTHS[mo - 1].slice(0, 3); };
  function receiptBox() {
    let h = '<div class="rcpt"><h3>Kvitteringer</h3>';
    const dis = S.upBusy ? ' disabled' : '';
    h += S.upBusy ? '<p class="note">Laster opp …</p>' : '<div class="scanrow"><label class="btn scan"><input type="file" id="scanInput" accept="image/*" capture="environment" hidden' + dis + '>Ta bilde</label>' +
      '<label class="ghost scan"><input type="file" id="fileInput" accept="image/*,application/pdf,.pdf" hidden' + dis + '>Last opp bilde eller PDF</label></div>';
    h += '<p class="small">Én kvittering per handletur. Digitale kvitteringer fra Trumf kan lastes opp som skjermbilde eller PDF. Uka finnes ut fra datoen på kvitteringen, så du kan også legge inn kvitteringer fra tidligere uker.</p>';
    if (S.pending && !S.receipts[S.pending.id]) h += '<p class="note">Kvitteringen leses nå. Det tar vanligvis under ett minutt.</p>';
    const fresh = Object.values(S.receipts).filter(r => r.error && L.receiptWeek(r) === S.plan.weekId);
    fresh.forEach(r => { h += '<div class="note"><b>Kunne ikke lese en kvittering.</b> ' + esc(r.error) + (r.retry ? ' Den prøves igjen automatisk ved neste opplasting.' : ' Prøv et nytt bilde.') + '</div>'; });
    const mine = L.receiptsForWeek(Object.values(S.receipts), S.plan.weekId).filter(r => !r.error);
    const other = S.lastOther && S.receipts[S.lastOther] && L.receiptWeek(S.receipts[S.lastOther]) !== S.plan.weekId ? S.receipts[S.lastOther] : null;
    if (other) h += '<p class="note">Siste kvittering (' + esc(dShort(other.date)) + ') hører til ' + esc('uke ' + Number(L.receiptWeek(other).slice(6))) + ' og ligger under den uka i oversikten.</p>';
    return h + receiptCards(mine, S.plan.weekId) + '</div>';
  }
  function receiptCards(list, weekId) {
    const hw = ((S.hist && S.hist.weeks) || {})[weekId] || {};
    const skip = new Set(hw.skip || []);
    let h = '';
    list.filter(r => !r.error).forEach(r => {
      const lines = r.lines || [];
      const linked = lines.filter(l => l.pid).length;
      const off = typeof r.sumCheck === 'number' && typeof r.total === 'number' && Math.abs(r.sumCheck - r.total) > 1;
      const out = skip.has(r.id);
      h += '<details class="rc' + (out ? ' out' : '') + '" id="rc-' + esc(r.id) + '"' + (S.edit && S.edit.rid === r.id ? ' open' : '') + '><summary><span>' + esc(r.store || 'Kvittering') + (r.date ? ' · ' + dShort(r.date) : '') + '</span><b>' + kr2(r.total || 0) + '</b></summary>';
      h += '<div class="rm">' + '<span class="chip">' + lines.length + ' linjer</span><span class="chip' + (linked < lines.length ? '' : ' good') + '">' + linked + ' koblet til varer</span>' +
        (out ? '<span class="chip warn">ikke med i summen</span>' : '') + (S.mapWait[r.id] ? '<span class="chip">oppdateres …</span>' : '') + (off ? '<span class="chip warn">linjene gir ' + kr2(r.sumCheck) + ' – sjekk</span>' : '') + '</div>';
      h += '<button class="ghost" type="button" data-skip="' + esc(r.id) + '" data-week="' + esc(weekId) + '" data-v="' + (out ? 0 : 1) + '">' + (out ? 'Ta med i ukas sum' : 'Ikke med i ukas sum') + '</button>';
      h += '<ul class="rlines">' + lines.map((l, i) => {
        const p = l.pid && S.cat.byId[l.pid];
        const editing = S.edit && S.edit.rid === r.id && S.edit.i === i;
        return '<li><div class="rl"><span class="rt">' + esc(l.text) + '</span><span class="rp">' + kr2(l.lineTotal - (l.discount || 0)) + (l.discount ? '<small>' + kr2(l.lineTotal) + ' − ' + kr2(l.discount) + '</small>' : '') + '</span></div>' +
          '<button type="button" class="rmap' + (p ? '' : ' none') + '" data-editline="' + esc(r.id) + '" data-i="' + i + '">' + (p ? esc(p.n) + (l.unit ? ' · ' + kr2(l.unit) + '/pk' : '') : 'ikke koblet – trykk for å velge vare') + '</button>' +
          (editing ? '<div class="mapbox"><input type="search" id="mapq" placeholder="Søk i varekatalogen" value="' + esc(S.edit.q || '') + '" autocomplete="off"><div id="mapres">' + mapResults() + '</div></div>' : '') + '</li>';
      }).join('') + '</ul></details>';
    });
    return h;
  }
  function mapResults() {
    if (!S.edit) return '';
    const hits = S.edit.q ? L.searchCatalog(S.cat, S.edit.q, 8) : [];
    return '<div class="maplist">' + hits.map(p => '<button type="button" data-mappick="' + esc(p.id) + '">' + esc(p.n) + ' <small>' + esc(p.s) + '</small></button>').join('') +
      '<button type="button" data-mappick="">Ikke en vare i katalogen (pant, pose o.l.)</button><button type="button" class="ghost" data-mapcancel>Avbryt</button></div>';
  }
  function spark(points) {
    if (points.length < 2) return '';
    const v = points.map(o => o.unit), lo = Math.min(...v), hi = Math.max(...v), W = 90, H = 24;
    const xy = v.map((y, i) => (i * W / (v.length - 1)).toFixed(1) + ',' + (hi === lo ? H / 2 : H - 2 - (y - lo) * (H - 4) / (hi - lo)).toFixed(1));
    return '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><polyline points="' + xy.join(' ') + '" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  }
  /** Større prisgraf: x etter dato, y fra laveste til høyeste pris. v = ordinær pris, w = betalt (ev. rabattert). */
  function bigChart(pts, unitLabel) {
    const W = 320, H = 150, L0 = 38, R0 = 12, T0 = 14, B0 = 26;
    const ts = pts.map(p => Date.parse(p.d + 'T12:00:00Z')), t0 = Math.min(...ts), t1 = Math.max(...ts);
    const vals = pts.flatMap(p => [p.v, p.w]).filter(x => typeof x === 'number'), lo0 = Math.min(...vals), hi0 = Math.max(...vals);
    const pad = (hi0 - lo0) * 0.15 || hi0 * 0.1 || 1, lo = Math.max(0, lo0 - pad), hi = hi0 + pad;
    const X = t => L0 + (t1 === t0 ? (W - L0 - R0) / 2 : (t - t0) * (W - L0 - R0) / (t1 - t0));
    const Y = v => T0 + (hi - v) * (H - T0 - B0) / (hi - lo);
    const line = key => pts.map((p, i) => X(ts[i]).toFixed(1) + ',' + Y(p[key]).toFixed(1)).join(' ');
    const lab = (i, key, dy) => '<text x="' + X(ts[i]).toFixed(1) + '" y="' + (Y(pts[i][key]) + dy).toFixed(1) + '" text-anchor="' + (i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle') + '" class="cl">' + String(pts[i][key].toFixed(2)).replace('.', ',') + '</text>';
    const disc = pts.some(p => p.w < p.v - 0.005);
    return '<svg class="bigc" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Prisutvikling, ' + esc(unitLabel) + '">' +
      '<line x1="' + L0 + '" y1="' + (H - B0) + '" x2="' + (W - R0) + '" y2="' + (H - B0) + '" class="ax"/>' +
      '<text x="' + (L0 - 4) + '" y="' + (Y(hi0) + 3).toFixed(1) + '" text-anchor="end" class="cl">' + String(hi0.toFixed(0)) + '</text><text x="' + (L0 - 4) + '" y="' + (Y(lo0) + 3).toFixed(1) + '" text-anchor="end" class="cl">' + String(lo0.toFixed(0)) + '</text>' +
      (disc ? '<polyline points="' + line('w') + '" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3" opacity=".55"/>' : '') +
      '<polyline points="' + line('v') + '" fill="none" stroke="currentColor" stroke-width="2"/>' +
      pts.map((p, i) => '<circle cx="' + X(ts[i]).toFixed(1) + '" cy="' + Y(p.v).toFixed(1) + '" r="3.2" fill="currentColor"/>').join('') +
      lab(0, 'v', -7) + (pts.length > 1 ? lab(pts.length - 1, 'v', -7) : '') +
      '<text x="' + L0 + '" y="' + (H - 8) + '" text-anchor="start" class="cl">' + dShort(pts[0].d) + '</text><text x="' + (W - R0) + '" y="' + (H - 8) + '" text-anchor="end" class="cl">' + dShort(pts[pts.length - 1].d) + '</text></svg>' +
      '<p class="small">Heltrukket: ordinær pris (' + esc(unitLabel) + ')' + (disc ? '. Stiplet: det dere faktisk betalte etter rabatt.' : '.') + '</p>';
  }
  function trendBox() {
    const gs = L.productGroups(S.prices, S.cat);
    if (!gs.length) return '';
    const np = gs.reduce((n, g) => n + g.products.length, 0);
    let h = '<details class="wk trends" id="trends"><summary><span>Faktiske priser</span><span class="wkn">' + gs.length + ' grupper · ' + np + ' produkter</span></summary>';
    h += '<p class="small">Gruppert under overkategori. Prisen på gruppen er per katalogpakning (median av de siste kjøpene) og brukes i anslagene. Under ligger hvert produkt med sin egen pris per stk eller kg.</p><ul class="trend">';
    const chg = (c, n, d, d2) => n > 1 && d !== d2 ? '<span class="chip' + (c > 0 ? ' warn' : c < 0 ? ' good' : '') + '">' + (c > 0 ? '+' : '') + String(c).replace('.', ',') + ' % siden ' + dShort(d) + '</span>' : '';
    gs.forEach(g => {
      const t = g.trend;
      h += '<li><details class="pg" id="pg-' + esc(g.key) + '"><summary><div class="rl"><span class="rt"><b>' + esc(g.name) + '</b></span><span class="rp">' + (t ? kr2(t.p.pr) + '<small>per pakning</small>' : '<small>' + g.products.length + ' produkt' + (g.products.length > 1 ? 'er' : '') + '</small>') + '</span></div>' +
        (t ? '<div class="rm">' + (t.first.d !== t.last.d ? spark(t.points) : '') + '<span class="chip">' + t.n + ' kjøp</span>' + chg(t.change, t.n, t.first.d, t.last.d) + (t.est ? '<span class="chip">anslag var ' + kr(t.est) + '</span>' : '') + '</div>' : '') + '</summary>';
      h += '<ul class="prods">' + g.products.map(p => {
        const dates = new Set(p.points.map(x => x.d)).size;
        const row = '<div class="rl"><span class="rt">' + esc(p.n) + '</span><span class="rp">' + kr2(p.last.p) + (p.unit === 'kg' ? '/kg' : '') +
          (p.last.o > p.last.p ? '<small>ordinær ' + kr2(p.last.o) + '</small>' : '') + '</span></div><div class="rm">' + (dates > 1 ? spark(p.points.map(x => ({ unit: x.o }))) : '') + '<span class="chip">' + p.count + ' kjøp</span>' + chg(p.change, p.count, p.first.d, p.last.d) + '</div>';
        return '<li><details class="pc" id="pc-' + esc(p.key) + '"><summary>' + row + '</summary>' +
          (dates > 1 ? bigChart(p.points.map(x => ({ d: x.d, v: x.o, w: x.p })), p.unit === 'kg' ? 'kr/kg' : 'kr/stk') : '<p class="small">Grafen kommer når produktet er kjøpt på to ulike dager.</p>') + '</details></li>';
      }).join('') +
        (g.products.length ? '' : '<li class="small">Ingen produktdetaljer ennå.</li>') + '</ul></details></li>';
    });
    return h + '</ul></details>';
  }

  function render() {
    $('me').textContent = ME ? 'Du er ' + ME : '';
    ['oversikt', 'liste', 'middager'].forEach(v => { $('tab-' + v).setAttribute('aria-selected', S.view === v); $('view-' + v).classList.toggle('hidden', S.view !== v); });
    const p = S.plan;
    if (p) { $('kicker').textContent = (p.weekLabel || '') + (p.dates ? ' · ' + p.dates : '') + ' · Kiwi'; $('title').textContent = p.title || 'Ukas middager'; }
    const w = week();
    if (!w) { $('sections').innerHTML = ''; $('days').innerHTML = ''; $('sum').innerHTML = ''; $('haveBox').innerHTML = ''; $('overview').innerHTML = ''; $('count').textContent = '–'; return; }
    renderList(w); renderDays(w); renderSheet(w); renderOverview(w); if (C.key) renderCook();
  }

  // ---------- Autocomplete ----------
  let suggIdx = -1, suggItems = [];
  function renderSugg() {
    const q = $('addInput').value.trim();
    if (!q || !S.cat) { $('sugg').classList.add('hidden'); $('addInput').setAttribute('aria-expanded', 'false'); suggItems = []; return; }
    const hits = L.searchCatalog(S.cat, q, 6);
    suggItems = hits.map(p => ({ p, name: p.n, s: p.s }));
    // konkrete produkter dere har kjøpt før, med sist betalte pris
    L.searchProducts(S.prices, S.cat, q, 4).forEach(v => {
      const c = v.pid && S.cat.byId[v.pid];
      suggItems.push({ v, p: c || null, name: v.n, s: v.section || L.guessSection(S.cat, v.cat || v.n), vp: v.unit === 'stk' ? v.last.p : null });
    });
    if (!suggItems.some(x => L.norm(x.name) === L.norm(q))) suggItems.push({ p: null, name: q, s: L.guessSection(S.cat, q) });
    if (suggIdx >= suggItems.length) suggIdx = -1;
    $('sugg').innerHTML = suggItems.map((x, i) => '<li><button type="button" role="option" data-sugg="' + i + '" class="' + (i === suggIdx ? 'act' : '') + (x.v ? ' prod' : '') + '"><span>' + (x.v ? esc(x.name) : x.p ? esc(x.name) : 'Legg til «' + esc(x.name) + '»') + '</span><small>' +
      (x.v ? 'kjøpt ' + x.v.count + ' gang' + (x.v.count > 1 ? 'er' : '') + ' · ' + kr2(x.v.last.p) + (x.v.unit === 'kg' ? '/kg' : '') + (x.p ? ' · under ' + esc(x.p.n) : '') : esc(x.s) + (x.p && x.p.pr && !x.p.pantry ? ' · ' + kr(x.p.pr) : '')) + '</small></button></li>').join('');
    $('sugg').classList.remove('hidden'); $('addInput').setAttribute('aria-expanded', 'true');
  }
  function addSugg(x) {
    if (!x || !S.plan) return;
    const item = { id: 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), p: x.p ? x.p.id : null, name: x.v ? x.name : x.p ? x.p.n : x.name, s: x.s, n: 1, checked: false, addedBy: ME };
    if (x.v) { item.v = x.v.key; if (typeof x.vp === 'number') item.vp = x.vp; }
    enqueue({ t: 'add', x: item });
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
  $('addForm').addEventListener('submit', e => { e.preventDefault(); if (!$('addInput').value.trim()) return; if (!suggItems.length) renderSugg(); addSugg(suggItems[suggIdx >= 0 ? suggIdx : 0]); });

  // ---------- Events ----------
  ['oversikt', 'liste', 'middager'].forEach(v => $('tab-' + v).addEventListener('click', () => { S.view = v; ls.set('view', v); render(); window.scrollTo(0, 0); }));
  $('hideDone').checked = S.hideDone;
  $('hideDone').addEventListener('change', e => { S.hideDone = e.target.checked; ls.set('hideDone', S.hideDone ? '1' : '0'); render(); });
  function listClick(e) {
    const t = e.target.closest('[data-item],[data-extra],[data-qty],[data-xqty],[data-have],[data-restore]'); if (!t || !S.plan) return;
    const w = week(); if (!w) return; const st = w.st;
    if (t.dataset.qty) { const it = w.items.find(i => i.id === t.dataset.qty); if (!it) return; const n = it.packs + Number(t.dataset.d); enqueue({ t: 'qty', id: it.id, n: n === it.auto ? null : Math.max(0, n) }); }
    else if (t.dataset.xqty) { const x = st.extras.find(x => x.id === t.dataset.xqty); if (x) enqueue({ t: 'xqty', id: x.id, n: (x.n || 1) + Number(t.dataset.d) }); }
    else if (t.dataset.have) enqueue({ t: 'have', id: t.dataset.have, v: true });
    else if (t.dataset.restore) { if (t.dataset.kind === 'item') { enqueue({ t: 'have', id: t.dataset.restore, v: false }); enqueue({ t: 'qty', id: t.dataset.restore, n: null }); } else enqueue({ t: 'xhave', id: t.dataset.restore, v: false }); }
    else if (t.dataset.item) enqueue({ t: 'check', id: t.dataset.item, v: !st.checks[t.dataset.item] });
    else if (t.dataset.extra) { const x = st.extras.find(x => x.id === t.dataset.extra); if (x) enqueue({ t: 'xcheck', id: x.id, v: !x.checked }); }
  }
  $('sections').addEventListener('click', listClick);
  $('haveBox').addEventListener('click', listClick);
  $('days').addEventListener('click', e => {
    const po = e.target.closest('[data-portions]');
    if (po) { const d = week().days.find(x => x.key === po.dataset.portions); if (d) enqueue({ t: 'portions', day: d.key, n: Math.min(12, Math.max(1, d.portions + Number(po.dataset.d))) }); return; }
    const ck = e.target.closest('[data-cook]'); if (ck) { openCook(ck.dataset.cook); return; }
    const s = e.target.closest('[data-swap]'); if (s) { S.sheet = { key: s.dataset.swap }; S.filter = 'alle'; S.q = ''; render(); $('sheetBody').scrollTop = 0; return; }
    const u = e.target.closest('[data-unswap]'); if (u) { enqueue({ t: 'swap', day: u.dataset.unswap, r: null }); return; }
    const rm = e.target.closest('[data-rmday]'); if (rm) { enqueue({ t: 'rmday', day: rm.dataset.rmday, planned: rm.dataset.planned === '1' }); return; }
    const a = e.target.closest('[data-addday]');
    if (a) {
      const info = L.addableDays(S.plan, viewState()).find(x => x.key === a.dataset.addday); if (!info) return;
      if (info.restore) { enqueue({ t: 'addday', day: info.key, planned: true }); return; }
      S.sheet = { key: info.key, add: true, label: info.label, date: info.date, planned: false }; S.filter = 'alle'; S.q = ''; render(); $('sheetBody').scrollTop = 0;
    }
  });
  $('sheetClose').addEventListener('click', () => { S.sheet = null; render(); });
  $('sheet').addEventListener('click', e => { if (e.target === $('sheet')) { S.sheet = null; render(); } });
  $('sheetBody').addEventListener('click', e => {
    const f = e.target.closest('[data-filter]'); if (f) { S.filter = f.dataset.filter; render(); return; }
    const p = e.target.closest('[data-pick]');
    if (p) {
      const sh = S.sheet; S.sheet = null;
      if (sh.add) enqueue({ t: 'addday', day: sh.key, label: sh.label, date: sh.date, r: p.dataset.pick, planned: false });
      else { const orig = S.plan.days.find(d => d.key === sh.key); enqueue({ t: 'swap', day: sh.key, r: orig && orig.recipe === p.dataset.pick ? null : p.dataset.pick }); }
    }
  });
  $('sheetBody').addEventListener('input', e => { if (e.target.id === 'rq') { S.q = e.target.value; render(); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.sheet) { S.sheet = null; render(); } });
  $('overview').addEventListener('click', e => {
    const sk = e.target.closest('[data-skip]');
    if (sk) { const r = S.receipts[sk.dataset.skip]; const iw = r && r.date ? L.isoWeek(r.date) : null;
      histOp({ t: 'skip', weekId: sk.dataset.week, id: sk.dataset.skip, v: sk.dataset.v === '1', label: iw ? iw.label : undefined, date: iw ? iw.monday : undefined }); return; }
    const ed = e.target.closest('[data-editline]');
    if (ed) { const same = S.edit && S.edit.rid === ed.dataset.editline && S.edit.i === +ed.dataset.i; S.edit = same ? null : { rid: ed.dataset.editline, i: +ed.dataset.i, q: '' }; render(); if (S.edit) { const q = $('mapq'); if (q) q.focus(); } return; }
    if (e.target.closest('[data-mapcancel]')) { S.edit = null; render(); return; }
    const mp = e.target.closest('[data-mappick]');
    if (mp && S.edit) { const r = S.receipts[S.edit.rid]; const l = r && r.lines[S.edit.i]; S.edit = null; if (l) saveMapping(r.id, l.text, mp.dataset.mappick); render(); return; }
    const m = e.target.closest('[data-month]'); if (!m) return;
    const base = S.month || (L.weekMonday(S.plan) || todayISO()).slice(0, 7);
    let [y, mo] = base.split('-').map(Number); mo += Number(m.dataset.month);
    if (mo < 1) { mo = 12; y--; } if (mo > 12) { mo = 1; y++; }
    S.month = y + '-' + String(mo).padStart(2, '0'); render();
  });
  $('overview').addEventListener('input', e => { if (e.target.id === 'mapq' && S.edit) { S.edit.q = e.target.value; const box = $('mapres'); if (box) box.innerHTML = mapResults(); } });
  $('overview').addEventListener('change', e => { if ((e.target.id === 'scanInput' || e.target.id === 'fileInput') && e.target.files && e.target.files[0]) uploadReceipt(e.target.files[0]); });

  // ---------- Kvittering: last opp, koble, bruk totalen ----------
  async function shrink(file) {
    let src;
    try { src = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
    catch (e) { src = await new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = URL.createObjectURL(file); }); }
    const w = src.width, h = src.height, s = Math.min(1, 1400 / Math.min(w, h), 7000 / Math.max(w, h));
    const c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(h * s);
    c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
    const blob = await new Promise(ok => c.toBlob(ok, 'image/jpeg', 0.82));
    return new Promise(ok => { const fr = new FileReader(); fr.onload = () => ok(String(fr.result).split(',')[1]); fr.readAsDataURL(blob); });
  }
  async function uploadReceipt(file) {
    if (S.upBusy || !S.plan) return;
    S.upBusy = true; render(); setSync('laster opp kvittering …');
    try {
      const pdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '');
      if (pdf && file.size > 15e6) throw { msg: 'PDF-en er for stor' };
      const b64 = pdf ? await new Promise(ok => { const fr = new FileReader(); fr.onload = () => ok(String(fr.result).split(',')[1]); fr.readAsDataURL(file); }) : await shrink(file);
      const id = S.plan.weekId + '-' + Date.now().toString(36);
      const r = await gh('receipts/' + id + (pdf ? '.pdf' : '.jpg'), { method: 'PUT', body: JSON.stringify({ message: 'Kvittering fra ' + (ME || 'appen'), content: b64 }) });
      if (r.status === 401 || r.status === 403) throw { auth: true };
      if (!r.ok) throw { status: r.status };
      S.pending = { id, at: Date.now() }; ls.set('pendingReceipt', JSON.stringify(S.pending)); setSync('kvittering lastet opp');
    } catch (e) { setSync(e && e.auth ? 'nøkkel avvist' : (e && e.msg) || 'opplasting feilet – prøv igjen', true); }
    finally { S.upBusy = false; render(); }
  }
  async function saveMapping(rid, text, pid) {
    if (S.mapBusy) return; S.mapBusy = true; setSync('lagrer kobling …');
    try {
      for (let attempt = 0; attempt < 4; attempt++) {
        const f = await readFile('receiptmap.json');
        const map = Object.assign({}, f.data || {}); map[L.receiptKey(text)] = pid || '';
        const w = await writeFile('receiptmap.json', map, f.sha, 'Kvittering: kobling');
        if (w.ok) { S.mapWait[rid] = true; setSync('lagret – kvitteringen oppdateres'); return; }
      }
      setSync('ikke lagret', true);
    } catch (e) { setSync(e && e.auth ? 'nøkkel avvist' : 'frakoblet', true); }
    finally { S.mapBusy = false; render(); }
  }

  $('overview').addEventListener('submit', async e => {
    e.preventDefault();
    if (e.target.id === 'budgetForm') { const v = parseFloat(($('budgetInput').value || '').replace(/\s/g, '').replace(',', '.')); $('budgetInput').blur(); await histOp({ t: 'budget', v: isNaN(v) ? 0 : v }); }
    if (e.target.id === 'actualForm') {
      const raw = ($('actualInput').value || '').replace(/\s/g, '').replace(',', '.'); const v = raw === '' ? null : parseFloat(raw);
      if (raw !== '' && isNaN(v)) return;
      $('actualInput').blur();
      await histOp({ t: 'actual', weekId: S.plan.weekId, label: S.plan.weekLabel, date: S._monday, estimate: S._estimate, v, items: S._checkedSnapshot, by: ME, at: new Date().toISOString() });
    }
  });
  $('shareBtn').addEventListener('click', async () => {
    const link = location.origin + location.pathname + '#k=' + encodeURIComponent(KEY);
    try { await navigator.clipboard.writeText(link); $('shareBtn').textContent = 'Lenke kopiert – send den til den andre'; }
    catch (e) { $('shareBtn').textContent = 'Kunne ikke kopiere'; }
    setTimeout(() => { $('shareBtn').textContent = 'Kopier delingslenke'; }, 4000);
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
  window.addEventListener('online', () => { flush(); poll(); });


  // ---------- Matlagingsmodus ----------
  const C = { key: null, i: 0, timers: {}, tick: null, wake: null, audio: null };
  function cookData() {
    const w = week(); if (!w) return null;
    const d = w.days.find(x => x.key === C.key); if (!d || !d.r) return null;
    const steps = [{ h: 'Finn fram', t: null, m: null, ing: true }].concat(d.r.steps.map(L.stepObj));
    return { d, r: d.r, steps };
  }
  function fmtClock(ms) { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function renderCook() {
    const el = $('cook');
    const cd = C.key && cookData();
    if (!cd) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    const { d, r, steps } = cd; C.i = Math.min(C.i, steps.length - 1);
    const st = steps[C.i], tid = C.key + ':' + C.i, t = C.timers[tid];
    let body = '<h2 class="ch">' + esc(st.h || ('Steg ' + C.i)) + '</h2>';
    if (st.ing) body += '<p class="cport">' + L.fmtNum(d.portions) + ' porsjoner</p><ul class="cing">' + r.ing.map(x => '<li>' + esc(L.ingText(x, d.portions)) + '</li>').join('') + '</ul>';
    else body += '<p class="ct">' + esc(L.stepText(st, r, d.portions)) + '</p>';
    let timer = '';
    if (st.m) {
      const left = t ? (t.paused ? t.left : t.end - Date.now()) : st.m * 60000;
      const done = t && !t.paused && left <= 0;
      timer = '<div class="ctimer' + (done ? ' done' : '') + '"><div class="cclock" id="cclock">' + (t ? (done ? 'Ferdig!' : fmtClock(left)) : st.m + 'm') + '</div>' +
        '<div class="cbtns"><button type="button" class="cplay" data-timer="' + (t && !t.paused && !done ? 'pause' : 'start') + '" aria-label="' + (t && !t.paused && !done ? 'Pause' : 'Start nedtelling') + '">' +
        (t && !t.paused && !done ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>') + '</button>' +
        (t ? '<button type="button" class="ghost" data-timer="reset">Nullstill</button>' : '') + '</div></div>';
    }
    const running = Object.entries(C.timers).filter(([k, v]) => k !== tid && k.startsWith(C.key + ':') && !v.paused).map(([k, v]) => {
      const i = Number(k.split(':')[1]); const left = v.end - Date.now();
      return '<button type="button" class="chip run' + (left <= 0 ? ' done' : '') + '" data-goto="' + i + '">' + esc(steps[i].h) + ' ' + (left <= 0 ? 'ferdig' : fmtClock(left)) + '</button>';
    }).join('');
    el.innerHTML = '<div class="ctop"><span class="cname">' + esc(r.name) + '</span><button type="button" class="cx" data-cookclose aria-label="Lukk matlagingen">×</button></div>' +
      '<div class="cprog">' + steps.map((x, i) => '<i class="' + (i <= C.i ? 'on' : '') + '"></i>').join('') + '</div>' +
      (running ? '<div class="crun">' + running + '</div>' : '') +
      '<div class="cbody">' + body + timer + '</div>' +
      '<div class="cnav"><button type="button" class="cnb" data-nav="-1" ' + (C.i === 0 ? 'disabled' : '') + ' aria-label="Forrige steg">‹</button><span>' + (C.i + 1) + ' av ' + steps.length + '</span><button type="button" class="cnb" data-nav="1" ' + (C.i === steps.length - 1 ? 'disabled' : '') + ' aria-label="Neste steg">›</button></div>';
  }
  function beep() {
    try { navigator.vibrate && navigator.vibrate([400, 200, 400, 200, 400]); } catch (e) { }
    try {
      const a = C.audio; if (!a) return;
      [0, 0.5, 1].forEach(o => { const g = a.createGain(), osc = a.createOscillator(); osc.frequency.value = 880; osc.connect(g); g.connect(a.destination);
        g.gain.setValueAtTime(0.0001, a.currentTime + o); g.gain.exponentialRampToValueAtTime(0.4, a.currentTime + o + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + o + 0.35);
        osc.start(a.currentTime + o); osc.stop(a.currentTime + o + 0.4); });
    } catch (e) { }
  }
  function tick() {
    let any = false, rerender = false;
    Object.values(C.timers).forEach(t => { if (t.paused) return; any = true; if (!t.rang && t.end - Date.now() <= 0) { t.rang = true; beep(); rerender = true; } });
    if (rerender || document.querySelector('.crun')) renderCook();
    else { const c = $('cclock'); const t = C.timers[C.key + ':' + C.i]; if (c && t && !t.paused) c.textContent = t.end - Date.now() <= 0 ? 'Ferdig!' : fmtClock(t.end - Date.now()); }
    if (!any) { clearInterval(C.tick); C.tick = null; }
  }
  async function wakeLock(on) {
    try {
      if (on && navigator.wakeLock && !C.wake) { C.wake = await navigator.wakeLock.request('screen'); C.wake.addEventListener('release', () => { C.wake = null; }); }
      if (!on && C.wake) { await C.wake.release(); C.wake = null; }
    } catch (e) { }
  }
  function openCook(key) { C.key = key; C.i = 0; renderCook(); wakeLock(true); document.body.style.overflow = 'hidden'; }
  function closeCook() { C.key = null; renderCook(); wakeLock(false); document.body.style.overflow = ''; }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && C.key) wakeLock(true); });
  $('cook').addEventListener('click', e => {
    if (e.target.closest('[data-cookclose]')) { closeCook(); return; }
    const n = e.target.closest('[data-nav]'); if (n) { C.i += Number(n.dataset.nav); renderCook(); return; }
    const g = e.target.closest('[data-goto]'); if (g) { C.i = Number(g.dataset.goto); renderCook(); return; }
    const tb = e.target.closest('[data-timer]'); if (!tb) return;
    const cd = cookData(); const st = cd.steps[C.i]; const tid = C.key + ':' + C.i; const t = C.timers[tid];
    if (!C.audio) { try { C.audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } }
    if (C.audio && C.audio.state === 'suspended') C.audio.resume();
    if (tb.dataset.timer === 'reset') delete C.timers[tid];
    else if (tb.dataset.timer === 'pause') C.timers[tid] = { paused: true, left: t.end - Date.now() };
    else { const left = t && t.paused ? t.left : st.m * 60000; C.timers[tid] = { end: Date.now() + left }; if (!C.tick) C.tick = setInterval(tick, 1000); }
    renderCook();
  });
  let tx = null;
  $('cook').addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  $('cook').addEventListener('touchend', e => {
    if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; tx = null;
    const cd = cookData(); if (!cd || Math.abs(dx) < 60) return;
    C.i = Math.max(0, Math.min(cd.steps.length - 1, C.i + (dx < 0 ? 1 : -1))); renderCook();
  });
  document.addEventListener('keydown', e => {
    if (!C.key) return;
    if (e.key === 'Escape') closeCook();
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const cd = cookData(); C.i = Math.max(0, Math.min(cd.steps.length - 1, C.i + (e.key === 'ArrowRight' ? 1 : -1))); renderCook(); }
  });

  // ---------- Boot ----------
  async function loadStatic() {
    try {
      const [c, r] = await Promise.all([fetch('data/catalog.json', { cache: 'no-cache' }).then(x => x.json()), fetch('data/recipes.json', { cache: 'no-cache' }).then(x => x.json())]);
      S.rawCat = c; S.cat = L.indexCatalog(L.applyPrices(c, S.prices)); S.lib = r; render();
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
