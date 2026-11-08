/* Ukas middager – ren logikk uten DOM, så den kan testes med node (tools/test.js). */
(function (root) {
  const FRESH_FROM_DAY = 3; // torsdag og senere: ferskt kjøtt/fisk bør fryses mandag

  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
      .normalize('NFKD').replace(/[̀-ͯ]/g, '').trim();
  }

  function shortName(p) {
    return p.n.replace(/\s*\(.*?\)/g, '').replace(/\s+\d[\d,.]*\s*(g|kg|ml|l|dl|stk|pk)\b.*$/i, '').trim();
  }
  const DURABLE = new Set(['Tørrvarer og hermetikk', 'Krydder', 'Frys']);
  const KEEPS = new Set(['poteter', 'smapoteter', 'sotpotet', 'gullok', 'hvitlok', 'gulrot']);

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

  /** Days with the active recipe for each (swaps applied). */
  function effectiveDays(plan, st, recipes) {
    const swaps = (st && st.swaps) || {};
    return (plan.days || []).map(d => {
      const rid = swaps[d.key] || d.recipe;
      return Object.assign({}, d, { rid, original: d.recipe, swapped: !!swaps[d.key] && swaps[d.key] !== d.recipe, r: recipes[rid] || null });
    });
  }

  function unitPrice(p, offers) {
    const o = offers && offers[p.id];
    return (o && typeof o.price === 'number') ? o.price : p.pr;
  }

  function fmtAmount(a, u) {
    if (u === 'g' && a >= 1000) return (Math.round(a / 100) / 10).toString().replace('.', ',') + ' kg';
    if (u === 'ml' && a >= 1000) return (Math.round(a / 100) / 10).toString().replace('.', ',') + ' l';
    if (u === 'ml' && a >= 100) return (Math.round(a / 10) / 10).toString().replace('.', ',') + ' dl';
    const r = Math.round(a * 10) / 10;
    return String(r).replace('.', ',') + ' ' + u;
  }

  /** Aggregate the week's ingredients into whole packs. */
  function buildList(days, cat, offers) {
    const need = {}, usedBy = {};
    days.forEach((d, i) => {
      if (!d.r) return;
      d.r.ing.forEach(x => {
        need[x.p] = (need[x.p] || 0) + x.a;
        (usedBy[x.p] = usedBy[x.p] || []).push(i);
      });
    });
    const items = Object.keys(need).map(pid => {
      const p = cat.byId[pid];
      if (!p) return null;
      const packs = p.pantry ? 1 : Math.max(1, Math.ceil(need[pid] / p.sz - 1e-9));
      const price = p.pantry ? 0 : packs * unitPrice(p, offers);
      const o = offers && offers[pid];
      return {
        id: pid, p, name: p.n, section: p.s, need: need[pid], packs, price,
        pantry: !!p.pantry, offer: o ? (o.label || null) : null,
        qty: p.pantry ? '' : (packs + (p.sz === 1 && p.u === 'stk' ? ' stk' : ' pk')),
        needText: (p.sz === 1 && p.u === 'stk') || p.pantry ? '' : 'trenger ' + fmtAmount(need[pid], p.u),
        leftover: p.pantry ? 0 : packs * p.sz - need[pid],
        days: usedBy[pid]
      };
    }).filter(Boolean);
    return items;
  }

  function weekTotal(items, extras, st, cat, offers) {
    const have = (st && st.have) || {}, checks = (st && st.checks) || {};
    let total = 0, inCart = 0, unpriced = 0;
    items.forEach(i => {
      if (i.pantry || have[i.id]) return;
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
    days.forEach((d, i) => {
      if (i < FRESH_FROM_DAY || !d.r) return;
      d.r.ing.forEach(x => {
        const p = cat.byId[x.p];
        if (p && p.fresh) out.push('Frys ' + x.t.replace(/^ca\.\s*/i, '').toLowerCase() + ' til ' + (d.label || '').toLowerCase() + '. Tin i kjøleskapet kvelden før.');
      });
    });
    return out;
  }

  function leftoverHints(items) {
    return items.filter(i => !i.pantry && i.leftover > 0 && i.leftover / i.p.sz >= 0.25 && i.p.sz > 1)
      .filter(i => !DURABLE.has(i.section) && !KEEPS.has(i.id))
      .map(i => 'Til overs: ca. ' + fmtAmount(i.leftover, i.p.u) + ' ' + shortName(i.p).toLowerCase());
  }

  /** Neighbour-day conflicts: same characteristic ingredient on the day before/after. */
  function conflicts(days, dayIdx, recipe, cat) {
    const out = [];
    [dayIdx - 1, dayIdx + 1].forEach(j => {
      const d = days[j];
      if (!d || !d.r) return;
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

  /** Rank replacement recipes for one day: use up leftovers, keep cost down, avoid neighbour conflicts. */
  function rankSwaps(days, dayIdx, recipesById, cat, offers) {
    const others = days.map((d, i) => i === dayIdx ? Object.assign({}, d, { r: null }) : d);
    const base = buildList(others, cat, offers);
    const left = {};
    base.forEach(i => { if (!i.pantry) left[i.id] = i.leftover; });
    const baseTotal = base.reduce((s, i) => s + i.price, 0);
    const current = days[dayIdx].r;
    const curTotal = current ? buildList(days, cat, offers).reduce((s, i) => s + i.price, 0) : baseTotal;
    const used = new Set(days.map(d => d.rid));
    return Object.values(recipesById).map(r => {
      const withR = days.map((d, i) => i === dayIdx ? Object.assign({}, d, { r }) : d);
      const tot = buildList(withR, cat, offers).reduce((s, i) => s + i.price, 0);
      let saved = 0; const uses = [];
      r.ing.forEach(x => {
        const p = cat.byId[x.p]; if (!p || p.pantry || !left[x.p]) return;
        const take = Math.min(x.a, left[x.p]);
        if (take > 0) { saved += take * unitPrice(p, offers) / p.sz; uses.push(shortName(p)); }
      });
      const c = conflicts(days, dayIdx, r, cat);
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
    const words = norm(text).split(/\s+/);
    for (const w of words) { const h = searchCatalog(cat, w, 1)[0]; if (h) return h.s; }
    return 'Annet';
  }

  /** New week: keep own items that were never put in the basket. */
  function rollover(old, weekId) {
    const extras = ((old && old.extras) || []).filter(x => !x.checked && !x.everChecked)
      .map(x => Object.assign({}, x, { have: false, carried: true }));
    return { weekId, checks: {}, have: {}, swaps: {}, extras };
  }

  function applyOp(st, op, me) {
    st = JSON.parse(JSON.stringify(st));
    st.checks = st.checks || {}; st.have = st.have || {}; st.swaps = st.swaps || {}; st.extras = st.extras || [];
    const x = op.id && st.extras.find(e => e.id === op.id);
    switch (op.t) {
      case 'check': if (op.v) st.checks[op.id] = { by: me, at: op.at }; else delete st.checks[op.id]; break;
      case 'have': if (op.v) st.have[op.id] = { by: me }; else delete st.have[op.id]; break;
      case 'add': if (!st.extras.some(e => e.id === op.x.id)) st.extras.push(op.x); break;
      case 'xcheck': if (x) { x.checked = op.v; if (op.v) x.everChecked = true; x.by = me; } break;
      case 'xhave': if (x) { x.have = op.v; } break;
      case 'del': st.extras = st.extras.filter(e => e.id !== op.id); break;
      case 'swap': if (op.r) st.swaps[op.day] = op.r; else delete st.swaps[op.day]; break;
    }
    return st;
  }

  root.Lib = { norm, shortName, indexCatalog, indexRecipes, effectiveDays, buildList, weekTotal, freezeHints, leftoverHints, conflicts, rankSwaps, searchCatalog, guessSection, rollover, applyOp, fmtAmount };
})(typeof window !== 'undefined' ? window : globalThis);
