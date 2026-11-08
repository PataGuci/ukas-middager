// Kjør: node tools/test.js ../ukas-middager-data/plan.json
const fs = require('fs'); require('../lib.js'); const L = globalThis.Lib;
const cat = L.indexCatalog(JSON.parse(fs.readFileSync(__dirname + '/../data/catalog.json')));
const lib = JSON.parse(fs.readFileSync(__dirname + '/../data/recipes.json'));
const plan = JSON.parse(fs.readFileSync(process.argv[2] || '/home/claude/repo-data/plan.json'));
const rec = L.indexRecipes(lib, plan);
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FEIL:', m); } };
plan.days.forEach(d => ok(rec[d.recipe], 'ukjent oppskrift ' + d.recipe));
let st = L.rollover(null, plan.weekId);
let days = L.effectiveDays(plan, st, rec);
let items = L.buildList(days, cat, plan.offers);
let t = L.weekTotal(items, st.extras, st, cat, plan.offers);
console.log('Varer:', items.length, 'Sum ca.', t.total, 'kr');
items.forEach(i => console.log(' ', i.section.padEnd(26), i.name.padEnd(30), i.qty.padEnd(6), i.needText, i.price ? Math.round(i.price) + ' kr' : ''));
console.log('Frys:', L.freezeHints(days, cat));
console.log('Rester:', L.leftoverHints(items));
// konflikter i planen
days.forEach((d, i) => { const c = L.conflicts(days, i, d.r, cat); if (c.length) console.log('Konflikt', d.label, c); });
// bytte
const sw = L.rankSwaps(days, 2, rec, cat, plan.offers).filter(s => s.r.id !== days[2].rid).slice(0, 5);
console.log('Forslag onsdag:', sw.map(s => `${s.r.name} (${s.delta >= 0 ? '+' : ''}${s.delta} kr; bruker ${s.uses.join(', ')}; ${s.conflicts.join(', ')})`));
st = L.applyOp(st, { t: 'swap', day: 'ons', r: sw[0].r.id }, 'J');
const t2 = L.weekTotal(L.buildList(L.effectiveDays(plan, st, rec), cat, plan.offers), st.extras, st, cat, plan.offers);
ok(Math.round(t2.total - t.total) === sw[0].delta, 'delta stemmer ikke: ' + (t2.total - t.total) + ' vs ' + sw[0].delta);
// have
const firstPaid = items.find(i => !i.pantry); st = L.applyOp(st, { t: 'have', id: firstPaid.id, v: true }, 'J');
const t3 = L.weekTotal(L.buildList(L.effectiveDays(plan, st, rec), cat, plan.offers), st.extras, st, cat, plan.offers);
ok(t3.total < t2.total, 'have reduserer ikke sum');
// extras + rollover
st = L.applyOp(st, { t: 'add', x: { id: 'x1', p: 'oppvasktabletter', name: 'Oppvasktabletter', s: 'Husholdning', checked: false } }, 'J');
st = L.applyOp(st, { t: 'add', x: { id: 'x2', p: 'yoghurtnaturell', name: 'Yoghurt', s: 'Meieri og egg', checked: false } }, 'J');
st = L.applyOp(st, { t: 'xcheck', id: 'x2', v: true }, 'J'); st = L.applyOp(st, { t: 'xcheck', id: 'x2', v: false }, 'J');
const t4 = L.weekTotal(L.buildList(L.effectiveDays(plan, st, rec), cat, plan.offers), st.extras, st, cat, plan.offers);
ok(t4.total > t3.total, 'ekstra vare øker ikke sum');
const nw = L.rollover(st, '2026-W47');
ok(nw.extras.length === 1 && nw.extras[0].id === 'x1', 'rollover beholdt feil varer: ' + JSON.stringify(nw.extras));
ok(L.guessSection(cat, 'oppvasktabletter') === 'Husholdning', 'seksjon oppvask');
ok(L.guessSection(cat, 'yoghurt') === 'Meieri og egg', 'seksjon yoghurt: ' + L.guessSection(cat, 'yoghurt'));
console.log('Søk "yog":', L.searchCatalog(cat, 'yog', 5).map(p => p.n));
console.log('Søk "oppv":', L.searchCatalog(cat, 'oppv', 5).map(p => p.n));
// alle oppskrifter: realistisk pris per middag
const per = lib.recipes.map(r => { const it = L.buildList([{ r }], cat, {}); return [r.id, Math.round(it.reduce((s, i) => s + i.price, 0))]; }).sort((a, b) => a[1] - b[1]);
console.log('Billigst/dyrest:', per.slice(0, 3), per.slice(-3));
console.log(fail ? fail + ' feil' : 'Alle tester OK');
process.exit(fail ? 1 : 0);
