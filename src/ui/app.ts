// @ts-nocheck
// 画面（試作品から移したもの）。エンジンは src/game/、数値は src/data/ に分けてある。
// 画面を作り直すときに型を付けていく
import { N, FRAME_MS, MAX_SLIP, STRIPS, BITA_IDX, LINES, LINE_NAMES as LINE_N, SPIN_UP_MS } from '../data/reels';
import { mod, makeReel, posAt, symAt, lineWins, bonusLines, pressL, atFullSpeed } from '../game/reels';
import { MACH, PAY, BITA_OK, BITA_NG, REG_G, REG_PAY, BIG_G, AT_G, AT_ADD, DOOR_WIN, DOOR_LOSE, ZEN_G, CEIL } from '../data/machines';
import { roll, atRoll, pickSetting, isEvent } from '../game/machines';
import { HOMES, HALLS, FOODS, PLAYS, ITEMS } from '../data/life';
import { dailyEffects, arrangePlaced } from '../game/life';
import { CURRENT_BUILD, buildLabel, fetchLatestBuild, reloadToLatest } from '../version';
import { loadSymbols, drawSymImage } from './symbols';
import { DEV_PASSWORD, DEV_TAPS, DEV_TAP_MS, DEV_MAX_MONEY } from '../data/dev';
import { ROOM_IMAGES, SLOT_OF, SLOTS, PLAYER_SPOT, PLAYER_IMAGE, PLAYER_ASPECT, FURNITURE_IMAGES, FURNITURE_ASPECT, HIT_SAMPLE_W, HIT_ALPHA, PLACEHOLDER_SCALE, ROOM_ASPECT } from '../data/room';
import { AUTO_GAMES, HIST_MAX, LCD_MS, LCD_BUSY_MS, LCD_SMALL_MS, LCD_GOLD } from '../data/ui';
import { setTabbar, pagesHTML, bindPages, openSheet } from './widgets';

export function startApp(){


function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}

/* ---------- reels ---------- */
let cv=null,rc=null,reels=[],RW=90,RH=54,PAD=8,GAP=8,dpr=1;
function layout(){
  if(!cv||!document.body.contains(cv))return;
  const n=reels.length||1,cw=Math.min(428,(cv.parentElement&&cv.parentElement.clientWidth)||360);
  RW=Math.min(n===1?130:999,(cw-2*PAD-(n-1)*GAP)/n);RH=Math.max(44,Math.round(RW*.6));
  const W=n*RW+(n-1)*GAP+2*PAD,H=3*RH+2*PAD;dpr=Math.min(3,window.devicePixelRatio||1);
  cv.style.width=W+'px';cv.style.height=H+'px';cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
}
window.addEventListener('resize',layout);
function evTime(e){const n=performance.now(),t=e&&e.timeStamp;return (t&&t<=n+5&&t>n-1000)?t:n}


const ACH=[
  {id:'first',n:'初当たり',d:'初めてボーナスを引く',r:'¥3,000',give:()=>{S.money+=3000}},
  {id:'ceil',n:'天井到達',d:'天井まで回してボーナスを引く',r:'¥10,000',give:()=>{S.money+=10000}},
  {id:'hyena',n:'ハイエナ',d:'400G以上ハマった台に座り、天井より前に当てる',r:'ホールで天井が近い台に印が付く'},
  {id:'bita10',n:'ビタ職人',d:'BIG中のビタ押しを10連続で成功',r:'BIG中のビタ成功が+2枚'},
  {id:'win50',n:'大勝ち',d:'1日で+5万円以上勝つ',r:'娯楽+20',give:()=>{S.fun=clamp(S.fun+20)}},
  {id:'ticket1',n:'一番乗り',d:'イベント日の整理券で1番を引く',r:'¥5,000',give:()=>{S.money+=5000}},
  {id:'six',n:'設定6をつかむ',d:'イベント日に設定6の台を打つ',r:'¥20,000',give:()=>{S.money+=20000}},
  {id:'job',n:'検品のプロ',d:'バイトをノーミスで終える',r:'バイト代が1割増える'},
  {id:'house',n:'ボロアパートから一戸建て',d:'一戸建てに住む',r:'寝た時の体調回復+5'},
  {id:'tower',n:'成金',d:'タワマン最上階に住む',r:'称号のみ'},
  {id:'banned',n:'前科者',d:'改造基盤が店員に見つかる',r:'称号のみ'}
];
const has=id=>!!(S.ach&&S.ach[id]);
function grant(id){if(has(id))return;const a=ACH.find(x=>x.id===id);S.ach[id]=S.day;S.title=a.n;if(a.give)a.give();save();setTimeout(()=>{cutin('実績 '+a.n);toast('実績「'+a.n+'」　'+a.r)},300)}
// 画像が読み込めていればそれを描き、まだなら手描きの図柄。glow はリール上でボーナス図柄を光らせる
function drawSym(c,k,x,y,w,h,glow=false){
  if(drawSymImage(c,k,x,y,w,h,glow))return;
  const big=k==='R7'||k==='B7'||k==='BAR';
  if(!big){x+=w*.17;y+=h*.12;w*=.66;h*=.76}
  const cx=x+w/2,cy=y+h/2;
  c.save();c.lineJoin='round';
  if(k==='R7'||k==='B7'){
    c.translate(cx,cy+h*.05);c.scale(1.55,1);c.font=`${h*.92}px "Dela Gothic One",sans-serif`;c.textAlign='center';c.textBaseline='middle';
    c.lineWidth=h*.13;c.strokeStyle='#15101f';c.strokeText('7',0,0);c.lineWidth=h*.06;c.strokeStyle='#ffffff';c.strokeText('7',0,0);
    c.fillStyle=k==='R7'?'#e3203f':'#2a6fe0';c.fillText('7',0,0);
  }else if(k==='BAR'){
    const bw=w*.94,bh=h*.64,top=cy-bh/2,L=cx-bw/2,rad=bh*.22;
    rr(c,L,top,bw,bh,rad);c.fillStyle='#15101f';c.fill();
    const gg=c.createLinearGradient(0,top,0,top+bh);gg.addColorStop(0,'#fff1a8');gg.addColorStop(.5,'#ffcf4a');gg.addColorStop(1,'#b8860b');
    rr(c,L+h*.03,top+h*.03,bw-h*.06,bh-h*.06,rad*.85);c.fillStyle=gg;c.fill();
    rr(c,L+h*.08,top+h*.08,bw-h*.16,bh-h*.16,rad*.6);c.fillStyle='#0d0a12';c.fill();
    c.fillStyle=gg;c.fillRect(L+h*.13,top+h*.12,bw-h*.26,Math.max(1,h*.025));c.fillRect(L+h*.13,top+bh-h*.12-Math.max(1,h*.025),bw-h*.26,Math.max(1,h*.025));
    c.save();c.translate(cx,cy+bh*.03);c.scale(1.3,1);c.font=`${bh*.5}px "Dela Gothic One",sans-serif`;c.textAlign='center';c.textBaseline='middle';
    c.lineWidth=bh*.08;c.strokeStyle='#15101f';c.strokeText('BAR',0,0);c.fillStyle=gg;c.fillText('BAR',0,0);c.restore();
  }else if(k==='BL'){
    const b=h*.4;c.fillStyle='#f0b400';c.strokeStyle='#15101f';c.lineWidth=h*.06;
    c.beginPath();c.moveTo(cx-b*.95,cy+b*.7);c.quadraticCurveTo(cx-b*.6,cy+b*.45,cx-b*.62,cy);c.quadraticCurveTo(cx-b*.6,cy-b*.95,cx,cy-b*.98);c.quadraticCurveTo(cx+b*.6,cy-b*.95,cx+b*.62,cy);c.quadraticCurveTo(cx+b*.6,cy+b*.45,cx+b*.95,cy+b*.7);c.closePath();c.fill();c.stroke();
    c.beginPath();c.arc(cx,cy+b*.82,b*.18,0,7);c.fill();c.stroke();c.fillStyle='#fff3b0';c.fillRect(cx-b*.38,cy-b*.6,b*.14,b*.8);
  }else if(k==='WM'){
    const R=Math.min(h*.46,w*.42);c.beginPath();c.moveTo(cx-R,cy-R*.2);c.arc(cx,cy-R*.2,R,0,Math.PI);c.closePath();
    c.fillStyle='#2f9e44';c.fill();c.lineWidth=h*.06;c.strokeStyle='#15101f';c.stroke();
    c.beginPath();c.moveTo(cx-R*.8,cy-R*.2);c.arc(cx,cy-R*.2,R*.8,0,Math.PI);c.closePath();c.fillStyle='#e8344e';c.fill();
    c.fillStyle='#15101f';for(const [a,b] of [[-.4,.2],[0,.35],[.4,.2],[-.15,.55],[.2,.55]]){c.beginPath();c.ellipse(cx+a*R,cy-R*.2+b*R,R*.06,R*.1,0,0,7);c.fill()}
  }else if(k==='CH'){
    const R=h*.19;c.strokeStyle='#2f7a3a';c.lineWidth=h*.06;
    c.beginPath();c.moveTo(cx-R*1.2,cy+R*.6);c.quadraticCurveTo(cx-R*.4,cy-R*1.6,cx+R*.6,cy-R*2);c.moveTo(cx+R*1.3,cy+R*.3);c.quadraticCurveTo(cx+R*1.1,cy-R*1.4,cx+R*.6,cy-R*2);c.stroke();
    for(const [a,b] of [[-1.2,.9],[1.3,.6]]){c.beginPath();c.arc(cx+a*R,cy+b*R,R,0,7);c.fillStyle='#d61f3c';c.fill();c.lineWidth=h*.05;c.strokeStyle='#15101f';c.stroke();c.fillStyle='#ffd0d8';c.beginPath();c.arc(cx+a*R-R*.35,cy+b*R-R*.35,R*.25,0,7);c.fill()}
  }else if(k==='RP'){
    c.fillStyle='#1f5fd1';c.textAlign='center';c.textBaseline='middle';c.font=`${h*.3}px "Dela Gothic One",sans-serif`;c.fillText('RE',cx,cy-h*.17);c.fillText('PLAY',cx,cy+h*.18);
  }
  c.restore();
}
function drawReels(now){
  if(!rc)return;const c=rc;c.setTransform(dpr,0,0,dpr,0,0);
  const W=cv.width/dpr,H=cv.height/dpr;c.fillStyle='#15101f';c.fillRect(0,0,W,H);
  reels.forEach((r,n)=>{
    const x=PAD+n*(RW+GAP),y0=PAD,cy=y0+1.5*RH,p=posAt(r,now);
    c.save();rr(c,x,y0,RW,3*RH,6);c.clip();c.fillStyle='#f4efe2';c.fillRect(x,y0,RW,3*RH);
    for(let i=Math.floor(p)-2;i<=Math.ceil(p)+2;i++){const yc=cy+(p-i)*RH;drawSym(c,r.strip[mod(i)],x,yc-RH/2,RW,RH,true)}
    const g=c.createLinearGradient(0,y0,0,y0+3*RH);g.addColorStop(0,'rgba(21,16,31,.45)');g.addColorStop(.22,'rgba(21,16,31,0)');g.addColorStop(.78,'rgba(21,16,31,0)');g.addColorStop(1,'rgba(21,16,31,.45)');
    c.fillStyle=g;c.fillRect(x,y0,RW,3*RH);c.restore();
    if(r.noSlip){c.strokeStyle='#ff3b6b';c.lineWidth=3;rr(c,x-1,y0-1,RW+2,3*RH+2,7);c.stroke()}
  });
  if(P&&P.mode==='big'){const x=PAD;c.fillStyle='rgba(21,16,31,.55)';for(const n of [1,2])c.fillRect(PAD+n*(RW+GAP),PAD,RW,3*RH);c.strokeStyle='#ffcf4a';c.lineWidth=3;rr(c,x-1,PAD-1,RW+2,3*RH+2,7);c.stroke();
    c.strokeStyle='rgba(255,207,74,.9)';c.lineWidth=2;c.strokeRect(x+2,PAD+1,RW-4,3*RH-2);c.fillStyle='#ffcf4a';c.font='bold 9px sans-serif';c.textAlign='left';c.fillText('7',x+4,PAD+10);c.fillText('R',x+4,PAD+RH+10);c.fillText('7',x+4,PAD+2*RH+10);
    const fl=P.flashT?1-(now-P.flashT)/450:0;if(fl>0){c.fillStyle=`rgba(255,250,220,${fl*.85})`;c.fillRect(x,PAD,RW,3*RH)}}
  const rowY=row=>PAD+(row+.5)*RH,colX=n=>PAD+n*(RW+GAP)+RW/2;
  c.fillStyle='#ff3b6b';c.font='bold 9px sans-serif';c.textAlign='center';c.textBaseline='middle';
  [[0,'1'],[1,'2'],[2,'3']].forEach(([row,t])=>{c.fillText(t,PAD/2,rowY(row));c.fillText(t,W-PAD/2,rowY(row))});
  if(P&&P.wins&&P.wins.length){c.lineWidth=4;c.lineCap='round';
    for(const w of P.wins){const L=LINES[w.n];c.strokeStyle='rgba(255,207,74,.85)';c.beginPath();L.forEach((row,n)=>{const X=colX(n),Y=rowY(row);n?c.lineTo(X,Y):c.moveTo(X-RW/2,Y)});c.lineTo(colX(2)+RW/2,rowY(L[2]));c.stroke()}}
}
function drawStripTable(cv2){
  const c=cv2.getContext('2d'),cw=44,ch=24;cv2.width=cw*3*2+40;cv2.height=ch*21*2;c.scale(2,2);
  c.fillStyle='#15101f';c.fillRect(0,0,cw*3+20,ch*21);
  for(let row=0;row<21;row++){const idx=20-row;c.fillStyle='#a29cba';c.font='9px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(String(idx+1),10,row*ch+ch/2);
    for(let n=0;n<3;n++){const x=20+n*cw;c.fillStyle=row%2?'#f4efe2':'#ebe4d3';c.fillRect(x,row*ch,cw-2,ch);drawSym(c,STRIPS[n][idx],x,row*ch,cw-2,ch)}}
}


const $=s=>document.querySelector(s);
const yen=n=>(n<0?'−':'')+'¥'+Math.abs(Math.round(n)).toLocaleString('ja-JP');
const clamp=v=>Math.max(0,Math.min(100,Math.round(v)));
const KEY='meoshi-narikin-v1';
function fresh(){return {tot:{sum:0,n:0,win:0,lose:0,best:0},halls:{},ach:{},title:'',bitaRun:0,upg:{eye:0,data:0,body:0},drops:0,dropDay:0,kiban:0,ban:{},conv:0,day:1,money:30000,hun:70,fun:50,hp:80,home:0,inv:{},placed:[{id:'futon'}],phase:'morning',peak:30000,hist:[],play:null}}
let S=fresh(),remote=null,saving=false,dirty=false;
try{const v=JSON.parse(localStorage.getItem(KEY));if(v&&v.day)S=v}catch(e){}
function norm(){const f=fresh();delete S.floor;if(!Array.isArray(S.placed))S.placed=f.placed;if(!S.inv||typeof S.inv!=='object')S.inv={};for(const k of ['halls','upg','drops','dropDay','kiban','ban','conv','ach','title','bitaRun','peak'])if(S[k]===undefined)S[k]=f[k];
  // 家具は1種類1つまで（仕様書 7.2）。前の版で複数持っていたら1つにまとめる（置いてあればそれを残す）
  // 置き場所が決まる形（仕様書 9.8）なので、同じ置き場所の寝具は一番良いものを残し、ほかは持ち物へ。マス目の位置は使わない
  {const r=arrangePlaced(S.placed.filter(p=>p&&ITEMS[p.id]),SLOT_OF),on=new Set(r.placed.map(p=>p.id));S.placed=r.placed;
   for(const id in S.inv)S.inv[id]=on.has(id)?0:Math.min(1,S.inv[id]||0);for(const id of r.back)S.inv[id]=1}
  // 通算の収支がない古いセーブは、残っている記録から作る
  if(!S.tot){const h=S.hist||[];S.tot={sum:h.reduce((a,x)=>a+x.v,0),n:h.length,win:h.filter(x=>x.v>0).length,lose:h.filter(x=>x.v<0).length,best:h.length?Math.max(0,...h.map(x=>x.v)):0}}}norm();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}pushRemote()}
async function pushRemote(){if(!remote)return;if(saving){dirty=true;return}saving=true;try{await remote.set(JSON.parse(JSON.stringify(S)))}catch(e){}saving=false;if(dirty){dirty=false;pushRemote()}}
let toastT,quietBuy=false;function toast(m){if(quietBuy)return;const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,1900)}
function cutin(t){if(quietBuy)return;if(P&&$('#lcdMsg')){say(t,'','hot');return}const el=document.createElement('div');el.className='cut';el.textContent=t;document.body.appendChild(el);setTimeout(()=>el.remove(),1050)}

/* ---------- sound ---------- */
let ac=null,soundOn=false;
function tone(f,d,type='square',v=.08,slide=1){if(!soundOn||!ac)return;const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide!==1)o.frequency.exponentialRampToValueAtTime(f*slide,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+d+.02)}
const SND={lever:()=>tone(180,.08,'square',.1,.6),stop:()=>tone(95,.05,'square',.14),bita:()=>{tone(1320,.12,'triangle',.12);setTimeout(()=>tone(1760,.18,'triangle',.12),70)},pay:()=>tone(880,.06,'square',.06),miss:()=>tone(140,.15,'triangle',.08,.7),fan:()=>[523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>tone(f,.16,'square',.09),i*90)),coin:()=>tone(1500,.05,'triangle',.07)};
$('#snd').onclick=()=>{soundOn=!soundOn;if(soundOn&&!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){soundOn=false}}if(ac&&ac.state==='suspended')ac.resume();$('#snd').textContent=soundOn?'音 ON':'音 OFF';SND.stop()};

/* ---------- status ---------- */
// ゲージの横の丸いアイコン（お腹＝ナイフとフォーク、娯楽＝ゲームのコントローラー、体調＝ハート）
const MICON={hun:'<path d="M8 3v7a2 2 0 0 1-1.5 1.9V21h-2v-9.1A2 2 0 0 1 3 10V3h1.2v5h1V3h1.2v5h1V3zM16 3c2 0 3 2.5 3 6s-1 4-2 4.3V21h-2V3z"/>',fun:'<path d="M7 7h10a5 5 0 0 1 4.8 6.4l-1 3.3a2.6 2.6 0 0 1-4.4 1L14.8 16H9.2l-1.6 1.7a2.6 2.6 0 0 1-4.4-1l-1-3.3A5 5 0 0 1 7 7zm0 3v1.5H5.5v1.5H7v1.5h1.5V13H10v-1.5H8.5V10zm8.5.3a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm2 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>',hp:'<path d="M12 20.5 4.2 12.9A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 7.8 6.3z"/>'};
function meterHTML(k,n,col){const v=S[k];return `<div class="mt ${v<25?'low':''}"><i class="mi" style="--c:${col}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">${MICON[k]}</svg></i><div class="mtb"><div class="r"><span>${n}</span><b>${v}%</b></div><div class="bar"><i style="width:${v}%;background:${col}"></i></div></div></div>`}
function status(){
  $('#status').innerHTML=`<div class="moneybox"><i class="coin" aria-hidden="true"></i><span class="lbl">所持金</span><span class="cash${yen(S.money).length>13?' xlong':yen(S.money).length>9?' long':''}">${yen(S.money)}</span></div>
  <div class="daybox"><b>${S.day}日目</b><span>${S.phase==='morning'?'朝':'夜'}</span></div>
  <span class="day">${isEvent(S.day)?'<em>イベント日</em>　':''}${HOMES[S.home].n}${S.title?'　「'+S.title+'」':''}</span>
  <div class="meters">${meterHTML('hun','お腹','var(--hun)')}${meterHTML('fun','娯楽','var(--fun)')}${meterHTML('hp','体調','var(--hp)')}</div>`;
}
function apply(e){for(const [k,v] of Object.entries(e))S[k]=clamp(S[k]+v)}
function spend(p){if(S.money<p){toast('お金が足りません');return false}S.money-=p;return true}

/* ---------- pixel art ---------- */
function R(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h)}
function drawItem(c,id,x,y){
  const r=(a,b,w,h,col)=>R(c,x+a,y+b,w,h,col);
  if(id==='futon'){r(1,3,14,11,'#e8e3d6');r(1,7,14,7,'#5b7fc9');r(2,4,5,3,'#ffffff')}
  else if(id==='bed'){r(0,2,16,13,'#8a5a34');r(1,3,14,11,'#f2efe6');r(1,7,14,7,'#e86a8a');r(2,4,5,2,'#ffffff')}
  else if(id==='lbed'){r(0,1,16,14,'#c9a227');r(1,2,14,12,'#fffaf0');r(1,7,14,7,'#7a2a6e');r(2,3,5,3,'#ffffff');r(9,3,5,3,'#ffffff')}
  else if(id==='tv'){r(2,3,12,9,'#15101f');r(3,4,10,7,'#3fd9ff');r(6,12,4,2,'#3b3460');r(4,5,3,2,'#bff4ff')}
  else if(id==='bigtv'){r(0,2,16,11,'#15101f');r(1,3,14,9,'#5ab0ff');r(3,4,4,3,'#d6efff');r(5,13,6,2,'#3b3460')}
  else if(id==='game'){r(2,7,12,6,'#2c2c3a');r(3,8,4,3,'#ff3b6b');r(10,9,2,2,'#7dffa0');r(5,3,6,4,'#c9c3da')}
  else if(id==='shelf'){r(1,1,14,14,'#8a5a34');for(let i=0;i<3;i++){r(2,2+i*4,12,3,'#5a3a1a');for(let k=0;k<5;k++)r(3+k*2,2+i*4,1,3,['#e3203f','#ffcf4a','#3fd9ff','#7dffa0','#c38bff'][(k+i)%5])}}
  else if(id==='plant'){r(5,10,6,5,'#b5533c');r(4,3,8,7,'#2f9e44');r(2,5,4,4,'#3fbf5a');r(10,4,4,4,'#3fbf5a');r(7,1,2,3,'#2f9e44')}
  else if(id==='fridge'){r(3,0,10,16,'#e6edf7');r(3,6,10,1,'#9aa5b8');r(11,2,1,3,'#9aa5b8');r(11,8,1,4,'#9aa5b8')}
  else if(id==='sofa'){r(0,4,16,10,'#b53232');r(2,3,12,6,'#d64545');r(0,7,3,7,'#8a2222');r(13,7,3,7,'#8a2222')}
  else if(id==='tank'){r(1,3,14,11,'#9cc8e8');r(1,3,14,2,'#e6f4ff');r(4,7,3,2,'#ff9a3c');r(9,10,3,2,'#ffcf4a');r(2,12,12,2,'#c9b37a');r(1,14,14,2,'#3b3460')}
  else if(id==='mchair'){r(3,1,10,14,'#2c2c3a');r(4,2,8,6,'#45425a');r(1,8,3,6,'#2c2c3a');r(12,8,3,6,'#2c2c3a');r(5,9,6,4,'#5a5878')}
}
function drawMachine(c,m){
  R(c,0,0,31,42,'#2a2445');R(c,1,1,29,40,m.col);R(c,3,3,25,5,'#15101f');
  c.fillStyle='#ffcf4a';c.font='5px "DotGothic16",monospace';c.textAlign='center';c.fillText(m.n,15.5,7.5);
  R(c,3,10,25,12,'#f4efe2');for(let i=0;i<3;i++)R(c,4+i*8,11,7,10,'#ffffff');
  R(c,5,14,5,4,'#e3203f');R(c,13,14,5,4,'#e3203f');R(c,21,14,5,4,'#e3203f');
  R(c,3,24,25,6,'#15101f');for(let i=0;i<3;i++)R(c,6+i*8,26,4,3,'#ffcf4a');R(c,26,22,3,3,'#ff3b6b');
  R(c,3,32,25,8,'#45425a');R(c,6,34,19,4,'#c9c3da');
}

/* ---------- room ---------- */
function placedCount(id){return S.placed.filter(p=>p.id===id).length}
// 家具は1種類1つまで（仕様書 7.2）
function ownF(id){return placedCount(id)+(S.inv[id]||0)>0}
function renderHome(){
  stopReelsLoop();status();
  const H=HOMES[S.home],inv=Object.entries(S.inv).filter(([,n])=>n>0);
  const ev=dailyEffects(S.placed,S.home,has('house')?5:0);
  $('#view').innerHTML=`${updNote()}
    <p class="sub">${isEvent(S.day)?'<b style="color:var(--neon)">今日は7のつく日。</b>どの店も設定が入りやすいが、整理券の抽選がある':`次のイベント日（7のつく日）まで あと${(17-S.day%10)%10||10}日`}</p>
    ${roomHTML()}
    ${inv.length?`<div class="ch">持ち物（タップで部屋に置く）</div><div class="inv">${inv.map(([id])=>{const sw=S.placed.find(p=>p.id!==id&&(SLOT_OF[p.id]||p.id)===(SLOT_OF[id]||id));return `<button class="chip" type="button" data-a="putF" data-id="${id}"${sw?` aria-label="${ITEMS[id].n}（${ITEMS[sw.id].n}と入れ替え）"`:''}>${FURNITURE_IMAGES.includes(id)?`<img src="${import.meta.env.BASE_URL}furniture/${id}.webp" alt="">`:`<canvas width="16" height="16" data-icon="${id}"></canvas>`}${ITEMS[id].n}</button>`}).join('')}</div>`:''}
    <p class="sub">${S.placed.length?'置いた家具をタップすると片付けます。':'家具は「買い物」で買えます。'}同じ場所を使う寝具とテレビは1つずつ置けます。</p>
    <p class="sub">寝ると 体調+${ev.sleep}${ev.fun?` 娯楽+${ev.fun}`:''}${ev.hp?` 体調+${ev.hp}`:''}${ev.keep?` お腹の減り−${ev.keep}`:''}${H.rent?`、家賃 ${yen(H.rent)}`:''}</p>
    <button class="cta" type="button" data-a="halls" ${S.phase!=='morning'?'disabled':''}><span class="cta-ic" aria-hidden="true"><b>7</b><b>7</b><b>7</b></span><span class="cta-t"><b>パチ屋へ行く</b><span>${S.phase==='morning'?'閉店まで打てる。1日1回':'今日はもう出かけた'}</span></span><span class="cta-go" aria-hidden="true">»</span></button>
    <div class="grid2">
      <button class="tile" type="button" data-a="job" ${S.phase!=='morning'?'disabled':''}><svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M3 8.5 12 4l9 4.5v9L12 22l-9-4.5zm9 2.2 6.6-3.3L12 4.1 5.4 7.4zm-7 6 6 3V12L5 9z"/></svg><b>日雇いバイト</b></button>
      <button class="tile" type="button" data-a="sleep"><svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M2 19V6h2v8h7V9h7a4 4 0 0 1 4 4v6h-2v-2H4v2zm5-6a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg><b>寝る</b></button>
    </div>
    <p class="sub">ごはん・家具・不動産は下の「買い物」、自己投資・収支・実績・設定は「自分」から。</p>
    <p class="sub">ゲーム内のお金だけを扱います。現実のお金や景品には換わりません。</p>`;
  tabs('home');
  document.querySelectorAll('[data-icon]').forEach(cv=>drawItem(cv.getContext('2d'),cv.dataset.icon,0,0));
}
// 部屋：家ごとの背景の絵に、家具を決まった場所に重ねる（奥から手前の順）
function roomHTML(){
  const base=import.meta.env.BASE_URL,items=S.placed.map(p=>p.id).filter(id=>SLOTS[SLOT_OF[id]||id]);
  // 絵のない家具の仮のドット絵は正方形で背が高くなるので、小さめに置いて重なりを避ける
  const pos=(s,k=1)=>`left:${s.x-s.w*k/2}%;bottom:${100-s.y}%;width:${s.w*k}%`;
  const furn=id=>`<button type="button" class="furn" data-a="takeF" data-id="${id}" style="${pos(SLOTS[SLOT_OF[id]||id],FURNITURE_IMAGES.includes(id)?1:PLACEHOLDER_SCALE)}${FURNITURE_IMAGES.includes(id)?`;aspect-ratio:1/${FURNITURE_ASPECT[id]}`:''}" aria-label="${ITEMS[id].n}（タップで片付け）">${FURNITURE_IMAGES.includes(id)?`<img src="${base}furniture/${id}.webp" alt="">`:`<canvas width="16" height="16" data-icon="${id}"></canvas>`}</button>`;
  // 主人公も家具と一緒に奥から順に並べ、手前の家具（ソファなど）の後ろに立てるようにする。y が同じ家具とは主人公が手前になる
  const list=[...items.map(id=>({y:SLOTS[SLOT_OF[id]||id].y,h:furn(id)})),{y:PLAYER_SPOT.y,h:`<img class="pc" src="${base}rooms/${PLAYER_IMAGE}" alt="" style="${pos(PLAYER_SPOT)};aspect-ratio:1/${PLAYER_ASPECT}">`}].sort((a,b)=>a.y-b.y);
  return `<div class="room anime" id="room" role="group" aria-label="部屋（${HOMES[S.home].n}）" style="--room:url(${base}rooms/${ROOM_IMAGES[S.home]});aspect-ratio:${ROOM_ASPECT}">
    ${list.map(e=>e.h).join('')}</div>`}
// 家具の絵の透明度（押したところに絵があるか調べる用）。読み込めていない絵は四角の範囲で判定する
const furnAlpha={};
function alphaOf(img){const k=img.currentSrc||img.src;if(furnAlpha[k]!==undefined)return furnAlpha[k];
  if(!img.complete||!img.naturalWidth)return null;
  try{const w=Math.min(HIT_SAMPLE_W,img.naturalWidth),h=Math.round(img.naturalHeight*w/img.naturalWidth),c=document.createElement('canvas');c.width=w;c.height=h;
    const g=c.getContext('2d');g.drawImage(img,0,0,w,h);furnAlpha[k]={w,h,d:g.getImageData(0,0,w,h).data}}catch(e){furnAlpha[k]=null}
  return furnAlpha[k]}
// 手前から順に調べる。主人公の絵に当たったら、その後ろの家具は片付けない（主人公より手前の家具は片付けられる）
function furnAt(x,y){const list=[...document.querySelectorAll('#room .furn,#room .pc')].reverse();
  for(const el of list){const r=el.getBoundingClientRect();if(x<r.left||x>r.right||y<r.top||y>r.bottom)continue;
    const pc=el.classList.contains('pc'),img=pc?el:el.querySelector('img'),a=img&&alphaOf(img);if(!a){if(pc)continue;return el.dataset.id}
    const px=Math.min(a.w-1,Math.floor((x-r.left)/r.width*a.w)),py=Math.min(a.h-1,Math.floor((y-r.top)/r.height*a.h));
    if(a.d[(py*a.w+px)*4+3]>HIT_ALPHA)return pc?null:el.dataset.id}
  return null}
// 家具を置く・片付ける。同じ置き場所の家具（寝具・テレビ）があれば入れ替える
function putF(id){if(!(S.inv[id]>0))return;const slot=SLOT_OF[id]||id;
  for(const p of S.placed.filter(q=>(SLOT_OF[q.id]||q.id)===slot)){S.inv[p.id]=(S.inv[p.id]||0)+1}
  S.placed=S.placed.filter(q=>(SLOT_OF[q.id]||q.id)!==slot);S.inv[id]--;S.placed.push({id});save();SND.coin();renderHome()}
function takeF(id){const at=S.placed.findIndex(p=>p.id===id);if(at<0)return;S.placed.splice(at,1);S.inv[id]=(S.inv[id]||0)+1;save();renderHome();toast(ITEMS[id].n+'を片付けた')}
// 買い物と自分の画面は、上のタブと横スワイプでページを切り替える（仕様書 9.4）
let shopTab='food',meTab='self';
// 買い物はどれも、押すと「購入しますか？」の確認を出し、買ったら「購入しました」と結果を見せる（仕様書 9.4）
const buyInfo={};let buySeq=0;
function buyCard(o){const off=o.disabled||S.money<o.price,k='b'+(++buySeq);buyInfo[k]=o;
  return `<button class="cmd" type="button" data-a="ask" data-k="${k}" ${off?'disabled':''}><b>${o.name}</b><span>${o.desc}</span><span class="p">${o.ptext||yen(o.price)}${!o.disabled&&S.money<o.price?'　<em class="short">お金が足りない</em>':''}</span></button>`}
// 買う前と後でゲージが変わったものを「お腹 70 → 100」の形で見せる
function gaugeDiff(g0){const N={hun:'お腹',fun:'娯楽',hp:'体調'},rows=Object.keys(N).filter(k=>S[k]!==g0[k]);
  return rows.length?`<div class="res">${rows.map(k=>`<span>${N[k]}</span><b class="${S[k]>g0[k]?'pos':'neg'}">${g0[k]} → ${S[k]}</b>`).join('')}</div>`:''}
function askBuy(k){const o=buyInfo[k];if(!o)return;
  const verb=o.verb||'購入';
  openSheet({title:o.name,body:`<p>${o.desc}</p>${o.ptext&&o.ptext!==yen(o.price)?`<p class="cond">${o.ptext}</p>`:''}<div class="res"><span>支払う金額</span><b>${yen(o.price)}</b><span>今の所持金</span><b>${yen(S.money)}</b><span>${verb}後の所持金</span><b class="${S.money-o.price<0?'neg':''}">${yen(S.money-o.price)}</b></div>`,
    yes:o.yesText||`${verb}する`,no:'やめる',onYes:()=>{
      const before=S.money,g0={hun:S.hun,fun:S.fun,hp:S.hp},el=document.createElement('button');o.data.replace(/data-(\w+)="([^"]*)"/g,(_,a,v)=>{el.dataset[a]=v});
      quietBuy=true;try{act(o.a,el)}finally{quietBuy=false}
      if(S.money>=before)return;
      const gd=gaugeDiff(g0);
      openSheet({title:o.doneTitle||`${verb}しました`,ok:true,body:`<p class="done-name">${o.doneName||o.name}</p>${o.after?`<p>${o.after}</p>`:''}${gd||(o.food?'<p>ゲージはもう満タンだった。</p>':'')}<div class="res"><span>支払い</span><b class="neg">−${yen(before-S.money)}</b><span>残りの所持金</span><b>${yen(S.money)}</b></div>`,yes:'OK'});
    }})}
function foodPage(list,act){return `<div class="grid2">${list.map(x=>buyCard({a:act,data:`data-id="${x.id}"`,name:x.n,desc:effText(x.e),price:x.p,food:true})).join('')}</div>`}
function effText(e){const N={hun:'お腹',fun:'娯楽',hp:'体調'};return Object.entries(e).map(([k,v])=>`${N[k]}${v>0?'+':''}${v}`).join(' ')}
function furnPage(){return `<div class="grid2">${Object.entries(ITEMS).filter(([,i])=>i.p>0).map(([id,it])=>buyCard({a:'buyF',data:`data-id="${id}"`,name:it.n,desc:it.d,price:it.p,after:'持ち物に入りました。ホームの部屋に置くと効果が出ます。',disabled:ownF(id),ptext:ownF(id)?'持っている':yen(it.p)})).join('')}</div>
  <p class="sub">家具は1種類1つまで。買った家具は持ち物に入り、ホームの部屋に置くと効果が出ます。寝具は一番良いものだけが効きます。</p>`}
function estatePage(){return HOMES.map((h,i)=>{const cost=h.buy||h.move,cur=i===S.home,owned=i<S.home;
    const desc=`${h.d}。睡眠 体調+${h.sleep}`,pt=h.buy?'購入 '+yen(h.buy):i===0?'家賃 '+yen(h.rent)+'/日':'初期費用 '+yen(h.move)+'、家賃 '+yen(h.rent)+'/日';
    if(cur||owned||i===0)return `<div class="cmd card dis"><b>${h.n}${cur?'（今の家）':''}</b><span>${desc}</span><span class="p">${pt}</span></div>`;
    return buyCard({a:'move',data:`data-i="${i}"`,name:h.n,desc,price:cost,ptext:pt,verb:h.buy?'購入':'引っ越し',doneTitle:h.buy?'購入しました':'引っ越しました',yesText:h.buy?'購入する':'引っ越す',after:'新しい家に移りました。家具もそのまま持っていきました。'})}).join('')+
  `<p class="sub">引っ越しても、置いた家具はそのまま新しい家に置かれます。家を買うと家賃がなくなり、高レートの店に入れるようになります。</p>`}
function blackPage(){if(S.day<3)return '<p class="lead">裏市場は3日目から開きます。</p>';
  return `<p class="lead">「いいのがあるよ」</p>${buyCard({a:'buyKiban',data:'',name:'改造基盤',desc:`台に仕込むと、その日はボーナスが1.4倍当たりやすい。1回使い切り。仕込む時に${bustRate()}%で店員に見つかる。見つかると罰金（所持金の3割、最低5万円）と、その店に5日間出入り禁止。見つかるたびに次から見つかりやすくなる`,price:kibanPrice(),ptext:`${yen(kibanPrice())}　所持 ${S.kiban}`})}
  <p class="sub">ゲームの中だけの話です。現実の不正は犯罪です。</p>`}
function renderShop(tab){
  for(const k in buyInfo)delete buyInfo[k];
  if(tab)shopTab=tab;status();const y=window.scrollY;
  $('#view').innerHTML=`<div class="ch">買い物</div>`+pagesHTML([
    {key:'food',label:'ごはん',html:foodPage(FOODS,'eat')},{key:'fun',label:'息抜き',html:foodPage(PLAYS,'play')},
    {key:'furn',label:'家具',html:furnPage()},{key:'estate',label:'不動産',html:estatePage()},{key:'black',label:'裏市場',html:blackPage()}],shopTab);
  bindPages($('#view'),shopTab,k=>{shopTab=k});
  if(!tab)window.scrollTo(0,y);tabs('shop');
}
function renderFurn(){renderShop('furn')}
function renderEstate(){renderShop('estate')}
function renderBlack(){renderShop('black')}
function selfPage(){return `<p class="sub">一度身につけた力はずっと残ります。効果は小さく、値段はだんだん上がります。</p>
  ${Object.entries(UPG).map(([k,u])=>{const l=S.upg[k],done=l>=u.max;return buyCard({a:'upg',data:`data-id="${k}"`,name:`${u.n}　Lv${l}/${u.max}`,doneName:u.n,after:done?'':`Lv${l} → Lv${l+1}　${u.d(l)}`,desc:done?'最大まで鍛えた':u.d(l),price:done?0:u.cost(l),ptext:done?'—':yen(u.cost(l)),disabled:done})}).join('')}
  ${buyCard({a:'drops',data:'',name:'目薬',desc:S.dropDay===S.day?'今日はもう差した':'今日1日、リールが3%ゆっくり見える',price:1500,disabled:S.dropDay===S.day})}`}
function achPage(){return `<p class="sub">${Object.keys(S.ach).length}/${ACH.length} 達成。最後に達成した実績が称号として表示されます。</p>
  ${ACH.map(a=>`<div class="cmd ach ${has(a.id)?'got':'notyet'}"><b>${has(a.id)?'★ ':''}${a.n}</b><span>${a.d}</span><span class="p">ごほうび：${a.r}${has(a.id)?`（${S.ach[a.id]}日目に達成）`:''}</span></div>`).join('')}`}
function histPage(){if(!S.hist.length)return '<p class="sub">まだ打っていません。パチ屋で打つと、ここに日ごとの収支が残ります。</p>';
  const T=S.tot,draw=T.n-T.win-T.lose;
  return `<div class="res"><span>通算の収支（${T.n}回）</span><b class="big ${T.sum>=0?'pos':'neg'}">${T.sum>=0?'+':''}${yen(T.sum)}</b><span>勝ち負け</span><b>${T.win}勝 ${T.lose}敗${draw?` ${draw}分け`:''}</b><span>いちばん勝った日</span><b class="${T.best>0?'pos':''}">${T.best>0?'+'+yen(T.best):'なし'}</b></div>
  <p class="sub">日ごとの収支（直近${S.hist.length}回）</p>
  <div class="log hist">${S.hist.slice().reverse().map(h=>`<div class="hrow"><span>${h.day}日目　${h.hall}</span><span>${h.m}</span><b class="${h.v>=0?'pos':'neg'}">${h.v>=0?'+':''}${yen(h.v)}</b></div>`).join('')}</div>`}
function settingsPage(){return `<p class="sub">ゲーム内のお金だけを扱います。現実のお金や景品には換わりません。</p>${verBox()}`}
function renderMe(tab){
  for(const k in buyInfo)delete buyInfo[k];
  if(tab)meTab=tab;status();const y=window.scrollY;
  $('#view').innerHTML=`<div class="ch">自分</div>`+pagesHTML([
    {key:'self',label:'自己投資',html:selfPage()},{key:'hist',label:'収支',html:histPage()},{key:'ach',label:'実績',html:achPage()},{key:'set',label:'設定',html:settingsPage()}],meTab);
  bindPages($('#view'),meTab,k=>{meTab=k});
  if(!tab)window.scrollTo(0,y);tabs('me');
}
function renderSelf(){renderMe('self')}
function renderAch(){renderMe('ach')}
function moveTo(i){const h=HOMES[i];if(!spend(h.buy||h.move))return;if(i>=3)grant('house');if(i===4)grant('tower');S.home=i;apply({fun:20});save();cutin(h.n+'へ');renderHome()}
function sleep(){
  const H=HOMES[S.home],ev=dailyEffects(S.placed,S.home,has('house')?5:0);
  const lines=[];
  if(H.rent){S.money-=H.rent;lines.push(`家賃 ${yen(H.rent)}`)}
  const hun=25-ev.keep;S.hun=clamp(S.hun-hun);S.fun=clamp(S.fun-8+ev.fun);
  let rest=ev.sleep+ev.hp+10;if(S.fun<20)rest=Math.round(rest/2);if(S.hun<10)rest-=10;S.hp=clamp(S.hp+rest);
  S.day++;S.phase='morning';
  if(S.money<0){lines.push('家賃が払えず、借金になった');}
  save();renderHome();toast(lines.join('、')||'よく眠れた');
}

/* ---------- growth and back market ---------- */
const UPG={
  eye:{n:'動体視力トレーニング',max:5,cost:l=>20000*(l+1)*(l+1),d:l=>`リールが${l+1}%ゆっくり見える（今${l}%）`},
  data:{n:'データ分析',max:3,cost:l=>[30000,120000,400000][l],d:l=>['台のデータにREG回数が出る','前日の差枚が出る','高設定の気配が出る（6割の精度）'][l]||'最大'},
  body:{n:'体力づくり',max:3,cost:l=>15000*(l+1)*(l+1),d:l=>`打っている時のお腹と体調の減りが${(l+1)*10}%少ない`}
};
function kibanPrice(){return 50000*(1+S.home)}
function roulette(i){
  const rate=bustRate(),n=10,bust=Math.round(rate/10),segs=Array.from({length:n},(_,k)=>k<bust);segs.sort(()=>Math.random()-.5);
  const stop=Math.floor(Math.random()*n),caught=segs[stop];tabs(null);
  $('#view').innerHTML=`<div class="ch">仕込み中…店員の目は？</div><canvas id="rl" width="240" height="240" style="width:240px;max-width:100%;margin:0 auto;display:block"></canvas><p class="lead" id="rlt" style="text-align:center">　</p>`;
  const c=$('#rl').getContext('2d'),t0=performance.now(),dur=2600,turns=4+stop/n;
  const draw=a=>{c.clearRect(0,0,240,240);for(let k=0;k<n;k++){c.beginPath();c.moveTo(120,120);c.arc(120,120,110,a+k*2*Math.PI/n,a+(k+1)*2*Math.PI/n);c.closePath();c.fillStyle=segs[k]?'#ff3b6b':(k%2?'#2a2445':'#3b3460');c.fill();c.strokeStyle='#15101f';c.stroke();
      c.save();c.translate(120,120);c.rotate(a+(k+.5)*2*Math.PI/n);c.fillStyle='#f4efe2';c.font='13px "Zen Kaku Gothic New",sans-serif';c.textAlign='center';c.fillText(segs[k]?'バレた':'セーフ',70,5);c.restore()}
    c.fillStyle='#ffcf4a';c.beginPath();c.moveTo(120,4);c.lineTo(110,22);c.lineTo(130,22);c.closePath();c.fill()};
  const end=-Math.PI/2-(stop+.5)*2*Math.PI/n;
  const step=now=>{const k=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-k,3),a=end-(1-e)*turns*2*Math.PI;draw(a);if(k<1)return requestAnimationFrame(step);
    S.kiban--;
    if(caught){grant('banned');hallState(hallIdx).friend=Math.max(0,hallState(hallIdx).friend-40);const fine=Math.max(50000,Math.round(S.money*.3));S.money-=fine;S.ban[hallIdx]=S.day+5;S.conv++;S.phase='evening';S.fun=clamp(S.fun-20);save();SND.miss();
      $('#rlt').textContent='店員に見つかった';$('#view').insertAdjacentHTML('beforeend',`<div class="res"><span>罰金</span><b class="neg">${yen(-fine)}</b><span>出入り禁止</span><b>${HALLS[hallIdx].n}　${S.day+5}日目まで</b></div><button class="btn" type="button" data-a="home">とぼとぼ帰る</button>`);status()}
    else{save();SND.fan();$('#rlt').textContent='誰にも見られていない';setTimeout(()=>sitDown2(i,true),900)}};
  requestAnimationFrame(step);
}

/* ---------- part-time job: inspection line ---------- */
function startJob(){
  status();tabs(null);
  $('#view').innerHTML=`<div class="ch">日雇いバイト　検品ライン</div><p class="sub">流れてくる箱が金の枠に入った瞬間に「検品」を押す。赤い×の箱（不良品）は押さずに見送る。</p>
  <div class="room"><canvas id="job" width="320" height="110" style="width:100%;max-width:100%;image-rendering:pixelated"></canvas></div>
  <div class="counter"><div>正確<b id="jg">0</b></div><div>ミス<b id="jm">0</b></div><div>残り<b id="jl">30</b></div><div>給料<b id="jp">¥0</b></div></div>
  <button class="btn" type="button" id="jobBtn">検品</button><p class="sub">基本給 ¥1,500 ＋ 1箱 ¥160。ミス1回 −¥200。</p>`;
  const cv2=$('#job'),c=cv2.getContext('2d'),Z=[214,246],boxes=[];let made=0,good=0,miss=0,done=0,t0=performance.now(),last=t0,next=t0+600;
  const TOTAL=30,pay=()=>Math.max(1000,1500+good*160-miss*200);
  const upd=()=>{$('#jg').textContent=good;$('#jm').textContent=miss;$('#jl').textContent=TOTAL-done;$('#jp').textContent=yen(pay())};
  const press=()=>{const b=boxes.find(b=>!b.done&&b.x+12>=Z[0]&&b.x+12<=Z[1]);
    if(b){b.done=true;b.hit=true;if(b.bad){miss++;SND.miss()}else{good++;SND.coin()}}else{miss++;SND.miss()}upd()};
  $('#jobBtn').addEventListener('pointerdown',e=>{e.preventDefault();press()});
  const loop=now=>{if(!document.body.contains(cv2))return;const dt=(now-last)/1000;last=now;
    const sp=70+made*3.2;
    if(made<TOTAL&&now>=next){boxes.push({x:-24,bad:Math.random()<.22,done:false});made++;next=now+(650+Math.random()*700)*(1-made/90)}
    for(const b of boxes){b.x+=sp*dt;if(!b.out&&b.x>Z[1]){b.out=true;done++;if(!b.done&&!b.bad){miss++}upd()}}
    c.fillStyle='#2a2445';c.fillRect(0,0,320,110);c.fillStyle='#45425a';c.fillRect(0,60,320,26);c.fillStyle='#5a5878';for(let x=(now/8)%16-16;x<320;x+=16)c.fillRect(x,62,8,2);
    c.strokeStyle='#ffcf4a';c.lineWidth=2;c.strokeRect(Z[0]-2,28,Z[1]-Z[0]+28,60);
    for(const b of boxes){if(b.x>330)continue;c.fillStyle=b.bad?'#8a5a34':'#b98a5a';c.fillRect(b.x,36,24,24);c.fillStyle='#d9b88a';c.fillRect(b.x,36,24,5);
      if(b.bad){c.strokeStyle='#ff3b6b';c.lineWidth=3;c.beginPath();c.moveTo(b.x+5,44);c.lineTo(b.x+19,56);c.moveTo(b.x+19,44);c.lineTo(b.x+5,56);c.stroke()}
      if(b.hit){c.fillStyle=b.bad?'#ff3b6b':'#7dffa0';c.beginPath();c.arc(b.x+12,48,6,0,7);c.fill()}}
    if(done>=TOTAL){const p=Math.round(pay()*(has('job')?1.1:1));if(miss===0)grant('job');S.money+=p;apply({hun:-25,hp:-12,fun:-10});S.phase='evening';save();status();
      $('#view').insertAdjacentHTML('beforeend',`<div class="res"><span>正確に検品</span><b>${good}箱</b><span>ミス</span><b>${miss}回</b><span>給料</span><b class="big pos">${yen(p)}</b></div><button class="btn" type="button" data-a="home">家に帰る</button>`);$('#jobBtn').disabled=true;return}
    requestAnimationFrame(loop)};
  requestAnimationFrame(loop);upd();
}

/* ---------- hall floor ---------- */
function hallState(h){if(!S.halls[h])S.halls[h]={friend:10,visit:0,gift:0,cur:null};return S.halls[h]}
function FL(){return hallState(hallIdx).cur}
// Overnight each machine is either reset (back to 0G) or left as it was at closing, at the hall's own rate.
function makeFloor(){
  const ev=isEvent(S.day),H=hallState(hallIdx),prev=H.cur&&H.cur.day===S.day-1?H.cur:null,ms=[];let no=101;
  ['fuku','fuku','fuku','sanj','sanj','sanj','hachi','hachi','hachi'].forEach((k,idx)=>{const m=MACH[k],s2=pickSetting(Math.random(),ev),g=3000+Math.floor(Math.random()*4500),p=m.big(s2),
    big=Math.max(0,Math.round(g*p+(Math.random()-.5)*2*Math.sqrt(g*p))),rp=m.reg?m.reg(s2):0,reg=Math.max(0,Math.round(g*rp+(Math.random()-.5)*2*Math.sqrt(g*rp+1))),
    diff=Math.round(g*3*((.9+s2*.035)-1)+(Math.random()-.5)*2400),star=s2>=4?Math.random()<.6:Math.random()<.12;
    const pm=m.big(3)+(m.reg?m.reg(3):0),close=prev&&prev.ms[idx].played?prev.ms[idx].since:Math.min(CEIL[k]-30,Math.floor(-Math.log(1-Math.random())*0.6/pm));
    const reset=Math.random()<HALLS[hallIdx].reset;
    ms.push({no:no++,k,s:s2,g,big,reg,diff,star,since:reset?0:close,close,reset,taken:false,played:false})});
  H.cur={day:S.day,ms,ticket:null,ev};
  if(!ev){const busy=ms.map((_,i)=>i).sort(()=>Math.random()-.5).slice(0,2+Math.floor(Math.random()*2));busy.forEach(i=>ms[i].taken=true)}
  save();
}
function friendInfo(){const f=hallState(hallIdx).friend,r=HALLS[hallIdx].reset;
  if(f>=90)return '店員さんがこっそり教えてくれる。今日は台ごとにリセットか据え置きかが分かる';
  if(f>=60)return `店員さん「うちは朝のリセットが だいたい${Math.round(r*100)}%くらいかな」`;
  if(f>=30)return `店員さん「うちはリセット${r>=.5?'多め':'少なめ'}ですよ」`;
  return 'まだ打ち解けていない。仲良くなると、朝のリセットの情報がもらえる（30で傾向、60で割合、90で台ごと）';}
// Players ahead of you take the machines that look best (good data, deep hamari).
function lookScore(x){const m=MACH[x.k],p=x.big/Math.max(1,x.g);return p*2000+x.diff/1500+(x.since/CEIL[x.k])*1.2+Math.random()*.8}
function drawTicket(){
  const n=1+Math.floor(Math.random()*150),ahead=Math.min(8,Math.floor((n-1)/12)),ms=FL().ms;
  ms.map((x,i)=>[lookScore(x),i]).sort((a,b)=>b[0]-a[0]).slice(0,ahead).forEach(([,i])=>ms[i].taken=true);
  FL().ticket=n;save();if(n===1)grant('ticket1');
  return ahead;
}
function renderHalls(){
  status();tabs('halls');
  const done=S.phase!=='morning'; // パチ屋は1日1回（打った後・バイトの後は次の日まで入れない）
  $('#view').innerHTML=`<div class="ch">どの店に行く？</div>${done?'<p class="lead">今日はもう出かけた。寝ると次の日になります。</p>':''}${HALLS.map((h,i)=>{const open=!h.open||h.open(S)||!!S.devAll,ban=(S.ban[i]||0)>=S.day;return `<button class="cmd" type="button" data-a="hall" data-i="${i}" ${open&&!ban&&!done?'':'disabled'}><b>${h.n}</b><span>${h.d}。1枚 ${yen(h.rate)}（50枚 ${yen(h.rate*50)}）</span><span class="p">${ban?`出入り禁止（${S.ban[i]}日目まで）`:open?'入れる':h.need}</span></button>`}).join('')}<button class="btn alt" type="button" data-a="home">部屋に戻る</button>`;
}
let hallIdx=0;
let floorK='fuku',floorSel=-1;
function renderFloor(){
  if(!FL()||FL().day!==S.day)makeFloor();
  status();tabs('halls');const h=HALLS[hallIdx],F=FL();
  if(F.ev&&!F.ticket){
    $('#view').innerHTML=`<div class="ch">${h.n}　イベント日の朝</div><p class="lead">開店前から長い列。整理券の抽選で入場順が決まる。</p><p class="sub">番号が若いほど先に入れます。後ろの番号だと、良さそうな台から他の客に取られていきます。</p><button class="btn" type="button" data-a="ticket">整理券を引く</button><button class="btn alt" type="button" data-a="home">並ばずに帰る</button>`;return}
  const Hs=hallState(hallIdx);if(Hs.visit!==S.day){Hs.visit=S.day;Hs.friend=Math.min(100,Hs.friend+2);save()}
  const f=Hs.friend;
  // 機種を上のタブで選び、台の一覧（表）から1台選んで「この台で遊ぶ」（仕様書 9.4）
  if(!MACH[floorK])floorK='fuku';
  const m=MACH[floorK],rows=F.ms.map((x,i)=>[x,i]).filter(([x])=>x.k===floorK);
  if(floorSel>=0&&(F.ms[floorSel]?.k!==floorK||F.ms[floorSel].taken))floorSel=-1;
  const showReg=S.upg.data>=1&&m.reg,showDiff=S.upg.data>=2;
  const row=([x,i])=>{const hot=x.since>=CEIL[x.k]*.6,near=has('hyena')&&hot&&!x.taken;
    return `<tr class="${x.taken?'taken':''}${near?' near':''}${i===floorSel?' sel':''}"><td><button type="button" data-a="pick" data-i="${i}" ${x.taken?'disabled':''} aria-pressed="${i===floorSel}">${i===floorSel?'<i class="crown" aria-hidden="true">♛</i>':''}${x.no}${S.upg.data>=3&&x.star?'<i class="star" title="高設定の気配">★</i>':''}</button></td>
      <td class="${hot?'hot':''}">${near?'<i class="aim" title="天井が近い">狙</i>':''}${x.since}G</td><td>${x.big}</td><td>${x.big?'1/'+Math.round(x.g/x.big):'—'}</td>${showReg?`<td>${x.reg}</td>`:''}${showDiff?`<td class="${x.diff>=0?'pos':'neg'}">${x.diff>0?'+':''}${x.diff}</td>`:''}
      <td>${x.taken?'<span class="neg">使用中</span>':'<span class="pos">空き</span>'}${f>=90?`<br><span class="tag">${x.reset?'リセット':'据え置き'}</span>`:''}</td></tr>`};
  $('#view').innerHTML=`<div class="ch">${h.n}</div>
  <div class="seg" role="tablist">${['fuku','sanj','hachi'].map(k=>`<button type="button" role="tab" data-a="floorK" data-id="${k}" aria-selected="${k===floorK}">${MACH[k].n}</button>`).join('')}</div>
  <div class="banner b-${floorK}" style="--bn:url(${import.meta.env.BASE_URL}banners/${floorK}.webp)"><div><b>${m.n}</b><span>${m.desc}</span><span>天井 ${CEIL[floorK]}G　空き ${rows.filter(([x])=>!x.taken).length}/${rows.length}${F.ticket?`　整理券 ${F.ticket}番`:''}</span></div></div>
  <div class="tablebox"><div class="tb-head"><b>設置状況（${m.n}）</b><span>前日のデータ</span></div>
  <table class="units-t"><thead><tr><th>台番</th><th>ハマり</th><th>BIG</th><th>確率</th>${showReg?'<th>REG</th>':''}${showDiff?'<th>差枚</th>':''}<th>状態</th></tr></thead><tbody>${rows.map(row).join('')}</tbody></table></div>
  <p class="sub">ハマりは今の回転数（最後の当たりから何回転したか）。台番を押して選びます。金色に光るのは天井が近い台。</p>
  <button class="cta small" type="button" data-a="sit" data-i="${floorSel}" ${floorSel<0?'disabled':''}><span class="cta-t"><b>この台で遊ぶ</b><span>${floorSel<0?'台番を押して選んでください':F.ms[floorSel].no+'番台'}</span></span><span class="cta-go" aria-hidden="true">»</span></button>
  <div class="friend"><div class="r"><span>店員さんとの仲</span><b>${f}</b></div><div class="bar"><i style="width:${f}%;background:var(--cyan)"></i></div><p>${friendInfo()}</p>
  <button class="btn alt" type="button" data-a="gift" ${Hs.gift===S.day||S.money<HALLS[hallIdx].gift?'disabled':''}>${Hs.gift===S.day?'今日は差し入れ済み':`差し入れをする ${yen(HALLS[hallIdx].gift)}（仲+8）`}</button></div>
  <button class="btn alt" type="button" data-a="home">やっぱり帰る</button>`;
}

/* ---------- playing ---------- */
let P=null;
const OPEN_MIN=10*60,CLOSE_MIN=22*60+40;
function clock(g){const m=OPEN_MIN+g;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
function mach(){if(!P.boost)return P.m;const m=P.m;return {...m,big:s=>m.big(s)*1.4,reg:m.reg?s=>m.reg(s)*1.4:null}}
function sitDown(i){
  if(S.kiban>0&&!S._skipKiban){$('#view').innerHTML=kibanAsk(i);tabs(null);return}
  S._skipKiban=false;sitDown2(i,false)}
function kibanAsk(i){return `<div class="ch">裏市場の改造基盤</div><p class="lead">この台に改造基盤を仕込みますか？</p><p class="sub">成功すればこの日はボーナスが1.4倍当たりやすくなります。仕込む瞬間に店員に見つかると、罰金と出入り禁止です。見つかる確率は今 ${bustRate()}%。</p>
  <div class="grid2"><button class="cmd main" type="button" data-a="kiban" data-i="${i}"><b>仕込む</b><span>ルーレットで判定</span></button><button class="cmd" type="button" data-a="nokiban" data-i="${i}"><b>普通に打つ</b><span>基盤は持ったまま</span></button></div>`}
function bustRate(){return Math.min(60,20+S.conv*10)}
function sitDown2(i,boost){
  if(S.phase!=='morning'){toast('今日はもう出かけた。寝ると次の日');return renderHalls()}
  const x=FL().ms[i];
  P={unit:i,since:x.since,startSince:x.since,ceilHit:false,ev:FL().ev,boost,m:MACH[x.k],s:x.s,rate:HALLS[hallIdx].rate,hall:HALLS[hallIdx].n,medals:0,inv:0,g:0,ng:0,big:0,mode:'normal',flag:null,pend:null,order:[],navi:-1,hint:-1,left:0,doors:null,zen:0,log:[],auto:false,big8:0,res:[]};
  S.phase='hall';S.play={hall:P.hall,rate:P.rate,m:P.m.n,medals:0,inv:0};save();
  setupReels();renderPlay();
}
function setupReels(){reels=STRIPS.map(st=>makeReel(st,Math.floor(Math.random()*N)));layout();startReelsLoop()}
function speedMul(){return (S.hun<25?1.12:1)*(1-.01*S.upg.eye)*(S.dropDay===S.day?.97:1)}
function maxSlip(){return S.hp<25?2:4}
function borrow(){const c=50*P.rate;if(S.money<c)return false;S.money-=c;P.inv+=c;P.medals+=50;SND.coin();return true}
function cue(){
  const m=P.m,f=P.flag;
  if(P.mode==='big')return [`<b>BIG</b> 残り${P.left}G　左リールに<b>7・リプレイ・7</b>をビタ止め`,'mode'];
  if(P.mode==='reg')return [`<b>REG</b> 残り${P.left}G`,'mode'];
  if(P.mode==='at')return [`<b>侍ラッシュ</b> 残り${P.left}G　ナビの順に押せ`,'mode'];
  if(P.mode==='zen')return [`<b>扉の前兆</b> 残り${P.left}G　中リールに赤7。どこでも扉-1、中段ビタで扉-2`,'mode'];
  if(P.mode==='align')return m.kind==='sanj'?['<b>ラッシュ確定</b>　赤7をそろえよう','hot']:['<b>ボーナス確定</b>　左と中に7、右は7を狙う（BARが来たらREG）','hot'];
  if(P.spinning&&P.mode==='normal'&&reels[0].state!=='spin'&&[0,1,2].some(row=>symAt(reels[0],reels[0].final,row)==='WM'))return ['左リールにスイカ　<b>中と右もスイカを狙え</b>','hot'];
  if(f==='BL'&&m.kind==='sanj'&&P.hint>=0)return [`押し順の気配　<b>${['左','中','右'][P.hint]}から？</b>`,'hot'];
  if(P.spinning&&f==='BL'&&m.kind==='sanj')return ['押し順ベル？　<b>最初に押すリールを選べ</b>',''];
  return ['','']
}
// 台の数字はデータカウンターと同じ考え方（仕様書 9.7）：総ゲーム数はボーナス中も含めた累計、合成確率は通常時のゲーム数で割る。
// 「現在」（counterHTML）は最後の当たりからの回転数で、ボーナス・ラッシュに入ると0に戻り、ボーナス中は数えない
function statsHTML(){const b=P.big+(P.reg||0);return `<div class="stats"><div><span>総ゲーム数</span><b>${P.g}</b></div><div class="bb"><span>BIG</span><b>${P.big}</b></div><div class="rb"><span>REG</span><b>${P.reg||0}</b></div><div><span>合成確率</span><b>${b?'1/'+Math.round((P.ng||0)/b):'—'}</b></div></div>`}
function counterHTML(){const out=P.medals*P.rate,net=out-P.inv;return `<div class="counter"><div>時刻<b>${clock(P.g)}</b></div><div>現在<b>${P.since}G</b></div><div>持ちメダル<b>${P.medals}</b></div><div>収支<b class="${net>=0?'pos':'neg'}">${net>=0?'+':''}${yen(net)}</b></div></div>`}
function renderPlay(){
  status();tabs(null);const [c,cl]=cue();
  const busyBonus=['big','reg','at','zen','align','door','cont'].includes(P.mode)||!!P.pend;
  $('#view').innerHTML=`<div class="cab"><div class="cabtop"><b>${P.m.n}</b><span class="sub">${P.hall}${P.boost?'　基盤':''}${S.dropDay===S.day?'　目薬':''}</span></div>
    ${statsHTML()}
    ${counterHTML()}
    <div class="lcd lcd-${P.m.kind}" style="--bn:url(${import.meta.env.BASE_URL}banners/${P.m.kind}.webp)">${lcdMsgHTML()}<div class="lamp ${cl}${c?'':' empty'}" id="lamp"><span>${c||'&nbsp;'}</span></div></div>
    <div class="glass" id="glass"><canvas id="reels"></canvas></div><p class="sub" style="text-align:center;font-size:12px;margin-top:-4px">5ライン：上段・中段・下段・斜め2本</p>
    ${P.mode==='door'?doorHTML():P.mode==='cont'?contHTML():`<div class="ctrl"><button class="lever" id="lever" type="button">レバー</button><div class="stops" id="stops">${[0,1,2].map(i=>`<button class="stop" type="button" data-i="${i}" disabled>${['左','中','右'][i]}${P.navi>=0&&navOrder()[0]===i&&P.order.length===0?'<span class="nv">1</span>':''}</button>`).join('')}</div></div>`}
  </div>
  <div class="grid3">${AUTO_GAMES.map(n=>`<button class="cmd" type="button" data-a="auto" data-i="${n}" ${busyBonus||P.spinning?'disabled':''}><b>${n}G 回す</b><span>適当打ち。ボーナスで止まる</span></button>`).join('')}
  <button class="cmd" type="button" data-a="quit" ${busyBonus||P.spinning?'disabled':''}><b>やめる</b><span>換金して帰る</span></button></div>
  <details class="strip"><summary>配当表と遊び方</summary>${payHTML()}</details>
  <details class="strip"><summary>リール配列表（上から下へ流れる）</summary><p class="sub">左リールのチェリーはBARの真下、スイカは左でBARの3コマ上、中でBARの2コマ上、右はBARの2コマ上ともう1か所にあります。赤7は左に2つ、中に1つ、右は「7・リプレイ・BAR」の1か所だけ。左リールの「7・リプレイ・7」の並びがBIG中のビタ押しポイントです。BARが上段に来るタイミング（枠の上から入ってきた瞬間）で押せば、どちらも取りこぼしません。</p><canvas id="stripT" aria-label="リール配列表"></canvas></details>
  <p class="sub">${S.hun<25?'お腹が空いて、リールが速く見える。':''}${S.hp<25?'体調が悪く、手が震えて狙った図柄を2コマまでしか引き込めない。':''}</p>`;
  bindCabinet();sync();const st=$('#stripT');if(st){drawStripTable(st);st.style.width=(st.width/2)+'px'}
}
function bindCabinet(){
  const cvNew=$('#reels');if(cvNew){cv=cvNew;rc=cv.getContext('2d');layout()}
  const lv=$('#lever');if(lv){lv.addEventListener('pointerdown',e=>{e.preventDefault();lever()});lv.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();lever()}})}
  const st=$('#stops');if(st){st.addEventListener('pointerdown',e=>{const b=e.target.closest('.stop');if(!b||b.disabled)return;e.preventDefault();stopAt(+b.dataset.i,e)});st.addEventListener('keydown',e=>{const b=e.target.closest('.stop');if(b&&(e.key==='Enter'||e.key===' ')){e.preventDefault();stopAt(+b.dataset.i,e)}})}
}
function sync(){
  const lv=$('#lever');if(lv)lv.disabled=!!P.spinning||P.autoRun;
  document.querySelectorAll('.stop').forEach((b,i)=>b.disabled=!reels[i]||reels[i].state!=='spin'||P.autoRun||(P.mode==='big'&&i>0&&reels[0].state==='spin'));
  document.querySelectorAll('[data-a=auto]').forEach(b=>{b.querySelector('b').textContent=P.autoRun?'止める':b.dataset.i+'G 回す';b.classList.toggle('on',!!P.autoRun)});
  const l=$('#lamp');if(l){const [c,cl]=cue();l.innerHTML='<span>'+(c||'&nbsp;')+'</span>';l.className='lamp '+cl+(c?'':' empty')}
}
function navOrder(){const n=P.navi;return [n,(n+1)%3,(n+2)%3]}
function lever(){
  if(P.spinning||P.autoRun)return;
  if(P.medals<3){if(!borrow()){toast('お金が足りません');return}}
  if(P.g>=CLOSE_MIN-OPEN_MIN&&P.mode==='normal'){toast('閉店です');return quit(true)}
  P.medals-=3;
  if(P.mode==='normal'){P.since++;if(P.since>=CEIL[P.m.kind]&&!P.post){P.pend='BIG';P.ceilHit=true}}
  else if(P.mode==='align')P.since++; // 揃えるゲームも、ボーナスが始まるまでは「現在」に数える（天井はもう関係ない）
  P.g++;if(P.mode==='normal'||P.mode==='align')P.ng=(P.ng||0)+1;P.order=[];P.navi=-1;P.hint=-1;P.res=[];P.wins=null;
  tick();
  if(P.mode==='normal'){P.flag=P.pend||roll(mach(),P.s,Math.random());P.pend=null;
    if(P.flag==='BIG'||P.flag==='REG'){const b=P.flag;if(Math.random()<.5){P.mode='align';P.bonus=b;SND.fan();P.flag='BONUS';say('ボーナス確定！',P.m.kind==='sanj'?'赤7をそろえよう':'7をそろえよう','hot')}else{P.post=b;P.flag=null}}
    else if(P.flag==='CH'&&Math.random()<P.m.dup){P.post=P.m.reg&&Math.random()<.4?'REG':'BIG';P.dupCH=true}
    if(P.flag==='BL'&&P.m.kind==='sanj'){P.navCorrect=Math.floor(Math.random()*3);if(Math.random()<.3)P.hint=P.navCorrect}
  }else if(P.mode==='at'){P.flag=atRoll(Math.random());if(P.flag==='BL'){P.navCorrect=Math.floor(Math.random()*3);P.navi=P.navCorrect}}
  else if(P.mode==='align')P.flag='BONUS';
  else if(P.mode==='big')P.flag='BIGG';else if(P.mode==='reg')P.flag='BL';else if(P.mode==='zen')P.flag='R7';
  const sp=speedMul(),ms=maxSlip(),now=performance.now();
  reels.forEach((r,i)=>{r.res=null;r.speed=sp;r.maxSlip=ms;r.noSlip=P.mode==='big'&&i===0;r.p0=r.pos;r.t0=now;r.state='spin'});
  P.spinning=true;SND.lever();renderPlay();
  const st=$('#stops');if(st){st.classList.add('warm');setTimeout(()=>{const s2=$('#stops');if(s2)s2.classList.remove('warm')},SPIN_UP_MS)}
}
function targetFor(i){
  const f=P.flag,k=P.m.kind;
  if(f==='R7')return P.mode==='zen'?(i===1?'R7':null):'R7';
  if(f==='BONUS')return i<2?'R7':(P.bonus==='REG'?'BAR':'R7');
  if(f==='BIGG')return i===0?null:'BL';
  if(f==='RP')return 'RP';
  if(f==='BL'){if(k==='sanj'){const first=P.order[0];return first===P.navCorrect?'BL':null}return 'BL'}
  if(f==='CH')return k==='fuku'?(i===0?'CH':null):(i===0?'CH':null);
  if(f==='WM')return 'WM';
  return null;
}
function stopAt(i,e){
  const r=reels[i];if(!r||r.state!=='spin')return;
  if(!atFullSpeed(r,evTime(e)))return; // 回り始めの加速中は受け付けない（実機と同じ）
  if(P.mode==='big'&&i!==0&&reels[0].state==='spin'){toast('BIG中は左リールから止めます');return}
  if(P.navi>=0&&P.mode==='at'&&P.order.length===0&&i!==P.navi)P.navMiss=true;
  P.order.push(i);
  const tg=targetFor(i),done=reels.map((x,j)=>j!==i&&x.state!=='spin'?x.final:null);
  const res=pressL(reels,i,evTime(e),tg,{done,centerOnly:P.mode==='big'&&i===0,free:P.mode==='zen'&&i===1,hide:leftHide(),must:(['BL','RP'].includes(tg)&&P.flag!=='BONUS')?tg:null,tgs:P.flag==='BONUS'?[0,1,2].map(targetFor):null,noBonusLine:noBonusLine(),last:P.order.length===3,ok:okLines(tg)});
  if(P.mode==='big'&&i===0){const fi=mod(r.final),d=mod(BITA_IDX-fi);res.bita=fi===BITA_IDX;res.hit=res.bita;res.off=res.bita?0:(d<=10?d:d-21)}
  r.res=res;
  P.res[i]=res;SND.stop();
  r.onStop=()=>{landed(i,res)};sync();
}
// What the left reel may never show. A watermelon sliding onto the left reel always means watermelon or something better.
function leftHide(){const h=[];if(P.flag!=='CH')h.push('CH');if(P.mode==='normal'&&P.flag!=='WM'&&!P.post)h.push('WM');return h}
// A bonus line (7-7-7 or 7-7-BAR) must only appear when that bonus actually starts.
function noBonusLine(){if(P.flag==='BONUS')return P.bonus==='REG'?['R7']:['BAR'];return ['R7','BAR']}
function okLines(tg){if(P.flag==='BONUS')return P.bonus==='BIG'?['BAR','R7']:['BAR'];if(P.post)return ['BAR'];return tg?[tg]:[]}
function paying(){return ['RP','BL','CH','WM','R7'].includes(P.flag)}
function landed(i,res){
  const f=P.flag;
  if(P.mode==='big'&&i===0){if(res.bita){SND.bita();P.flashT=performance.now();popAt(0,'ビタ！','bita')}else{SND.miss();popAt(0,offText(res),'ng')}}
  else if(P.mode==='zen'){if(i===1){if(res.bita){SND.bita();popAt(1,'ビタ！ 扉-2','bita')}else if(res.hit){popAt(1,'扉-1','ok')}else{SND.miss();popAt(1,offText(res),'ng')}}}
  else if(f==='R7'||f==='BAR'){if(res.hit)popAt(i,(['上段','中段','下段'][res.row]),'ok');else{SND.miss();popAt(i,offText(res),'ng')}}
  else if(f==='CH'&&i===0&&res.hit)popAt(0,'チェリー','ok');
  sync();
  if(reels.every(r=>r.state==='stop')){P.spinning=false;const fs=reels.map(x=>x.final);P.wins=[...lineWins(fs,reels),...bonusLines(fs,reels,'R7'),...bonusLines(fs,reels,'BAR')].filter(w=>!(w.sym==='R7'));settle()}
}
function popAt(i,text,cls){const g=$('#glass');if(!g)return;const x=PAD+i*(RW+GAP)+RW/2,el=document.createElement('div');el.className='pop '+cls;el.textContent=text;el.style.left=((g.clientWidth-cv.clientWidth)/2+x)+'px';g.appendChild(el);setTimeout(()=>el.remove(),950)}
function offText(res){if(res.off>0)return res.off+'コマ早い';if(res.off<0)return(-res.off)+'コマ遅い';return 'ハズレ'}
// 打っている間の知らせは、リールの上の液晶に大きく出す（仕様書 9.6）。下の文字だと見ないため。
// 知らせは順番待ちにして、前の知らせを消さずに1つずつ出す
const BONUS_MODES=['big','reg','at','zen','door'];
// 払い出し。why は液晶に出す役の名前。replay は「獲得」に数えない（ボーナスの合計はリプレイを除いた払い出しの合計）
function gain(n,why,replay=false){if(n>0){P.medals+=n;SND.pay();if(!replay&&BONUS_MODES.includes(P.mode))P.bonusGot=(P.bonusGot||0)+n}
  if(why)say(why,n>0&&!replay?`+${n}枚 獲得`:'',n<=0?'miss':n>=LCD_GOLD?'gold':'',n>0&&n<LCD_GOLD?'small':'')}
// kind：'end' はボーナス終了（合計の獲得枚数を添える）、'miss' は取りこぼし
function logMsg(t,kind=''){P.log.push(t);let sub='';if(kind==='end'&&P.bonusGot){sub=`合計 ${P.bonusGot}枚 獲得`;P.bonusGot=0}say(t,sub,kind==='end'?'gold':kind)}
let lcdT;
// prio が 'small' の知らせ（ふつうの払い出し）は、順番待ちが長くならないよう、待っている small を置き換える
function say(text,sub='',cls='',prio=''){if(!P)return;P.lcdQ=P.lcdQ||[];
  if(prio==='small')P.lcdQ=P.lcdQ.filter(m=>m.prio!=='small');
  P.lcdQ.push({text,sub,cls,prio});if(!(P.lcd&&P.lcd.until>Date.now()))lcdNext()}
function lcdNext(){clearTimeout(lcdT);if(!P)return;const m=(P.lcdQ||[]).shift();
  if(!m){P.lcd=null;const e=$('#lcdMsg');if(e)e.outerHTML=lcdMsgHTML();return}
  const ms=m.prio==='small'?LCD_SMALL_MS:P.lcdQ.length?LCD_BUSY_MS:LCD_MS;P.lcd={...m,until:Date.now()+ms};
  const e=$('#lcdMsg');if(e)e.outerHTML=lcdMsgHTML(false);lcdT=setTimeout(lcdNext,ms)}
// still：画面を作り直したときは、出ている知らせを動かさずにそのまま出す
function lcdMsgHTML(still=true){const L=P.lcd&&P.lcd.until>Date.now()?P.lcd:null;return `<div class="lcd-msg${L?' on '+L.cls+(still?' still':''):''}" id="lcdMsg" aria-live="polite">${L?`<b>${L.text}</b>${L.sub?`<small>${L.sub}</small>`:''}`:''}</div>`}
function settle(){
  const f=P.flag,k=P.m.kind,res=P.res,all=f==='BONUS'?(P.wins||[]).some(w=>w.sym===P.bonus):!!f&&(P.wins||[]).some(w=>w.sym===f);
  if(P.mode==='normal'){
    const on=x=>(P.wins||[]).some(w=>w.sym===x);
    if(f==='RP'){if(on('RP'))gain(PAY.RP,'リプレイ',true);else logMsg('リプレイこぼし','miss')}
    else if(f==='BL'){if(k==='sanj'){const ok=P.order[0]===P.navCorrect&&on('BL');gain(ok?PAY.BLok:PAY.BLng,ok?'3択正解 ベル':'押し順ミス')}else if(on('BL'))gain(PAY.BL,'ベル');else logMsg('ベルこぼし（変則押し）','miss')}
    else if(f==='CH'){if(k==='fuku')gain(res[0].hit?PAY.CHf:0,res[0].hit?'チェリー':'チェリーこぼし');else gain(PAY.CHo,'チェリー')}
    else if(f==='WM'){gain(all?PAY.WM:0,all?'スイカ':'スイカこぼし')}
    // 当たっていない役が画面にそろったときも、画面どおりに払い出す（変則押しのとき）
    if(f!=='BL'&&on('BL'))gain(k==='sanj'?PAY.BLok:PAY.BL,'ベル');
    if(f!=='RP'&&on('RP'))gain(PAY.RP,'リプレイ',true);
  }else if(P.mode==='align'){
    if(all){
      bonusStarted();
      if(P.bonus==='REG'){P.reg=(P.reg||0)+1;P.mode='reg';P.left=REG_G;say('REG','7・7・BAR','hot')}
      else{P.big++;if(k==='fuku'){P.mode='big';P.left=BIG_G;say('BIG','7・7・7','hot')}else if(k==='sanj'){P.mode='at';P.left=AT_G;say('侍ラッシュ','7・7・7','hot')}else{P.mode='zen';P.left=ZEN_G;P.doors=[0,1,2,3,4,5,6,7];P.winDoor=Math.floor(Math.random()*8);say('扉チャンス','中リールの赤7で扉を減らせ','hot')}}
      SND.fan();P.post=null;
    }else logMsg('そろわず。もう一度','miss');
  }else if(P.mode==='big'){
    const ok=res[0].bita,okPay=BITA_OK+(has('bita10')?2:0);gain(ok?okPay:BITA_NG,ok?'ビタ成功':'ビタ失敗');S.bitaRun=ok?S.bitaRun+1:0;if(S.bitaRun>=10)grant('bita10');P.bitaN=(P.bitaN||0)+(ok?1:0);P.left--;if(P.left<=0){P.mode='normal';logMsg('BIG終了','end');S.fun=clamp(S.fun+6)}
  }else if(P.mode==='reg'){
    gain(REG_PAY,'REG');P.left--;if(P.left<=0){P.mode='normal';logMsg('REG終了','end');S.fun=clamp(S.fun+3)}
  }else if(P.mode==='at'){
    if(f==='BL'){const ok=P.order[0]===P.navi;gain(ok?PAY.BLok:PAY.BLng,ok?'ナビどおり ベル':'押し順ミス')}else if(f==='RP')gain(PAY.RP,'リプレイ',true);
    P.left--;if(P.left<=0){P.mode='cont';P.contWin=Math.floor(Math.random()*3)}
  }else if(P.mode==='zen'){
    const n=res[1].bita?2:res[1].hit?1:0;if(n){const wrong=P.doors.filter(d=>d!==P.winDoor).sort(()=>Math.random()-.5).slice(0,n);P.doors=P.doors.filter(d=>!wrong.includes(d));logMsg(n===2?'中段ビタ 扉が2つ消えた':'赤7 扉が1つ消えた')}else logMsg('赤7を外した','miss')
    P.left--;if(P.left<=0)P.mode='door';
  }
  if(P.post&&P.mode==='normal'){P.mode='align';P.bonus=P.post;P.post=null;SND.fan();if(P.dupCH){say('チェリー重複','ボーナス確定！','hot');P.dupCH=false}else say('ボーナス確定！',P.m.kind==='sanj'?'赤7をそろえよう':'7をそろえよう','hot')}
  P.flag=null;S.play.medals=P.medals;S.play.inv=P.inv;save();
  if(S.hp<=0)return collapse();
  renderPlay();
}
function bonusStarted(){P.bonusGot=0;grant('first');if(P.ceilHit){grant('ceil');say('天井','ボーナス確定','hot')}else if(P.startSince>=400)grant('hyena');/* 天井より前に当てた */P.since=0;P.ceilHit=false;P.startSince=0}
function payHTML(){
  const k=P.m.kind,rows=[['ベル（1ライン）',k==='sanj'?'押し順正解9枚／不正解1枚':'8枚'],['リプレイ','もう1回無料'],['チェリー（左リールのどこでも）',(k==='fuku'?'4枚':'2枚')+`。${Math.round(P.m.dup*100)}%でボーナスも同時に当たっている`],...(k==='fuku'?[['スイカ（1ライン）','12枚']]:[]),
    ['7・7・7',k==='fuku'?`BIG ${BIG_G}G。毎ゲーム左リールを滑らせずに、上から7・リプレイ・7の形で止める（中段がリプレイ）。成功${BITA_OK}枚、失敗${BITA_NG}枚`:k==='sanj'?`侍ラッシュ ${AT_G}G（押し順ナビ）`:`扉チャンス。前兆${ZEN_G}Gの間、中リールに赤7を止めると扉-1、中段に滑りなしで止めると扉-2。最後に8択`],...(P.m.reg?[['7・7・BAR',`REG ${REG_G}G。毎ゲーム${REG_PAY}枚`]]:[])];
  return `<div class="res" style="font-size:13px;grid-template-columns:auto 1fr">${rows.map(([a,b])=>`<span>${a}</span><b style="font-family:var(--body);font-weight:500;text-align:left">${b}</b>`).join('')}</div>
  <p class="sub" style="margin-top:6px">天井：最後の当たりから${CEIL[P.m.kind]}Gで必ずボーナス。1回3枚。左リールから止める「順押し」なら、ベルとリプレイは必ずそろいます。左以外から止める「変則押し」では取りこぼすことがあります。ボーナスはレバーを引いた時か、リールが止まった後にランプで知らせます。左と中は赤7、右リールに7が止まればBIG、BARが滑ってくればREGです（右の7の2コマ上にBAR）。そろえるラインは5本のどれでもかまいません。BARが一列に並ぶのはリーチ目です。通常時は左リールにBARを狙っておくと、チェリーもスイカも取りこぼしません。</p>`;
}
function tick(){const sk=Math.random()<.1*S.upg.body;if(P.g%12===0&&!sk)S.hun=clamp(S.hun-1);if(P.g%20===0&&!sk)S.hp=clamp(S.hp-1);if(P.g%15===0)S.fun=clamp(S.fun+1);if(S.hun<=0&&P.g%5===0)S.hp=clamp(S.hp-1)}
function doorHTML(){return `<p class="lead" style="text-align:center;font-size:18px">8つの扉から1つ選べ（残り${P.doors.length}）</p><div class="picks p8">${[0,1,2,3,4,5,6,7].map(d=>`<button class="door ${P.doors.includes(d)?'':'gone'}" type="button" data-a="door" data-d="${d}" ${P.doors.includes(d)?'':'disabled'}>${d+1}</button>`).join('')}</div><p class="sub">当たりなら ${DOOR_WIN}枚、外れでも ${DOOR_LOSE}枚</p>`}
function contHTML(){return `<p class="lead" style="text-align:center;font-size:18px">継続をかけた3択。正解なら +${AT_ADD}G</p><div class="picks p3">${['左','中','右'].map((n,i)=>`<button class="door" type="button" data-a="cont" data-d="${i}">${n}</button>`).join('')}</div>`}
function pickDoor(d){
  const win=d===P.winDoor;gain(win?DOOR_WIN:DOOR_LOSE,win?'扉 大当たり':'扉 外れ');
  if(win){SND.fan();S.fun=clamp(S.fun+12)}else S.fun=clamp(S.fun+4);
  P.mode='normal';P.doors=null;logMsg('扉チャンス終了','end');save();renderPlay();
}
function pickCont(d){
  if(d===P.contWin){P.mode='at';P.left=AT_ADD;SND.fan();say('ラッシュ継続',`3択正解 +${AT_ADD}G`,'hot')}else{P.mode='normal';logMsg('ラッシュ終了','end');S.fun=clamp(S.fun+6)}
  save();renderPlay();
}
function randomStops(){for(let t=0;t<60;t++){reels.forEach(r=>{r.pos=Math.floor(Math.random()*N);r.final=r.pos;r.state='stop'});const fs=reels.map(r=>r.pos);if(!lineWins(fs,reels).length&&!bonusLines(fs,reels,'R7').length&&!bonusLines(fs,reels,'BAR').length&&![0,1,2].some(row=>['CH','WM'].includes(symAt(reels[0],fs[0],row))))break}if(P)P.wins=null}
// オートで n ゲーム回す。回している間は、どのオートのボタンも「止める」になる
async function autoPlay(games){
  if(P.spinning||P.autoRun)return;
  if(P.pend||P.mode==='align'){say('当たりの気配','ここからは手で打とう','hot');return}
  P.autoRun=true;P.autoStop=false;sync();
  for(let n=0;n<games&&!P.autoStop;n++){
    if(P.g>=CLOSE_MIN-OPEN_MIN){P.autoRun=false;return quit(true)}
    if(P.medals<3&&!borrow()){toast('お金が足りません');break}
    const f=roll(mach(),P.s,Math.random()),k=P.m.kind;
    P.since++;if(P.since>=CEIL[k]){P.pend='BIG';P.ceilHit=true;P.since--;break}
    if(f==='BIG'||f==='REG'){P.pend=f;P.since--;break}
    P.medals-=3;P.g++;P.ng=(P.ng||0)+1;tick();
    if(f==='RP')gain(PAY.RP);
    else if(f==='BL'){if(k==='sanj'){const ok=Math.random()<1/3;gain(ok?PAY.BLok:PAY.BLng)}else gain(PAY.BL)}
    else if(f==='CH'){if(Math.random()<.67){gain(k==='fuku'?PAY.CHf:PAY.CHo);if(Math.random()<P.m.dup){P.mode='align';P.bonus=P.m.reg&&Math.random()<.4?'REG':'BIG';say('チェリー重複','ボーナス確定！','hot');SND.fan();break}}}
    else if(f==='WM'&&k==='fuku'){if(Math.random()<.18)gain(PAY.WM)}
    randomStops();
    $('.counter').outerHTML=counterHTML();const st2=$('.stats');if(st2)st2.outerHTML=statsHTML();status();
    await new Promise(z=>setTimeout(z,110));
    if(!P||!P.autoRun)return; // 途中で「やめる」を押した
    if(S.hp<=0){P.autoRun=false;return collapse()}
  }
  P.autoRun=false;P.autoStop=false;sync();S.play.medals=P.medals;S.play.inv=P.inv;save();
  if(P.pend||P.mode==='align')say('当たりの気配','ここからは手で打とう','hot');
  renderPlay();
}
function quit(closed){
  const out=P.medals*P.rate,net=out-P.inv;S.money+=out;S.peak=Math.max(S.peak,S.money);
  recordHist(P.hall,P.m.n,net);
  if(FL()&&FL().ms[P.unit]){FL().ms[P.unit].since=P.since;FL().ms[P.unit].taken=true;FL().ms[P.unit].played=true}
  if(net>=50000)grant('win50');if(P.ev&&P.s===6)grant('six');
  S.phase='evening';S.play=null;const p=P;P=null;stopReelsLoop();save();status();
  $('#view').innerHTML=`<p class="lead">${closed?'閉店の音楽が流れた。':'今日はここまで。'}</p>
  <div class="res"><span>台</span><b>${p.m.n}（設定${p.s}だった）</b><span>回転数</span><b>${p.g}G（台は今 ${p.since}Gハマり）</b><span>BIG・ラッシュ／REG</span><b>${p.big}回／${p.reg||0}回</b><span>投資</span><b>${yen(p.inv)}</b><span>回収</span><b>${yen(out)}</b><span>収支</span><b class="big ${net>=0?'pos':'neg'}">${net>=0?'+':''}${yen(net)}</b></div>
  <button class="btn" type="button" data-a="home">家に帰る</button>`;
}
function collapse(){
  const p=P;quit(false);S.money-=20000;S.hp=30;S.phase='evening';save();status();
  $('#view').insertAdjacentHTML('afterbegin','<p class="lead" style="color:var(--bad)">ホールで倒れて病院に運ばれた。治療費 ¥20,000</p>');
}
function cashOutStale(){const p=S.play;if(!p)return;S.money+=p.medals*p.rate;S.peak=Math.max(S.peak,S.money);recordHist(p.hall,p.m,p.medals*p.rate-p.inv);S.play=null;S.phase='evening';save()}
// 1回打つごとの収支を残す。日ごとの一覧は直近 HIST_MAX 回、通算（合計・勝ち・負け・最高）は全部
function recordHist(hall,m,v){S.hist.push({day:S.day,hall,m,v});S.hist=S.hist.slice(-HIST_MAX);
  const t=S.tot;t.sum+=v;t.n++;if(v>0)t.win++;else if(v<0)t.lose++;t.best=Math.max(t.best,v)}

/* ---------- loop for reels ---------- */
let reelRAF=0;
function startReelsLoop(){cancelAnimationFrame(reelRAF);const loop=now=>{if(!P){return}for(const r of reels){if(r.state==='slide'&&now>=r.tEnd){r.state='stop';r.pos=mod(r.final);const f=r.onStop;r.onStop=null;if(f)f()}}if(document.body.contains(cv))drawReels(now);reelRAF=requestAnimationFrame(loop)};reelRAF=requestAnimationFrame(loop)}
function stopReelsLoop(){cancelAnimationFrame(reelRAF)}

/* ---------- routing ---------- */
function route(){if(S.play)cashOutStale();if(P)return renderPlay();renderHome()}
// 下のタブバー。打っている最中・バイト・ルーレットの途中は隠す（その画面で tabs(null)）
function tabs(t){setTabbar(t,go=>{if(go==='home')renderHome();else if(go==='halls')renderHalls();else if(go==='shop')renderShop(shopTab);else renderMe(meTab);window.scrollTo(0,0)})}
$('#view').addEventListener('click',e=>{
  // 部屋の家具は絵の透けたところでは押せない。指の下で絵が描かれている一番手前の家具を探す（キーボードの操作はボタンのまま）
  if(e.target.id==='room'){const id=furnAt(e.clientX,e.clientY);if(id)act('takeF',{dataset:{id}});return}
  const b=e.target.closest('[data-a]');if(!b||b.disabled)return;act(b.dataset.a,b)});
// ボタン（data-a）と購入の確認画面から呼ぶ
function act(a,b){const i=+b.dataset.i,id=b.dataset.id;
  if(a==='home'){renderHome()}
  else if(a==='ask')askBuy(b.dataset.k);
  else if(a==='verTap'){const n=Date.now();devTaps=n-devTapAt<DEV_TAP_MS?devTaps+1:1;devTapAt=n;if(devTaps>=DEV_TAPS&&!$('#devPw')){devTaps=0;showDevLogin()}}
  else if(a==='devMoney'){S.money=DEV_MAX_MONEY;S.peak=Math.max(S.peak,DEV_MAX_MONEY);save();renderDev();toast('お金を最大にしました')}
  else if(a==='devUnlock'){devUnlockAll();save();renderDev();toast('全部解放しました')}
  else if(a==='devHeal'){S.hun=100;S.fun=100;S.hp=100;save();renderDev();toast('お腹・娯楽・体調を満タンにしました')}
  else if(a==='update'){if(!onHomeOrSettings())return;save();reloadToLatest(latestBuild)}
  else if(a==='updClose'){noteClosed=true;const n=$('#updNote');if(n)n.remove()}
  else if(a==='putF')putF(id);
  else if(a==='takeF')takeF(id);
  else if(a==='eat'||a==='play'){const x=(a==='eat'?FOODS:PLAYS).find(z=>z.id===id);if(spend(x.p)){apply(x.e);save();SND.coin();toast(x.n+'　'+effText(x.e));renderShop()}}
  else if(a==='furn')renderFurn();
  else if(a==='buyF'){const it=ITEMS[id];if(!ownF(id)&&spend(it.p)){S.inv[id]=(S.inv[id]||0)+1;save();SND.coin();toast(it.n+'を買った。ホームの部屋に置こう');renderShop()}}
  else if(a==='estate')renderEstate();
  else if(a==='move')moveTo(i);
  else if(a==='job')startJob();
  else if(a==='self')renderSelf();
  else if(a==='me')renderMe('set');
  else if(a==='ach')renderAch();
  else if(a==='gift'){const H=hallState(hallIdx);if(H.gift!==S.day&&spend(HALLS[hallIdx].gift)){H.gift=S.day;H.friend=Math.min(100,H.friend+8);save();toast('店員さん「いつもありがとうございます」');renderFloor()}}
  else if(a==='ticket'){const ahead=drawTicket();toast(`${FL().ticket}番。先に${ahead}人が台を選んだ`);renderFloor()}
  else if(a==='upg'){const u=UPG[id],l=S.upg[id];if(l<u.max&&spend(u.cost(l))){S.upg[id]++;save();SND.fan();renderMe()}}
  else if(a==='drops'){if(S.dropDay!==S.day&&spend(1500)){S.dropDay=S.day;save();toast('目がすっきりした');renderMe()}}
  else if(a==='black')renderBlack();
  else if(a==='buyKiban'){if(spend(kibanPrice())){S.kiban++;save();renderShop()}}
  else if(a==='kiban')roulette(i);
  else if(a==='nokiban')sitDown2(i,false);
  else if(a==='sleep')sleep();
  else if(a==='halls')renderHalls();
  else if(a==='hall'){if(S.phase!=='morning')return renderHalls();hallIdx=i;floorSel=-1;renderFloor()}
  else if(a==='sit')sitDown(i);
  else if(a==='floorK'){floorK=id;floorSel=-1;renderFloor()}
  else if(a==='pick'){floorSel=i;renderFloor()}
  else if(a==='auto'){if(P.autoRun)P.autoStop=true;else autoPlay(i)}
  else if(a==='quit')quit(false);
  else if(a==='door')pickDoor(+b.dataset.d);
  else if(a==='cont')pickCont(+b.dataset.d);
}
document.addEventListener('keydown',e=>{
  if(!P||e.repeat)return;
  if(e.code==='Space'&&!e.target.closest('button')){e.preventDefault();lever()}
  const k={KeyJ:0,KeyK:1,KeyL:2}[e.code];if(k!==undefined)stopAt(k,e);
});
// 開発者画面（仕様書 9.3）。「今の版」を続けて押すとパスワード欄が出る
let devTaps=0,devTapAt=0;
function showDevLogin(){
  const v=$('.verbox');if(!v)return;
  v.insertAdjacentHTML('beforeend','<form class="devpw" id="devPw"><input type="password" inputmode="numeric" autocomplete="off" maxlength="12" placeholder="パスワード" aria-label="開発者パスワード"><button class="btn alt" type="submit">開く</button></form>');
  const f=$('#devPw'),inp=f.querySelector('input');inp.focus();
  f.addEventListener('submit',e=>{e.preventDefault();if(inp.value===DEV_PASSWORD){renderDev()}else{inp.value='';toast('パスワードが違います')}});
}
function devUnlockAll(){
  S.devAll=true;
  for(const k of Object.keys(UPG))S.upg[k]=UPG[k].max;
  for(const a of ACH)if(!S.ach[a.id]){S.ach[a.id]=S.day;if(a.id!=='banned')S.title=a.n} // ごほうびのお金は出さない。称号は最後に足した実績名（「前科者」は除く）
  for(const id of Object.keys(ITEMS))if(!placedCount(id)&&!(S.inv[id]>0))S.inv[id]=1;
  S.ban={};
  HALLS.forEach((_,i)=>{hallState(i).friend=100});
}
function renderDev(){
  status();tabs('me');
  $('#view').innerHTML=`<div class="ch">開発者画面</div>
  <p class="sub">動作確認用です。ここでの変更はセーブデータに残ります。</p>
  <button class="cmd" type="button" data-a="devMoney"><b>お金を最大にする</b><span>所持金を ${yen(DEV_MAX_MONEY)} にする</span></button>
  <button class="cmd" type="button" data-a="devUnlock"><b>全部解放する</b><span>3つの店・自己投資の最大レベル・実績と称号すべて・家具を1つずつ・店員さんとの仲100・出入り禁止の解除（実績のごほうびのお金は出ない。家は所持金で買う）</span></button>
  <button class="cmd" type="button" data-a="devHeal"><b>ゲージを満タンにする</b><span>お腹・娯楽・体調を100にする</span></button>
  <button class="btn alt" type="button" data-a="me">設定に戻る</button>`;
}
// 版の確認。起動したときと、しばらくしてアプリに戻ってきたときに、公開されている最新の版と比べる
// （ホーム画面に置いたアプリは閉じても読み直されないことがあるので、更新ボタンで読み直せるようにする）
let latestBuild=null,latestState='checking',lastCheck=0;
function verText(){if(latestState==='checking')return '最新の版を確かめています…';if(latestState==='none')return '最新の版を確かめられませんでした（通信できないときなど）';if(latestState==='same')return 'これが最新の版です';return '新しい版があります：'+buildLabel(latestBuild)}
function verBox(){return `<section class="verbox" aria-label="アプリの版"><p data-a="verTap">今の版：${buildLabel(CURRENT_BUILD)}</p><p class="v-latest${latestState==='newer'?' newer':''}" aria-live="polite">${verText()}</p><button class="btn${latestState==='newer'?'':' alt'}" type="button" data-a="update">${latestState==='newer'?'最新の版に更新する':'読み直す'}</button></section>`}
// 新しい版の知らせはホーム画面の上にだけ出す（打っている最中・ルーレット・バイトの途中では読み直せないように）
let noteClosed=false;
function updNote(){return latestState==='newer'&&!noteClosed?'<div class="upd-note" id="updNote" role="status"><span>新しい版があります</span><button type="button" data-a="update">更新する</button><button type="button" class="u-close" data-a="updClose" aria-label="とじる">×</button></div>':''}
function checkLatest(){lastCheck=Date.now();fetchLatestBuild().then(l=>{
  latestBuild=l;latestState=CURRENT_BUILD.id==='dev'||(l&&l.id===CURRENT_BUILD.id)?'same':!l?'none':'newer';
  const v=$('.verbox');
  // パスワード欄を開いているときは消さないよう、版の欄は中身だけ書き換える
  if(v){const nb=document.createElement('div');nb.innerHTML=verBox();const fresh2=nb.firstElementChild;
    for(const sel of ['.v-latest','[data-a=update]']){const a2=v.querySelector(sel),b2=fresh2.querySelector(sel);if(a2&&b2)a2.replaceWith(b2)}}
  // 知らせはホーム画面にだけ出す（ほかの画面の途中で読み直して、結果をやり直せないように）
  if(P||!$('#room'))return;
  const old=$('#updNote');if(old)old.remove();
  if(updNote())$('#view').insertAdjacentHTML('afterbegin',updNote())})}
function onHomeOrSettings(){return !P&&(!!$('#room')||!!$('.verbox'))}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&Date.now()-lastCheck>10*60*1000)checkLatest()});
checkLatest();
loadSymbols(()=>{const st=$('#stripT');if(st)drawStripTable(st)});
route();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(P)layout()});

}
