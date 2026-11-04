'use strict';
(() => {
// ====== KONFIGURACJA ======
const V = '2';
const W = 360, H = 560;
const Q = new URLSearchParams(location.search);
const DEBUG = Q.has('debug');
const SAVE_KEY = 'twierdza-jg-v2', OLD_KEY = 'twierdza-jg-v1';
const START_GOLD = DEBUG ? 5000 : 230, START_LIVES = 20;
const HUS_CD = 40, HUS_MAX = 3, CD_BETWEEN = 20;
const FONT = 'Baloo2, system-ui, sans-serif';

const PATH = [[70,-25],[70,95],[290,95],[290,200],[70,200],[70,305],[290,305],[290,405],[180,405],[180,478]];
const SEG = []; let PLEN = 0;
for (let i = 0; i < PATH.length - 1; i++) {
  const a = PATH[i], b = PATH[i+1], l = Math.hypot(b[0]-a[0], b[1]-a[1]);
  SEG.push({a, b, l, s: PLEN, dx: (b[0]-a[0])/l, dy: (b[1]-a[1])/l}); PLEN += l;
}
function posAt(d) {
  if (d <= 0) { const s = SEG[0]; return {x: s.a[0] + s.dx*d, y: s.a[1] + s.dy*d, dx: s.dx, dy: s.dy}; }
  for (const s of SEG) if (d <= s.s + s.l) { const k = d - s.s; return {x: s.a[0]+s.dx*k, y: s.a[1]+s.dy*k, dx: s.dx, dy: s.dy}; }
  const s = SEG[SEG.length-1]; return {x: s.b[0], y: s.b[1], dx: s.dx, dy: s.dy};
}
const SPOTS = [[180,45],[130,147],[235,147],[335,147],[28,252],[130,252],[235,252],[130,357],[235,357],[335,357],[85,450],[275,450]];
const FORT = {x: 95, y: 418, w: 170, h: 170*367/440};

const TT = {
  mus: {name:'Muszkieterzy', desc:'Szybki ogień w jeden cel', cost:[70,60,110], dmg:[14,22,34], rate:[.65,.52,.4], range:[92,100,110]},
  arm: {name:'Armata', desc:'Wolna, rani wielu naraz, przebija zbroje', cost:[120,100,170], dmg:[34,58,95], rate:[2.2,2.0,1.7], range:[105,115,125], splash:[40,46,54]},
  smo: {name:'Kocioł smoły', desc:'Spowalnia i parzy wszystkich w pobliżu', cost:[90,80,130], dmg:[6,10,16], rate:[.9,.85,.8], range:[68,76,84], slow:[.32,.42,.52]},
  rus: {name:'Rusznica wałowa', desc:'Daleki strzał w najsilniejszego; kula przebija zbroje i trafia wroga za nim', cost:[110,100,160], dmg:[65,110,175], rate:[1.9,1.75,1.55], range:[150,165,180]},
};
const TKEYS = ['mus','arm','smo','rus'];
// wygląd wież: szerokość w grze i wysokość stanowiska (ułamek od góry obrazka)
const TW = {mus:[42,44,46], arm:[42,44,47], smo:[40,42,44], rus:[31,32,33]};
const TOPF = {mus:[.25,.25,.33], arm:[.2,.2,.21], smo:[.62,.62,.62], rus:[.15,.15,.16]};
const ET = {
  pie: {name:'Piechota', hp:45, spd:34, gold:6, lives:1, armor:0, r:9, img:'e_pie', h:30},
  raj: {name:'Rajtar', hp:34, spd:66, gold:7, lives:1, armor:0, r:11, img:'e_raj', h:34},
  pan: {name:'Pancerny', hp:140, spd:24, gold:12, lives:2, armor:.5, r:10, img:'e_pan', h:40},
  gen: {name:'Generał Müller', hp:2600, spd:14, gold:150, lives:10, armor:.3, r:18, img:'e_gen', h:56},
};
const WAVES = [
  [['pie',8,1.1,0]],
  [['pie',12,.85,0]],
  [['pie',6,1,0],['raj',6,.8,3]],
  [['pie',10,.8,0],['pan',4,2,4]],
  [['raj',14,.5,0],['pie',8,.8,2]],
  [['pan',8,1.4,0],['pie',12,.7,1]],
  [['raj',12,.55,0],['pan',6,1.5,2],['pie',14,.6,4]],
  [['pan',10,1.1,0],['raj',16,.45,3]],
  [['pie',20,.45,0],['pan',12,1,2],['raj',14,.5,6]],
  [['pie',10,.7,0],['raj',8,.6,3],['pan',6,1.2,5],['gen',1,1,9],['pie',10,.8,14]],
];
const HPK = +(Q.get('hps') || 0.6), CM = +(Q.get('cm') || 1.8), BOSSK = +(Q.get('bk') || 2.2);
const HP_SCALE = w => (1 + HPK*(w-1)) * (w >= 7 ? 1 + (w-6)*.08 : 1);

// ====== TEKSTY ======
const L = {
  def: ['Bić Szweda!','Za Króla i Ojczyznę!','Jasna Góra nie padnie!','Bić Szweda!','Za Króla i Ojczyznę!','Jasna Góra nie padnie!','Ognia!','Trzymać szyk!'],
  defT: {mus:['Celuj… pal!','Ognia!'], arm:['Kula w drogę!','Ładuj armatę!'], smo:['Gorąca smoła!','Polewaj!'], rus:['Mam go na muszce!','Prosto w pancerz!']},
  swe: ['För Kungen!','Framåt!','För Kungen!','Framåt!','Anfall!'],
  hurt: ['Hjälp!','Aj, aj!'],
  flee: ['Reträtt!','Uciekać!'],
  cry: ['Aj!','Au!','Ach!','Uff!'],
  wave: ['Bracia, do murów!','Trzymajcie się!','Jazda szwedzka!','Pancerni idą!','Rajtarzy pędzą!','Nie lękajcie się!','Boże, dodaj sił!','Wytrwajcie, bracia!','Już blisko zwycięstwa!','Ostatni szturm! Za Jasną Górę!'],
  boss: {spawn:'Poddajcie się, mnisi!', half:'Naprzód, psubraty!', low:'Do diaska!', die:'Odwrót! Odwrót!'},
  gate: ['Brama trzeszczy!','Trzymać bramę!'],
};
const pick = a => a[Math.floor(Math.random()*a.length)];

// ====== ZAPIS ======
let save = {bestStars:0, bestWave:0, wins:0, games:0, music:true, sfx:true, speed:1};
try {
  const old = JSON.parse(localStorage.getItem(OLD_KEY) || 'null');
  if (old) { save.bestStars = old.bestStars|0; save.bestWave = old.bestWave|0; save.wins = old.wins|0; if (old.mute) save.sfx = false; }
  Object.assign(save, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'));
} catch(e) {}
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch(e) {} }

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
const GAP = {shot:.07, hit:.05, coin:.06, boom:.09, tar:.2, life:.15, rus:.08, cry:.3, pop:.15};
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
  }
}

// ====== MUZYKA (proceduralna, WebAudio) ======
// Własna kompozycja: łagodny "polonez" w d-moll, lutnia/klawesyn syntezowane na żywo.
const NOTE = {C:0,'C#':1,D:2,Eb:3,E:4,F:5,'F#':6,G:7,Ab:8,A:9,Bb:10,B:11};
const midi = s => { const m = /^([A-G](?:#|b)?)(\d)$/.exec(s); return 12*(+m[2]+1) + NOTE[m[1]]; };
const MEL = [ // [nuta, szesnastki] – 12 szesnastek na takt (3/4)
  'D5 2 C5 1 Bb4 1 A4 2 F4 2 A4 2 D5 2','Bb4 4 G4 2 Bb4 2 D5 4','C5 2 E5 1 D5 1 C5 2 Bb4 2 A4 2 G4 2','A4 6 F4 2 A4 2 C5 2',
  'D5 2 F5 1 E5 1 D5 2 C5 2 Bb4 2 D5 2','Bb4 2 A4 2 G4 4 Bb4 4','A4 2 C#5 1 D5 1 E5 2 C#5 2 A4 4','E5 6 D5 2 C#5 4',
  'D5 2 C5 1 Bb4 1 A4 2 F4 2 A4 2 D5 2','Bb4 2 D5 2 G5 4 F5 2 E5 2','E5 2 G5 1 F5 1 E5 2 D5 2 C5 4','A4 2 C5 2 F5 6 E5 2',
  'D5 4 Bb4 2 D5 2 F5 4','E5 2 D5 2 Bb4 2 G4 2 Bb4 4','A4 2 C#5 2 E5 2 G5 2 E5 2 C#5 2','D5 8 R 4',
  'C5 4 A4 2 C5 2 F5 4','E5 2 D5 2 C5 4 G4 4','F5 2 E5 1 D5 1 C5 2 D5 2 A4 4','C#5 4 E5 4 A4 4',
  'D5 2 C5 2 Bb4 2 D5 2 F5 4','C5 2 A4 2 F4 4 A4 4','Bb4 2 A4 1 G4 1 Bb4 2 D5 2 G5 4','E5 6 C#5 2 A4 4',
  'D5 2 F5 2 A5 4 F5 4','E5 2 G5 2 E5 2 C5 2 G4 4','F5 2 D5 2 Bb4 4 D5 4','C#5 2 E5 2 A5 4 G5 4',
  'G5 2 F5 2 E5 2 D5 2 Bb4 4','A4 2 D5 2 F5 4 A4 4','A4 2 C#5 2 E5 4 C#5 4','D5 12',
];
const CH = { Dm:['D','F','A'], Gm:['G','Bb','D'], C:['C','E','G'], F:['F','A','C'], Bb:['Bb','D','F'], A:['A','C#','E'] };
const PROG = 'Dm Gm C F Bb Gm A A Dm Gm C F Bb Gm A Dm F C Dm A Bb F Gm A Dm C Bb A Gm Dm A Dm'.split(' ');
const SONG = (() => {
  const ev = [];
  MEL.forEach((bar, bi) => {
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
  return {by, len: MEL.length*12};
})();
const MU = {timer:null, pos:0, t:0, on:false};
const SIX = 60/88/4;
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
    const evs = SONG.by[MU.pos];
    if (evs) for (const e of evs) pluck(e.m, MU.t + (e.k === 'mel' ? Math.random()*.012 : 0), e.d*SIX, e.v, e.k);
    MU.pos = (MU.pos + 1) % SONG.len; MU.t += SIX;
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

// ====== STAN GRY ======
let S;
function newGame() {
  S = {gold:START_GOLD, lives:START_LIVES, wave:0, time:0, queue:[], enemies:[], towers:[], proj:[], parts:[], floats:[],
       hussars:[], corpses:[], bubbles:[], decals:[], countdown:null, cdArmed:false, paid:true, charge:0, husLeft:HUS_MAX,
       over:false, result:null, shake:0, fortFlash:0, selected:null, banner:null, running:false, paused:false,
       speed:save.speed || 1, kills:0, bossStep:0, tracers:[], nextChat:6, lastCry:-9, lastGate:-99, lastFlee:-9};
  closeMenu();
}
const rnd = (a,b) => a + Math.random()*(b-a);

// ---- dymki z napisami ----
// kind: 'pl' (obrońcy), 'sw' (Szwedzi), 'boss', 'hus', 'fort'
function say(text, kind, o, dy, prio) {
  if (!S) return false;
  const live = S.bubbles.filter(b => b.life > 0);
  if (!prio && (live.length >= 2 || S.time < (S.quietUntil||0))) return false;
  if (live.length >= 4) live[0].life = Math.min(live[0].life, .15);
  // ten sam obiekt nie mówi dwa razy naraz
  for (const b of live) if (b.o === o) b.life = Math.min(b.life, .1);
  const life = 1.6 + text.length*.035;
  S.bubbles.push({text, kind, o, dy, x: o.x, y: o.y, life, max: life, w: 0});
  if (!prio) S.quietUntil = S.time + 2.2;
  sfx('pop');
  return true;
}
const FORT_SPOT = {x: 180, y: 446};
function towerHead(t) { return t.gy - 14; }

function startWave(early) {
  if (S.wave >= WAVES.length || S.over) return;
  if (early && S.countdown !== null) {
    const bonus = Math.ceil(S.countdown)*2;
    if (bonus > 0) { S.gold += bonus; floatT(180, 470, '+'+bonus+' zł za odwagę!', '#ffe14d', 14); sfx('coin'); }
  }
  S.wave++; S.countdown = null; S.cdArmed = true; S.paid = false;
  const w = S.wave;
  for (const [type, n0, iv0, delay] of WAVES[w-1]) { const n = type==='gen' ? n0 : Math.round(n0*CM), iv = iv0/CM; for (let i = 0; i < n; i++) S.queue.push({t: S.time + delay + i*iv, type, w}); }
  S.queue.sort((a,b) => a.t - b.t);
  if (w === WAVES.length) banner('Fala '+w+' – OSTATNIA!', 'Nadciąga generał Müller!');
  else banner('Fala '+w, w===1 ? 'Szwedzi nadciągają!' : WAVES[w-1].map(g=>ET[g[0]].name).filter((v,i,a)=>a.indexOf(v)===i).join(' · '));
  say(L.wave[w-1], 'fort', FORT_SPOT, 0, true);
  S.waveShout = true; S.nextChat = Math.max(S.nextChat, 4);
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

function spawn(type, w) {
  const T = ET[type], hp = Math.round(T.hp * (type==='gen' ? BOSSK : HP_SCALE(w)));
  const e = {type, hp, max:hp, d:-OFF-20, lane:type==='gen'?0:rnd(-7,7), x:0, y:0, face:1, slowT:0, slowA:0, flash:0, seed:Math.random()*10, dead:false, said:0};
  const p = posAt(e.d); e.x = p.x; e.y = p.y;
  S.enemies.push(e);
  if (type === 'gen') { S.shake = 12; sfx('boss'); banner('GENERAŁ MÜLLER!', 'Zatrzymaj go przed bramą!', 2.5); e.sayAt = 1.5; }
  else if (S.waveShout) { S.waveShout = false; e.sayAt = 1.2; }
}

function damage(e, amt, src) {
  if (e.dead) return;
  if (src === 'mus' || src === 'smo') amt *= (1 - ET[e.type].armor);
  amt = Math.max(1, Math.round(amt));
  e.hp -= amt; e.flash = .12;
  if (src !== 'smo' || amt >= 10) floatT(e.x + rnd(-5,5), e.y - ET[e.type].h + 4, String(amt), src==='hus' ? '#ffdd55' : src==='rus' ? '#ffb46b' : '#fff', src==='arm'||src==='hus'||src==='rus' ? 13 : 10, .55);
  if (e.hp <= 0) {
    e.dead = true; S.kills++;
    const g = ET[e.type].gold; S.gold += g;
    floatT(e.x, e.y - 22, '+'+g, '#ffe14d', 14, 1);
    burst(e.x, e.y - 6, '#ffd84a', 6, 70, 2.5, .5);
    sfx('coin');
    addCorpse(e, src);
    if (e.type === 'gen') { S.shake = 16; for (let i=0;i<4;i++) burst(e.x+rnd(-15,15), e.y+rnd(-15,15), ['#ff8a00','#ffd84a','#ff3b3b','#fff'][i], 20, 160, 5, .9); smoke(e.x, e.y, 14, 14); sfx('boom'); banner('Generał pokonany!', 'Szwedzi w odwrocie!', 2); }
  } else {
    sfx('hit');
    if (e.type === 'gen') {
      if (!e.sHalf && e.hp < e.max*.5) { e.sHalf = true; say(L.boss.half, 'boss', e, ET.gen.h + 6, true); }
      else if (!e.sLow && e.hp < e.max*.2) { e.sLow = true; say(L.boss.low, 'boss', e, ET.gen.h + 6, true); }
    } else if (S.time - S.lastCry > .9 && Math.random() < .18) {
      S.lastCry = S.time; floatT(e.x + rnd(-8,8), e.y - ET[e.type].h - 2, pick(L.cry), '#bfe0ff', 11, .7); sfx('cry');
    }
  }
}
function addCorpse(e, src) {
  if (S.corpses.length > 28) S.corpses.shift();
  const flee = e.type !== 'gen' && src !== 'arm' && Math.random() < .35;
  const c = {type: e.type, x: e.x, y: e.y, face: e.face, t: 0, mode: flee ? 'flee' : 'fall', dur: flee ? 1.1 : 1.2, dir: Math.random() < .5 ? 1 : -1, seed: e.seed};
  if (flee) {
    c.face = -e.face; c.vx = -e.face * 55 * (e.type === 'raj' ? 1.6 : 1); c.vy = rnd(-20, 10);
    if (S.time - S.lastFlee > 6 && Math.random() < .5) { S.lastFlee = S.time; say(pick(L.flee), 'sw', c, ET[e.type].h + 4, false); }
  }
  if (e.type === 'gen') say(L.boss.die, 'boss', c, ET.gen.h, true);
  S.corpses.push(c);
}

// ====== WIEŻE ======
function towerGeom(t) {
  const w = TW[t.type][t.lvl], img = IMG['t_'+t.type+t.lvl], h = img && img.width ? w*img.height/img.width : w*1.2;
  t.w = w; t.h = h; t.by = t.y + 13; t.gy = t.by - h*(1 - TOPF[t.type][t.lvl]);
}
function build(i, type) {
  if (S.over || S.towers.some(t => t.spot === i)) return false;
  const c = TT[type].cost[0]; if (S.gold < c) return false;
  S.gold -= c;
  const [x, y] = SPOTS[i];
  const t = {spot:i, x, y, type, lvl:0, cd:.2, ang:-Math.PI/2, anim:0, spent:c, pop:1, seed:Math.random()*6};
  towerGeom(t); S.towers.push(t);
  burst(x, y, '#e8d5a8', 14, 90, 3, .5); smoke(x, y+6, 5, 7); sfx('build');
  return true;
}
function upgrade(t) {
  if (!t || t.lvl >= 2) return false;
  const c = TT[t.type].cost[t.lvl+1]; if (S.gold < c) return false;
  S.gold -= c; t.lvl++; t.spent += c; t.pop = 1; towerGeom(t);
  burst(t.x, t.y - 10, '#ffd84a', 18, 110, 3, .6); floatT(t.x, t.gy - 18, 'Poziom '+(t.lvl+1)+'!', '#7dff6a', 14); sfx('up');
  return true;
}
function sell(t) {
  const r = Math.floor(t.spent*.7); S.gold += r; S.towers.splice(S.towers.indexOf(t), 1);
  floatT(t.x, t.y-20, '+'+r, '#ffe14d', 14); smoke(t.x, t.y, 6); sfx('sell');
}
function towerStat(t, k) { return TT[t.type][k][t.lvl]; }

function husaria() {
  if (S.husLeft <= 0 || S.charge > 0 || S.over || !S.running || S.paused) return false;
  S.husLeft--; S.charge = S.husLeft > 0 ? HUS_CD : 0;
  const dmg = 90 + 25*S.wave;
  for (let i = 0; i < 6; i++) S.hussars.push({d: PLEN + i*26, hit: new Set(), dmg, lane: (i%2 ? 7 : -7), seed: i*1.3});
  banner('SZARŻA HUSARII!', S.husLeft ? `Zostało szarż: ${S.husLeft}/${HUS_MAX}` : 'To była ostatnia szarża!', 1.6); S.shake = 6; sfx('charge');
  // okrzyk Szwedów
  let front = null; for (const e of S.enemies) if (!e.dead && e.type !== 'gen' && e.d > 0 && (!front || e.d > front.d)) front = e;
  say('Jezus Maria, Husaria!', 'sw', front || FORT_SPOT, front ? ET[front.type].h + 4 : 0, true);
  S.husShout = 0.9;
  return true;
}

// ====== AKTUALIZACJA ======
function update(dt) {
  if (!S.running || S.over || S.paused) { updateFx(dt); return; }
  S.time += dt;
  if (S.charge > 0) S.charge = Math.max(0, S.charge - dt);
  while (S.queue.length && S.queue[0].t <= S.time) { const q = S.queue.shift(); spawn(q.type, q.w); }
  if (S.cdArmed && !S.queue.length) { S.cdArmed = false; if (S.wave < WAVES.length) S.countdown = CD_BETWEEN; }
  if (S.countdown !== null) { S.countdown -= dt; if (S.countdown <= 0) startWave(false); }

  // wrogowie
  for (const e of S.enemies) {
    if (e.dead) continue;
    const T = ET[e.type];
    if (e.slowT > 0) e.slowT -= dt;
    e.d += T.spd * (e.slowT > 0 ? 1 - e.slowA : 1) * dt;
    if (e.flash > 0) e.flash -= dt;
    const p = posAt(e.d), ln = e.lane * Math.min(1, (PLEN - e.d)/40); e.x = p.x - p.dy*ln; e.y = p.y + p.dx*ln; if (p.dx) e.face = p.dx < 0 ? -1 : 1;
    if (e.sayAt !== undefined && e.d > 5) { e.sayAt -= dt; if (e.sayAt <= 0) { e.sayAt = undefined; say(e.type === 'gen' ? L.boss.spawn : pick(L.swe), e.type === 'gen' ? 'boss' : 'sw', e, T.h + 4, true); } }
    if (e.d >= PLEN) {
      e.dead = true; S.lives = Math.max(0, S.lives - T.lives); S.fortFlash = .4; S.shake = Math.max(S.shake, e.type==='gen'?14:5);
      floatT(180, 470, '-'+T.lives+' ❤', '#ff4d4d', 16); sfx('life'); burst(180, 470, '#ff5a5a', 10, 90, 3, .5);
      if (S.time - S.lastGate > 12 && S.lives > 0) { S.lastGate = S.time; say(pick(L.gate), 'fort', FORT_SPOT, 0, true); }
      if (S.lives <= 0) { endGame(false); }
    }
    if (e.type === 'gen') { S.bossStep += dt; if (S.bossStep > .7) { S.bossStep = 0; S.shake = Math.max(S.shake, 2.5); } }
  }

  // wieże
  for (const t of S.towers) {
    t.cd -= dt; if (t.anim > 0) t.anim -= dt*4; if (t.pop > 0) t.pop = Math.max(0, t.pop - dt*2.5);
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
        }
      } else t.busy = S.enemies.some(e => !e.dead && Math.hypot(e.x-t.x, e.y-t.y) <= R);
      continue;
    }
    let best = null;
    if (t.type === 'rus') { // najsilniejszy wróg w zasięgu
      for (const e of S.enemies) if (!e.dead && Math.hypot(e.x-t.x, e.y-t.y) <= R && (!best || e.hp > best.hp || (e.hp === best.hp && e.d > best.d))) best = e;
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
          S.tracers.push({x1:mx, y1:my, x2:best.x, y2:best.y-10, life:.08, max:.08, w:2, col:'255,240,160'});
          damage(best, towerStat(t,'dmg'), 'mus'); burst(best.x, best.y-10, '#fff1a8', 3, 60, 2, .2); sfx('shot');
          smoke(mx, my, 1, 5);
        } else if (t.type === 'rus') {
          const rx = t.x + Math.cos(t.ang)*22, ry = t.gy + Math.sin(t.ang)*22;
          S.tracers.push({x1:rx, y1:ry, x2:best.x, y2:best.y-12, life:.16, max:.16, w:3, col:'255,200,120'});
          damage(best, towerStat(t,'dmg'), 'rus');
          // kula leci dalej i rani jednego wroga za celem (50%)
          { const dx = best.x - t.x, dy = best.y - t.gy, l = Math.hypot(dx, dy) || 1, ux = dx/l, uy = dy/l; let nx = null, nd = 1e9;
            for (const e of S.enemies) { if (e.dead || e === best) continue; const ex = e.x - best.x, ey = e.y - best.y, along = ex*ux + ey*uy, perp = Math.abs(ex*uy - ey*ux);
              if (along > 0 && along < 70 && perp < 14 && along < nd) { nd = along; nx = e; } }
            if (nx) { damage(nx, towerStat(t,'dmg')*.5, 'rus'); S.tracers.push({x1:best.x, y1:best.y-12, x2:nx.x, y2:nx.y-12, life:.12, max:.12, w:2, col:'255,200,120'}); } }
          burst(best.x, best.y-12, '#ffcf7a', 8, 110, 2.5, .3); burst(best.x, best.y-12, '#ffffff', 3, 50, 2, .2);
          smoke(rx, ry, 3, 7); sfx('rus'); S.shake = Math.max(S.shake, 1);
        } else {
          const dist = Math.hypot(best.x-t.x, best.y-t.y), dur = .35 + dist/450;
          const sp = ET[best.type].spd * (best.slowT > 0 ? 1-best.slowA : 1);
          const p = posAt(best.d + sp*dur);
          const bx = t.x + Math.cos(t.ang)*18, by = t.gy + Math.sin(t.ang)*18;
          S.proj.push({sx:bx, sy:by, tx:p.x, ty:p.y, t:0, dur, dmg:towerStat(t,'dmg'), splash:towerStat(t,'splash')});
          smoke(bx, by, 4, 8); sfx('boom'); S.shake = Math.max(S.shake, 1.5);
        }
      }
    }
  }
  // pociski armatnie
  for (const p of S.proj) {
    p.t += dt;
    if (Math.random() < .5 && S.parts.length < 330) { const k = p.t/p.dur, x = p.sx + (p.tx-p.sx)*k, y = p.sy + (p.ty-p.sy)*k - Math.sin(k*Math.PI)*(20+p.dur*30); S.parts.push({x, y, vx:0, vy:-6, life:.35, max:.35, color:'#cfcac2', size:3, grav:0, kind:'smoke'}); }
    if (p.t >= p.dur) {
      p.done = true;
      for (const e of S.enemies) if (!e.dead && Math.hypot(e.x-p.tx, e.y-p.ty) <= p.splash) damage(e, p.dmg, 'arm');
      burst(p.tx, p.ty, '#ff9a1a', 14, 120, 4, .45); burst(p.tx, p.ty, '#ffe14d', 8, 70, 3, .35); smoke(p.tx, p.ty, 6, 10, '#bdb6aa');
      burst(p.tx, p.ty, '#7a5a3a', 6, 90, 2.5, .5, 220);
      S.parts.push({x:p.tx, y:p.ty, vx:0, vy:0, life:.3, max:.3, color:'#fff2b0', size:p.splash, grav:0, kind:'ring'});
      if (S.decals.length > 14) S.decals.shift();
      S.decals.push({x:p.tx, y:p.ty, r:p.splash*.45, life:5, max:5});
      S.shake = Math.max(S.shake, 3);
    }
  }
  S.proj = S.proj.filter(p => !p.done);
  // husaria
  for (const h of S.hussars) {
    h.d -= 230 * dt;
    if (h.d > PLEN) continue;
    const p = posAt(h.d); h.x = p.x - p.dy*h.lane; h.y = p.y + p.dx*h.lane; h.face = p.dx ? (p.dx < 0 ? 1 : -1) : (h.face||1);
    for (const e of S.enemies) if (!e.dead && !h.hit.has(e) && Math.hypot(e.x-p.x, e.y-p.y) < 24) {
      h.hit.add(e); damage(e, e.type==='gen' ? h.dmg*1.5 : h.dmg, 'hus'); e.d = Math.max(-OFF, e.d - (e.type==='gen'?10:35));
      burst(e.x, e.y-8, '#ffffff', 6, 100, 3, .35);
    }
    if (Math.random() < .3) S.parts.push({x:p.x+rnd(-8,8), y:p.y+8, vx:rnd(-10,10), vy:rnd(-20,-5), life:.5, max:.5, color:'#d9c08a', size:6, grav:0, kind:'smoke'});
    if (Math.random() < .12) S.parts.push({x:h.x+rnd(-6,6), y:h.y-30, vx:rnd(-20,20), vy:rnd(-10,10), life:.9, max:.9, color:'#ffffff', size:2.4, grav:30, kind:'feather'});
  }
  if (S.husShout !== undefined) { S.husShout -= dt; if (S.husShout <= 0) { S.husShout = undefined; const lead = S.hussars.find(h => h.x !== undefined && h.d <= PLEN); if (lead) say(pick(['Szarża!','Za Ojczyznę!','Bij, zabij!']), 'hus', lead, 44, true); } }
  S.hussars = S.hussars.filter(h => h.d > -40);
  S.enemies = S.enemies.filter(e => !e.dead);

  // pogawędki (ograniczone, bez spamu)
  S.nextChat -= dt;
  if (S.nextChat <= 0) {
    S.nextChat = rnd(6, 10);
    const busy = S.towers.filter(t => t.busy), foes = S.enemies.filter(e => e.d > 10 && e.y > -10 && e.type !== 'gen');
    if (busy.length && (Math.random() < .55 || !foes.length)) {
      const t = pick(busy); say(Math.random() < .7 ? pick(L.def) : pick(L.defT[t.type]), 'pl', {x:t.x, y:towerHead(t)}, 0, false);
    } else if (foes.length) {
      const e = pick(foes); say(e.hp < e.max*.35 ? pick(L.hurt) : pick(L.swe), 'sw', e, ET[e.type].h + 4, false);
    }
  }

  // koniec fali
  if (!S.paid && !S.queue.length && !S.enemies.length && S.wave > 0 && !S.over) {
    S.paid = true;
    if (S.wave >= WAVES.length) endGame(true);
    else {
      const b = 15 + S.wave*3; S.gold += b; floatT(180, 250, 'Fala odparta! +'+b+' zł', '#7dff6a', 16, 1.6); sfx('coin');
      if (S.towers.length) { const t = pick(S.towers); say(pick(['Jasna Góra nie padnie!','Odparci!','Chwała Bogu!']), 'pl', {x:t.x, y:towerHead(t)}, 0, true); }
    }
  }
  updateFx(dt);
}
function updateFx(dt) {
  for (const p of S.parts) { p.life -= dt; p.x += p.vx*dt; p.y += p.vy*dt; p.vy += p.grav*dt; if (p.kind==='dot') { p.vx *= .97; p.vy *= p.grav ? 1 : .97; } else if (p.kind==='feather') { p.vx *= .96; } }
  S.parts = S.parts.filter(p => p.life > 0);
  for (const f of S.floats) { f.life -= dt; f.y -= 28*dt; }
  S.floats = S.floats.filter(f => f.life > 0);
  for (const t of S.tracers) t.life -= dt; S.tracers = S.tracers.filter(t => t.life > 0);
  for (const c of S.corpses) { c.t += dt; if (c.mode === 'flee') { c.x += c.vx*dt; c.y += c.vy*dt; } }
  S.corpses = S.corpses.filter(c => c.t < c.dur);
  for (const d of S.decals) d.life -= dt; S.decals = S.decals.filter(d => d.life > 0);
  for (const b of S.bubbles) { b.life -= dt; if (b.o) { b.x = b.o.x; b.y = b.o.y; } }
  S.bubbles = S.bubbles.filter(b => b.life > 0);
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt*25);
  if (S.fortFlash > 0) S.fortFlash -= dt;
  if (S.banner) { S.banner.t -= dt; if (S.banner.t <= 0) S.banner = null; }
}
function endGame(win) {
  if (S.over) return;
  S.over = true; S.result = win ? 'win' : 'lose';
  const stars = win ? (S.lives >= 17 ? 3 : S.lives >= 10 ? 2 : 1) : 0;
  S.stars = stars;
  save.bestStars = Math.max(save.bestStars, stars); save.bestWave = Math.max(save.bestWave, win ? WAVES.length : S.wave - 1);
  if (win) save.wins++;
  save.games = (save.games|0) + 1;
  persist();
  sfx(win ? 'win' : 'lose');
  if (win) for (let i = 0; i < 6; i++) burst(rnd(60,300), rnd(100,400), ['#ff3b3b','#fff','#ffd84a','#5fd35a'][i%4], 25, 150, 4, 1.2, 60);
  setTimeout(() => showEnd(win, stars), SIM ? 0 : 1100);
}

// ====== GRAFIKA: wczytywanie i skalowanie sprite'ów ======
const IMG = {};
const IMG_LIST = [].concat(
  ...TKEYS.map(k => [0,1,2].map(l => 't_'+k+l)),
  ['e_pie','e_raj','e_pan','e_gen','e_hus','fort','grass','dirt'],
  ['oak','pine','apple','birch','bush','rock','rocks','cart','tent','barrels','fence','hay'].map(n => 'd_'+n));
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
  if (IMG.grass.width) {
    const pat = g.createPattern(IMG.grass, 'repeat'); pat.setTransform(new DOMMatrix().scale(190/512));
    g.fillStyle = pat; g.fillRect(0, -OFF, W, VH);
  } else { g.fillStyle = '#6cbf4a'; g.fillRect(0, -OFF, W, VH); }
  // światło i cień – głębia
  let gr = g.createRadialGradient(W*.5, H*.45, 60, W*.5, H*.45, 420);
  gr.addColorStop(0, 'rgba(255,250,200,.10)'); gr.addColorStop(1, 'rgba(10,40,10,.38)');
  g.fillStyle = gr; g.fillRect(0, -OFF, W, VH);
  const R = srand(1655);
  for (let i = 0; i < 26; i++) { g.fillStyle = R() < .5 ? 'rgba(255,255,200,.05)' : 'rgba(0,50,0,.07)'; g.beginPath(); g.ellipse(R()*W, R()*VH-OFF, 25+R()*45, 12+R()*22, 0, 0, 7); g.fill(); }
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
  const okDeco = (x, y, r) => distToPath(x, y) > 24 + r && SPOTS.every(s => Math.hypot(s[0]-x, s[1]-(y-4)) > 26 + r) && !inFort(x, y, r) && y > 14 - OFF && y < H - 4;
  // kępki i kwiaty
  for (let i = 0; i < 170; i++) { const x = R()*W, y = R()*VH - OFF; if (!okDeco(x, y, -10)) continue;
    if (R() < .72) { g.strokeStyle = 'rgba(30,90,25,.65)'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(x-3, y); g.lineTo(x-4, y-5); g.moveTo(x, y); g.lineTo(x, y-7); g.moveTo(x+3, y); g.lineTo(x+4, y-5); g.stroke(); }
    else { g.fillStyle = ['#fff','#ffe14d','#ff9ac0','#b7dcff'][Math.floor(R()*4)]; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(x + Math.cos(k*1.256)*1.9, y + Math.sin(k*1.256)*1.9, 1.3, 0, 7); g.fill(); } g.fillStyle = '#ffb000'; g.beginPath(); g.arc(x, y, 1, 0, 7); g.fill(); }
  }
  const deco = [];
  const put = (key, x, y, w, force) => { const r = w*.38; if ((force || okDeco(x, y, r)) && deco.every(d => Math.hypot(d[1]-x, d[2]-y) > (d[3]+w)*.42)) { deco.push([key, x, y, w]); return true; } return false; };
  // obóz szwedzki na górze
  const campY = Math.min(30, -OFF + 34);
  [['d_tent',318,40,40],['d_tent',140,campY,36],['d_barrels',350,58,18],['d_cart',22,campY+20,34],['d_tent',236,campY-2,34],['d_hay',190,-OFF+70,24]].forEach(([k,x,y,w]) => put(k, x, y, w));
  // drzewa, krzaki, skały
  const kinds = [['d_oak',36],['d_pine',28],['d_apple',32],['d_birch',30],['d_bush',22],['d_rock',20],['d_rocks',18],['d_bush',18],['d_hay',22],['d_fence',24],['d_barrels',16]];
  for (let i = 0; i < 600 && deco.length < 34; i++) {
    const x = R()*W, y = R()*VH - OFF, [k, w0] = kinds[Math.floor(R()*kinds.length)];
    put(k, x, y, w0*(.85 + R()*.3));
  }
  deco.sort((a, b) => a[2] - b[2]);
  for (const [k, x, y, w] of deco) {
    const img = IMG[k]; if (!img.width) continue;
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
  const pop = t.pop > 0 ? 1 + Math.sin(t.pop*Math.PI)*.12 : 1;
  c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(x + 2, by - 3, w*.5, w*.2, 0, 0, 7); c.fill();
  c.save(); c.translate(x, by); c.scale(2 - pop, pop); c.translate(-x, -by);
  // odrzut armaty/rusznicy – lekki przysiad
  const sq = (type === 'arm' || type === 'rus') ? anim*.03 : 0;
  if (sq) { c.translate(x, by); c.scale(1 + sq, 1 - sq); c.translate(-x, -by); }
  drawSpr(c, 't_'+type+lvl, x, by, w);
  const gy = t.gy;
  if (type === 'mus') {
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
  // proporczyk na wieży
  if (type !== 'smo') {
    const fx = x - w*.42, fy = by - t.h*(type === 'rus' ? .97 : type === 'arm' ? .62 : .9);
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
  const ph = t*(e.type === 'raj' ? 16 : 11) + e.seed, bob = -Math.abs(Math.sin(ph))*(e.type === 'gen' ? 1.2 : 1.8);
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
  if (e.hp < e.max) hpBar(c, e.x, fy - T.h - 5, e.type === 'gen' ? 44 : 20, Math.max(0, e.hp/e.max));
}
function drawCorpse(c, o) {
  const T = ET[o.type], img = IMG[T.img], w = T.h * img.width / img.height;
  const k = o.t / o.dur, a = o.mode === 'flee' ? Math.min(1, (1 - k)*2.2) : Math.min(1, (1 - k)*3);
  if (a <= 0) return;
  c.save(); c.globalAlpha = a;
  c.translate(o.x, o.y + 9);
  if (o.mode === 'fall') {
    const r = Math.min(1, o.t/.35); c.rotate(o.dir * r * 1.45 * (o.type === 'raj' ? .5 : 1)); c.translate(0, r*2);
  } else c.translate(0, -Math.abs(Math.sin(o.t*18))*2);
  if (o.face < 0) c.scale(-1, 1);
  const s = spr(T.img, w); if (s) c.drawImage(s, -s.lw/2, -s.lh, s.lw, s.lh);
  if (o.mode === 'fall' && o.t < .15) { const f = spr(T.img, w, '#ffffff'); c.globalAlpha = a*.7; if (f) c.drawImage(f, -f.lw/2, -f.lh, f.lw, f.lh); }
  c.restore();
}
function drawHussar(c, h, t) {
  if (h.d > PLEN || h.x === undefined) return;
  const img = IMG.e_hus, hh = 40, w = hh*img.width/img.height;
  const ph = t*22 + h.seed, bob = -Math.abs(Math.sin(ph))*2.4;
  c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(h.x, h.y + 8, 14, 4.5, 0, 0, 7); c.fill();
  c.save(); c.translate(h.x, h.y + 9 + bob); c.rotate(Math.sin(ph)*.06 * h.face);
  if (h.face < 0) c.scale(-1, 1);
  const s = spr('e_hus', w); if (s) c.drawImage(s, -s.lw/2, -s.lh, s.lw, s.lh);
  c.restore();
}
function drawFortress(c, t) {
  const {x, y, w, h} = FORT;
  drawSpr(c, 'fort', x + w/2, y + h, w);
  if (S.fortFlash > 0) { c.globalAlpha = Math.min(1, S.fortFlash/.4)*.45; drawSpr(c, 'fort', x + w/2, y + h, w, false, '#ff3030'); c.globalAlpha = 1; }
  // powiewające flagi na basztach
  flag(c, x + w*.07, y + h*.2, 13, 8, t, ['#ffffff', '#e02b2b']);
  flag(c, x + w*.925, y + h*.2, 13, 8, t + 1.3, ['#ffffff', '#e02b2b']);
  flag(c, x + w*.717, y - 3, 11, 7, t + 2.1, ['#ffcc33', '#2a62c9']); // chorągiew maryjna na wieży
}
function drawBubble(c, b) {
  const kindC = {pl:['#fffaf0','#3a2a14'], fort:['#fff3c4','#5a3a10'], sw:['#dcecff','#16335e'], boss:['#ffe066','#5a1010'], hus:['#ffffff','#8a1020']}[b.kind];
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
    if (S.selected && S.selected.spot === i && !S.selected.tower) { c.strokeStyle = '#fff3c4'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(x, y, 19, 9.5, 0, 0, 7); c.stroke(); }
    if (hint) { const k = (at*1.2) % 1; c.strokeStyle = 'rgba(255,240,120,' + (1-k) + ')'; c.lineWidth = 3; c.beginPath(); c.ellipse(x, y, 18 + k*10, 9 + k*5, 0, 0, 7); c.stroke(); }
    c.fillStyle = 'rgba(90,75,50,.75)'; c.font = '900 12px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('+', x, y + .5);
  });
  // zasięg zaznaczonej wieży
  const selT = S.selected && S.selected.tower;
  if (selT) { const R = towerStat(selT, 'range'); c.fillStyle = 'rgba(255,255,255,.14)'; c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2; c.setLineDash([6, 4]); c.beginPath(); c.arc(selT.x, selT.y, R, 0, 7); c.fill(); c.stroke(); c.setLineDash([]); }
  // flaga szwedzka w obozie
  flag(c, 330, Math.min(10, -OFF + 16), 16, 10, at, ['#2a5bc9'], true, '#ffd23a');
  // obiekty posortowane po y
  const objs = [];
  for (const tw of S.towers) objs.push([tw.by - 4, 0, tw]);
  for (const e of S.enemies) objs.push([e.y + 9, 1, e]);
  for (const h of S.hussars) if (h.x !== undefined && h.d <= PLEN) objs.push([h.y + 9, 2, h]);
  for (const o of S.corpses) objs.push([o.y + 9, 3, o]);
  objs.sort((a, b) => a[0] - b[0]);
  for (const [, k, o] of objs) {
    if (k === 0) drawTower(c, o, at);
    else if (k === 1) drawEnemy(c, o, at);
    else if (k === 2) drawHussar(c, o, at);
    else drawCorpse(c, o);
  }
  drawFortress(c, at);
  // smugi strzałów
  for (const tr of S.tracers) { c.strokeStyle = 'rgba(' + tr.col + ',' + (tr.life/tr.max) + ')'; c.lineWidth = tr.w; c.beginPath(); c.moveTo(tr.x1, tr.y1); c.lineTo(tr.x2, tr.y2); c.stroke(); }
  // kule armatnie (łuk)
  for (const p of S.proj) {
    const k = p.t / p.dur, x = p.sx + (p.tx - p.sx)*k, y = p.sy + (p.ty - p.sy)*k, hgt = Math.sin(k*Math.PI) * (20 + p.dur*30);
    const gy2 = p.sy + (p.ty - p.sy)*k + (p.ty - p.sy > 0 ? 0 : 0) + 12*(1-k);
    c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(x, gy2 + 3, 4, 2, 0, 0, 7); c.fill();
    circ(c, x, y - hgt, 4.5, '#1e1e1e', '#000', 1); circ(c, x-1.5, y - hgt - 1.5, 1.4, 'rgba(255,255,255,.6)', null);
  }
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
    const gr = c.createLinearGradient(0, -30, 0, 32); gr.addColorStop(0, 'rgba(70,35,15,.82)'); gr.addColorStop(1, 'rgba(35,18,8,.82)');
    c.fillStyle = gr; rr(c, -150, -30, 300, b.sub ? 62 : 46, 14); c.fill();
    c.strokeStyle = 'rgba(255,210,100,.8)'; c.lineWidth = 2; c.stroke();
    c.font = '800 26px ' + FONT; c.strokeStyle = INK; c.lineWidth = 5; c.strokeText(b.text, 0, -7); c.fillStyle = '#ffe14d'; c.fillText(b.text, 0, -7);
    if (b.sub) { c.font = '700 13px ' + FONT; c.fillStyle = '#fff'; c.fillText(b.sub, 0, 18); }
    c.restore();
  }
}

// ====== UI ======
const $ = id => document.getElementById(id);
const menu = $('menu');
const timg = (k, l) => `img/t_${k}${l}.webp?v=${V}`;
function toCss(x, y) { return [cv.offsetLeft + x*SCALE, cv.offsetTop + (y+OFF)*SCALE]; }
function placeMenu(x, y, above) {
  const [cx, cy] = toCss(x, y), st = $('stage');
  menu.classList.remove('hidden');
  const mw = menu.offsetWidth, mh = menu.offsetHeight;
  const left = Math.max(4, Math.min(st.clientWidth - mw - 4, cx - mw/2));
  let top = cy - mh - (above||26)*SCALE; if (top < 4) top = cy + 24*SCALE;
  if (top + mh > st.clientHeight - 4) top = st.clientHeight - mh - 4;
  menu.style.left = left + 'px'; menu.style.top = top + 'px';
}
function closeMenu() { if (menu) menu.classList.add('hidden'); if (S) S.selected = null; }
function openBuild(i) {
  S.selected = {spot: i};
  menu.className = 'build';
  menu.innerHTML = '<div class="opts">' + TKEYS.map(k => `<button class="opt" data-k="${k}"><img src="${timg(k,0)}" alt=""><span class="n">${TT[k].name}</span><span class="c">${TT[k].cost[0]} zł</span></button>`).join('') + '</div><div class="hint" id="optHint">Wybierz wieżę</div>';
  menu.querySelectorAll('.opt').forEach(b => {
    b.addEventListener('pointerenter', () => { $('optHint').textContent = TT[b.dataset.k].desc; });
    b.addEventListener('click', ev => { ev.stopPropagation(); audioInit();
      if (build(i, b.dataset.k)) closeMenu(); else { sfx('click'); bumpGold(); $('optHint').textContent = TT[b.dataset.k].desc; } });
  });
  refreshMenu(); placeMenu(SPOTS[i][0], SPOTS[i][1]);
}
function openTower(tw) {
  S.selected = {spot: tw.spot, tower: tw};
  const T = TT[tw.type], max = tw.lvl >= 2, uc = max ? 0 : T.cost[tw.lvl+1], ref = Math.floor(tw.spent*.7);
  const dmgTxt = tw.type === 'smo' ? `Spowolnienie ${Math.round(towerStat(tw,'slow')*100)}%` : `Obrażenia ${towerStat(tw,'dmg')}`;
  const nextTxt = max ? '' : (tw.type === 'smo' ? ` → ${Math.round(T.slow[tw.lvl+1]*100)}%` : ` → ${T.dmg[tw.lvl+1]}`);
  menu.className = 'tower';
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

cv.addEventListener('pointerdown', ev => {
  audioInit();
  if (!S.running || S.over || S.paused) return;
  const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * W, y = (ev.clientY - r.top) / r.height * VH - OFF;
  // wieża: prostokąt obrazka albo blisko podstawy
  const tw = S.towers.slice().sort((a, b) => b.by - a.by).find(t => (Math.abs(x - t.x) < t.w*.5 && y < t.by && y > t.by - t.h) || Math.hypot(t.x - x, t.y - y) < 22);
  if (tw) { sfx('click'); openTower(tw); return; }
  const i = SPOTS.findIndex(s => Math.hypot(s[0] - x, s[1] - y) < 24);
  if (i >= 0) { sfx('click'); openBuild(i); return; }
  closeMenu();
});
$('stage').addEventListener('pointerdown', ev => { if (ev.target === $('stage')) closeMenu(); });
$('btnWave').addEventListener('click', () => { audioInit(); if (!S.running || S.over || S.paused) return; if (S.wave === 0 || S.countdown !== null) startWave(true); });
$('btnHus').addEventListener('click', () => { audioInit(); if (!S.paused) husaria(); });
$('btnSpeed').addEventListener('click', () => { audioInit(); sfx('click'); S.speed = S.speed === 1 ? 2 : 1; save.speed = S.speed; persist(); syncSettings(); });
$('btnPause').addEventListener('click', () => { audioInit(); sfx('click'); setPause(true); });

// ---- ekrany ----
const SCREENS = ['title', 'pSettings', 'pRecords', 'pHow', 'pause', 'end'];
function show(id) { for (const s of SCREENS) $(s).classList.toggle('hidden', s !== id && !(id && id.startsWith('p') && id !== 'pause' && s === 'title')); }
let backTo = 'title';
function openPanel(id, from) { backTo = from || 'title'; audioInit(); sfx('click');
  if (id === 'pRecords') renderRecords();
  syncSettings();
  if (backTo === 'pause') { $('pause').classList.add('hidden'); $(id).classList.remove('hidden'); }
  else show(id);
}
function closePanel(id) { sfx('click'); $(id).classList.add('hidden'); if (backTo === 'pause') $('pause').classList.remove('hidden'); else show('title'); }
function setPause(p) {
  if (!S.running || S.over) return;
  S.paused = p; closeMenu();
  $('pause').classList.toggle('hidden', !p);
  if (!p) for (const id of ['pSettings', 'pHow']) $(id).classList.add('hidden');
}
function goTitle() {
  sfx('click'); newGame(); show('title'); document.body.classList.add('onTitle'); renderBestLine();
}
function play() {
  audioInit(); sfx('up'); newGame(); show(null); document.body.classList.remove('onTitle');
  S.running = true; banner('Postaw wieże!', 'Dotknij kamienne pole przy drodze', 2.6);
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
function renderRecords() {
  $('recStars').innerHTML = [0,1,2].map(i => `<span class="${i < save.bestStars ? 'on' : ''}">★</span>`).join('');
  $('recWave').textContent = (save.bestWave|0) + ' / ' + WAVES.length;
  $('recWins').textContent = save.wins|0;
  $('recGames').textContent = save.games|0;
}
function renderBestLine() {
  $('bestLine').innerHTML = save.games ? `Rekord: <span class="st">${'★'.repeat(save.bestStars)}${'☆'.repeat(3 - save.bestStars)}</span> · fala ${save.bestWave}/10` : 'Częstochowa · rok 1655';
}
document.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', ev => {
  ev.stopPropagation();
  const a = b.dataset.act;
  if (a === 'play') play();
  else if (a === 'settings') openPanel('pSettings', b.closest('#pause') ? 'pause' : 'title');
  else if (a === 'records') openPanel('pRecords');
  else if (a === 'how') openPanel('pHow', b.closest('#pause') ? 'pause' : 'title');
  else if (a === 'back') closePanel(b.closest('.panel').id);
  else if (a === 'resume') { audioInit(); sfx('click'); setPause(false); }
  else if (a === 'menu') goTitle();
  else if (a === 'again') play();
  else if (a === 'music' || a === 'sfx' || a === 'speed') toggle(a);
}));

function showEnd(win, stars) {
  $('endTitle').textContent = win ? 'ZWYCIĘSTWO!' : 'PORAŻKA';
  $('end').classList.toggle('lose', !win);
  $('stars').innerHTML = [0,1,2].map(i => `<span class="${i < stars ? 'on' : ''}" style="animation-delay:${.3 + i*.35}s">★</span>`).join('');
  $('endText').innerHTML = win
    ? `Jasna Góra obroniona! Zostało <b>${S.lives}</b> ❤ · pokonani wrogowie: <b>${S.kills}</b>.<br>${stars < 3 ? 'Strać mniej żyć, a zdobędziesz 3 gwiazdki!' : 'Perfekcyjna obrona – jesteś jak przeor Kordecki!'}`
    : `Szwedzi wdarli się za mury w fali <b>${S.wave}</b>.<br>Ulepszaj wieże i oszczędzaj husarię na trudne chwile!`;
  closeMenu(); show('end');
}

const last = {};
function setTxt(id, v) { if (last[id] !== v) { last[id] = v; $(id).textContent = v; } }
function ui() {
  setTxt('gold', String(S.gold)); setTxt('lives', String(S.lives)); setTxt('wave', `${S.wave}/${WAVES.length}`);
  const bw = $('btnWave');
  let lbl, sub, en;
  if (S.wave === 0) { lbl = '▶ Fala 1'; sub = 'zaczynamy?'; en = S.running; }
  else if (S.countdown !== null) { const b = Math.ceil(S.countdown)*2; lbl = `▶ Fala ${S.wave+1}`; sub = `+${b} zł · za ${Math.ceil(S.countdown)} s`; en = true; }
  else if (S.wave >= WAVES.length) { lbl = 'Ostatnia fala!'; sub = `wrogów: ${S.enemies.length + S.queue.length}`; en = false; }
  else { lbl = 'Fala trwa…'; sub = `wrogów: ${S.enemies.length + S.queue.length}`; en = false; }
  setTxt('waveLbl', lbl); setTxt('waveSub', sub);
  en = en && !S.over && !S.paused;
  if (bw.disabled === en) bw.disabled = !en;
  bw.classList.toggle('pulse', en && (S.wave === 0 ? S.towers.length > 0 : true));
  const hb = $('btnHus'), left = S.husLeft, ready = left > 0 && S.charge <= 0 && S.running && !S.over && !S.paused;
  if (hb.disabled === ready) hb.disabled = !ready;
  hb.classList.toggle('spent', left <= 0);
  $('husFill').style.height = (left > 0 ? S.charge / HUS_CD * 100 : 0) + '%';
  setTxt('husCnt', left + '/' + HUS_MAX);
  setTxt('husSub', left <= 0 ? 'wykorzystana' : S.charge > 0 ? `za ${Math.ceil(S.charge)} s` : 'gotowa!');
  hb.classList.toggle('pulse', ready && S.enemies.length > 8);
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
window.addEventListener('resize', () => { if (started) { fit(); closeMenu(); } });

function boot() {
  newGame(); fit(); started = true; syncSettings(); renderBestLine();
  document.body.classList.remove('loading');
  if (Q.has('autostart')) { show(null); document.body.classList.remove('onTitle'); S.running = true; }
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
  get S() { return S; }, SPOTS, WAVES, get save() { return save; },
  build: (i, k) => build(i, k), upgrade: i => upgrade(S.towers.find(t => t.spot === i)), next: () => startWave(true), husaria: () => husaria(),
  start: () => { if (!S.running) play(); },
  sim(sec, cb) { SIM = true; const n = Math.round(sec*60); for (let i = 0; i < n && !S.over; i++) { update(1/60); if (cb) cb(S); } SIM = false; return {wave:S.wave, lives:S.lives, gold:S.gold, over:S.over, result:S.result, husLeft:S.husLeft}; },
  setSpeed: n => { S.speed = n; }, openTower: i => openTower(S.towers.find(t => t.spot === i)), openBuild, pause: setPause, goTitle,
  say: (txt, kind) => say(txt, kind || 'pl', FORT_SPOT, 0, true),
};
})();
