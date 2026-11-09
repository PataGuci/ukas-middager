/* Ukas middager – ren logikk uten DOM, så den kan testes med node (tools/test.js). */
(function (root) {
  const DAYS = [['man', 'Mandag'], ['tir', 'Tirsdag'], ['ons', 'Onsdag'], ['tor', 'Torsdag'], ['fre', 'Fredag'], ['lor', 'Lørdag'], ['son', 'Søndag']];
  const DAYNUM = Object.fromEntries(DAYS.map(([k], i) => [k, i]));
  const FRESH_FROM_DAY = 3;   // torsdag og senere: ferskt kjøtt/fisk bør fryses mandag
  const PACK_TOLERANCE = 0.08;
  const BASE_PORTIONS = 2.5;   // oppskriftene i biblioteket er regnet om til 2,5 porsjoner // trenger du bare litt mer enn én pakke (under 8 %), kjøpes én

  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
      .normalize('NFKD').replace(/[̀-ͯ]/g, '').trim();
  }
  function shortName(p) {
    return p.n.replace(/\s*\(.*?\)/g, '').replace(/\s+\d[\d,.]*\s*(g|kg|ml|l|dl|stk|pk)\b.*$/i, '').trim();
  }
  const DURABLE = new Set(['Tørrvarer og hermetikk', 'Krydder', 'Frys']);
  const KEEPS = new Set(['poteter', 'smapoteter', 'sotpotet', 'gullok', 'hvitlok', 'gulrot', 'kalrot', 'sellerirot', 'hodekal']);

  function isoDate(d) { const p = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
  function addDays(iso, n) { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return isoDate(d); }
  function weekMonday(plan) {
    const d0 = (plan.days || []).find(d => d.date);
    if (!d0) return null;
    return addDays(d0.date, -(DAYNUM[d0.key] || 0));
  }

  function indexCatalog(cat) {
    const byId = {};
    cat.products.forEach(p => { byId[p.id] = p; });
    const sections = cat.sections.slice();
    if (!sections.includes('Annet')) sections.push('Annet');
    const search = cat.products.map(p => ({ p, n: norm(p.n), words: norm(p.n).split(/[^a-z0-9]+/).filter(Boolean), k: (p.k || []).map(norm) }));
    return { byId, sections, search, products: cat.products };
  }

  function indexRecipes(lib, plan) {
    const byId = {};
    (lib.recipes || []).forEach(r => { byId[r.id] = r; });
    ((plan && plan.recipes) || []).forEach(r => { byId[r.id] = r; });
    return byId;
  }

  /** The week's days: plan days minus removed, plus added weekend days, with swaps applied. */
  function effectiveDays(plan, st, recipes) {
    st = st || {};
    const swaps = st.swaps || {}, removed = st.removed || {};
    const mon = weekMonday(plan);
    const list = (plan.days || []).filter(d => !removed[d.key]).map(d => Object.assign({}, d, { planned: true }));
    (st.added || []).forEach(a => { if (!list.some(d => d.key === a.key)) list.push(Object.assign({}, a, { planned: false })); });
    list.forEach(d => { if (!d.date && mon) d.date = addDays(mon, DAYNUM[d.key] || 0); if (!d.label) d.label = (DAYS[DAYNUM[d.key]] || [])[1] || d.key; });
    list.sort((a, b) => (DAYNUM[a.key] ?? 9) - (DAYNUM[b.key] ?? 9));
    return list.map(d => {
      const rid = swaps[d.key] || d.recipe;
      const portions = (st.portions || {})[d.key] || BASE_PORTIONS;
      return Object.assign(d, { rid, portions, original: d.recipe, swapped: d.planned && !!swaps[d.key] && swaps[d.key] !== d.recipe, r: recipes[rid] || null });
    });
  }

  /** Days that could be added (missing weekdays/weekend) or restored. */
  function addableDays(plan, st) {
    const present = new Set(effectiveDays(plan, st, {}).map(d => d.key));
    const planned = new Set((plan.days || []).map(d => d.key));
    const mon = weekMonday(plan);
    return DAYS.filter(([k]) => !present.has(k)).map(([k, label]) => ({ key: k, label, date: mon ? addDays(mon, DAYNUM[k]) : null, restore: planned.has(k) }));
  }

  function unitPrice(p, offers) {
    const o = offers && offers[p.id];
    return (o && typeof o.price === 'number') ? o.price : p.pr;
  }

  function fmtAmount(a, u) {
    if (u === 'g' && a >= 1000) return (Math.round(a / 100) / 10).toString().replace('.', ',') + ' kg';
    if (u === 'ml' && a >= 1000) return (Math.round(a / 100) / 10).toString().replace('.', ',') + ' l';
    if (u === 'ml' && a >= 100) return (Math.round(a / 10) / 10).toString().replace('.', ',') + ' dl';
    if ((u === 'g' || u === 'ml') && a >= 20) return Math.round(a / 5) * 5 + ' ' + u;
    const r = a >= 3 ? Math.round(a) : Math.round(a * 10) / 10;
    return String(r).replace('.', ',') + ' ' + u;
  }
  function isLoose(p) { return p.sz === 1; }
  function unitWord(p, n) { return isLoose(p) ? (p.u === 'stk' ? 'stk' : p.u) : 'pk'; }

  /** Aggregate the week's ingredients into whole packs (or pieces for loose produce). Overrides in st.qty win. */
  function buildList(days, cat, offers, st) {
    const qty = (st && st.qty) || {};
    const need = {}, usedBy = {};
    days.forEach((d, i) => {
      if (!d.r) return;
      const f = (d.portions || BASE_PORTIONS) / BASE_PORTIONS;
      d.r.ing.forEach(x => {
        const p = cat.byId[x.p];
        need[x.p] = (need[x.p] || 0) + (p && p.pantry ? x.a : x.a * f);
        (usedBy[x.p] = usedBy[x.p] || []).push(d.key || i);
      });
    });
    return Object.keys(need).map(pid => {
      const p = cat.byId[pid];
      if (!p) return null;
      let packs = 1;
      if (!p.pantry) {
        const ratio = need[pid] / p.sz;
        packs = isLoose(p) ? Math.max(1, Math.ceil(ratio - 0.25)) : Math.max(1, Math.ceil(ratio - PACK_TOLERANCE));
      }
      const auto = packs;
      if (typeof qty[pid] === 'number') packs = qty[pid];
      const o = offers && offers[pid];
      return {
        id: pid, p, name: p.n, section: p.s, need: need[pid], packs, auto, adjusted: typeof qty[pid] === 'number' && qty[pid] !== auto,
        price: p.pantry ? 0 : packs * unitPrice(p, offers),
        pantry: !!p.pantry, offer: o ? (o.label || null) : null,
        qtyText: p.pantry ? '' : packs + ' ' + unitWord(p, packs),
        needText: p.pantry || isLoose(p) ? '' : 'trenger ' + fmtAmount(need[pid], p.u),
        leftover: p.pantry ? 0 : Math.max(0, packs * p.sz - need[pid]),
        days: usedBy[pid]
      };
    }).filter(Boolean);
  }

  function isHave(item, st) { return !!((st.have || {})[item.id]) || (!item.pantry && item.packs === 0); }

  function weekTotal(items, extras, st, cat, offers) {
    const checks = (st && st.checks) || {};
    let total = 0, inCart = 0, unpriced = 0;
    items.forEach(i => {
      if (i.pantry || isHave(i, st)) return;
      total += i.price; if (checks[i.id]) inCart += i.price;
    });
    (extras || []).forEach(x => {
      if (x.have) return;
      const p = x.p && cat.byId[x.p];
      if (!p) { unpriced++; return; }
      const pr = unitPrice(p, offers) * (x.n || 1);
      total += pr; if (x.checked) inCart += pr;
    });
    return { total: Math.round(total), inCart: Math.round(inCart), unpriced };
  }

  function freezeHints(days, cat) {
    const out = [];
    days.forEach(d => {
      if ((DAYNUM[d.key] ?? 0) < FRESH_FROM_DAY || !d.r) return;
      d.r.ing.forEach(x => {
        const p = cat.byId[x.p];
        if (p && p.fresh) out.push('Frys ' + x.t.replace(/^ca\.\s*/i, '').toLowerCase() + ' til ' + (d.label || '').toLowerCase() + '. Tin i kjøleskapet kvelden før.');
      });
    });
    return out;
  }

  function leftoverHints(items, st) {
    return items.filter(i => !i.pantry && !isHave(i, st || {}) && i.leftover > 0 && i.leftover / i.p.sz >= 0.3 && i.p.sz > 1)
      .filter(i => !DURABLE.has(i.section) && !KEEPS.has(i.id))
      .sort((a, b) => (b.leftover / b.p.sz) * b.p.pr - (a.leftover / a.p.sz) * a.p.pr).slice(0, 5)
      .map(i => 'Til overs: ca. ' + fmtAmount(i.leftover, i.p.u) + ' ' + shortName(i.p).toLowerCase());
  }

  /** Neighbour-day conflicts: same protein or characteristic ingredient on the day before/after. */
  function conflicts(days, dayIdx, recipe, cat) {
    const out = [];
    const me = days[dayIdx];
    [dayIdx - 1, dayIdx + 1].forEach(j => {
      const d = days[j];
      if (!d || !d.r || !me) return;
      if (Math.abs((DAYNUM[d.key] ?? j) - (DAYNUM[me.key] ?? dayIdx)) !== 1) return; // bare dager som faktisk ligger inntil hverandre
      ['kylling', 'kjott', 'fisk'].forEach(tg => {
        if (recipe.tags.includes(tg) && d.r.tags.includes(tg)) out.push(({ kylling: 'Kylling', kjott: 'Rødt kjøtt', fisk: 'Fisk' })[tg] + ' også ' + (d.label || '').toLowerCase());
      });
      recipe.key.forEach(k => {
        if (d.r.key.includes(k) || d.r.ing.some(x => x.p === k)) {
          const p = cat.byId[k];
          out.push((p ? shortName(p) : k) + ' også ' + (d.label || '').toLowerCase());
        }
      });
    });
    return Array.from(new Set(out));
  }

  /** Rank recipes for one day (existing or new): use up leftovers, keep cost down, avoid neighbour conflicts. */
  function rankSwaps(days, dayIdx, recipesById, cat, offers) {
    const sum = list => list.reduce((s, i) => s + i.price, 0);
    const others = days.map((d, i) => i === dayIdx ? Object.assign({}, d, { r: null }) : d);
    const base = buildList(others, cat, offers);
    const left = {};
    base.forEach(i => { if (!i.pantry) left[i.id] = i.leftover; });
    const baseTotal = sum(base);
    const curTotal = days[dayIdx].r ? sum(buildList(days, cat, offers)) : baseTotal;
    const used = new Set(days.filter((d, i) => i !== dayIdx).map(d => d.rid));
    return Object.values(recipesById).map(r => {
      const withR = days.map((d, i) => i === dayIdx ? Object.assign({}, d, { r }) : d);
      const tot = sum(buildList(withR, cat, offers));
      let saved = 0; const uses = [];
      r.ing.forEach(x => {
        const p = cat.byId[x.p]; if (!p || p.pantry || !left[x.p]) return;
        const take = Math.min(x.a, left[x.p]);
        if (take > 0) { saved += take * unitPrice(p, offers) / p.sz; uses.push(shortName(p)); }
      });
      const c = conflicts(withR, dayIdx, r, cat);
      const score = saved * 2 - Math.max(0, tot - baseTotal) - (c.length ? 1000 : 0) - (used.has(r.id) ? 2000 : 0);
      return { r, delta: Math.round(tot - curTotal), uses: Array.from(new Set(uses)), conflicts: c, score, inWeek: used.has(r.id) };
    }).sort((a, b) => b.score - a.score);
  }

  function searchCatalog(cat, q, limit) {
    const nq = norm(q); if (!nq) return [];
    const res = [];
    cat.search.forEach(e => {
      let s = 0;
      if (e.n.startsWith(nq)) s = 4;
      else if (e.words.some(w => w.startsWith(nq))) s = 3;
      else if (e.k.some(k => k.startsWith(nq))) s = 2.5;
      else if (e.n.includes(nq)) s = 1.5;
      else if (e.k.some(k => k.includes(nq))) s = 1;
      if (s) res.push({ p: e.p, s: s - e.n.length / 1000 });
    });
    return res.sort((a, b) => b.s - a.s).slice(0, limit || 8).map(x => x.p);
  }

  function guessSection(cat, text) {
    const hit = searchCatalog(cat, text, 1)[0];
    if (hit) return hit.s;
    for (const w of norm(text).split(/\s+/)) { const h = searchCatalog(cat, w, 1)[0]; if (h) return h.s; }
    return 'Annet';
  }

  /** New week: keep own items that were never put in the basket. */
  function rollover(old, weekId) {
    const extras = ((old && old.extras) || []).filter(x => !x.checked && !x.everChecked)
      .map(x => Object.assign({}, x, { have: false, carried: true }));
    return { weekId, checks: {}, have: {}, swaps: {}, qty: {}, removed: {}, added: [], portions: {}, extras };
  }

  function applyOp(st, op, me) {
    st = JSON.parse(JSON.stringify(st));
    ['checks', 'have', 'swaps', 'qty', 'removed'].forEach(k => { st[k] = st[k] || {}; });
    st.extras = st.extras || []; st.added = st.added || [];
    const x = op.id && st.extras.find(e => e.id === op.id);
    switch (op.t) {
      case 'check': if (op.v) st.checks[op.id] = { by: me, at: op.at }; else delete st.checks[op.id]; break;
      case 'have': if (op.v) st.have[op.id] = { by: me }; else { delete st.have[op.id]; if (st.qty[op.id] === 0) delete st.qty[op.id]; } break;
      case 'qty': if (op.n === null || op.n === undefined) delete st.qty[op.id]; else st.qty[op.id] = Math.max(0, Math.round(op.n)); break;
      case 'add': if (!st.extras.some(e => e.id === op.x.id)) st.extras.push(op.x); break;
      case 'xcheck': if (x) { x.checked = op.v; if (op.v) x.everChecked = true; x.by = me; } break;
      case 'xhave': if (x) { x.have = op.v; } break;
      case 'xqty': if (x) { if (op.n <= 0) st.extras = st.extras.filter(e => e.id !== op.id); else x.n = Math.round(op.n); } break;
      case 'del': st.extras = st.extras.filter(e => e.id !== op.id); break;
      case 'portions': st.portions = st.portions || {}; if (!op.n || op.n === BASE_PORTIONS) delete st.portions[op.day]; else st.portions[op.day] = op.n; break;
      case 'swap': if (op.r) st.swaps[op.day] = op.r; else delete st.swaps[op.day]; break;
      case 'addday': if (op.planned) { delete st.removed[op.day]; if (op.r) st.swaps[op.day] = op.r; }
        else if (!st.added.some(a => a.key === op.day)) st.added.push({ key: op.day, label: op.label, date: op.date, recipe: op.r }); break;
      case 'rmday': if (op.planned) st.removed[op.day] = true; else st.added = st.added.filter(a => a.key !== op.day); delete st.swaps[op.day]; break;
    }
    return st;
  }


  // ---------- Mengder for valgt antall porsjoner (samme regler som tools/build.py) ----------
  function fmtNum(x) {
    const whole = Math.floor(x + 1e-9), rest = Math.round((x - whole) * 100) / 100;
    const fr = { 0.5: '½', 0.25: '¼', 0.75: '¾' }[rest];
    if (fr) return (whole ? String(whole) : '') + fr;
    return String(Math.round(x * 10) / 10).replace('.', ',');
  }
  function fmtQty(q, u) {
    if (q === null || q === undefined) return '';
    if (u === 'g') { q = q < 100 ? Math.round(q / 5) * 5 : Math.round(q / 25) * 25; return q + ' g'; }
    if (u === 'kg') return fmtQty(q * 1000, 'g');
    if (u === 'l') return q < 1 ? fmtQty(q * 10, 'dl') : fmtNum(Math.round(q * 4) / 4) + ' l';
    if (u === 'dl' || u === 'ss' || u === 'ts' || u === 'krm') return fmtNum(Math.max(0.5, Math.round(q * 2) / 2)) + ' ' + u;
    let v = Math.max(0.5, Math.round(q * 2) / 2);
    if (v >= 3) v = Math.round(q);
    return fmtNum(v) + (u === 'stk' ? '' : ' ' + u);
  }
  /** Ingredient line for a given number of portions. */
  function ingText(x, portions) {
    if (x.q === undefined) return x.t; // eldre format
    const q = x.q === null ? null : x.q * (portions || BASE_PORTIONS) / BASE_PORTIONS;
    return (fmtQty(q, x.u) + ' ' + x.n).trim();
  }
  /** Step text with {vare-id} replaced by scaled amount and name. */
  function stepText(step, recipe, portions) {
    const t = typeof step === 'string' ? step : step.t;
    return t.replace(/\{(\w+)\}/g, (m, id) => { const x = recipe.ing.find(i => i.p === id); return x ? ingText(x, portions) : id; });
  }
  function stepObj(step) { return typeof step === 'string' ? { h: '', t: step, m: null } : step; }

  // ---------- Budget history ----------
  function emptyHistory() { return { budget: 0, weeks: {} }; }
  function applyHistOp(h, op) {
    h = JSON.parse(JSON.stringify(h || emptyHistory()));
    h.weeks = h.weeks || {};
    if (op.t === 'budget') h.budget = Math.max(0, Math.round(op.v || 0));
    if (op.t === 'actual') {
      const w = h.weeks[op.weekId] = Object.assign({}, h.weeks[op.weekId] || {});
      if (op.v === null) { delete w.actual; } else { w.actual = Math.round(op.v); }
      w.estimate = op.estimate; w.date = op.date; w.label = op.label; w.items = op.items; w.by = op.by; w.savedAt = op.at;
    }
    return h;
  }
  /** Weeks in a month (by the week's Monday), current week's live estimate included. */
  function monthSummary(h, ym, current) {
    const weeks = Object.entries((h && h.weeks) || {}).map(([id, w]) => Object.assign({ id }, w));
    if (current && !weeks.some(w => w.id === current.id)) weeks.push(Object.assign({ live: true }, current));
    else if (current) weeks.forEach(w => { if (w.id === current.id && w.actual === undefined) w.estimate = current.estimate; });
    const inMonth = weeks.filter(w => (w.date || '').slice(0, 7) === ym).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const spent = inMonth.reduce((s, w) => s + (typeof w.actual === 'number' ? w.actual : 0), 0);
    const planned = inMonth.reduce((s, w) => s + (typeof w.actual === 'number' ? 0 : (w.estimate || 0)), 0);
    const budget = (h && h.budget) || 0;
    return { weeks: inMonth, spent, planned, budget, left: budget ? budget - spent - planned : null };
  }

  root.Lib = { DAYS, norm, shortName, indexCatalog, indexRecipes, effectiveDays, addableDays, weekMonday, buildList, isHave, weekTotal, freezeHints,
    leftoverHints, conflicts, rankSwaps, searchCatalog, guessSection, rollover, applyOp, fmtAmount, emptyHistory, applyHistOp, monthSummary, addDays, BASE_PORTIONS, fmtNum, fmtQty, ingText, stepText, stepObj };
})(typeof window !== 'undefined' ? window : globalThis);
