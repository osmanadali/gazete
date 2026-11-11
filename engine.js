'use strict';
const $=s=>document.querySelector(s),wait=ms=>new Promise(r=>setTimeout(r,ms)),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),up=s=>s.toLocaleUpperCase('tr');
const nar=$('#nar'),ch=$('#ch'),stage=$('#stage'),svg=$('#w'),bg=$('#bg'),mks=$('#mks'),pg=$('#pg');
let G=null,busy=true,modal=0,tap=null,keys={},P={x:130,dir:1,walk:0,tx:null,pend:null},cur=[],near=null,AC=null,mute=false,lt=0,SCW=1000,cam=0;
const KEY='manset-v2';
const save=()=>{try{G.x=P.x;localStorage.setItem(KEY,JSON.stringify(G))}catch(e){}};
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))}catch(e){return null}};
const fresh=()=>({day:1,ph:'sabah',sc:'oda',x:130,f:{},inv:[],cl:[],seen:{},end:null});
const F=k=>G.f[k],set=(k,v=1)=>{G.f[k]=v},has=i=>G.inv.includes(i),K=c=>G.cl.includes(c);
const give=i=>{if(!has(i)){G.inv.push(i);toast('＋ '+ITEMS[i])}},drop=i=>{G.inv=G.inv.filter(x=>x!=i)};
const R=()=>render();

/* ---------- ses ---------- */
function beep(f,d,v,type='sine',t0=0){if(!AC||mute)return;const t=AC.currentTime+t0,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d)}
const tick=()=>beep(1500+Math.random()*500,.02,.008,'square');
const knock=n=>{for(let i=0;i<n;i++){beep(95,.13,.6,'sine',i*.34);beep(190,.05,.2,'triangle',i*.34)}};
const bell=()=>{beep(880,1.4,.1,'triangle');beep(1320,1,.04,'sine')};
const boom=()=>{beep(55,.9,.6,'sawtooth');beep(41,1.2,.6,'sine')};
const press=()=>{for(let i=0;i<8;i++){beep(120,.06,.2,'square',i*.24);beep(60,.1,.3,'sine',i*.24+.12)}};
function audio(){if(AC)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();[55,55.6,82.4].forEach(f=>{const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;g.gain.value=.02;o.connect(g).connect(AC.destination);o.start()})}catch(e){}}
$('#snd').onclick=e=>{e.stopPropagation();mute=!mute;$('#snd').style.opacity=mute?.35:1;AC&&(mute?AC.suspend():AC.resume())};

/* ---------- metin ---------- */
function say(t,who){return new Promise(r=>{ch.innerHTML='';nar.className='';nar.innerHTML=(who?`<b>${who}</b>`:'')+'<span></span><i class="nx">▾</i>';const sp=nar.querySelector('span');let i=0,done=0;
 const fin=()=>{clearInterval(iv);sp.textContent=t;done=1;nar.classList.add('done')};
 const iv=setInterval(()=>{i+=2;sp.textContent=t.slice(0,i);if(i%6==0)tick();if(i>=t.length)fin()},22);
 tap=()=>{if(!done)fin();else{tap=null;r()}}})}
async function D(a){for(const l of [].concat(a)){if(!l)continue;if(l[0]=='#'){const k=l.slice(1);CL[k]?clue(k):set(k);continue}
 if(l[1]=='|'){const w=WHO[l[0]];await say(l.slice(2),typeof w=='function'?w():w)}else await say(l)}}
function choose(opts){return new Promise(r=>{nar.classList.remove('done');ch.innerHTML='';opts.forEach((o,i)=>{const b=document.createElement('button');b.textContent=(i+1)+' · '+o;b.onclick=()=>{ch.innerHTML='';r(i)};ch.appendChild(b)})})}
function askText(){return new Promise(r=>{ch.innerHTML='<input id="ti" maxlength="48" placeholder="Manşetini yaz…"><button>Kurşuna dök</button>';const go=()=>{const v=$('#ti').value.trim();if(v){ch.innerHTML='';r(v)}};ch.querySelector('button').onclick=go;$('#ti').onkeydown=e=>{e.stopPropagation();e.key=='Enter'&&go()};$('#ti').focus()})}
let tto;function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(tto);tto=setTimeout(()=>e.classList.remove('on'),3200)}
function clue(id){if(!K(id)){G.cl.push(id);toast('✎ Deftere yazıldı: '+CL[id][0]);beep(1200,.15,.05,'triangle')}}
async function talk(n){const t=TALK[n],d=G.day,k=F('_ev')&&t[d+'b']?d+'b':t[d]?d:0,v=t[k];if(typeof v=='function')return v();
 const sk=n+k+'-'+d;if(G.seen[sk])return D(v.filter(l=>l[0]!='#').slice(-1));G.seen[sk]=1;return D(v)}
const shake=()=>{stage.classList.remove('shake');void stage.offsetWidth;stage.classList.add('shake')};

/* ---------- sahne ---------- */
function tint(){const s=SC[G.sc];if(s.inn)return '';return G.ph=='gece'?`<rect width="${s.w}" height="450" fill="#05071a" opacity=".62"/>`:G.ph=='aksam'?`<rect width="${s.w}" height="450" fill="#2a1030" opacity=".3"/>`:''}
function render(){const s=SC[G.sc];SCW=s.w;cur=s.objs().filter(Boolean);near=null;$('#pr').textContent='';
 bg.innerHTML=s.art()+cur.filter(o=>o.npc).map(o=>per(o.x,o.npc)).join('')+tint();
 mks.innerHTML=cur.map((o,i)=>o.auto?'':`<g class="mk" data-i="${i}" transform="translate(${o.x} ${o.y||(o.npc?278:262)})"><circle r="30" fill="transparent"/><path d="M0-8 7 0 0 8-7 0z"/></g>`).join('');
 $('#hat').style.display=G.sc=='oda'?'none':'';$('#hd').textContent=DAYS[G.day-1][0]+' · '+s.name;$('#hg').textContent='◆ '+goal();frame()}
function frame(){cam=clamp(P.x-400,0,SCW-800);svg.setAttribute('viewBox',cam+' 0 800 450');pg.setAttribute('transform',`translate(${P.x} 392) scale(${P.dir} 1)`);
 const a=Math.sin(P.walk)*24;$('#l1').setAttribute('transform',`rotate(${a} -3 -36)`);$('#l2').setAttribute('transform',`rotate(${-a} 4 -36)`)}
async function go(sc,x){const f=$('#fade');f.classList.add('on');await wait(420);G.sc=sc;P.x=x;P.tx=null;P.pend=null;nar.textContent='';render();await wait(140);f.classList.remove('on');await wait(320)}
async function run(fn){if(busy)return;busy=true;P.tx=null;P.pend=null;P.walk=0;$('#pr').textContent='';try{await fn()}catch(e){console.error(e)}
 if(G&&!G.over){nar.textContent='';nar.className='';ch.innerHTML='';render();save()}busy=false}
const act=o=>run(o.act);
async function card(a,b){nar.textContent='';ch.innerHTML='';const c=$('#card');c.querySelector('b').textContent=a;c.querySelector('span').textContent=b;c.classList.add('on');await wait(700);$('#fade').classList.remove('on');render();bell();await wait(1900);c.classList.remove('on');await wait(600)}
async function nextDay(){G.day++;G.ph='sabah';for(const k in G.f)if(k[0]=='_')delete G.f[k];G.sc='oda';P.x=130;P.dir=1;await card(...DAYS[G.day-1]);await INTRO[G.day]()}

function loop(t){const dt=Math.min(.05,(t-lt)/1000);lt=t;
 if(G&&!busy&&!modal){let v=(keys.r?1:0)-(keys.l?1:0);
  if(v){P.tx=null;P.pend=null}else if(P.tx!=null){const d=P.tx-P.x;if(Math.abs(d)<5){P.tx=null;const o=P.pend;P.pend=null;if(o){P.dir=o.x>=P.x?1:-1;act(o)}}else v=Math.sign(d)}
  if(v){P.x=clamp(P.x+v*210*dt,30,SCW-30);P.dir=v;const w0=P.walk;P.walk+=dt*10;if(Math.floor(w0/Math.PI)!=Math.floor(P.walk/Math.PI))beep(62,.05,.05)}else P.walk=0;
  if(!busy){let n=null,bd=64;for(const o of cur){const d=Math.abs(o.x-P.x);if(o.auto){if(d<(o.r||40)){act(o);break}}else if(d<bd){bd=d;n=o}}
   if(!busy&&n!==near){near=n;$('#pr').textContent=n?'E · '+n.label:'';mks.querySelectorAll('.mk').forEach(m=>m.classList.toggle('on',!!n&&cur[+m.dataset.i]===n))}}
 }
 if(G)frame();requestAnimationFrame(loop)}

/* ---------- girdi ---------- */
const walkTo=o=>{P.tx=o.npc?o.x+(P.x<o.x?-40:40):o.x;P.pend=o};
stage.addEventListener('click',e=>{if(tap){tap();return}if(busy||modal||!G)return;const m=e.target.closest('.mk');if(m){walkTo(cur[+m.dataset.i]);return}
 const r=svg.getBoundingClientRect(),wx=cam+(e.clientX-r.left)/r.width*800,o=cur.find(o=>!o.auto&&Math.abs(o.x-wx)<34);if(o)walkTo(o);else{P.tx=clamp(wx,30,SCW-30);P.pend=null}});
nar.addEventListener('click',()=>tap&&tap());
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT')return;const k=e.key.toLowerCase();
 if(k=='arrowleft'||k=='a')keys.l=1;else if(k=='arrowright'||k=='d')keys.r=1;
 else if(k=='e'||k==' '||k=='enter'){e.preventDefault();if(modal)return;if(tap)tap();else if(!busy&&near)act(near)}
 else if(k=='q'||k=='tab'){e.preventDefault();notebook()}
 else if(/^[1-9]$/.test(k)){const b=ch.querySelectorAll('button')[k-1];b&&b.click()}});
addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k=='arrowleft'||k=='a')keys.l=0;if(k=='arrowright'||k=='d')keys.r=0});
addEventListener('blur',()=>{keys={}});

/* ---------- katmanlar ---------- */
function paper(p){return new Promise(r=>{const f=p.f,o=$('#pov');modal++;beep(700,.15,.05,'sawtooth');
 o.innerHTML=`<div class="np${p.old?' old':''}"><div class="mast">GÜNLÜK HAKİKAT</div><div class="dl"><span>${p.d}</span><span>${p.old?'Son baskı':'Tek nüsha'}</span><span>50 Kuruş</span></div><h1>${p.h}</h1><div class="sub">${p.s}</div>
 <div class="cols"><div><svg viewBox="0 0 200 120"><rect width="200" height="120" fill="#8d8571"/><rect y="86" width="200" height="34" fill="#5d5747"/>${[14,34,52,74,96,170,188].map((x,i)=>`<circle cx="${x}" cy="${78+i%3*4}" r="9" fill="#3b372d"/><rect x="${x-9}" y="${86+i%3*4}" width="18" height="34" fill="#3b372d"/>`).join('')}${f?`<g transform="translate(138 114) scale(${f})" fill="#14110c"><ellipse cy="-86" rx="13" ry="3"/><rect x="-8" y="-96" width="16" height="10"/><circle cy="-78" r="7"/><path d="M-12-70h24l5 46h-34z"/><rect x="-9" y="-24" width="7" height="24"/><rect x="2" y="-24" width="7" height="24"/></g>`:''}</svg><div class="cap">${p.c}</div></div><div class="fake"></div></div></div><button>Gazeteyi katla</button>`;
 o.classList.add('on');o.querySelector('button').onclick=()=>{o.classList.remove('on');modal--;r()}})}
function notebook(){const o=$('#nb');if(o.classList.contains('on')){o.classList.remove('on');modal--;return}if(!G||G.over)return;modal++;
 o.innerHTML=`<div class="nbp"><h2>Defter</h2><h3>Şimdi</h3><p>◆ ${goal()}</p><h3>İpuçları · ${G.cl.length}/${Object.keys(CL).length}</h3>${G.cl.map(c=>`<p><b>${CL[c][0]}</b><br>${CL[c][1]}</p>`).join('')||'<p>Henüz bir şey yok.</p>'}<h3>Cepte</h3><p>${['Sarı filtre, kibrit'].concat(G.inv.map(i=>ITEMS[i])).join(' · ')}</p><h3>Nasıl oynanır</h3><p>Yürü: ← → ya da A D, ya da sahnede gitmek istediğin yere dokun.<br>Etkileşim: E ya da sarı işarete dokun. Metni geç: Boşluk ya da dokun.<br>Defter: Q. Oyun her adımda kendiliğinden kaydedilir.</p></div><button>Defteri kapat</button>`;
 o.classList.add('on');o.querySelector('button').onclick=notebook}
$('#bn').onclick=e=>{e.stopPropagation();notebook()};
function typeset(text){return new Promise(r=>{modal++;const words=text.split(/\s+/),o=$('#ts');let i=0;
 const sh=words.map((w,k)=>[w,k,Math.random()]).sort((a,b)=>a[2]-b[2]);
 o.innerHTML=`<p>Kurşun harfler tersten dizilir. Kelimeleri sırasıyla kalıba yerleştir.</p><div class="forme" id="fo"></div><div class="tiles">${sh.map(t=>`<button data-k="${t[1]}"><span>${t[0]}</span></button>`).join('')}</div>`;
 o.classList.add('on');o.querySelectorAll('.tiles button').forEach(b=>b.onclick=()=>{if(words[i]===words[+b.dataset.k]){b.style.visibility='hidden';$('#fo').insertAdjacentHTML('beforeend',`<span>${words[i]}</span>`);beep(240,.07,.3,'square');i++;
  if(i==words.length){$('#fo').classList.add('print');press();setTimeout(()=>{o.classList.remove('on');modal--;r()},2400)}}else{beep(90,.2,.3,'sawtooth');b.classList.remove('no');void b.offsetWidth;b.classList.add('no')}})})}
function ending(name,line){G.over=1;try{localStorage.removeItem(KEY)}catch(e){}const e=$('#end');
 e.innerHTML=`<small>SON</small><h2>${name}</h2><p>${line}</p><p class="dim">Bulduğun ipuçları: ${G.cl.length}/${Object.keys(CL).length}. Beş sondan biri. Son manşeti başka türlü dizmek istersen:</p><button id="again">Baştan oyna</button>`;e.classList.add('on');$('#again').onclick=()=>{e.classList.remove('on');begin(fresh())}}

/* ---------- başlangıç ---------- */
async function begin(g){G=g;P.x=G.x;P.tx=null;modal=0;$('#title').classList.remove('on');audio();
 if(G.day==1&&G.ph=='sabah'&&!F('_perde')){busy=true;await card(...DAYS[0]);busy=false;run(INTRO[1])}else{render();busy=false}}
$('#new').onclick=()=>begin(fresh());
const sv=load();if(sv&&sv.day&&!sv.over){$('#cont').hidden=false;$('#cont').textContent='Devam et · '+DAYS[sv.day-1][0];$('#cont').onclick=()=>begin(sv)}
requestAnimationFrame(loop);
// tıklanan düğmede odak kalmasın: Boşluk tuşu düğmeyi yeniden tetiklemesin
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');b&&b.blur()});
