# Oppskriftsbibliotek for Ukas middager.
# Alle oppskrifter er hentet fra publiserte kilder (lenke i "src"). Mengdene skrives inn slik
# originalen oppgir dem, for originalens antall porsjoner ("serves"). Byggeskriptet regner dem om
# til 2,5 porsjoner (to voksne, den ene spiser 1,5 porsjon).
# Fremgangsmåten er en kort oppsummering med egne ord; hele originalen ligger bak lenken.
# "note" forteller om tilpasninger til husholdningen (ingen svin, ikke rå paprika, gulløk framfor rødløk).
#
# Ingrediens: I(vare-id, mengde, enhet, navn, per=None)
#   enhet er originalens enhet (g, kg, dl, l, stk, fedd, ss, ts, pose, boks, glass, beger, pakke)
#   per = hvor mye av varens enhet én originalenhet tilsvarer, når enhetene er ulike
#         (f.eks. kyllingfilet "stk" -> 150 g, risottoris "dl" -> 90 g). Basisvarer (krydder o.l.) trenger ikke per.
#   mengde None = "etter smak" (ingen mengde vises)

TARGET = 2.5
R = []

def I(p, q, u, n, per=None):
    return dict(p=p, q=q, u=u, n=n, per=per)

def r(id, name, minutes, serves, src, srcName, tags, key, ing, steps, note=None):
    R.append(dict(id=id, name=name, minutes=minutes, serves=serves, src=src, srcName=srcName,
                  tags=tags, key=key, ing=ing, steps=steps, note=note))

TINE = "Tine.no"
KF = 150   # én kyllingfilet ~150 g
POT = 100  # én potet ~100 g
GUL = 75   # én gulrot ~75 g
CT = 12    # én cherrytomat ~12 g

# ---------------- KYLLING ----------------
r("ovnsrisotto", "Ovnsbakt risotto med kylling og sopp", 40, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/pasta-og-ris/ovnsbakt-risotto-med-spinatsalat", TINE,
  ["italiensk", "kylling", "ovn", "comfort"], ["kyllingfilet", "sjampinjong"],
  [I("buljong", 1, "l", "kyllingbuljong", per=2), I("smor", 3, "ss", "smør"), I("kyllingfilet", 600, "g", "kyllingfilet i terninger"),
   I("sjampinjong", 200, "g", "sjampinjong i skiver"), I("risottoris", 4.5, "dl", "risottoris", per=90), I("hvitlok", 2, "fedd", "hvitløk"),
   I("rosmarin", 0.5, "ts", "tørket rosmarin"), I("salt", 1, "ts", "salt"), I("pepper", 1, "ts", "hvit pepper"),
   I("erter", 150, "g", "frosne erter"), I("kremost", 3, "ss", "kremost naturell", per=15),
   I("spinat", 1, "pakke", "fersk spinat til salat", per=150), I("olje", 2, "ss", "olivenolje"), I("sitron", 0.5, "stk", "sitron (saft)")],
  ["Sett ovnen på 225 °C og kok opp buljongen.",
   "Brun kyllingen raskt i smør på høy varme, ha i soppen og stek et par minutter til.",
   "Rør inn ris, hvitløk og krydder og la det frese 1–2 minutter.",
   "Ha alt i en ildfast form, hell over buljongen og rør inn ertene. Dekk med folie og stek ca. 25 min.",
   "Rør inn kremosten. Server med spinat vendt i olje og sitronsaft."],
  note="Granateplet i originalens salat er utelatt.")

r("kyllingsopppasta", "Kremet pasta med kylling og sopp", 20, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/pasta-og-ris/pasta-med-kylling-og-sopp", TINE,
  ["italiensk", "kylling", "pasta"], ["kyllingfilet", "sjampinjong", "brokkoli"],
  [I("kyllingfilet", 500, "g", "kyllingfilet"), I("smor", 1, "ss", "smør"), I("gullok", 1, "stk", "løk"), I("brokkoli", 1, "stk", "brokkoli"),
   I("sjampinjong", 200, "g", "sopp"), I("cremefraiche", 2, "dl", "crème fraîche", per=100), I("pasta", 400, "g", "pasta")],
  ["Sett på vann til pastaen og kok den etter pakken.",
   "Skjær kyllingen i små biter og brun dem i smør.",
   "Ha i hakket løk, brokkoli og sopp, og stek til kyllingen er gjennomstekt.",
   "Rør inn crème fraîche og vend sausen sammen med pastaen."],
  note="Originalen bruker crème fraîche med paprika og chili; vanlig crème fraîche går like fint.")

r("urtepasta", "Kremet pasta med kylling og urter", 25, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/pasta-og-ris/urtepasta-med-kylling", TINE,
  ["italiensk", "kylling", "pasta"], ["kyllingfilet", "ruccola"],
  [I("pasta", 400, "g", "penne"), I("kyllingfilet", 3, "stk", "kyllingfilet", per=KF), I("smor", 2, "ss", "smør"),
   I("hvitlok", 2, "fedd", "hvitløk"), I("cremefraiche", 2, "dl", "lett crème fraîche", per=100), I("basilikum", 1, "stk", "basilikum og andre friske urter"),
   I("ruccola", 4, "dl", "ruccola", per=15), I("revetost", 2, "dl", "revet ost", per=40), I("salt", None, "", "salt og pepper")],
  ["Kok pastaen.", "Stek kyllingbitene i smør ca. 5 min til gjennomstekt. Krydre.",
   "Bland grovhakket hvitløk, crème fraîche og hakkede urter. Smak til.",
   "Vend kylling og saus inn i den varme pastaen.", "Server med ost, basilikum og ruccola."])

r("spinatlasagne", "Kylling- og spinatlasagne", 45, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/kylling-og-fjarkre/kylling-og-spinatlasagne", TINE,
  ["italiensk", "kylling", "ovn", "comfort"], ["kyllingfilet", "spinat"],
  [I("kyllingfilet", 3, "stk", "kyllingfilet i strimler", per=KF), I("smor", 2, "ss", "smør"), I("grillkrydder", 2, "ts", "grillkrydder"),
   I("spinat", 350, "g", "fersk spinat"), I("matflote", 3, "dl", "matfløte", per=100), I("eplejuice", 2, "dl", "eplejuice", per=100),
   I("maizena", 1, "ts", "maizena"), I("lasagneplater", 250, "g", "lasagneplater"), I("revetost", 5, "dl", "revet ost", per=40)],
  ["Sett ovnen på 225 °C.", "Stek kyllingstrimlene i smør ca. 5 min og krydre med grillkrydder.",
   "Stek spinaten i litt smør til væsken er borte.",
   "Kok fløte og eplejuice ca. 5 min, jevn med maizena om den er tynn.",
   "Legg lag med plater, kylling, spinat, ost og saus. Avslutt med saus og ost. Stek ca. 20 min."])

r("franskkylling", "Franskinspirert kyllinggryte", 20, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/kylling-og-fjarkre/franskinspirert-kyllinggryte", TINE,
  ["kylling", "gryte"], ["kyllingfilet", "cherrytomat"],
  [I("kyllingfilet", 4, "stk", "kyllingfilet", per=KF), I("smor", 1, "ss", "smør"), I("kremost", 125, "g", "Snøfrisk eller kremost naturell"),
   I("cremefraiche", 3, "dl", "lett crème fraîche", per=100), I("cherrytomat", 12, "stk", "cherrytomater", per=CT),
   I("timian", 1, "ts", "tørket timian"), I("ris", 3, "dl", "ris til servering", per=85), I("salt", None, "", "salt og pepper")],
  ["Kok risen.", "Del filetene i 4–5 biter, krydre og stek i smør ca. 5 min.",
   "Ha i osten, så crème fraîche og 1 dl vann, og la det småkoke et minutt.",
   "Vend inn hakkede tomater og timian og varm gjennom."],
  note="Ris som tilbehør er lagt til.")

r("kyllingsuppekremet", "Kremet kyllingsuppe med ostedryss", 25, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/supper/kremet-kyllingsuppe-med-ostedryss", TINE,
  ["kylling", "suppe", "comfort"], ["kyllingfilet", "purre", "gulrot"],
  [I("smor", 4, "ss", "smør"), I("hvetemel", 4, "ss", "hvetemel"), I("olje", 2, "ss", "olje"), I("gullok", 1, "stk", "løk"),
   I("gulrot", 4, "stk", "gulrot", per=GUL), I("stangselleri", 0.5, "stk", "stangselleri", per=0.2), I("purre", 1, "stk", "liten purre"),
   I("hvitlok", 2, "fedd", "hvitløk"), I("buljong", 1, "l", "kyllingbuljong", per=2), I("laurbaer", 2, "stk", "laurbærblad"),
   I("rosmarin", 1, "ts", "rosmarin og timian"), I("cremefraiche", 3, "dl", "crème fraîche", per=100),
   I("kyllingfilet", 400, "g", "kyllingkjøtt"), I("revetost", 1, "dl", "revet ost til dryss", per=40), I("baguette", 1, "stk", "brød til", per=1)],
  ["Smelt smøret, rør inn melet og sett til side.",
   "Fres løk, gulrot, selleri, purre og hvitløk i olje, og rør inn smørbollen.",
   "Ha i buljong, krydder og crème fraîche. Småkok 10–15 min.",
   "Ha i kyllingen mot slutten og la den bli gjennomkokt. Smak til.",
   "Server med revet ost og ristet brød."])

r("kyllingsuppekarri", "Kyllingsuppe med karri", 30, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/supper/kyllingsuppe-med-karri", TINE,
  ["kylling", "suppe", "budsjett"], ["kyllingfilet", "sjampinjong"],
  [I("kyllingfilet", 400, "g", "kyllingfilet"), I("smor", 2, "ss", "smør"), I("gullok", 1, "stk", "løk"), I("gulrot", 2, "stk", "gulrot", per=GUL),
   I("sjampinjong", 100, "g", "sjampinjong"), I("karri", 2, "ts", "karri"), I("buljong", 8, "dl", "kyllingbuljong", per=0.2),
   I("matflote", 1.5, "dl", "matfløte", per=100), I("persille", 1, "dl", "hakket persille", per=0.5), I("mais", 100, "g", "mais"),
   I("cremefraiche", 4, "ss", "crème fraîche til topping", per=15), I("baguette", 1, "stk", "brød til", per=1)],
  ["Skjær kyllingen i biter og stek gylne i smør.",
   "Grovhakk løk, gulrot og sopp og stek med kyllingen. Ha i karri.",
   "Ha i buljong, fløte, persille og mais. Småkok ca. 10 min.",
   "Server med en skje crème fraîche på toppen."],
  note="Baconet i originalens topping er utelatt.")

r("hotkylling", "Hot kyllinggryte", 25, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/kylling-og-fjarkre/hot-kyllinggryte", TINE,
  ["kylling", "gryte", "asiatisk"], ["kyllingfilet", "gulrot"],
  [I("ris", 2.5, "dl", "basmatiris", per=85), I("smor", 2, "ts", "smør"), I("kyllingfilet", 4, "stk", "kyllingfilet", per=KF),
   I("gulrot", 3, "stk", "gulrot", per=GUL), I("hvitlok", 2, "fedd", "hvitløk"), I("tomatpure", 1, "ss", "tomatpuré", per=15),
   I("garammasala", 1, "ts", "garam masala, ingefær, gurkemeie og chilipulver"), I("cremefraiche", 2, "dl", "lett crème fraîche", per=100),
   I("koriander", 1, "stk", "koriander eller persille", per=0.25)],
  ["Kok risen.", "Skjær kyllingen i strimler og brun med revet gulrot i smør. Salt.",
   "Ha i hvitløk, tomatpuré, krydder, ½ dl vann og crème fraîche. Småkok ca. 5 min.",
   "Dryss over koriander."])

r("indiskkylling", "Indisk kyllinggryte", 40, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/kylling-og-fjarkre/indisk-kyllinggryte", TINE,
  ["kylling", "gryte", "asiatisk", "comfort"], ["kyllingfilet", "kokosmelk"],
  [I("gullok", 1, "stk", "løk"), I("hvitlok", 2, "fedd", "hvitløk"), I("chili", 1, "stk", "rød chili"), I("ingefaer", 1, "ss", "ingefær", per=10),
   I("smor", 2, "ss", "smør"), I("kyllingfilet", 4, "stk", "kyllingfilet", per=KF), I("garammasala", 2, "ss", "garam masala, karri og sukker"),
   I("hakkedetomater", 1, "boks", "hakkede tomater", per=400), I("kokosmelk", 2, "dl", "kokosmelk", per=100),
   I("yoghurt", 4, "dl", "yoghurt naturell", per=100), I("cashew", 2, "dl", "cashewnøtter", per=60),
   I("mangochutney", 1, "dl", "mango chutney", per=110), I("ris", 3, "dl", "ris til servering", per=85)],
  ["Fres løk, hvitløk, chili og ingefær mykt i smør.", "Ha i kyllingbitene og stek litt.",
   "Dryss over krydder og sukker og fres et par minutter.",
   "Ha i tomater og kokosmelk, småkok under lokk ca. 30 min.",
   "Rør inn halvparten av yoghurten og nøttene. Server med ris, chutney og resten av yoghurten."],
  note="Ris som tilbehør er lagt til.")

r("orientalskkylling", "Orientalsk kylling i ovn", 30, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/kylling-og-fjarkre/orientalsk-kylling", TINE,
  ["kylling", "ovn", "asiatisk"], ["kyllingfilet", "mangochutney"],
  [I("kyllingfilet", 4, "stk", "kyllingfilet", per=KF), I("smor", 2, "ss", "smør"), I("paprika", 1, "stk", "grønn paprika (stekes)"),
   I("kremflote", 3, "dl", "kremfløte", per=100), I("hvitlok", 1, "fedd", "hvitløk"), I("karri", 2, "ts", "karri"),
   I("mangochutney", 2, "dl", "mango chutney", per=110), I("sambal", 1, "ts", "sambal oelek"),
   I("mandelflak", 1, "dl", "mandelflak", per=40), I("ris", 3, "dl", "ris til servering", per=85)],
  ["Sett ovnen på 200 °C og kok risen.", "Brun filetene i smør, del dem og legg i en ildfast form med paprikastrimler over.",
   "Pisk fløten nesten stiv og rør inn hvitløk, karri, chutney og sambal. Fordel over.",
   "Stek ca. 20 min. Strø over ristede mandler."],
  note="Rå rød paprika til servering er utelatt.")

r("stektenudler", "Stekte nudler med kylling og grønnsaker", 15, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/kylling-og-fjarkre/stekte-nudler-med-kylling-og-gronnsaker", TINE,
  ["kylling", "asiatisk"], ["kyllingfilet", "nudler"],
  [I("olje", 2, "ss", "olje"), I("kyllingfilet", 4, "stk", "kyllingfilet", per=KF), I("paprika", 1, "stk", "paprika (stekes)"),
   I("sukkererter", 100, "g", "sukkererter"), I("mais", 100, "g", "mais (i stedet for minimais)"),
   I("nudler", 250, "g", "nudler"), I("hoisin", 1, "dl", "hoisinsaus", per=100), I("sesam", 2, "ss", "sesamfrø")],
  ["Kok nudlene.", "Stek kyllingbitene gjennom i olje i en wok, krydre og ta dem ut.",
   "Fres paprika, sukkererter og mais raskt.", "Ha i kylling og nudler, ringle over hoisin og vend til alt er varmt.",
   "Dryss over sesamfrø."],
  note="Bønnespirer er utelatt, og minimais er byttet med mais.")

r("ingefaerkylling", "Ingefærkylling med wokgrønnsaker", 30, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/kylling-og-fjarkre/ingefaerkylling-og-wok-gronnsaker", TINE,
  ["kylling", "asiatisk", "ovn"], ["kyllingfilet", "purre"],
  [I("ris", 300, "g", "ris"), I("kyllingfilet", 4, "stk", "kyllingfilet", per=KF), I("smor", 2, "ss", "smør"),
   I("soyasaus", 5, "ss", "soyasaus", per=15), I("honning", 3, "ss", "honning"), I("ingefaer", 3, "ss", "revet ingefær", per=10),
   I("chili", 0.5, "stk", "rød chili"), I("sellerirot", 300, "g", "sellerirot", per=1/500), I("gulrot", 4, "stk", "gulrot", per=GUL),
   I("purre", 1, "stk", "purre"), I("sesam", 1, "ss", "sesamfrø"), I("lime", 1, "stk", "lime")],
  ["Sett ovnen på 200 °C og kok risen.", "Legg kyllingen i en form. Hell over smeltet smør, soya, honning og ingefær. Krydre med salt og chili.",
   "Stek ca. 25 min.", "Wok selleri, gulrot og purre i staver på høy varme ca. 2 min, med litt soya og sesam.",
   "Server med ris og limebåter."])

r("chilichicken", "Chili con chicken", 20, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/kylling-og-fjarkre/chili-con-chicken", TINE,
  ["kylling", "meksikansk", "gryte"], ["kyllingdeig", "hvitebonner"],
  [I("hvitlok", 2, "fedd", "hvitløk"), I("kyllingdeig", 400, "g", "kyllingkjøttdeig"), I("smor", 1, "ss", "smør"),
   I("hakkedetomater", 400, "g", "hakkede tomater"), I("tomatpure", 3, "ss", "tomatpuré", per=15), I("chilipulver", 3, "ts", "chilipulver"),
   I("buljong", 1, "stk", "buljongterning"), I("hvitebonner", 2, "boks", "hvite bønner", per=410), I("persille", 1, "dl", "persille", per=0.5),
   I("cremefraiche", 3, "dl", "lett crème fraîche", per=100), I("hvetemel", 0.5, "ss", "hvetemel"), I("ris", 3, "dl", "ris til servering", per=85)],
  ["Kok risen.", "Stek kyllingdeigen i smør med hakket hvitløk, og ha alt over i en gryte.",
   "Ha i tomater, tomatpuré, chili og smuldret buljong.", "Skyll bønnene, ha dem i og småkok 2–3 min.",
   "Rør inn persille og halvparten av crème fraîchen blandet med mel. Server resten ved siden av."],
  note="Ris som tilbehør er lagt til.")

r("fajitas", "Kyllingfajitas med revet ost", 25, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/kylling-og-fjarkre/fajitas-med-revet-ost", TINE,
  ["kylling", "meksikansk", "fredagskos"], ["kyllingfilet", "tortilla"],
  [I("smor", 2, "ss", "smør"), I("kyllingfilet", 500, "g", "kyllingfilet i strimler"), I("gullok", 1, "stk", "løk"),
   I("paprika", 1, "stk", "stor paprika (stekes)"), I("tortilla", 8, "stk", "tortillalefser"), I("salsa", 1, "glass", "tomatsalsa", per=230),
   I("revetost", 2, "dl", "revet ost", per=40), I("romme", 1, "dl", "lettrømme", per=100), I("koriander", 1, "stk", "koriander", per=0.5),
   I("chilipulver", 2, "ts", "chilipulver, røkt paprika, spisskummen, hvitløkspulver, salt og litt sukker")],
  ["Sett ovnen på 175 °C.", "Brun kyllingen i smør.",
   "Bland krydderet, og ha det i pannen med løk og paprika. Småkok under lokk ca. 5 min.",
   "Varm tortillaene i folie i ovnen ca. 10 min.", "Fyll lefsene og topp med salsa, ost, rømme og koriander."])

r("kyllingburger", "Kyllingburger med salat", 30, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/kylling-og-fjarkre/kyllingburger-med-salat", TINE,
  ["kylling", "fredagskos"], ["kyllingdeig", "hamburgerbrod"],
  [I("olje", 2, "ts", "olje"), I("kyllingdeig", 400, "g", "kyllingkjøttdeig"), I("gullok", 1, "stk", "løk (halvparten i farsen, halvparten i ringer)"),
   I("egg", 1, "stk", "egg"), I("hamburgerbrod", 4, "stk", "hamburgerbrød"), I("bladsalat", 1, "pose", "salat", per=150),
   I("tomat", 1, "stk", "tomat i skiver"), I("revetost", 4, "skive", "ost", per=15), I("majones", 4, "ss", "dressing (f.eks. sweet chili eller majones)", per=15),
   I("pommes", 600, "g", "pommes frites til")],
  ["Bland kyllingdeig, finhakket løk, ½ dl vann, egg, salt og pepper.", "Form burgere ca. 2 cm tykke.",
   "Stek 3–4 min per side på middels varme.", "Bygg burgerne med saus, salat, burger, løk, tomat og ost.",
   "Stek pommes frites i ovnen ved siden av."],
  note="Gulløk i stedet for rødløk. Pommes frites er lagt til som tilbehør.")

# ---------------- STORFE ----------------
r("taco", "Taco slik dere lager den", 25, 2.5,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/kjott/taco", TINE,
  ["kjott", "meksikansk", "fredagskos"], ["kjottdeig", "tortilla"],
  [I("kjottdeig", 400, "g", "kjøttdeig"), I("smor", 1, "ss", "smør"), I("tacokrydder", 1, "pose", "tacokrydder"),
   I("tortilla", 6, "stk", "tortilla"), I("tacoskjell", 6, "stk", "tacoskjell"), I("isberg", 0.5, "stk", "isbergsalat"),
   I("agurk", 0.5, "stk", "agurk"), I("mais", 1, "boks", "mais", per=300), I("revetost", 2, "dl", "revet ost", per=40),
   I("romme", 3, "dl", "rømme", per=100), I("tomat", 1, "stk", "tomat til salsa"), I("gullok", 1, "stk", "gulløk til salsa"),
   I("lime", 1, "stk", "lime til salsa")],
  ["Stek kjøttdeigen, ha i tacokrydder og vann etter posen og la det koke 2 min.",
   "Salsa: finhakk tomat og gulløk, press over lime og smak til med salt.",
   "Varm skjell og lefser i ovnen etter pakken.", "Kutt isberg og agurk, og sett alt på bordet."],
  note="Grunnoppskrift fra Tine. Tilbehøret og mengdene er slik dere selv lager taco.")

r("tacosalat", "Tacosalat", 30, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/kjott/tacosalat", TINE,
  ["kjott", "meksikansk", "rask"], ["kjottdeig", "nachochips"],
  [I("kjottdeig", 400, "g", "kjøttdeig"), I("tacokrydder", 1, "pose", "tacokrydder", per=0.5), I("smor", 1, "ss", "smør"),
   I("gullok", 0.5, "stk", "gulløk"), I("agurk", 0.5, "stk", "agurk"), I("tomat", 3, "stk", "tomat"), I("isberg", 0.5, "stk", "isbergsalat"),
   I("nachochips", 50, "g", "nachochips"), I("revetost", 100, "g", "revet ost"), I("romme", 1, "dl", "lettrømme", per=100),
   I("salsa", 1, "dl", "tomatsalsa", per=100)],
  ["Stek kjøttdeigen med tacokrydder i smør, 5–7 min.", "Skjær løk, agurk og tomat i biter, og riv salaten.",
   "Fordel salat, grønnsaker, kjøtt og nachos på tallerkenene.", "Server med ost, rømme og salsa."],
  note="Rå paprika er utelatt, og gulløk brukes i stedet for rødløk.")

r("tacospagetti", "Tacospagetti", 30, 4,
  "https://tine.no/oppskrifter/middag-og-hovedretter/pasta-og-ris/tacospagetti", TINE,
  ["kjott", "meksikansk", "pasta"], ["kjottdeig", "spaghetti"],
  [I("smor", 2, "ss", "smør"), I("kjottdeig", 600, "g", "kjøttdeig"), I("gullok", 1, "stk", "løk"), I("chili", 1, "stk", "rød chili"),
   I("mais", 100, "g", "mais"), I("spisskummen", 1, "ts", "spisskummen, malt koriander og paprikapulver"),
   I("spaghetti", 400, "g", "spaghetti"), I("tomat", 2, "stk", "tomat i terninger"), I("nachochips", 100, "g", "tortillachips"),
   I("romme", 2, "dl", "lettrømme", per=100), I("koriander", 1, "stk", "frisk koriander", per=0.25)],
  ["Brun kjøttdeigen i smør på høy varme.", "Ha i løk og chili og stek 2 min. Ha i mais, krydder, salt og 2 dl vann. Småkok 10 min.",
   "Kok spaghetti og vend den inn i sausen.", "Server med tomat, tortillachips, rømme og koriander."])

r("chili", "Chili con carne", 30, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/kjott/chili-con-carne", TINE,
  ["kjott", "meksikansk", "gryte", "budsjett"], ["kjottdeig", "kidneybonner"],
  [I("smor", 2, "ss", "smør"), I("kjottdeig", 500, "g", "kjøttdeig"), I("gullok", 2, "stk", "løk"), I("hvitlok", 2, "fedd", "hvitløk"),
   I("chilipulver", 1, "ts", "chilipulver"), I("oregano", 1, "ts", "oregano"), I("hakkedetomater", 2, "boks", "hermetiske tomater", per=400),
   I("kidneybonner", 2, "boks", "kidneybønner", per=410), I("paprika", 2, "stk", "paprika (kokes med)"),
   I("avokado", 2, "stk", "avokado til guacamole"), I("lime", 0.5, "stk", "lime"), I("nachochips", 1, "pose", "nachochips", per=200)],
  ["Brun kjøttdeig og løk i smør til det er smuldrete.", "Ha i hvitløk, chili, oregano og tomater, og småkok noen minutter.",
   "Rør inn bønner og hakket paprika, kok opp og smak til.", "Mos avokado med hvitløk og limesaft til guacamole.",
   "Server med guacamole og nachos."])

r("chiliexpress", "Chili con carne express", 30, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/kjott/chili-con-carne-express", TINE,
  ["kjott", "meksikansk", "gryte"], ["kjottdeig", "kidneybonner"],
  [I("kjottdeig", 400, "g", "kjøttdeig"), I("gullok", 1, "stk", "løk"), I("paprika", 1, "stk", "paprika (kokes med)"), I("hvitlok", 2, "fedd", "hvitløk"),
   I("smor", 2, "ss", "smør"), I("tomatpure", 1, "ss", "tomatpuré", per=15), I("roktpaprika", 2, "ts", "paprika, røkt paprika, spisskummen, koriander og kajenne"),
   I("hakkedetomater", 780, "g", "hakkede tomater"), I("kidneybonner", 1, "boks", "kidneybønner", per=410), I("nachochips", 200, "g", "tortillachips"),
   I("avokado", 1, "stk", "avokado"), I("varlok", 1, "bunt", "vårløk", per=0.5), I("cremefraiche", 3, "dl", "crème fraîche", per=100)],
  ["Brun kjøttdeigen i en varm panne og ha den i en gryte.", "Fres løk, paprika og hvitløk i smør, ha i tomatpuré, og bland med kjøttet.",
   "Ha i krydder, en klype sukker og tomatene, og så bønnene. Småkok.",
   "Server i boller med avokado, vårløk, tortillachips og crème fraîche."])

r("lasagne", "Lasagne", 60, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/pasta-og-ris/lasagne", TINE,
  ["kjott", "italiensk", "ovn", "comfort"], ["kjottdeig", "lasagneplater"],
  [I("lasagneplater", 8, "stk", "lasagneplater", per=20), I("melk", 5, "dl", "lettmelk", per=100), I("hvetemel", 3, "ss", "hvetemel"),
   I("revetost", 2, "dl", "revet ost", per=40), I("kjottdeig", 400, "g", "kjøttdeig"), I("gullok", 1, "stk", "løk"), I("smor", 1, "ss", "smør"),
   I("hvitlok", 2, "fedd", "hvitløk"), I("stangselleri", 2, "stilk", "stangselleri", per=0.2), I("gulrot", 1, "stk", "gulrot", per=GUL),
   I("hakkedetomater", 1, "boks", "hermetiske tomater", per=400), I("tomatpure", 3, "ss", "tomatpuré", per=15),
   I("basilikumtorket", 1.5, "ts", "tørket basilikum og timian")],
  ["Sett ovnen på 200 °C.", "Brun kjøttdeig og løk. Ha i selleri, revet gulrot, puré, tomater og krydder. Småkok ca. 15 min.",
   "Ostesaus: kok opp det meste av melken, visp inn resten ristet med melet, og rør inn osten.",
   "Legg lag med kjøttsaus, ostesaus og plater i en smurt form. Avslutt med saus og ost.",
   "Stek nederst i ovnen ca. 30 min."])

r("lasagnegronn", "Lasagne med kjøtt- og grønnsakssaus", 40, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/pasta-og-ris/lasagne-med-kjott-og-gronnsakssaus", TINE,
  ["kjott", "italiensk", "ovn", "comfort"], ["kjottdeig", "squash"],
  [I("smor", 2, "ss", "smør"), I("gullok", 1, "stk", "løk"), I("hvitlok", 2, "fedd", "hvitløk"), I("gulrot", 3, "stk", "gulrot", per=GUL),
   I("squash", 0.5, "stk", "squash"), I("tomatpure", 2, "ss", "tomatpuré", per=15), I("hakkedetomater", 1, "boks", "hermetiske tomater", per=400),
   I("kjottdeig", 400, "g", "kjøttdeig"), I("cremefraiche", 4, "dl", "crème fraîche", per=100), I("muskat", 0.25, "ts", "muskat"),
   I("revetost", 6, "dl", "revet ost", per=40), I("lasagneplater", 10, "stk", "lasagneplater", per=20),
   I("cherrytomat", 12, "stk", "cherrytomater til salat", per=CT), I("varlok", 1, "bunt", "vårløk", per=0.4)],
  ["Sett ovnen på 200 °C.", "Fres løk, hvitløk, gulrot og squash, ha i puré og tomater og kjør sausen glatt.",
   "Brun kjøttdeigen og bland den i sausen.", "Bland crème fraîche, muskat og ost.",
   "Legg lag med kjøttsaus, plater og ostesaus, og stek ca. 15 min. Server med tomat- og vårløksalat."])

r("pastaskruer", "Pastaskruer med kremet tomatsaus", 30, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/pasta-og-ris/pastaskruer-med-kremet-tomatsaus", TINE,
  ["kjott", "italiensk", "pasta", "budsjett"], ["karbonadedeig", "brokkoli"],
  [I("gullok", 1, "stk", "løk"), I("gulrot", 3, "stk", "gulrot", per=GUL), I("squash", 0.5, "stk", "squash"), I("smor", 3, "ss", "smør"),
   I("hvitlok", 1, "fedd", "hvitløk"), I("tomatpure", 2, "ss", "tomatpuré", per=15), I("hakkedetomater", 1, "boks", "hermetiske tomater", per=400),
   I("buljong", 2, "dl", "hønsebuljong", per=0.2), I("oregano", 1, "ts", "oregano"), I("karbonadedeig", 250, "g", "karbonadedeig"),
   I("cremefraiche", 2, "dl", "crème fraîche", per=100), I("pasta", 400, "g", "pastaskruer"), I("brokkoli", 1, "stk", "brokkoli"),
   I("revetost", 2, "dl", "revet ost", per=40)],
  ["Fres løk, revet gulrot og squash i smør. Ha i hvitløk, puré, tomater, buljong og krydder. Småkok 8–10 min.",
   "Kok pastaen, med brokkoli de siste 2 min.", "Brun kjøttdeigen i smør på høy varme.",
   "Kjør sausen glatt, rør inn kjøttet og crème fraîche.", "Server med revet ost."])

r("risottokjottdeig", "Risotto med kjøttdeig og tomat", 30, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/pasta-og-ris/risotto-med-kjottdeig-og-tomat", TINE,
  ["kjott", "italiensk", "comfort"], ["kjottdeig", "risottoris"],
  [I("gullok", 1, "stk", "løk"), I("hvitlok", 2, "fedd", "hvitløk"), I("smor", 2, "ss", "smør"), I("kjottdeig", 400, "g", "kjøttdeig"),
   I("risottoris", 3, "dl", "risottoris", per=90), I("tomatpure", 3, "ss", "tomatpuré", per=15), I("buljong", 1, "stk", "kjøttbuljong"),
   I("parmesan", 1, "dl", "revet parmesan", per=30), I("cherrytomat", 20, "stk", "cherrytomater", per=CT), I("ruccola", 2, "dl", "ruccola", per=15)],
  ["Fres løk og hvitløk i smør ca. 2 min. Ha i kjøttdeigen og brun den.", "Rør inn ris og tomatpuré.",
   "Løs buljongen i 6 dl vann, hell over og småkok ca. 20 min til risen er mør.",
   "Rør inn smør og parmesan. Server med cherrytomater og ruccola."])

r("burger", "Hjemmelaget burger", 25, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/kjott/hjemmelaget-burger", TINE,
  ["kjott", "fredagskos"], ["kjottdeig", "hamburgerbrod"],
  [I("kjottdeig", 400, "g", "kjøttdeig"), I("smor", 1, "ss", "smør"), I("lime", 0.5, "stk", "lime"), I("hvitlok", 1, "fedd", "hvitløk"),
   I("romme", 2, "dl", "lettrømme", per=100), I("sambal", 0.5, "ts", "sambal oelek"), I("gullok", 1, "stk", "løk i ringer"),
   I("hamburgerbrod", 4, "stk", "hamburgerbrød"), I("bladsalat", 8, "blad", "salatblader", per=10), I("revetost", 4, "skive", "ost", per=15),
   I("pommes", 600, "g", "pommes frites til")],
  ["Del kjøttet i fire, form flate burgere og krydre.", "Stek dem i smør ca. 3 min per side.",
   "Dressing: bland limeskall, hvitløk, rømme og sambal. Smak til.", "Varm brødene og bygg burgerne med salat, dressing, løk, burger og ost."],
  note="Syltet og rå paprika er utelatt, og gulløk brukes i stedet for rødløk. Pommes frites er lagt til.")

r("langpannepizza", "Langpannepizza med kjøttdeig", 20, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/pizza-og-pai/langpannepizza", TINE,
  ["kjott", "italiensk", "fredagskos"], ["kjottdeig", "pizzabunn"],
  [I("pizzabunn", 1, "pakke", "ferdig pizzabunn", per=1), I("pizzasaus", 2, "dl", "pizzasaus", per=100), I("kjottdeig", 400, "g", "kjøttdeig"),
   I("gullok", 1, "stk", "løk"), I("smor", 2, "ss", "smør"), I("revetost", 300, "g", "revet ost"), I("tomat", 3, "stk", "tomat"),
   I("oregano", 2, "ts", "oregano")],
  ["Sett ovnen på 250 °C og rull ut bunnen i en langpanne.", "Smør på pizzasaus.",
   "Brun kjøttdeig og løk i smør, krydre og fordel over. Topp med ost, tomat og oregano.",
   "Stek midt i ovnen ca. 10 min til osten er gyllen."])

r("kjottkaker", "Kjøttkaker i brun saus", 45, 3,
  "https://www.matoppskrift.no/artikkel/kjoettkaka-slaar-tilbake", "Matoppskrift.no",
  ["kjott", "norsk", "comfort"], ["kjottdeig", "poteter"],
  [I("kjottdeig", 500, "g", "kjøttdeig"), I("salt", 0.5, "ts", "salt"), I("potetmel", 1.5, "ts", "potetmel"), I("pepper", 1, "krm", "pepper og allehånde"),
   I("melk", 2.5, "dl", "melk", per=100), I("smor", 2, "ss", "smør til steking"), I("buljong", 5, "dl", "kraft eller buljong", per=0.2),
   I("hvetemel", 2.5, "ss", "hvetemel til sausen"), I("poteter", 8, "stk", "poteter", per=POT), I("gulrot", 3, "stk", "gulrot", per=GUL),
   I("tyttebaer", 1, "glass", "tyttebær", per=0.3)],
  ["Rør kjøttdeig med salt, potetmel og krydder, og spe med melken litt etter litt.", "Form kaker og brun dem i smør.",
   "Brun melet i stekefettet, spe med kraft til en jevn saus.", "La kakene trekke i sausen ca. 15 min.",
   "Kok poteter og gulrot, og server med tyttebær."],
  note="Kjøttkaker og saus fra kilden; poteter, gulrot og tyttebær er det vanlige tilbehøret Tine anbefaler.")

r("stroganoff", "Biff stroganoff", 30, 4,
  "https://www.matoppskrift.no/oppskrift/biff-stroganoff", "Matoppskrift.no",
  ["kjott", "gryte", "comfort"], ["biffstrimler", "gullok"],
  [I("biffstrimler", 500, "g", "biffkjøtt i strimler"), I("smor", 2, "ss", "smør"), I("gullok", 1, "stk", "løk"),
   I("tomatpure", 2, "ss", "tomatpuré", per=15), I("sitron", 1, "ts", "sitronsaft", per=0.1), I("matflote", 1.5, "dl", "fløte eller rømme", per=100),
   I("poteter", 4, "porsjon", "poteter", per=250), I("salt", None, "", "salt og pepper")],
  ["Brun kjøttstrimlene i smør og krydre.", "Ha i hakket løk og la den få farge.",
   "Rør inn tomatpuré og sitronsaft.", "Ha i fløten, legg på lokk og la det småkoke. Smak til.", "Server med poteter (eller ris)."])

r("lapskaus", "Lapskaus", 60, 5,
  "https://www.matoppskrift.no/oppskrift/lapskaus", "Matoppskrift.no",
  ["kjott", "norsk", "gryte", "comfort"], ["gryteskjott", "poteter"],
  [I("gryteskjott", 1000, "g", "storfekjøtt i terninger"), I("buljong", 2, "stk", "buljongterninger"), I("poteter", 12, "stk", "poteter", per=POT),
   I("gulrot", 3, "stk", "store gulrøtter", per=100), I("kalrot", 0.5, "stk", "kålrot"), I("sellerirot", 0.5, "stk", "liten sellerirot", per=0.5),
   I("purre", 1, "stk", "purre"), I("hodekal", 250, "g", "hodekål", per=1/1000), I("gullok", 1, "stk", "løk")],
  ["Skjær kjøttet i små terninger og kok opp med vann og buljong.", "Småkok til kjøttet er mørt, 20–30 min.",
   "Ha i poteter og grønnsaker i terninger.", "Kok til alt er mørt og smak til med salt og pepper.", "Server gjerne med flatbrød."])

# ---------------- FISK ----------------
r("fiskegrateng", "Fiskegrateng med makaroni", 45, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/fisk-og-skalldyr/fiskegrateng-med-makaroni", TINE,
  ["fisk", "norsk", "ovn", "comfort"], ["torsk", "makaroni"],
  [I("makaroni", 50, "g", "makaroni"), I("smor", 2, "ss", "smør"), I("hvetemel", 3, "ss", "hvetemel"), I("melk", 4, "dl", "lettmelk", per=100),
   I("egg", 1, "stk", "egg"), I("torsk", 400, "g", "torsk"), I("purre", 0.5, "stk", "purre"), I("paneringsmel", 5, "ss", "strøkavring", per=8),
   I("poteter", 6, "stk", "poteter til", per=POT), I("gulrot", 3, "stk", "gulrot til råkost", per=GUL)],
  ["Sett ovnen på 200 °C og kok makaronien.", "Lag hvit saus av smør, mel og melk. Krydre og rør inn egget.",
   "Del fisken i biter og bland med purre og makaroni i sausen.", "Ha i en form, dryss over kavring og stek ca. 30 min.",
   "Server med poteter og revet gulrot."],
  note="Poteter og revet gulrot er tilbehøret Tine foreslår.")

r("tacofisk", "Fisk med chips og tacosmak", 30, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/fisk-og-skalldyr/fisk-med-tacosmak", TINE,
  ["fisk", "meksikansk", "ovn"], ["torsk", "nachochips"],
  [I("smor", 1, "ss", "smør"), I("torsk", 600, "g", "torsk eller sei"), I("salt", 1, "ts", "salt"), I("matflote", 3, "dl", "matfløte", per=100),
   I("salsa", 0.5, "dl", "tacosaus", per=100), I("revetost", 2, "dl", "revet ost", per=40), I("nachochips", 15, "stk", "nachochips", per=3),
   I("ris", 3, "dl", "ris til", per=85), I("isberg", 0.5, "stk", "salat til")],
  ["Sett ovnen på 225 °C og smør en form.", "Legg fisken i porsjonsbiter i formen og strø over salt.",
   "Bland fløte, tacosaus og ost og hell over.", "Knus chipsen over og stek 20–25 min.", "Server med ris og salat."],
  note="Ris og salat er lagt til som tilbehør.")

r("seigrateng", "Seigrateng med tomat og purre", 35, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/fisk-og-skalldyr/seigrateng-med-tomat-og-purre", TINE,
  ["fisk", "ovn"], ["sei", "purre"],
  [I("poteter", 800, "g", "poteter"), I("brokkoli", 1, "stk", "brokkoli (i stedet for asparges)", per=0.8),
   I("cremefraiche", 3, "dl", "lett crème fraîche", per=100), I("melk", 2, "dl", "lettmelk", per=100), I("tomatpure", 4, "ss", "tomatpuré", per=15),
   I("oregano", 1, "ts", "oregano"), I("sei", 600, "g", "sei eller torsk"), I("cherrytomat", 12, "stk", "cherrytomater", per=CT),
   I("purre", 1, "stk", "purre")],
  ["Sett ovnen på 225 °C og kok potetene.", "Kok opp crème fraîche og melk, rør inn tomatpuré og krydre.",
   "Legg fisk, halverte tomater og purreringer i en form og hell over sausen.", "Stek ca. 25 min.", "Server med poteter og kokt brokkoli."],
  note="Asparges er byttet med brokkoli.")

r("laksegrateng", "Laksegrateng med poteter", 50, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/fisk-og-skalldyr/laksegrateng", TINE,
  ["fisk", "ovn", "comfort"], ["laks", "poteter"],
  [I("smor", 1, "ss", "smør"), I("poteter", 10, "stk", "poteter", per=POT), I("gullok", 1, "stk", "løk"), I("hvitlok", 3, "fedd", "hvitløk"),
   I("laks", 600, "g", "laksefilet"), I("melk", 4, "dl", "lettmelk", per=100), I("matflote", 2, "dl", "matfløte", per=100),
   I("dijon", 2, "ss", "dijonsennep"), I("egg", 2, "stk", "egg")],
  ["Sett ovnen på 175 °C og smør en form.", "Skjær poteter, løk og hvitløk i skiver og laksen i biter.",
   "Legg lagvis i formen og pepre mellom lagene.", "Visp melk, fløte, sennep og egg og hell over.",
   "Stek nederst i ovnen 35–40 min til potetene er møre."])

r("laksepasta", "Pasta med laks og erter", 15, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/pasta-og-ris/pasta-med-laks", TINE,
  ["fisk", "pasta", "superrask"], ["laks", "erter"],
  [I("pasta", 400, "g", "penne"), I("erter", 6, "dl", "frosne erter", per=65), I("laks", 4, "stk", "laksefilet", per=125),
   I("cremefraiche", 3, "dl", "lett crème fraîche", per=100), I("sitron", 0.5, "stk", "sitron")],
  ["Kok pastaen, og ha ertene i de siste 3 min.", "Stek laksen gyllen på begge sider, 6–7 min.",
   "Hell av vannet og rør crème fraîche inn i pastaen.", "Legg laksen på toppen og press over sitron."])

r("laksdill", "Laks med dillstuede poteter", 30, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/fisk-og-skalldyr/laks-med-dillstuede-poteter", TINE,
  ["fisk", "norsk"], ["laks", "dill"],
  [I("laks", 600, "g", "laks"), I("smor", 2, "ss", "smør"), I("agurk", 0.5, "stk", "agurk"), I("fennikel", 0.5, "stk", "fennikel"),
   I("sukkererter", 50, "g", "sukkererter"), I("sitron", 1, "stk", "sitron"), I("poteter", 700, "g", "poteter"),
   I("melk", 5, "dl", "melk", per=100), I("maizena", 1, "ss", "maizena"), I("dill", 1, "potte", "dill")],
  ["Skrell potetene og del dem i biter på 2–3 cm.", "Kok dem møre i melken, og jevn med maizena rørt ut i litt kald melk.",
   "Smak til med salt, pepper og sitron.", "Stek laksen i smør.", "Skjær agurk og fennikel tynt, del sukkerertene og vend inn dill i potetene."])

r("laksepler", "Laks med epler og purre i ovn", 25, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/fisk-og-skalldyr/laks-med-epler", TINE,
  ["fisk", "ovn"], ["laks", "eple"],
  [I("ris", 3, "dl", "ris", per=85), I("laks", 600, "g", "laksefilet"), I("purre", 1, "stk", "purre"), I("eple", 3, "stk", "eple"),
   I("smor", 1, "ss", "smør"), I("cremefraiche", 6, "dl", "lett crème fraîche", per=100), I("pesto", 2, "ss", "pesto", per=15),
   I("persille", 2, "dl", "hakket persille", per=0.5)],
  ["Sett ovnen på 225 °C og kok risen.", "Skjær laksen i terninger, purren i skiver og eplene i terninger.",
   "Bland i en smurt form og krydre.", "Rør pesto inn i crème fraîchen, hell over og stek 10–15 min.", "Dryss over persille."])

r("laksekarbonader", "Laksekarbonader med rømmesaus", 30, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/fisk-og-skalldyr/laksekarbonader-med-rommesaus", TINE,
  ["fisk", "norsk"], ["laks", "varlok"],
  [I("laks", 600, "g", "laksefilet"), I("egg", 1, "stk", "egg"), I("potetmel", 1, "ss", "potetmel"), I("varlok", 3, "stk", "vårløk", per=0.15),
   I("olje", 1, "ss", "olje"), I("basilikum", 1, "dl", "basilikum eller andre urter", per=0.5), I("romme", 3, "dl", "lettrømme", per=100),
   I("poteter", 8, "stk", "poteter til", per=POT), I("bladsalat", 1, "pose", "salat til", per=150)],
  ["Kjør laksen med egg og potetmel til en jevn farse i foodprosessor, og krydre.", "Vend inn hakket vårløk.",
   "Form karbonader og stek dem gjennom på middels varme.", "Varm rømmen og rør inn hakkede urter.", "Server med poteter og salat."],
  note="Poteter og salat er tilbehøret Tine foreslår.")

r("fiskegryte", "Hvit fiskegryte", 30, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/fisk-og-skalldyr/hvit-fiskegryte", TINE,
  ["fisk", "gryte", "norsk"], ["sei", "purre"],
  [I("purre", 2, "stk", "purre"), I("gullok", 1, "stk", "løk"), I("dill", 1, "potte", "dill", per=0.5), I("sei", 800, "g", "seifilet"),
   I("sitron", 1, "stk", "sitron"), I("smor", 2, "ss", "smør"), I("matflote", 3, "dl", "matfløte", per=100), I("buljong", 2, "stk", "fiskebuljong"),
   I("yoghurt", 4, "dl", "yoghurt naturell", per=100), I("baguette", 1, "stk", "brød til", per=1)],
  ["Skjær purre og løk tynt, hakk dill og del fisken i biter.", "Fres løk og purre mykt i smør.",
   "Ha i 2 dl vann, fløte og buljong, og småkok ca. 5 min.", "Rør inn yoghurt og dill, og smak til med sitron.",
   "Legg i fisken og sitronskiver og la det trekke 5–7 min. Server med brød."])

r("fiskeboller", "Fiskeboller i hvit saus", 30, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/fisk-og-skalldyr/fiskeboller-med-hvit-saus", TINE,
  ["fisk", "norsk", "budsjett"], ["fiskeboller", "gulrot"],
  [I("poteter", 8, "stk", "poteter", per=POT), I("gulrot", 4, "stk", "gulrot", per=GUL), I("smor", 2, "ss", "smør"), I("hvetemel", 3, "ss", "hvetemel"),
   I("melk", 2.5, "dl", "melk", per=100), I("muskat", 0.25, "ts", "muskat"), I("fiskeboller", 1, "boks", "fiskeboller")],
  ["Kok potetene, 20–30 min.", "Smelt smør, rør inn mel og spe med kraften fra boksen.",
   "Ha i melken, kok opp og la sausen småkoke ca. 5 min. Smak til med muskat, salt og pepper.",
   "Varm fiskebollene i sausen.", "Damp gulrotskivene ca. 5 min."])

r("fiskekakewrap", "Wraps med fiskekaker", 15, 4,
  "https://www.tine.no/oppskrifter/middag-og-hovedretter/fisk-og-skalldyr/wraps-med-fiskekake", TINE,
  ["fisk", "meksikansk", "superrask", "budsjett"], ["fiskekaker", "tortilla"],
  [I("fiskekaker", 4, "stk", "fiskekaker", per=75), I("smor", 1, "ss", "smør"), I("avokado", 2, "stk", "avokado"),
   I("gullok", 0.5, "stk", "gulløk"), I("cherrytomat", 16, "stk", "cherrytomater", per=CT), I("isberg", 1, "stk", "salat"),
   I("tortilla", 4, "stk", "store tortillalefser"), I("salsa", 4, "ss", "tacosaus", per=15), I("romme", 4, "ss", "lettrømme", per=15)],
  ["Skjær fiskekakene i strimler og stek dem i smør ca. 2 min.", "Del avokado i terninger, løk i strimler og tomatene i to.",
   "Legg salat, grønnsaker og fiskekaker på lefsene.", "Topp med tacosaus og rømme og rull sammen."],
  note="Rå paprika er utelatt, og gulløk brukes i stedet for rødløk.")
