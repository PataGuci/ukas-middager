#!/usr/bin/env python3
"""Bygger data/catalog.json og data/recipes.json fra kildefilene i tools/.
Kjør: python3 tools/build.py  (fra repo-roten)"""
import json, re, sys, unicodedata, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "tools"
OUT = ROOT / "data"

def slug(s):
    s = s.lower().replace("æ", "ae").replace("ø", "o").replace("å", "a")
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", s)[:40]

def build_catalog():
    sections, products, ids = [], [], set()
    sec = None
    lines = (SRC / "catalog_src.txt").read_text(encoding="utf-8").splitlines()
    explicit = {l.split("|")[0].strip() for l in lines if l.count("|") >= 4 and not l.startswith("#")}
    for raw in lines:
        line = raw.strip()
        if not line or (line.startswith("#") and not line.startswith("##")):
            continue
        if line.startswith("##"):
            sec = line[2:].strip(); sections.append(sec); continue
        body, _, kw = line.partition(";")
        parts = body.split("|")
        if len(parts) >= 5:
            pid, name, size, unit, price = parts[:5]
            flags = parts[5] if len(parts) > 5 else ""
            p = dict(id=pid, n=name, s=sec, sz=float(size), u=unit, pr=float(price))
            if "p" in flags: p["pantry"] = True
            if "f" in flags: p["fresh"] = True
        elif len(parts) == 2:
            name, price = parts
            pid = slug(name)
            n = 2
            while pid in ids or pid in explicit: pid = slug(name) + str(n); n += 1
            p = dict(id=pid, n=name, s=sec, sz=1, u="stk", pr=float(price))
        else:
            sys.exit("Ugyldig linje: " + raw)
        if p["id"] in ids: sys.exit("Duplisert id: " + p["id"])
        ids.add(p["id"])
        if kw.strip(): p["k"] = [k.strip() for k in kw.split(",") if k.strip()]
        products.append(p)
    return dict(note="Prisene er anslag for KIWI, ikke faktiske priser.", sections=sections, products=products)

UNIT_TO = {("dl", "ml"): 100, ("l", "ml"): 1000, ("kg", "g"): 1000, ("l", "dl"): 10}
FRAC = {0.5: "½", 0.25: "¼", 0.75: "¾"}

def fmt_num(x):
    whole = int(x); rest = round(x - whole, 2)
    if rest in FRAC: return (str(whole) if whole else "") + FRAC[rest]
    s = ("%.1f" % x).rstrip("0").rstrip(".")
    return s.replace(".", ",")

def fmt_qty(q, u):
    if q is None: return ""
    if u == "g":
        q = round(q / 5) * 5 if q < 100 else round(q / 25) * 25
        return f"{int(q)} g"
    if u == "kg": return fmt_qty(q * 1000, "g")
    if u == "l":
        return fmt_qty(q * 10, "dl") if q < 1 else fmt_num(round(q * 4) / 4) + " l"
    if u == "dl":
        return fmt_num(max(0.5, round(q * 2) / 2)) + " dl"
    if u in ("ss", "ts", "krm"):
        return fmt_num(max(0.5, round(q * 2) / 2)) + " " + u
    if u in ("g",): return f"{q} g"
    v = max(0.5, round(q * 2) / 2)
    if v >= 3: v = round(q)
    return fmt_num(v) + ("" if u == "stk" else " " + u)

def build_recipes(catalog):
    sys.path.insert(0, str(SRC))
    import recipes_src
    pids = {p["id"]: p for p in catalog["products"]}
    seen, out = set(), []
    for r in recipes_src.R:
        if r["id"] in seen: sys.exit("Duplisert oppskrift: " + r["id"])
        seen.add(r["id"])
        f = recipes_src.TARGET / r["serves"]
        ing = []
        for i in r["ing"]:
            p = pids.get(i["p"])
            if not p: sys.exit(f"{r['id']}: ukjent vare {i['p']}")
            q = i["q"] * f if i["q"] is not None else None
            if p.get("pantry") or q is None:
                a = 1
            else:
                per = i["per"] if i["per"] is not None else (1 if i["u"] == p["u"] or (i["u"] in ("stk", "fedd", "bunt", "boks", "pose", "pakke", "glass", "beger", "potte") and p["sz"] == 1) else UNIT_TO.get((i["u"], p["u"])))
                if per is None: sys.exit(f"{r['id']}: mangler omregning {i['u']} -> {p['u']} for {i['p']}")
                a = round(q * per, 3)
            qty = fmt_qty(q, i["u"])
            ing.append(dict(p=i["p"], a=a, t=(qty + " " + i["n"]).strip()))
        for k in r["key"]:
            if k not in pids: sys.exit(f"{r['id']}: ukjent key-vare {k}")
        tags = [t for t in r["tags"] if t not in ("superrask", "rask")]
        if r["minutes"] <= 20: tags.insert(0, "superrask")
        elif r["minutes"] <= 30: tags.insert(0, "rask")
        out.append(dict(id=r["id"], name=r["name"], minutes=r["minutes"], tags=tags, key=r["key"], ing=ing, steps=r["steps"],
                        src=r["src"], srcName=r["srcName"], serves=r["serves"], note=r.get("note")))
    return dict(note="Oppskrifter fra oppgitte kilder, omregnet til 2,5 porsjoner. Fremgangsmåten er forkortet.", recipes=out)

if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    cat = build_catalog()
    rec = build_recipes(cat)
    (OUT / "catalog.json").write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    (OUT / "recipes.json").write_text(json.dumps(rec, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(cat['products'])} varer i {len(cat['sections'])} avdelinger, {len(rec['recipes'])} oppskrifter")
