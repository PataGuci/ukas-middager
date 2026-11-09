# Ukas middager

Privat handleliste- og middagsapp for to telefoner. Appen er en statisk side (GitHub Pages).
Ukeplanen og avkryssingene ligger i det private repoet `ukas-middager-data`, og appen når dem med en nøkkel som lagres på hver telefon via delingslenken (`#k=<nøkkel>`).

Ingen data eller nøkler ligger i dette repoet.

## Struktur
- `index.html`, `app.js` – appen (UI og synk mot GitHub)
- `lib.js` – ren logikk: handleliste fra oppskrifter, pakninger, sum, bytteforslag, ny uke
- `data/catalog.json` – varekatalog med avdeling, pakningsstørrelse og **anslåtte** Kiwi-priser
- `data/recipes.json` – oppskriftsbiblioteket
- `tools/catalog_src.txt`, `tools/recipes_src.py` – kildene; kjør `python3 tools/build.py` etter endringer
- `tools/test.js` – `node tools/test.js <sti til plan.json>` tester logikken

## plan.json (i data-repoet)
`{ "v": 2, "weekId", "weekLabel", "dates", "title", "generatedAt", "offerStatus", "offers": { "<vare-id>": { "price": 39.9, "label": "tilbud 39,90" } }, "days": [ { "key", "label", "date", "recipe": "<oppskrift-id>" } ], "recipes": [ valgfrie nye oppskrifter i samme format som biblioteket ] }`
- `tools/steps_src.py` – matlagingsstegene (tittel, tekst med `{vare-id}` for mengder, minutter for nedtelling)
