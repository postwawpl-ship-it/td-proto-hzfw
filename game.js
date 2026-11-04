'use strict';
(() => {
// ====== KONFIGURACJA ======
const W = 360, H = 560;
const Q = new URLSearchParams(location.search);
const DEBUG = Q.has('debug');
const SAVE_KEY = 'twierdza-jg-v1';
const START_GOLD = DEBUG ? 5000 : 230, START_LIVES = 20;
const HUS_CD = 40, CD_BETWEEN = 20;

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

const TT = {
  mus: {name:'Muszkieterzy', desc:'Szybki ogień w jeden cel', cost:[70,60,110], dmg:[14,22,34], rate:[.65,.52,.4], range:[92,100,110]},
  arm: {name:'Armata', desc:'Wolna, rani wielu naraz, przebija zbroje', cost:[120,100,170], dmg:[34,58,95], rate:[2.2,2.0,1.7], range:[105,115,125], splash:[40,46,54]},
  smo: {name:'Kocioł smoły', desc:'Spowalnia i parzy wszystkich w pobliżu', cost:[90,80,130], dmg:[6,10,16], rate:[.9,.85,.8], range:[68,76,84], slow:[.32,.42,.52]},
};
const ET = {
  pie: {name:'Piechota', hp:45, spd:34, gold:6, lives:1, armor:0, r:9},
  raj: {name:'Rajtar', hp:34, spd:66, gold:7, lives:1, armor:0, r:11},
  pan: {name:'Pancerny', hp:140, spd:24, gold:12, lives:2, armor:.5, r:10},
  gen: {name:'Generał Müller', hp:2600, spd:14, gold:150, lives:10, armor:.3, r:18},
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

// ====== ZAPIS ======
let save = {bestStars:0, bestWave:0, wins:0, mute:false};
try { Object.assign(save, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch(e) {}
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch(e) {} }

// ====== DŹWIĘK (WebAudio) ======
const AU = {ctx:null, master:null, noise:null, last:{}};
let SIM = false;
function audioInit() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  AU.ctx = new AC(); AU.master = AU.ctx.createGain(); AU.master.gain.value = 0.45; AU.master.connect(AU.ctx.destination);
  const len = AU.ctx.sampleRate, b = AU.ctx.createBuffer(1, len, AU.ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random()*2-1;
  AU.noise = b;
}
function tone(type, f1, f2, dur, vol, delay=0) {
  const c = AU.ctx, t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f1, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t+dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t+dur);
  o.connect(g); g.connect(AU.master); o.start(t); o.stop(t+dur+.03);
}
function noise(dur, vol, ftype, freq, delay=0) {
  const c = AU.ctx, t = c.currentTime + delay, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = AU.noise; f.type = ftype; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t+dur);
  s.connect(f); f.connect(g); g.connect(AU.master); s.start(t, Math.random()*.5); s.stop(t+dur+.03);
}
const GAP = {shot:.07, hit:.05, coin:.06, boom:.09, tar:.2, life:.15};
function sfx(n) {
  if (!AU.ctx || save.mute || SIM) return;
  const now = AU.ctx.currentTime;
  if (AU.last[n] && now - AU.last[n] < (GAP[n]||0)) return;
  AU.last[n] = now;
  switch (n) {
    case 'shot': noise(.09,.22,'highpass',1200); tone('square',220,90,.05,.05); break;
    case 'boom': noise(.45,.5,'lowpass',380); tone('sine',140,38,.35,.45); break;
    case 'tar': noise(.25,.12,'bandpass',500); tone('sine',90,60,.2,.08); break;
    case 'hit': tone('square',320,160,.05,.04); break;
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

// ====== STAN GRY ======
let S;
function newGame() {
  S = {gold:START_GOLD, lives:START_LIVES, wave:0, time:0, queue:[], enemies:[], towers:[], proj:[], parts:[], floats:[],
       hussars:[], countdown:null, cdArmed:false, paid:true, charge:0, over:false, result:null, shake:0, fortFlash:0,
       selected:null, banner:null, running:false, speed:1, kills:0, bossStep:0, tracers:[]};
  closeMenu();
}
const rnd = (a,b) => a + Math.random()*(b-a);

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
  sfx('horn');
}
function banner(text, sub, t=2.2) { S.banner = {text, sub, t, max:t}; }
function floatT(x, y, text, color, size=12, life=.9) { if (S.floats.length < 70) S.floats.push({x, y, text, color, size, life, max:life}); }
function burst(x, y, color, n, spd=80, size=3, life=.5, grav=0) {
  for (let i = 0; i < n && S.parts.length < 350; i++) { const a = Math.random()*6.283, v = rnd(.3,1)*spd;
    S.parts.push({x, y, vx:Math.cos(a)*v, vy:Math.sin(a)*v, life:rnd(.5,1)*life, max:life, color, size:rnd(.6,1.2)*size, grav, kind:'dot'}); }
}
function smoke(x, y, n, size=8) {
  for (let i = 0; i < n && S.parts.length < 350; i++) S.parts.push({x:x+rnd(-6,6), y:y+rnd(-6,6), vx:rnd(-15,15), vy:rnd(-30,-5), life:rnd(.5,.9), max:.9, color:'#ddd', size:rnd(.6,1.2)*size, grav:0, kind:'smoke'});
}

function spawn(type, w) {
  const T = ET[type], hp = Math.round(T.hp * (type==='gen' ? BOSSK : HP_SCALE(w)));
  const e = {type, hp, max:hp, d:-OFF-20, lane:type==='gen'?0:rnd(-7,7), x:0, y:0, face:1, slowT:0, slowA:0, flash:0, seed:Math.random()*10, dead:false};
  const p = posAt(e.d); e.x = p.x; e.y = p.y;
  S.enemies.push(e);
  if (type === 'gen') { S.shake = 12; sfx('boss'); banner('GENERAŁ MÜLLER!', 'Zatrzymaj go przed bramą!', 2.5); }
}

function damage(e, amt, src) {
  if (e.dead) return;
  if (src === 'mus' || src === 'smo') amt *= (1 - ET[e.type].armor);
  amt = Math.max(1, Math.round(amt));
  e.hp -= amt; e.flash = .09;
  if (src !== 'smo' || amt >= 10) floatT(e.x + rnd(-5,5), e.y - 14, String(amt), src==='hus' ? '#ffdd55' : '#fff', src==='arm'||src==='hus' ? 13 : 10, .55);
  if (e.hp <= 0) {
    e.dead = true; S.kills++;
    const g = ET[e.type].gold; S.gold += g;
    floatT(e.x, e.y - 22, '+'+g, '#ffe14d', 14, 1);
    burst(e.x, e.y, '#ffd84a', 6, 70, 2.5, .5);
    burst(e.x, e.y, e.type==='pan' ? '#aab4c0' : '#3b78e0', 8, 90, 3, .6, 160);
    sfx('coin');
    if (e.type === 'gen') { S.shake = 16; for (let i=0;i<4;i++) burst(e.x+rnd(-15,15), e.y+rnd(-15,15), ['#ff8a00','#ffd84a','#ff3b3b','#fff'][i], 20, 160, 5, .9); smoke(e.x, e.y, 14, 14); sfx('boom'); banner('Generał pokonany!', 'Szwedzi w odwrocie!', 2); }
  } else sfx('hit');
}

// ====== WIEŻE ======
function build(i, type) {
  if (S.over || S.towers.some(t => t.spot === i)) return false;
  const c = TT[type].cost[0]; if (S.gold < c) return false;
  S.gold -= c;
  const [x, y] = SPOTS[i];
  S.towers.push({spot:i, x, y, type, lvl:0, cd:.2, ang:-Math.PI/2, anim:0, spent:c});
  burst(x, y, '#e8d5a8', 14, 90, 3, .5); smoke(x, y+6, 5, 7); sfx('build');
  return true;
}
function upgrade(t) {
  if (!t || t.lvl >= 2) return false;
  const c = TT[t.type].cost[t.lvl+1]; if (S.gold < c) return false;
  S.gold -= c; t.lvl++; t.spent += c;
  burst(t.x, t.y, '#ffd84a', 18, 110, 3, .6); floatT(t.x, t.y-26, 'Poziom '+(t.lvl+1)+'!', '#7dff6a', 14); sfx('up');
  return true;
}
function sell(t) {
  const r = Math.floor(t.spent*.7); S.gold += r; S.towers.splice(S.towers.indexOf(t), 1);
  floatT(t.x, t.y-20, '+'+r, '#ffe14d', 14); smoke(t.x, t.y, 6); sfx('sell');
}
function towerStat(t, k) { return TT[t.type][k][t.lvl]; }

function husaria() {
  if (S.charge > 0 || S.over || !S.running) return false;
  S.charge = HUS_CD;
  const dmg = 90 + 25*S.wave;
  for (let i = 0; i < 6; i++) S.hussars.push({d: PLEN + i*26, hit: new Set(), dmg, lane: (i%2 ? 7 : -7)});
  banner('SZARŻA HUSARII!', '', 1.4); S.shake = 6; sfx('charge');
  return true;
}

// ====== AKTUALIZACJA ======
function update(dt) {
  if (!S.running || S.over) { updateFx(dt); return; }
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
    if (e.d >= PLEN) {
      e.dead = true; S.lives = Math.max(0, S.lives - T.lives); S.fortFlash = .4; S.shake = Math.max(S.shake, e.type==='gen'?14:5);
      floatT(180, 470, '-'+T.lives+' ❤', '#ff4d4d', 16); sfx('life'); burst(180, 478, '#ff5a5a', 10, 90, 3, .5);
      if (S.lives <= 0) { endGame(false); }
    }
    if (e.type === 'gen') { S.bossStep += dt; if (S.bossStep > .7) { S.bossStep = 0; S.shake = Math.max(S.shake, 2.5); } }
  }

  // wieże
  for (const t of S.towers) {
    t.cd -= dt; if (t.anim > 0) t.anim -= dt*4;
    const R = towerStat(t, 'range');
    if (t.type === 'smo') {
      if (t.cd <= 0) {
        const inR = S.enemies.filter(e => !e.dead && Math.hypot(e.x-t.x, e.y-t.y) <= R);
        if (inR.length) {
          t.cd = towerStat(t,'rate'); t.anim = 1;
          for (const e of inR) { e.slowT = 1.3; e.slowA = Math.max(e.slowA*(e.slowT>0?1:0), towerStat(t,'slow')); damage(e, towerStat(t,'dmg'), 'smo');
            if (S.parts.length < 330) S.parts.push({x:e.x+rnd(-4,4), y:e.y-4, vx:rnd(-20,20), vy:rnd(-60,-20), life:.5, max:.5, color:'#2a1a10', size:3, grav:200, kind:'dot'}); }
          S.parts.push({x:t.x, y:t.y, vx:0, vy:0, life:.45, max:.45, color:'#ff8a1a', size:R, grav:0, kind:'ring'});
          sfx('tar');
        }
      }
      continue;
    }
    let best = null;
    for (const e of S.enemies) if (!e.dead && Math.hypot(e.x-t.x, e.y-t.y) <= R && (!best || e.d > best.d)) best = e;
    if (best) {
      const want = Math.atan2(best.y - t.y, best.x - t.x);
      let da = want - t.ang; while (da > Math.PI) da -= 6.283; while (da < -Math.PI) da += 6.283;
      t.ang += da * Math.min(1, dt*14);
      if (t.cd <= 0) {
        t.cd = towerStat(t, 'rate'); t.anim = 1;
        if (t.type === 'mus') {
          S.tracers.push({x1:t.x + Math.cos(t.ang)*16, y1:t.y-6 + Math.sin(t.ang)*16, x2:best.x, y2:best.y-4, life:.08});
          damage(best, towerStat(t,'dmg'), 'mus'); burst(best.x, best.y-4, '#fff1a8', 3, 60, 2, .2); sfx('shot');
          smoke(t.x + Math.cos(t.ang)*16, t.y - 6 + Math.sin(t.ang)*16, 1, 5);
        } else {
          const dist = Math.hypot(best.x-t.x, best.y-t.y), dur = .35 + dist/450;
          const sp = ET[best.type].spd * (best.slowT > 0 ? 1-best.slowA : 1);
          const p = posAt(best.d + sp*dur);
          S.proj.push({sx:t.x + Math.cos(t.ang)*18, sy:t.y - 4 + Math.sin(t.ang)*18, tx:p.x, ty:p.y, t:0, dur, dmg:towerStat(t,'dmg'), splash:towerStat(t,'splash')});
          smoke(t.x + Math.cos(t.ang)*20, t.y - 4 + Math.sin(t.ang)*20, 4, 8); sfx('boom'); S.shake = Math.max(S.shake, 1.5);
        }
      }
    }
  }
  // pociski armatnie
  for (const p of S.proj) {
    p.t += dt;
    if (p.t >= p.dur) {
      p.done = true;
      for (const e of S.enemies) if (!e.dead && Math.hypot(e.x-p.tx, e.y-p.ty) <= p.splash) damage(e, p.dmg, 'arm');
      burst(p.tx, p.ty, '#ff9a1a', 14, 120, 4, .45); burst(p.tx, p.ty, '#ffe14d', 8, 70, 3, .35); smoke(p.tx, p.ty, 6, 10);
      S.parts.push({x:p.tx, y:p.ty, vx:0, vy:0, life:.3, max:.3, color:'#fff2b0', size:p.splash, grav:0, kind:'ring'});
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
      burst(e.x, e.y, '#ffffff', 6, 100, 3, .35);
    }
    if (Math.random() < .3) S.parts.push({x:p.x+rnd(-8,8), y:p.y+8, vx:rnd(-10,10), vy:rnd(-20,-5), life:.5, max:.5, color:'#d9c08a', size:6, grav:0, kind:'smoke'});
  }
  S.hussars = S.hussars.filter(h => h.d > -40);
  S.enemies = S.enemies.filter(e => !e.dead);

  // koniec fali
  if (!S.paid && !S.queue.length && !S.enemies.length && S.wave > 0 && !S.over) {
    S.paid = true;
    if (S.wave >= WAVES.length) endGame(true);
    else { const b = 15 + S.wave*3; S.gold += b; floatT(180, 250, 'Fala odparta! +'+b+' zł', '#7dff6a', 16, 1.6); sfx('coin'); }
  }
  updateFx(dt);
}
function updateFx(dt) {
  for (const p of S.parts) { p.life -= dt; p.x += p.vx*dt; p.y += p.vy*dt; p.vy += p.grav*dt; if (p.kind==='dot') { p.vx *= .97; p.vy *= p.grav ? 1 : .97; } }
  S.parts = S.parts.filter(p => p.life > 0);
  for (const f of S.floats) { f.life -= dt; f.y -= 28*dt; }
  S.floats = S.floats.filter(f => f.life > 0);
  for (const t of S.tracers) t.life -= dt; S.tracers = S.tracers.filter(t => t.life > 0);
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
  persist();
  sfx(win ? 'win' : 'lose');
  if (win) for (let i = 0; i < 6; i++) burst(rnd(60,300), rnd(100,400), ['#ff3b3b','#fff','#ffd84a','#5fd35a'][i%4], 25, 150, 4, 1.2, 60);
  setTimeout(() => showEnd(win, stars), SIM ? 0 : 1100);
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
  BG = makeBg();
}
function srand(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
function distToPath(x, y) {
  let m = 1e9;
  for (const s of SEG) { const t = Math.max(0, Math.min(s.l, (x-s.a[0])*s.dx + (y-s.a[1])*s.dy)); m = Math.min(m, Math.hypot(x - (s.a[0]+s.dx*t), y - (s.a[1]+s.dy*t))); }
  return m;
}
function makeBg() {
  const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height;
  const g = c.getContext('2d'); g.setTransform(SCALE*DPR, 0, 0, SCALE*DPR, 0, OFF*SCALE*DPR);
  const gr = g.createLinearGradient(0, -OFF, 0, H); gr.addColorStop(0, '#7fd65a'); gr.addColorStop(1, '#5cbf45');
  g.fillStyle = gr; g.fillRect(0, -OFF, W, VH);
  const R = srand(1655);
  // łaty trawy
  for (let i = 0; i < 40; i++) { g.fillStyle = R() < .5 ? 'rgba(255,255,255,.06)' : 'rgba(0,60,0,.07)'; g.beginPath(); g.ellipse(R()*W, R()*VH-OFF, 20+R()*40, 10+R()*20, 0, 0, 7); g.fill(); }
  // ścieżka
  g.lineJoin = 'round'; g.lineCap = 'round';
  const line = (w, col) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); PATH.forEach((p,i) => i ? g.lineTo(p[0],p[1]) : g.moveTo(p[0],p[1]-OFF-40)); g.stroke(); };
  line(44, '#4d8a32'); line(40, '#8a6438'); line(34, '#e8c98a'); line(22, '#efd59d');
  g.setLineDash([3, 9]); line(2, 'rgba(140,100,50,.35)'); g.setLineDash([]);
  for (let i = 0; i < 70; i++) { const d = R()*PLEN, p = posAt(d), o = (R()-.5)*26; g.fillStyle = 'rgba(150,110,60,.35)'; g.beginPath(); g.arc(p.x - p.dy*o, p.y + p.dx*o, 1+R()*1.6, 0, 7); g.fill(); }
  const okDeco = (x, y, r) => distToPath(x, y) > 26 + r && SPOTS.every(s => Math.hypot(s[0]-x, s[1]-y) > 24 + r) && !(x > 100 && x < 260 && y > 400) && y > 8 - OFF;
  // kępki, kwiaty
  for (let i = 0; i < 160; i++) { const x = R()*W, y = R()*VH - OFF; if (!okDeco(x, y, 0)) continue;
    if (R() < .7) { g.strokeStyle = 'rgba(40,110,30,.7)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x-3, y); g.lineTo(x-4, y-5); g.moveTo(x, y); g.lineTo(x, y-7); g.moveTo(x+3, y); g.lineTo(x+4, y-5); g.stroke(); }
    else { g.fillStyle = ['#fff','#ffe14d','#ff7aa8','#9ad0ff'][Math.floor(R()*4)]; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(x + Math.cos(k*1.256)*2.3, y + Math.sin(k*1.256)*2.3, 1.6, 0, 7); g.fill(); } g.fillStyle = '#ffb000'; g.beginPath(); g.arc(x, y, 1.3, 0, 7); g.fill(); }
  }
  // kamienie
  for (let i = 0; i < 18; i++) { const x = R()*W, y = R()*VH - OFF, r = 3 + R()*4; if (!okDeco(x, y, r)) continue;
    g.fillStyle = '#a7a39a'; g.strokeStyle = '#4a4238'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, y, r*1.3, r, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(x-r*.4, y-r*.3, r*.5, r*.3, 0, 0, 7); g.fill(); }
  // drzewa
  const trees = [];
  for (let i = 0; i < 90 && trees.length < 24; i++) { const x = R()*W, y = R()*VH - OFF, r = 10 + R()*7; if (okDeco(x, y, r) && trees.every(t => Math.hypot(t[0]-x, t[1]-y) > 22)) trees.push([x, y, r]); }
  trees.sort((a,b) => a[1]-b[1]);
  for (const [x, y, r] of trees) {
    g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(x+3, y+r*.9, r, r*.4, 0, 0, 7); g.fill();
    g.fillStyle = '#7a4a22'; g.strokeStyle = '#3a2410'; g.lineWidth = 1.5; g.fillRect(x-2.5, y, 5, r*.8); g.strokeRect(x-2.5, y, 5, r*.8);
    if (R() < .4) { // świerk
      g.fillStyle = '#2f8a3a'; g.strokeStyle = '#174a1d'; g.lineWidth = 2;
      for (let k = 0; k < 3; k++) { const yy = y - k*r*.5; g.beginPath(); g.moveTo(x - r*(1-k*.25), yy + 2); g.lineTo(x, yy - r*.9); g.lineTo(x + r*(1-k*.25), yy + 2); g.closePath(); g.fill(); g.stroke(); }
    } else {
      g.fillStyle = '#3fae3f'; g.strokeStyle = '#1d5e22'; g.lineWidth = 2;
      g.beginPath(); g.arc(x-r*.45, y-r*.3, r*.6, 0, 7); g.arc(x+r*.45, y-r*.3, r*.6, 0, 7); g.arc(x, y-r*.8, r*.7, 0, 7); g.fill();
      g.beginPath(); g.arc(x-r*.45, y-r*.3, r*.6, 0, 7); g.stroke(); g.beginPath(); g.arc(x+r*.45, y-r*.3, r*.6, 0, 7); g.stroke(); g.beginPath(); g.arc(x, y-r*.8, r*.7, 0, 7); g.stroke();
      g.fillStyle = '#3fae3f'; g.beginPath(); g.arc(x, y-r*.5, r*.6, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(x-r*.2, y-r*1.05, r*.25, 0, 7); g.fill();
      if (R() < .4) { g.fillStyle = '#e53935'; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x + (R()-.5)*r, y - r*.3 - R()*r*.7, 1.8, 0, 7); g.fill(); } }
    }
  }
  // namioty szwedzkie u góry (obóz)
  [[20,40],[300,30],[330,60],[20,-OFF+40],[150,-OFF+30],[300,-OFF+60],[25,-OFF*.4],[320,-OFF*.5]].forEach(([x,y]) => { if (!okDeco(x,y,6)) return;
    g.fillStyle = '#3b6fd6'; g.strokeStyle = '#1b2e5c'; g.lineWidth = 2; g.beginPath(); g.moveTo(x-12, y+8); g.lineTo(x, y-10); g.lineTo(x+12, y+8); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#ffd23a'; g.beginPath(); g.moveTo(x-3, y+8); g.lineTo(x, y-3); g.lineTo(x+3, y+8); g.fill(); });
  return c;
}

function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x+r, y); c.arcTo(x+w, y, x+w, y+h, r); c.arcTo(x+w, y+h, x, y+h, r); c.arcTo(x, y+h, x, y, r); c.arcTo(x, y, x+w, y, r); c.closePath(); }
const INK = '#2b1d0e';
function circ(c, x, y, r, fill, stroke=INK, lw=1.5) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = fill; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); } }
const LVLC = ['#c8874a', '#d6dde6', '#ffcc33'];

function drawTower(c, type, lvl, ang, t, anim) {
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 9, 19, 7, 0, 0, 7); c.fill();
  // platforma
  circ(c, 0, 2, 17, '#b9b2a6', INK, 2);
  c.strokeStyle = 'rgba(80,70,60,.5)'; c.lineWidth = 1; for (let k = 0; k < 6; k++) { const a = k*1.047+.3; c.beginPath(); c.moveTo(Math.cos(a)*9, 2+Math.sin(a)*9); c.lineTo(Math.cos(a)*16, 2+Math.sin(a)*16); c.stroke(); }
  c.beginPath(); c.arc(0, 2, 16, 0, 7); c.strokeStyle = LVLC[lvl]; c.lineWidth = 3; c.stroke();
  if (type === 'mus') {
    const pos = [[[0,0]], [[-6,3],[6,-2]], [[-7,4],[7,3],[0,-5]]][lvl];
    if (lvl >= 1) { // chorągiew
      c.strokeStyle = '#5a3a1a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-13, 6); c.lineTo(-13, -24); c.stroke();
      const wv = Math.sin(t*5)*2; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-13,-24); c.quadraticCurveTo(-5,-26+wv,3,-24); c.lineTo(3,-19); c.quadraticCurveTo(-5,-21+wv,-13,-19); c.fill();
      c.fillStyle = '#e02b2b'; c.beginPath(); c.moveTo(-13,-19); c.quadraticCurveTo(-5,-21+wv,3,-19); c.lineTo(3,-14); c.quadraticCurveTo(-5,-16+wv,-13,-14); c.fill();
      c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(-13,-24,16,10);
    }
    for (const [px, py] of pos) {
      c.save(); c.translate(px, py - 4);
      // muszkiet
      c.save(); c.rotate(ang); c.strokeStyle = '#5a3417'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 2); c.lineTo(15 - anim*2, 2); c.stroke();
      c.strokeStyle = '#555'; c.lineWidth = 2; c.beginPath(); c.moveTo(10 - anim*2, 2); c.lineTo(17 - anim*2, 2); c.stroke();
      if (anim > .6) { circ(c, 19, 2, 4, '#fff3a0', null); circ(c, 19, 2, 2, '#fff', null); }
      c.restore();
      circ(c, 0, 2, 6, lvl==2 ? '#c41e3a' : '#d93636');
      c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-4, -1); c.lineTo(4, 5); c.stroke();
      circ(c, 0, -5, 4.2, '#f5c9a0');
      c.fillStyle = INK; c.fillRect(-2, -5.5, 1.2, 1.2); c.fillRect(1, -5.5, 1.2, 1.2);
      // kołpak
      c.fillStyle = '#5a3a1a'; rr(c, -4.5, -11, 9, 4.5, 2); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
      c.fillStyle = lvl==2 ? '#ffcc33' : '#e02b2b'; c.fillRect(-3, -13, 6, 2.5);
      c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(2, -12); c.quadraticCurveTo(6, -16, 4, -19); c.stroke();
      c.restore();
    }
  } else if (type === 'arm') {
    c.save(); c.translate(0, -2); c.rotate(ang);
    const rec = anim*4;
    c.fillStyle = '#5a3a1a'; c.fillRect(-9, -10, 6, 4); c.fillRect(-9, 6, 6, 4);
    c.fillStyle = '#8b5a2b'; c.strokeStyle = INK; c.lineWidth = 1.5; rr(c, -11, -7, 16, 14, 3); c.fill(); c.stroke();
    // koła
    for (const s of [-1, 1]) { c.fillStyle = '#6b4220'; rr(c, -8, s*9 - 3, 10, 6, 2); c.fill(); c.stroke(); }
    const bl = 17 + lvl*3, bw = 7 + lvl*1.5;
    const barrels = lvl == 2 ? [-3.5, 3.5] : [0];
    for (const off of barrels) {
      c.fillStyle = lvl == 0 ? '#3a3a3a' : lvl == 1 ? '#2e2e2e' : '#b8860b';
      rr(c, -6 - rec, off - bw/2, bl, bw, 3); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-4 - rec, off - bw/2 + 1.2, bl - 5, 1.6);
      c.fillStyle = INK; circ(c, bl - 6 - rec, off, bw/2 - .5, lvl==2 ? '#8a6408' : '#1a1a1a');
      if (lvl >= 1) { c.fillStyle = '#ffcc33'; c.fillRect(2 - rec, off - bw/2, 2, bw); }
    }
    if (anim > .7) { circ(c, bl - 2, 0, 6, '#ffb03a', null); circ(c, bl - 2, 0, 3, '#fff6c0', null); }
    c.restore();
    // kule obok
    circ(c, 11, 11, 2.6, '#222', INK, 1); circ(c, 14, 8, 2.6, '#222', INK, 1);
  } else { // smoła
    const s = 1 + lvl*.15;
    c.save(); c.scale(s, s);
    // ogień
    for (let k = 0; k < 5; k++) { const fx = -8 + k*4, fh = 7 + Math.sin(t*14 + k*1.7)*3 + lvl*2;
      c.fillStyle = '#ff6a00'; c.beginPath(); c.moveTo(fx-3, 8); c.quadraticCurveTo(fx, 8-fh*1.4, fx+3, 8); c.fill();
      c.fillStyle = '#ffd23a'; c.beginPath(); c.moveTo(fx-1.5, 8); c.quadraticCurveTo(fx, 8-fh*.8, fx+1.5, 8); c.fill(); }
    // kocioł
    c.fillStyle = '#2a2a2a'; c.strokeStyle = INK; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-11, -4); c.quadraticCurveTo(-12, 9, 0, 9); c.quadraticCurveTo(12, 9, 11, -4); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(-6, 1, 2, 4, .3, 0, 7); c.fill();
    if (lvl >= 1) { c.strokeStyle = lvl==2 ? '#ffcc33' : '#9aa4b1'; c.lineWidth = 2; c.beginPath(); c.moveTo(-11.5, 2); c.quadraticCurveTo(0, 6, 11.5, 2); c.stroke(); }
    c.fillStyle = lvl == 2 ? '#ffcc33' : '#555'; c.beginPath(); c.ellipse(0, -4, 12, 4, 0, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = '#1a0f08'; c.beginPath(); c.ellipse(0, -4, 9.5, 2.8, 0, 0, 7); c.fill();
    for (let k = 0; k < 3; k++) { const ph = (t*1.5 + k*.33) % 1; circ(c, -5 + k*5, -4 - ph*3, 1.2 + ph*1.5, 'rgba(60,40,25,' + (1-ph) + ')', null); }
    if (anim > .5) { c.strokeStyle = 'rgba(255,140,30,.8)'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, -4, 14 + (1-anim)*10, 5 + (1-anim)*3, 0, 0, 7); c.stroke(); }
    c.restore();
  }
  // gwiazdki poziomu
  for (let k = 0; k <= lvl; k++) { const x = (k - lvl/2)*8; star(c, x, 17, 3.6, LVLC[lvl]); }
}
function star(c, x, y, r, col) {
  c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI/2 + i*Math.PI/5, rr2 = i%2 ? r*.45 : r; c.lineTo(x + Math.cos(a)*rr2, y + Math.sin(a)*rr2); }
  c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
}

function drawEnemy(c, e, t) {
  const T = ET[e.type];
  c.save(); c.translate(e.x, e.y);
  c.fillStyle = e.slowT > 0 ? 'rgba(30,15,5,.55)' : 'rgba(0,0,0,.22)';
  c.beginPath(); c.ellipse(0, T.r*.8, T.r*(e.slowT>0?1.3:1), T.r*.4, 0, 0, 7); c.fill();
  const ph = t*12 + e.seed, bob = -Math.abs(Math.sin(ph))*1.8, leg = Math.sin(ph)*3;
  c.translate(0, bob); c.scale(e.face, 1);
  if (e.type === 'gen') c.scale(1.7, 1.7);
  if (e.type === 'raj') {
    c.strokeStyle = '#5a3417'; c.lineWidth = 2.2;
    c.beginPath(); c.moveTo(-6, 4); c.lineTo(-6 + leg, 10); c.moveTo(-3, 4); c.lineTo(-3 - leg, 10); c.moveTo(5, 4); c.lineTo(5 - leg, 10); c.moveTo(8, 4); c.lineTo(8 + leg, 10); c.stroke();
    c.fillStyle = '#8a5a32'; c.strokeStyle = INK; c.lineWidth = 1.5;
    c.beginPath(); c.ellipse(0, 2, 11, 5.5, 0, 0, 7); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(11, -3, 5, 3.2, -.6, 0, 7); c.fill(); c.stroke();
    c.strokeStyle = '#3a2410'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-10, 0); c.quadraticCurveTo(-15, 2 + leg*.5, -14, 7); c.stroke();
    c.fillStyle = INK; c.fillRect(12, -5, 1.4, 1.4);
    // jeździec
    c.fillStyle = '#2f6fd6'; c.strokeStyle = INK; c.lineWidth = 1.5; rr(c, -5, -10, 9, 10, 3); c.fill(); c.stroke();
    c.strokeStyle = '#ffd23a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-4, -9); c.lineTo(3, -1); c.stroke();
    circ(c, -.5, -13.5, 3.8, '#f5c9a0');
    c.fillStyle = '#222'; c.beginPath(); c.ellipse(-.5, -16.5, 6, 2, 0, 0, 7); c.fill(); rr(c, -3.5, -20, 6, 4, 2); c.fill();
    c.strokeStyle = '#ffd23a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-3, -19); c.quadraticCurveTo(-8, -22, -9, -17); c.stroke();
    c.strokeStyle = '#ccc'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(3, -6); c.quadraticCurveTo(10, -12, 12, -18); c.stroke();
  } else {
    c.strokeStyle = INK; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(-3, 4); c.lineTo(-3 + leg, 9); c.moveTo(3, 4); c.lineTo(3 - leg, 9); c.stroke();
    if (e.type === 'gen') { // peleryna
      c.fillStyle = '#ffd23a'; c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-5, -6); c.quadraticCurveTo(-13, 2 + leg*.4, -10, 7); c.lineTo(-2, 5); c.closePath(); c.fill(); c.stroke();
    }
    const armored = e.type === 'pan';
    c.fillStyle = armored ? '#a7b1bd' : '#2f6fd6'; c.strokeStyle = INK; c.lineWidth = 1.5;
    rr(c, -6.5, -7, 13, 12, 4); c.fill(); c.stroke();
    if (armored) { c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-3, -5); c.lineTo(-3, 2); c.stroke(); c.strokeStyle = '#6b7684'; c.beginPath(); c.moveTo(-6, -1); c.lineTo(6, -1); c.stroke(); }
    else { c.strokeStyle = '#ffd23a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-5, -6); c.lineTo(5, 4); c.stroke(); }
    if (e.type === 'gen') { c.fillStyle = '#ffd23a'; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(2, -4 + k*3.2, 1, 0, 7); c.fill(); } }
    circ(c, 0, -11, 4.6, '#f5c9a0');
    c.fillStyle = INK; c.fillRect(1, -12, 1.4, 1.4); c.fillRect(3.2, -12, 1.4, 1.4);
    if (e.type === 'gen') { c.strokeStyle = '#7a4a22'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(1, -8.6); c.quadraticCurveTo(3, -7.5, 5.5, -9); c.stroke(); }
    if (armored) { // morion
      c.fillStyle = '#c3ccd6'; c.strokeStyle = INK; c.lineWidth = 1.3; c.beginPath(); c.arc(0, -13, 5.5, Math.PI, 0); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(0, -13, 8, 1.8, 0, 0, 7); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-3, -18); c.quadraticCurveTo(0, -22, 3, -18); c.stroke();
      // pika
      c.strokeStyle = '#6b4220'; c.lineWidth = 2; c.beginPath(); c.moveTo(4, 6); c.lineTo(11, -24); c.stroke();
      c.fillStyle = '#ddd'; c.beginPath(); c.moveTo(11.8, -30); c.lineTo(9.4, -23); c.lineTo(12.6, -22.4); c.closePath(); c.fill(); c.stroke();
    } else if (e.type === 'gen') {
      c.fillStyle = '#1b1b1b'; c.beginPath(); c.ellipse(0, -15, 8, 2.6, 0, 0, 7); c.fill(); rr(c, -4.5, -20, 9, 5, 2); c.fill();
      c.fillStyle = '#ffd23a'; c.fillRect(-4.5, -16.5, 9, 1.4);
      c.fillStyle = '#fff'; c.strokeStyle = INK; c.lineWidth = .8; c.beginPath(); c.ellipse(-5, -20, 5, 2.4, -.5, 0, 7); c.fill(); c.stroke();
      c.strokeStyle = '#e6e6e6'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(5, -2); c.lineTo(12, -14); c.stroke();
      c.strokeStyle = '#ffd23a'; c.beginPath(); c.moveTo(3.5, -3.5); c.lineTo(7, -1); c.stroke();
    } else {
      c.fillStyle = '#1b1b1b'; c.beginPath(); c.moveTo(-7, -14); c.quadraticCurveTo(0, -21, 7, -14); c.quadraticCurveTo(0, -15.5, -7, -14); c.fill();
      c.strokeStyle = '#5a3417'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(3, 3); c.lineTo(11, -11); c.stroke();
      c.strokeStyle = '#888'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(9, -7.5); c.lineTo(12, -13); c.stroke();
    }
  }
  if (e.flash > 0) { c.globalAlpha = .55; circ(c, 0, -5, T.r*(e.type==='gen'?.75:1.05), '#fff', null); c.globalAlpha = 1; }
  if (e.slowT > 0) { c.fillStyle = '#1a0f08'; for (let k = 0; k < 3; k++) { const yy = ((t*2 + k*.33 + e.seed) % 1)*8; c.beginPath(); c.arc(-4 + k*4, -2 + yy, 1.3, 0, 7); c.fill(); } }
  c.restore();
  if (e.hp < e.max) {
    const bw = e.type === 'gen' ? 44 : 20, by = e.y - (e.type === 'gen' ? 46 : T.r + 16);
    c.fillStyle = INK; c.fillRect(e.x - bw/2 - 1, by - 1, bw + 2, 6);
    c.fillStyle = '#5a1010'; c.fillRect(e.x - bw/2, by, bw, 4);
    const f = Math.max(0, e.hp / e.max); c.fillStyle = f > .5 ? '#5fd35a' : f > .25 ? '#ffc400' : '#ff4040'; c.fillRect(e.x - bw/2, by, bw*f, 4);
  }
}
function drawHussar(c, h, t) {
  if (h.d > PLEN || h.x === undefined) return;
  c.save(); c.translate(h.x, h.y); c.scale(h.face, 1);
  const ph = t*20 + h.lane, leg = Math.sin(ph)*4, bob = -Math.abs(Math.sin(ph))*2;
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 9, 13, 4, 0, 0, 7); c.fill();
  c.translate(0, bob);
  c.strokeStyle = '#ddd'; c.lineWidth = 2.4;
  c.beginPath(); c.moveTo(-7, 4); c.lineTo(-7 + leg, 11); c.moveTo(-3, 4); c.lineTo(-3 - leg, 11); c.moveTo(5, 4); c.lineTo(5 - leg, 11); c.moveTo(9, 4); c.lineTo(9 + leg, 11); c.stroke();
  c.fillStyle = '#f4f4f4'; c.strokeStyle = INK; c.lineWidth = 1.5;
  c.beginPath(); c.ellipse(0, 2, 12, 6, 0, 0, 7); c.fill(); c.stroke();
  c.beginPath(); c.ellipse(12, -3, 5.5, 3.4, -.6, 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#c41e3a'; c.fillRect(-6, -2, 10, 6);
  // skrzydła
  c.strokeStyle = '#8a5a32'; c.lineWidth = 2; c.beginPath(); c.moveTo(-5, -4); c.quadraticCurveTo(-14, -18, -6, -30); c.stroke();
  for (let k = 0; k < 6; k++) { const y = -8 - k*4, x = -8 - Math.sin(k*.5)*3; c.fillStyle = '#fff'; c.strokeStyle = '#999'; c.lineWidth = .8; c.beginPath(); c.ellipse(x - 3, y, 4, 1.8, -.5, 0, 7); c.fill(); c.stroke(); }
  // jeździec
  c.fillStyle = '#c41e3a'; c.strokeStyle = INK; c.lineWidth = 1.5; rr(c, -4, -11, 9, 11, 3); c.fill(); c.stroke();
  c.fillStyle = '#c3ccd6'; c.fillRect(-3, -9, 7, 4);
  circ(c, .5, -14, 3.8, '#f5c9a0');
  c.fillStyle = '#c3ccd6'; c.beginPath(); c.arc(.5, -15.5, 4.5, Math.PI, 0); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
  // kopia z proporcem
  c.strokeStyle = '#ffd23a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-6, -2); c.lineTo(26, -10); c.stroke();
  const wv = Math.sin(t*25)*1.5;
  c.fillStyle = '#fff'; c.beginPath(); c.moveTo(20, -9); c.lineTo(12, -11 + wv); c.lineTo(16, -8.5); c.fill();
  c.fillStyle = '#e02b2b'; c.beginPath(); c.moveTo(20, -9); c.lineTo(12, -7 + wv); c.lineTo(16, -8.5); c.fill();
  c.restore();
}
function drawFortress(c, t) {
  c.save();
  const fl = S.fortFlash > 0;
  c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(182, 556, 80, 10, 0, 0, 7); c.fill();
  // mury
  c.fillStyle = fl ? '#ffb3b3' : '#efe8d8'; c.strokeStyle = INK; c.lineWidth = 2;
  rr(c, 120, 482, 120, 72, 6); c.fill(); c.stroke();
  for (let x = 124; x < 236; x += 10) { if (x > 168 && x < 192) continue; c.fillRect(x, 476, 6, 7); c.strokeRect(x, 476, 6, 7); }
  c.strokeStyle = 'rgba(120,100,80,.35)'; c.lineWidth = 1;
  for (let y = 494; y < 552; y += 9) { c.beginPath(); c.moveTo(122, y); c.lineTo(238, y); c.stroke(); }
  // kościół
  c.fillStyle = '#f7f1e3'; c.strokeStyle = INK; c.lineWidth = 1.5; c.fillRect(140, 508, 50, 30); c.strokeRect(140, 508, 50, 30);
  c.fillStyle = '#d94a3a'; c.beginPath(); c.moveTo(136, 510); c.lineTo(165, 494); c.lineTo(194, 510); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#7a5520'; rr(c, 158, 522, 12, 16, 5); c.fill(); c.stroke();
  // wieża Jasnej Góry
  c.fillStyle = '#f7f1e3'; c.fillRect(206, 470, 18, 70); c.strokeRect(206, 470, 18, 70);
  c.fillStyle = '#4a3220'; for (let y = 482; y < 532; y += 14) { rr(c, 212, y, 6, 8, 3); c.fill(); }
  c.fillStyle = '#2e7d5b'; c.beginPath(); c.moveTo(203, 472); c.quadraticCurveTo(215, 462, 227, 472); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#f7f1e3'; c.fillRect(209, 452, 12, 14); c.strokeRect(209, 452, 12, 14);
  c.fillStyle = '#2e7d5b'; c.beginPath(); c.moveTo(207, 454); c.lineTo(215, 432); c.lineTo(223, 454); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = '#ffcc33'; c.lineWidth = 2; c.beginPath(); c.moveTo(215, 432); c.lineTo(215, 424); c.moveTo(212, 427); c.lineTo(218, 427); c.stroke();
  // baszty
  for (const [x, y] of [[122,486],[238,486],[122,550],[238,550]]) {
    c.fillStyle = fl ? '#ffb3b3' : '#e6dcc6'; c.strokeStyle = INK; c.lineWidth = 1.8; c.beginPath(); c.arc(x, y, 10, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#d94a3a'; c.beginPath(); c.moveTo(x-12, y-4); c.lineTo(x, y-20); c.lineTo(x+12, y-4); c.closePath(); c.fill(); c.stroke();
  }
  // brama
  c.fillStyle = '#4a3220'; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(168, 496); c.lineTo(168, 482); c.arc(180, 482, 12, Math.PI, 0); c.lineTo(192, 496); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = '#2b1d0e'; c.lineWidth = 1; for (let x = 172; x < 190; x += 4) { c.beginPath(); c.moveTo(x, 474); c.lineTo(x, 496); c.stroke(); }
  // flaga
  c.strokeStyle = '#5a3a1a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(122, 466); c.lineTo(122, 448); c.stroke();
  const wv = Math.sin(t*4)*1.5; c.fillStyle = '#fff'; c.fillRect(122, 448 + wv*.3, 14, 4); c.fillStyle = '#e02b2b'; c.fillRect(122, 452 + wv*.3, 14, 4);
  c.restore();
}

let realT = 0;
function render() {
  const c = ctx;
  c.setTransform(1, 0, 0, 1, 0, 0);
  if (BG) c.drawImage(BG, 0, 0);
  c.setTransform(SCALE*DPR, 0, 0, SCALE*DPR, 0, OFF*SCALE*DPR);
  if (S.shake > 0) c.translate(rnd(-1,1)*S.shake, rnd(-1,1)*S.shake);
  const t = S.time;
  // pola budowy
  const hint = S.towers.length === 0 && S.running;
  SPOTS.forEach(([x, y], i) => {
    if (S.towers.some(tw => tw.spot === i)) return;
    c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(x, y+5, 17, 6, 0, 0, 7); c.fill();
    c.fillStyle = S.selected && S.selected.spot === i && !S.selected.tower ? '#fff3c4' : '#cfc6b2'; c.strokeStyle = '#6a5a40'; c.lineWidth = 2;
    c.beginPath(); c.arc(x, y, 15, 0, 7); c.fill(); c.setLineDash([4, 3]); c.stroke(); c.setLineDash([]);
    c.strokeStyle = 'rgba(106,90,64,.8)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x-5, y); c.lineTo(x+5, y); c.moveTo(x, y-5); c.lineTo(x, y+5); c.stroke();
    if (hint) { const k = (realT*1.2) % 1; c.strokeStyle = 'rgba(255,240,120,' + (1-k) + ')'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 15 + k*10, 0, 7); c.stroke(); }
  });
  // zasięg zaznaczonej wieży
  const selT = S.selected && S.selected.tower;
  if (selT) { const R = towerStat(selT, 'range'); c.fillStyle = 'rgba(255,255,255,.15)'; c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2; c.beginPath(); c.arc(selT.x, selT.y, R, 0, 7); c.fill(); c.stroke(); }
  // obiekty posortowane po y
  const objs = [];
  for (const tw of S.towers) objs.push([tw.y, 0, tw]);
  for (const e of S.enemies) objs.push([e.y, 1, e]);
  for (const h of S.hussars) if (h.x !== undefined && h.d <= PLEN) objs.push([h.y, 2, h]);
  objs.sort((a, b) => a[0] - b[0]);
  for (const [, k, o] of objs) {
    if (k === 0) { c.save(); c.translate(o.x, o.y); drawTower(c, o.type, o.lvl, o.ang, t, Math.max(0, o.anim)); c.restore(); }
    else if (k === 1) drawEnemy(c, o, t);
    else drawHussar(c, o, t);
  }
  drawFortress(c, t);
  // smugi muszkietów
  for (const tr of S.tracers) { c.strokeStyle = 'rgba(255,240,160,' + (tr.life/.08) + ')'; c.lineWidth = 2; c.beginPath(); c.moveTo(tr.x1, tr.y1); c.lineTo(tr.x2, tr.y2); c.stroke(); }
  // kule armatnie (łuk)
  for (const p of S.proj) {
    const k = p.t / p.dur, x = p.sx + (p.tx - p.sx)*k, y = p.sy + (p.ty - p.sy)*k, hgt = Math.sin(k*Math.PI) * (20 + p.dur*30);
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(x, y+3, 4, 2, 0, 0, 7); c.fill();
    circ(c, x, y - hgt, 4.5, '#1e1e1e', '#000', 1); circ(c, x-1.5, y - hgt - 1.5, 1.4, 'rgba(255,255,255,.6)', null);
  }
  // cząsteczki
  for (const p of S.parts) {
    const a = Math.max(0, p.life / p.max);
    if (p.kind === 'smoke') { c.globalAlpha = a*.55; circ(c, p.x, p.y, p.size*(1.6 - a*.6), p.color, null); }
    else if (p.kind === 'ring') { c.globalAlpha = a; c.strokeStyle = p.color; c.lineWidth = 3; c.beginPath(); c.arc(p.x, p.y, p.size*(1 - a*.6), 0, 7); c.stroke(); }
    else { c.globalAlpha = Math.min(1, a*1.5); c.fillStyle = p.color; c.beginPath(); c.arc(p.x, p.y, Math.max(.3, p.size*a), 0, 7); c.fill(); }
  }
  c.globalAlpha = 1;
  // napisy
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  for (const f of S.floats) {
    const a = Math.min(1, f.life / f.max * 2.5), sc = 1 + Math.max(0, (f.life/f.max - .8))*2;
    c.globalAlpha = a; c.font = '900 ' + Math.round(f.size*sc) + 'px system-ui,sans-serif';
    c.strokeStyle = INK; c.lineWidth = 3; c.strokeText(f.text, f.x, f.y); c.fillStyle = f.color; c.fillText(f.text, f.x, f.y);
  }
  c.globalAlpha = 1;
  if (S.banner) {
    const b = S.banner, k = 1 - b.t / b.max, a = Math.min(1, b.t*3, k*8), sc = k < .12 ? .6 + k/.12*.4 : 1;
    c.save(); c.globalAlpha = a; c.translate(W/2, 230); c.scale(sc, sc);
    c.fillStyle = 'rgba(30,20,10,.55)'; rr(c, -150, -30, 300, b.sub ? 62 : 46, 14); c.fill();
    c.font = '900 26px system-ui,sans-serif'; c.strokeStyle = INK; c.lineWidth = 5; c.strokeText(b.text, 0, -8); c.fillStyle = '#ffe14d'; c.fillText(b.text, 0, -8);
    if (b.sub) { c.font = '700 13px system-ui,sans-serif'; c.fillStyle = '#fff'; c.fillText(b.sub, 0, 17); }
    c.restore();
  }
}

// ====== UI ======
const $ = id => document.getElementById(id);
const menu = $('menu');
const ICONS = {};
function makeIcons() {
  for (const k of Object.keys(TT)) for (let l = 0; l < 3; l++) {
    const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d');
    g.scale(2, 2); g.translate(24, 26); drawTower(g, k, l, -Math.PI/4, 0, 0); ICONS[k+l] = c.toDataURL();
  }
}
function toCss(x, y) { return [cv.offsetLeft + x*SCALE, cv.offsetTop + (y+OFF)*SCALE]; }
function placeMenu(x, y) {
  const [cx, cy] = toCss(x, y), st = $('stage');
  menu.classList.remove('hidden');
  const mw = menu.offsetWidth, mh = menu.offsetHeight;
  let left = Math.max(4, Math.min(st.clientWidth - mw - 4, cx - mw/2));
  let top = cy - mh - 26*SCALE; if (top < 4) top = cy + 26*SCALE;
  if (top + mh > st.clientHeight - 4) top = st.clientHeight - mh - 4;
  menu.style.left = left + 'px'; menu.style.top = top + 'px';
}
function closeMenu() { menu.classList.add('hidden'); if (S) S.selected = null; }
function openBuild(i) {
  S.selected = {spot: i};
  menu.innerHTML = '<div class="opts">' + Object.keys(TT).map(k => `<button class="opt" data-k="${k}"><img src="${ICONS[k+0]}" alt="">${TT[k].name}<span class="c">${TT[k].cost[0]} zł</span></button>`).join('') + '</div>';
  menu.querySelectorAll('.opt').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); audioInit();
    if (build(i, b.dataset.k)) closeMenu(); else { sfx('click'); bumpGold(); } }));
  refreshMenu(); placeMenu(SPOTS[i][0], SPOTS[i][1]);
}
function openTower(tw) {
  S.selected = {spot: tw.spot, tower: tw};
  const T = TT[tw.type], max = tw.lvl >= 2, uc = max ? 0 : T.cost[tw.lvl+1], ref = Math.floor(tw.spent*.7);
  const dmgTxt = tw.type === 'smo' ? `Spowolnienie ${Math.round(towerStat(tw,'slow')*100)}%` : `Obrażenia ${towerStat(tw,'dmg')}`;
  const nextTxt = max ? '' : (tw.type === 'smo' ? ` → ${Math.round(T.slow[tw.lvl+1]*100)}%` : ` → ${T.dmg[tw.lvl+1]}`);
  menu.innerHTML = `<h3>${T.name} · poziom ${tw.lvl+1}/3</h3><div class="desc">${T.desc}<br>${dmgTxt}${nextTxt} · Zasięg ${towerStat(tw,'range')}</div>
    <div class="row"><button class="act up" data-c="${uc}">${max ? 'MAKS. ★' : 'Ulepsz ' + uc + ' zł'}</button><button class="act sell">Sprzedaj +${ref}</button></div>`;
  menu.querySelector('.up').addEventListener('click', ev => { ev.stopPropagation(); audioInit(); if (upgrade(tw)) openTower(tw); else { sfx('click'); if (!max) bumpGold(); } });
  menu.querySelector('.sell').addEventListener('click', ev => { ev.stopPropagation(); audioInit(); sell(tw); closeMenu(); });
  refreshMenu(); placeMenu(tw.x, tw.y);
}
function refreshMenu() {
  if (menu.classList.contains('hidden')) return;
  menu.querySelectorAll('.opt').forEach(b => b.classList.toggle('no', S.gold < TT[b.dataset.k].cost[0]));
  const up = menu.querySelector('.up'); if (up) up.classList.toggle('no', !(+up.dataset.c) || S.gold < +up.dataset.c);
}
function bumpGold() { const p = $('gold').parentNode; p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); }

cv.addEventListener('pointerdown', ev => {
  audioInit();
  if (!S.running || S.over) return;
  const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * W, y = (ev.clientY - r.top) / r.height * VH - OFF;
  const tw = S.towers.find(t => Math.hypot(t.x - x, t.y - y) < 22);
  if (tw) { sfx('click'); openTower(tw); return; }
  const i = SPOTS.findIndex(s => Math.hypot(s[0] - x, s[1] - y) < 22);
  if (i >= 0) { sfx('click'); openBuild(i); return; }
  closeMenu();
});
$('stage').addEventListener('pointerdown', ev => { if (ev.target === $('stage')) closeMenu(); });
$('btnWave').addEventListener('click', () => { audioInit(); if (!S.running || S.over) return; if (S.wave === 0 || S.countdown !== null) startWave(true); });
$('btnHus').addEventListener('click', () => { audioInit(); husaria(); });
$('btnSpeed').addEventListener('click', () => { audioInit(); sfx('click'); S.speed = S.speed === 1 ? 2 : 1; });
$('btnMute').addEventListener('click', () => { audioInit(); save.mute = !save.mute; persist(); sfx('click'); });
$('btnPlay').addEventListener('click', () => { audioInit(); sfx('up'); $('start').classList.add('hidden'); S.running = true; banner('Postaw wieże!', 'Dotknij kamienne pole przy drodze', 2.6); });
$('btnAgain').addEventListener('click', () => { audioInit(); sfx('up'); $('end').classList.add('hidden'); const sp = S.speed; newGame(); S.speed = sp; S.running = true; banner('Do broni!', 'Postaw wieże i ruszaj', 2); });

function showEnd(win, stars) {
  $('endTitle').textContent = win ? 'ZWYCIĘSTWO!' : 'PORAŻKA';
  $('endTitle').style.color = win ? '#2f9c33' : '#c0262d';
  $('stars').innerHTML = [0,1,2].map(i => `<span class="${i < stars ? 'on' : ''}" style="animation-delay:${.3 + i*.35}s">★</span>`).join('');
  $('endText').innerHTML = win
    ? `Jasna Góra obroniona! Zostało <b>${S.lives}</b> ❤ · pokonani wrogowie: <b>${S.kills}</b>.<br>${stars < 3 ? 'Spróbuj stracić mniej żyć, by zdobyć 3 gwiazdki!' : 'Perfekcyjna obrona – jesteś Kordeckim!'}`
    : `Szwedzi wdarli się za mury w fali <b>${S.wave}</b>.<br>Ulepszaj wieże i używaj husarii w trudnych chwilach!`;
  $('end').classList.remove('hidden');
  renderBest();
}
function renderBest() {
  $('best').innerHTML = save.bestWave ? `Twój rekord: ${'★'.repeat(save.bestStars)}${'☆'.repeat(3 - save.bestStars)} · fala ${save.bestWave}/10` : '';
}
const last = {};
function setTxt(id, v) { if (last[id] !== v) { last[id] = v; $(id).textContent = v; } }
function ui() {
  setTxt('gold', String(S.gold)); setTxt('lives', String(S.lives)); setTxt('wave', `Fala ${S.wave}/${WAVES.length}`);
  const bw = $('btnWave');
  let lbl, sub, en;
  if (S.wave === 0) { lbl = '▶ Start fali 1'; sub = 'gotowy?'; en = S.running; }
  else if (S.countdown !== null) { const b = Math.ceil(S.countdown)*2; lbl = `▶ Fala ${S.wave+1}`; sub = `+${b} zł · za ${Math.ceil(S.countdown)} s`; en = true; }
  else if (S.wave >= WAVES.length) { lbl = 'Ostatnia fala!'; sub = `wrogów: ${S.enemies.length + S.queue.length}`; en = false; }
  else { lbl = 'Fala trwa…'; sub = `wrogów: ${S.enemies.length + S.queue.length}`; en = false; }
  setTxt('waveLbl', lbl); setTxt('waveSub', sub);
  en = en && !S.over;
  if (bw.disabled === en) bw.disabled = !en;
  bw.classList.toggle('pulse', en && !S.over && (S.wave === 0 ? S.towers.length > 0 : true));
  const hb = $('btnHus'), ready = S.charge <= 0 && S.running && !S.over;
  if (hb.disabled === ready) hb.disabled = !ready;
  $('husFill').style.height = (S.charge / HUS_CD * 100) + '%';
  setTxt('husSub', S.charge > 0 ? `za ${Math.ceil(S.charge)} s` : 'gotowa!');
  hb.classList.toggle('pulse', ready && S.enemies.length > 8);
  setTxt('btnSpeed', 'x' + S.speed); setTxt('btnMute', save.mute ? '🔇' : '🔊');
  refreshMenu();
}

// ====== PĘTLA ======
let lastT = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - lastT) / 1000); lastT = now; realT += dt;
  for (let i = 0; i < S.speed; i++) update(dt);
  render(); ui();
  requestAnimationFrame(frame);
}
newGame(); makeIcons(); fit(); renderBest();
window.addEventListener('resize', () => { fit(); closeMenu(); });
if (Q.has('autostart')) { $('start').classList.add('hidden'); S.running = true; }
requestAnimationFrame(frame);

// API do testów
window.TD = {
  get S() { return S; }, SPOTS, WAVES,
  build: (i, k) => build(i, k), upgrade: i => upgrade(S.towers.find(t => t.spot === i)), next: () => startWave(true), husaria: () => husaria(),
  start: () => { $('start').classList.add('hidden'); S.running = true; },
  sim(sec, cb) { SIM = true; const n = Math.round(sec*60); for (let i = 0; i < n && !S.over; i++) { update(1/60); if (cb) cb(S); } SIM = false; return {wave:S.wave, lives:S.lives, gold:S.gold, over:S.over, result:S.result}; },
  setSpeed: n => { S.speed = n; }, openTower: i => openTower(S.towers.find(t => t.spot === i)), openBuild,
};
})();
