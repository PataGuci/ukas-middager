# Matlagingssteg for hver oppskrift: (tittel, tekst, minutter for nedtelling eller None).
# {vare-id} i teksten byttes i appen ut med mengde og navn for valgt antall porsjoner,
# f.eks. "{kyllingfilet}" -> "375 g kyllingfilet i terninger".
# Stegene er korte oppsummeringer med egne ord; originalen ligger bak kildelenken.

S = {}

S["ovnsrisotto"] = [
 ("Forbered", "Sett ovnen på 225 °C og kok opp {buljong}.", None),
 ("Brun kylling og sopp", "Brun {kyllingfilet} raskt i {smor} på høy varme. Ha i {sjampinjong} og stek et par minutter til.", 4),
 ("Fres risen", "Rør inn {risottoris}, {hvitlok} og {rosmarin}. Krydre med salt og pepper og la det frese 1–2 minutter.", 2),
 ("Inn i ovnen", "Ha alt i en ildfast form, hell over buljongen og rør inn {erter}. Dekk med folie og stek.", 25),
 ("Gjør ferdig", "Rør inn {kremost}. Vend {spinat} i {olje} og saften av {sitron}, og server ved siden av.", None)]

S["kyllingsopppasta"] = [
 ("Kok pastaen", "Kok {pasta} etter anvisningen på pakken.", 10),
 ("Brun kyllingen", "Skjær {kyllingfilet} i små biter og brun dem i {smor}.", 4),
 ("Grønnsakene", "Ha i hakket {gullok}, {brokkoli} i små buketter og {sjampinjong}. Stek til kyllingen er gjennomstekt.", 6),
 ("Sausen", "Rør inn {cremefraiche} og vend sausen sammen med pastaen.", None)]

S["urtepasta"] = [
 ("Kok pastaen", "Kok {pasta} etter anvisningen på pakken.", 10),
 ("Stek kyllingen", "Del {kyllingfilet} i biter og stek i {smor} til gjennomstekt. Krydre med salt og pepper.", 5),
 ("Lag sausen", "Grovhakk {hvitlok} og bland med {cremefraiche} og hakkede urter fra {basilikum}. Smak til.", None),
 ("Bland og server", "Vend kylling og saus inn i den varme pastaen. Strø over {revetost} og server med {ruccola}.", None)]

S["spinatlasagne"] = [
 ("Forbered", "Sett ovnen på 225 °C.", None),
 ("Stek kyllingen", "Stek {kyllingfilet} i {smor} og krydre med {grillkrydder}.", 5),
 ("Spinaten", "Stek {spinat} i litt smør til væsken har kokt bort.", 3),
 ("Sausen", "Kok {matflote} og {eplejuice}. Jevn med {maizena} om den er tynn.", 5),
 ("Bygg og stek", "Legg lag med {lasagneplater}, kylling, spinat, {revetost} og saus. Avslutt med saus og ost, og stek.", 20)]

S["franskkylling"] = [
 ("Kok risen", "Kok {ris} etter pakken.", 15),
 ("Stek kyllingen", "Del {kyllingfilet} i 4–5 biter hver, krydre og stek i {smor}.", 5),
 ("Sausen", "Ha i {kremost}, deretter {cremefraiche} og 1 dl vann. La det småkoke et minutt.", 1),
 ("Gjør ferdig", "Vend inn hakkede {cherrytomat} og {timian}, og varm gjennom.", None)]

S["kyllingsuppekremet"] = [
 ("Smørbolle", "Smelt {smor} og rør inn {hvetemel}. Sett til side.", None),
 ("Fres grønnsakene", "Fres {gullok}, {gulrot}, {stangselleri}, {purre} og {hvitlok} i {olje}. Rør inn smørbollen.", 5),
 ("Kok suppen", "Ha i {buljong}, {laurbaer}, {rosmarin} og {cremefraiche}. Småkok.", 12),
 ("Kyllingen", "Ha i {kyllingfilet} i biter og la den koke gjennom. Smak til.", 8),
 ("Server", "Server med {revetost} og ristet {baguette}.", None)]

S["kyllingsuppekarri"] = [
 ("Stek kyllingen", "Skjær {kyllingfilet} i biter og stek gylne i {smor}.", 5),
 ("Grønnsaker og karri", "Grovhakk {gullok}, {gulrot} og {sjampinjong} og stek med kyllingen. Ha i {karri}.", 3),
 ("Kok suppen", "Ha i {buljong}, {matflote}, {persille} og {mais}. Småkok.", 10),
 ("Server", "Server med en skje {cremefraiche} på toppen og {baguette} ved siden av.", None)]

S["hotkylling"] = [
 ("Kok risen", "Kok {ris} etter pakken.", 15),
 ("Brun kyllingen", "Skjær {kyllingfilet} i strimler og brun med revet {gulrot} i {smor}. Salt.", 5),
 ("Krydder og saus", "Ha i {hvitlok}, {tomatpure}, {garammasala}, ½ dl vann og {cremefraiche}. Småkok.", 5),
 ("Server", "Dryss over {koriander}.", None)]

S["indiskkylling"] = [
 ("Fres smakene", "Fres {gullok}, {hvitlok}, {chili} og {ingefaer} mykt i {smor}.", 3),
 ("Brun kyllingen", "Ha i {kyllingfilet} i biter og stek til de får litt farge.", 2),
 ("Krydderet", "Dryss over {garammasala} og fres et par minutter.", 2),
 ("Småkok", "Ha i {hakkedetomater} og {kokosmelk}. Småkok under lokk. Kok {ris} imens.", 30),
 ("Server", "Rør inn halvparten av {yoghurt} og {cashew}. Server med ris, {mangochutney} og resten av yoghurten.", None)]

S["orientalskkylling"] = [
 ("Forbered", "Sett ovnen på 200 °C og kok {ris}.", None),
 ("Brun kyllingen", "Brun {kyllingfilet} hele i {smor}, del dem og legg i en ildfast form. Strø over {paprika} i strimler.", 5),
 ("Kremen", "Pisk {kremflote} nesten stiv og rør inn {hvitlok}, {karri}, {mangochutney} og {sambal}. Fordel over kyllingen.", None),
 ("Stek", "Stek i ovnen.", 20),
 ("Server", "Rist {mandelflak} i en tørr panne og strø over.", None)]

S["stektenudler"] = [
 ("Kok nudlene", "Kok {nudler} etter pakken.", 4),
 ("Stek kyllingen", "Stek {kyllingfilet} i biter gjennom i {olje} i en wok. Krydre og ta dem ut.", 6),
 ("Wok grønnsakene", "Fres {paprika}, {sukkererter} og {mais} raskt.", 2),
 ("Bland", "Ha i kylling og nudler, ringle over {hoisin} og vend til alt er varmt. Dryss over {sesam}.", None)]

S["ingefaerkylling"] = [
 ("Forbered", "Sett ovnen på 200 °C og kok {ris}.", None),
 ("Marinér", "Legg {kyllingfilet} i en form. Hell over smeltet {smor}, {soyasaus}, {honning} og {ingefaer}. Krydre med salt og {chili}.", None),
 ("Stek", "Stek kyllingen i ovnen.", 25),
 ("Wok grønnsakene", "Wok {sellerirot}, {gulrot} og {purre} i staver på høy varme med litt soya og {sesam}.", 2),
 ("Server", "Server med ris og båter av {lime}.", None)]

S["chilichicken"] = [
 ("Kok risen", "Kok {ris} etter pakken.", 15),
 ("Stek kjøttdeigen", "Stek {kyllingdeig} i {smor} med hakket {hvitlok}, og ha over i en gryte.", 5),
 ("Tomat og krydder", "Ha i {hakkedetomater}, {tomatpure}, {chilipulver} og smuldret {buljong}.", None),
 ("Bønnene", "Skyll {hvitebonner}, ha dem i og småkok.", 3),
 ("Gjør ferdig", "Rør inn {persille} og halvparten av {cremefraiche} blandet med {hvetemel}. Server resten ved siden av.", None)]

S["fajitas"] = [
 ("Forbered", "Sett ovnen på 175 °C og bland krydderet: {chilipulver}.", None),
 ("Brun kyllingen", "Brun {kyllingfilet} i {smor}.", 4),
 ("Småkok", "Ha i krydder, {gullok} og {paprika}. Småkok under lokk og rør av og til.", 5),
 ("Varm lefsene", "Pakk {tortilla} i folie og varm i ovnen.", 10),
 ("Server", "Fyll lefsene og topp med {salsa}, {revetost}, {romme} og {koriander}.", None)]

S["kyllingburger"] = [
 ("Pommes frites", "Stek {pommes} i ovnen etter posen.", 20),
 ("Lag farsen", "Bland {kyllingdeig}, halvparten av {gullok} finhakket, ½ dl vann, {egg}, salt og pepper.", None),
 ("Form burgerne", "Form burgere ca. 2 cm tykke, gjerne med fuktige hender.", None),
 ("Stek", "Stek i {olje} på middels varme, 3–4 min per side.", 8),
 ("Bygg burgerne", "Del {hamburgerbrod} og bygg med {majones}, {bladsalat}, burger, løkringer, {tomat} og {revetost}.", None)]

S["taco"] = [
 ("Stek kjøttet", "Stek {kjottdeig} i {smor}, ha i {tacokrydder} og vann etter posen.", 2),
 ("Salsa", "Finhakk {tomat} og {gullok}, press over {lime} og smak til med salt.", None),
 ("Varm skjell og lefser", "Varm {tacoskjell} og {tortilla} i ovnen etter pakken.", 5),
 ("Dekk bordet", "Kutt {isberg} og {agurk}, og sett fram {mais}, {revetost} og {romme}.", None)]

S["tacosalat"] = [
 ("Stek kjøttet", "Stek {kjottdeig} med {tacokrydder} i {smor}.", 6),
 ("Grønnsakene", "Skjær {gullok}, {agurk} og {tomat} i biter, og riv {isberg}.", None),
 ("Bygg salaten", "Fordel salat, grønnsaker, kjøtt og {nachochips} på tallerkenene.", None),
 ("Server", "Server med {revetost}, {romme} og {salsa}.", None)]

S["tacospagetti"] = [
 ("Brun kjøttet", "Brun {kjottdeig} i {smor} på høy varme.", 4),
 ("Sausen", "Ha i {gullok} og {chili} og stek 2 min. Ha i {mais}, {spisskummen}, salt og 2 dl vann. Småkok.", 10),
 ("Pastaen", "Kok {spaghetti} imens og vend den inn i sausen.", 10),
 ("Server", "Server med {tomat} i terninger, {nachochips}, {romme} og {koriander}.", None)]

S["chili"] = [
 ("Brun kjøttet", "Brun {kjottdeig} og {gullok} i {smor} til det er smuldrete.", 6),
 ("Krydder og tomat", "Ha i {hvitlok}, {chilipulver}, {oregano} og {hakkedetomater}. Småkok.", 5),
 ("Bønner og paprika", "Rør inn {kidneybonner} og hakket {paprika}, kok opp og smak til.", 5),
 ("Guacamole", "Mos {avokado} med litt hvitløk og saften av {lime}.", None),
 ("Server", "Server med guacamole og {nachochips}.", None)]

S["chiliexpress"] = [
 ("Brun kjøttet", "Brun {kjottdeig} i en varm panne og ha den over i en gryte.", 4),
 ("Grønnsakene", "Fres {gullok}, {paprika} og {hvitlok} i {smor}. Ha i {tomatpure} og la det frese et halvt minutt. Bland med kjøttet.", 3),
 ("Småkok", "Ha i {roktpaprika}, en klype sukker, {hakkedetomater} og {kidneybonner}. Småkok.", 10),
 ("Server", "Server i boller med {avokado}, {varlok}, {nachochips} og {cremefraiche}.", None)]

S["lasagne"] = [
 ("Forbered", "Sett ovnen på 200 °C.", None),
 ("Kjøttsausen", "Brun {kjottdeig} og {gullok} i {smor}. Ha i {hvitlok}, {stangselleri}, revet {gulrot}, {tomatpure}, {hakkedetomater} og {basilikumtorket}. Småkok.", 15),
 ("Ostesausen", "Kok opp det meste av {melk}. Rist resten med {hvetemel}, visp det inn og kok opp. Rør inn {revetost}.", 5),
 ("Bygg lasagnen", "Legg lag med kjøttsaus, ostesaus og {lasagneplater} i en smurt form. Avslutt med saus og ost.", None),
 ("Stek", "Stek nederst i ovnen.", 30)]

S["lasagnegronn"] = [
 ("Forbered", "Sett ovnen på 200 °C.", None),
 ("Grønnsakssausen", "Fres {gullok}, {hvitlok}, revet {gulrot} og {squash} i {smor}. Ha i {tomatpure} og {hakkedetomater}, småkok og kjør glatt.", 8),
 ("Kjøttet", "Brun {kjottdeig} på høy varme og bland i sausen.", 4),
 ("Ostesausen", "Bland {cremefraiche}, {muskat} og {revetost}.", None),
 ("Bygg og stek", "Legg lag med kjøttsaus, {lasagneplater} og ostesaus, og stek.", 15),
 ("Salat", "Vend {cherrytomat} og {varlok} i litt olje og eddik, og server ved siden av.", None)]

S["pastaskruer"] = [
 ("Tomatsausen", "Fres {gullok}, revet {gulrot} og {squash} i {smor}. Ha i {hvitlok}, {tomatpure}, {hakkedetomater}, {buljong} og {oregano}. Småkok.", 9),
 ("Pasta og brokkoli", "Kok {pasta}, og ha {brokkoli} i de siste 2 minuttene.", 10),
 ("Kjøttet", "Brun {karbonadedeig} i litt smør på høy varme.", 4),
 ("Gjør ferdig", "Kjør sausen glatt og rør inn kjøttet og {cremefraiche}. Server med {revetost}.", None)]

S["risottokjottdeig"] = [
 ("Brun", "Fres {gullok} og {hvitlok} i {smor}, ha i {kjottdeig} og brun den.", 5),
 ("Risen", "Rør inn {risottoris} og {tomatpure}.", None),
 ("Småkok", "Løs {buljong} i 6 dl vann, hell over og småkok til risen er mør. Rør av og til.", 20),
 ("Server", "Rør inn litt smør og {parmesan}. Server med {cherrytomat} og {ruccola}.", None)]

S["burger"] = [
 ("Pommes frites", "Stek {pommes} i ovnen etter posen.", 20),
 ("Form burgerne", "Del {kjottdeig} i fire, form flate burgere og krydre med salt og pepper.", None),
 ("Stek", "Stek burgerne i {smor}, ca. 3 min per side.", 6),
 ("Dressing", "Bland revet skall av {lime}, {hvitlok}, {romme} og {sambal}. Smak til.", None),
 ("Bygg burgerne", "Varm {hamburgerbrod} og bygg med {bladsalat}, dressing, {gullok}, burger og {revetost}.", None)]

S["langpannepizza"] = [
 ("Forbered", "Sett ovnen på 250 °C og rull ut {pizzabunn} i en langpanne.", None),
 ("Saus", "Smør på {pizzasaus}.", None),
 ("Fyll", "Brun {kjottdeig} og {gullok} i {smor}, krydre og fordel over. Topp med {revetost}, {tomat} og {oregano}.", 5),
 ("Stek", "Stek midt i ovnen til osten er gyllen.", 10)]

S["kjottkaker"] = [
 ("Farsen", "Rør {kjottdeig} med {salt}, {potetmel} og {pepper}. Spe med {melk} litt etter litt.", None),
 ("Poteter og gulrot", "Sett på {poteter} og {gulrot}.", 20),
 ("Brun kakene", "Form kaker og brun dem i {smor}.", 6),
 ("Brun saus", "Brun {hvetemel} i stekefettet og spe med {buljong} til en jevn saus.", 3),
 ("Trekk", "La kakene trekke i sausen. Server med poteter, gulrot og {tyttebaer}.", 15)]

S["stroganoff"] = [
 ("Poteter", "Kok {poteter}.", 20),
 ("Brun kjøttet", "Brun {biffstrimler} i {smor} og krydre med salt og pepper.", 3),
 ("Løken", "Ha i hakket {gullok} og la den få farge.", 3),
 ("Saus", "Rør inn {tomatpure} og {sitron}. Ha i {matflote}, legg på lokk og la det småkoke. Smak til.", 10)]

S["lapskaus"] = [
 ("Kok kjøttet", "Skjær {gryteskjott} i små terninger og kok opp med vann og {buljong}.", None),
 ("Småkok", "La kjøttet småkoke til det er mørt.", 25),
 ("Grønnsakene", "Ha i {poteter}, {gulrot}, {kalrot}, {sellerirot}, {purre}, {hodekal} og {gullok} i terninger.", None),
 ("Kok ferdig", "Kok til alt er mørt. Smak til med salt og pepper. Server gjerne med flatbrød.", 25)]

S["fiskegrateng"] = [
 ("Forbered", "Sett ovnen på 200 °C og kok {makaroni}. Sett på {poteter}.", 10),
 ("Hvit saus", "Lag en saus av {smor}, {hvetemel} og {melk}. Krydre og rør inn {egg}.", 5),
 ("Bland", "Del {torsk} i biter og bland med {purre} og makaroni i sausen.", None),
 ("Stek", "Ha alt i en form, dryss over {paneringsmel} og stek.", 30),
 ("Råkost", "Riv {gulrot} og server ved siden av.", None)]

S["tacofisk"] = [
 ("Forbered", "Sett ovnen på 225 °C, smør en form med {smor} og kok {ris}.", None),
 ("Fisken", "Legg {torsk} i porsjonsbiter i formen og strø over {salt}.", None),
 ("Sausen", "Bland {matflote}, {salsa} og {revetost} og hell over.", None),
 ("Stek", "Knus {nachochips} over og stek.", 22),
 ("Server", "Server med ris og {isberg}.", None)]

S["seigrateng"] = [
 ("Forbered", "Sett ovnen på 225 °C og kok {poteter}.", 20),
 ("Sausen", "Kok opp {cremefraiche} og {melk}, rør inn {tomatpure} og {oregano}.", 3),
 ("I formen", "Legg {sei}, halverte {cherrytomat} og {purre} i ringer i en form, og hell over sausen.", None),
 ("Stek", "Stek i ovnen. Kok {brokkoli} de siste minuttene.", 25)]

S["laksegrateng"] = [
 ("Forbered", "Sett ovnen på 175 °C og smør en form med {smor}.", None),
 ("Skjær opp", "Skjær {poteter}, {gullok} og {hvitlok} i tynne skiver, og {laks} i biter.", None),
 ("Lag lag", "Legg lagvis i formen og pepre mellom lagene.", None),
 ("Eggestanden", "Visp {melk}, {matflote}, {dijon} og {egg}, og hell over.", None),
 ("Stek", "Stek nederst i ovnen til potetene er møre.", 38)]

S["laksepasta"] = [
 ("Pasta og erter", "Kok {pasta}, og ha {erter} i de siste 3 minuttene.", 10),
 ("Stek laksen", "Stek {laks} gyllen på begge sider.", 7),
 ("Gjør ferdig", "Hell av vannet og rør {cremefraiche} inn i pastaen. Legg laksen på toppen og press over {sitron}.", None)]

S["laksdill"] = [
 ("Potetene", "Skrell {poteter} og del dem i biter på 2–3 cm.", None),
 ("Stuing", "Kok potetene møre i {melk}. Rør {maizena} ut i litt kald melk og jevn med det mot slutten.", 15),
 ("Smak til", "Smak til med salt, pepper og litt {sitron}.", None),
 ("Laksen", "Stek {laks} i {smor}.", 8),
 ("Tilbehør", "Skjær {agurk} og {fennikel} tynt og del {sukkererter}. Vend {dill} inn i potetene.", None)]

S["laksepler"] = [
 ("Forbered", "Sett ovnen på 225 °C og kok {ris}.", 15),
 ("Skjær opp", "Skjær {laks} i terninger, {purre} i skiver og {eple} i terninger.", None),
 ("I formen", "Bland i en form smurt med {smor} og krydre.", None),
 ("Saus og stek", "Rør {pesto} inn i {cremefraiche}, hell over og stek.", 12),
 ("Server", "Dryss over {persille}.", None)]

S["laksekarbonader"] = [
 ("Poteter", "Kok {poteter}.", 20),
 ("Farsen", "Kjør {laks} med {egg} og {potetmel} til en jevn farse i foodprosessor. Krydre.", None),
 ("Vårløk", "Vend inn hakket {varlok}.", None),
 ("Stek", "Form karbonader og stek dem gjennom i {olje} på middels varme.", 8),
 ("Rømmesaus", "Varm {romme} og rør inn hakket {basilikum}. Server med {bladsalat}.", None)]

S["fiskegryte"] = [
 ("Forbered", "Skjær {purre} og {gullok} tynt, hakk {dill} og del {sei} i biter.", None),
 ("Fres", "Fres løk og purre mykt i {smor}.", 4),
 ("Kraften", "Ha i 2 dl vann, {matflote} og {buljong}. Småkok.", 5),
 ("Smak til", "Rør inn {yoghurt} og dill, og smak til med {sitron}.", None),
 ("Trekk", "Legg i fisken og sitronskiver og la det trekke uten å koke. Server med {baguette}.", 6)]

S["fiskeboller"] = [
 ("Poteter", "Kok {poteter}.", 25),
 ("Smørbolle", "Smelt {smor}, rør inn {hvetemel} og spe med kraften fra {fiskeboller}.", None),
 ("Sausen", "Ha i {melk}, kok opp og la sausen småkoke. Smak til med {muskat}, salt og pepper.", 5),
 ("Fiskebollene", "Varm fiskebollene i sausen.", None),
 ("Gulrot", "Damp {gulrot} i skiver.", 5)]

S["fiskekakewrap"] = [
 ("Stek fiskekakene", "Skjær {fiskekaker} i strimler og stek i {smor}. Krydre.", 2),
 ("Grønnsakene", "Del {avokado} i terninger, {gullok} i strimler og {cherrytomat} i to.", None),
 ("Fyll", "Legg {isberg}, grønnsaker og fiskekaker på {tortilla}.", None),
 ("Rull", "Topp med {salsa} og {romme} og rull sammen.", None)]
