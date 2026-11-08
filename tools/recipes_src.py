# Oppskriftsbibliotek for Ukas middager.
# Mengder er for ca. 2,5 porsjoner (to voksne, den ene spiser 1,5 porsjon).
# Hver ingrediens: (vare-id fra katalogen, mengde i varens enhet, tekst som vises).
# "key" = karakteristiske råvarer. Appen advarer hvis samme key-vare brukes to dager på rad.
# Tagger: comfort, italiensk, meksikansk, asiatisk, norsk, fisk, kylling, kjott, ovn, gryte, pasta, suppe, fredagskos, budsjett
# (superrask/rask legges til automatisk ut fra tid: <=20 min / <=30 min)

R = []
def r(id, name, minutes, tags, key, ing, steps):
    R.append(dict(id=id, name=name, minutes=minutes, tags=tags, key=key,
                  ing=[dict(p=p, a=a, t=t) for p, a, t in ing], steps=steps))

# ---------------- KYLLING ----------------
r("kyllingrisotto", "Kyllingrisotto med purre, sopp og parmesan", 40,
  ["italiensk", "kylling", "comfort"], ["kyllingfilet", "purre", "sjampinjong"],
  [("kyllingfilet", 500, "500 g kyllingfilet"), ("risottoris", 300, "3 dl risottoris"),
   ("purre", 0.5, "½ purre"), ("sjampinjong", 125, "125 g sjampinjong"), ("gullok", 1, "1 gulløk"),
   ("hvitlok", 1, "1 fedd hvitløk"), ("buljong", 2, "1 l buljong (2 terninger)"),
   ("parmesan", 50, "50 g parmesan"), ("smor", 30, "Smør")],
  ["Fres hakket gulløk, hvitløk og ½ purre i smør.",
   "Stek kylling i biter og soppen. Legg til side.",
   "Fres risen, tilsett varm buljong litt om gangen og rør i ca. 18 min.",
   "Vend inn kylling, sopp, parmesan og en klatt smør."])

r("tikkamasala", "Kylling tikka masala med ris", 30,
  ["asiatisk", "kylling", "gryte", "comfort"], ["kyllingfilet", "tikkasaus"],
  [("kyllingfilet", 600, "600 g kyllingfilet"), ("tikkasaus", 400, "1 glass tikka masala-saus"),
   ("matflote", 150, "1½ dl matlagingsfløte"), ("gullok", 1, "1 gulløk"), ("ris", 300, "3 dl ris"),
   ("spinat", 75, "½ pose babyspinat"), ("olje", 1, "Olje")],
  ["Kok risen.", "Stek kylling i biter og hakket løk i olje.",
   "Hell over saus og fløte, la småkoke 10 min.", "Vend inn spinaten til slutt. Server med ris."])

r("kyllingwok", "Kyllingwok med nudler og grønnsaker", 20,
  ["asiatisk", "kylling"], ["kyllingfilet", "wokgronnsaker"],
  [("kyllingfilet", 500, "500 g kyllingfilet"), ("nudler", 250, "1 pk eggnudler"),
   ("wokgronnsaker", 600, "1 pose wokgrønnsaker"), ("soyasaus", 40, "4 ss soyasaus"),
   ("hvitlok", 2, "2 fedd hvitløk"), ("ingefaer", 20, "2 cm ingefær"), ("honning", 1, "1 ss honning"), ("olje", 1, "Olje")],
  ["Kok nudlene etter pakken.", "Stek kylling i strimler på høy varme.",
   "Tilsett hvitløk, ingefær og grønnsakene, wok 4 min.",
   "Rør inn soyasaus og honning, vend inn nudlene."])

r("kyllingpasta", "Kremet kyllingpasta med spinat", 25,
  ["italiensk", "kylling", "pasta"], ["kyllingfilet", "spinat"],
  [("kyllingfilet", 500, "500 g kyllingfilet"), ("pasta", 350, "350 g penne"),
   ("matflote", 300, "3 dl matlagingsfløte"), ("spinat", 150, "1 pose babyspinat"),
   ("parmesan", 40, "40 g parmesan"), ("hvitlok", 2, "2 fedd hvitløk"), ("cherrytomat", 125, "½ boks cherrytomater")],
  ["Kok pastaen.", "Stek kylling i biter med hvitløk.",
   "Hell på fløte, la koke ut et par min. Vend inn spinat og halverte tomater.",
   "Bland med pastaen og parmesan."])

r("ovnskyllinglar", "Ovnsbakte kyllinglår med poteter og gulrot", 50,
  ["kylling", "ovn", "norsk", "comfort", "budsjett"], ["kyllingklubber", "gulrot"],
  [("kyllingklubber", 1000, "1 kg kyllingklubber"), ("poteter", 1000, "1 kg poteter"),
   ("gulrot", 400, "4 gulrøtter"), ("gullok", 1, "1 gulløk"), ("paprikapulver", 1, "Paprikapulver"),
   ("olje", 1, "Olje, salt og pepper"), ("romme", 150, "1½ dl rømme til dressing")],
  ["Del poteter, gulrot og løk i biter, vend i olje og salt.",
   "Krydre kyllingen med paprika, salt og pepper. Legg oppå.",
   "Stek 45 min på 220 °C.", "Server med rømme rørt med salt og pepper."])

r("kyllingfajitas", "Kyllingfajitas med stekt paprika", 25,
  ["meksikansk", "kylling", "fredagskos"], ["kyllingfilet", "tortilla"],
  [("kyllingfilet", 500, "500 g kyllingfilet"), ("tortilla", 8, "8 tortillas"),
   ("paprika", 2, "2 paprika (stekes)"), ("gullok", 1, "1 gulløk"), ("tacokrydder", 1, "1 pose tacokrydder"),
   ("romme", 150, "1½ dl rømme"), ("revetost", 100, "Revet ost"), ("isberg", 0.5, "½ isbergsalat")],
  ["Skjær kylling, paprika og løk i strimler.", "Stek kyllingen, tilsett paprika og løk.",
   "Rør inn tacokrydder og litt vann.", "Server i tortillas med salat, rømme og ost."])

r("kyllingsuppe", "Kyllingsuppe med grønnsaker", 30,
  ["kylling", "suppe", "comfort", "budsjett"], ["kyllingfilet", "gulrot", "purre"],
  [("kyllingfilet", 400, "400 g kyllingfilet"), ("gulrot", 300, "3 gulrøtter"), ("purre", 0.5, "½ purre"),
   ("poteter", 400, "4 poteter"), ("buljong", 3, "1,5 l buljong"), ("persille", 0.5, "Persille"), ("baguette", 1, "Baguette")],
  ["Kok opp buljongen.", "Tilsett potet og gulrot i terninger, kok 10 min.",
   "Tilsett kylling i biter og purre, kok 8 min.", "Smak til, dryss over persille. Server med baguette."])

r("kyllingkarri", "Kyllinggryte i karri med eple og ris", 30,
  ["kylling", "gryte", "norsk", "comfort", "budsjett"], ["kyllingfilet", "eple"],
  [("kyllingfilet", 600, "600 g kyllingfilet"), ("matflote", 300, "3 dl matlagingsfløte"), ("eple", 1, "1 eple"),
   ("gullok", 1, "1 gulløk"), ("karri", 1, "2 ts karri"), ("ris", 300, "3 dl ris"), ("erter", 150, "1 dl erter"), ("olje", 1, "Olje")],
  ["Kok risen.", "Stek kylling i biter og hakket løk, dryss over karri.",
   "Tilsett fløte og eple i terninger, la småkoke 10 min.", "Rør inn erter de siste minuttene."])

r("caesar", "Caesarsalat med kylling og krutonger", 20,
  ["kylling"], ["kyllingfilet", "romano"],
  [("kyllingfilet", 500, "500 g kyllingfilet"), ("romano", 2, "2 romanosalat"), ("caesardressing", 150, "1½ dl caesardressing"),
   ("krutonger", 1, "1 pose krutonger"), ("parmesan", 40, "40 g parmesan"), ("baguette", 1, "Baguette"), ("olje", 1, "Olje")],
  ["Stek kyllingfileten gjennom, ca. 6 min per side. Skjær i skiver.",
   "Riv salaten i biter.", "Vend salaten i dressing, topp med kylling, krutonger og parmesan.",
   "Server med varm baguette."])

r("kyllingburger", "Sprø kyllingburger med coleslaw", 30,
  ["kylling", "fredagskos", "comfort"], ["kyllingfilet", "hodekal"],
  [("kyllingfilet", 500, "500 g kyllingfilet"), ("hamburgerbrod", 3, "3 hamburgerbrød"),
   ("paneringsmel", 100, "1 dl paneringsmel"), ("egg", 1, "1 egg"), ("hodekal", 0.25, "¼ hodekål"),
   ("gulrot", 100, "1 gulrot"), ("majones", 80, "Majones"), ("pommes", 600, "Pommes frites"), ("olje", 1, "Olje")],
  ["Del fileten i 3 tynne biter. Vend i egg og paneringsmel.",
   "Stek pommes frites i ovnen.", "Stek kyllingen 4 min per side.",
   "Coleslaw: riv kål og gulrot, bland med majones.", "Bygg burgerne."])

r("teriyakikylling", "Teriyakikylling med ris og brokkoli", 25,
  ["asiatisk", "kylling"], ["kyllinglarfilet", "brokkoli"],
  [("kyllinglarfilet", 600, "600 g kyllinglårfilet"), ("teriyaki", 150, "1½ dl teriyakisaus"),
   ("ris", 300, "3 dl ris"), ("brokkoli", 1, "1 brokkoli"), ("varlok", 0.5, "Vårløk")],
  ["Kok risen.", "Stek kyllingen i biter til gyllen.",
   "Hell over teriyakisaus og la det koke inn 3 min.", "Damp brokkolien 4 min. Dryss over vårløk."])

r("quesadilla", "Kyllingquesadilla med salsa", 20,
  ["meksikansk", "kylling", "fredagskos"], ["kyllingfilet", "tortilla"],
  [("kyllingfilet", 400, "400 g kyllingfilet"), ("tortilla", 6, "6 tortillas"), ("revetost", 200, "200 g revet ost"),
   ("mais", 150, "½ boks mais"), ("tacokrydder", 1, "1 pose tacokrydder"), ("romme", 150, "Rømme"),
   ("tomat", 1, "1 tomat"), ("gullok", 0.5, "½ gulløk"), ("lime", 1, "1 lime")],
  ["Stek kylling i små biter med tacokrydder.", "Fordel kylling, mais og ost på halvparten av tortillaene, legg lokk på.",
   "Stek i tørr panne 2 min per side.", "Salsa: hakk tomat og løk, press over lime. Server med rømme."])

r("kyllingpizza", "Pizza med kylling, sopp og purre", 35,
  ["italiensk", "kylling", "fredagskos"], ["kyllingfilet", "sjampinjong", "purre"],
  [("kyllingfilet", 400, "Ca. 400 g kylling"), ("pizzabunn", 2, "2 pizzabunner"),
   ("hakkedetomater", 200, "½ boks hakkede tomater"), ("sjampinjong", 125, "125 g sjampinjong"),
   ("purre", 0.5, "½ purre"), ("revetost", 300, "1 pose revet ost"), ("hvitlok", 1, "Hvitløk"), ("oregano", 1, "Oregano, salt")],
  ["Stek kyllingen med hvitløk.", "Smør tomater med oregano og salt på bunnene.",
   "Fordel kylling, sopp, purre og ost.", "Stek 12–15 min på 225 °C."])

r("kyllinggrateng", "Kylling- og brokkoligrateng", 40,
  ["kylling", "ovn", "comfort"], ["kyllingfilet", "brokkoli"],
  [("kyllingfilet", 600, "600 g kyllingfilet"), ("brokkoli", 1, "1 brokkoli"), ("matflote", 300, "3 dl matlagingsfløte"),
   ("revetost", 150, "150 g revet ost"), ("ris", 250, "2½ dl ris"), ("hvitlok", 1, "1 fedd hvitløk"), ("buljong", 1, "1 buljongterning")],
  ["Kok risen.", "Brun kyllingbitene, legg i ildfast form med brokkolibuketter.",
   "Kok fløte med hvitløk og smuldret buljong, hell over.", "Dryss over ost, gratiner 20 min på 200 °C."])

r("ramen", "Rask ramen med kylling og egg", 25,
  ["asiatisk", "kylling", "suppe"], ["kyllinglarfilet", "nudler"],
  [("kyllinglarfilet", 400, "400 g kyllinglårfilet"), ("nudler", 250, "1 pk eggnudler"), ("buljong", 3, "1,5 l buljong"),
   ("soyasaus", 40, "4 ss soyasaus"), ("egg", 3, "3 egg"), ("ingefaer", 20, "Ingefær"), ("hvitlok", 2, "2 fedd hvitløk"),
   ("varlok", 1, "Vårløk"), ("sukkererter", 150, "Sukkererter")],
  ["Kok egg i 7 min, avkjøl og del i to.", "Kok buljong med soya, hvitløk og ingefær.",
   "Stek kyllingen gyllen, skjær i skiver.", "Kok nudler og sukkererter i buljongen 3 min.",
   "Server med kylling, egg og vårløk."])

r("kyllingwraps", "Kyllingwraps med rømmedressing", 20,
  ["kylling", "meksikansk"], ["kyllingfilet", "tortilla"],
  [("kyllingfilet", 500, "500 g kyllingfilet"), ("tortilla", 6, "6 tortillas"), ("isberg", 0.5, "½ isbergsalat"),
   ("tomat", 2, "2 tomater"), ("agurk", 0.5, "½ agurk"), ("romme", 200, "2 dl rømme"), ("hvitlok", 1, "1 fedd hvitløk"),
   ("paprikapulver", 1, "Paprikapulver")],
  ["Stek kyllingstrimler med paprikapulver, salt og pepper.", "Rør rømme med presset hvitløk og salt.",
   "Kutt salat, tomat og agurk.", "Fyll tortillaene og rull sammen."])

r("bbqklubber", "BBQ-kyllingklubber med mais og potetbåter", 45,
  ["kylling", "ovn", "fredagskos", "budsjett"], ["kyllingklubber", "maiskolber"],
  [("kyllingklubber", 1000, "1 kg kyllingklubber"), ("bbqsaus", 200, "2 dl BBQ-saus"), ("poteter", 1000, "1 kg poteter"),
   ("maiskolber", 3, "3 maiskolber"), ("smor", 20, "Smør"), ("olje", 1, "Olje"), ("hodekal", 0.25, "¼ hodekål til råkost"),
   ("majones", 60, "Majones")],
  ["Potetbåter og klubber i ovnen på 220 °C i 40 min.", "Pensle klubbene med BBQ-saus etter 25 min.",
   "Kok maiskolbene 8 min, server med smør.", "Råkost: riv kål og bland med litt majones."])

r("kremetkyllinggryte", "Kremet kyllinggryte med sopp og ris", 30,
  ["kylling", "gryte", "comfort"], ["kyllinglarfilet", "sjampinjong"],
  [("kyllinglarfilet", 600, "600 g kyllinglårfilet"), ("sjampinjong", 250, "250 g sjampinjong"),
   ("matflote", 300, "3 dl matlagingsfløte"), ("gullok", 1, "1 gulløk"), ("ris", 300, "3 dl ris"),
   ("timian", 1, "Timian"), ("buljong", 1, "1 buljongterning")],
  ["Kok risen.", "Brun kylling og sopp, tilsett hakket løk.",
   "Hell på fløte, smuldret buljong og timian.", "La småkoke 10 min."])

r("kyllingtortillagrateng", "Meksikansk tortillagrateng med kylling", 35,
  ["meksikansk", "kylling", "ovn", "comfort"], ["kyllingdeig", "tortilla"],
  [("kyllingdeig", 400, "400 g kyllingkjøttdeig"), ("tortilla", 6, "6 tortillas"), ("hakkedetomater", 400, "1 boks hakkede tomater"),
   ("kidneybonner", 410, "1 boks kidneybønner"), ("mais", 150, "½ boks mais"), ("tacokrydder", 1, "1 pose tacokrydder"),
   ("revetost", 200, "200 g revet ost"), ("romme", 150, "Rømme")],
  ["Brun kjøttdeigen med tacokrydder.", "Tilsett tomater, bønner og mais, kok 5 min.",
   "Lag lag med tortilla, fyll og ost i en form.", "Stek 20 min på 200 °C. Server med rømme."])

# ---------------- STORFE ----------------
r("burgere", "Storfeburgere med smeltet ost og pommes frites", 25,
  ["kjott", "fredagskos", "comfort"], ["kjottdeig", "hamburgerbrod"],
  [("kjottdeig", 400, "400 g storfekjøttdeig"), ("hamburgerbrod", 3, "3 hamburgerbrød"), ("revetost", 100, "Revet ost"),
   ("isberg", 0.5, "Isbergsalat"), ("tomat", 1, "1 tomat"), ("pommes", 700, "Pommes frites")],
  ["Form kjøttdeigen til 3 burgere.", "Stek pommes frites i ovnen etter posen.",
   "Stek burgerne 3–4 min per side, legg på revet ost mot slutten.", "Server i brød med isberg og tomat."])

r("taco", "Taco", 25,
  ["meksikansk", "kjott", "fredagskos"], ["kjottdeig", "tortilla"],
  [("kjottdeig", 400, "400 g kjøttdeig"), ("tortilla", 8, "Tortilla"), ("tacoskjell", 6, "Tacoskjell"),
   ("tacokrydder", 1, "Tacokrydder"), ("mais", 300, "1 boks mais"), ("romme", 200, "Rømme"), ("isberg", 0.5, "Isbergsalat"),
   ("agurk", 0.5, "Agurk"), ("revetost", 150, "Revet ost"), ("tomat", 1, "Salsa: 1 tomat"),
   ("gullok", 1, "Salsa: 1 gulløk"), ("lime", 1, "Salsa: 1 lime")],
  ["Brun kjøttdeigen med tacokrydder og litt vann.", "Salsa: finhakk tomat og gulløk, press over lime, salt.",
   "Kutt isberg og agurk.", "Server med tortilla, skjell, mais, rømme og ost."])

r("bolognese", "Spaghetti bolognese", 35,
  ["italiensk", "kjott", "pasta", "comfort", "budsjett"], ["kjottdeig", "hakkedetomater"],
  [("kjottdeig", 400, "400 g kjøttdeig"), ("spaghetti", 350, "350 g spaghetti"), ("hakkedetomater", 800, "2 bokser hakkede tomater"),
   ("tomatpure", 70, "½ tube tomatpuré"), ("gullok", 1, "1 gulløk"), ("gulrot", 100, "1 gulrot"), ("hvitlok", 2, "2 fedd hvitløk"),
   ("parmesan", 40, "Parmesan"), ("oregano", 1, "Oregano")],
  ["Fres finhakket løk, gulrot og hvitløk.", "Brun kjøttdeigen, tilsett tomatpuré.",
   "Hell på tomatene, oregano, salt og pepper. La småkoke 20 min.", "Kok spaghetti. Server med parmesan."])

r("lasagne", "Lasagne", 60,
  ["italiensk", "kjott", "ovn", "comfort"], ["kjottdeig", "lasagneplater"],
  [("kjottdeig", 400, "400 g kjøttdeig"), ("lasagneplater", 250, "½ pk lasagneplater"), ("hakkedetomater", 800, "2 bokser hakkede tomater"),
   ("gullok", 1, "1 gulløk"), ("hvitlok", 2, "2 fedd hvitløk"), ("melk", 500, "5 dl melk"), ("smor", 40, "40 g smør"),
   ("hvetemel", 40, "4 ss hvetemel"), ("revetost", 150, "150 g revet ost"), ("isberg", 0.5, "Salat ved siden av")],
  ["Lag kjøttsaus av løk, hvitløk, kjøttdeig og tomater. Kok 15 min.",
   "Hvit saus: smelt smør, rør inn mel, spe med melk og kok 5 min.",
   "Lag lag med plater, kjøttsaus og hvit saus. Topp med ost.", "Stek 35 min på 200 °C."])

r("chili", "Chili con carne med ris", 35,
  ["meksikansk", "kjott", "gryte", "budsjett"], ["kjottdeig", "kidneybonner"],
  [("kjottdeig", 400, "400 g kjøttdeig"), ("kidneybonner", 410, "1 boks kidneybønner"), ("hakkedetomater", 800, "2 bokser hakkede tomater"),
   ("gullok", 1, "1 gulløk"), ("paprika", 1, "1 paprika (kokes med)"), ("hvitlok", 2, "2 fedd hvitløk"),
   ("spisskummen", 1, "Spisskummen og chili"), ("ris", 300, "3 dl ris"), ("romme", 100, "Rømme")],
  ["Kok risen.", "Brun kjøttdeig med løk, hvitløk og paprika.",
   "Tilsett krydder, tomater og bønner. Kok 20 min.", "Server med ris og en klatt rømme."])

r("kjottboller", "Kjøttboller i tomatsaus med pasta", 35,
  ["italiensk", "kjott", "pasta", "comfort"], ["kjottdeig", "hakkedetomater"],
  [("kjottdeig", 400, "400 g kjøttdeig"), ("egg", 1, "1 egg"), ("paneringsmel", 50, "½ dl paneringsmel"),
   ("hakkedetomater", 800, "2 bokser hakkede tomater"), ("gullok", 1, "1 gulløk"), ("hvitlok", 2, "2 fedd hvitløk"),
   ("pasta", 350, "350 g penne"), ("parmesan", 40, "Parmesan"), ("oregano", 1, "Oregano")],
  ["Bland kjøttdeig, egg, paneringsmel, salt og pepper. Trill små boller.",
   "Brun bollene i en panne.", "Tilsett løk, hvitløk og tomater. La småkoke 15 min.",
   "Kok pasta og server med parmesan."])

r("kjottkaker", "Hjemmelagde kjøttkaker i brun saus med potetmos", 50,
  ["kjott", "norsk", "comfort"], ["kjottdeig", "poteter"],
  [("kjottdeig", 400, "400 g kjøttdeig"), ("egg", 1, "1 egg"), ("gullok", 1, "1 gulløk"), ("poteter", 1000, "1 kg poteter"),
   ("melk", 200, "2 dl melk"), ("smor", 40, "Smør"), ("brunsaus", 1, "1 pose brun saus"), ("erter", 200, "Erter"),
   ("gulrot", 200, "2 gulrøtter")],
  ["Bland kjøttdeig, egg, revet løk, salt og pepper. Form kaker og brun dem.",
   "Lag brun saus, la kakene trekke i sausen 15 min.", "Kok poteter, mos med smør og varm melk.",
   "Kok gulrot og erter. Server alt sammen."])

r("stroganoff", "Biff stroganoff med ris", 30,
  ["kjott", "gryte", "comfort"], ["biffstrimler", "sjampinjong"],
  [("biffstrimler", 400, "400 g biffstrimler"), ("sjampinjong", 250, "250 g sjampinjong"), ("gullok", 1, "1 gulløk"),
   ("matflote", 300, "3 dl matlagingsfløte"), ("tomatpure", 30, "2 ss tomatpuré"), ("paprikapulver", 1, "Paprikapulver"),
   ("ris", 300, "3 dl ris"), ("sennep", 1, "1 ts sennep")],
  ["Kok risen.", "Brun biffen raskt på høy varme, ta ut.", "Stek sopp og løk, rør inn tomatpuré og paprika.",
   "Hell på fløte og sennep, kok 5 min. Vend inn biffen."])

r("entrecote", "Entrecôte med stekte poteter og bearnaise", 35,
  ["kjott", "fredagskos"], ["entrecote", "smapoteter"],
  [("entrecote", 400, "2 entrecôte"), ("smapoteter", 700, "700 g småpoteter"), ("bearnaise", 250, "1 bearnaisesaus"),
   ("cherrytomat", 250, "Cherrytomater"), ("romano", 1, "Salat"), ("smor", 20, "Smør"), ("olje", 1, "Olje")],
  ["Kok potetene nesten møre, del og stek gylne i smør.", "Ta kjøttet ut av kjøleskapet 30 min før.",
   "Stek entrecôten 2–3 min per side, la hvile 5 min.", "Varm bearnaisen. Server med salat og tomater."])

r("shepherdspie", "Shepherd's pie med potetmos", 55,
  ["kjott", "ovn", "comfort"], ["kjottdeig", "poteter"],
  [("kjottdeig", 400, "400 g kjøttdeig"), ("poteter", 1000, "1 kg poteter"), ("gulrot", 200, "2 gulrøtter"),
   ("gullok", 1, "1 gulløk"), ("erter", 150, "Erter"), ("tomatpure", 40, "Tomatpuré"), ("buljong", 1, "1 buljongterning"),
   ("melk", 150, "1½ dl melk"), ("smor", 30, "Smør"), ("revetost", 100, "Revet ost")],
  ["Kok poteter og mos med smør og melk.", "Brun kjøttdeig med løk og gulrot, tilsett puré, buljong og litt vann.",
   "Kjøttfyll i form, erter over, mos på toppen.", "Dryss ost og stek 25 min på 200 °C."])

r("burritobowl", "Burrito bowl med kjøttdeig", 25,
  ["meksikansk", "kjott"], ["kjottdeig", "avokado"],
  [("kjottdeig", 400, "400 g kjøttdeig"), ("ris", 300, "3 dl ris"), ("kidneybonner", 410, "1 boks kidneybønner"),
   ("mais", 150, "½ boks mais"), ("avokado", 2, "2 avokado"), ("tomat", 2, "2 tomater"), ("lime", 1, "1 lime"),
   ("romme", 150, "Rømme"), ("tacokrydder", 1, "Tacokrydder"), ("isberg", 0.5, "Isberg")],
  ["Kok risen.", "Stek kjøttdeigen med tacokrydder, varm bønnene.",
   "Hakk tomat og avokado, press over lime.", "Bygg bollene: ris, kjøtt, bønner, mais, salat, avokado og rømme."])

r("lapskaus", "Lapskaus med storfekjøtt", 75,
  ["kjott", "norsk", "gryte", "comfort"], ["gryteskjott", "poteter"],
  [("gryteskjott", 500, "500 g gryteskjøtt"), ("poteter", 800, "800 g poteter"), ("gulrot", 300, "3 gulrøtter"),
   ("purre", 0.5, "½ purre"), ("gullok", 1, "1 gulløk"), ("buljong", 2, "1 l buljong"), ("baguette", 1, "Brød til")],
  ["Brun kjøttet i biter, tilsett løk og buljong. Kok 30 min.",
   "Tilsett poteter og gulrot i terninger, kok 25 min.", "Tilsett purre de siste 10 min.",
   "Rør godt så litt av potetene moses. Smak til."])

r("karbonader", "Karbonader med løk, poteter og grønnsaker", 30,
  ["kjott", "norsk", "budsjett"], ["karbonadedeig", "gullok"],
  [("karbonadedeig", 400, "400 g karbonadedeig"), ("gullok", 2, "2 gulløk"), ("poteter", 800, "800 g poteter"),
   ("brokkoli", 1, "1 brokkoli"), ("brunsaus", 1, "Brun saus"), ("smor", 20, "Smør")],
  ["Kok potetene.", "Form 4 karbonader, stek 4 min per side.",
   "Stek løk i båter mykt i smør.", "Lag brun saus. Server med brokkoli."])

r("kjottdeigpasta", "Kremet kjøttdeigpasta", 25,
  ["kjott", "pasta", "budsjett"], ["kjottdeig", "matflote"],
  [("kjottdeig", 400, "400 g kjøttdeig"), ("pasta", 350, "350 g penne"), ("matflote", 300, "3 dl matlagingsfløte"),
   ("tomatpure", 40, "Tomatpuré"), ("gullok", 1, "1 gulløk"), ("spinat", 75, "½ pose spinat"), ("revetost", 80, "Revet ost")],
  ["Kok pastaen.", "Brun kjøttdeig og løk, rør inn tomatpuré.",
   "Hell på fløte, kok 5 min, vend inn spinat.", "Bland med pasta og ost."])

r("biffbrokkoli", "Biff og brokkoli i wok", 20,
  ["asiatisk", "kjott"], ["biffstrimler", "brokkoli"],
  [("biffstrimler", 400, "400 g biffstrimler"), ("brokkoli", 1, "1 brokkoli"), ("soyasaus", 40, "4 ss soyasaus"),
   ("honning", 1, "1 ss honning"), ("hvitlok", 2, "2 fedd hvitløk"), ("ingefaer", 20, "Ingefær"), ("ris", 300, "3 dl ris"), ("olje", 1, "Olje")],
  ["Kok risen.", "Wok biffen raskt på høy varme, ta ut.",
   "Wok brokkoli med hvitløk og ingefær 3 min.", "Tilsett biff, soya og honning, vend rundt."])

r("kjottdeigpizza", "Hjemmelaget pizza med kjøttdeig", 35,
  ["italiensk", "kjott", "fredagskos"], ["kjottdeig", "pizzabunn"],
  [("kjottdeig", 300, "300 g kjøttdeig"), ("pizzabunn", 2, "2 pizzabunner"), ("hakkedetomater", 200, "½ boks hakkede tomater"),
   ("revetost", 300, "1 pose revet ost"), ("paprika", 1, "1 paprika (stekes på pizzaen)"), ("gullok", 0.5, "½ gulløk"),
   ("oregano", 1, "Oregano")],
  ["Brun kjøttdeigen med salt og pepper.", "Smør tomater med oregano på bunnene.",
   "Fordel kjøtt, paprika, løk og ost.", "Stek 12–15 min på 225 °C."])

r("kjottdeiggryte", "Kjøttdeiggryte med poteter", 35,
  ["kjott", "gryte", "budsjett", "comfort"], ["kjottdeig", "poteter"],
  [("kjottdeig", 400, "400 g kjøttdeig"), ("poteter", 600, "600 g poteter"), ("gulrot", 200, "2 gulrøtter"),
   ("gullok", 1, "1 gulløk"), ("hakkedetomater", 400, "1 boks hakkede tomater"), ("matflote", 150, "1½ dl fløte"),
   ("paprikapulver", 1, "Paprikapulver"), ("baguette", 1, "Brød til")],
  ["Brun kjøttdeig og løk.", "Tilsett potet og gulrot i terninger, tomater og paprika.",
   "Kok under lokk 20 min.", "Rør inn fløte, smak til."])

# ---------------- FISK ----------------
r("laks", "Ovnsbakt laks med ovnspoteter, brokkoli og sitronrømme", 35,
  ["fisk", "ovn", "norsk"], ["laks", "brokkoli"],
  [("laks", 500, "500 g laks"), ("poteter", 1000, "1 kg poteter"), ("brokkoli", 1, "1 brokkoli"), ("agurk", 0.5, "½ agurk"),
   ("sitron", 1, "1 sitron"), ("romme", 100, "1 dl rømme"), ("olje", 1, "Olje, salt og pepper")],
  ["Del potetene i båter, vend i olje og salt. Bak 35 min på 220 °C.",
   "Legg laksen i en form med salt, pepper og sitronskiver. Sett inn de siste 15 min.",
   "Kok brokkolien i 4 min.", "Skjær ½ agurk i biter.", "Rør rømme med sitronsaft og salt."])

r("teriyakilaks", "Teriyakilaks med ris og sukkerert", 25,
  ["fisk", "asiatisk"], ["laks", "sukkererter"],
  [("laks", 500, "500 g laks"), ("teriyaki", 120, "1 dl teriyakisaus"), ("ris", 300, "3 dl ris"),
   ("sukkererter", 150, "Sukkererter"), ("varlok", 0.5, "Vårløk"), ("lime", 1, "1 lime")],
  ["Kok risen.", "Pensle laksen med teriyaki, stek 15 min på 200 °C.",
   "Damp sukkerertene 2 min.", "Server med vårløk og limebåter."])

r("fiskegrateng", "Fiskegrateng med makaroni", 50,
  ["fisk", "ovn", "norsk", "comfort"], ["torsk", "makaroni"],
  [("torsk", 500, "500 g torsk"), ("makaroni", 200, "2 dl makaroni"), ("melk", 500, "5 dl melk"), ("smor", 40, "Smør"),
   ("hvetemel", 40, "4 ss mel"), ("egg", 2, "2 egg"), ("revetost", 100, "Revet ost"), ("paneringsmel", 30, "Paneringsmel"),
   ("gulrot", 300, "Råkost: 3 gulrøtter")],
  ["Kok makaroni. Tin og del fisken i biter.", "Lag hvit saus av smør, mel og melk. Avkjøl litt, rør inn eggene.",
   "Lag lag med makaroni, fisk og saus i form.", "Topp med ost og paneringsmel. Stek 30 min på 200 °C.",
   "Server med revet gulrot."])

r("torskgulrot", "Torsk med smørdampede grønnsaker og poteter", 30,
  ["fisk", "norsk"], ["torsk", "gulrot"],
  [("torsk", 500, "500 g torsk"), ("poteter", 800, "800 g poteter"), ("gulrot", 300, "3 gulrøtter"),
   ("purre", 0.5, "½ purre"), ("smor", 50, "Smør"), ("persille", 0.5, "Persille"), ("sitron", 1, "Sitron")],
  ["Kok potetene.", "Legg torsken i form, salt og smørklatter. Stek 15 min på 200 °C.",
   "Damp gulrot og purre i smør og litt vann 6 min.", "Server med smeltet smør, persille og sitron."])

r("fiskesuppe", "Kremet fiskesuppe", 30,
  ["fisk", "suppe", "comfort", "norsk"], ["laks", "torsk", "purre"],
  [("laks", 250, "250 g laks"), ("torsk", 250, "250 g torsk"), ("gulrot", 200, "2 gulrøtter"), ("purre", 0.5, "½ purre"),
   ("poteter", 300, "3 poteter"), ("matflote", 300, "3 dl fløte"), ("buljong", 2, "1 l fiskebuljong"), ("baguette", 1, "Baguette")],
  ["Kok buljong med potet og gulrot i terninger, 10 min.", "Tilsett purre og fløte.",
   "Legg i fisken i biter, trekk 5 min uten å koke.", "Smak til. Server med baguette."])

r("fishtacos", "Fish tacos med torsk og lime", 25,
  ["fisk", "meksikansk", "fredagskos"], ["torsk", "tortilla"],
  [("torsk", 500, "500 g torsk"), ("tortilla", 8, "8 små tortillas"), ("hodekal", 0.25, "¼ hodekål"), ("lime", 2, "2 lime"),
   ("romme", 200, "2 dl rømme"), ("avokado", 2, "2 avokado"), ("paprikapulver", 1, "Paprikapulver"), ("paneringsmel", 80, "Paneringsmel")],
  ["Vend fisken i paneringsmel med paprika og salt, stek gyllen.", "Strimle kålen, vend i limesaft og salt.",
   "Rør rømme med lime.", "Fyll tortillas med fisk, kål, avokado og rømme."])

r("laksepasta", "Laksepasta med spinat og fløte", 20,
  ["fisk", "pasta", "italiensk"], ["laks", "spinat"],
  [("laks", 400, "400 g laks"), ("pasta", 350, "350 g pasta"), ("matflote", 300, "3 dl matlagingsfløte"),
   ("spinat", 150, "1 pose spinat"), ("sitron", 1, "1 sitron"), ("hvitlok", 1, "1 fedd hvitløk"), ("parmesan", 30, "Parmesan")],
  ["Kok pastaen.", "Stek laks i terninger forsiktig, ta ut.",
   "Kok fløte med hvitløk og sitronskall 3 min, vend inn spinat.", "Bland pasta, laks og saus. Topp med parmesan."])

r("fiskekaker", "Fiskekaker med poteter og råkost", 25,
  ["fisk", "norsk", "budsjett"], ["fiskekaker", "gulrot"],
  [("fiskekaker", 600, "1 pk fiskekaker"), ("poteter", 800, "800 g poteter"), ("gulrot", 300, "3 gulrøtter"),
   ("eple", 1, "1 eple"), ("sitron", 1, "Sitron"), ("smor", 20, "Smør")],
  ["Kok potetene.", "Stek fiskekakene i smør, 3 min per side.",
   "Råkost: riv gulrot og eple, press over sitron.", "Server med smeltet smør."])

r("rekepasta", "Pasta med reker, hvitløk og chili", 20,
  ["fisk", "pasta", "italiensk"], ["reker", "spaghetti"],
  [("reker", 250, "250 g reker"), ("spaghetti", 350, "350 g spaghetti"), ("hvitlok", 3, "3 fedd hvitløk"),
   ("chiliflak", 1, "Chiliflak"), ("cherrytomat", 250, "Cherrytomater"), ("persille", 0.5, "Persille"),
   ("sitron", 1, "1 sitron"), ("olje", 1, "Olivenolje"), ("parmesan", 30, "Parmesan")],
  ["Kok spaghetti.", "Fres hvitløk og chili i olje, tilsett halverte tomater.",
   "Tilsett reker, varm 2 min.", "Vend inn pasta, sitron og persille."])

r("pestolaks", "Pestolaks med ovnsgrønnsaker", 30,
  ["fisk", "ovn", "italiensk"], ["laks", "squash"],
  [("laks", 500, "500 g laks"), ("pesto", 95, "½ glass pesto"), ("squash", 1, "1 squash"), ("cherrytomat", 250, "Cherrytomater"),
   ("smapoteter", 700, "700 g småpoteter"), ("gullok", 1, "1 gulløk"), ("olje", 1, "Olje")],
  ["Halver småpotetene, stek 15 min på 220 °C.", "Tilsett squash, løk og tomater.",
   "Smør pesto på laksen, legg oppå.", "Stek videre 15 min."])

r("tunfiskpasta", "Tunfiskpasta med tomat", 20,
  ["fisk", "pasta", "budsjett"], ["tunfisk", "hakkedetomater"],
  [("tunfisk", 370, "2 bokser tunfisk"), ("pasta", 350, "350 g pasta"), ("hakkedetomater", 400, "1 boks hakkede tomater"),
   ("gullok", 1, "1 gulløk"), ("hvitlok", 2, "2 fedd hvitløk"), ("oregano", 1, "Oregano"), ("revetost", 80, "Revet ost")],
  ["Kok pastaen.", "Fres løk og hvitløk, tilsett tomater og oregano, kok 8 min.",
   "Vend inn tunfisken.", "Bland med pasta og topp med ost."])

r("lakseburger", "Lakseburger med agurksalat", 25,
  ["fisk", "fredagskos"], ["laks", "hamburgerbrod"],
  [("laks", 500, "500 g laks"), ("hamburgerbrod", 3, "3 hamburgerbrød"), ("egg", 1, "1 egg"), ("paneringsmel", 40, "Paneringsmel"),
   ("agurk", 1, "1 agurk"), ("romme", 150, "Rømme"), ("sitron", 1, "Sitron"), ("isberg", 0.5, "Isberg"), ("pommes", 600, "Pommes frites")],
  ["Hakk laksen grovt, bland med egg, paneringsmel, salt og pepper.", "Form 3 burgere, stek 3–4 min per side.",
   "Stek pommes frites i ovnen.", "Agurksalat: tynne skiver agurk med litt sitron og salt.",
   "Server i brød med rømme og salat."])

r("rekewok", "Rekewok med nudler", 20,
  ["fisk", "asiatisk"], ["reker", "wokgronnsaker"],
  [("reker", 250, "250 g reker"), ("nudler", 250, "1 pk eggnudler"), ("wokgronnsaker", 600, "1 pose wokgrønnsaker"),
   ("soyasaus", 40, "Soyasaus"), ("hvitlok", 2, "Hvitløk"), ("ingefaer", 20, "Ingefær"), ("lime", 1, "Lime"), ("olje", 1, "Olje")],
  ["Kok nudlene.", "Wok grønnsaker med hvitløk og ingefær 4 min.",
   "Tilsett reker og soyasaus, varm gjennom.", "Vend inn nudler, press over lime."])

r("kyllingsotpotet", "Kyllinglår med søtpotet og salatost i ovn", 40,
  ["kylling", "ovn"], ["kyllinglarfilet", "sotpotet"],
  [("kyllinglarfilet", 600, "600 g kyllinglårfilet"), ("sotpotet", 1000, "2 søtpoteter"), ("gullok", 1, "1 gulløk"),
   ("salatost", 100, "½ pk salatost"), ("spinat", 75, "½ pose spinat"), ("olje", 1, "Olje"), ("paprikapulver", 1, "Paprikapulver")],
  ["Skjær søtpotet og løk i biter, vend i olje og salt.", "Krydre kyllingen med paprika, legg oppå.",
   "Stek 30 min på 220 °C.", "Vend inn spinat og smuldre salatost over før servering."])
