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

def build_recipes(catalog):
    sys.path.insert(0, str(SRC))
    import recipes_src
    pids = {p["id"]: p for p in catalog["products"]}
    seen = set()
    for r in recipes_src.R:
        if r["id"] in seen: sys.exit("Duplisert oppskrift: " + r["id"])
        seen.add(r["id"])
        for i in r["ing"]:
            if i["p"] not in pids: sys.exit(f"{r['id']}: ukjent vare {i['p']}")
        for k in r["key"]:
            if k not in pids: sys.exit(f"{r['id']}: ukjent key-vare {k}")
        tags = list(r["tags"])
        if r["minutes"] <= 20: tags.insert(0, "superrask")
        elif r["minutes"] <= 30: tags.insert(0, "rask")
        r["tags"] = tags
    return dict(recipes=recipes_src.R)

if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    cat = build_catalog()
    rec = build_recipes(cat)
    (OUT / "catalog.json").write_text(json.dumps(cat, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    (OUT / "recipes.json").write_text(json.dumps(rec, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(cat['products'])} varer i {len(cat['sections'])} avdelinger, {len(rec['recipes'])} oppskrifter")
