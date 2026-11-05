'use strict';
(() => {
'use strict';
(() => {
// ====== KONFIGURACJA ======
const V = '4.11';
const W = 360, H = 560;
const Q = new URLSearchParams(location.search);
const DEBUG = Q.has('debug');
const SAVE_KEY = 'twierdza-op-v4', V3_KEY = 'twierdza-jg-v3', V2_KEY = 'twierdza-jg-v2';
const START_LIVES = 20, CD_BETWEEN = 18;
const FONT = 'Baloo2, system-ui, sans-serif';
const pick = a => a[Math.floor(Math.random()*a.length)];
const rnd = (a,b) => a + Math.random()*(b-a);

// ====== WIEŻE (11) ======
// road:true = broń stawiana na drodze; block:true = bloker (hajducy / wóz)
const TT = {
  luc: {name:'Łucznicy', desc:'Tanie strzały w jeden cel', cost:[55,50,90], dmg:[12,19,29], rate:[.66,.58,.48], range:[88,96,104]},
  smo: {name:'Kocioł smoły', desc:'Spowalnia i parzy wszystkich w pobliżu', cost:[85,75,120], dmg:[5,9,14], rate:[.95,.88,.8], range:[66,74,82], slow:[.3,.4,.5]},
  kus: {name:'Kusznicy', desc:'Bełty przebijają kolczugi (zbroja −50%)', cost:[80,70,115], dmg:[18,28,42], rate:[.85,.74,.6], range:[100,110,120]},
  bal: {name:'Balista', desc:'Ciężki bełt, duży dystans, jeden cel', cost:[100,90,145], dmg:[80,130,200], rate:[4.2,3.8,3.3], range:[135,150,165]},
  mus: {name:'Muszkieterzy', desc:'Szybki ogień z muszkietów', cost:[75,65,115], dmg:[14,22,34], rate:[.62,.5,.38], range:[92,100,110]},
  arm: {name:'Armata', desc:'Wolna, rani wielu, przebija zbroje', cost:[125,105,175], dmg:[36,60,98], rate:[2.3,2.05,1.75], range:[105,115,125], splash:[40,46,54]},
  rus: {name:'Rusznica wałowa', desc:'Daleki strzał w najsilniejszego; przebija dwóch', cost:[115,100,165], dmg:[65,110,175], rate:[1.95,1.8,1.55], range:[150,165,180]},
  haj: {name:'Hajducy', desc:'Blokują wrogów na drodze i sieką toporkami', cost:[95,85,140], dmg:[16,26,40], rate:[.7,.6,.5], range:[28,30,32], block:true, hp:[120,200,320]},
  kar: {name:'Działo kartaczowe', desc:'Kartacz – krótki dystans, szeroki snop', cost:[130,110,180], dmg:[28,48,78], rate:[2.0,1.8,1.55], range:[72,78,85], splash:[55,62,70]},
  moz: {name:'Moździerz', desc:'Bomba po łuku – daleko, w całą gromadę', cost:[155,125,195], dmg:[48,80,128], rate:[3.3,3.0,2.7], range:[150,165,182], splash:[50,56,64]},
  woz: {name:'Wóz bojowy', desc:'Tabor: wytrzymały bloker ze strzelcami', cost:[160,140,210], dmg:[18,28,42], rate:[.8,.7,.58], range:[85,92,100], block:true, hp:[200,340,520]},
  pik: {name:'Pikinierzy', desc:'Krótki zasięg: kłują i na chwilę przytrzymują wroga', cost:[90,80,130], dmg:[22,36,56], rate:[.8,.68,.55], range:[56,64,74], slow:[.5,.6,.7], hold:[.32,.42,.55]},
};
const TKEYS = ['luc','smo','kus','bal','mus','arm','rus','haj','kar','moz','woz','pik'];
const TW = {luc:[34,36,40], smo:[40,42,44], kus:[34,36,40], bal:[48,50,54], mus:[42,44,46], arm:[42,44,47], rus:[31,32,33], haj:[38,40,44], kar:[44,46,50], moz:[44,46,50], woz:[48,52,56], pik:[56,62,70]};
const TOPF = {luc:[.4,.36,.3], smo:[.62,.62,.62], kus:[.4,.36,.3], bal:[.38,.36,.34], mus:[.25,.25,.33], arm:[.2,.2,.21], rus:[.15,.15,.16], haj:[.45,.45,.45], kar:[.25,.22,.2], moz:[.2,.18,.12], woz:[.4,.4,.4], pik:[.40,.40,.40]};

// ====== WROGOWIE ======
const ET = {
  // Niemcy / cesarscy (Głogów)
  ger: {name:'Cesarski piechur', hp:42, spd:34, gold:5, lives:1, armor:0, r:9, img:'e_pie', h:30, atk:6},
  gkn: {name:'Rycerz cesarski', hp:150, spd:22, gold:12, lives:2, armor:.5, r:11, img:'e_bra', h:40, atk:13},
  // Mongołowie (Legnica)
  mon: {name:'Mongoł', hp:38, spd:55, gold:6, lives:1, armor:0, r:9, img:'e_raj', h:32, atk:7},
  mkn: {name:'Mongolski zbrojny', hp:110, spd:40, gold:10, lives:1, armor:.2, r:10, img:'e_pan', h:36, atk:10},
  // Krzyżacy
  kne: {name:'Knecht', hp:50, spd:33, gold:6, lives:1, armor:.1, r:9, img:'e_kne', h:30, atk:6},
  teu: {name:'Kusznik zakonny', hp:42, spd:44, gold:7, lives:1, armor:0, r:9, img:'e_kus', h:31, atk:7},
  bra: {name:'Rycerz zakonny', hp:175, spd:22, gold:14, lives:2, armor:.55, r:11, img:'e_bra', h:40, atk:14},
  ulr: {name:'Wielki Mistrz Ulryk', hp:3100, spd:13, gold:170, lives:10, armor:.35, r:20, img:'e_ulr', h:62, atk:34, boss:true},
  // Moskwa
  str: {name:'Strzelec', hp:44, spd:36, gold:6, lives:1, armor:0, r:9, img:'e_pie', h:30, atk:6},
  boj: {name:'Bojar', hp:130, spd:26, gold:11, lives:2, armor:.35, r:10, img:'e_pan', h:38, atk:12},
  // Mołdawia
  mol: {name:'Mołdawianin', hp:48, spd:38, gold:6, lives:1, armor:0, r:9, img:'e_aza', h:30, atk:7},
  // Maxymilian / Brandenburg (Byczyna)
  max: {name:'Hajduk Maksymiliana', hp:52, spd:34, gold:7, lives:1, armor:.1, r:9, img:'e_kne', h:30, atk:7},
  // Szwedzi
  pie: {name:'Piechota', hp:45, spd:34, gold:6, lives:1, armor:0, r:9, img:'e_pie', h:30, atk:6},
  raj: {name:'Rajtar', hp:34, spd:66, gold:7, lives:1, armor:0, r:11, img:'e_raj', h:34, atk:8},
  pan: {name:'Pancerny', hp:140, spd:24, gold:12, lives:2, armor:.5, r:10, img:'e_pan', h:40, atk:12},
  gen: {name:'Generał Müller', hp:2600, spd:14, gold:150, lives:10, armor:.3, r:18, img:'e_gen', h:56, atk:30, boss:true},
  // Turcy / Tatarzy
  aza: {name:'Azap', hp:44, spd:40, gold:5, lives:1, armor:0, r:9, img:'e_aza', h:29, atk:6},
  jan: {name:'Janczar', hp:95, spd:28, gold:10, lives:1, armor:.25, r:10, img:'e_jan', h:34, atk:11},
  sip: {name:'Sipahi', hp:68, spd:70, gold:9, lives:1, armor:.1, r:12, img:'e_sip', h:40, atk:9},
  tat: {name:'Tatar', hp:36, spd:72, gold:7, lives:1, armor:0, r:11, img:'e_tat', h:34, atk:8},
  pas: {name:'Karakasz Pasza', hp:3500, spd:13, gold:180, lives:10, armor:.35, r:20, img:'e_pas', h:58, atk:36, boss:true},
  // Bossowie dodatkowi (reuse sprites)
  bat: {name:'Batu-chan', hp:2800, spd:14, gold:160, lives:10, armor:.25, r:20, img:'e_ulr', h:60, atk:32, boss:true},
  chw: {name:'Chodkiewicz… zaraza, to wróg!', hp:1, spd:1, gold:1, lives:1, armor:0, r:1, img:'e_pie', h:20, atk:1}, // placeholder unused
  kar: {name:'Kara Mustafa', hp:4200, spd:12, gold:220, lives:12, armor:.4, r:20, img:'e_kar', h:62, atk:40, boss:true},
};

// ====== BOHATEROWIE ======
const HEROES = {
  zaw: {name:'Zawisza Czarny', short:'Zawisza', ranged:false, hp:420, dmg:26, rate:.8, range:24, spd:58,
        ab:'Cios Zawiszy', abDesc:'Potężne cięcie wokół rycerza – rani wszystkich i ogłusza.', abCd:22,
        tiers:['Czarna przeszywanica i miecz','Kolczuga, hełm i tarcza','Stalowa zbroja płytowa','Czarno-złota zbroja z pióropuszem'],
        desc:'Słynny rycerz z Garbowa. „Polegać jak na Zawiszy”.',
        lines:['Polegaj jak na Zawiszy!','Kto następny?','Na ubitą ziemię!','Słowo rycerza!','Jeden na stu? Uczciwie!','Zawisza nie giął kolan!'],
        go:['Rycerz rusza!','Na koń… znaczy, pieszo!'], die:'Tylko… zadrapanie…', back:'Zawisza wrócił!', lvl:'Kowal się postarał!', abSay:'Uwaga… CIOS!'},
  zol: {name:'Hetman Żółkiewski', short:'Żółkiewski', ranged:false, hp:380, dmg:24, rate:.75, range:24, spd:60,
        ab:'Szyk hetmański', abDesc:'Hetman ustawia szyk: wieże w pobliżu dostają +obrażenia na chwilę.', abCd:26,
        tiers:['Szary żupan i buława','Kolczuga','Pancerz hetmański','Złota zbroja i buzdygan'],
        desc:'Stanisław Żółkiewski – zwycięzca spod Kłuszyna.',
        lines:['Spokój, panowie bracia!','Kłuszyn pamięta!','Buława wie lepiej!','Hetman nie biega – hetman idzie!','Moskwa daleko, ale dojdziemy!'],
        go:['Hetman w drogę!','Za mną!'], die:'Odstępuję… na chwilę…', back:'Hetman znów stoi!', lvl:'Nowa zbroja hetmana!', abSay:'Szyk – i ognia!'},
  cho: {name:'Hetman Chodkiewicz', short:'Chodkiewicz', ranged:false, hp:360, dmg:23, rate:.7, range:24, spd:60,
        ab:'Okrzyk hetmana', abDesc:'Wrogowie wokół zastygają ze strachu, buława robi porządek.', abCd:26,
        tiers:['Czerwony żupan i buława','Kolczuga i misiurka','Pancerz i skóra lamparta','Złota zbroja husarska ze skrzydłami'],
        desc:'Jan Karol Chodkiewicz – Kircholm i Chocim.',
        lines:['Ani kroku wstecz!','Hetman jest jeden!','Kircholm to ja!','Chocim stoi!','Wąs mi się jeży!'],
        go:['Hetman idzie!','Za mną!'], die:'Buława… za ciężka…', back:'Hetman znów w siodle!', lvl:'Lepsza zbroja!', abSay:'STÓJ! Hetman mówi!'},
  kon: {name:'Hetman Koniecpolski', short:'Koniecpolski', ranged:false, hp:370, dmg:25, rate:.72, range:24, spd:62,
        ab:'Kontuszowy wicher', abDesc:'Szybki atak wokół – wrogowie cofają się i dostają po nogach.', abCd:24,
        tiers:['Kontusz i szabla','Kolczuga','Pancerz z buńczukiem','Złota zbroja i skrzydła'],
        desc:'Stefan Koniecpolski – postrach Szwedów i Tatarów.',
        lines:['Trzciana! Pamiętacie?','Szabla sama wie!','Tatarom mówię: do widzenia!','Hetman też się spoci!'],
        go:['Jazda!','W teren!'], die:'Chwilę… odetchnę…', back:'Koniecpolski wraca!', lvl:'Kowal zadowolony!', abSay:'Wicher! Rozprosz ich!'},
  cza: {name:'Stefan Czarniecki', short:'Czarniecki', ranged:false, hp:350, dmg:27, rate:.7, range:24, spd:66,
        ab:'Nie damy się!', abDesc:'Krzyk Czarnieckiego: sojusznicy (wieże) strzelają szybciej, on leczy się trochę.', abCd:28,
        tiers:['Szary kontusz','Kolczuga','Pancerz partyzanta','Złota zbroja i czapka'],
        desc:'Bohater potopu. „Śpij, kolego…” – ale najpierw bitwa!',
        lines:['Nie damy Szwecji!','Czarniecki nie śpi!','Partyzantka w akcji!','Za Polskę!'],
        go:['W las!','Ruszam!'], die:'Na chwilę… w krzaki…', back:'Czarniecki znów tu!', lvl:'Czapka z bączkiem!', abSay:'NIE DAMY SIĘ!'},
  kor: {name:'Przeor Kordecki', short:'Kordecki', ranged:true, hp:200, dmg:13, rate:.75, range:78, spd:62,
        ab:'Modlitwa', abDesc:'Wieże w pobliżu strzelają szybciej, przeor odzyskuje siły.', abCd:30,
        tiers:['Biały habit i kij','Kolczuga pod habitem','Stalowy pancerz i srebrny krzyż','Złota zbroja i świecący krzyż'],
        desc:'Przeor Jasnej Góry. Walczy z daleka – złote promienie.',
        lines:['Z Bożą pomocą!','Tego klasztoru nie oddam!','Modlę się i celuję!','Najpierw jutrznia, potem bitwa!'],
        go:['Idę, idę!','Już biegnę!'], die:'Muszę chwilę odpocząć…', back:'Wracam z odwagi!', lvl:'Nowy habit!', abSay:'Módlmy się… i strzelajmy!'},
};
const HKEYS = ['zaw','zol','cho','kon','cza','kor'];
// XP do lvl 1..30 (łączne). Wolny przyrost – max koło końca kampanii.
const XPNEED = (() => { const a=[0]; let t=0; for (let L=1;L<30;L++){ t += Math.round(40 + L*18 + (L>15?L*6:0)); a.push(t);} return a; })();
const TIER_LV = [1,8,16,25];
const tierOf = l => l >= 25 ? 3 : l >= 16 ? 2 : l >= 8 ? 1 : 0;
const levelOf = xp => { let l = 1; while (l < 30 && xp >= XPNEED[l]) l++; return l; };
const MAX_STAT = 40; // 40 * 2% = +80%

// ====== ATAKI SPECJALNE ======
const SPECS = {
  ryc: {name:'Szarża rycerstwa', desc:'Ciężkozbrojni rycerze szarżują drogą i tratują wrogów.', uses:3, cd:38, img:'e_bra'},
  tat: {name:'Posiłki tatarskie', desc:'Tatarzy Dżalala ad-Dina – jadą pod prąd i ostrzeliwują.', uses:3, cd:34, img:'e_tat'},
  hus: {name:'Husaria', desc:'Skrzydlata jazda szarżuje przez całą drogę.', uses:3, cd:40, img:'e_hus'},
  ost: {name:'Ostrzał z armat', desc:'Dotknij planszę – spadnie grad kul.', uses:3, cd:28, img:'d_ocan'},
};
const SKEYS = ['ryc','tat','hus','ost'];

// ====== MAPY (16) + teksty ======
const NODE_POS = {"glo": [11.14, 51.35], "leg": [11.64, 56.36], "plo": [22.11, 43.36], "gru": [29.18, 37.28], "kor": [19.49, 38.66], "ors": [75.0, 28.93], "obe": [51.69, 76.02], "byc": [20.52, 56.39], "kir": [48.0, 9.88], "klu": [92.03, 20.42], "cec": [61.88, 85.18], "cho": [57.52, 77.56], "gni": [23.01, 32.82], "trz": [24.24, 37.68], "och": [74.06, 73.43], "jg": [24.82, 59.02]};
const CHAPTERS = [
  {id:'ch_gru', boss:'gru', name:'Grunwald', year:1410, maps:['glo','leg','plo','gru']},
  {id:'ch_kir', boss:'kir', name:'Kircholm', year:1605, maps:['kor','ors','obe','byc','kir']},
  {id:'ch_cho', boss:'cho', name:'Chocim', year:1621, maps:['klu','cec','cho']},
  {id:'ch_jg', boss:'jg', name:'Jasna Góra', year:1655, maps:['gni','trz','och','jg']},
];
const CHAPTER_POS = {"gru": [42, 22], "kir": [78, 14], "cho": [70, 76], "jg": [48, 50]};

const NODE_LBL = {};
const CAMP_ROADS = [{"a":"glo","b":"leg","pts":[[16.59,49.82],[16.46,50.34],[16.4,50.87],[16.4,51.41],[16.46,51.95],[16.56,52.5],[16.69,53.05],[16.84,53.61],[17.0,54.17],[17.16,54.72],[17.3,55.27],[17.43,55.82],[17.52,56.36],[17.57,56.89],[17.56,57.42],[17.48,57.93]]},{"a":"leg","b":"plo","pts":[[17.48,57.93],[17.95,56.82],[18.57,55.8],[19.32,54.85],[20.17,53.95],[21.1,53.11],[22.09,52.29],[23.12,51.5],[24.17,50.73],[25.22,49.95],[26.24,49.17],[27.22,48.36],[28.12,47.52],[28.94,46.63],[29.64,45.69],[30.21,44.68]]},{"a":"plo","b":"gru","pts":[[30.21,44.68],[31.08,44.45],[31.9,44.11],[32.68,43.67],[33.43,43.15],[34.15,42.56],[34.86,41.93],[35.55,41.26],[36.23,40.58],[36.91,39.9],[37.6,39.24],[38.3,38.62],[39.01,38.05],[39.75,37.55],[40.52,37.14],[41.33,36.83]]},{"a":"gru","b":"kor","pts":[[41.33,36.83],[40.29,37.3],[39.2,37.62],[38.06,37.81],[36.89,37.9],[35.7,37.9],[34.48,37.83],[33.25,37.72],[32.02,37.6],[30.79,37.47],[29.57,37.37],[28.37,37.32],[27.2,37.33],[26.06,37.43],[24.96,37.64],[23.91,37.98]]},{"a":"kor","b":"ors","pts":[[23.91,37.98],[28.24,37.8],[32.7,37.42],[37.26,36.85],[41.92,36.13],[46.65,35.3],[51.43,34.38],[56.24,33.41],[61.05,32.41],[65.86,31.42],[70.63,30.46],[75.35,29.58],[80.0,28.8],[84.56,28.15],[89.0,27.67],[93.31,27.38]]},{"a":"ors","b":"obe","pts":[[93.31,27.38],[91.95,30.67],[90.36,33.98],[88.57,37.31],[86.62,40.66],[84.54,44.01],[82.36,47.36],[80.13,50.72],[77.87,54.08],[75.62,57.43],[73.42,60.77],[71.29,64.1],[69.28,67.41],[67.42,70.7],[65.74,73.96],[64.28,77.19]]},{"a":"obe","b":"byc","pts":[[64.28,77.19],[62.21,75.46],[59.95,73.85],[57.54,72.33],[55.0,70.89],[52.36,69.52],[49.65,68.2],[46.89,66.91],[44.12,65.63],[41.35,64.36],[38.62,63.06],[35.96,61.74],[33.39,60.36],[30.93,58.91],[28.63,57.38],[26.49,55.75]]},{"a":"byc","b":"kir","pts":[[26.49,55.75],[28.2,52.5],[30.15,49.24],[32.3,45.98],[34.62,42.71],[37.07,39.45],[39.61,36.19],[42.21,32.93],[44.83,29.68],[47.45,26.43],[50.02,23.19],[52.5,19.95],[54.87,16.73],[57.09,13.51],[59.12,10.31],[60.93,7.12]]},{"a":"kir","b":"klu","pts":[[60.93,7.12],[62.91,8.27],[65.02,9.26],[67.25,10.11],[69.57,10.86],[71.98,11.52],[74.43,12.12],[76.93,12.68],[79.43,13.22],[81.93,13.76],[84.4,14.32],[86.82,14.94],[89.16,15.62],[91.42,16.4],[93.56,17.29],[95.57,18.33]]},{"a":"klu","b":"cec","pts":[[95.57,18.33],[94.94,22.67],[94.09,27.13],[93.04,31.69],[91.83,36.32],[90.5,41.01],[89.08,45.75],[87.59,50.51],[86.09,55.27],[84.59,60.02],[83.13,64.75],[81.75,69.43],[80.48,74.04],[79.35,78.58],[78.4,83.01],[77.65,87.33]]},{"a":"cec","b":"cho","pts":[[77.65,87.33],[77.58,86.74],[77.42,86.16],[77.2,85.59],[76.91,85.04],[76.58,84.51],[76.21,83.98],[75.82,83.46],[75.42,82.94],[75.02,82.42],[74.64,81.9],[74.28,81.38],[73.96,80.85],[73.69,80.31],[73.48,79.75],[73.35,79.19]]},{"a":"cho","b":"gni","pts":[[73.35,79.19],[70.37,76.4],[67.45,73.37],[64.57,70.14],[61.72,66.75],[58.91,63.22],[56.11,59.6],[53.34,55.92],[50.57,52.22],[47.81,48.53],[45.04,44.89],[42.26,41.33],[39.47,37.89],[36.65,34.61],[33.81,31.52],[30.93,28.66]]},{"a":"gni","b":"trz","pts":[[30.93,28.66],[30.81,29.18],[30.76,29.71],[30.78,30.25],[30.85,30.79],[30.96,31.33],[31.11,31.88],[31.28,32.44],[31.45,32.99],[31.63,33.54],[31.79,34.09],[31.93,34.63],[32.04,35.17],[32.1,35.7],[32.1,36.22],[32.04,36.73]]},{"a":"trz","b":"och","pts":[[32.04,36.73],[35.99,38.65],[39.97,40.82],[43.99,43.2],[48.02,45.75],[52.08,48.44],[56.14,51.23],[60.21,54.08],[64.28,56.95],[68.34,59.82],[72.38,62.63],[76.41,65.36],[80.41,67.97],[84.38,70.42],[88.31,72.67],[92.19,74.69]]},{"a":"och","b":"jg","pts":[[92.19,74.69],[88.78,73.33],[85.19,72.13],[81.45,71.05],[77.59,70.08],[73.62,69.2],[69.59,68.37],[65.51,67.59],[61.42,66.83],[57.34,66.06],[53.29,65.27],[49.32,64.44],[45.44,63.53],[41.68,62.53],[38.06,61.43],[34.63,60.18]]}];
const CAMP_ASPECT = 9/16; // width/height of v3 painted map
const FAC_LINES = {"ger": ["Für den Kaiser!", "Los, vorwärts!", "Polnische Burg? Ha!", "Wo ist das Bier?"], "mon": ["Hurraaa!", "Koń i szabla!", "Step woła!", "Batu! Batu!"], "teu": ["Gott mit uns!", "Zwei Schwerter!", "Für den Orden!", "Nein, nicht schon wieder!"], "mos": ["Za cara!", "Moskwa nie zginie!", "Bojar idzie!", "Ura!"], "mol": ["Moldova!", "Do boju!", "Hospodar kazał!"], "max": ["Maximilian!", "Za arcyksięcia!", "Byczyna czeka?"], "swe": ["För Sverige!", "Kungens män!", "Atak!", "Zimno tu!"], "ott": ["Allah!", "Janczarzy!", "Eyvah!", "Do szturmu!"], "tat": ["Haik!", "Ałła!", "Stepowy wiatr!", "Szybko i znikać!"]};
const PL = {
  wave:['Do broni!','Szykować się!','Idą!','Za Polskę!','Trzymać szyk!','Proch suchy?'],
  kill:['Za Polskę!','Następny!','Ha!','Dobranoc!'],
  leak:['Ała! Brama!','Zamykać wrota!','Kto pilnuje bramy?!'],
  build:['Gotowe!','Stoi jak nowa!','Do roboty!'],
  upg:['Lepiej!','Mocniej!','Teraz się zacznie!'],
  hus:['Husaria! Szarża!','Skrzydła w górę!','Na nich!'],
  ryc:['Szarża rycerstwa!','Kopiami naprzód!','Rycerze, za mną!'],
  ost:['Pal ze wszystkich!','Ognia!','Armaty, mówcie!'],
  tat:['Lipkowie z odsieczą!','Tatarzy w siodła!','Strzały!'],
  win:['Zwycięstwo!','Hurra!','Twierdza stoi!','Chwała obronie!'],
  lose:['Odwrót…','Nie tym razem.','Padliśmy.','Spróbuj ponownie!'],
  tower:{
    luc:['Celuć!','Strzała!','Czuwaj!'], smo:['Gorąca kąpiel!','Smoła!'], kus:['Bełt!','Naciągaj!'],
    bal:['Balista!','Ciężki bełt!'], mus:['Ognia!','Pif-paf!'],
    arm:['Bum!','Kula w drogę!'], rus:['Z daleka!','Na cel!'], haj:['Hajducy!','Toporki!'],
    kar:['Kartacz!','Snop ognia!'], moz:['Uwaga, leci!','BUM!'], woz:['Tabor stoi!','Z wozu ognia!'],
    pik:['Nie przejdziesz!','Kłuj!','Piki naprzód!','Stoj!'],
  },
};
const FACT = {
  swe:{spawn:['Hej hå!','Framåt!','För kungen!'], hurt:['Aj!','Oj oj!'], slow:['Varmt!'], flee:['Hem!'], hus:['Husaria!'], ost:['Kanonkulor!'], tat:['Pilar!'], ryc:['Riddare?!']},
  teu:{spawn:['Vorwärts!','Für den Orden!'], hurt:['Au weh!'], slow:['Heiß!'], flee:['Rückzug!'], hus:['Flügel?!'], ost:['Deckung!'], tat:['Pfeile!'], ryc:['Ritter?']},
  ott:{spawn:['İleri!','Haydi!'], hurt:['Aman!'], slow:['Sıcak!'], flee:['Kaçın!'], hus:['Kanatlılar!'], ost:['Gülle!'], tat:['Oklar!'], ryc:['Şövalye!']},
  ger:{spawn:FAC_LINES.ger, hurt:['Au!','Hilfe!'], slow:['Heiß!'], flee:['Zurück!'], hus:['Was?!'], ost:['Kanonen!'], tat:['Pfeile!'], ryc:['Ritter!']},
  mon:{spawn:FAC_LINES.mon, hurt:['Aj!'], slow:['Gorąco!'], flee:['Uciekać!'], hus:['Skrzydła?!'], ost:['Bum!'], tat:['Swoi?!'], ryc:['Rycerze!']},
  mos:{spawn:FAC_LINES.mos, hurt:['Oj!'], slow:['Goriacho!'], flee:['Nazad!'], hus:['Krylja!'], ost:['Pushki!'], tat:['Strely!'], ryc:['Rytsari!']},
  mol:{spawn:FAC_LINES.mol, hurt:['Au!'], slow:['Calda!'], flee:['Fugi!'], hus:['Aripi!'], ost:['Tunuri!'], tat:['Sageți!'], ryc:['Cavaleri!']},
  max:{spawn:FAC_LINES.max, hurt:['Au!'], slow:['Heiß!'], flee:['Zurück!'], hus:['Flügel!'], ost:['Kanonen!'], tat:['Pfeile!'], ryc:['Ritter!']},
  tat:{spawn:FAC_LINES.tat, hurt:['Aj!'], slow:['Sıcak!'], flee:['Kaç!'], hus:['Kanat!'], ost:['Top!'], tat:['Kardeş?!'], ryc:['Atlı!']},
};

const MAPS = [
 { id:"glo", name:"Głogów", year:1109, big:false, fac:"ger", grass:"grass", fort:"fort_grod", fortW:150, fortAR:0.7481,
   flags:'pl', river:false, camp:'v2', deco:'v2',
   path:[[180, -25], [180, 80], [60, 120], [60, 220], [300, 260], [300, 360], [100, 400], [180, 478]], spots:[[128, 33], [232, 59], [90, 55], [51, 68], [115, 157], [148, 182], [205, 191], [265, 201], [248, 315]], roads:[[180, 80], [60, 120], [60, 220]],
   gold:200, hk:0.92, boss:null, roster:["ger", "gkn"], music:"jg", sky:"#d9e6f0",
   intro:"Rok 1109. Cesarz Henryk V oblega Głogów. Obrońcy nie oddadzą grodu!",
   unlock:{"tower": "kus"},
   hist:{"title": "OBRONA GŁOGOWA 1109", "img": "hist_jg", "text": ["Cesarz Henryk V najechał Śląsk i obległ Głogów.", "Obrońcy bronili się dzielnie mimo okrutnych gróźb.", "Grody śląskie nie upadły. Henryk odszedł z niczym.", "Jedna z najwcześniejszych słynnych obron Polski."], "fun": "Kronikarze piszą, że obrońców nie złamały nawet najstraszniejsze groźby cesarza."},
   waves:[[["ger", 4, 1.1, 0]], [["ger", 4, 1.05, 0], ["gkn", 2, 0.96, 3]], [["ger", 5, 1.0, 0], ["gkn", 3, 0.92, 3]], [["ger", 6, 0.95, 0], ["gkn", 4, 0.88, 3]], [["ger", 7, 0.9, 0], ["gkn", 4, 0.84, 3]], [["ger", 8, 0.85, 0], ["gkn", 5, 0.8, 3]], [["ger", 9, 0.8, 0], ["gkn", 6, 0.76, 3]]],
   bossL:null,
   pl:["Za Polskę!", "Nie damy się!", "Do broni!", "Ojczyzna woła!", "Bij, zabij!", "Chwała bohaterom!", "Jeszcze Polska!"] },
 { id:"leg", name:"Legnica", year:1241, big:false, fac:"mon", grass:"grass", fort:"fort_grod", fortW:150, fortAR:0.7481,
   flags:'pl', river:false, camp:'v2', deco:'v2',
   path:[[70, -25], [70, 95], [290, 95], [290, 200], [70, 200], [70, 305], [290, 305], [290, 405], [180, 405], [180, 478]], spots:[[122, 41], [165, 43], [206, 43], [246, 43], [237, 147], [196, 148], [235, 252], [154, 148], [114, 148]], roads:[[70, 95], [290, 95], [290, 200]],
   gold:210, hk:0.95, boss:null, roster:["mon", "mkn"], music:"jg", sky:"#e8e0c8",
   intro:"1241. Mongołowie Batu-chana. Henryk Pobożny staje do heroicznej obrony!",
   unlock:{"tower": "pik"},
   hist:{"title": "LEGNICA 1241", "img": "hist_gr", "text": ["Mongołowie Batu-chana szli przez Europę.", "Pod Legnicą stawił im czoła Henryk Pobożny.", "Bitwa przegrana, Henryk zginął – ale najazd wyhamował.", "Heroiczna obrona kupiła Europie czas."], "fun": "Mongołowie używali dymu i forteli, by mieszać szyki rycerstwa."},
   waves:[[["mon", 4, 1.1, 0]], [["mon", 4, 1.05, 0], ["mkn", 2, 0.96, 3]], [["mon", 5, 1.0, 0], ["mkn", 3, 0.92, 3]], [["mon", 6, 0.95, 0], ["mkn", 4, 0.88, 3]], [["mon", 7, 0.9, 0], ["mkn", 4, 0.84, 3]], [["mon", 8, 0.85, 0], ["mkn", 5, 0.8, 3]], [["mon", 9, 0.8, 0], ["mkn", 6, 0.76, 3]], [["mon", 10, 0.75, 0], ["mkn", 6, 0.72, 3]]],
   bossL:null,
   pl:["Za Polskę!", "Nie damy się!", "Do broni!", "Ojczyzna woła!", "Bij, zabij!", "Chwała bohaterom!", "Jeszcze Polska!"] },
 { id:"plo", name:"Płowce", year:1331, big:false, fac:"teu", grass:"grass_gr", fort:"fort_grod", fortW:150, fortAR:0.7481,
   flags:'pl', river:false, camp:'v2', deco:'v2',
   path:[[100, -25], [100, 60], [280, 90], [280, 180], [60, 210], [60, 310], [300, 340], [300, 420], [180, 450], [180, 478]], spots:[[48, 43], [177, 20], [185, 127], [226, 134], [332, 140], [149, 145], [108, 151], [68, 156], [116, 255]], roads:[[100, 60], [280, 90], [280, 180]],
   gold:220, hk:0.98, boss:null, roster:["kne", "teu"], music:"gr", sky:"#d5e8d5",
   intro:"1331. Władysław Łokietek ściera się z Krzyżakami pod Płowcami.",
   unlock:{"tower": "bal"},
   hist:{"title": "PŁOWCE 1331", "img": "hist_gr", "text": ["Łokietek starł się z Krzyżakami pod Płowcami.", "Bitwa zacięta – obie strony krzyczały „zwycięstwo!”.", "Dla Polski ważne: król nie został rozbity.", "Kolejny etap zmagań z zakonem."], "fun": "Łokietek był nieduży – stąd przydomek – ale miał wielki temperament!"},
   waves:[[["kne", 4, 1.1, 0]], [["kne", 4, 1.05, 0], ["teu", 2, 0.96, 3]], [["kne", 5, 1.0, 0], ["teu", 3, 0.92, 3]], [["kne", 6, 0.95, 0], ["teu", 4, 0.88, 3]], [["kne", 7, 0.9, 0], ["teu", 4, 0.84, 3]], [["kne", 8, 0.85, 0], ["teu", 5, 0.8, 3]], [["kne", 9, 0.8, 0], ["teu", 6, 0.76, 3]]],
   bossL:null,
   pl:["Za Polskę!", "Nie damy się!", "Do broni!", "Ojczyzna woła!", "Bij, zabij!", "Chwała bohaterom!", "Jeszcze Polska!"] },
 { id:"gru", name:"Grunwald", year:1410, big:true, fac:"teu", grass:"grass", fort:"fort_tabor", fortW:170, fortAR:0.7161,
   flags:'pl', river:false, camp:'v2', deco:'v2',
   path:[[40, -25], [40, 100], [320, 100], [320, 200], [80, 200], [80, 320], [280, 320], [280, 420], [180, 450], [180, 478]], spots:[[92, 44], [60, 152], [194, 48], [264, 48], [266, 252], [225, 252], [183, 252], [133, 252], [27, 230], [28, 271], [124, 372]], roads:[[40, 100], [320, 100], [320, 200], [80, 200]],
   gold:260, hk:1.0, boss:"ulr", roster:["kne", "teu", "bra"], music:"gr", sky:"#d9ecf6",
   intro:"15 lipca 1410. Jagiełło i Witold przeciw Krzyżakom. Dwa miecze? Dzięki, nie trzeba!",
   unlock:{"tower": "mus", "spec": "tat", "chest": true},
   hist:{"title": "BITWA POD GRUNWALDEM 1410", "img": "hist_gr", "text": ["15 lipca 1410 Polacy i Litwini starli się z Krzyżakami.", "Zakon przysłał dwa miecze – „żebyście mieli czym walczyć”.", "Zawisza Czarny bił się w pierwszym szeregu.", "Wielki mistrz Ulryk zginął. Zakon już nigdy nie był tak silny."], "fun": "Miecze grunwaldzkie trzymano na Wawelu. W 1795 zabrali je Prusacy."},
   waves:[[["kne", 4, 1.1, 0]], [["kne", 5, 1.05, 0], ["teu", 3, 0.96, 3]], [["kne", 6, 1.0, 0], ["teu", 4, 0.92, 3]], [["kne", 7, 0.95, 0], ["teu", 5, 0.88, 3], ["bra", 3, 0.81, 5]], [["kne", 8, 0.9, 0], ["teu", 5, 0.84, 3], ["bra", 4, 0.78, 5]], [["kne", 9, 0.85, 0], ["teu", 6, 0.8, 3], ["bra", 4, 0.75, 5]], [["kne", 10, 0.8, 0], ["teu", 7, 0.76, 3], ["bra", 5, 0.72, 5]], [["kne", 11, 0.75, 0], ["teu", 7, 0.72, 3], ["bra", 5, 0.69, 5]], [["kne", 12, 0.7, 0], ["teu", 8, 0.68, 3], ["bra", 6, 0.66, 5]], [["kne", 13, 0.65, 0], ["teu", 9, 0.64, 3], ["bra", 6, 0.63, 5]], [["kne", 14, 0.6, 0], ["teu", 9, 0.6, 3], ["bra", 7, 0.6, 5]], [["kne", 15, 0.55, 0], ["teu", 10, 0.56, 3], ["bra", 7, 0.57, 5], ["ulr", 1, 1, 8], ["kne", 6, 0.7, 12]]],
   bossL:{"spawn": "Zwei Schwerter für euch!", "half": "Der Orden wankt!", "low": "Zurück!", "die": "Jungingen fällt…"},
   pl:["Za Polskę!", "Nie damy się!", "Do broni!", "Ojczyzna woła!", "Bij, zabij!", "Chwała bohaterom!", "Jeszcze Polska!"] },
 { id:"kor", name:"Koronowo", year:1410, big:false, fac:"teu", grass:"grass_gr", fort:"fort_gr", fortW:160, fortAR:0.8136,
   flags:'pl', river:false, camp:'v2', deco:'v2',
   path:[[200, -25], [200, 70], [80, 110], [80, 200], [260, 240], [260, 330], [100, 370], [180, 430], [180, 478]], spots:[[254, 51], [144, 34], [105, 47], [66, 60], [133, 147], [172, 167], [106, 259], [163, 272], [204, 281]], roads:[[200, 70], [80, 110], [80, 200]],
   gold:230, hk:1.02, boss:null, roster:["kne", "teu", "bra"], music:"gr", sky:"#d8ecd8",
   intro:"Październik 1410. Po Grunwaldzie – jeszcze Koronowo.",
   unlock:{"tower": "arm"},
   hist:{"title": "KORONOWO 1410", "img": "hist_gr", "text": ["Kilka miesięcy po Grunwaldzie Krzyżacy znów uderzyli.", "Pod Koronowem znów przegrali.", "To dopięcie zwycięstwa roku 1410.", "Zakon musiał negocjować pokój."], "fun": "Koronowo bywa nazywane „drugim Grunwaldem”."},
   waves:[[["kne", 4, 1.1, 0]], [["kne", 4, 1.05, 0], ["teu", 2, 0.96, 3]], [["kne", 5, 1.0, 0], ["teu", 3, 0.92, 3]], [["kne", 6, 0.95, 0], ["teu", 4, 0.88, 3], ["bra", 3, 0.81, 5]], [["kne", 7, 0.9, 0], ["teu", 4, 0.84, 3], ["bra", 3, 0.78, 5]], [["kne", 8, 0.85, 0], ["teu", 5, 0.8, 3], ["bra", 4, 0.75, 5]], [["kne", 9, 0.8, 0], ["teu", 6, 0.76, 3], ["bra", 4, 0.72, 5]]],
   bossL:null,
   pl:["Za Polskę!", "Nie damy się!", "Do broni!", "Ojczyzna woła!", "Bij, zabij!", "Chwała bohaterom!", "Jeszcze Polska!"] },
 { id:"ors", name:"Orsza", year:1514, big:false, fac:"mos", grass:"grass_wi", fort:"fort_wi", fortW:160, fortAR:1.1364,
   flags:'pl', river:true, camp:'v2', deco:'v2',
   path:[[300, -25], [300, 45], [90, 95], [60, 180], [250, 215], [290, 290], [100, 330], [80, 400], [180, 425], [180, 478]], spots:[[179, 20], [268, 106], [139, 30], [153, 133], [30, 108], [189, 151], [228, 158], [271, 166], [307, 212]], roads:[[300, 45], [90, 95], [60, 180]],
   gold:240, hk:1.04, boss:null, roster:["str", "boj"], music:"ch", sky:"#e8dcc0",
   intro:"1514. Ostrogski i Daszkiewicz biją Moskwę pod Orszą.",
   unlock:{"tower": "rus"},
   hist:{"title": "ORSZA 1514", "img": "hist_ch", "text": ["Wojska polsko-litewskie biły Moskwę nad Dnieprem.", "Ostrogski i Daszkiewicz rozgromili liczniejszego wroga.", "Orsza stała się dumą Rzeczypospolitej.", "Malowano ją na obrazach przez lata."], "fun": "Po Orszy wybito medal – zwycięstwo było ogromne!"},
   waves:[[["str", 4, 1.1, 0]], [["str", 4, 1.05, 0], ["boj", 2, 0.96, 3]], [["str", 5, 1.0, 0], ["boj", 3, 0.92, 3]], [["str", 6, 0.95, 0], ["boj", 4, 0.88, 3]], [["str", 7, 0.9, 0], ["boj", 4, 0.84, 3]], [["str", 8, 0.85, 0], ["boj", 5, 0.8, 3]], [["str", 9, 0.8, 0], ["boj", 6, 0.76, 3]], [["str", 10, 0.75, 0], ["boj", 6, 0.72, 3]]],
   bossL:null,
   pl:["Za Polskę!", "Nie damy się!", "Do broni!", "Ojczyzna woła!", "Bij, zabij!", "Chwała bohaterom!", "Jeszcze Polska!"] },
 { id:"obe", name:"Obertyn", year:1531, big:false, fac:"mol", grass:"grass", fort:"fort_tabor", fortW:150, fortAR:0.7161,
   flags:'pl', river:false, camp:'v2', deco:'v2',
   path:[[50, -25], [50, 90], [180, 130], [300, 90], [300, 200], [180, 240], [60, 280], [60, 380], [180, 420], [180, 478]], spots:[[102, 38], [134, 62], [175, 74], [214, 63], [235, 167], [253, 51], [295, 37], [195, 180], [296, 256]], roads:[[50, 90], [180, 130], [300, 90]],
   gold:240, hk:1.05, boss:null, roster:["mol", "aza"], music:"ch", sky:"#e6d8b8",
   intro:"1531. Hetman Tarnowski rozbija Mołdawian pod Obertynem. Tabor rządzi!",
   unlock:{"tower": "haj"},
   hist:{"title": "OBERTYN 1531", "img": "hist_ch", "text": ["Hetman Tarnowski ustawił tabor – wóz za wozem.", "Mołdawianie odbijali się od wozów.", "Artyleria i jazda dokończyły dzieła.", "Mistrzowski przykład użycia taboru."], "fun": "Tabor to ruchoma twierdza. Husyci też tak walczyli!"},
   waves:[[["mol", 4, 1.1, 0]], [["mol", 4, 1.05, 0], ["aza", 2, 0.96, 3]], [["mol", 5, 1.0, 0], ["aza", 3, 0.92, 3]], [["mol", 6, 0.95, 0], ["aza", 4, 0.88, 3]], [["mol", 7, 0.9, 0], ["aza", 4, 0.84, 3]], [["mol", 8, 0.85, 0], ["aza", 5, 0.8, 3]], [["mol", 9, 0.8, 0], ["aza", 6, 0.76, 3]]],
   bossL:null,
   pl:["Za Polskę!", "Nie damy się!", "Do broni!", "Ojczyzna woła!", "Bij, zabij!", "Chwała bohaterom!", "Jeszcze Polska!"] },
 { id:"byc", name:"Byczyna", year:1588, big:false, fac:"max", grass:"grass", fort:"fort_tabor", fortW:150, fortAR:0.7161,
   flags:'pl', river:false, camp:'v2', deco:'v2',
   path:[[180, -25], [180, 80], [60, 120], [60, 220], [300, 260], [300, 360], [100, 400], [180, 478]], spots:[[128, 33], [232, 59], [90, 55], [51, 68], [115, 157], [148, 182], [205, 191], [265, 201], [248, 315]], roads:[[180, 80], [60, 120], [60, 220]],
   gold:250, hk:1.06, boss:null, roster:["max", "gkn"], music:"jg", sky:"#e0e4f0",
   intro:"1588. Zamoyski bierze do niewoli Maksymiliana pod Byczyną.",
   unlock:{"tower": "kar"},
   hist:{"title": "BYCZYNA 1588", "img": "hist_jg", "text": ["O koronę walczył arcyksiążę Maksymilian.", "Zamoyski pokonał go pod Byczyną i wziął do niewoli.", "Wygrał Zygmunt III Waza.", "Unia z Litwą trwała dalej."], "fun": "Zamoyski traktował jeńca godnie – bo to arcyksiążę."},
   waves:[[["max", 4, 1.1, 0]], [["max", 4, 1.05, 0], ["gkn", 2, 0.96, 3]], [["max", 5, 1.0, 0], ["gkn", 3, 0.92, 3]], [["max", 6, 0.95, 0], ["gkn", 4, 0.88, 3]], [["max", 7, 0.9, 0], ["gkn", 4, 0.84, 3]], [["max", 8, 0.85, 0], ["gkn", 5, 0.8, 3]], [["max", 9, 0.8, 0], ["gkn", 6, 0.76, 3]], [["max", 10, 0.75, 0], ["gkn", 6, 0.72, 3]]],
   bossL:null,
   pl:["Za Polskę!", "Nie damy się!", "Do broni!", "Ojczyzna woła!", "Bij, zabij!", "Chwała bohaterom!", "Jeszcze Polska!"] },
 { id:"kir", name:"Kircholm", year:1605, big:true, fac:"swe", grass:"grass", fort:"fort_tabor", fortW:170, fortAR:0.7161,
   flags:'pl', river:false, camp:'v2', deco:'v2',
   path:[[30, -25], [30, 140], [150, 140], [150, 40], [300, 40], [300, 250], [60, 250], [60, 340], [250, 340], [250, 405], [180, 420], [180, 478]], spots:[[85, 88], [60, 192], [101, 192], [141, 192], [205, 92], [98, 50], [245, 92], [248, 132], [248, 176], [212, 198], [198, 160]], roads:[[30, 140], [150, 140], [300, 250], [60, 250]],
   gold:280, hk:1.08, boss:"gen", roster:["pie", "raj", "pan"], music:"jg", sky:"#cfe3f0",
   intro:"1605. Chodkiewicz i husaria – mniejszość przeciw Szwedom. Kircholm!",
   unlock:{"tower": "moz", "spec": "hus", "hero": "zol"},
   hist:{"title": "KIRCHOLM 1605", "img": "hist_wi", "text": ["Chodkiewicz miał ok. 4 tysiące, Szwedzi – ponad 10 tysięcy.", "Husaria uderzyła jak burza.", "Krótkie, totalne zwycięstwo.", "Kircholm uczy się w szkołach kawalerii do dziś."], "fun": "Karol IX ledwo uciekł – podobno zmienił konia i zniknął!"},
   waves:[[["pie", 4, 1.1, 0]], [["pie", 5, 1.05, 0], ["raj", 3, 0.96, 3]], [["pie", 6, 1.0, 0], ["raj", 4, 0.92, 3]], [["pie", 7, 0.95, 0], ["raj", 5, 0.88, 3], ["pan", 3, 0.81, 5]], [["pie", 8, 0.9, 0], ["raj", 5, 0.84, 3], ["pan", 4, 0.78, 5]], [["pie", 9, 0.85, 0], ["raj", 6, 0.8, 3], ["pan", 4, 0.75, 5]], [["pie", 10, 0.8, 0], ["raj", 7, 0.76, 3], ["pan", 5, 0.72, 5]], [["pie", 11, 0.75, 0], ["raj", 7, 0.72, 3], ["pan", 5, 0.69, 5]], [["pie", 12, 0.7, 0], ["raj", 8, 0.68, 3], ["pan", 6, 0.66, 5]], [["pie", 13, 0.65, 0], ["raj", 9, 0.64, 3], ["pan", 6, 0.63, 5]], [["pie", 14, 0.6, 0], ["raj", 9, 0.6, 3], ["pan", 7, 0.6, 5]], [["pie", 15, 0.55, 0], ["raj", 10, 0.56, 3], ["pan", 7, 0.57, 5], ["gen", 1, 1, 8], ["pie", 6, 0.7, 12]]],
   bossL:{"spawn": "Szwedzki młot uderza!", "half": "Nie…!", "low": "Odwrót!", "die": "Szuchy…"},
   pl:["Za Polskę!", "Nie damy się!", "Do broni!", "Ojczyzna woła!", "Bij, zabij!", "Chwała bohaterom!", "Jeszcze Polska!"] },
 { id:"klu", name:"Kłuszyn", year:1610, big:false, fac:"mos", grass:"grass_wi", fort:"fort_tabor", fortW:150, fortAR:0.7161,
   flags:'pl', river:false, camp:'v2', deco:'v2',
   path:[[40, -25], [40, 100], [320, 100], [320, 200], [80, 200], [80, 320], [280, 320], [280, 420], [180, 450], [180, 478]], spots:[[92, 44], [60, 152], [194, 48], [264, 48], [266, 252], [225, 252], [183, 252], [133, 252], [27, 230]], roads:[[40, 100], [320, 100], [320, 200]],
   gold:260, hk:1.1, boss:null, roster:["str", "boj", "pan"], music:"ch", sky:"#e8d8b0",
   intro:"1610. Żółkiewski z husarią rozbija Moskwę pod Kłuszynem.",
   unlock:{"tower": "woz", "hero": "cho"},
   hist:{"title": "KŁUSZYN 1610", "img": "hist_ch", "text": ["Żółkiewski z husarią uderzył na wielką armię moskiewską.", "Mniejszość pokonała większość.", "Droga na Moskwę stanęła otworem.", "Jeden z największych triumfów husarii."], "fun": "Po Kłuszynie Żółkiewski wkroczył do Moskwy."},
   waves:[[["str", 4, 1.1, 0]], [["str", 4, 1.05, 0], ["boj", 2, 0.96, 3]], [["str", 5, 1.0, 0], ["boj", 3, 0.92, 3]], [["str", 6, 0.95, 0], ["boj", 4, 0.88, 3], ["pan", 3, 0.81, 5]], [["str", 7, 0.9, 0], ["boj", 4, 0.84, 3], ["pan", 3, 0.78, 5]], [["str", 8, 0.85, 0], ["boj", 5, 0.8, 3], ["pan", 4, 0.75, 5]], [["str", 9, 0.8, 0], ["boj", 6, 0.76, 3], ["pan", 4, 0.72, 5]], [["str", 10, 0.75, 0], ["boj", 6, 0.72, 3], ["pan", 5, 0.69, 5]]],
   bossL:null,
   pl:["Za Polskę!", "Nie damy się!", "Do broni!", "Ojczyzna woła!", "Bij, zabij!", "Chwała bohaterom!", "Jeszcze Polska!"] },
 { id:"cec", name:"Cecora", year:1620, big:false, fac:"ott", grass:"grass_wi", fort:"fort_tabor", fortW:150, fortAR:0.7161,
   flags:'pl', river:true, camp:'v2', deco:'v2',
   path:[[300, -25], [300, 45], [90, 95], [60, 180], [250, 215], [290, 290], [100, 330], [80, 400], [180, 425], [180, 478]], spots:[[179, 20], [268, 106], [139, 30], [153, 133], [30, 108], [189, 151], [228, 158], [271, 166], [307, 212]], roads:[[300, 45], [90, 95], [60, 180]],
   gold:250, hk:1.08, boss:null, roster:["aza", "jan", "sip", "tat"], music:"ch", sky:"#e8e0c8",
   intro:"1620. Odwrót spod Cecory. Przetrwaj napór i ocal tabor!",
   unlock:{"chest": true},
   hist:{"title": "ODWRÓT SPOD CECORY 1620", "img": "hist_ch", "text": ["Wyprawa na Turków skończyła się klęską.", "Hetman Żółkiewski zginął, chroniąc odwrót.", "Tabor bił się do końca.", "W grze to misja przetrwania: ocal tabor."], "fun": "Żółkiewski miał ponad 70 lat. Wybrał śmierć w boju."},
   waves:[[["aza", 4, 1.1, 0]], [["aza", 4, 1.05, 0], ["jan", 2, 0.96, 3]], [["aza", 5, 1.0, 0], ["jan", 3, 0.92, 3]], [["aza", 6, 0.95, 0], ["jan", 4, 0.88, 3], ["sip", 3, 0.81, 5]], [["aza", 7, 0.9, 0], ["jan", 4, 0.84, 3], ["sip", 3, 0.78, 5], ["tat", 2, 0.85, 6]], [["aza", 8, 0.85, 0], ["jan", 5, 0.8, 3], ["sip", 4, 0.75, 5], ["tat", 3, 0.85, 6]], [["aza", 9, 0.8, 0], ["jan", 6, 0.76, 3], ["sip", 4, 0.72, 5], ["tat", 3, 0.85, 6]], [["aza", 10, 0.75, 0], ["jan", 6, 0.72, 3], ["sip", 5, 0.69, 5], ["tat", 4, 0.85, 6]]],
   bossL:null,
   pl:["Za Polskę!", "Nie damy się!", "Do broni!", "Ojczyzna woła!", "Bij, zabij!", "Chwała bohaterom!", "Jeszcze Polska!"] },
 { id:"cho", name:"Chocim", year:1621, big:true, fac:"ott", grass:"grass_ch", fort:"fort_ch", fortW:180, fortAR:1.0250,
   flags:'pl', river:true, camp:'v2', deco:'v2',
   path:[[300, -25], [300, 45], [90, 95], [60, 180], [250, 215], [290, 290], [100, 330], [80, 400], [180, 425], [180, 478]], spots:[[179, 20], [268, 106], [139, 30], [153, 133], [30, 108], [189, 151], [228, 158], [271, 166], [307, 212], [191, 257], [259, 350]], roads:[[300, 45], [90, 95], [60, 180], [250, 215]],
   gold:300, hk:1.1, boss:"pas", roster:["aza", "jan", "sip"], music:"ch", sky:"#e8e0c8",
   intro:"1621. Hetman Chodkiewicz broni obozu pod Chocimiem nad Dniestrem.",
   unlock:{"spec": "ost", "hero": "kon"},
   hist:{"title": "OBRONA CHOCIMIA 1621", "img": "hist_ch", "text": ["Ogromna armia sułtana stanęła pod Chocimiem.", "Chodkiewicz bronił obozu nad Dniestrem.", "Zmarł w trakcie obrony – obóz się ostał.", "Pokój uratował Rzeczpospolitą."], "fun": "W obozie została podobno jedna beczka prochu. Turcy też mieli dość."},
   waves:[[["aza", 4, 1.1, 0]], [["aza", 5, 1.05, 0], ["jan", 3, 0.96, 3]], [["aza", 6, 1.0, 0], ["jan", 4, 0.92, 3]], [["aza", 7, 0.95, 0], ["jan", 5, 0.88, 3], ["sip", 3, 0.81, 5]], [["aza", 8, 0.9, 0], ["jan", 5, 0.84, 3], ["sip", 4, 0.78, 5]], [["aza", 9, 0.85, 0], ["jan", 6, 0.8, 3], ["sip", 4, 0.75, 5]], [["aza", 10, 0.8, 0], ["jan", 7, 0.76, 3], ["sip", 5, 0.72, 5]], [["aza", 11, 0.75, 0], ["jan", 7, 0.72, 3], ["sip", 5, 0.69, 5]], [["aza", 12, 0.7, 0], ["jan", 8, 0.68, 3], ["sip", 6, 0.66, 5]], [["aza", 13, 0.65, 0], ["jan", 9, 0.64, 3], ["sip", 6, 0.63, 5]], [["aza", 14, 0.6, 0], ["jan", 9, 0.6, 3], ["sip", 7, 0.6, 5]], [["aza", 15, 0.55, 0], ["jan", 10, 0.56, 3], ["sip", 7, 0.57, 5], ["pas", 1, 1, 8], ["aza", 6, 0.7, 12]]],
   bossL:{"spawn": "Chocim będzie mój! Evet!", "half": "Aman!", "low": "Gdzie wielbłąd?!", "die": "Pokój!"},
   pl:["Za Polskę!", "Nie damy się!", "Do broni!", "Ojczyzna woła!", "Bij, zabij!", "Chwała bohaterom!", "Jeszcze Polska!"] },
 { id:"gni", name:"Gniew", year:1626, big:false, fac:"swe", grass:"grass_ch", fort:"fort_gr", fortW:160, fortAR:0.8136,
   flags:'pl', river:true, camp:'v2', deco:'v2',
   path:[[100, -25], [100, 60], [280, 90], [280, 180], [60, 210], [60, 310], [300, 340], [300, 420], [180, 450], [180, 478]], spots:[[48, 43], [177, 20], [185, 127], [226, 134], [298, 230], [149, 145], [108, 151], [68, 156], [116, 255]], roads:[[100, 60], [280, 90], [280, 180]],
   gold:270, hk:1.12, boss:null, roster:["pie", "raj", "pan"], music:"jg", sky:"#d0e0f0",
   intro:"1626. Koniecpolski staje Szwedom pod Gniewem nad Wisłą.",
   unlock:{"chest": true},
   hist:{"title": "GNIEW 1626", "img": "hist_wi", "text": ["Szwedzi Gustawa Adolfa weszli do Prus.", "Koniecpolski starł się z nimi pod Gniewem.", "Twardy opór nad Wisłą.", "Początek wojny o ujście Wisły."], "fun": "Gustaw Adolf był mistrzem nowoczesnej armii."},
   waves:[[["pie", 4, 1.1, 0]], [["pie", 4, 1.05, 0], ["raj", 2, 0.96, 3]], [["pie", 5, 1.0, 0], ["raj", 3, 0.92, 3]], [["pie", 6, 0.95, 0], ["raj", 4, 0.88, 3], ["pan", 3, 0.81, 5]], [["pie", 7, 0.9, 0], ["raj", 4, 0.84, 3], ["pan", 3, 0.78, 5]], [["pie", 8, 0.85, 0], ["raj", 5, 0.8, 3], ["pan", 4, 0.75, 5]], [["pie", 9, 0.8, 0], ["raj", 6, 0.76, 3], ["pan", 4, 0.72, 5]]],
   bossL:null,
   pl:["Za Polskę!", "Nie damy się!", "Do broni!", "Ojczyzna woła!", "Bij, zabij!", "Chwała bohaterom!", "Jeszcze Polska!"] },
 { id:"trz", name:"Trzciana", year:1629, big:false, fac:"swe", grass:"grass_gr", fort:"fort_tabor", fortW:150, fortAR:0.7161,
   flags:'pl', river:false, camp:'v2', deco:'v2',
   path:[[200, -25], [200, 70], [80, 110], [80, 200], [260, 240], [260, 330], [100, 370], [180, 430], [180, 478]], spots:[[254, 51], [144, 34], [105, 47], [66, 60], [133, 147], [172, 167], [106, 259], [163, 272], [204, 281]], roads:[[200, 70], [80, 110], [80, 200]],
   gold:280, hk:1.14, boss:null, roster:["pie", "raj", "pan"], music:"jg", sky:"#d8ecd0",
   intro:"1629. Koniecpolski bije Szwedów pod Trzcianą.",
   unlock:{"hero": "cza"},
   hist:{"title": "TRZCIANA 1629", "img": "hist_wi", "text": ["Koniecpolski dogonił Szwedów pod Trzcianą.", "Polska jazda rozbiła oddziały króla.", "Gustaw Adolf omal nie trafił do niewoli.", "Droga do rozejmu w Altmarku."], "fun": "Gustaw Adolf zgubił kapelusz w ucieczce."},
   waves:[[["pie", 4, 1.1, 0]], [["pie", 4, 1.05, 0], ["raj", 2, 0.96, 3]], [["pie", 5, 1.0, 0], ["raj", 3, 0.92, 3]], [["pie", 6, 0.95, 0], ["raj", 4, 0.88, 3], ["pan", 3, 0.81, 5]], [["pie", 7, 0.9, 0], ["raj", 4, 0.84, 3], ["pan", 3, 0.78, 5]], [["pie", 8, 0.85, 0], ["raj", 5, 0.8, 3], ["pan", 4, 0.75, 5]], [["pie", 9, 0.8, 0], ["raj", 6, 0.76, 3], ["pan", 4, 0.72, 5]], [["pie", 10, 0.75, 0], ["raj", 6, 0.72, 3], ["pan", 5, 0.69, 5]]],
   bossL:null,
   pl:["Za Polskę!", "Nie damy się!", "Do broni!", "Ojczyzna woła!", "Bij, zabij!", "Chwała bohaterom!", "Jeszcze Polska!"] },
 { id:"och", name:"Ochmatów", year:1644, big:false, fac:"tat", grass:"grass_wi", fort:"fort_tabor", fortW:150, fortAR:0.7161,
   flags:'pl', river:false, camp:'v2', deco:'v2',
   path:[[50, -25], [50, 90], [180, 130], [300, 90], [300, 200], [180, 240], [60, 280], [60, 380], [180, 420], [180, 478]], spots:[[102, 38], [134, 62], [175, 74], [214, 63], [235, 167], [253, 51], [295, 37], [195, 180], [296, 256]], roads:[[50, 90], [180, 130], [300, 90]],
   gold:290, hk:1.15, boss:null, roster:["tat", "aza", "sip"], music:"ch", sky:"#ead8a8",
   intro:"1644. Koniecpolski rozbija Tatarów pod Ochmatowem.",
   unlock:{"hero": "kor"},
   hist:{"title": "OCHMATÓW 1644", "img": "hist_ch", "text": ["Tatarzy poszli w głąb Ukrainy.", "Koniecpolski zaskoczył ich pod Ochmatowem.", "Stepy zobaczyły polską jazdę w sile.", "Jedno z ostatnich wielkich zwycięstw hetmana."], "fun": "Tatarzy nazywali go „gniewem Bożym”."},
   waves:[[["tat", 4, 1.1, 0]], [["tat", 4, 1.05, 0], ["aza", 2, 0.96, 3]], [["tat", 5, 1.0, 0], ["aza", 3, 0.92, 3]], [["tat", 6, 0.95, 0], ["aza", 4, 0.88, 3], ["sip", 3, 0.81, 5]], [["tat", 7, 0.9, 0], ["aza", 4, 0.84, 3], ["sip", 3, 0.78, 5]], [["tat", 8, 0.85, 0], ["aza", 5, 0.8, 3], ["sip", 4, 0.75, 5]], [["tat", 9, 0.8, 0], ["aza", 6, 0.76, 3], ["sip", 4, 0.72, 5]], [["tat", 10, 0.75, 0], ["aza", 6, 0.72, 3], ["sip", 5, 0.69, 5]]],
   bossL:null,
   pl:["Za Polskę!", "Nie damy się!", "Do broni!", "Ojczyzna woła!", "Bij, zabij!", "Chwała bohaterom!", "Jeszcze Polska!"] },
 { id:"jg", name:"Jasna Góra", year:1655, big:true, fac:"swe", grass:"grass", fort:"fort", fortW:180, fortAR:0.8341,
   flags:'pl', river:false, camp:'v2', deco:'v2',
   path:[[70, -25], [70, 95], [290, 95], [290, 200], [70, 200], [70, 305], [290, 305], [290, 405], [180, 405], [180, 478]], spots:[[122, 41], [165, 43], [206, 43], [246, 43], [237, 147], [196, 148], [235, 252], [154, 148], [114, 148], [122, 253], [125, 357]], roads:[[70, 95], [290, 95], [290, 200], [70, 200]],
   gold:300, hk:1.12, boss:"gen", roster:["pie", "raj", "pan"], music:"jg", sky:"#cfe3f0",
   intro:"1655. Potop. Przeor Kordecki: klasztoru nie oddamy!",
   unlock:{"final": true, "chest": true},
   hist:{"title": "OBRONA JASNEJ GÓRY 1655", "img": "hist_jg", "text": ["Potop szwedzki zalał Rzeczpospolitą.", "Klasztor bronił przeor Kordecki.", "Kilkuset obrońców przeciw armii Müllera.", "Symbol: jeszcze Polska nie zginęła."], "fun": "W „Potopie” Kmicic wysadza działo – zmyślone, ale klimat prawdziwy!"},
   waves:[[["pie", 4, 1.1, 0]], [["pie", 5, 1.05, 0], ["raj", 3, 0.96, 3]], [["pie", 6, 1.0, 0], ["raj", 4, 0.92, 3]], [["pie", 7, 0.95, 0], ["raj", 5, 0.88, 3], ["pan", 3, 0.81, 5]], [["pie", 8, 0.9, 0], ["raj", 5, 0.84, 3], ["pan", 4, 0.78, 5]], [["pie", 9, 0.85, 0], ["raj", 6, 0.8, 3], ["pan", 4, 0.75, 5]], [["pie", 10, 0.8, 0], ["raj", 7, 0.76, 3], ["pan", 5, 0.72, 5]], [["pie", 11, 0.75, 0], ["raj", 7, 0.72, 3], ["pan", 5, 0.69, 5]], [["pie", 12, 0.7, 0], ["raj", 8, 0.68, 3], ["pan", 6, 0.66, 5]], [["pie", 13, 0.65, 0], ["raj", 9, 0.64, 3], ["pan", 6, 0.63, 5]], [["pie", 14, 0.6, 0], ["raj", 9, 0.6, 3], ["pan", 7, 0.6, 5]], [["pie", 15, 0.55, 0], ["raj", 10, 0.56, 3], ["pan", 7, 0.57, 5], ["gen", 1, 1, 8], ["pie", 6, 0.7, 12]]],
   bossL:{"spawn": "Szwedzki młot uderza!", "half": "Nie…!", "low": "Odwrót!", "die": "Szuchy…"},
   pl:["Za Polskę!", "Nie damy się!", "Do broni!", "Ojczyzna woła!", "Bij, zabij!", "Chwała bohaterom!", "Jeszcze Polska!"] },
];
const MAPI = Object.fromEntries(MAPS.map((m,i) => [m.id,i]));
const BIG_IDS = MAPS.filter(m => m.big).map(m => m.id);
const TOTAL_STARS = MAPS.length*3;

// ====== ZAPIS ======
let save = {music:true, sfx:true, speed:1, maps:{}, heroes:{}, games:0, wins:0,
  last:{hero:'zaw', spec:'ryc', towers:['luc','smo']}, seen:{}, notice:null};
try {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) Object.assign(save, JSON.parse(raw));
  else {
    // v3 → v4: reset progress, keep audio prefs
    const o = JSON.parse(localStorage.getItem(V3_KEY) || localStorage.getItem(V2_KEY) || 'null');
    if (o) {
      if (o.music !== undefined) save.music = o.music;
      if (o.sfx !== undefined) save.sfx = o.sfx;
      if (o.speed) save.speed = o.speed;
      save.notice = 'Nowa kampania OBRONA POLSKI – Bohaterowie! Postęp z v3 zresetowany (ustawienia dźwięku zostawione).';
    }
  }
  if (!save.last) save.last = {hero:'zaw', spec:'ryc', towers:['luc','smo']};
  if (!save.last.towers) save.last.towers = ['luc','smo'];
  // v4.11: Wilcze doły usunięte — wypadnij z loadoutu / seen, żeby stare save'y nie padały
  {
    const before = (save.last.towers || []).slice();
    save.last.towers = before.filter(k => k !== 'wil' && TT[k]);
    if (!save.last.towers.length) save.last.towers = ['luc', 'smo'];
    if (save.seen) delete save.seen['t_wil'];
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {}
  }
} catch(e) {}
const DBG_XP = Q.has('xp') ? +Q.get('xp') : null;
function persist() { if (SIM) return; try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch(e) {} }
const mapRec = id => save.maps[id] || {stars:0, best:0, wins:0, endless:0};
const won = id => DEBUG || mapRec(id).stars > 0;
function chapterOf(id) { return CHAPTERS.find(c => c.maps.includes(id)); }
function chapterIndex(id) { return CHAPTERS.findIndex(c => c.maps.includes(id)); }
function mapOpen(i) {
  if (DEBUG) return true;
  const m = MAPS[i];
  const ch = chapterOf(m.id);
  if (!ch) return i === 0;
  const idx = ch.maps.indexOf(m.id);
  if (idx === 0) {
    const ci = CHAPTERS.indexOf(ch);
    return ci === 0 || won(CHAPTERS[ci - 1].boss);
  }
  return won(ch.maps[idx - 1]);
}
function chapterOpen(ci) {
  if (DEBUG || ci <= 0) return true;
  return won(CHAPTERS[ci - 1].boss);
}
function chapterProgress(ci) {
  const ch = CHAPTERS[ci];
  let done = 0, stars = 0;
  for (const id of ch.maps) {
    const r = mapRec(id);
    if (r.stars > 0) done++;
    stars += r.stars|0;
  }
  return {done, total: ch.maps.length, stars, maxStars: ch.maps.length * 3};
}
function nextUnlockAfter(id) {
  const ch = chapterOf(id);
  if (!ch) return null;
  const idx = ch.maps.indexOf(id);
  if (idx < ch.maps.length - 1) return ch.maps[idx + 1];
  const ci = CHAPTERS.indexOf(ch);
  if (ci < CHAPTERS.length - 1) return CHAPTERS[ci + 1].maps[0];
  return null;
}
const HERO_FROM = {zaw:null, zol:'kir', cho:'klu', kon:'cho', cza:'trz', kor:'och'};
const HERO_START = {zaw:0, zol:200, cho:350, kon:500, cza:700, kor:900};
const TOWER_FROM = {luc:null, smo:null, kus:'glo', bal:'plo', mus:'gru', arm:'kor', rus:'ors', haj:'obe', kar:'byc', moz:'kir', woz:'klu', pik:'leg'};
const CHEST_GOLD = 100, CHEST_XP = 80;
const SPEC_FROM = {ryc:null, tat:'gru', hus:'kir', ost:'cho'};
const heroOpen = h => !HERO_FROM[h] || won(HERO_FROM[h]);
const towerOpen = k => !!TT[k] && (!TOWER_FROM[k] || won(TOWER_FROM[k]));
const specOpen = k => !SPEC_FROM[k] || won(SPEC_FROM[k]);
function heroData(id) {
  let d = save.heroes[id];
  if (!d) d = save.heroes[id] = {xp: HERO_START[id]||0, st:[0,0,0]};
  if (DBG_XP !== null && !d.dbg) { d.xp = DBG_XP; d.dbg = true; }
  return d;
}
const heroLvl = id => levelOf(heroData(id).xp);
const heroPts = id => Math.max(0, heroLvl(id) - 1 - heroData(id).st.reduce((a,b) => a+b, 0));
const mapName = id => (MAPS[MAPI[id]]||{}).name || id;
function loadoutTowers() {
  const t = (save.last && save.last.towers) || ['luc','smo'];
  return t.filter(k => TT[k] && towerOpen(k)).slice(0,4);
}

// ====== DŹWIĘK (WebAudio) ======
const AU = {ctx:null, sfxBus:null, musBus:null, noise:null, last:{}};
let SIM = false;
function audioInit() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); musicUpdate(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  try { AU.ctx = new AC(); } catch(e) { return; }
  const c = AU.ctx;
  AU.sfxBus = c.createGain(); AU.sfxBus.gain.value = 0.45; AU.sfxBus.connect(c.destination);
  AU.musBus = c.createGain(); AU.musBus.gain.value = 0; AU.musBus.connect(c.destination);
  // delikatny pogłos (echo) dla muzyki
  const dl = c.createDelay(1), fb = c.createGain(), lp = c.createBiquadFilter(), wet = c.createGain();
  dl.delayTime.value = .31; fb.gain.value = .28; lp.type = 'lowpass'; lp.frequency.value = 1800; wet.gain.value = .35;
  AU.musIn = c.createGain(); AU.musIn.connect(AU.musBus); AU.musIn.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(wet); wet.connect(AU.musBus);
  const len = c.sampleRate, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random()*2-1;
  AU.noise = b;
  musicUpdate();
}
function tone(type, f1, f2, dur, vol, delay=0) {
  const c = AU.ctx, t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f1, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t+dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t+dur);
  o.connect(g); g.connect(AU.sfxBus); o.start(t); o.stop(t+dur+.03);
}
function noise(dur, vol, ftype, freq, delay=0) {
  const c = AU.ctx, t = c.currentTime + delay, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = AU.noise; f.type = ftype; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t+dur);
  s.connect(f); f.connect(g); g.connect(AU.sfxBus); s.start(t, Math.random()*.5); s.stop(t+dur+.03);
}
const GAP = {twang:.07, arrow:.06, slash:.08, mortar:.12, shot:.07, hit:.05, coin:.06, boom:.09, tar:.2, life:.15, rus:.08, cry:.3, pop:.15};
function sfx(n) {
  if (!AU.ctx || !save.sfx || SIM) return;
  const now = AU.ctx.currentTime;
  if (AU.last[n] && now - AU.last[n] < (GAP[n]||0)) return;
  AU.last[n] = now;
  switch (n) {
    case 'shot': noise(.09,.22,'highpass',1200); tone('square',220,90,.05,.05); break;
    case 'rus': noise(.18,.35,'bandpass',900); tone('square',160,45,.14,.1); noise(.35,.12,'lowpass',400,.03); break;
    case 'boom': noise(.45,.5,'lowpass',380); tone('sine',140,38,.35,.45); break;
    case 'tar': noise(.25,.12,'bandpass',500); tone('sine',90,60,.2,.08); break;
    case 'hit': tone('square',320,160,.05,.04); break;
    case 'cry': tone('triangle',520+Math.random()*160,300,.12,.05); break;
    case 'pop': tone('sine',700,1100,.06,.05); break;
    case 'coin': tone('square',988,0,.05,.06); tone('square',1319,0,.09,.06,.05); break;
    case 'build': tone('triangle',400,800,.12,.18); noise(.08,.15,'lowpass',900); break;
    case 'up': [523,659,784].forEach((f,i)=>tone('triangle',f,0,.12,.16,i*.07)); break;
    case 'sell': tone('triangle',700,300,.18,.15); break;
    case 'life': tone('sawtooth',220,70,.35,.18); break;
    case 'horn': tone('sawtooth',196,0,.5,.12); tone('sawtooth',294,0,.5,.08,.02); break;
    case 'charge': [392,523,659,784,1047].forEach((f,i)=>tone('sawtooth',f,0,i==4?.4:.13,.12,i*.11)); noise(1.2,.2,'lowpass',250,.1); break;
    case 'boss': tone('sawtooth',110,0,.9,.18); tone('sawtooth',147,0,.9,.12,.15); noise(.8,.3,'lowpass',200); break;
    case 'win': [523,659,784,1047,784,1047].forEach((f,i)=>tone('square',f,0,.18,.1,i*.14)); break;
    case 'lose': [392,349,311,262].forEach((f,i)=>tone('sawtooth',f,0,.3,.12,i*.25)); break;
    case 'click': tone('triangle',600,0,.05,.1); break;
    case 'twang': tone('triangle',360,120,.09,.12); noise(.05,.1,'highpass',2500); break;
    case 'mortar': noise(.3,.45,'lowpass',260); tone('sine',90,40,.3,.4); break;
    case 'whistle': tone('sine',1400,500,.55,.05); break;
    case 'roar': tone('sawtooth',140,70,.6,.16); noise(.6,.25,'bandpass',300); break;
    case 'slash': noise(.12,.25,'highpass',1800); tone('triangle',900,200,.1,.08); break;
    case 'holy': [784,988,1175,1568].forEach((f,i)=>tone('sine',f,0,.4,.07,i*.06)); break;
    case 'lvl': [523,659,784,1047,1319].forEach((f,i)=>tone('triangle',f,0,.16,.14,i*.08)); break;
    case 'arrow': noise(.06,.12,'highpass',3000); break;
  }
}

// ====== MUZYKA (proceduralna, WebAudio) ======
// Własne kompozycje: inna melodia na każdą mapę (lutnia/klawesyn syntezowane na żywo).
const NOTE = {C:0,'C#':1,D:2,Eb:3,E:4,F:5,'F#':6,G:7,'G#':8,Ab:8,A:9,Bb:10,B:11};
const midi = s => { const m = /^([A-G](?:#|b)?)(\d)$/.exec(s); return 12*(+m[2]+1) + NOTE[m[1]]; };
const CH = { Dm:['D','F','A'], Gm:['G','Bb','D'], C:['C','E','G'], F:['F','A','C'], Bb:['Bb','D','F'], A:['A','C#','E'], Am:['A','C','E'], E:['E','G#','B'], G:['G','B','D'], D:['D','F#','A'] };
const TUNES = {
  jg: {bpm:88, prog:'Dm Gm C F Bb Gm A A Dm Gm C F Bb Gm A Dm F C Dm A Bb F Gm A Dm C Bb A Gm Dm A Dm', mel:[
  'D5 2 C5 1 Bb4 1 A4 2 F4 2 A4 2 D5 2','Bb4 4 G4 2 Bb4 2 D5 4','C5 2 E5 1 D5 1 C5 2 Bb4 2 A4 2 G4 2','A4 6 F4 2 A4 2 C5 2',
  'D5 2 F5 1 E5 1 D5 2 C5 2 Bb4 2 D5 2','Bb4 2 A4 2 G4 4 Bb4 4','A4 2 C#5 1 D5 1 E5 2 C#5 2 A4 4','E5 6 D5 2 C#5 4',
  'D5 2 C5 1 Bb4 1 A4 2 F4 2 A4 2 D5 2','Bb4 2 D5 2 G5 4 F5 2 E5 2','E5 2 G5 1 F5 1 E5 2 D5 2 C5 4','A4 2 C5 2 F5 6 E5 2',
  'D5 4 Bb4 2 D5 2 F5 4','E5 2 D5 2 Bb4 2 G4 2 Bb4 4','A4 2 C#5 2 E5 2 G5 2 E5 2 C#5 2','D5 8 R 4',
  'C5 4 A4 2 C5 2 F5 4','E5 2 D5 2 C5 4 G4 4','F5 2 E5 1 D5 1 C5 2 D5 2 A4 4','C#5 4 E5 4 A4 4',
  'D5 2 C5 2 Bb4 2 D5 2 F5 4','C5 2 A4 2 F4 4 A4 4','Bb4 2 A4 1 G4 1 Bb4 2 D5 2 G5 4','E5 6 C#5 2 A4 4',
  'D5 2 F5 2 A5 4 F5 4','E5 2 G5 2 E5 2 C5 2 G4 4','F5 2 D5 2 Bb4 4 D5 4','C#5 2 E5 2 A5 4 G5 4',
  'G5 2 F5 2 E5 2 D5 2 Bb4 4','A4 2 D5 2 F5 4 A4 4','A4 2 C#5 2 E5 4 C#5 4','D5 12']},
  gr: {bpm:74, prog:'Dm C Dm Dm F Dm C Dm F Dm F C Dm Am C Dm', mel:[
  'D5 4 F5 2 G5 2 A5 4','C6 4 A5 2 G5 2 A5 4','G5 2 F5 2 E5 2 D5 2 E5 4','D5 12',
  'A5 4 C6 2 D6 2 C6 4','A5 2 G5 2 A5 4 F5 4','G5 4 A5 2 G5 2 F5 2 E5 2','D5 8 R 4',
  'F5 4 G5 2 A5 2 C6 4','D6 4 C6 2 A5 2 G5 4','A5 2 C6 2 D6 4 A5 4','G5 6 F5 2 E5 4',
  'D5 2 E5 2 F5 4 G5 4','A5 4 G5 2 F5 2 E5 4','C5 4 D5 2 E5 2 F5 2 E5 2','D5 12']},
  ch: {bpm:96, prog:'Am E Am E Dm Am E Am C Dm Am E Am Dm E Am', mel:[
  'A4 2 B4 2 C5 2 B4 2 A4 4','G#4 2 A4 2 B4 4 E4 4','A4 2 C5 2 E5 4 D5 2 C5 2','B4 6 G#4 2 E4 4',
  'F4 2 G#4 2 A4 4 B4 4','C5 2 B4 2 A4 2 G#4 2 A4 4','E5 4 D5 2 C5 2 B4 4','A4 12',
  'C5 2 D5 2 E5 4 E5 4','F5 2 E5 2 D5 2 C5 2 D5 4','E5 2 D5 2 C5 2 B4 2 C5 4','B4 6 A4 2 G#4 4',
  'A4 2 C5 2 B4 2 A4 2 G#4 4','F4 4 E4 4 G#4 4','A4 2 B4 2 C5 2 B4 2 G#4 2 B4 2','A4 12']},
  wi: {bpm:104, prog:'G C G C C G D G G C G G C G D G', mel:[
  'G4 2 B4 2 D5 4 D5 4','E5 2 D5 2 C5 2 B4 2 A4 4','B4 2 D5 2 G5 4 F#5 4','E5 6 D5 2 B4 4',
  'C5 2 E5 2 G5 4 E5 4','D5 2 B4 2 G4 4 B4 4','A4 2 C5 2 F#5 4 E5 2 C5 2','D5 12',
  'G5 4 F#5 2 E5 2 D5 4','C5 2 B4 2 C5 4 E5 4','D5 2 C5 2 B4 2 A4 2 B4 4','G4 6 B4 2 D5 4',
  'E5 2 G5 2 E5 2 C5 2 A4 4','D5 4 B4 4 G4 4','A4 2 B4 2 C5 2 E5 2 D5 2 F#5 2','G5 12']},
};
function buildSong(T) {
  const ev = [], PROG = T.prog.split(' ');
  T.mel.forEach((bar, bi) => {
    const tk = bar.split(' '); let p = bi*12;
    for (let i = 0; i < tk.length; i += 2) { const n = tk[i], d = +tk[i+1]; if (n !== 'R') ev.push({p, m: midi(n), d, v: .075, k: 'mel'}); p += d; }
    const ch = CH[PROG[bi]], root = midi(ch[0] + '2') + (NOTE[ch[0]] > 7 ? -12 : 0);
    ev.push({p: bi*12, m: root, d: 10, v: .06, k: 'bas'});
    ev.push({p: bi*12 + 6, m: root + 7, d: 5, v: .03, k: 'bas'});
    const tones = ch.map(n => { let m = midi(n + '3'); if (m < 55) m += 12; return m; }).sort((a,b) => a-b);
    const arp = [tones[1], tones[2], tones[0]+12, tones[2], tones[1], tones[0]+12];
    [2,3,4,6,8,10].forEach((q, j) => ev.push({p: bi*12 + q, m: arp[j], d: 3, v: j == 1 ? .022 : .032, k: 'arp'}));
  });
  const by = []; for (const e of ev) (by[e.p] = by[e.p] || []).push(e);
  return {by, len: T.mel.length*12, six: 60/T.bpm/4};
}
const SONGS = {}; for (const k in TUNES) SONGS[k] = buildSong(TUNES[k]);
const MU = {timer:null, pos:0, t:0, on:false, song:'jg'};
function setSong(k) { if (MU.song === k) return; MU.song = k; MU.pos = 0; }
const mf = m => 440 * Math.pow(2, (m-69)/12);
function pluck(m, t, dur, vol, kind) {
  const c = AU.ctx, f = mf(m);
  const o1 = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), g2 = c.createGain(), lp = c.createBiquadFilter();
  o1.type = 'triangle'; o2.type = kind === 'bas' ? 'triangle' : 'sawtooth';
  o1.frequency.value = f; o2.frequency.value = f * (kind === 'bas' ? 2.001 : 1.004);
  g2.gain.value = kind === 'bas' ? .25 : .3;
  lp.type = 'lowpass'; lp.Q.value = .7;
  const bright = kind === 'mel' ? 7 : 4;
  lp.frequency.setValueAtTime(Math.min(9000, f*bright), t); lp.frequency.exponentialRampToValueAtTime(Math.max(200, f*1.3), t + .35);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .006);
  g.gain.exponentialRampToValueAtTime(vol*.35, t + .18); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .5);
  o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(lp); lp.connect(AU.musIn);
  o1.start(t); o2.start(t); o1.stop(t + dur + .55); o2.stop(t + dur + .55);
}
function musicTick() {
  const c = AU.ctx; if (!c) return;
  if (MU.t < c.currentTime) MU.t = c.currentTime + .05;
  while (MU.t < c.currentTime + .35) {
    const SG = SONGS[MU.song], evs = SG.by[MU.pos];
    if (evs) for (const e of evs) pluck(e.m, MU.t + (e.k === 'mel' ? Math.random()*.012 : 0), e.d*SG.six, e.v, e.k);
    MU.pos = (MU.pos + 1) % SG.len; MU.t += SG.six;
  }
}
function musicUpdate() {
  if (!AU.ctx) return;
  const want = save.music && !SIM && document.visibilityState !== 'hidden';
  const g = AU.musBus.gain, now = AU.ctx.currentTime;
  g.cancelScheduledValues(now); g.setValueAtTime(g.value, now);
  if (want) {
    g.linearRampToValueAtTime(1, now + 1.2);
    if (!MU.timer) { MU.t = now + .1; MU.timer = setInterval(musicTick, 90); musicTick(); }
  } else {
    g.linearRampToValueAtTime(0, now + .4);
    if (MU.timer) { clearInterval(MU.timer); MU.timer = null; }
  }
}



// ====== MAPA ======
let M = MAPS[0], PATH, SPOTS, WAVES, FORT, FORT_SPOT;
const SEG = []; let PLEN = 0;
function loadMap(m) {
  M = m; PATH = m.path; SPOTS = m.spots; WAVES = m.waves;
  SEG.length = 0; PLEN = 0;
  for (let i = 0; i < PATH.length - 1; i++) {
    const a = PATH[i], b = PATH[i+1], l = Math.hypot(b[0]-a[0], b[1]-a[1]);
    SEG.push({a, b, l, s: PLEN, dx: (b[0]-a[0])/l, dy: (b[1]-a[1])/l}); PLEN += l;
  }
  const fh = m.fortW*m.fortAR;
  FORT = {x: 180 - m.fortW/2, y: H - fh, w: m.fortW, h: fh};
  FORT_SPOT = {x: 180, y: FORT.y + 28};
  setSong(m.music);
}
function posAt(d) {
  if (d <= 0) { const s = SEG[0]; return {x: s.a[0] + s.dx*d, y: s.a[1] + s.dy*d, dx: s.dx, dy: s.dy}; }
  for (const s of SEG) if (d <= s.s + s.l) { const k = d - s.s; return {x: s.a[0]+s.dx*k, y: s.a[1]+s.dy*k, dx: s.dx, dy: s.dy}; }
  const s = SEG[SEG.length-1]; return {x: s.b[0], y: s.b[1], dx: s.dx, dy: s.dy};
}
loadMap(MAPS[0]);
const HPK = +(Q.get('hps') || 0.6), CM = +(Q.get('cm') || 1.8), BOSSK = +(Q.get('bk') || 2.2);
const HP_SCALE = w => (1 + HPK*(w-1)) * (w >= 7 ? 1 + (w-6)*.08 : 1);
const F = () => FACT[M.fac];

// ====== STAN GRY ======
let S;
let PICK = {hero:'zaw', spec:'ryc', towers:['luc','smo']};
let ENDLESS = false;
function newGame() {
  const sp = SPECS[PICK.spec] || SPECS.ryc;
  const towers = ((PICK.towers && PICK.towers.length) ? PICK.towers.slice(0,4) : loadoutTowers()).filter(k => TT[k] && k !== 'wil');
  const bonus = save.bonusGold|0;
  if (bonus) { save.bonusGold = 0; persist(); }
  S = {gold: (DEBUG ? 5000 : M.gold) + bonus, lives:START_LIVES, wave:0, time:0, queue:[], enemies:[], towers:[], proj:[], parts:[], floats:[],
       hussars:[], tatars:[], knights:[], corpses:[], bubbles:[], decals:[], countdown:null, cdArmed:false, paid:true,
       spec: PICK.spec, specLeft: sp.uses, charge:0, aiming:false, loadout: towers.length ? towers : ['luc','smo'],
       over:false, result:null, shake:0, fortFlash:0, selected:null, banner:null, running:false, paused:false,
       speed:save.speed || 1, kills:0, bossStep:0, tracers:[], beams:[], nextChat:6, lastCry:-9, lastGate:-99, lastFlee:-9, lastSlow:-9,
       xp:0, prayT:0, hero:null, endless:ENDLESS, endlessWave:0};
  makeHero(PICK.hero || 'zaw');
  closeMenu();
}

// ---- dymki z napisami ----
// kind: 'pl' (obrońcy), 'sw' (wróg), 'boss', 'hus', 'fort', 'hero'
function say(text, kind, o, dy, prio) {
  if (!S) return false;
  const live = S.bubbles.filter(b => b.life > 0);
  if (!prio && (live.length >= 2 || S.time < (S.quietUntil||0))) return false;
  if (live.length >= 4) live[0].life = Math.min(live[0].life, .15);
  for (const b of live) if (b.o === o) b.life = Math.min(b.life, .1);
  const life = 1.6 + text.length*.035;
  S.bubbles.push({text, kind, o, dy, x: o.x, y: o.y, life, max: life, w: 0});
  if (!prio) S.quietUntil = S.time + 2.2;
  sfx('pop');
  return true;
}
function towerHead(t) { return t.gy - 14; }

function endlessWaveDef(w) {
  const roster = M.roster, boss = M.boss;
  const n = Math.min(40, 8 + Math.floor(w*1.6));
  const iv = Math.max(.28, .9 - w*0.02);
  const wave = [[roster[0], Math.ceil(n*0.5), iv, 0]];
  if (roster[1]) wave.push([roster[1], Math.ceil(n*0.3), iv*1.1, 2]);
  if (roster[2]) wave.push([roster[2], Math.ceil(n*0.2), iv*1.2, 4]);
  if (w % 10 === 0 && boss) wave.push([boss, 1, 1, 6]);
  return wave;
}
function startWave(early) {
  if (S.over) return;
  if (!S.endless && S.wave >= WAVES.length) return;
  if (early && S.countdown !== null) {
    const bonus = Math.ceil(S.countdown)*2;
    if (bonus > 0) { S.gold += bonus; floatT(180, FORT.y + 50, '+'+bonus+' zł za odwagę!', '#ffe14d', 14); sfx('coin'); }
  }
  S.wave++; S.countdown = null; S.cdArmed = true; S.paid = false;
  const w = S.wave;
  const def = S.endless ? endlessWaveDef(w) : WAVES[w-1];
  const hkEnd = S.endless ? (1 + (w-1)*0.08) : 1;
  for (const [type, n0, iv0, delay] of def) {
    const n = ET[type].boss ? n0 : Math.round(n0*CM), iv = iv0/CM;
    for (let i = 0; i < n; i++) S.queue.push({t: S.time + delay + i*iv, type, w, hkMul: hkEnd});
  }
  S.queue.sort((a,b) => a.t - b.t);
  if (!S.endless && w === WAVES.length && M.boss) banner('Fala '+w+' – OSTATNIA!', 'Nadciąga ' + ET[M.boss].name + '!');
  else if (S.endless && w % 10 === 0) banner('Ostatni bastion – fala '+w, 'Mini-boss!');
  else banner((S.endless?'Bastion · ':'')+'Fala '+w, def.map(g=>ET[g[0]].name).filter((v,i,a)=>a.indexOf(v)===i).join(' · '));
  say(pick(w === 1 ? M.pl : M.pl.concat(PL.wave)), 'fort', FORT_SPOT, 0, true);
  S.waveShout = true; S.nextChat = Math.max(S.nextChat, 4);
  // hero return after resting through a wave
  if (S.hero && S.hero.restUntilWave != null && S.wave > S.hero.restUntilWave) heroReturn();
  sfx('horn');
}
function banner(text, sub, t=2.2) { S.banner = {text, sub, t, max:t}; }
function floatT(x, y, text, color, size=12, life=.9) { if (S.floats.length < 70) S.floats.push({x, y, text, color, size, life, max:life}); }
function burst(x, y, color, n, spd=80, size=3, life=.5, grav=0) {
  for (let i = 0; i < n && S.parts.length < 350; i++) { const a = Math.random()*6.283, v = rnd(.3,1)*spd;
    S.parts.push({x, y, vx:Math.cos(a)*v, vy:Math.sin(a)*v, life:rnd(.5,1)*life, max:life, color, size:rnd(.6,1.2)*size, grav, kind:'dot'}); }
}
function smoke(x, y, n, size=8, col='#e8e4dc') {
  for (let i = 0; i < n && S.parts.length < 350; i++) S.parts.push({x:x+rnd(-6,6), y:y+rnd(-6,6), vx:rnd(-15,15), vy:rnd(-30,-5), life:rnd(.5,.9), max:.9, color:col, size:rnd(.6,1.2)*size, grav:0, kind:'smoke'});
}

function spawn(type, w, hkMul) {
  const T = ET[type], hp = Math.round(T.hp * (T.boss ? BOSSK : HP_SCALE(w)) * M.hk * (hkMul||1));
  const e = {type, hp, max:hp, d:-OFF-20, lane:T.boss?0:rnd(-7,7), x:0, y:0, face:1, slowT:0, slowA:0, stunT:0, flash:0, seed:Math.random()*10, dead:false, said:0, roadSlow:0};
  const p = posAt(e.d); e.x = p.x; e.y = p.y;
  S.enemies.push(e);
  if (T.boss) { S.shake = 12; sfx('boss'); banner(T.name.toUpperCase() + '!', 'Zatrzymaj go przed bramą!', 2.5); e.sayAt = 1.5; }
  else if (S.waveShout) { S.waveShout = false; e.sayAt = 1.2; }
}

function damage(e, amt, src) {
  if (e.dead) return;
  const T = ET[e.type];
  if (src === 'mus' || src === 'smo') amt *= (1 - T.armor);
  else if (src === 'kus' || src === 'hero') amt *= (1 - T.armor*.5);
  amt = Math.max(1, Math.round(amt));
  e.hp -= amt; e.flash = .12;
  if (src !== 'smo' || amt >= 10) floatT(e.x + rnd(-5,5), e.y - T.h + 4, String(amt), src==='hus'||src==='hero' ? '#ffdd55' : src==='rus' ? '#ffb46b' : '#fff', src==='arm'||src==='hus'||src==='rus'||src==='moz'||src==='hero' ? 13 : 10, .55);
  if (e.hp <= 0) {
    e.dead = true; S.kills++;
    const g = T.gold; S.gold += g;
    gainXp(g*.04 + (T.boss ? 40 : 0));
    floatT(e.x, e.y - 22, '+'+g, '#ffe14d', 14, 1);
    burst(e.x, e.y - 6, '#ffd84a', 6, 70, 2.5, .5);
    sfx('coin');
    addCorpse(e, src);
    if (src === 'hero' && S.hero && Math.random() < .25) heroSay(pick(HEROES[S.hero.id].lines.concat(PL.kill)));
    if (T.boss) { S.shake = 16; for (let i=0;i<4;i++) burst(e.x+rnd(-15,15), e.y+rnd(-15,15), ['#ff8a00','#ffd84a','#ff3b3b','#fff'][i], 20, 160, 5, .9); smoke(e.x, e.y, 14, 14); sfx('boom');
      if (e.type === M.boss) banner(T.name + ' pokonany!', 'Wróg w odwrocie!', 2); }
  } else {
    sfx('hit');
    if (T.boss) {
      const BL = e.type === M.boss ? M.bossL : {half:'Aman! Za mocno!', low:'Gdzie mój koń?!'};
      if (!e.sHalf && e.hp < e.max*.5) { e.sHalf = true; say(BL.half, 'boss', e, T.h + 6, true); }
      else if (!e.sLow && e.hp < e.max*.2) { e.sLow = true; say(BL.low, 'boss', e, T.h + 6, true); }
    } else if (S.time - S.lastCry > .9 && Math.random() < .18) {
      S.lastCry = S.time; floatT(e.x + rnd(-8,8), e.y - T.h - 2, pick(F().hurt), '#bfe0ff', 11, .7); sfx('cry');
    }
  }
}
function addCorpse(e, src) {
  if (S.corpses.length > 28) S.corpses.shift();
  const T = ET[e.type];
  const flee = !T.boss && src !== 'arm' && src !== 'moz' && Math.random() < .35;
  const c = {type: e.type, x: e.x, y: e.y, face: e.face, t: 0, mode: flee ? 'flee' : 'fall', dur: flee ? 1.1 : 1.2, dir: Math.random() < .5 ? 1 : -1, seed: e.seed};
  if (flee) {
    c.face = -e.face; c.vx = -e.face * 55 * (T.spd > 60 ? 1.6 : 1); c.vy = rnd(-20, 10);
    if (S.time - S.lastFlee > 6 && Math.random() < .5) { S.lastFlee = S.time; say(pick(F().flee), 'sw', c, T.h + 4, false); }
  }
  if (T.boss) say(e.type === M.boss ? M.bossL.die : 'Odwrót! Odwrót!', 'boss', c, T.h, true);
  S.corpses.push(c);
}

// ====== WIEŻE ======
function towerGeom(t) {
  const w = TW[t.type][t.lvl], img = IMG['t_'+t.type+t.lvl], h = img && img.width ? w*img.height/img.width : w*1.2;
  t.w = w; t.h = h; t.by = t.y + 13; t.gy = t.by - h*(1 - TOPF[t.type][t.lvl]);
}
function build(i, type, onRoad) {
  if (S.over || !TT[type] || !towerOpen(type)) return false;
  if (S.loadout && !S.loadout.includes(type)) return false;
  const road = !!TT[type].road;
  if (road !== !!onRoad) return false;
  const key = onRoad ? ('r'+i) : i;
  if (S.towers.some(t => t.spot === key)) return false;
  const c = TT[type].cost[0]; if (S.gold < c) return false;
  S.gold -= c;
  const [x, y] = onRoad ? (M.roads[i] || PATH[Math.min(PATH.length-2, i+1)]) : SPOTS[i];
  const t = {spot:key, x, y, type, lvl:0, cd:.2, ang:-Math.PI/2, anim:0, spent:c, pop:1, seed:Math.random()*6, onRoad:!!onRoad};
  towerGeom(t); S.towers.push(t);
  burst(x, y, '#e8d5a8', 14, 90, 3, .5); smoke(x, y+6, 5, 7); sfx('build');
  if (S.towers.length === 1 || Math.random() < .3) say(pick(PL.build.concat(PL.tower[type]||[])), 'pl', {x:t.x, y:towerHead(t)}, 0, false);
  return true;
}
function upgrade(t) {
  if (!t || !TT[t.type] || t.lvl >= 2) return false;
  const c = TT[t.type].cost[t.lvl+1]; if (S.gold < c) return false;
  S.gold -= c; t.lvl++; t.spent += c; t.pop = 1; towerGeom(t);
  burst(t.x, t.y - 10, '#ffd84a', 18, 110, 3, .6); floatT(t.x, t.gy - 18, 'Poziom '+(t.lvl+1)+'!', '#7dff6a', 14); sfx('up');
  if (Math.random() < .5) say(pick(PL.upg), 'pl', {x:t.x, y:towerHead(t)}, 0, false);
  return true;
}
function sell(t) {
  const r = Math.floor(t.spent*.7); S.gold += r; S.towers.splice(S.towers.indexOf(t), 1);
  floatT(t.x, t.y-20, '+'+r, '#ffe14d', 14); smoke(t.x, t.y, 6); sfx('sell');
}
function towerStat(t, k) { return TT[t.type] ? TT[t.type][k][t.lvl] : 0; }

// ====== ATAKI SPECJALNE ======
function frontEnemy() { let f = null; for (const e of S.enemies) if (!e.dead && !ET[e.type].boss && e.d > 0 && (!f || e.d > f.d)) f = e; return f; }
function specReady() { return S.specLeft > 0 && S.charge <= 0 && !S.over && S.running && !S.paused; }
function useSpec() {
  if (S.aiming) { S.aiming = false; sfx('click'); return false; }
  if (!specReady()) return false;
  if (S.spec === 'ost') { S.aiming = true; sfx('click'); banner('Wskaż cel!', 'Dotknij miejsce na planszy', 1.4); closeMenu(); if (S.hero) S.hero.sel = false; return true; }
  return fireSpec();
}
function spendSpec() { S.specLeft--; S.charge = S.specLeft > 0 ? SPECS[S.spec].cd : 0; }
function fireSpec(x, y) {
  const sp = SPECS[S.spec], fe = frontEnemy();
  if (S.spec === 'hus' || S.spec === 'ryc') {
    spendSpec();
    const dmg = (S.spec === 'hus' ? 90 : 70) + 25*S.wave;
    const n = S.spec === 'hus' ? 6 : 5;
    for (let i = 0; i < n; i++) S.hussars.push({d: PLEN + i*26, hit: new Set(), dmg, lane: (i%2 ? 7 : -7), seed: i*1.3, kind: S.spec});
    banner(S.spec === 'hus' ? 'SZARŻA HUSARII!' : 'SZARŻA RYCERSTWA!', S.specLeft ? `Zostało: ${S.specLeft}/${sp.uses}` : 'Ostatnia szarża!', 1.6); S.shake = 6; sfx('charge');
    say(pick(F()[S.spec] || F().hus), 'sw', fe || FORT_SPOT, fe ? ET[fe.type].h + 4 : 0, true);
    S.husShout = 0.9;
  } else if (S.spec === 'ost') {
    spendSpec(); S.aiming = false;
    const dmg = 70 + 15*S.wave;
    for (let i = 0; i < 6; i++) { const tx = x + rnd(-26, 26), ty = y + rnd(-20, 20), dur = .75 + i*.13;
      S.proj.push({sx: tx + 60, sy: -OFF - 30, tx, ty, t: 0, dur, dmg, splash: 40, src:'arm', fall:true}); }
    sfx('whistle'); banner('OSTRZAŁ!', S.specLeft ? `Zostało salw: ${S.specLeft}/${sp.uses}` : 'Ostatnia salwa!', 1.2);
    say(pick(PL.ost), 'fort', FORT_SPOT, 0, true);
    S.ostShout = 1.1; S.ostAt = {x, y};
  } else if (S.spec === 'tat') {
    spendSpec();
    const dmg = 25 + 6*S.wave;
    for (let i = 0; i < 5; i++) S.tatars.push({d: PLEN - 10 + i*24, cd: rnd(0,.5), dmg, lane: (i%2 ? 6 : -6), seed: i*1.7});
    banner('POSIŁKI TATARSKIE!', S.specLeft ? `Zostało: ${S.specLeft}/${sp.uses}` : 'Ostatni oddział!', 1.6); sfx('charge');
    S.tatShout = 1.0;
    if (fe) setTimeout(() => { if (S && !fe.dead) say(pick(F().tat), 'sw', fe, ET[fe.type].h + 4, true); }, SIM ? 0 : 1800);
  }
  return true;
}

// ====== BOHATER ======
function heroStats(id) {
  const B = HEROES[id], d = heroData(id), L = heroLvl(id), [s, k, u] = d.st;
  // uncapped: each point = +2% to that stat (shown as %)
  return {hp: Math.round(B.hp*(1 + .08*(L-1))*(1 + .02*k)), dmg: Math.round(B.dmg*(1 + .07*(L-1))*(1 + .02*s)), power: 1 + .02*u + .03*(L-1),
          abCd: Math.max(4, Math.round(B.abCd*(1 - .015*u))), lvl: L, tier: tierOf(L),
          pctS: s*2, pctK: k*2, pctU: u*2};
}
function makeHero(id) {
  if (!HEROES[id] || !heroOpen(id)) id = 'zaw';
  const st = heroStats(id), p = posAt(PLEN - 95);
  S.hero = {id, x: p.x, y: p.y, rx: p.x, ry: p.y, tx: null, ty: null, hp: st.hp, ...st, max: st.hp, cd: 0, dead: false, limp: false, restUntilWave: null,
            face: 1, anim: 0, walk: 0, eng: [], abT: 8, sel: false, idle: 0, xp0: heroData(id).xp, nextLine: 12};
}
function heroLimp() {
  const h = S.hero; if (!h || h.limp) return;
  h.limp = true; h.dead = true; h.sel = false; h.restUntilWave = S.wave === 0 ? 1 : S.wave; // ≥1 pełna fala
  for (const e of h.eng) e.blockBy = null; h.eng = [];
  h.tx = FORT_SPOT.x; h.ty = FORT_SPOT.y + 20;
  banner(HEROES[h.id].name + ' ranny!', 'Odpoczywa w twierdzy ≥1 falę', 2.2);
  heroSay('Do twierdzy…', true); sfx('hurt');
}
function heroReturn() {
  const h = S.hero; if (!h || !h.limp) return;
  h.limp = false; h.dead = false; h.restUntilWave = null;
  const st = heroStats(h.id); h.max = st.hp; h.hp = st.hp; h.dmg = st.dmg; h.power = st.power;
  const p = posAt(PLEN - 95); h.x = p.x; h.y = p.y; h.rx = p.x; h.ry = p.y; h.tx = null; h.ty = null;
  banner(HEROES[h.id].name + ' wraca!', 'Znów w szeregu', 1.8); heroSay(pick(HEROES[h.id].lines), true); sfx('horn');
}
function heroSay(text, prio) { const h = S.hero; if (h && !h.dead) say(text, 'hero', h, 44, prio); }
function gainXp(n) {
  if (S.endless) n *= 0.35;
  S.xp += n;
  const h = S.hero; if (!h || SIM_NOXP) return;
  const L = levelOf(h.xp0 + S.xp);
  if (L > h.lvl) {
    const oldTier = h.tier, d = heroData(h.id), keep = d.xp;
    d.xp = h.xp0 + S.xp; const st = heroStats(h.id); d.xp = keep;
    const ratio = h.hp / h.max;
    Object.assign(h, st); h.max = st.hp; h.hp = Math.max(1, Math.round(st.hp*Math.max(ratio, .5)));
    if (h.dead) return;
    floatT(h.x, h.y - 50, 'Poziom ' + L + '!', '#7dff6a', 15, 1.4); burst(h.x, h.y - 20, '#ffe14d', 20, 110, 3, .7); sfx('lvl');
    if (h.tier !== oldTier) { floatT(h.x, h.y - 66, 'Nowa zbroja!', '#ffd84a', 14, 1.8); heroSay(HEROES[h.id].lvl, true); for (let i = 0; i < 3; i++) burst(h.x, h.y - 20, ['#fff','#ffd84a','#ff3b3b'][i], 14, 140, 3, .8); }
  }
}
let SIM_NOXP = false;
function heroMove(x, y) {
  const h = S.hero; if (!h || h.dead) return;
  x = Math.max(12, Math.min(W - 12, x)); y = Math.max(-OFF + 30, Math.min(FORT.y + 10, y));
  h.tx = x; h.ty = y; h.rx = x; h.ry = y; h.sel = false;
  for (const e of h.eng) e.blockBy = null; h.eng = [];
  if (Math.random() < .5) heroSay(pick(HEROES[h.id].go));
  S.parts.push({x, y, vx:0, vy:0, life:.5, max:.5, color:'#ffe14d', size:18, grav:0, kind:'ring'});
  sfx('click');
}
function heroAbility() {
  const h = S.hero; if (!h || h.dead || h.abT > 0 || S.over || !S.running || S.paused) return false;
  h.abT = h.abCd; const B = HEROES[h.id], P = h.power;
  heroSay(B.abSay, true);
  if (h.id === 'kor') {
    S.prayT = 8; S.prayX = h.x; S.prayY = h.y; h.hp = Math.min(h.max, h.hp + h.max*.4*P);
    S.parts.push({x:h.x, y:h.y, vx:0, vy:0, life:.9, max:.9, color:'#ffe680', size:120, grav:0, kind:'ring'}); burst(h.x, h.y - 20, '#fff6b0', 24, 90, 3, 1, -40); sfx('holy');
  } else if (h.id === 'zaw') {
    for (const e of S.enemies) if (!e.dead && Math.hypot(e.x-h.x, e.y-h.y) < 55) { damage(e, 120*P, 'hero'); e.stunT = Math.max(e.stunT, 1.5); }
    S.parts.push({x:h.x, y:h.y, vx:0, vy:0, life:.4, max:.4, color:'#ffffff', size:55, grav:0, kind:'ring'}); burst(h.x, h.y - 10, '#e8f0ff', 18, 160, 3, .4); S.shake = 6; sfx('slash'); sfx('boom');
  } else if (h.id === 'cho') {
    for (const e of S.enemies) if (!e.dead && Math.hypot(e.x-h.x, e.y-h.y) < 100) { damage(e, 70*P, 'hero'); e.stunT = Math.max(e.stunT, ET[e.type].boss ? 1 : 2.5); }
    S.parts.push({x:h.x, y:h.y, vx:0, vy:0, life:.7, max:.7, color:'#ff5a3a', size:100, grav:0, kind:'ring'}); S.shake = 5; sfx('horn');
  } else if (h.id === 'sob') {
    for (const e of S.enemies) if (!e.dead && Math.hypot(e.x-h.x, e.y-h.y) < 120) { damage(e, 100*P, 'hero'); if (!ET[e.type].boss) { e.d = Math.max(-OFF, e.d - 60); e.blockBy = null; } }
    h.eng = [];
    S.parts.push({x:h.x, y:h.y, vx:0, vy:0, life:.8, max:.8, color:'#ffd84a', size:120, grav:0, kind:'ring'}); S.shake = 8; sfx('roar');
  }
  return true;
}
function updateHero(dt) {
  const h = S.hero; if (!h) return;
  if (h.abT > 0) h.abT = Math.max(0, h.abT - dt);
  if (h.anim > 0) h.anim -= dt*4;
  if (h.limp || h.dead) {
    // limping toward fort
    if (h.tx != null) {
      const dx = h.tx - h.x, dy = h.ty - h.y, l = Math.hypot(dx, dy);
      if (l < 4) { h.tx = null; h.x = FORT_SPOT.x; h.y = FORT_SPOT.y + 20; }
      else { const v = Math.min(l, 40*dt); h.x += dx/l*v; h.y += dy/l*v; }
    }
    return;
  }
  const B = HEROES[h.id];
  h.eng = h.eng.filter(e => !e.dead && e.blockBy === h);
  // ruch na rozkaz
  if (h.tx !== null) {
    const dx = h.tx - h.x, dy = h.ty - h.y, l = Math.hypot(dx, dy);
    if (l < 2) { h.tx = null; }
    else { const v = Math.min(l, B.spd*dt); h.x += dx/l*v; h.y += dy/l*v; if (Math.abs(dx) > 1) h.face = dx < 0 ? -1 : 1; h.walk += dt; }
  } else {
    // blokowanie wrogów
    const cap = B.ranged ? 1 : 2, br = B.ranged ? 18 : 22;
    if (h.eng.length < cap) {
      for (const e of S.enemies) {
        if (h.eng.length >= cap) break;
        if (e.dead || e.blockBy || ET[e.type].boss || e.d < 0) continue;
        if (Math.hypot(e.x - h.x, e.y - h.y) < br) { e.blockBy = h; h.eng.push(e); }
      }
    }
    // szukanie wroga w pobliżu punktu zbiórki (wręcz)
    let goal = null;
    if (!B.ranged && !h.eng.length) {
      let best = null, bd = 60;
      for (const e of S.enemies) { if (e.dead || e.blockBy || ET[e.type].boss || e.d < 0) continue; const dd = Math.hypot(e.x - h.rx, e.y - h.ry); if (dd < bd) { bd = dd; best = e; } }
      if (best) goal = {x: best.x, y: best.y};
    }
    if (!goal && !h.eng.length) goal = {x: h.rx, y: h.ry};
    if (h.eng.length && !B.ranged) { const e = h.eng[0]; goal = Math.hypot(e.x - h.x, e.y - h.y) > 16 ? {x: e.x - (e.face||1)*12, y: e.y} : null; }
    if (goal) { const dx = goal.x - h.x, dy = goal.y - h.y, l = Math.hypot(dx, dy); if (l > 3) { const v = Math.min(l, B.spd*dt); h.x += dx/l*v; h.y += dy/l*v; if (Math.abs(dx) > 1) h.face = dx < 0 ? -1 : 1; h.walk += dt; } }
  }
  // atak
  h.cd -= dt;
  let tgt = null;
  if (B.ranged) { for (const e of S.enemies) if (!e.dead && e.d > 0 && Math.hypot(e.x-h.x, e.y-h.y) <= B.range && (!tgt || e.d > tgt.d)) tgt = e; }
  else { tgt = h.eng[0] || null; if (!tgt) for (const e of S.enemies) if (!e.dead && e.d > 0 && Math.hypot(e.x-h.x, e.y-h.y) <= B.range + (ET[e.type].boss ? 10 : 0)) { tgt = e; break; } }
  if (tgt) {
    h.face = tgt.x < h.x ? -1 : 1;
    if (h.cd <= 0) {
      h.cd = B.rate; h.anim = 1;
      if (B.ranged) { S.beams.push({x1:h.x + h.face*8, y1:h.y - 30, x2:tgt.x, y2:tgt.y - 12, life:.18, max:.18}); burst(tgt.x, tgt.y - 12, '#fff3a0', 5, 60, 2, .3); sfx('holy'); }
      else { burst(tgt.x - h.face*4, tgt.y - 14, '#ffffff', 4, 80, 2, .2); sfx('slash'); }
      damage(tgt, h.dmg, 'hero');
    }
  }
  // obrażenia od wrogów
  let hurt = 0;
  for (const e of h.eng) if (!e.dead && e.stunT <= 0) hurt += ET[e.type].atk;
  for (const e of S.enemies) if (!e.dead && ET[e.type].boss && Math.hypot(e.x-h.x, e.y-h.y) < 30) hurt += ET[e.type].atk*.6;
  if (hurt > 0) { h.hp -= hurt*dt; h.idle = 0; }
  else { h.idle += dt; if (h.idle > 3 && h.hp < h.max) h.hp = Math.min(h.max, h.hp + h.max*.06*dt); }
  if (h.hp <= 0) {
    h.hp = 0;
    smoke(h.x, h.y, 6, 9); say(B.die, 'hero', {x:h.x, y:h.y}, 30, true);
    heroLimp();
  }
  // gadanie
  h.nextLine -= dt;
  if (h.nextLine <= 0) { h.nextLine = rnd(12, 20); if (tgt || h.eng.length) heroSay(pick(B.lines)); }
}

// ====== AKTUALIZACJA ======
function update(dt) {
  if (!S.running || S.over || S.paused) { updateFx(dt); return; }
  S.time += dt;
  if (S.charge > 0) S.charge = Math.max(0, S.charge - dt);
  if (S.prayT > 0) S.prayT -= dt;
  while (S.queue.length && S.queue[0].t <= S.time) { const q = S.queue.shift(); spawn(q.type, q.w, q.hkMul); }
  if (S.cdArmed && !S.queue.length) { S.cdArmed = false; if (S.wave < WAVES.length) S.countdown = CD_BETWEEN; }
  if (S.countdown !== null) { S.countdown -= dt; if (S.countdown <= 0) startWave(false); }

  // wrogowie
  for (const e of S.enemies) {
    if (e.dead) continue;
    const T = ET[e.type];
    if (e.slowT > 0) e.slowT -= dt;
    if (e.flash > 0) e.flash -= dt;
    if (e.stunT > 0) { e.stunT -= dt; continue; }
    // hajducy / wóz (blokery)
    for (const t of S.towers) {
      if (!TT[t.type] || !TT[t.type].block) continue;
      if (Math.hypot(e.x - t.x, e.y - t.y) > (towerStat(t,'range')||20)) continue;
      if (!ET[e.type].boss) {
        if (!t.thp) t.thp = TT[t.type].hp[t.lvl];
        if (t.thp > 0 && !e.blockBy) { e.blockBy = t; t.eng = (t.eng||[]); if (!t.eng.includes(e)) t.eng.push(e); }
      }
    }
    if (e.blockBy && e.blockBy !== S.hero) {
      const bl = e.blockBy;
      if (bl.dead || (bl.thp !== undefined && bl.thp <= 0)) { e.blockBy = null; }
      else {
        e.face = bl.x < e.x ? -1 : 1;
        // enemy damages blocker
        if (bl.thp !== undefined) {
          bl.thp -= T.atk * dt;
          if (bl.thp <= 0) { floatT(bl.x, bl.y-20, 'Zniszczone!', '#ff6b6b', 12); S.towers.splice(S.towers.indexOf(bl),1); e.blockBy=null; smoke(bl.x,bl.y,8); }
        }
        continue;
      }
    }
    if (e.blockBy && (e.blockBy.dead || e.blockBy !== S.hero)) e.blockBy = null;
    if (e.blockBy) { e.face = e.blockBy.x < e.x ? -1 : 1; continue; }
    e.d += T.spd * (e.slowT > 0 ? 1 - e.slowA : 1) * dt;
    const p = posAt(e.d), ln = e.lane * Math.min(1, (PLEN - e.d)/40); e.x = p.x - p.dy*ln; e.y = p.y + p.dx*ln; if (p.dx) e.face = p.dx < 0 ? -1 : 1;
    if (e.sayAt !== undefined && e.d > 5) { e.sayAt -= dt; if (e.sayAt <= 0) { e.sayAt = undefined; say(T.boss ? (e.type === M.boss ? M.bossL.spawn : 'Lehowie? Zaraz zobaczymy!') : pick(F().spawn), T.boss ? 'boss' : 'sw', e, T.h + 4, true); } }
    if (e.d >= PLEN) {
      e.dead = true; S.lives = Math.max(0, S.lives - T.lives); S.fortFlash = .4; S.shake = Math.max(S.shake, T.boss?14:5);
      floatT(180, FORT.y + 50, '-'+T.lives+' ❤', '#ff4d4d', 16); sfx('life'); burst(180, FORT.y + 50, '#ff5a5a', 10, 90, 3, .5);
      if (S.time - S.lastGate > 12 && S.lives > 0) { S.lastGate = S.time; say(pick(PL.leak), 'fort', FORT_SPOT, 0, true); }
      if (S.lives <= 0) { endGame(false); }
    }
    if (T.boss) { S.bossStep += dt; if (S.bossStep > .7) { S.bossStep = 0; S.shake = Math.max(S.shake, 2.5); } }
  }
  updateHero(dt);

  // wieże (odfiltruj usunięte typy np. stare wil)
  S.towers = S.towers.filter(t => TT[t.type]);
  for (const t of S.towers) {
    const pray = S.prayT > 0 && Math.hypot(t.x - S.prayX, t.y - S.prayY) < 130;
    t.pray = pray;
    t.cd -= dt * (pray ? 1.5 : 1); if (t.anim > 0) t.anim -= dt*4; if (t.pop > 0) t.pop = Math.max(0, t.pop - dt*2.5);
    const R = towerStat(t, 'range');
    t.busy = false;
    if (t.type === 'smo') {
      if (t.cd <= 0) {
        const inR = S.enemies.filter(e => !e.dead && Math.hypot(e.x-t.x, e.y-t.y) <= R);
        if (inR.length) {
          t.busy = true;
          t.cd = towerStat(t,'rate'); t.anim = 1;
          for (const e of inR) { e.slowT = 1.3; e.slowA = Math.max(e.slowA*(e.slowT>0?1:0), towerStat(t,'slow')); damage(e, towerStat(t,'dmg'), 'smo');
            if (S.parts.length < 330) S.parts.push({x:e.x+rnd(-4,4), y:e.y-8, vx:rnd(-20,20), vy:rnd(-60,-20), life:.5, max:.5, color:'#2a1a10', size:3, grav:200, kind:'dot'}); }
          S.parts.push({x:t.x, y:t.y, vx:0, vy:0, life:.45, max:.45, color:'#ff8a1a', size:R, grav:0, kind:'ring'});
          smoke(t.x, t.gy - 6, 2, 7, '#5a5048');
          sfx('tar');
          if (S.time - S.lastSlow > 14 && Math.random() < .25) { const e = inR.find(e => !e.dead && !ET[e.type].boss); if (e) { S.lastSlow = S.time; say(pick(F().slow), 'sw', e, ET[e.type].h + 4, false); } }
        }
      } else t.busy = S.enemies.some(e => !e.dead && Math.hypot(e.x-t.x, e.y-t.y) <= R);
      continue;
    }
    if (t.type === 'pik') {
      if (t.cd <= 0) {
        let best = null;
        for (const e of S.enemies) {
          if (e.dead || e.d < 0) continue;
          const dd = Math.hypot(e.x - t.x, e.y - t.y);
          if (dd <= R && (!best || e.d > best.d)) best = e;
        }
        if (best) {
          t.busy = true;
          t.cd = towerStat(t, 'rate'); t.anim = 1;
          t.thrustX = best.x; t.thrustY = best.y;
          t.ang = Math.atan2(best.y - 8 - t.gy, best.x - t.x);
          damage(best, towerStat(t, 'dmg'), 'pik');
          best.slowT = Math.max(best.slowT, .75);
          best.slowA = Math.max(best.slowA, towerStat(t, 'slow'));
          best.stunT = Math.max(best.stunT, towerStat(t, 'hold'));
          const ang = t.ang, len = Math.min(R + 14, Math.hypot(best.x - t.x, best.y - 8 - t.gy));
          S.tracers.push({x1:t.x + Math.cos(ang)*10, y1:t.gy + Math.sin(ang)*5,
            x2:t.x + Math.cos(ang)*len, y2:t.gy + Math.sin(ang)*len * .55,
            life:.28, max:.28, w:3.4, col:'230,215,170'});
          burst(best.x, best.y - 10, '#e8e0c8', 5, 45, 2.2, .28);
          sfx('slash');
          if (S.time - (t._lastSay || 0) > 3.2 && Math.random() < .5) {
            t._lastSay = S.time;
            say(pick(PL.tower.pik), 'pl', {x:t.x, y:towerHead(t)}, 0, false);
          }
        }
      } else t.busy = S.enemies.some(e => !e.dead && Math.hypot(e.x-t.x, e.y-t.y) <= R);
      continue;
    }
    if (t.type === 'haj') {
      t.eng = (t.eng||[]).filter(e => !e.dead && e.blockBy === t);
      if (t.cd <= 0 && t.eng.length) {
        t.cd = towerStat(t,'rate'); t.anim = 1; const e = t.eng[0];
        damage(e, towerStat(t,'dmg'), 'hero'); burst(e.x, e.y-10, '#fff', 3, 50, 2, .2); sfx('slash');
      }
      t.busy = t.eng.length > 0; continue;
    }
    if (t.type === 'woz') {
      t.eng = (t.eng||[]).filter(e => !e.dead && e.blockBy === t);
      // melee on blockers + ranged shot
      if (t.cd <= 0) {
        let best = t.eng[0] || null;
        if (!best) for (const e of S.enemies) if (!e.dead && Math.hypot(e.x-t.x,e.y-t.y)<=R && (!best||e.d>best.d)) best=e;
        if (best) {
          t.cd = towerStat(t,'rate'); t.anim = 1; t.busy = true;
          if (t.eng.includes(best)) { damage(best, towerStat(t,'dmg'), 'hero'); sfx('slash'); }
          else {
            S.tracers.push({x1:t.x, y1:t.gy, x2:best.x, y2:best.y-10, life:.1, max:.1, w:1.5, col:'90,60,30'});
            damage(best, towerStat(t,'dmg')*.7, 'kus'); sfx('shot');
          }
        }
      } else t.busy = t.eng.length > 0;
      continue;
    }
    let best = null;
    if (t.type === 'rus') {
      for (const e of S.enemies) if (!e.dead && Math.hypot(e.x-t.x, e.y-t.y) <= R && (!best || e.hp > best.hp || (e.hp === best.hp && e.d > best.d))) best = e;
    } else if (t.type === 'moz') {
      for (const e of S.enemies) { if (e.dead || e.d < 0) continue; const dd = Math.hypot(e.x-t.x, e.y-t.y); if (dd <= R && dd > 40 && (!best || e.d > best.d)) best = e; }
    } else for (const e of S.enemies) if (!e.dead && Math.hypot(e.x-t.x, e.y-t.y) <= R && (!best || e.d > best.d)) best = e;
    if (best) {
      t.busy = true;
      const want = Math.atan2(best.y - 10 - t.gy, best.x - t.x);
      let da = want - t.ang; while (da > Math.PI) da -= 6.283; while (da < -Math.PI) da += 6.283;
      t.ang += da * Math.min(1, dt*14);
      if (t.cd <= 0) {
        t.cd = towerStat(t, 'rate'); t.anim = 1;
        const mx = t.x + Math.cos(t.ang)*16, my = t.gy + Math.sin(t.ang)*16;
        if (t.type === 'mus') {
          S.tracers.push({x1:mx, y1:my, x2:mx+Math.cos(t.ang)*14, y2:my+Math.sin(t.ang)*14, life:.06, max:.06, w:2.2, col:'255,240,160'});
          damage(best, towerStat(t,'dmg'), 'mus'); burst(best.x, best.y-10, '#fff1a8', 3, 60, 2, .2); sfx('shot');
          smoke(mx, my, 1, 5);
        } else if (t.type === 'luc' || t.type === 'kus' || t.type === 'bal') {
          const bal = t.type === 'bal';
          const kx = t.x + Math.cos(t.ang)*(bal?14:10), ky = t.gy + Math.sin(t.ang)*(bal?14:10);
          const dist = Math.hypot(best.x - kx, best.y - 12 - ky);
          const spd = bal ? 240 : t.type === 'kus' ? 380 : 340;
          const dur = Math.max(bal ? .32 : .18, Math.min(bal ? .85 : .55, dist / spd));
          const lead = best.blockBy || best.stunT > 0 ? 0 : ET[best.type].spd * (best.slowT > 0 ? 1 - best.slowA : 1);
          const aim = lead ? posAt(best.d + lead * dur) : {x: best.x, y: best.y};
          S.proj.push({sx:kx, sy:ky, tx:aim.x, ty:aim.y - 12, t:0, dur, dmg:towerStat(t,'dmg'), splash: bal?16:6,
            src: bal?'bal':t.type==='kus'?'kus':'luc', kind: t.type==='luc'?'arrow':(bal?'hbolt':'bolt'), hi:bal});
          sfx(t.type==='luc'?'arrow':'twang');
          if (bal) { t.anim = 1; S.shake = Math.max(S.shake, 1.2); smoke(kx, ky, 3, 6); }
        } else if (t.type === 'kar') {
          const dmg = towerStat(t,'dmg'), splash = towerStat(t,'splash');
          S.tracers.push({x1:mx, y1:my, x2:best.x, y2:best.y-10, life:.1, max:.1, w:4, col:'255,200,100'});
          for (const e of S.enemies) if (!e.dead && Math.hypot(e.x-best.x, e.y-best.y) <= splash) damage(e, dmg, 'arm');
          burst(best.x, best.y-10, '#ff9a1a', 12, 100, 3, .35); smoke(mx, my, 3, 6); sfx('boom'); S.shake = Math.max(S.shake, 1.5);
        } else if (t.type === 'rus') {
          const rx = t.x + Math.cos(t.ang)*22, ry = t.gy + Math.sin(t.ang)*22;
          S.tracers.push({x1:rx, y1:ry, x2:rx+Math.cos(t.ang)*18, y2:ry+Math.sin(t.ang)*18, life:.07, max:.07, w:3, col:'255,200,120'});
          damage(best, towerStat(t,'dmg'), 'rus');
          { const dx = best.x - t.x, dy = best.y - t.gy, l = Math.hypot(dx, dy) || 1, ux = dx/l, uy = dy/l; let nx = null, nd = 1e9;
            for (const e of S.enemies) { if (e.dead || e === best) continue; const ex = e.x - best.x, ey = e.y - best.y, along = ex*ux + ey*uy, perp = Math.abs(ex*uy - ey*ux);
              if (along > 0 && along < 70 && perp < 14 && along < nd) { nd = along; nx = e; } }
            if (nx) { damage(nx, towerStat(t,'dmg')*.5, 'rus'); S.tracers.push({x1:best.x, y1:best.y-12, x2:nx.x, y2:nx.y-12, life:.12, max:.12, w:2, col:'255,200,120'}); } }
          burst(best.x, best.y-12, '#ffcf7a', 8, 110, 2.5, .3); burst(best.x, best.y-12, '#ffffff', 3, 50, 2, .2);
          smoke(rx, ry, 3, 7); sfx('rus'); S.shake = Math.max(S.shake, 1);
        } else {
          const moz = t.type === 'moz', dist = Math.hypot(best.x-t.x, best.y-t.y), dur = moz ? .9 + dist/380 : .35 + dist/450;
          const sp = best.blockBy || best.stunT > 0 ? 0 : ET[best.type].spd * (best.slowT > 0 ? 1-best.slowA : 1);
          const p = sp ? posAt(best.d + sp*dur) : {x: best.x, y: best.y};
          const bx = moz ? t.x : t.x + Math.cos(t.ang)*18, by = moz ? t.gy - 8 : t.gy + Math.sin(t.ang)*18;
          S.proj.push({sx:bx, sy:by, tx:p.x, ty:p.y, t:0, dur, dmg:towerStat(t,'dmg'), splash:towerStat(t,'splash'), src: moz ? 'moz' : 'arm', hi: moz});
          smoke(bx, by, moz ? 6 : 4, moz ? 10 : 8); sfx(moz ? 'mortar' : 'boom'); S.shake = Math.max(S.shake, moz ? 2 : 1.5);
        }
      }
    }
  }
  // pociski
  for (const p of S.proj) {
    p.t += dt;
    if (p.t < 0) continue;
    if (Math.random() < .5 && S.parts.length < 330) { const q = projPos(p); S.parts.push({x:q.x, y:q.y, vx:0, vy:-6, life:.35, max:.35, color: p.fall ? '#b8b0a4' : '#cfcac2', size:3, grav:0, kind:'smoke'}); }
    if (p.t >= p.dur) {
      p.done = true;
      if (p.kind === 'arrow' || p.kind === 'bolt' || p.kind === 'hbolt') {
        let hit = null, hd = p.splash + 14;
        for (const e of S.enemies) if (!e.dead) { const dd = Math.hypot(e.x - p.tx, e.y - 12 - p.ty); if (dd < hd) { hd = dd; hit = e; } }
        if (hit) damage(hit, p.dmg, p.src);
        else for (const e of S.enemies) if (!e.dead && Math.hypot(e.x-p.tx, e.y-p.ty) <= p.splash + 8) { damage(e, p.dmg, p.src); break; }
        if (p.kind === 'hbolt') {
          burst(p.tx, p.ty, '#c4a574', 10, 90, 3.2, .35);
          burst(p.tx, p.ty, '#fff1c8', 6, 55, 2.4, .28);
          smoke(p.tx, p.ty, 5, 8, '#bdb6aa');
          S.parts.push({x:p.tx, y:p.ty, vx:0, vy:0, life:.28, max:.28, color:'#ffe7a0', size:18, grav:0, kind:'ring'});
          S.shake = Math.max(S.shake, 2.6);
          sfx('twang');
        } else {
          burst(p.tx, p.ty, '#d9c29a', 4, 55, 2, .22);
        }
      } else {
        for (const e of S.enemies) if (!e.dead && Math.hypot(e.x-p.tx, e.y-p.ty) <= p.splash) damage(e, p.dmg, p.src);
        const big = p.src === 'moz' || p.fall;
        burst(p.tx, p.ty, '#ff9a1a', big ? 20 : 14, 120, 4, .45); burst(p.tx, p.ty, '#ffe14d', 8, 70, 3, .35); smoke(p.tx, p.ty, big ? 9 : 6, 10, '#bdb6aa');
        burst(p.tx, p.ty, '#7a5a3a', 6, 90, 2.5, .5, 220);
        S.parts.push({x:p.tx, y:p.ty, vx:0, vy:0, life:.3, max:.3, color:'#fff2b0', size:p.splash, grav:0, kind:'ring'});
        if (S.decals.length > 14) S.decals.shift();
        S.decals.push({x:p.tx, y:p.ty, r:p.splash*.45, life:5, max:5});
        S.shake = Math.max(S.shake, big ? 4 : 3);
        if (p.fall) sfx('boom');
      }
    }
  }
  S.proj = S.proj.filter(p => !p.done);
  if (S.ostShout !== undefined) { S.ostShout -= dt; if (S.ostShout <= 0) { S.ostShout = undefined; let n = null, nd = 90; for (const e of S.enemies) { if (e.dead || ET[e.type].boss) continue; const dd = Math.hypot(e.x - S.ostAt.x, e.y - S.ostAt.y); if (dd < nd) { nd = dd; n = e; } } if (n) say(pick(F().ost), 'sw', n, ET[n.type].h + 4, true); } }
  // husaria
  for (const h of S.hussars) {
    h.d -= 230 * dt;
    if (h.d > PLEN) continue;
    const p = posAt(h.d); h.x = p.x - p.dy*h.lane; h.y = p.y + p.dx*h.lane; h.face = p.dx ? (p.dx < 0 ? 1 : -1) : (h.face||1);
    for (const e of S.enemies) if (!e.dead && !h.hit.has(e) && Math.hypot(e.x-p.x, e.y-p.y) < 24) {
      const boss = ET[e.type].boss;
      h.hit.add(e); damage(e, boss ? h.dmg*1.5 : h.dmg, 'hus'); e.d = Math.max(-OFF, e.d - (boss?10:35)); if (!boss) e.blockBy = null;
      burst(e.x, e.y-8, '#ffffff', 6, 100, 3, .35);
    }
    if (Math.random() < .3) S.parts.push({x:p.x+rnd(-8,8), y:p.y+8, vx:rnd(-10,10), vy:rnd(-20,-5), life:.5, max:.5, color:'#d9c08a', size:6, grav:0, kind:'smoke'});
    if (Math.random() < .12) S.parts.push({x:h.x+rnd(-6,6), y:h.y-30, vx:rnd(-20,20), vy:rnd(-10,10), life:.9, max:.9, color:'#ffffff', size:2.4, grav:30, kind:'feather'});
  }
  if (S.husShout !== undefined) { S.husShout -= dt; if (S.husShout <= 0) { S.husShout = undefined; const lead = S.hussars.find(h => h.x !== undefined && h.d <= PLEN); if (lead) say(pick(PL[lead.kind||'hus']||PL.hus), 'hus', lead, 44, true); } }
  S.hussars = S.hussars.filter(h => h.d > -40);
  // Tatarzy (lipkowie w służbie Rzeczypospolitej)
  for (const r of S.tatars) {
    r.d -= 90 * dt; r.cd -= dt;
    if (r.d > PLEN) continue;
    const p = posAt(r.d); r.x = p.x - p.dy*r.lane; r.y = p.y + p.dx*r.lane; r.face = p.dx ? (p.dx < 0 ? 1 : -1) : (r.face||1);
    if (r.cd <= 0) {
      let tg = null, td = 80; for (const e of S.enemies) { if (e.dead) continue; const dd = Math.hypot(e.x - r.x, e.y - r.y); if (dd < td) { td = dd; tg = e; } }
      if (tg) { r.cd = .6; S.tracers.push({x1:r.x, y1:r.y-22, x2:tg.x, y2:tg.y-12, life:.14, max:.14, w:1.4, col:'70,45,20'}); damage(tg, r.dmg, 'kus'); sfx('arrow'); }
    }
    if (Math.random() < .2) S.parts.push({x:r.x+rnd(-8,8), y:r.y+8, vx:rnd(-10,10), vy:rnd(-20,-5), life:.5, max:.5, color:'#d9c08a', size:5, grav:0, kind:'smoke'});
  }
  if (S.tatShout !== undefined) { S.tatShout -= dt; if (S.tatShout <= 0) { S.tatShout = undefined; const lead = S.tatars.find(h => h.x !== undefined && h.d <= PLEN); if (lead) say(pick(PL.tat), 'hus', lead, 40, true); } }
  S.tatars = S.tatars.filter(h => h.d > -40);
  S.enemies = S.enemies.filter(e => !e.dead);

  // pogawędki (ograniczone, bez spamu)
  S.nextChat -= dt;
  if (S.nextChat <= 0) {
    S.nextChat = rnd(6, 10);
    const busy = S.towers.filter(t => t.busy), foes = S.enemies.filter(e => e.d > 10 && e.y > -10 && !ET[e.type].boss);
    if (busy.length && (Math.random() < .55 || !foes.length)) {
      const t = pick(busy); say(Math.random() < .55 ? pick(M.pl) : pick(PL.tower[t.type]), 'pl', {x:t.x, y:towerHead(t)}, 0, false);
    } else if (foes.length) {
      const e = pick(foes); say(e.hp < e.max*.35 ? pick(F().hurt) : pick(F().spawn), 'sw', e, ET[e.type].h + 4, false);
    }
  }

  // koniec fali
  if (!S.paid && !S.queue.length && !S.enemies.length && S.wave > 0 && !S.over) {
    S.paid = true;
    gainXp(S.endless ? 4 : 10);
    if (!S.endless && S.wave >= WAVES.length) endGame(true);
    else {
      const b = 15 + S.wave*3; S.gold += b; floatT(180, 250, 'Fala odparta! +'+b+' zł', '#7dff6a', 16, 1.6); sfx('coin');
      if (S.towers.length) { const t = pick(S.towers); say(pick(['Odparci!','Chwała Bogu!'].concat(M.pl)), 'pl', {x:t.x, y:towerHead(t)}, 0, true); }
      if (S.endless) {
        const rec = Object.assign({stars:0, best:0, wins:0, endless:0}, save.maps[M.id]);
        if (S.wave > (rec.endless||0)) { rec.endless = S.wave; save.maps[M.id] = rec; persist(); }
      }
    }
  }
  updateFx(dt);
}
function projPos(p) {
  const k = Math.max(0, Math.min(1, p.t / p.dur));
  if (p.fall) return {x: p.sx + (p.tx - p.sx)*k, y: p.sy + (p.ty - p.sy)*k*k, gx: p.tx, gy: p.ty};
  const arc = p.kind === 'arrow' ? 28 + p.dur*36 : p.kind === 'hbolt' ? 36 + p.dur*42 : p.kind === 'bolt' ? 18 + p.dur*28 : (p.hi ? 70 + p.dur*30 : 20 + p.dur*30);
  const hgt = Math.sin(k*Math.PI) * arc;
  return {x: p.sx + (p.tx - p.sx)*k, y: p.sy + (p.ty - p.sy)*k - hgt, gx: p.sx + (p.tx - p.sx)*k, gy: p.sy + (p.ty - p.sy)*k + 12*(1-k)};
}
function updateFx(dt) {
  for (const p of S.parts) { p.life -= dt; p.x += p.vx*dt; p.y += p.vy*dt; p.vy += p.grav*dt; if (p.kind==='dot') { p.vx *= .97; p.vy *= p.grav ? 1 : .97; } else if (p.kind==='feather') { p.vx *= .96; } }
  S.parts = S.parts.filter(p => p.life > 0);
  for (const f of S.floats) { f.life -= dt; f.y -= 28*dt; }
  S.floats = S.floats.filter(f => f.life > 0);
  for (const t of S.tracers) t.life -= dt; S.tracers = S.tracers.filter(t => t.life > 0);
  for (const t of S.beams) t.life -= dt; S.beams = S.beams.filter(t => t.life > 0);
  for (const c of S.corpses) { c.t += dt; if (c.mode === 'flee') { c.x += c.vx*dt; c.y += c.vy*dt; } }
  S.corpses = S.corpses.filter(c => c.t < c.dur);
  for (const d of S.decals) d.life -= dt; S.decals = S.decals.filter(d => d.life > 0);
  for (const b of S.bubbles) { b.life -= dt; if (b.o) { b.x = b.o.x; b.y = b.o.y; } }
  S.bubbles = S.bubbles.filter(b => b.life > 0);
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt*25);
  if (S.fortFlash > 0) S.fortFlash -= dt;
  if (S.banner) { S.banner.t -= dt; if (S.banner.t <= 0) S.banner = null; }
}
let LAST = null; // wynik ostatniej bitwy (do ekranów końcowych)
function endGame(win) {
  if (S.over) return;
  S.over = true; S.result = win ? 'win' : 'lose';
  const stars = (!S.endless && win) ? (S.lives >= 17 ? 3 : S.lives >= 10 ? 2 : 1) : 0;
  S.stars = stars;
  const rec = Object.assign({stars:0, best:0, wins:0, endless:0}, save.maps[M.id]);
  const first = !S.endless && win && !(rec.stars > 0);
  if (!S.endless) {
    rec.stars = Math.max(rec.stars, stars); rec.best = Math.max(rec.best, win ? WAVES.length : Math.max(0, S.wave - 1)); if (win) rec.wins++;
  } else {
    rec.endless = Math.max(rec.endless||0, Math.max(0, S.wave - (win?0:1)));
  }
  if (win && !S.endless) gainXp(50 + 25*stars);
  const h = S.hero, before = h ? levelOf(h.xp0) : 1;
  if (h && !SIM_NOXP) { const d = heroData(h.id); d.xp = Math.round(h.xp0 + S.xp); }
  save.maps[M.id] = rec;
  if (win && !S.endless) save.wins = (save.wins|0) + 1;
  save.games = (save.games|0) + 1;
  if (first) {
    const u = M.unlock || {};
    if (u.hero) heroData(u.hero);
    if (u.tower) { save.seen = save.seen || {}; save.seen['t_'+u.tower] = false; }
    if (u.spec) { save.seen = save.seen || {}; save.seen['s_'+u.spec] = false; }
    if (u.chest) {
      save.bonusGold = (save.bonusGold|0) + CHEST_GOLD;
      if (h && !SIM_NOXP) { const d = heroData(h.id); d.xp = Math.round(d.xp + CHEST_XP); }
    }
  }
  persist();
  LAST = {win, stars, first, map: M.id, xp: S.xp, hero: h && h.id, lvlFrom: before, lvlTo: h ? levelOf(heroData(h.id).xp) : 1, chest: !!(first && (M.unlock||{}).chest)};
  sfx(win ? 'win' : 'lose');
  if (win) for (let i = 0; i < 6; i++) burst(rnd(60,300), rnd(100,400), ['#ff3b3b','#fff','#ffd84a','#5fd35a'][i%4], 25, 150, 4, 1.2, 60);
  if (!SIM) setTimeout(() => showEnd(win, stars), 1100);
}


// ====== GRAFIKA: wczytywanie i skalowanie sprite'ów ======
const IMG = {};
const IMG_LIST = [].concat(
  ...TKEYS.map(k => [0,1,2].map(l => 't_'+k+l)),
  ...HKEYS.map(k => [0,1,2,3].map(l => 'h_'+k+l)),
  Object.values(ET).map(t => t.img), ['e_hus','e_tat','fort','fort_gr','fort_ch','fort_wi','fort_grod','fort_tabor','grass','grass_gr','grass_ch','grass_wi','dirt'],
  ['oak','pine','apple','birch','bush','rock','rocks','cart','tent','tentb','tento','tentw','barrels','barrels2','fence','fence2','hay','hay2','mill','ocan','pond','reed','vine'].map(n => 'd_'+n));
const DW = {d_oak:36,d_pine:28,d_apple:32,d_birch:30,d_bush:22,d_rock:20,d_rocks:18,d_hay:22,d_hay2:24,d_fence:24,d_fence2:26,d_barrels:16,d_barrels2:20,d_reed:20,d_pond:44,d_vine:26,d_mill:46,d_tentw:40,d_tentb:38,d_tento:42,d_ocan:30,d_cart:34,d_tent:40};
function loadImages(cb) {
  let n = IMG_LIST.length;
  const done = () => { if (--n === 0) cb(); };
  for (const k of IMG_LIST) { const i = new Image(); i.onload = done; i.onerror = () => { console.warn('Brak obrazka', k); done(); }; i.src = 'img/' + k + '.webp?v=' + V; IMG[k] = i; }
}
let SCACHE = new Map();
// zwraca płótno z obrazkiem przeskalowanym do szerokości w (px logiczne) – szybkie rysowanie na telefonie
function spr(key, w, tint) {
  const img = IMG[key]; if (!img || !img.width) return null;
  const pw = Math.max(2, Math.round(w * SCALE * DPR)), id = key + '|' + pw + '|' + (tint||'');
  let c = SCACHE.get(id);
  if (c) return c;
  let src = img, sw = img.width, sh = img.height;
  const ph = Math.max(2, Math.round(pw * sh / sw));
  while (sw / 2 >= pw * 1.05) { // stopniowe zmniejszanie = gładsze krawędzie
    const t = document.createElement('canvas'); t.width = Math.round(sw/2); t.height = Math.round(sh/2);
    const g = t.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(src, 0, 0, t.width, t.height);
    src = t; sw = t.width; sh = t.height;
  }
  c = document.createElement('canvas'); c.width = pw; c.height = ph;
  const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(src, 0, 0, pw, ph);
  if (tint) { g.globalCompositeOperation = 'source-in'; g.fillStyle = tint; g.fillRect(0, 0, pw, ph); }
  c.lw = w; c.lh = w * img.height / img.width;
  SCACHE.set(id, c);
  return c;
}
// rysuje sprite tak, by środek dołu był w (x, y)
function drawSpr(c, key, x, y, w, flip, tint) {
  const s = spr(key, w, tint); if (!s) return;
  if (flip) { c.save(); c.translate(x, y); c.scale(-1, 1); c.drawImage(s, -s.lw/2, -s.lh, s.lw, s.lh); c.restore(); }
  else c.drawImage(s, x - s.lw/2, y - s.lh, s.lw, s.lh);
}

// ====== RYSOWANIE ======
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
let SCALE = 1, DPR = 1, BG = null, OFF = 0, VH = H;
function fit() {
  const st = document.getElementById('stage');
  const aw = st.clientWidth - 8, ah = st.clientHeight - 8;
  SCALE = Math.max(.3, Math.min(aw / W, ah / H));
  OFF = Math.max(0, Math.min(150, Math.floor(ah / SCALE - H))); VH = H + OFF;
  DPR = Math.min(2, window.devicePixelRatio || 1);
  cv.style.width = (W*SCALE) + 'px'; cv.style.height = (VH*SCALE) + 'px';
  cv.width = Math.round(W*SCALE*DPR); cv.height = Math.round(VH*SCALE*DPR);
  SCACHE = new Map();
  BG = makeBg();
}
function srand(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
function distToPath(x, y) {
  let m = 1e9;
  for (const s of SEG) { const t = Math.max(0, Math.min(s.l, (x-s.a[0])*s.dx + (y-s.a[1])*s.dy)); m = Math.min(m, Math.hypot(x - (s.a[0]+s.dx*t), y - (s.a[1]+s.dy*t))); }
  return m;
}
function pathLine(g, extraTop) { g.beginPath(); PATH.forEach((p,i) => i ? g.lineTo(p[0],p[1]) : g.moveTo(p[0],p[1]-OFF-extraTop)); }
function makeBg() {
  const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height;
  const g = c.getContext('2d'), K = SCALE*DPR;
  g.setTransform(K, 0, 0, K, 0, OFF*K);
  // trawa (tekstura)
  const GI = IMG[M.grass];
  if (GI && GI.width) {
    const pat = g.createPattern(GI, 'repeat'); pat.setTransform(new DOMMatrix().scale(190/512));
    g.fillStyle = pat; g.fillRect(0, -OFF, W, VH);
  } else { g.fillStyle = '#6cbf4a'; g.fillRect(0, -OFF, W, VH); }
  // światło i cień – głębia
  let gr = g.createRadialGradient(W*.5, H*.45, 60, W*.5, H*.45, 420);
  gr.addColorStop(0, 'rgba(255,250,200,.10)'); gr.addColorStop(1, 'rgba(10,40,10,.38)');
  g.fillStyle = gr; g.fillRect(0, -OFF, W, VH);
  const R = srand(M.year);
  for (let i = 0; i < 26; i++) { g.fillStyle = R() < .5 ? 'rgba(255,255,200,.05)' : 'rgba(0,50,0,.07)'; g.beginPath(); g.ellipse(R()*W, R()*VH-OFF, 25+R()*45, 12+R()*22, 0, 0, 7); g.fill(); }
  // rzeka (Dniestr pod Chocimiem)
  if (M.river) {
    const wv = y => 334 + Math.sin(y*.03)*6 + Math.sin(y*.011)*4;
    g.fillStyle = '#7a6a3e'; g.beginPath(); g.moveTo(W, -OFF); for (let y = -OFF; y <= H; y += 10) g.lineTo(wv(y) - 4, y); g.lineTo(W, H); g.closePath(); g.fill();
    const rg = g.createLinearGradient(330, 0, W, 0); rg.addColorStop(0, '#3f86b8'); rg.addColorStop(1, '#2a5f8f');
    g.fillStyle = rg; g.beginPath(); g.moveTo(W, -OFF); for (let y = -OFF; y <= H; y += 10) g.lineTo(wv(y), y); g.lineTo(W, H); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.4;
    for (let k = 0; k < 18; k++) { const y = -OFF + R()*VH, x = wv(y) + 6 + R()*14; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 3, y - 2, x + 7, y); g.stroke(); }
  }
  // droga: brzeg, ziemia z teksturą, kamienie
  g.lineJoin = 'round'; g.lineCap = 'round';
  g.save(); g.shadowColor = 'rgba(30,40,10,.55)'; g.shadowBlur = 8*K; g.strokeStyle = '#5b4a2a'; g.lineWidth = 44; pathLine(g, 40); g.stroke(); g.restore();
  g.strokeStyle = '#6e5634'; g.lineWidth = 42; pathLine(g, 40); g.stroke();
  {
    const p = document.createElement('canvas'); p.width = c.width; p.height = c.height;
    const q = p.getContext('2d'); q.setTransform(K, 0, 0, K, 0, OFF*K); q.lineJoin = 'round'; q.lineCap = 'round';
    q.strokeStyle = '#c9a16a'; q.lineWidth = 37; pathLine(q, 40); q.stroke();
    q.globalCompositeOperation = 'source-atop';
    if (IMG.dirt.width) { const pt = q.createPattern(IMG.dirt, 'repeat'); pt.setTransform(new DOMMatrix().scale(120/384)); q.fillStyle = pt; q.fillRect(0, -OFF, W, VH); }
    q.globalAlpha = .18; q.strokeStyle = '#fff4d8'; q.lineWidth = 14; pathLine(q, 40); q.stroke(); q.globalAlpha = 1;
    q.globalCompositeOperation = 'source-over';
    g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(p, 0, 0); g.setTransform(K, 0, 0, K, 0, OFF*K);
  }
  // koleiny
  g.strokeStyle = 'rgba(90,60,30,.22)'; g.lineWidth = 2.2; g.setLineDash([14, 8]);
  for (const o of [-8, 8]) { g.beginPath(); PATH.forEach((p, i) => { const s = SEG[Math.min(i, SEG.length-1)], nx = -s.dy*o, ny = s.dx*o; i ? g.lineTo(p[0]+nx, p[1]+ny) : g.moveTo(p[0]+nx, p[1]+ny-OFF-40); }); g.stroke(); }
  g.setLineDash([]);
  // kamyki na skraju drogi
  for (let i = 0; i < 140; i++) {
    const d = R()*PLEN - 20, p = posAt(d), side = R() < .5 ? -1 : 1, o = side*(18 + R()*4);
    const x = p.x - p.dy*o, y = p.y + p.dx*o, r = 1.6 + R()*2.4;
    if (y > FORT.y + 40) continue;
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x+.6, y+1, r*1.2, r*.8, 0, 0, 7); g.fill();
    g.fillStyle = ['#b9b2a3','#a39b8b','#c8c0ae'][Math.floor(R()*3)]; g.beginPath(); g.ellipse(x, y, r*1.2, r*.85, R(), 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(x - r*.3, y - r*.3, r*.45, r*.28, 0, 0, 7); g.fill();
  }
  // pola budowy (kamienne podesty)
  for (const [x, y] of SPOTS) {
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, y+5, 20, 8, 0, 0, 7); g.fill();
    g.fillStyle = '#8d806b'; g.beginPath(); g.ellipse(x, y+2, 19, 10, 0, 0, 7); g.fill();
    g.fillStyle = '#b6aa92'; g.beginPath(); g.ellipse(x, y, 18, 9, 0, 0, 7); g.fill();
    g.strokeStyle = 'rgba(70,60,45,.55)'; g.lineWidth = 1;
    for (let k = 0; k < 8; k++) { const a = k*.785 + .2; g.beginPath(); g.moveTo(x + Math.cos(a)*9, y + Math.sin(a)*4.5); g.lineTo(x + Math.cos(a)*18, y + Math.sin(a)*9); g.stroke(); }
    g.beginPath(); g.ellipse(x, y, 9, 4.5, 0, 0, 7); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(x - 5, y - 3, 7, 2.5, 0, 0, 7); g.fill();
  }
  // dekoracje
  const inFort = (x, y, r) => x > FORT.x - 10 - r && x < FORT.x + FORT.w + 10 + r && y > FORT.y + 10 - r;
  const okDeco = (x, y, r) => (!M.river || x < 318 - r) && distToPath(x, y) > 24 + r && SPOTS.every(s => Math.hypot(s[0]-x, s[1]-(y-4)) > 26 + r) && !inFort(x, y, r) && y > 14 - OFF && y < H - 4;
  // kępki i kwiaty
  for (let i = 0; i < 170; i++) { const x = R()*W, y = R()*VH - OFF; if (!okDeco(x, y, -10)) continue;
    if (R() < .72) { g.strokeStyle = 'rgba(30,90,25,.65)'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(x-3, y); g.lineTo(x-4, y-5); g.moveTo(x, y); g.lineTo(x, y-7); g.moveTo(x+3, y); g.lineTo(x+4, y-5); g.stroke(); }
    else { g.fillStyle = ['#fff','#ffe14d','#ff9ac0','#b7dcff'][Math.floor(R()*4)]; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(x + Math.cos(k*1.256)*1.9, y + Math.sin(k*1.256)*1.9, 1.3, 0, 7); g.fill(); } g.fillStyle = '#ffb000'; g.beginPath(); g.arc(x, y, 1, 0, 7); g.fill(); }
  }
  const deco = [];
  const put = (key, x, y, w, force) => { const r = w*.38; if ((force || okDeco(x, y, r)) && deco.every(d => Math.hypot(d[1]-x, d[2]-y) > (d[3]+w)*.42)) { deco.push([key, x, y, w]); return true; } return false; };
  // obóz szwedzki na górze
  const campY = Math.min(30, -OFF + 34);
  if (M.camp === 'v2') [['d_tent',318,40,40],['d_tent',140,campY,36],['d_barrels',350,58,18],['d_cart',22,campY+20,34],['d_tent',236,campY-2,34],['d_hay',190,-OFF+70,24]].forEach(([k,x,y,w]) => put(k, x, y, w));
  else { const CP = [[318,40],[140,campY],[236,campY-2],[350,62],[22,campY+20],[190,-OFF+70],[96,-OFF+60],[280,-OFF+64]];
    for (let n = 0; n < CP.length; n++) { const k = M.camp[n % M.camp.length]; put(k, CP[n][0], CP[n][1], DW[k]*(.9 + R()*.2)); } }
  // drzewa, krzaki, skały
  const kinds = M.deco === 'v2' ? [['d_oak',36],['d_pine',28],['d_apple',32],['d_birch',30],['d_bush',22],['d_rock',20],['d_rocks',18],['d_bush',18],['d_hay',22],['d_fence',24],['d_barrels',16]] : M.deco.map(k => [k, DW[k]]);
  for (let i = 0; i < 600 && deco.length < 34; i++) {
    const x = R()*W, y = R()*VH - OFF, [k, w0] = kinds[Math.floor(R()*kinds.length)];
    put(k, x, y, w0*(.85 + R()*.3));
  }
  deco.sort((a, b) => a[2] - b[2]);
  for (const [k, x, y, w] of deco) {
    const img = IMG[k]; if (!img || !img.width) continue;
    const h = w*img.height/img.width;
    g.fillStyle = 'rgba(0,20,0,.28)'; g.beginPath(); g.ellipse(x + 2, y - 1, w*.42, w*.14, 0, 0, 7); g.fill();
    g.drawImage(img, x - w/2, y - h + 2, w, h);
  }
  // podłoże pod twierdzą
  g.fillStyle = 'rgba(60,45,25,.35)'; g.beginPath(); g.ellipse(180, 540, 100, 40, 0, 0, 7); g.fill();
  return c;
}

function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x+r, y); c.arcTo(x+w, y, x+w, y+h, r); c.arcTo(x+w, y+h, x, y+h, r); c.arcTo(x, y+h, x, y, r); c.arcTo(x, y, x+w, y, r); c.closePath(); }
const INK = '#2b1d0e';
function circ(c, x, y, r, fill, stroke=INK, lw=1.5) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = fill; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); } }
const LVLC = ['#c8874a', '#d6dde6', '#ffcc33'];
// powiewająca flaga
function flag(c, x, y, w, h, t, stripes, pole=true, cross) {
  if (pole) { c.strokeStyle = '#4a2f16'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, y + h*2.4); c.lineTo(x, y - 1); c.stroke(); circ(c, x, y - 2, 1.5, '#ffcc33', null); }
  const n = stripes.length, sh = h / n, seg = 6;
  for (let s = 0; s < n; s++) {
    c.fillStyle = stripes[s]; c.beginPath();
    for (let i = 0; i <= seg; i++) { const k = i/seg, wy = Math.sin(t*6 - k*4)*k*h*.22; const px = x + k*w, py = y + s*sh + wy; i ? c.lineTo(px, py) : c.moveTo(px, py); }
    for (let i = seg; i >= 0; i--) { const k = i/seg, wy = Math.sin(t*6 - k*4)*k*h*.22; c.lineTo(x + k*w, y + (s+1)*sh + wy); }
    c.closePath(); c.fill();
  }
  if (cross) { // krzyż szwedzki
    c.strokeStyle = cross; c.lineWidth = h*.22; c.beginPath();
    for (let i = 0; i <= seg; i++) { const k = i/seg, wy = Math.sin(t*6 - k*4)*k*h*.22; i ? c.lineTo(x + k*w, y + h*.5 + wy) : c.moveTo(x, y + h*.5); } c.stroke();
    const kx = .36, wy = Math.sin(t*6 - kx*4)*kx*h*.22; c.beginPath(); c.moveTo(x + kx*w, y + wy); c.lineTo(x + kx*w, y + h + wy); c.stroke();
  }
}
function star(c, x, y, r, col) {
  c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI/2 + i*Math.PI/5, rr2 = i%2 ? r*.45 : r; c.lineTo(x + Math.cos(a)*rr2, y + Math.sin(a)*rr2); }
  c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
}
// mały obrońca (żupan, kołpak) z bronią obróconą o kąt ang
function soldier(c, x, y, ang, anim, s, coat, gunLen, hat) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const fx = Math.cos(ang) < 0 ? -1 : 1;
  c.save(); c.rotate(ang);
  c.strokeStyle = '#5a3417'; c.lineWidth = 3; c.beginPath(); c.moveTo(-2, 2); c.lineTo(gunLen*.7 - anim*2, 2); c.stroke();
  c.strokeStyle = '#3c3c3c'; c.lineWidth = 2; c.beginPath(); c.moveTo(gunLen*.55 - anim*2, 2); c.lineTo(gunLen - anim*2, 2); c.stroke();
  if (anim > .6) { circ(c, gunLen + 2, 2, 4, '#fff3a0', null); circ(c, gunLen + 2, 2, 2, '#fff', null); }
  c.restore();
  circ(c, 0, 2, 6, coat);
  c.strokeStyle = '#ffd86a'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(-4, -1); c.lineTo(4, 5); c.stroke();
  circ(c, 0, -5, 4.2, '#f5c9a0');
  c.fillStyle = INK; c.fillRect(fx > 0 ? 1 : -2.4, -5.5, 1.3, 1.3);
  c.strokeStyle = '#4a2c14'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(-2.5, -3); c.quadraticCurveTo(0, -1.5, 2.5, -3); c.stroke();
  c.fillStyle = '#5a3a1a'; rr(c, -4.6, -11.5, 9.2, 5, 2); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
  c.fillStyle = hat; c.fillRect(-3.2, -13.5, 6.4, 2.6);
  c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(2, -12); c.quadraticCurveTo(6, -16, 4, -19); c.stroke();
  c.restore();
}

function drawTower(c, t, time) {
  const {x, by, w, lvl, type} = t, anim = Math.max(0, t.anim);
  if (!TT[type]) return;
  const pop = t.pop > 0 ? 1 + Math.sin(t.pop*Math.PI)*.12 : 1;
  c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(x + 2, by - 3, w*.5, w*.2, 0, 0, 7); c.fill();
  c.save(); c.translate(x, by); c.scale(2 - pop, pop); c.translate(-x, -by);
  // odrzut armaty/rusznicy – lekki przysiad
  const sq = (type === 'arm' || type === 'rus') ? anim*.03 : 0;
  if (sq) { c.translate(x, by); c.scale(1 + sq, 1 - sq); c.translate(-x, -by); }
  drawSpr(c, 't_'+type+lvl, x, by, w);
  const gy = t.gy;
  if (type === 'luc') {
    // łucznicy upieczeni na spricie (platforma v3 kus + zielone płaszcze);
    // przy strzale – naciąg łuku / błysk nad galerią
    if (anim > .2) {
      const pos = [[[0,0]], [[-7,1],[7,-1]], [[-8,2],[8,1],[0,-4]]][lvl];
      for (const [px, py] of pos) {
        c.save(); c.translate(x + px, gy + py); c.rotate(t.ang);
        const pull = anim * 3.2;
        c.strokeStyle = '#5a3417'; c.lineWidth = 2.2;
        c.beginPath(); c.moveTo(4, -8); c.quadraticCurveTo(13 + (1-anim), 0, 4, 9); c.stroke();
        c.strokeStyle = '#e8e0cc'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(4, -8); c.lineTo(1 - pull, 0); c.lineTo(4, 9); c.stroke();
        c.strokeStyle = '#3a2a14'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(1 - pull, 0); c.lineTo(12 - pull*.2, 0); c.stroke();
        if (anim > .55) { circ(c, 13, 0, 3.5 + (anim-.55)*6, '#fff3a0', null); }
        c.restore();
      }
    }
  } else if (type === 'mus') {
    const pos = [[[0,0]], [[-7,1],[7,-1]], [[-8,2],[8,1],[0,-4]]][lvl];
    for (const [px, py] of pos) soldier(c, x + px, gy + py, t.ang, anim, .78, lvl == 2 ? '#c41e3a' : '#d93636', 17, lvl == 2 ? '#ffcc33' : '#e02b2b');
  } else if (type === 'arm') {
    c.save(); c.translate(x, gy); c.rotate(t.ang); c.scale(.9, .9);
    const rec = anim*4;
    c.fillStyle = '#5a3a1a'; c.strokeStyle = INK; c.lineWidth = 1.5;
    for (const s of [-1, 1]) { rr(c, -9, s*8 - 3, 11, 6, 2); c.fill(); c.stroke(); }
    c.fillStyle = '#8b5a2b'; rr(c, -11, -6, 16, 12, 3); c.fill(); c.stroke();
    const bl = 18 + lvl*3, bw = 7 + lvl*1.2, barrels = lvl == 2 ? [-3.6, 3.6] : [0];
    for (const off of barrels) {
      c.fillStyle = lvl == 0 ? '#3a3a3a' : lvl == 1 ? '#2b2f36' : '#c99a2e';
      rr(c, -6 - rec, off - bw/2, bl, bw, 3); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-4 - rec, off - bw/2 + 1.2, bl - 5, 1.6);
      circ(c, bl - 6 - rec, off, bw/2 - .5, lvl==2 ? '#7a5a10' : '#141414');
      if (lvl >= 1) { c.fillStyle = '#ffcc33'; c.fillRect(2 - rec, off - bw/2, 2, bw); }
    }
    if (anim > .7) { circ(c, bl - 1, 0, 6, '#ffb03a', null); circ(c, bl - 1, 0, 3, '#fff6c0', null); }
    c.restore();
    // kanonier
    soldier(c, x - 10, gy + 3, t.ang, 0, .62, '#2f5fa8', 0, '#e02b2b');
  } else if (type === 'smo') {
    // migoczący ogień i bąble smoły
    const cy = gy, s = w/40;
    for (let k = 0; k < 5; k++) { const fx = x + (-8 + k*4)*s, fh = (5 + Math.sin(time*14 + k*1.7 + t.seed)*2.5 + lvl*1.5)*s;
      c.globalAlpha = .85; c.fillStyle = '#ff6a00'; c.beginPath(); c.moveTo(fx-3*s, cy + 9*s); c.quadraticCurveTo(fx, cy + 9*s - fh*1.4, fx+3*s, cy + 9*s); c.fill();
      c.fillStyle = '#ffd23a'; c.beginPath(); c.moveTo(fx-1.5*s, cy + 9*s); c.quadraticCurveTo(fx, cy + 9*s - fh*.8, fx+1.5*s, cy + 9*s); c.fill(); }
    c.globalAlpha = 1;
    for (let k = 0; k < 3; k++) { const ph = (time*1.2 + k*.33 + t.seed) % 1; c.globalAlpha = (1-ph)*.6; circ(c, x - 5*s + k*5*s, cy - 2*s - ph*14*s, (1.5 + ph*3)*s, '#4b3b30', null); }
    c.globalAlpha = 1;
    if (anim > .5) { c.strokeStyle = 'rgba(255,140,30,.85)'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, cy, 14 + (1-anim)*12, 5 + (1-anim)*4, 0, 0, 7); c.stroke(); }
  } else if (type === 'bal') {
    // odrzut / błysk przy strzale ciężkiego bełtu
    if (anim > .35) {
      c.save(); c.translate(x, gy - 2); c.rotate(t.ang);
      const flash = (anim - .35) / .65;
      c.globalAlpha = Math.max(0, 1 - flash) * .9;
      circ(c, 18, 0, 5 + flash * 6, '#fff3a0', null);
      circ(c, 22, 0, 2.5 + flash * 3, '#ffffff', null);
      c.globalAlpha = 1; c.restore();
    }
  } else if (type === 'kus') {
    // kusznik
    soldier(c, x, gy, t.ang, 0, .8, lvl == 2 ? '#7a2a1a' : '#6b4a2a', 0, lvl == 2 ? '#ffcc33' : '#2a62c9');
    c.save(); c.translate(x, gy + 1); c.rotate(t.ang);
    const pull = anim*2;
    c.strokeStyle = '#5a3417'; c.lineWidth = 3; c.beginPath(); c.moveTo(-3, 1); c.lineTo(14, 1); c.stroke();
    c.strokeStyle = lvl == 2 ? '#c99a2e' : '#3a2a1a'; c.lineWidth = 2; c.beginPath(); c.moveTo(12, -6); c.quadraticCurveTo(16, 1, 12, 8); c.stroke();
    c.strokeStyle = '#e8e0cc'; c.lineWidth = .8; c.beginPath(); c.moveTo(12, -6); c.lineTo(4 - pull, 1); c.lineTo(12, 8); c.stroke();
    c.restore();
  } else if (type === 'pik') {
    // wyraźny wypych długich pik — peak w połowie anim (czytelny jab)
    if (anim > 0 && t.thrustX != null) {
      const a = Math.atan2(t.thrustY - 8 - gy, t.thrustX - x);
      const jab = Math.sin(anim * Math.PI); // 0→1→0, max przy anim≈.5
      const reach = w * (.42 + jab * .95); // jab wyraźnie poza platformę
      const thick = 3.0 + w * .025;
      c.save();
      c.strokeStyle = `rgba(220,200,150,${.55 + .4 * jab})`;
      c.lineWidth = thick; c.lineCap = 'round';
      const x0 = x + Math.cos(a) * (w * .1), y0 = gy + Math.sin(a) * (w * .05);
      const x1 = x + Math.cos(a) * reach, y1 = gy + Math.sin(a) * reach * .55;
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
      c.fillStyle = `rgba(255,255,230,${.55 + .4 * jab})`;
      c.beginPath(); c.arc(x1, y1, 3.4 + jab * 2, 0, 7); c.fill();
      // druga równoległa pika – oddział
      const ox = Math.cos(a + 1.57) * (5 + jab), oy = Math.sin(a + 1.57) * (5 + jab);
      c.strokeStyle = `rgba(200,180,130,${.35 + .35 * jab})`;
      c.lineWidth = thick * .85;
      c.beginPath();
      c.moveTo(x0 + ox, y0 + oy);
      c.lineTo(x1 + ox * .55, y1 + oy * .55);
      c.stroke();
      c.restore();
    }
  } else if (type === 'moz') {
    if (anim > .6) { circ(c, x, gy - 10, 7, '#ffb03a', null); circ(c, x, gy - 10, 3.5, '#fff6c0', null); }
  } else if (type === 'rus') {
    // strzelec z długą rusznicą na podpórce
    const gl = 24 + lvl*3;
    soldier(c, x, gy, t.ang, 0, .8, lvl == 2 ? '#1f6b45' : '#2e7d55', 0, lvl == 2 ? '#ffcc33' : '#c41e3a');
    c.save(); c.translate(x, gy + 1); c.rotate(t.ang);
    const rec = anim*3;
    c.strokeStyle = '#5a3417'; c.lineWidth = 3.4; c.beginPath(); c.moveTo(-4 - rec, 1); c.lineTo(gl*.45 - rec, 1); c.stroke();
    c.strokeStyle = lvl == 2 ? '#b8862a' : '#3a3a3a'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(gl*.35 - rec, 1); c.lineTo(gl - rec, 1); c.stroke();
    c.fillStyle = '#ffcc33'; if (lvl >= 1) c.fillRect(gl*.4 - rec, -.6, 2, 3.2);
    if (anim > .55) { circ(c, gl + 3, 1, 5, '#ffb03a', null); circ(c, gl + 3, 1, 2.5, '#fff6c0', null); }
    c.restore();
  }
  c.restore();
  if (t.pray) { c.globalAlpha = .5 + Math.sin(time*6)*.2; star(c, x + w*.4, by - t.h + 4, 3, '#fff3a0'); c.globalAlpha = 1; }
  // proporczyk na wieży
  if (type !== 'smo' && type !== 'moz' && type !== 'pik') {
    const fx = x - w*.42, fy = by - t.h*(type === 'rus' ? .97 : type === 'arm' ? .62 : (type === 'kus' || type === 'luc') ? .95 : .9);
    flag(c, fx, fy, 10 + lvl*2, 6 + lvl, time + t.seed, ['#ffffff', '#e02b2b']);
  }
  // gwiazdki poziomu
  for (let k = 0; k <= lvl; k++) { const sx = x + (k - lvl/2)*8; star(c, sx, by + 6, 3.4, LVLC[lvl]); }
}

function hpBar(c, x, y, bw, f) {
  c.fillStyle = 'rgba(20,10,5,.85)'; rr(c, x - bw/2 - 1.5, y - 1.5, bw + 3, 6, 3); c.fill();
  c.fillStyle = '#5a1010'; rr(c, x - bw/2, y, bw, 3, 1.5); c.fill();
  c.fillStyle = f > .5 ? '#6ee05a' : f > .25 ? '#ffc400' : '#ff4040'; if (f > 0) { rr(c, x - bw/2, y, Math.max(2, bw*f), 3, 1.5); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x - bw/2 + 1, y, Math.max(0, bw*f - 2), 1);
}
function drawEnemy(c, e, t) {
  const T = ET[e.type], img = IMG[T.img], w = T.h * img.width / img.height, fy = e.y + 9;
  const st = e.stunT > 0 || e.blockBy, ph = st ? e.seed : t*(T.spd > 60 ? 16 : 11) + e.seed, bob = -Math.abs(Math.sin(ph))*(T.boss ? 1.2 : 1.8);
  c.fillStyle = e.slowT > 0 ? 'rgba(30,15,5,.55)' : 'rgba(0,0,0,.28)';
  c.beginPath(); c.ellipse(e.x, fy - 1, T.r*(e.slowT>0?1.3:1), T.r*.36, 0, 0, 7); c.fill();
  c.save(); c.translate(e.x, fy + bob);
  c.rotate(Math.sin(ph)*.05);
  const sqz = 1 + Math.sin(ph*2)*.025; c.scale(1/sqz, sqz);
  if (e.face < 0) c.scale(-1, 1);
  const s = spr(T.img, w);
  if (s) c.drawImage(s, -s.lw/2, -s.lh, s.lw, s.lh);
  if (e.flash > 0) { c.globalAlpha = Math.min(1, e.flash/.12)*.75; const f = spr(T.img, w, '#ffffff'); if (f) c.drawImage(f, -f.lw/2, -f.lh, f.lw, f.lh); }
  else if (e.slowT > 0) { c.globalAlpha = .28; const f = spr(T.img, w, '#2a1608'); if (f) c.drawImage(f, -f.lw/2, -f.lh, f.lw, f.lh); }
  c.globalAlpha = 1;
  c.restore();
  if (e.slowT > 0) { c.fillStyle = '#1a0f08'; for (let k = 0; k < 3; k++) { const yy = ((t*2 + k*.33 + e.seed) % 1)*10; c.beginPath(); c.arc(e.x - 4 + k*4, fy - T.h*.5 + yy, 1.3, 0, 7); c.fill(); } }
  if (e.stunT > 0) for (let k = 0; k < 3; k++) { const a = t*5 + k*2.09; star(c, e.x + Math.cos(a)*9, fy - T.h - 2 + Math.sin(a)*3, 2.6, '#ffe14d'); }
  if (e.hp < e.max) hpBar(c, e.x, fy - T.h - 5, T.boss ? 44 : 20, Math.max(0, e.hp/e.max));
}
function drawCorpse(c, o) {
  if (o.hero) { const k = Math.min(1, o.t/.35), a = Math.min(1, (1 - o.t/o.dur)*3); const key = 'h_' + o.id + o.tier, im = IMG[key]; if (!im || !im.width) return;
    c.save(); c.globalAlpha = Math.max(0, a); c.translate(o.x, o.y + 9); c.rotate(o.dir*k*1.3); if (o.face < 0) c.scale(-1, 1);
    const s = spr(key, 40*im.width/im.height); if (s) c.drawImage(s, -s.lw/2, -s.lh, s.lw, s.lh); c.restore(); return; }
  const T = ET[o.type], img = IMG[T.img], w = T.h * img.width / img.height;
  const k = o.t / o.dur, a = o.mode === 'flee' ? Math.min(1, (1 - k)*2.2) : Math.min(1, (1 - k)*3);
  if (a <= 0) return;
  c.save(); c.globalAlpha = a;
  c.translate(o.x, o.y + 9);
  if (o.mode === 'fall') {
    const r = Math.min(1, o.t/.35); c.rotate(o.dir * r * 1.45 * (T.spd > 60 ? .5 : 1)); c.translate(0, r*2);
  } else c.translate(0, -Math.abs(Math.sin(o.t*18))*2);
  if (o.face < 0) c.scale(-1, 1);
  const s = spr(T.img, w); if (s) c.drawImage(s, -s.lw/2, -s.lh, s.lw, s.lh);
  if (o.mode === 'fall' && o.t < .15) { const f = spr(T.img, w, '#ffffff'); c.globalAlpha = a*.7; if (f) c.drawImage(f, -f.lw/2, -f.lh, f.lw, f.lh); }
  c.restore();
}
function drawHussar(c, h, t, key='e_hus', hh=40) {
  if (h.d > PLEN || h.x === undefined) return;
  const img = IMG[key], w = hh*img.width/img.height;
  const ph = t*22 + h.seed, bob = -Math.abs(Math.sin(ph))*2.4;
  c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(h.x, h.y + 8, 14, 4.5, 0, 0, 7); c.fill();
  c.save(); c.translate(h.x, h.y + 9 + bob); c.rotate(Math.sin(ph)*.06 * h.face);
  if (h.face < 0) c.scale(-1, 1);
  const s = spr(key, w); if (s) c.drawImage(s, -s.lw/2, -s.lh, s.lw, s.lh);
  c.restore();
}
function drawFortress(c, t) {
  const {x, y, w, h} = FORT;
  drawSpr(c, M.fort, x + w/2, y + h, w);
  if (S.fortFlash > 0) { c.globalAlpha = Math.min(1, S.fortFlash/.4)*.45; drawSpr(c, M.fort, x + w/2, y + h, w, false, '#ff3030'); c.globalAlpha = 1; }
  if (M.id === 'jg') { // powiewające flagi na basztach (jak w v2)
    flag(c, x + w*.07, y + h*.2, 13, 8, t, ['#ffffff', '#e02b2b']);
    flag(c, x + w*.925, y + h*.2, 13, 8, t + 1.3, ['#ffffff', '#e02b2b']);
    flag(c, x + w*.717, y - 3, 11, 7, t + 2.1, ['#ffcc33', '#2a62c9']); }
}
function enemyFlag(c, t) {
  const x = 330, y = Math.min(10, -OFF + 16);
  const f = M.fac;
  if (f === 'swe') flag(c, x, y, 16, 10, t, ['#2a5bc9'], true, '#ffd23a');
  else if (f === 'teu') flag(c, x, y, 16, 10, t, ['#f4f1e8'], true, '#151515');
  else if (f === 'ger') flag(c, x, y, 16, 10, t, ['#000000', '#ffd23a', '#000000']); // Rzesza / Henryk V
  else if (f === 'mon') flag(c, x, y, 16, 10, t, ['#1a4a8a', '#c9a24a']); // Mongołowie
  else if (f === 'mos') flag(c, x, y, 16, 10, t, ['#ffffff', '#2a62c9', '#c81e1e']); // Moskwa
  else if (f === 'mol') flag(c, x, y, 16, 10, t, ['#2a62c9', '#ffd23a', '#c81e1e']); // Mołdawia
  else if (f === 'max') flag(c, x, y, 16, 10, t, ['#ffd23a', '#151515']); // Habsburgowie
  else if (f === 'tat') flag(c, x, y, 16, 10, t, ['#1a7a3a', '#c9a24a']); // Tatarzy
  else if (f === 'ott') { // Turcja – półksiężyc
    flag(c, x, y, 16, 10, t, ['#c81e1e'], true);
    const wy = Math.sin(t*6 - .5*4)*.5*10*.22; c.fillStyle = '#fff'; c.beginPath(); c.arc(x + 7.5, y + 5 + wy, 3, 0, 7); c.fill();
    c.fillStyle = '#c81e1e'; c.beginPath(); c.arc(x + 8.7, y + 4.7 + wy, 2.5, 0, 7); c.fill();
  } else flag(c, x, y, 16, 10, t, ['#c81e1e'], true);
}
function drawHero(c, h, t) {
  if (h.dead) return;
  const key = 'h_' + h.id + h.tier, im = IMG[key]; if (!im || !im.width) return;
  const hh = 40 + h.tier*1.5, w = hh*im.width/im.height, moving = h.tx !== null;
  const ph = h.walk*12, bob = moving ? -Math.abs(Math.sin(ph))*2 : 0;
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(h.x, h.y + 8, 11, 4, 0, 0, 7); c.fill();
  // złoty krąg bohatera
  c.strokeStyle = h.sel ? 'rgba(255,240,120,' + (.6 + Math.sin(t*8)*.4) + ')' : 'rgba(255,215,80,.75)'; c.lineWidth = h.sel ? 2.6 : 1.6;
  c.beginPath(); c.ellipse(h.x, h.y + 8, h.sel ? 16 : 13, h.sel ? 6.5 : 5, 0, 0, 7); c.stroke();
  if (h.tier >= 3) { c.globalAlpha = .25 + Math.sin(t*3)*.1; circ(c, h.x, h.y - hh*.45, hh*.55, '#fff3a0', null); c.globalAlpha = 1; }
  c.save(); c.translate(h.x, h.y + 9 + bob);
  const lunge = Math.max(0, h.anim);
  if (!HEROES[h.id].ranged) c.rotate(h.face*lunge*.18);
  if (moving) c.rotate(Math.sin(ph)*.05);
  if (h.face < 0) c.scale(-1, 1);
  const s = spr(key, w); if (s) c.drawImage(s, -s.lw/2 + lunge*3, -s.lh, s.lw, s.lh);
  c.restore();
  hpBar(c, h.x, h.y - hh - 2, 26, Math.max(0, h.hp/h.max));
  // odznaka poziomu
  circ(c, h.x - 17, h.y - hh, 6, '#3a2210', '#ffd84a', 1.4);
  c.fillStyle = '#ffe14d'; c.font = '800 8px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(h.lvl), h.x - 17, h.y - hh + .5);
}
function drawBubble(c, b) {
  const kindC = {pl:['#fffaf0','#3a2a14'], fort:['#fff3c4','#5a3a10'], sw:M.fac === 'ott' ? ['#ffe3d6','#6a1a10'] : M.fac === 'teu' ? ['#eeeeee','#1a1a1a'] : ['#dcecff','#16335e'], boss:['#ffe066','#5a1010'], hus:['#ffffff','#8a1020'], hero:['#fff6c8','#6a4a00']}[b.kind];
  c.font = '800 ' + (b.kind === 'boss' ? 11 : 10) + 'px ' + FONT;
  if (!b.w) b.w = c.measureText(b.text).width;
  const age = b.max - b.life, inK = Math.min(1, age/.16), sc = inK < 1 ? .4 + .6*(1 + 1.7*Math.pow(inK-1,3) + .7*Math.pow(inK-1,2)) : 1;
  const a = Math.min(1, b.life/.25);
  const bw = b.w + 12, bh = 17, ax = b.x, ay = b.y - b.dy - 4;
  let cx = Math.max(bw/2 + 3, Math.min(W - bw/2 - 3, ax)), cy = ay - bh/2 - 6;
  if (cy - bh/2 < -OFF + 2) cy = -OFF + 2 + bh/2;
  c.save(); c.globalAlpha = a; c.translate(ax, ay); c.scale(sc, sc); c.translate(-ax, -ay);
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, cx - bw/2 + 1.5, cy - bh/2 + 2, bw, bh, 8); c.fill();
  c.fillStyle = kindC[0]; c.strokeStyle = kindC[1]; c.lineWidth = 1.6;
  rr(c, cx - bw/2, cy - bh/2, bw, bh, 8); c.fill(); c.stroke();
  const tx = Math.max(cx - bw/2 + 8, Math.min(cx + bw/2 - 8, ax));
  c.beginPath(); c.moveTo(tx - 4, cy + bh/2 - 1); c.lineTo(ax, ay + 1); c.lineTo(tx + 4, cy + bh/2 - 1); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(tx - 4, cy + bh/2); c.lineTo(ax, ay + 1); c.lineTo(tx + 4, cy + bh/2); c.stroke();
  c.fillStyle = kindC[1]; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(b.text, cx, cy + 1);
  c.restore();
}

let realT = 0;
function render() {
  const c = ctx;
  c.setTransform(1, 0, 0, 1, 0, 0);
  if (BG) c.drawImage(BG, 0, 0);
  c.setTransform(SCALE*DPR, 0, 0, SCALE*DPR, 0, OFF*SCALE*DPR);
  if (S.shake > 0) c.translate(rnd(-1,1)*S.shake, rnd(-1,1)*S.shake);
  const t = S.time + realT*0; const at = realT;
  // ślady wybuchów
  for (const d of S.decals) { c.globalAlpha = Math.min(.45, d.life/d.max*.6); c.fillStyle = '#2b1d10'; c.beginPath(); c.ellipse(d.x, d.y + 3, d.r*1.3, d.r*.7, 0, 0, 7); c.fill(); }
  c.globalAlpha = 1;
  // pola budowy: podświetlenie
  const hint = S.towers.length === 0 && S.running;
  SPOTS.forEach(([x, y], i) => {
    if (S.towers.some(tw => tw.spot === i)) return;
    if (S.selected && S.selected.spot === i && !S.selected.tower && !S.selected.onRoad) { c.strokeStyle = '#fff3c4'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(x, y, 19, 9.5, 0, 0, 7); c.stroke(); }
    if (hint) { const k = (at*1.2) % 1; c.strokeStyle = 'rgba(255,240,120,' + (1-k) + ')'; c.lineWidth = 3; c.beginPath(); c.ellipse(x, y, 18 + k*10, 9 + k*5, 0, 0, 7); c.stroke(); }
    c.fillStyle = 'rgba(90,75,50,.75)'; c.font = '900 12px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('+', x, y + .5);
  });
  // pola na drodze – tylko gdy ekwipunek ma broń road:true
  if (S.loadout && S.loadout.some(k => TT[k] && TT[k].road)) {
    (M.roads||[]).forEach(([x, y], i) => {
      if (S.towers.some(tw => tw.spot === 'r'+i)) return;
      c.fillStyle = 'rgba(40,25,10,.55)'; c.beginPath(); c.ellipse(x, y, 14, 7, 0, 0, 7); c.fill();
      c.strokeStyle = 'rgba(255,200,80,.7)'; c.lineWidth = 1.5; c.setLineDash([3,2]); c.beginPath(); c.ellipse(x, y, 14, 7, 0, 0, 7); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#ffe14d'; c.font = '900 11px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('⬇', x, y + .5);
    });
  }
  // zasięg zaznaczonej wieży
  const selT = S.selected && S.selected.tower;
  if (selT) { const R = towerStat(selT, 'range'); c.fillStyle = 'rgba(255,255,255,.14)'; c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2; c.setLineDash([6, 4]); c.beginPath(); c.arc(selT.x, selT.y, R, 0, 7); c.fill(); c.stroke(); c.setLineDash([]); }
  // flaga szwedzka w obozie
  enemyFlag(c, at);
  // punkt zbiórki bohatera
  if (S.hero && S.hero.sel) { c.strokeStyle = 'rgba(255,240,120,.5)'; c.setLineDash([4, 4]); c.lineWidth = 1.5; c.beginPath(); c.arc(S.hero.x, S.hero.y + 8, 60, 0, 7); c.stroke(); c.setLineDash([]); }
  if (S.prayT > 0) { c.globalAlpha = Math.min(1, S.prayT)*.22; c.fillStyle = '#fff3a0'; c.beginPath(); c.arc(S.prayX, S.prayY, 130, 0, 7); c.fill(); c.globalAlpha = 1; }
  // obiekty posortowane po y
  const objs = [];
  for (const tw of S.towers) objs.push([tw.by - 4, 0, tw]);
  for (const e of S.enemies) objs.push([e.y + 9, 1, e]);
  for (const h of S.hussars) if (h.x !== undefined && h.d <= PLEN) objs.push([h.y + 9, 2, h]);
  for (const h of S.tatars) if (h.x !== undefined && h.d <= PLEN) objs.push([h.y + 9, 4, h]);
  if (S.hero && !S.hero.dead) objs.push([S.hero.y + 9, 5, S.hero]);
  for (const o of S.corpses) objs.push([o.y + 9, 3, o]);
  objs.sort((a, b) => a[0] - b[0]);
  for (const [, k, o] of objs) {
    if (k === 0) drawTower(c, o, at);
    else if (k === 1) drawEnemy(c, o, at);
    else if (k === 2) drawHussar(c, o, at);
    else if (k === 4) drawHussar(c, o, at, 'e_tat', 34);
    else if (k === 5) drawHero(c, o, at);
    else drawCorpse(c, o);
  }
  drawFortress(c, at);
  // smugi strzałów
  for (const tr of S.tracers) { c.strokeStyle = 'rgba(' + tr.col + ',' + (tr.life/tr.max) + ')'; c.lineWidth = tr.w; c.beginPath(); c.moveTo(tr.x1, tr.y1); c.lineTo(tr.x2, tr.y2); c.stroke(); }
  // złote promienie przeora
  for (const b of S.beams) { const a = b.life/b.max; c.strokeStyle = 'rgba(255,230,120,' + a + ')'; c.lineWidth = 4*a + 1; c.beginPath(); c.moveTo(b.x1, b.y1); c.lineTo(b.x2, b.y2); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,' + a + ')'; c.lineWidth = 1.4; c.stroke(); }
  // pociski: strzały / bełty / kule / bomby
  for (const p of S.proj) {
    if (p.t < 0) continue;
    const q = projPos(p);
    if (p.kind === 'arrow' || p.kind === 'bolt' || p.kind === 'hbolt') {
      const q2 = projPos(Object.assign({}, p, {t: p.t - 0.016}));
      const ang = Math.atan2(q.y - q2.y, q.x - q2.x);
      const heavy = p.kind === 'hbolt';
      const len = heavy ? 28 : p.kind === 'bolt' ? 14 : 11;
      const thick = heavy ? 4.2 : p.kind === 'bolt' ? 2.4 : 1.8;
      c.save(); c.translate(q.x, q.y); c.rotate(ang);
      // shaft
      c.strokeStyle = heavy ? '#4a3018' : p.kind === 'bolt' ? '#3a2a14' : '#5a3417';
      c.lineWidth = thick; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-len*.48, 0); c.lineTo(len*.5, 0); c.stroke();
      if (heavy) {
        c.strokeStyle = '#6b4a28'; c.lineWidth = 2.2;
        c.beginPath(); c.moveTo(-len*.4, 0); c.lineTo(len*.35, 0); c.stroke();
      }
      // tip
      c.fillStyle = heavy ? '#2a2a2e' : p.kind === 'bolt' ? '#6a4a28' : '#c41e3a';
      const tip = len*.55, back = heavy ? len*.18 : len*.2, hw = heavy ? 4.2 : 2.4;
      c.beginPath(); c.moveTo(tip, 0); c.lineTo(back, -hw); c.lineTo(back, hw); c.fill();
      // fletching
      c.strokeStyle = heavy ? '#c41e3a' : '#e8e0cc'; c.lineWidth = heavy ? 2 : 1;
      const ft = -len*.45;
      c.beginPath(); c.moveTo(ft, 0); c.lineTo(ft + (heavy?7:3.2), - (heavy?4.5:2));
      c.moveTo(ft, 0); c.lineTo(ft + (heavy?7:3.2), (heavy?4.5:2)); c.stroke();
      c.restore();
      c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(q.gx, q.gy + 2, heavy?5:3, heavy?2.2:1.4, 0, 0, 7); c.fill();
    } else {
      const r = p.hi ? 5.5 : 4.5;
      c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(q.gx, q.gy + 3, r, r*.45, 0, 0, 7); c.fill();
      circ(c, q.x, q.y, r, '#1e1e1e', '#000', 1); circ(c, q.x-1.5, q.y - 1.5, 1.4, 'rgba(255,255,255,.6)', null);
      if (p.hi) { c.fillStyle = (Math.floor(at*20) % 2) ? '#ffd23a' : '#ff6a00'; c.beginPath(); c.arc(q.x + 3, q.y - 5, 1.8, 0, 7); c.fill(); }
    }
  }
  // celownik ostrzału
  if (S.aiming) { const k = (at*1.5) % 1; c.strokeStyle = 'rgba(255,80,40,' + (1-k) + ')'; c.lineWidth = 3; c.beginPath(); c.arc(180, 250, 30 + k*40, 0, 7); c.stroke();
    c.fillStyle = 'rgba(60,10,0,.18)'; c.fillRect(0, -OFF, W, VH); }
  // cząsteczki
  for (const p of S.parts) {
    const a = Math.max(0, p.life / p.max);
    if (p.kind === 'smoke') { c.globalAlpha = a*.55; circ(c, p.x, p.y, p.size*(1.6 - a*.6), p.color, null); }
    else if (p.kind === 'ring') { c.globalAlpha = a; c.strokeStyle = p.color; c.lineWidth = 3; c.beginPath(); c.ellipse(p.x, p.y, p.size*(1 - a*.6), p.size*(1 - a*.6)*.55, 0, 0, 7); c.stroke(); }
    else if (p.kind === 'feather') { c.globalAlpha = Math.min(1, a*1.5); c.fillStyle = p.color; c.beginPath(); c.ellipse(p.x, p.y, p.size*1.6, p.size*.6, p.x*.1, 0, 7); c.fill(); }
    else { c.globalAlpha = Math.min(1, a*1.5); c.fillStyle = p.color; c.beginPath(); c.arc(p.x, p.y, Math.max(.3, p.size*a), 0, 7); c.fill(); }
  }
  c.globalAlpha = 1;
  // napisy
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  for (const f of S.floats) {
    const a = Math.min(1, f.life / f.max * 2.5), sc = 1 + Math.max(0, (f.life/f.max - .8))*2;
    c.globalAlpha = a; c.font = '800 ' + Math.round(f.size*sc) + 'px ' + FONT;
    c.strokeStyle = INK; c.lineWidth = 3; c.strokeText(f.text, f.x, f.y); c.fillStyle = f.color; c.fillText(f.text, f.x, f.y);
  }
  c.globalAlpha = 1;
  for (const b of S.bubbles) drawBubble(c, b);
  if (S.banner) {
    const b = S.banner, k = 1 - b.t / b.max, a = Math.min(1, b.t*3, k*8), sc = k < .12 ? .6 + k/.12*.4 : 1;
    c.save(); c.globalAlpha = a; c.translate(W/2, 230); c.scale(sc, sc);
    // fit title + wrap subtitle so nothing clips at phone edges (logical W=360)
    c.font = '800 26px ' + FONT;
    let title = b.text, tSize = 26;
    while (tSize > 16 && c.measureText(title).width > 300) { tSize -= 1; c.font = '800 ' + tSize + 'px ' + FONT; }
    const subLines = [];
    if (b.sub) {
      c.font = '700 13px ' + FONT;
      const words = String(b.sub).split(' ');
      let line = '';
      for (const w of words) {
        const trial = line ? line + ' ' + w : w;
        if (c.measureText(trial).width > 300) { if (line) subLines.push(line); line = w; }
        else line = trial;
      }
      if (line) subLines.push(line);
      if (!subLines.length) subLines.push(b.sub);
    }
    const boxH = 40 + (subLines.length ? 8 + subLines.length * 16 : 0);
    const gr = c.createLinearGradient(0, -boxH/2, 0, boxH/2); gr.addColorStop(0, 'rgba(70,35,15,.82)'); gr.addColorStop(1, 'rgba(35,18,8,.82)');
    c.fillStyle = gr; rr(c, -160, -boxH/2, 320, boxH, 14); c.fill();
    c.strokeStyle = 'rgba(255,210,100,.8)'; c.lineWidth = 2; c.stroke();
    c.font = '800 ' + tSize + 'px ' + FONT; c.strokeStyle = INK; c.lineWidth = 5;
    const titleY = subLines.length ? -boxH/2 + 22 : 0;
    c.strokeText(title, 0, titleY); c.fillStyle = '#ffe14d'; c.fillText(title, 0, titleY);
    if (subLines.length) {
      c.font = '700 13px ' + FONT; c.fillStyle = '#fff';
      subLines.forEach((ln, i) => c.fillText(ln, 0, titleY + 22 + i * 16));
    }
    c.restore();
  }
}


// ====== UI ======
const $ = id => document.getElementById(id);
const menu = $('menu');
const timg = (k, l) => `img/t_${k}${l}.webp?v=${V}`;
const iimg = k => `img/${k}.webp?v=${V}`;
const himg = (id, tier) => iimg('h_' + id + tier);
const heroTier = id => tierOf(heroLvl(id));
function toCss(x, y) { return [cv.offsetLeft + x*SCALE, cv.offsetTop + (y+OFF)*SCALE]; }
function placeMenu(x, y, above) {
  const [cx, cy] = toCss(x, y);
  menu.classList.remove('hidden');
  const mw = menu.offsetWidth, mh = menu.offsetHeight, m = 8;
  // Clamp inside the canvas (map) frame, not the full stage — keeps the popup
  // clear of the decorative brown/gold border around the map.
  const L = cv.offsetLeft + m, R = cv.offsetLeft + cv.offsetWidth - m;
  const T = cv.offsetTop + m, B = cv.offsetTop + cv.offsetHeight - m;
  const left = Math.max(L, Math.min(R - mw, cx - mw / 2));
  let top = cy - mh - (above || 26) * SCALE;
  if (top < T) top = cy + 24 * SCALE;
  if (top + mh > B) top = Math.max(T, B - mh);
  menu.style.left = left + 'px'; menu.style.top = top + 'px';
}
function closeMenu() { if (menu) menu.classList.add('hidden'); if (S) S.selected = null; }
function openBuild(i, onRoad) {
  S.selected = {spot: i, onRoad: !!onRoad};
  menu.className = 'build';
  const keys = (S.loadout || loadoutTowers()).filter(k => TT[k] && !!TT[k].road === !!onRoad);
  if (!keys.length) { sfx('click'); return; }
  const maxW = Math.max(200, cv.offsetWidth - 16), n = keys.length;
  const cols = n <= 2 ? n : n === 4 ? 2 : 3;
  menu.style.width = Math.min(maxW, 14 + cols * 102) + 'px';
  menu.innerHTML = '<div class="opts" style="grid-template-columns:repeat(' + cols + ',minmax(0,1fr))">' + keys.map(k => `<button class="opt" data-k="${k}"><img src="${timg(k,0)}" alt=""><span class="n">${TT[k].name}</span><span class="c">${TT[k].cost[0]} zł</span></button>`).join('') + '</div><div class="hint" id="optHint">'+(onRoad?'Na drodze':'Wybierz broń z ekwipunku')+'</div>';
  menu.querySelectorAll('.opt').forEach(b => {
    b.addEventListener('pointerenter', () => { $('optHint').textContent = TT[b.dataset.k].desc; });
    b.addEventListener('click', ev => { ev.stopPropagation(); audioInit();
      if (build(i, b.dataset.k, onRoad)) closeMenu(); else { sfx('click'); bumpGold(); $('optHint').textContent = TT[b.dataset.k].desc; } });
  });
  refreshMenu(); placeMenu(onRoad ? M.roads[i][0] : SPOTS[i][0], onRoad ? M.roads[i][1] : SPOTS[i][1]);
}
function openTower(tw) {
  S.selected = {spot: tw.spot, tower: tw};
  const T = TT[tw.type], max = tw.lvl >= 2, uc = max ? 0 : T.cost[tw.lvl+1], ref = Math.floor(tw.spent*.7);
  const dmgTxt = tw.type === 'smo' ? `Spowolnienie ${Math.round(towerStat(tw,'slow')*100)}%` : `Obrażenia ${towerStat(tw,'dmg')}`;
  const nextTxt = max ? '' : (tw.type === 'smo' ? ` → ${Math.round(T.slow[tw.lvl+1]*100)}%` : ` → ${T.dmg[tw.lvl+1]}`);
  menu.className = 'tower'; menu.style.width = Math.min(250, Math.max(200, cv.offsetWidth - 16)) + 'px';
  menu.innerHTML = `<div class="th"><img src="${timg(tw.type, tw.lvl)}" alt=""><div><h3>${T.name}</h3><div class="lv">${'★'.repeat(tw.lvl+1)}${'☆'.repeat(2-tw.lvl)} poziom ${tw.lvl+1}/3</div></div></div>
    <div class="desc">${T.desc}<br><b>${dmgTxt}${nextTxt}</b> · zasięg ${towerStat(tw,'range')}${max ? '' : ' → ' + T.range[tw.lvl+1]}</div>
    <div class="row"><button class="act up" data-c="${uc}">${max ? 'MAKS. ★' : 'Ulepsz · ' + uc + ' zł'}</button><button class="act sell">Sprzedaj +${ref}</button></div>`;
  menu.querySelector('.up').addEventListener('click', ev => { ev.stopPropagation(); audioInit(); if (upgrade(tw)) openTower(tw); else { sfx('click'); if (!max) bumpGold(); } });
  menu.querySelector('.sell').addEventListener('click', ev => { ev.stopPropagation(); audioInit(); sell(tw); closeMenu(); });
  refreshMenu(); placeMenu(tw.x, tw.y, tw.h + 2);
}
function refreshMenu() {
  if (menu.classList.contains('hidden')) return;
  menu.querySelectorAll('.opt').forEach(b => b.classList.toggle('no', S.gold < TT[b.dataset.k].cost[0]));
  const up = menu.querySelector('.up'); if (up) up.classList.toggle('no', !(+up.dataset.c) || S.gold < +up.dataset.c);
}
function bumpGold() { const p = $('gold').parentNode; p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); }

function tapAt(x, y) {
  if (!S.running || S.over || S.paused) return;
  if (S.aiming) { fireSpec(x, y); return; }
  const h = S.hero;
  if (h && !h.limp && !h.dead && Math.hypot(h.x - x, (h.y - 14) - y) < 26) { closeMenu(); h.sel = !h.sel; sfx('click'); if (h.sel && Math.random() < .5) heroSay(pick(HEROES[h.id].lines)); return; }
  const tw = S.towers.slice().sort((a, b) => b.by - a.by).find(t => (Math.abs(x - t.x) < t.w*.5 && y < t.by && y > t.by - t.h) || Math.hypot(t.x - x, t.y - y) < 22);
  const i = SPOTS.findIndex(s => Math.hypot(s[0] - x, s[1] - y) < 24);
  const ri = (M.roads||[]).findIndex(s => Math.hypot(s[0] - x, s[1] - y) < 22);
  if (h && h.sel && !tw) { closeMenu(); heroMove(x, y); return; }
  if (h) h.sel = false;
  if (tw) { sfx('click'); openTower(tw); return; }
  if (ri >= 0 && !S.towers.some(t => t.spot === 'r'+ri) && (S.loadout||[]).some(k => TT[k] && TT[k].road)) { sfx('click'); openBuild(ri, true); return; }
  if (i >= 0 && !S.towers.some(t => t.spot === i)) { sfx('click'); openBuild(i, false); return; }
  closeMenu();
}
cv.addEventListener('pointerdown', ev => {
  audioInit();
  const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * W, y = (ev.clientY - r.top) / r.height * VH - OFF;
  tapAt(x, y);
});
$('stage').addEventListener('pointerdown', ev => { if (ev.target === $('stage')) closeMenu(); });
$('btnWave').addEventListener('click', () => { audioInit(); if (!S.running || S.over || S.paused) return; if (S.wave === 0 || S.countdown !== null) startWave(true); });
$('btnSpec').addEventListener('click', () => { audioInit(); if (!S.paused) useSpec(); });
$('btnHero').addEventListener('click', () => { audioInit(); if (S.paused) return; const h = S.hero; if (!h) return;
  if (h.limp) { if (h.restUntilWave != null && S.wave > h.restUntilWave) heroReturn(); else { sfx('click'); banner('Bohater odpoczywa', 'Wróci po pełnej fali', 1.4); } return; }
  if (h.dead) return; if (!heroAbility()) { h.sel = !h.sel; sfx('click'); } });
$('btnSpeed').addEventListener('click', () => { audioInit(); sfx('click'); S.speed = S.speed === 1 ? 2 : 1; save.speed = S.speed; persist(); syncSettings(); });
$('btnPause').addEventListener('click', () => { audioInit(); sfx('click'); setPause(true); });

// ---- ekrany ----
const BASES = ['title', 'camp', 'pause', 'end'];
const PANELS = ['pSettings', 'pRecords', 'pHow', 'prep', 'pHeroes', 'unlock', 'hist', 'pChron', 'pChapter'];
function show(id) { for (const s of BASES.concat(PANELS)) $(s).classList.toggle('hidden', s !== id); }
function openPanel(id) { audioInit(); sfx('click');
  if (id === 'pRecords') renderRecords();
  if (id === 'pHeroes') renderHeroes();
  if (id === 'pChron') renderChron();
  syncSettings(); $(id).classList.remove('hidden');
}
function closePanel(id) { sfx('click'); $(id).classList.add('hidden'); if (id === 'pHeroes' || id === 'pChron' || id === 'pChapter') renderCamp(); }
function setPause(p) {
  if (!S.running || S.over) return;
  S.paused = p; closeMenu();
  $('pause').classList.toggle('hidden', !p);
  if (!p) for (const id of ['pSettings', 'pHow']) $(id).classList.add('hidden');
}
function stopBattle() { if (S) { S.running = false; S.paused = false; } closeMenu(); }
function goTitle() { sfx('click'); stopBattle(); show('title'); document.body.classList.add('onTitle'); renderBestLine(); setSong('jg'); }
function goCamp() { stopBattle(); show('camp'); const pc=$('pChapter'); if(pc) pc.classList.add('hidden'); document.body.classList.add('onTitle'); renderCamp(); setSong('jg'); }
function startBattle(id) {
  audioInit(); sfx('up');
  loadMap(MAPS[MAPI[id]] || MAPS[0]);
  newGame(); fit(); show(null); document.body.classList.remove('onTitle');
  S.running = true;
  banner(M.name + ' ' + M.year, 'Dotknij pole przy drodze', 2.6);
  if ((save.games|0) < 3) { const s0 = S; setTimeout(() => { if (S === s0 && S.running && !S.over) heroSay('Dotknij mnie, a potem drogę!', true); }, SIM ? 0 : 3200); }
}
function syncSettings() {
  $('setMusic').classList.toggle('on', !!save.music); $('setMusic').querySelector('b').textContent = save.music ? 'WŁ.' : 'WYŁ.';
  $('setSfx').classList.toggle('on', !!save.sfx); $('setSfx').querySelector('b').textContent = save.sfx ? 'WŁ.' : 'WYŁ.';
  $('setSpeed').classList.toggle('on', save.speed === 2); $('setSpeed').querySelector('b').textContent = 'x' + (save.speed || 1);
  for (const id of ['pmMusic', 'pmSfx']) { const on = id === 'pmMusic' ? save.music : save.sfx; $(id).classList.toggle('off', !on); }
}
function toggle(k) {
  audioInit();
  if (k === 'speed') { save.speed = save.speed === 2 ? 1 : 2; if (S) S.speed = save.speed; }
  else save[k] = !save[k];
  persist(); syncSettings(); musicUpdate(); sfx('click');
}
let resetAsk = 0;
function resetProgress() {
  const b = $('setReset');
  if (Date.now() - resetAsk > 3500) { resetAsk = Date.now(); b.classList.add('ask'); b.querySelector('span').textContent = '❓ Na pewno? Dotknij jeszcze raz'; sfx('click');
    setTimeout(() => { if (Date.now() - resetAsk >= 3400) { b.classList.remove('ask'); b.querySelector('span').textContent = '🗑️ Reset postępu'; } }, 3600); return; }
  resetAsk = 0; save.maps = {}; save.heroes = {}; save.games = 0; save.wins = 0; save.last = {hero:'zaw', spec:'ryc', towers:['luc','smo']}; save.seen = {}; persist();
  b.classList.remove('ask'); b.querySelector('span').textContent = '✅ Postęp wyzerowany'; sfx('lose'); renderCamp(); renderBestLine();
}
const starsHtml = n => [0,1,2].map(i => `<span class="${i < n ? 'on' : ''}">★</span>`).join('');
function totalStars() { return MAPS.reduce((a, m) => a + (mapRec(m.id).stars|0), 0); }
function renderRecords() {
  $('recMaps').innerHTML = MAPS.map((m, i) => { const r = mapRec(m.id); const e = r.endless|0; return `<div class="recm"><span>${mapOpen(i) ? m.name + ' ' + m.year : '🔒 ???'}${e?` · bastion ${e}`:''}</span><span class="st">${starsHtml(r.stars)}</span></div>`; }).join('');
  $('recWins').textContent = save.wins|0;
  $('recGames').textContent = save.games|0;
}
function renderBestLine() {
  const t = totalStars();
  $('bestLine').innerHTML = save.games ? `Kampania: <span class="st">★ ${t}/${TOTAL_STARS}</span> · bitwy: ${MAPS.filter(m => mapRec(m.id).stars > 0).length}/${MAPS.length}` : 'Szesnaście bitew o Polskę czeka!';
}

// ---- mapa kampanii ----
function sizeCampMap() {
  const wrap = $('cmapwrap'), cmap = $('cmap');
  if (!wrap || !cmap) return {w: 360, h: 640};
  // v3 painted map is portrait 9:16 — fit height, keep aspect, no pan needed
  const h = Math.max(240, wrap.clientHeight - 4);
  const w = Math.min(wrap.clientWidth - 16, Math.round(h * CAMP_ASPECT));
  const hh = Math.round(w / CAMP_ASPECT);
  cmap.style.height = hh + 'px';
  cmap.style.width = w + 'px';
  cmap.style.minWidth = '';
  cmap.style.aspectRatio = '9 / 16';
  return {w, h: hh};
}
function roadCurvePct(a, b, side) {
  // cubic bow in percent-space (SVG viewBox 0 0 100 100)
  const ax = a[0], ay = a[1], bx = b[0], by = b[1];
  const dx = bx - ax, dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const bow = (side % 2 === 0 ? 1 : -1) * Math.max(6, len * 0.22);
  const px = -dy / len, py = dx / len;
  const c1x = ax + dx * 0.35 + px * bow;
  const c1y = ay + dy * 0.35 + py * bow;
  const c2x = ax + dx * 0.65 + px * bow * 0.85;
  const c2y = ay + dy * 0.65 + py * bow * 0.85;
  // pull ends slightly off the ring (~3.5% ≈ half of 58px ring on ~540px width)
  const pull = 3.2;
  const sx = ax + dx / len * pull, sy = ay + dy / len * pull;
  const ex = bx - dx / len * pull, ey = by - dy / len * pull;
  return `M${sx.toFixed(2)} ${sy.toFixed(2)} C${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${ex.toFixed(2)} ${ey.toFixed(2)}`;
}
function roadCurve(a, b, side) {
  // cubic bezier: perpendicular bow ~18–25% of length (min ~4.5 map units) + wobble
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const nx = -uy, ny = ux;
  const s = (side % 2 === 0) ? 1 : -1;
  const pct = 0.18 + 0.07 * ((side * 37) % 5) / 4; // 18–25%
  const off = Math.max(len * pct, 4.5);
  const wob = Math.max(len * 0.06, 1.2);
  // both controls bowed the same way so midpoint visibly arcs; wobble differs them
  const c1x = a[0] + ux * len * 0.30 + nx * s * off + ny * wob * 0.55;
  const c1y = a[1] + uy * len * 0.30 + ny * s * off - nx * wob * 0.55;
  const c2x = a[0] + ux * len * 0.70 + nx * s * off - ny * wob * 0.45;
  const c2y = a[1] + uy * len * 0.70 + ny * s * off + nx * wob * 0.45;
  const cl = (v) => Math.max(1, Math.min(99, v));
  return 'M' + a[0] + ' ' + a[1] + ' C' + cl(c1x) + ' ' + cl(c1y) + ' ' + cl(c2x) + ' ' + cl(c2y) + ' ' + b[0] + ' ' + b[1];
}
function separateCampNodes(pos, mapW, mapH) {
  // v4.5: keep geographic positions exact — do not nudge nodes
  return pos;
}
function placeCampLabels(items, mapW, mapH, nodePos) {
  // Glue every label to its own node: gap 2–6px from ring edge.
  // Prefer below → right → left → above; shrink text before drifting.
  const placed = [];
  const out = {};
  const pad = 2;
  const labelGap = 3;
  const ringR = (it) => (it.big ? 21 : 17);
  const dirs = [[0, 1], [1, 0], [-1, 0], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]];
  const overlaps = (a, b, g) => !(a.r + g < b.l || a.l - g > b.r || a.b + g < b.t || a.t - g > b.b);
  const rings = {};
  for (const it of items) {
    const cx = nodePos[it.id][0] / 100 * mapW, cy = nodePos[it.id][1] / 100 * mapH;
    const rr = ringR(it);
    rings[it.id] = {l: cx - rr, r: cx + rr, t: cy - rr - (it.big ? 10 : 0), b: cy + rr + 2, cx, cy, rr};
  }
  const order = items.slice().sort((a, b) => {
    const dens = (it) => items.reduce((n, o) => n + (Math.hypot(it.x - o.x, it.y - o.y) < 12 ? 1 : 0), 0);
    return dens(b) - dens(a);
  });
  for (const it of order) {
    const ring = rings[it.id];
    const cx = ring.cx, cy = ring.cy, rr = ring.rr;
    let best = null;
    const sizes = [
      {w: it.w, h: it.h, scale: 1},
      {w: Math.max(28, it.w * 0.85), h: Math.max(12, it.h * 0.9), scale: 0.85},
      {w: Math.max(22, it.w * 0.7), h: Math.max(11, it.h * 0.82), scale: 0.7},
    ];
    for (const sz of sizes) {
      const hw = sz.w / 2, hh = sz.h / 2;
      for (const gapEdge of [3, 4, 5, 6, 8, 10, 12, 16, 20]) {
        for (const [dxn, dyn] of dirs) {
          const len = Math.hypot(dxn, dyn) || 1;
          const ux = dxn / len, uy = dyn / len;
          // place label so its near edge sits gapEdge past the ring
          const along = Math.abs(ux) * hw + Math.abs(uy) * hh;
          const dist = rr + gapEdge + along;
          let lx = cx + ux * dist, ly = cy + uy * dist;
          // soft clamp — reject if clamp would pull label onto the ring
          const clx = Math.max(hw + pad, Math.min(mapW - hw - pad, lx));
          const cly = Math.max(hh + pad, Math.min(mapH - hh - pad, ly));
          if (Math.hypot(clx - lx, cly - ly) > 8) continue; // would be yanked too far
          lx = clx; ly = cly;
          const box = {l: lx - hw, r: lx + hw, t: ly - hh, b: ly + hh};
          // must clear OWN ring by ≥2px (no covering the circle)
          if (overlaps(box, {l: cx - rr, r: cx + rr, t: cy - rr, b: cy + rr}, 2)) continue;
          let hit = false;
          for (const o of items) {
            if (o.id === it.id) continue;
            if (overlaps(box, rings[o.id], 2)) { hit = true; break; }
          }
          if (hit) continue;
          for (const p of placed) { if (overlaps(box, p.box, labelGap)) { hit = true; break; } }
          if (hit) continue;
          // ownership: own must be nearest by ≥3px margin
          const ownDist = Math.hypot(lx - cx, ly - cy);
          let nextD = 1e9;
          for (const o of items) {
            if (o.id === it.id) continue;
            const d = Math.hypot(lx - rings[o.id].cx, ly - rings[o.id].cy);
            if (d < nextD) nextD = d;
          }
          if (ownDist + 4 > nextD) continue;
          if (ownDist > rr + Math.max(hw, hh) + 24) continue; // too far
          // prefer below; push away from nearest other node
          let away = 0;
          for (const o of items) {
            if (o.id === it.id) continue;
            const ox = rings[o.id].cx - cx, oy = rings[o.id].cy - cy;
            const ol = Math.hypot(ox, oy) || 1;
            // reward placing opposite to neighbor
            away += (ux * ox + uy * oy) / ol * (120 / ol);
          }
          const score = ownDist + (uy > 0.5 ? 0 : 12) + (sz.scale < 1 ? 4 : 0) + Math.max(0, gapEdge - 6) * 0.4 + away * 18;
          if (!best || score < best.score) {
            best = {dx: lx - cx, dy: ly - cy, box, score, scale: sz.scale};
          }
        }
        if (best && best.score < rr + 18) break;
      }
      if (best && best.score < rr + 20) break;
    }
    if (!best) {
      // last resort: try dirs, prefer away from nearest other node; keep ownership
      const hw = Math.max(22, it.w * 0.7) / 2, hh = Math.max(11, it.h * 0.82) / 2;
      let nearO = null, nearOD = 1e9;
      for (const o of items) {
        if (o.id === it.id) continue;
        const d = Math.hypot(cx - rings[o.id].cx, cy - rings[o.id].cy);
        if (d < nearOD) { nearOD = d; nearO = rings[o.id]; }
      }
      const candidates = [
        [0, 1], [1, 0], [-1, 0], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7],
      ];
      let pick = null;
      for (const gapEdge of [4, 6, 8, 12, 16, 22]) {
        for (const [dxn, dyn] of candidates) {
          const len = Math.hypot(dxn, dyn) || 1;
          const ux = dxn / len, uy = dyn / len;
          const along = Math.abs(ux) * hw + Math.abs(uy) * hh;
          const dist = rr + gapEdge + along;
          let lx = Math.max(hw + pad, Math.min(mapW - hw - pad, cx + ux * dist));
          let ly = Math.max(hh + pad, Math.min(mapH - hh - pad, cy + uy * dist));
          const box = {l: lx - hw, r: lx + hw, t: ly - hh, b: ly + hh};
          if (overlaps(box, {l: cx - rr, r: cx + rr, t: cy - rr, b: cy + rr}, 1)) continue;
          const ownDist = Math.hypot(lx - cx, ly - cy);
          let nextD = 1e9;
          for (const o of items) {
            if (o.id === it.id) continue;
            nextD = Math.min(nextD, Math.hypot(lx - rings[o.id].cx, ly - rings[o.id].cy));
          }
          if (ownDist + 2 > nextD) continue;
          // prefer pointing away from nearest neighbor
          let away = 0;
          if (nearO) {
            const vx = cx - nearO.cx, vy = cy - nearO.cy;
            away = -(ux * vx + uy * vy); // more positive = more away
          }
          const score = ownDist + (uy > 0.5 ? 0 : 8) + gapEdge * 0.2 + away * 0.05;
          if (!pick || score < pick.score) pick = {dx: lx - cx, dy: ly - cy, box, score, scale: 0.7};
        }
        if (pick) break;
      }
      best = pick || {dx: 0, dy: rr + 6 + hh, box: {l:0,r:0,t:0,b:0}, score: 999, scale: 0.7};
    }
    placed.push({id: it.id, box: best.box});
    out[it.id] = [Math.round(best.dx), Math.round(best.dy), best.scale || 1];
  }
  return out;
}
function assertCampNoOverlap(mapW, mapH, nodePos, LBL) {
  const boxes = [];
  MAPS.forEach((m, i) => {
    const [x, y] = nodePos[m.id];
    const cx = x / 100 * mapW, cy = y / 100 * mapH;
    const rr = m.big ? 21 : 17;
    boxes.push({kind: 'ring', id: m.id, l: cx - rr, r: cx + rr, t: cy - rr - (m.big ? 10 : 0), b: cy + rr + 2});
    const L = LBL[m.id] || [0, 26, 1];
    const scale = L[2] || 1;
    const op = mapOpen(i);
    const text = op ? m.name : String(m.year);
    const w = Math.min(110, 12 + text.length * 6.6) * scale, h = (op ? 18 : 15) * scale;
    const lx = cx + L[0], ly = cy + L[1];
    boxes.push({kind: 'lbl', id: m.id, l: lx - w/2, r: lx + w/2, t: ly - h/2, b: ly + h/2});
  });
  let n = 0;
  const hit = (a, b, g) => !(a.r + g < b.l || a.l - g > b.r || a.b + g < b.t || a.t - g > b.b);
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    if (a.id === b.id) continue;
    const g = (a.kind === 'lbl' && b.kind === 'lbl') ? 3 : 4;
    if (hit(a, b, g)) n++;
  }
  return n;
}
function assertLabelOwnership(mapW, mapH, nodePos, LBL) {
  const centers = MAPS.map(m => {
    const [x, y] = nodePos[m.id];
    return {id: m.id, cx: x / 100 * mapW, cy: y / 100 * mapH, rr: m.big ? 21 : 17};
  });
  let bad = 0;
  const details = [];
  for (const m of MAPS) {
    const L = LBL[m.id] || [0, 26];
    const me = centers.find(c => c.id === m.id);
    const lx = me.cx + L[0], ly = me.cy + L[1];
    let nearest = null, nearestD = 1e9;
    for (const c of centers) {
      const d = Math.hypot(lx - c.cx, ly - c.cy);
      if (d < nearestD) { nearestD = d; nearest = c; }
    }
    const maxDist = me.rr + 32;
    if (nearest.id !== m.id || nearestD > maxDist) {
      bad++;
      details.push({id: m.id, nearest: nearest.id, d: +nearestD.toFixed(1), max: maxDist});
    }
  }
  return {bad, details};
}
function truncRoadEnds(aPct, bPct, raPx, rbPx, mapW, mapH) {
  // shorten in pixel space so stroke stops at ring edges (no stubs through circles)
  const ax = aPct[0] / 100 * mapW, ay = aPct[1] / 100 * mapH;
  const bx = bPct[0] / 100 * mapW, by = bPct[1] / 100 * mapH;
  const dx = bx - ax, dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const ra = Math.min(raPx + 3, len * 0.42), rb = Math.min(rbPx + 3, len * 0.42);
  const a2 = [(ax + ux * ra) / mapW * 100, (ay + uy * ra) / mapH * 100];
  const b2 = [(bx - ux * rb) / mapW * 100, (by - uy * rb) / mapH * 100];
  return [a2, b2];
}
function renderCamp() {
  $('campStars').textContent = '★ ' + totalStars() + '/' + TOTAL_STARS;
  const {w: mapW, h: mapH} = sizeCampMap();
  const svg = $('routeSvg');
  // v3-style dashed red roads between the 4 big battles (viewBox 0..100)
  let frontier = 0;
  for (let ci = 0; ci < CHAPTERS.length; ci++) {
    if (chapterOpen(ci)) frontier = ci;
    if (won(CHAPTERS[ci].boss)) frontier = Math.min(CHAPTERS.length - 1, ci + 1);
  }
  let roads = '';
  for (let ci = 0; ci < CHAPTERS.length - 1; ci++) {
    const a = CHAPTER_POS[CHAPTERS[ci].boss], b = CHAPTER_POS[CHAPTERS[ci + 1].boss];
    const d = roadCurvePct(a, b, ci);
    const done = won(CHAPTERS[ci].boss);
    const dim = ci >= frontier && !done;
    const fresh = !dim && (ci === frontier - 1 || ci === frontier);
    roads += `<path class="road${fresh ? ' draw' : ''}${dim ? ' dim' : ''}" d="${d}" />`;
  }
  if (svg) svg.innerHTML = roads;

  $('nodes').innerHTML = CHAPTERS.map((ch, ci) => {
    const [x, y] = CHAPTER_POS[ch.boss];
    const open = chapterOpen(ci);
    const prog = chapterProgress(ci);
    const bossWon = won(ch.boss);
    const active = open && prog.done < prog.total;
    const cls = ['node', 'chapter', 'big',
      bossWon ? 'won' : open ? 'open' : 'lock'].join(' ');
    const ring = open ? (bossWon ? '⚔' : String(ci + 1)) : '🔒';
    const label = open
      ? `<div class="nm" style="--ldx:0px;--ldy:48px"><b>${ch.name}</b><small class="chp">${prog.done}/${prog.total} · ★${prog.stars}</small></div>`
      : `<div class="nm faint" style="--ldx:0px;--ldy:48px"><small>${ch.year}</small></div>`;
    const swords = `<span class="swords" aria-hidden="true">⚔</span>`;
    return `<button class="${cls}" data-ci="${ci}" style="left:${x}%;top:${y}%">${swords}<div class="ring">${ring}${bossWon?`<span class="st">${starsHtml(mapRec(ch.boss).stars)}</span>`:''}</div>${label}</button>`;
  }).join('');

  $('nodes').querySelectorAll('.node.chapter').forEach(b => b.addEventListener('click', ev => {
    ev.stopPropagation(); audioInit();
    const ci = +b.dataset.ci;
    if (chapterOpen(ci)) openChapter(ci);
    else {
      sfx('click');
      b.animate([{transform:'translate(-50%,-50%) rotate(0)'},{transform:'translate(-50%,-50%) rotate(-8deg)'},{transform:'translate(-50%,-50%) rotate(8deg)'},{transform:'translate(-50%,-50%) rotate(0)'}], {duration:300});
    }
  }));

  requestAnimationFrame(() => {
    const wrap = $('cmapwrap'); if (!wrap) return;
    wrap.scrollTo({left: 0, top: 0});
  });
}
let chapterI = 0;
let prepI = 0;
let prepEndless = false;
function openChapter(ci) {
  audioInit(); sfx('click');
  chapterI = ci;
  const ch = CHAPTERS[ci];
  const prog = chapterProgress(ci);
  $('chTitle').textContent = ch.name;
  $('chYear').textContent = String(ch.year);
  $('chIntro').textContent = ci === 0
    ? 'Potyczki wiodące do wielkiej bitwy pod Grunwaldem.'
    : ci === 1 ? 'Szlak ku Kircholmowi — triumf husarii.'
    : ci === 2 ? 'Wojny na wschodzie i południu, aż po Chocim.'
    : 'Potop szwedzki i obrona Jasnej Góry.';
  $('chProg').innerHTML = `Postęp: <b>${prog.done}/${prog.total}</b> · ★${prog.stars}/${prog.maxStars}`;

  const parts = [];
  ch.maps.forEach((id, j) => {
    const m = MAPS[MAPI[id]];
    const i = MAPI[id];
    const op = mapOpen(i);
    const r = mapRec(id);
    const isBoss = id === ch.boss;
    const wonB = r.stars > 0;
    const cls = ['chNode', isBoss ? 'boss' : '', wonB ? 'won' : '', op ? 'open' : 'lock'].filter(Boolean).join(' ');
    const ring = op ? (isBoss ? '⚔' : String(j + 1)) : (isBoss ? '⚔' : '🔒');
    const st = op ? `<span class="cst">${starsHtml(r.stars)}</span>` : '';
    const sub = isBoss ? 'Wielka bitwa' : 'Potyczka';
    const title = op ? m.name : (isBoss ? ch.name : '???');
    const meta = op ? `${m.year} · ${sub}` : (isBoss ? `🔒 ${ch.year} · ${sub}` : 'Zablokowane');
    parts.push(`<button type="button" class="${cls}" data-i="${i}" data-open="${op?1:0}"><span class="cring">${ring}</span><span class="cinfo"><b>${title}</b><small>${meta}</small></span>${st}</button>`);
    if (j < ch.maps.length - 1) parts.push('<div class="chRoad" aria-hidden="true"></div>');
  });
  $('chPath').innerHTML = parts.join('');
  $('chPath').querySelectorAll('.chNode').forEach(b => {
    b.addEventListener('click', ev => {
      ev.preventDefault(); ev.stopPropagation();
      const i = +b.dataset.i;
      if (mapOpen(i)) {
        sfx('click');
        $('pChapter').classList.add('hidden');
        openPrep(i);
      } else {
        sfx('click');
        b.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(-4px)'},{transform:'translateX(0)'}], {duration:320});
        toast('Zablokowane');
      }
    });
  });
  // keep camp visible underneath
  $('camp').classList.remove('hidden');
  $('pChapter').classList.remove('hidden');
}
function toast(msg) {
  let el = $('toast');
  if (!el) {
    el = document.createElement('div'); el.id = 'toast';
    el.setAttribute('role','status');
    document.getElementById('app').appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 1400);
}
function closeChapter() {
  sfx('click');
  $('pChapter').classList.add('hidden');
  renderCamp();
}
function openPrep(i, endless) {
  prepI = i; prepEndless = !!endless; const m = MAPS[i];
  const last = save.last || {};
  PICK.hero = heroOpen(last.hero) ? last.hero : 'zaw';
  PICK.spec = specOpen(last.spec) ? last.spec : 'ryc';
  PICK.towers = (last.towers || ['luc','smo']).filter(k => TT[k] && towerOpen(k)).slice(0,4);
  if (PICK.towers.length < 1) PICK.towers = ['luc','smo'].filter(towerOpen);
  $('prepTitle').textContent = m.name + (prepEndless ? ' · Ostatni bastion' : '');
  $('prepYear').textContent = 'rok ' + m.year; $('prepIntro').textContent = prepEndless
    ? ('Ostatni bastion: nieskończone fale na mapie ' + m.name + '. Mini-boss co 10 fal. Rekord: fala ' + (mapRec(m.id).endless||0) + '.')
    : m.intro;
  const endBtn = $('prepEndless');
  if (endBtn) { endBtn.classList.toggle('hidden', !won(m.id)); endBtn.classList.toggle('sel', prepEndless); }
  const pc = $('pChapter'); if (pc) pc.classList.add('hidden');
  renderPrep(); openPanel('prep');
}
function toggleTowerPick(k) {
  if (!towerOpen(k)) return renderPrep(`🔒 ${TT[k].name} – odblokujesz po bitwie: ${mapName(TOWER_FROM[k])}.`);
  const arr = PICK.towers.slice();
  const ix = arr.indexOf(k);
  if (ix >= 0) { if (arr.length <= 1) return renderPrep('Zostaw przynajmniej 1 broń.'); arr.splice(ix,1); }
  else {
    if (arr.length >= 4) return renderPrep('Maks. 4 bronie w ekwipunku – odznacz inną.');
    arr.push(k);
    if (save.seen) save.seen['t_'+k] = true;
  }
  PICK.towers = arr; renderPrep();
}
function renderPrep(hint) {
  $('pickHero').innerHTML = HKEYS.map(k => { const op = heroOpen(k);
    return `<button class="pk ${op ? '' : 'lock'} ${PICK.hero === k ? 'sel' : ''}" data-h="${k}" aria-label="${HEROES[k].name}" title="${HEROES[k].name}"><img src="${himg(k, op ? heroTier(k) : 0)}" alt="${HEROES[k].name}">${op ? '' : '<span class="lk">🔒</span>'}${op ? `<small>poz. ${heroLvl(k)}</small>` : ''}</button>`; }).join('');
  $('pickSpec').innerHTML = SKEYS.map(k => { const op = specOpen(k); const neu = save.seen && save.seen['s_'+k] === false;
    return `<button class="pk ${op ? '' : 'lock'} ${PICK.spec === k ? 'sel' : ''} ${neu?'new':''}" data-s="${k}"><img src="${iimg(SPECS[k].img)}" alt="">${op ? '' : '<span class="lk">🔒</span>'}${SPECS[k].name}<small>${SPECS[k].uses}×</small></button>`; }).join('');
  const pt = $('pickTowers');
  if (pt) {
    pt.innerHTML = TKEYS.map(k => { const op = towerOpen(k), on = PICK.towers.includes(k), neu = save.seen && save.seen['t_'+k] === false;
      return `<button class="pk ${op?'':'lock'} ${on?'sel':''} ${neu?'new':''}" data-t="${k}"><img src="${timg(k,0)}" alt="">${op?'':'<span class="lk">🔒</span>'}${TT[k].name}<small>${on?'✓ w ekwip.':(op?TT[k].cost[0]+' zł':'&nbsp;')}</small></button>`; }).join('');
    pt.querySelectorAll('.pk').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); sfx('click'); toggleTowerPick(b.dataset.t); }));
  }
  $('prepHint').textContent = hint || `${HEROES[PICK.hero].short} · ${SPECS[PICK.spec].name} · bronie: ${PICK.towers.map(k=>TT[k].name).join(', ')} (${PICK.towers.length}/4)`;
  $('pickHero').querySelectorAll('.pk').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); sfx('click'); const k = b.dataset.h;
    toast(HEROES[k].name);
    if (!heroOpen(k)) return renderPrep(`🔒 ${HEROES[k].name} – odblokujesz, wygrywając bitwę: ${mapName(HERO_FROM[k])}.`);
    PICK.hero = k; renderPrep(); }));
  $('pickSpec').querySelectorAll('.pk').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); sfx('click'); const k = b.dataset.s;
    if (!specOpen(k)) return renderPrep(`🔒 ${SPECS[k].name} – odblokujesz, wygrywając bitwę: ${mapName(SPEC_FROM[k])}.`);
    PICK.spec = k; if (save.seen) save.seen['s_'+k] = true; renderPrep(); }));
}

// ---- bohaterowie ----
let heroTab = 'zaw';
const STN = [['Siła', 'obrażenia +2% / pkt'], ['Krzepa', 'zdrowie +2% / pkt'], ['Umiejętność', 'moc +2% / pkt']];
function renderHeroes() {
  $('hTabs').innerHTML = HKEYS.map(k => `<button class="pk ${heroOpen(k) ? '' : 'lock'} ${heroTab === k ? 'sel' : ''}" data-h="${k}" aria-label="${HEROES[k].name}" title="${HEROES[k].name}"><img src="${himg(k, heroOpen(k) ? heroTier(k) : 0)}" alt="${HEROES[k].name}"></button>`).join('');
  $('hTabs').querySelectorAll('.pk').forEach(b => b.addEventListener('click', ev => {
    ev.stopPropagation(); sfx('click');
    const k = b.dataset.h; heroTab = k;
    toast(HEROES[k].name);
    renderHeroes();
  }));
  const k = heroTab, B = HEROES[k], op = heroOpen(k);
  if (!op) { $('hBody').innerHTML = `<div class="hb"><img src="${himg(k,0)}" alt="" style="filter:grayscale(1) brightness(.5)"><div><h3>${B.name}</h3><div class="hdesc">${B.desc}</div><div class="hlock">🔒 Odblokujesz, wygrywając bitwę: <b>${mapName(HERO_FROM[k])}</b>.</div></div></div>`; return; }
  const d = heroData(k), L = heroLvl(k), st = heroStats(k), pts = heroPts(k), T = tierOf(L);
  const lo = XPNEED[L-1]||0, hi = L >= 30 ? lo : (XPNEED[L]||lo+1), pct = L >= 30 ? 100 : Math.round((d.xp - lo)/Math.max(1,hi - lo)*100);
  $('hBody').innerHTML = `<div class="hb"><img src="${himg(k, T)}" alt=""><div style="flex:1"><h3>${B.name}</h3><div class="lv">Poziom ${L}/30 · ${B.ranged ? 'walczy z daleka' : 'walczy wręcz'}</div>
      <div class="xpb"><i style="width:${pct}%"></i></div><div class="hdesc">${L >= 30 ? 'Maksymalny poziom!' : 'Doświadczenie: ' + d.xp + ' / ' + hi}<br>❤ ${st.hp} · ⚔ ${st.dmg} · Siła +${st.pctS||0}% · Krzepa +${st.pctK||0}% · Um. +${st.pctU||0}%</div></div></div>
    <div class="pts">${pts > 0 ? 'Punkty do wydania: ' + pts : 'Brak wolnych punktów – zdobywaj poziomy w bitwach!'}</div>
    ${STN.map(([n, s], i) => `<div class="srow"><span><b>${n}</b> <small>${s} (teraz +${(d.st[i]||0)*2}%)</small></span><span class="dots">${d.st[i]||0}</span><button data-st="${i}" ${pts > 0 && d.st[i] < MAX_STAT ? '' : 'disabled'}>+</button></div>`).join('')}
    <div class="abil"><b>Moc: ${B.ab}</b> – ${B.abDesc} (co ${st.abCd} s)</div>
    <div class="tiers">${[0,1,2,3].map(t => `<div class="${t <= T ? '' : 'no'} ${t === T ? 'cur' : ''}"><img src="${himg(k,t)}" alt=""><br>poz. ${TIER_LV[t]}</div>`).join('')}</div>
    <div class="hdesc" style="margin-top:4px">${B.tiers[T]}${T < 3 ? ' → na poz. ' + TIER_LV[T+1] + ': ' + B.tiers[T+1] : ''}</div>`;
  $('hBody').querySelectorAll('[data-st]').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); const i = +b.dataset.st;
    if (heroPts(k) > 0 && d.st[i] < MAX_STAT) { d.st[i]++; persist(); sfx('up'); renderHeroes(); } }));
}

// ---- odblokowania, historia, kronika ----
function renderUnlock(m) {
  const u = m.unlock, it = [], i = MAPI[m.id];
  if (u.hero) it.push(`<div class="ul"><img src="${himg(u.hero,0)}" alt=""><div><b>Nowy bohater: ${HEROES[u.hero].name}</b><small>${HEROES[u.hero].desc}</small></div></div>`);
  if (u.tower) it.push(`<div class="ul"><img src="${timg(u.tower,0)}" alt=""><div><b>Nowa wieża: ${TT[u.tower].name}</b><small>${TT[u.tower].desc}</small></div></div>`);
  if (u.spec) it.push(`<div class="ul"><img src="${iimg(SPECS[u.spec].img)}" alt=""><div><b>Nowy atak: ${SPECS[u.spec].name}</b><small>${SPECS[u.spec].desc}</small></div></div>`);
  if (u.chest) it.push(`<div class="ul"><span class="ic">📦</span><div><b>Skrzynia ze skarbami!</b><small>+${CHEST_GOLD} zł na następną bitwę · +${CHEST_XP} XP dla bohatera</small></div></div>`);
  const nxt = nextUnlockAfter(m.id);
  if (nxt) {
    const nm = MAPS[MAPI[nxt]];
    const ch = chapterOf(nxt);
    const isBoss = ch && ch.boss === nxt;
    const isNewCh = ch && ch.maps[0] === nxt && ch.boss !== m.id;
    const label = isNewCh ? `Nowy rozdział: ${ch.name}` : (isBoss ? `Wielka bitwa: ${nm.name} ${nm.year}` : `Nowa potyczka: ${nm.name} ${nm.year}`);
    const hint = isNewCh ? 'Odblokowany na mapie kampanii.' : (isBoss ? 'Czeka na końcu rozdziału.' : 'Czeka w oknie rozdziału.');
    it.push(`<div class="ul"><span class="ic">🗺️</span><div><b>${label}</b><small>${hint}</small></div></div>`);
  }
  if (u.final) it.push(`<div class="ul"><span class="ic">🏆</span><div><b>Kampania ukończona!</b><small>Obroniłeś Polskę! Zbierz gwiazdki – ${totalStars()}/${TOTAL_STARS}. Spróbuj Ostatniego bastionu!</small></div></div>`);
  $('unlockList').innerHTML = it.map((s, k) => s.replace('class="ul"', `class="ul" style="animation-delay:${k*.15}s"`)).join('');
  $('unlock').querySelector('h2').textContent = u.final ? 'Zwycięstwo!' : 'Odblokowano!';
}
let histFromChron = false;
function showHist(id, fromChron) {
  histFromChron = !!fromChron; const m = MAPS[MAPI[id]], H = m.hist;
  $('histImg').src = iimg(H.img); $('histTitle').textContent = H.title;
  $('histText').innerHTML = H.text.map(t => `<p>${t}</p>`).join(''); $('histFun').textContent = H.fun;
  $('histBtn').textContent = fromChron ? 'Wróć' : 'Do mapy kampanii';
  if (!fromChron) { save.seen[id] = true; persist(); }
  $('hist').querySelector('.card').scrollTop = 0;
  if (fromChron) $('pChron').classList.add('hidden');
  openPanel('hist');
}
function renderChron() {
  $('chronList').innerHTML = MAPS.map(m => won(m.id) ? `<button class="chr" data-id="${m.id}"><img src="${iimg(m.hist.img)}" alt="">${m.hist.title}</button>` : `<div class="chr no"><span style="width:64px;text-align:center">🔒</span>Wygraj bitwę, by odkryć tę kartę</div>`).join('');
  $('chronList').querySelectorAll('[data-id]').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); showHist(b.dataset.id, true); }));
}
function afterWin() {
  $('end').classList.add('hidden');
  const m = MAPS[MAPI[LAST.map]];
  if (LAST.first) { renderUnlock(m); openPanel('unlock'); sfx('lvl'); }
  else showHist(m.id, false);
}

document.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', ev => {
  ev.stopPropagation();
  const a = b.dataset.act;
  if (a === 'play') { audioInit(); sfx('click'); goCamp(); }
  else if (a === 'settings') openPanel('pSettings');
  else if (a === 'records') openPanel('pRecords');
  else if (a === 'how') openPanel('pHow');
  else if (a === 'heroes') { heroTab = heroOpen(heroTab) ? heroTab : 'zaw'; openPanel('pHeroes'); }
  else if (a === 'chron') openPanel('pChron');
  else if (a === 'back') { const pid = b.closest('.panel').id; closePanel(pid); if (pid === 'prep') openChapter(chapterI); }
  else if (a === 'resume') { audioInit(); sfx('click'); setPause(false); }
  else if (a === 'menu') goTitle();
  else if (a === 'leave' || a === 'camp') { sfx('click'); goCamp(); }
  else if (a === 'again') startBattle(M.id);
  else if (a === 'fight') { ENDLESS = prepEndless; save.last = {hero: PICK.hero, spec: PICK.spec, towers: PICK.towers.slice(0,4)}; persist(); startBattle(MAPS[prepI].id); }
  else if (a === 'closeChapter') { closeChapter(); }
  else if (a === 'endless') { prepEndless = !prepEndless; openPrep(prepI, prepEndless); }
  else if (a === 'bastion') { sfx('click'); ENDLESS = true; $('hist').classList.add('hidden'); openPrep(MAPI[LAST.map], true); }
  else if (a === 'next') { sfx('click'); afterWin(); }
  else if (a === 'unext') { $('unlock').classList.add('hidden'); showHist(LAST.map, false); }
  else if (a === 'hnext') { sfx('click'); if (histFromChron) { closePanel('hist'); openPanel('pChron'); } else if (LAST && LAST.win && !LAST._bastionShown) { LAST._bastionShown = true; showBastionChoice(); } else goCamp(); }
  else if (a === 'reset') resetProgress();
  else if (a === 'music' || a === 'sfx' || a === 'speed') toggle(a);
}));

function showBastionChoice() {
  // After history: Dalej (camp) | Ostatni bastion
  $('hist').classList.add('hidden');
  $('endTitle').textContent = 'Co dalej?';
  $('end').classList.remove('lose');
  $('stars').innerHTML = '';
  $('endText').innerHTML = `Bitwa <b>${MAPS[MAPI[LAST.map]].name}</b> za tobą.<br>Wróć na mapę albo zostań bronić w <b>Ostatnim bastionie</b> (nieskończone fale).`;
  $('endXp').innerHTML = '';
  $('endNext').classList.add('hidden');
  const again = $('end').querySelector('[data-act="again"]');
  again.classList.add('hidden');
  let row = $('bastionRow');
  if (!row) {
    row = document.createElement('div'); row.id = 'bastionRow'; row.className = 'brow';
    row.innerHTML = `<button class="mbtn play" data-act="camp">Dalej</button><button class="mbtn play gold" data-act="bastion">Ostatni bastion</button>`;
    $('end').querySelector('.card')?.appendChild(row) || $('end').appendChild(row);
    row.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', ev => {
      ev.stopPropagation(); const a = b.dataset.act;
      if (a === 'camp') { row.classList.add('hidden'); again.classList.remove('hidden'); goCamp(); }
      if (a === 'bastion') { row.classList.add('hidden'); again.classList.remove('hidden'); ENDLESS = true; openPrep(MAPI[LAST.map], true); }
    }));
  }
  row.classList.remove('hidden');
  closeMenu(); show('end');
}
function showEnd(win, stars) {
  const bastionRow = $('bastionRow'); if (bastionRow) bastionRow.classList.add('hidden');
  $('end').querySelector('[data-act="again"]').classList.remove('hidden');
  if (S.endless) {
    $('endTitle').textContent = 'OSTATNI BASTION';
    $('end').classList.add('lose');
    $('stars').innerHTML = '';
    const best = mapRec(M.id).endless || 0;
    $('endText').innerHTML = `Doszedłeś do fali <b>${Math.max(0,S.wave-(win?0:1))}</b>.<br>Rekord na tej mapie: <b>${best}</b>.`;
    const L = LAST || {};
    $('endXp').innerHTML = L.hero ? `${HEROES[L.hero].short}: +${Math.round(L.xp)} XP` : '';
    $('endNext').classList.add('hidden');
    $('end').querySelector('[data-act="again"]').classList.add('play');
    $('end').querySelector('[data-act="again"]').classList.remove('small');
    closeMenu(); show('end'); return;
  }
  $('endTitle').textContent = win ? 'ZWYCIĘSTWO!' : 'PORAŻKA';
  $('end').classList.toggle('lose', !win);
  $('stars').innerHTML = [0,1,2].map(i => `<span class="${i < stars ? 'on' : ''}" style="animation-delay:${.3 + i*.35}s">★</span>`).join('');
  $('endText').innerHTML = win
    ? `${pick(PL.win)} Bitwa wygrana: <b>${M.name} ${M.year}</b>!<br>Zostało <b>${S.lives}</b> ❤ · pokonani wrogowie: <b>${S.kills}</b>.<br>${stars < 3 ? 'Strać mniej żyć, a zdobędziesz 3 gwiazdki!' : 'Perfekcyjna obrona!'}`
    : `Wróg wdarł się za mury w fali <b>${S.wave}</b>.<br>Ulepszaj wieże, ustaw bohatera na drodze i oszczędzaj atak specjalny!`;
  const L = LAST || {};
  $('endXp').innerHTML = L.hero ? `${HEROES[L.hero].short}: +${Math.round(L.xp)} XP${L.lvlTo > L.lvlFrom ? ` · <span class="up">awans na poziom ${L.lvlTo}!</span>${tierOf(L.lvlTo) > tierOf(L.lvlFrom) ? ' Nowa zbroja!' : ''}` : ''}` : '';
  $('endNext').classList.toggle('hidden', !win);
  $('end').querySelector('[data-act="again"]').classList.toggle('play', !win);
  $('end').querySelector('[data-act="again"]').classList.toggle('small', win);
  closeMenu(); show('end');
}

const last = {};
function setTxt(id, v) { if (last[id] !== v) { last[id] = v; $(id).textContent = v; } }
function setCls(el, c, on) { if (el.classList.contains(c) !== !!on) el.classList.toggle(c, !!on); }
function ui() {
  setTxt('gold', String(S.gold)); setTxt('lives', String(S.lives)); setTxt('wave', S.endless ? `${S.wave}∞` : `${S.wave}/${WAVES.length}`);
  const bw = $('btnWave');
  let lbl, sub, en;
  if (S.wave === 0) { lbl = '▶ Fala 1'; sub = 'zaczynamy?'; en = S.running; }
  else if (S.countdown !== null) { const b = Math.ceil(S.countdown)*2; lbl = `▶ Fala ${S.wave+1}`; sub = `+${b} zł · za ${Math.ceil(S.countdown)} s`; en = true; }
  else if (!S.endless && S.wave >= WAVES.length) { lbl = 'Ostatnia fala!'; sub = `wrogów: ${S.enemies.length + S.queue.length}`; en = false; }
  else { lbl = 'Fala trwa…'; sub = `wrogów: ${S.enemies.length + S.queue.length}`; en = false; }
  setTxt('waveLbl', lbl); setTxt('waveSub', sub);
  en = en && !S.over && !S.paused;
  if (bw.disabled === en) bw.disabled = !en;
  setCls(bw, 'pulse', en && (S.wave === 0 ? S.towers.length > 0 : true));
  // atak specjalny
  const sb = $('btnSpec'), sp = SPECS[S.spec], left = S.specLeft, ready = specReady() || S.aiming;
  if (sb.disabled === ready) sb.disabled = !ready;
  setCls(sb, 'spent', left <= 0); setCls(sb, 'aim', S.aiming);
  $('specFill').style.height = (left > 0 ? S.charge / sp.cd * 100 : 0) + '%';
  setTxt('specLbl', S.aiming ? 'Anuluj' : sp.name.split(' ')[0]);
  setTxt('specCnt', left + '/' + sp.uses);
  setTxt('specSub', S.aiming ? 'dotknij cel' : left <= 0 ? 'wykorzystane' : S.charge > 0 ? `za ${Math.ceil(S.charge)} s` : 'gotowe!');
  setCls(sb, 'pulse', specReady() && S.enemies.length > 8);
  // bohater
  const h = S.hero, hb = $('btnHero');
  if (h) {
    const src = himg(h.id, h.tier); if (last.heroImg !== src) { last.heroImg = src; $('heroImg').src = src; }
    const limp = !!h.limp;
    const canRet = limp && h.restUntilWave != null && S.wave > h.restUntilWave;
    const rd = !h.dead && !limp && h.abT <= 0 && S.running && !S.over;
    setCls(hb, 'ready', rd || canRet); setCls(hb, 'dead', h.dead || limp);
    $('heroFill').style.height = (limp || h.dead ? 100 : h.abT / h.abCd * 100) + '%';
    setTxt('heroSub', limp ? (canRet ? 'WRÓĆ ▶' : 'odpoczywa…') : h.abT > 0 ? `${HEROES[h.id].ab.split(' ')[0]} ${Math.ceil(h.abT)} s` : HEROES[h.id].ab.split(' ')[0] + '!');
  }
  setTxt('btnSpeed', 'x' + S.speed);
  refreshMenu();
}

// ====== PĘTLA ======
let lastT = performance.now(), started = false;
function frame(now) {
  const dt = Math.min(.05, (now - lastT) / 1000); lastT = now; realT += dt;
  if (!document.body.classList.contains('onTitle')) {
    for (let i = 0; i < S.speed; i++) update(dt);
    render(); ui();
  }
  requestAnimationFrame(frame);
}
document.addEventListener('pointerdown', () => audioInit(), {capture: true});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && S && S.running && !S.over && !S.paused) setPause(true);
  musicUpdate();
});
window.addEventListener('resize', () => { if (started) { fit(); closeMenu(); if (!$('camp').classList.contains('hidden')) renderCamp(); } });

function boot() {
  newGame(); fit(); started = true; syncSettings(); renderBestLine(); renderCamp();
  document.body.classList.remove('loading');
  if (save.notice) { const n = save.notice; save.notice = null; persist(); setTimeout(() => alert(n), 200); }
  if (Q.has('autostart')) {
    const id = Q.get('map') || 'glo'; if (Q.get('hero')) PICK.hero = Q.get('hero'); if (Q.get('spec')) PICK.spec = Q.get('spec');
    if (Q.get('towers')) PICK.towers = Q.get('towers').split(',');
    ENDLESS = Q.has('endless');
    startBattle(id);
  }
  else if (Q.has('camp')) goCamp();
  else { show('title'); document.body.classList.add('onTitle'); }
  requestAnimationFrame(frame);
}
document.body.classList.add('loading', 'onTitle');
{
  let pending = 2; const go = () => { if (--pending === 0) boot(); };
  loadImages(go);
  const fl = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('800 16px Baloo2'), document.fonts.load('400 16px Baloo2'), document.fonts.load('32px Cinzel')]) : Promise.resolve();
  Promise.race([fl, new Promise(r => setTimeout(r, 2500))]).catch(() => {}).then(go);
}

// API do testów
window.TD = {
  get S() { return S; }, get SPOTS() { return SPOTS; }, get WAVES() { return WAVES; }, get M() { return M; }, get save() { return save; }, get LAST() { return LAST; }, get PICK() { return PICK; }, MAPS, HEROES, TKEYS, TT,
  build: (i, k, onRoad) => build(i, k, onRoad), upgrade: i => upgrade(S.towers.find(t => t.spot === i)), next: () => startWave(true),
  tick: (n=1) => { for (let i=0;i<n;i++) update(1/60); },
  spawn: (type,d) => { spawn(type||'pie',0,1); const e=S.enemies[S.enemies.length-1]; if(d!=null && e){e.d=d; const q=posAt(d); e.x=q.x;e.y=q.y;} return e; },
  setPick: (o) => { Object.assign(PICK,o); renderPrep(); },
  spec: (x, y) => { if (S.spec === 'ost') { if (!S.aiming) useSpec(); return fireSpec(x ?? 180, y ?? 250); } return useSpec(); },
  husaria: () => useSpec(),
  start: (id, hero, spec) => { if (hero) PICK.hero = hero; if (spec) PICK.spec = spec; ENDLESS=false; startBattle(id || 'glo'); },
  bastion: (id) => { ENDLESS=true; startBattle(id || M.id); },
  sim(sec, cb) { SIM = true; const n = Math.round(sec*60); for (let i = 0; i < n && !S.over; i++) { update(1/60); if (cb) cb(S); } SIM = false; return {wave:S.wave, lives:S.lives, gold:S.gold, over:S.over, result:S.result, specLeft:S.specLeft, hero: S.hero && {lvl:S.hero.lvl, dead:S.hero.dead, hp:S.hero.hp}}; },
  win: (stars=3) => { S.lives = stars >= 3 ? 20 : stars === 2 ? 12 : 5; S.wave = WAVES.length; endGame(true); },
  lose: () => { S.lives = 0; endGame(false); },
  unlockAll: () => { for (const m of MAPS) save.maps[m.id] = {stars:3, best:WAVES.length, wins:1}; for (const k of HKEYS) heroData(k); persist(); renderCamp(); },
  freshCamp: () => { save.maps = {}; persist(); renderCamp(); },
  giveXp: (id, n) => { heroData(id).xp += n; persist(); },
  hero: () => S.hero, moveHero: (x, y) => heroMove(x, y), ability: () => heroAbility(), tap: (x, y) => tapAt(x, y),
  toScreen: (x, y) => { const r = cv.getBoundingClientRect(); return [r.left + x/W*r.width, r.top + (y + OFF)/VH*r.height]; },
  camp: goCamp, prep: i => openPrep(i), chapter: ci => openChapter(ci), heroes: id => { heroTab = id || 'zaw'; openPanel('pHeroes'); }, hist: id => showHist(id, true), chron: () => openPanel('pChron'),
  cov: i => { const [sx, sy] = SPOTS[i]; let c = 0; for (let d = 0; d < PLEN; d += 8) { const q = posAt(d); if (Math.hypot(q.x - sx, q.y - sy) < 85) c++; } return c; },
  open: k => towerOpen(k),
  setSpeed: n => { S.speed = n; }, openTower: i => openTower(S.towers.find(t => t.spot === i)), openBuild, pause: setPause, goTitle,
  say: (txt, kind) => say(txt, kind || 'pl', FORT_SPOT, 0, true),
};
})();

})();
