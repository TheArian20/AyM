'use strict';

// El contenido de la dedicatoria se puede personalizar aquí.
const CONFIG = {
  date: '2026-07-09T00:00:00-05:00',
  letter: [
    'Quería regalarte algo que tuviera tiempo, intención y un poco de todo lo que me haces sentir. Algo que pudieras abrir sin prisa, sabiendo que lo pensé para ti.',
    'Por eso están las estrellas. Por eso están las gerberas. No porque un universo alcance para explicar lo que siento, sino porque hay cosas que merecen algo más que un mensaje escrito de paso.',
    'Desde el 9 de julio de 2026, tu nombre tiene un lugar distinto en mi vida. No quiero llenar esta carta de promesas enormes. Prefiero decirte algo que quiero cuidar en lo cotidiano: seguir eligiendo estar contigo, escucharte y encontrar maneras de hacerte bien.',
    'Este jardín lleva tus flores favoritas. Y esta carta lleva lo que importa de verdad: el cariño con el que hice cada detalle, pensando en la persona que iba a encontrar al otro lado.',
    'Michelle, me gusta que seas tú. Me gusta que seamos nosotros. Y me gusta todo lo que todavía nos queda por vivir.'
  ],
  stars: [
    { title: 'El encuentro', label: 'ENCUENTRO', text: 'El 9 de julio de 2026 dejó de ser una fecha cualquiera. Ahora tiene tu nombre, el mío y el comienzo de algo que quiero cuidar.' },
    { title: 'La intención', label: 'INTENCIÓN', text: 'Quise hacerte algo con tiempo y con atención. Que cada detalle te dijera, sin hacer ruido: pensé en ti.' },
    { title: 'Lo cotidiano', label: 'CERCANÍA', text: 'No todo tiene que ser extraordinario. También quiero el valor de lo sencillo: escucharte, estar presente y compartir contigo los días tal como llegan.' },
    { title: 'Tu forma de florecer', label: 'GERBERAS', text: 'Estas flores están aquí porque son tus favoritas. Me gusta conocer los detalles que te hacen feliz y darles un lugar en lo que construyo para ti.' },
    { title: 'Lo que sigue', label: 'POR VENIR', text: 'No sé todas las historias que nos esperan. Sé que quiero vivirlas contigo, con cariño, con respeto y con ganas de seguir encontrándonos.' }
  ]
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const random = (a,b) => a + Math.random() * (b-a);
const clamp = (n,a,b) => Math.min(b,Math.max(a,n));
const lerp = (a,b,f) => a + (b-a)*f;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const canvas = $('#world'), ctx = canvas.getContext('2d');
const garden = $('#garden-canvas'), gc = garden.getContext('2d');
const chapters = ['universo','constelacion','jardin','tiempo','carta'];
let width = innerWidth, height = innerHeight, dpr = 1, chapter = 'universo';
let paused = false, motionChosen = false, time = 0, lastFrame = 0, morph = 0, morphTarget = 0;
let camera = {x:0,y:0}, pointer = {x:0,y:0}, rotation = 0, zoom = 1, dragging = false, dragX = 0;
let flowers = [], chosenHue = 340, selectedStar = -1, transitioning = false;
let letterTimers = [], letterOpened = false, letterComplete = false, saveTimer;
const visited = new Set();
const STORAGE = 'michelle-arian-garden-v2';
const SEEN = 'michelle-arian-stars-v2';
const particles = Array.from({length: width < 700 ? 2100 : 3800}, (_,i) => ({
  r: Math.pow(Math.random(),.65), a:random(0,Math.PI*2), arm:i%4,
  scatter:random(-.24,.24), z:random(-1,1), size:random(.4,1.65), phase:random(0,Math.PI*2)
}));
const sky = Array.from({length:210}, () => ({x:Math.random(),y:Math.random(),z:random(.1,1),phase:random(0,7)}));
let mistTexture;

function createMist(){
  const c = document.createElement('canvas'); c.width = c.height = 600;
  const x = c.getContext('2d');
  for(let i=0;i<50;i++){
    const px=random(70,530),py=random(230,370),r=random(25,95);
    const g=x.createRadialGradient(px,py,0,px,py,r);
    g.addColorStop(0,i%3 ? '#bd83ac08' : '#78a2bb0b');g.addColorStop(1,'#00000000');
    x.fillStyle=g;x.fillRect(px-r,py-r,r*2,r*2);
  }
  return c;
}
mistTexture = createMist();

function positions(){return width<700 ? [[.29,.48],[.62,.44],[.82,.55],[.61,.69],[.25,.66]] : [[.53,.35],[.72,.24],[.87,.41],[.76,.62],[.54,.59]];}

function resize(){
  width=innerWidth;height=innerHeight;dpr=Math.min(devicePixelRatio||1,2);
  for(const c of [canvas,garden]){c.width=Math.round(width*dpr);c.height=Math.round(height*dpr);c.getContext('2d').setTransform(dpr,0,0,dpr,0,0);}
  $$('.star').forEach((s,i)=>{const p=positions()[i];s.style.left=(p[0]*100).toFixed(2)+'%';s.style.top=(p[1]*100).toFixed(2)+'%';});
  draw(0);
}

function draw(dt){
  if(!paused)time+=dt*(reduceMotion.matches&&!motionChosen?.35:1);
  const driftX=Math.sin(time*.27)*.3,driftY=Math.cos(time*.21)*.2;
  camera.x=lerp(camera.x,pointer.x+driftX,paused?0:Math.min(1,dt*2));
  camera.y=lerp(camera.y,pointer.y+driftY,paused?0:Math.min(1,dt*2));
  morph=lerp(morph,morphTarget,paused?1:Math.min(1,dt*1.5));
  ctx.clearRect(0,0,width,height);
  const mobile=width<700,cx=width*(mobile?.64:.71),cy=height*(mobile?.54:.49);
  const ambient=ctx.createRadialGradient(cx,cy,0,cx,cy,width*.65);
  ambient.addColorStop(0,chapter==='jardin'?'#25453835':'#33465230');ambient.addColorStop(1,'#090e1200');
  ctx.fillStyle=ambient;ctx.fillRect(0,0,width,height);
  for(const s of sky){
    const sx=((s.x*width+camera.x*12*s.z)%width+width)%width,sy=s.y*height+camera.y*8*s.z;
    ctx.fillStyle=`rgba(219,218,208,${.2+s.z*.3+Math.sin(time*.45+s.phase)*.14})`;
    ctx.beginPath();ctx.arc(sx,sy,s.z,0,Math.PI*2);ctx.fill();
  }
  if(chapter==='universo'||chapter==='tiempo'||chapter==='carta')drawGalaxy(cx,cy,mobile);
  if(chapter==='constelacion')drawConstellation();
  if(chapter==='jardin')drawGarden(dt);
}

function drawGalaxy(cx,cy,mobile){
  const fade=chapter==='universo'?1:.22,radius=Math.min(width*(mobile?.73:.44),height*.67)*zoom;
  ctx.save();ctx.translate(cx+camera.x*18,cy+camera.y*12);ctx.rotate(-.38+rotation*.08);
  ctx.globalAlpha=fade;ctx.globalCompositeOperation='lighter';
  ctx.drawImage(mistTexture,-radius*1.1,-radius*.72,radius*2.2,radius*1.44);
  for(const p of particles){
    const a=p.arm*Math.PI/2+p.r*7.6+p.scatter+time*.1+rotation;
    const spiral=[Math.cos(a)*p.r,Math.sin(a)*p.r,p.z*(1-p.r)*.075];
    const orbitA=p.a+time*.16+rotation;
    const orbit=[Math.cos(orbitA)*(.36+p.r*.48),Math.sin(orbitA)*(.36+p.r*.48),p.z*.2];
    const ha=p.a+rotation*.1,hx=16*Math.pow(Math.sin(ha),3)/18,hy=-(13*Math.cos(ha)-5*Math.cos(2*ha)-2*Math.cos(3*ha)-Math.cos(4*ha))/18;
    const heart=[hx*Math.sqrt(p.r),hy*Math.sqrt(p.r),p.z*.08];
    const first=clamp(morph,0,1),second=clamp(morph-1,0,1);
    const x=lerp(lerp(spiral[0],orbit[0],first),heart[0],second);
    const y=lerp(lerp(spiral[1],orbit[1],first),heart[1],second);
    const z=lerp(lerp(spiral[2],orbit[2],first),heart[2],second);
    const tilt=.48+camera.y*.12,depth=1/(1+z*.4+y*.12);
    const px=(x+z*camera.x*.12)*radius*depth,py=(y*tilt+z*.65)*radius*depth;
    const beat=morph>1?1+Math.sin(time*1.6)*.025:1;
    ctx.fillStyle=p.r<.25?'#f1d5af':p.arm%2?'#c4a1b5':'#8eaab9';
    ctx.globalAlpha=fade*(.2+(1-p.r)*.6)*( .8+Math.sin(time*.5+p.phase)*.2);
    const size=p.size*depth*(1-p.r*.3);ctx.fillRect(px*beat,py*beat,size,size);
  }
  ctx.globalAlpha=fade;
  if(morph<1.5){
    const glow=ctx.createRadialGradient(0,0,0,0,0,radius*.17);
    glow.addColorStop(0,'#f8e3c695');glow.addColorStop(.1,'#ddbc9450');glow.addColorStop(.4,'#bd8b8d16');glow.addColorStop(1,'#00000000');
    ctx.fillStyle=glow;ctx.fillRect(-radius*.18,-radius*.18,radius*.36,radius*.36);
  }
  ctx.globalAlpha=fade*.22;ctx.strokeStyle='#c4ad81';ctx.lineWidth=.6;
  ctx.beginPath();ctx.ellipse(0,0,radius*.87,radius*.43,0,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.ellipse(0,0,radius*.94,radius*.47,0,.3,2.5);ctx.stroke();
  ctx.restore();
}

function drawConstellation(){
  const points=positions();
  ctx.save();ctx.strokeStyle='#c4ad8140';ctx.lineWidth=1;ctx.setLineDash([3,7]);
  for(let i=0;i<5;i++){
    const a=points[i],b=points[(i+1)%5];
    ctx.beginPath();ctx.moveTo(a[0]*width,a[1]*height);ctx.lineTo(b[0]*width,b[1]*height);ctx.stroke();
    if(visited.has(i)&&visited.has((i+1)%5)){
      ctx.setLineDash([]);ctx.strokeStyle='#c4ad8180';ctx.stroke();ctx.setLineDash([3,7]);ctx.strokeStyle='#c4ad8140';
    }
  }
  ctx.setLineDash([]);
  for(let i=0;i<5;i++){
    const p=points[i],r=selectedStar===i?70:40;
    const g=ctx.createRadialGradient(p[0]*width,p[1]*height,0,p[0]*width,p[1]*height,r);
    g.addColorStop(0,'#c4ad8135');g.addColorStop(1,'#c4ad8100');ctx.fillStyle=g;ctx.fillRect(p[0]*width-r,p[1]*height-r,r*2,r*2);
  }
  ctx.restore();
}

// Gerberas procedurales: dos coronas de pétalos y un disco en espiral.
// Se dibuja cada cabeza una sola vez en un lienzo auxiliar para mantener fluidez.
function gerberaTexture(hue){
  const c=document.createElement('canvas');c.width=c.height=240;const x=c.getContext('2d');x.translate(120,120);
  const ivory=hue==='ivory';
  const color=(light,alpha=1)=>ivory?`hsla(48,18%,${clamp(light+32,52,99)}%,${alpha})`:`hsla(${hue},${hue===43?98:90}%,${light}%,${alpha})`;
  for(let layer=0;layer<3;layer++){
    const count=layer===2?44:27,tip=layer===0?105:layer===1?88:48,base=layer===2?19:24,pw=layer===2?4.8:11;
    for(let i=0;i<count;i++){
      x.save();x.rotate(i*Math.PI*2/count+layer*.085);
      const length=tip*(.97+Math.sin(i*2.4+layer)*.035);
      const shade=x.createLinearGradient(-pw,-base,pw,-length);
      shade.addColorStop(0,color(ivory?55:28));shade.addColorStop(.35,color(46));shade.addColorStop(.7,color(57));shade.addColorStop(1,color(66));x.fillStyle=shade;
      x.shadowColor='#170b122c';x.shadowBlur=2;x.shadowOffsetX=1;
      x.beginPath();x.moveTo(-2,-base);x.bezierCurveTo(-pw*.65,-length*.45,-pw,-length*.82,-pw*.7,-length+4);x.bezierCurveTo(-pw*.4,-length-3,pw*.45,-length-3,pw*.75,-length+4);x.bezierCurveTo(pw,-length*.82,pw*.65,-length*.45,2,-base);x.closePath();x.fill();
      x.shadowBlur=0;x.shadowOffsetX=0;
      for(const vein of [-.4,0,.4]){x.strokeStyle=color(80,vein===0?.35:.16);x.lineWidth=.6;x.beginPath();x.moveTo(vein*2,-base-3);x.quadraticCurveTo(vein*pw,-length*.65,vein*pw*.75,-length+7);x.stroke();}x.restore();
    }
  }
  const disc=x.createRadialGradient(-5,-5,0,0,0,26);
  disc.addColorStop(0,ivory?'#92965a':'#1b1015');disc.addColorStop(.63,ivory?'#aeb37a':'#241316');disc.addColorStop(.78,ivory?'#c6c991':'#76522a');disc.addColorStop(1,ivory?'#dfdfb7':hue===340?'#e8ac66':'#efc447');
  x.fillStyle=disc;x.beginPath();x.arc(0,0,26,0,7);x.fill();
  for(let i=0;i<560;i++){
    const a=i*2.399963, r=Math.sqrt(i/560)*25;
    const edge=r>20;
    x.fillStyle=ivory?(i%2?'#bdc088':'#919958'):edge?(i%3===0?'#ffe19a':i%3===1?'#af7a28':'#e4b449'):(i%3===0?'#48292d':i%3===1?'#140b10':'#30191c');
    x.beginPath();x.arc(Math.cos(a)*r,Math.sin(a)*r,edge?1:.65,0,7);x.fill();
  }
  return c;
}
const textures=new Map();
function getTexture(hue){if(!textures.has(hue))textures.set(hue,gerberaTexture(hue));return textures.get(hue);}
function drawGarden(dt){
  gc.clearRect(0,0,width,height);
  const fog=gc.createRadialGradient(width*.7,height*.65,0,width*.7,height*.65,width*.5);
  fog.addColorStop(0,'#25413365');fog.addColorStop(1,'#0a131900');gc.fillStyle=fog;gc.fillRect(0,0,width,height);
  const ground=height*.86,mobile=width<700,left=mobile?.07:.46,span=mobile?.82:.47;
  for(let i=0;i<55;i++){
    const bx=width*(left+i/55*span),length=(Math.sin(i*5.1)+1)*22+25;
    gc.strokeStyle=i%2?'#52634c36':'#78916b25';gc.lineWidth=1;
    gc.beginPath();gc.moveTo(bx,ground+15);gc.quadraticCurveTo(bx+Math.sin(time*.35+i)*8,ground-length*.7,bx+Math.sin(i)*15,ground-length);gc.stroke();
  }
  for(const f of [...flowers].sort((a,b)=>a.depth-b.depth)){
    if(!paused)f.age+=dt;
    const grow=1-Math.pow(1-clamp(f.age/2,0,1),3),open=1-Math.pow(1-clamp((f.age-.45)/1.8,0,1),3);
    const bx=width*(left+f.x*span),by=ground+f.depth*height*.035;
    const stem=height*(mobile?.15:.25)*f.length*grow,sway=Math.sin(time*.9+f.phase)*(8+f.depth*9)+camera.x*6;
    const flowerX=bx+sway+f.bend*stem*.1,flowerY=by-stem;
    gc.save();gc.lineWidth=2+f.depth*1.6;
    const sg=gc.createLinearGradient(bx-2,0,bx+3,0);sg.addColorStop(0,'#324c3c');sg.addColorStop(.5,'#71816a');sg.addColorStop(1,'#283e32');gc.strokeStyle=sg;
    gc.beginPath();gc.moveTo(bx,by);gc.bezierCurveTo(bx-f.bend*10,by-stem*.3,flowerX+f.bend*8,by-stem*.8,flowerX,flowerY);gc.stroke();
    // Hojas basales discretas; el tallo floral de la gerbera no lleva hojas.
    gc.fillStyle='#3e58434a';gc.beginPath();gc.moveTo(bx,by);gc.bezierCurveTo(bx-30,by-45,bx-27,by-62,bx-12,by-22);gc.quadraticCurveTo(bx,by-4,bx,by);gc.fill();
    gc.translate(flowerX,flowerY);gc.rotate(f.tilt+Math.sin(time*.5+f.phase)*.025);
    const diameter=(mobile?83:125)*f.size*open;
    gc.scale(1,.85+f.depth*.12);gc.globalAlpha=.94+f.depth*.06;
    gc.drawImage(getTexture(f.hue),-diameter/2,-diameter/2,diameter,diameter);gc.restore();
  }
  gc.save();gc.globalCompositeOperation='lighter';
  for(let i=0;i<25;i++){
    const x=width*(left+(Math.sin(i*15.1)+1)/2*span)+Math.sin(time*.1+i)*12;
    const y=height*(.48+(Math.sin(i*8.3+time*.09)+1)*.16);
    gc.fillStyle=`rgba(218,204,157,${.15+Math.sin(time*.6+i)*.12})`;gc.beginPath();gc.arc(x,y,1,0,7);gc.fill();
  }
  gc.restore();
}

function storeGarden(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{localStorage.setItem(STORAGE,JSON.stringify(flowers.map(({age,...f})=>f)));}catch{$('#garden-status').textContent='El jardín permanece disponible durante esta visita.';}},250);}
function plant(x=.5,depth=random(.2,1),hue=chosenHue,silent=false){
  if(flowers.length>=48)flowers.shift();
  flowers.push({x:clamp(x,.02,.98),depth:clamp(depth,0,1),hue,length:random(.65,1.5),size:random(.72,1.2),phase:random(0,7),bend:random(-1,1),tilt:random(-.25,.25),age:paused?3:0});
  $('#garden-status').textContent=`${flowers.length} gerberas en tu jardín, Michelle.`;
  storeGarden();
}
function loadPersonalState(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');
    if(Array.isArray(saved))flowers=saved.slice(-48).filter(f=>f&&Number.isFinite(f.x)&&Number.isFinite(f.depth)&&Number.isFinite(f.length)&&Number.isFinite(f.size)&&Number.isFinite(f.phase)&&Number.isFinite(f.bend)&&Number.isFinite(f.tilt)&&[340,20,43,'ivory'].includes(f.hue)).map(f=>({...f,x:clamp(f.x,.02,.98),depth:clamp(f.depth,0,1),length:clamp(f.length,.65,1.5),size:clamp(f.size,.72,1.2),age:4}));
    const seen=JSON.parse(localStorage.getItem(SEEN)||'[]');if(Array.isArray(seen))seen.filter(n=>Number.isInteger(n)&&n>=0&&n<5).forEach(n=>visited.add(n));
  }catch{/* Unavailable storage does not block the gift. */}
}

function updateProgress(){
  $('#discovery-count').textContent=`${visited.size} / 5`;$('#discovery-progress').style.width=visited.size/5*100+'%';
  $$('.star').forEach((b,i)=>b.classList.toggle('visited',visited.has(i)));
  $('#constellation-hint').textContent=visited.size===5?'Nuestra constelación está completa. El jardín te espera.':'Elige una estrella para descubrir su dedicatoria.';
  try{localStorage.setItem(SEEN,JSON.stringify([...visited]));}catch{}
}
function selectStar(i){
  selectedStar=i;visited.add(i);const data=CONFIG.stars[i];
  $('#star-number').textContent=`ESTRELLA 0${i+1} / 05`;
  $('#star-title').textContent=data.title;$('#star-text').textContent=data.text;$('#star-detail').hidden=false;
  $('#next-star').innerHTML=i===4?'Ir a tus gerberas <span>→</span>':'Descubrir la siguiente <span>↗</span>';
  updateProgress();
}
CONFIG.stars.forEach((s,i)=>{
  const b=document.createElement('button');b.className='star';b.setAttribute('aria-label',`Leer estrella ${i+1}: ${s.title}`);
  const label=document.createElement('span');label.className='star-label';label.textContent=`0${i+1} — ${s.label}`;b.append(label);b.onclick=()=>selectStar(i);$('#constellation-stars').append(b);
});
$('#close-star').onclick=()=>{$('#star-detail').hidden=true;if(selectedStar>=0)$$('.star')[selectedStar].focus();selectedStar=-1;};
$('#next-star').onclick=()=>selectedStar===4?go('jardin'):selectStar((selectedStar+1)%5);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#star-detail').hidden)$('#close-star').click();});

function showChapter(next){
  chapter=next;
  $$('.chapter').forEach(c=>{c.hidden=c.id!==next;c.classList.toggle('active',c.id===next);});
  $$('.nav').forEach(b=>{const active=b.dataset.go===next;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  $('#chapter-number').textContent=`0${chapters.indexOf(next)+1} / 05`;
  $('#next-chapter').setAttribute('aria-label',next==='carta'?'Volver al universo':'Ir al siguiente capítulo');
  if(next==='jardin'&&!flowers.length){for(let i=0;i<19;i++)plant(random(.13,.87),random(.15,.9),[340,340,20,43,'ivory'][i%5],true);}
  $('#garden-status').textContent=`${flowers.length} gerberas en tu jardín, Michelle.`;
  if(next!=='constelacion'){$('#star-detail').hidden=true;selectedStar=-1;}
  draw(0);
}
function go(next,updateHash=true){
  if(!chapters.includes(next)||next===chapter||transitioning)return;
  if(updateHash)try{history.replaceState(null,'','#'+next);}catch{}
  if(paused){showChapter(next);return;}
  transitioning=true;$('#transition').classList.add('cover');
  setTimeout(()=>{showChapter(next);$('#transition').classList.remove('cover');setTimeout(()=>{transitioning=false;},320);},300);
}
$$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));$('.monogram').onclick=e=>{e.preventDefault();go('universo');};$('#begin').onclick=()=>go('constelacion');$('#next-chapter').onclick=()=>go(chapters[(chapters.indexOf(chapter)+1)%chapters.length]);
addEventListener('hashchange',()=>go(location.hash.slice(1),false));
$$('.view').forEach(b=>b.onclick=()=>{morphTarget={galaxy:0,orbit:1,heart:2}[b.dataset.view];$$('.view').forEach(v=>{const active=v===b;v.classList.toggle('active',active);v.setAttribute('aria-pressed',String(active));});});
$$('.swatch').forEach(b=>b.onclick=()=>{chosenHue=b.dataset.hue==='ivory'?'ivory':Number(b.dataset.hue);$('#color-name').textContent=b.getAttribute('aria-label').toUpperCase();$$('.swatch').forEach(v=>{v.classList.toggle('active',v===b);v.setAttribute('aria-pressed',String(v===b));});});
garden.addEventListener('pointerdown',e=>{
  const mobile=width<700,left=mobile?.07:.46,span=mobile?.82:.47;
  if((!mobile&&e.clientX<width*.43)||(mobile&&e.clientY<height*.48)||e.clientY>height*.9)return;
  plant((e.clientX/width-left)/span,clamp((e.clientY/height-.5)/.35,0,1));
});
$('#bouquet').onclick=()=>{for(let i=0;i<11;i++)plant(random(.12,.88),random(.25,.95),chosenHue,true);};
$('#clear-garden').onclick=()=>{flowers=[];storeGarden();$('#garden-status').textContent='Un nuevo comienzo. Elige un color y hazlo florecer.';draw(0);};
$('#save-garden').onclick=()=>{
  const c=document.createElement('canvas');c.width=1600;c.height=1000;const x=c.getContext('2d');
  x.fillStyle='#0b1416';x.fillRect(0,0,c.width,c.height);
  const g=x.createRadialGradient(950,520,0,950,520,700);g.addColorStop(0,'#2b4338');g.addColorStop(1,'#0b1416');x.fillStyle=g;x.fillRect(0,0,1600,1000);
  if(!flowers.length){$('#garden-status').textContent='Primero haz florecer algunas gerberas para guardar tu jardín.';return;}
  for(const f of [...flowers].sort((a,b)=>a.depth-b.depth)){
    const bx=300+f.x*1100,by=830+f.depth*40,len=240*f.length,fx=bx+f.bend*len*.1,fy=by-len;
    x.strokeStyle='#647b59';x.lineWidth=3;x.beginPath();x.moveTo(bx,by);x.bezierCurveTo(bx-10,by-len*.3,fx+10,by-len*.8,fx,fy);x.stroke();x.save();x.translate(fx,fy);x.rotate(f.tilt);x.scale(1,.85+f.depth*.1);x.drawImage(getTexture(f.hue),-65*f.size,-65*f.size,130*f.size,130*f.size);x.restore();
  }
  x.fillStyle='#d1bb93';x.font='italic 54px Georgia';x.fillText('Un jardín para Michelle.',90,140);
  x.font='16px sans-serif';x.fillStyle='#a6b0a3';x.fillText('DE ARIAN  /  09.07.2026',94,182);x.fillText('DONDE TODO FLORECE',90,930);
  c.toBlob(blob=>{if(!blob){$('#garden-status').textContent='No se pudo crear la imagen. Inténtalo de nuevo.';return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Gerberas-para-Michelle.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);$('#garden-status').textContent='Tu jardín está listo para guardar como imagen.';},'image/png');
};

function clearLetterTimers(){letterTimers.forEach(clearTimeout);letterTimers=[];}
function revealLetter(all=false){
  clearLetterTimers();letterOpened=true;$('#letter-sealed').hidden=true;$('#letter-content').hidden=false;$('#letter-paragraphs').replaceChildren();
  CONFIG.letter.forEach((text,i)=>{
    const append=()=>{const p=document.createElement('p');p.className='letter-paragraph';p.textContent=text;$('#letter-paragraphs').append(p);};
    if(all||paused)append();else letterTimers.push(setTimeout(append,i*1900));
  });
  const complete=()=>{letterComplete=true;$('.letter-signature').hidden=false;$('#read-all').hidden=true;};
  $('.letter-signature').hidden=!(all||paused);$('#read-all').hidden=all||paused;
  if(all||paused)complete();else{letterComplete=false;letterTimers.push(setTimeout(complete,CONFIG.letter.length*1900));}
}
$('#open-letter').onclick=()=>{revealLetter();};$('#read-all').onclick=()=>revealLetter(true);

function updateClock(){
  const now=new Date(),elapsed=Math.max(0,now-new Date(CONFIG.date)),days=Math.floor(elapsed/86400000);
  $('#days').textContent=`${days} días desde nuestro comienzo`;$('#elapsed-days').textContent=days;
  $('#elapsed-hours').textContent=String(Math.floor(elapsed/3600000)%24).padStart(2,'0');
  $('#elapsed-minutes').textContent=String(Math.floor(elapsed/60000)%60).padStart(2,'0');
  $('#elapsed-seconds').textContent=String(Math.floor(elapsed/1000)%60).padStart(2,'0');
  $('#today-label').textContent=new Intl.DateTimeFormat('es-CO',{day:'2-digit',month:'short',year:'numeric',timeZone:'America/Bogota'}).format(now).toUpperCase();
}

// M?sica de fondo local. Se inicia solo al pulsar el control de sonido.
const music = new Audio('assets/audio/lover-remix.mp3');
music.loop = true;
music.preload = 'none';
music.volume = 0.45;
let audioOn = false, soundBusy = false;
function updateSound(){
  $('#sound-label').textContent = audioOn ? 'Lover ? Pausar' : 'Escuchar Lover';
  $('#sound').setAttribute('aria-pressed', String(audioOn));
  document.body.classList.toggle('sound-on', audioOn);
}
function musicError(){
  audioOn = false;
  music.pause();
  updateSound();
  $('#sound-label').textContent = 'Reintentar m?sica';
}
async function toggleSound(){
  if(soundBusy)return;
  soundBusy = true;
  try{
    if(audioOn){ music.pause(); audioOn = false; }
    else{ await music.play(); audioOn = true; }
    updateSound();
  }catch{ musicError(); }
  finally{ soundBusy = false; }
}
music.addEventListener('error', musicError);
updateSound();
$('#sound').onclick=toggleSound;
function updateMotion(){document.body.classList.toggle('paused',paused);$('#motion').textContent=paused?'▷':'Ⅱ';$('#motion').setAttribute('aria-label',paused?'Reanudar movimiento':'Pausar movimiento');$('#motion').setAttribute('aria-pressed',String(paused));if(paused&&letterOpened&&!letterComplete)revealLetter(true);}
$('#motion').onclick=()=>{motionChosen=true;paused=!paused;updateMotion();};
// La preferencia del dispositivo suaviza el movimiento, sin congelar la página.
// addListener mantiene compatibilidad con versiones antiguas de Safari.
if(reduceMotion.addEventListener)reduceMotion.addEventListener('change',updateMotion);
else if(reduceMotion.addListener)reduceMotion.addListener(updateMotion);

document.addEventListener('pointermove',e=>{
  if(paused)return;pointer.x=(e.clientX/width-.5)*2;pointer.y=(e.clientY/height-.5)*2;
  if(dragging&&chapter==='universo'){rotation+=(e.clientX-dragX)*.004;dragX=e.clientX;}
});
document.addEventListener('pointerdown',e=>{if(chapter==='universo'&&!e.target.closest('button,a,header,footer')){dragging=true;dragX=e.clientX;}});
addEventListener('pointerup',()=>{dragging=false;});addEventListener('pointercancel',()=>{dragging=false;});addEventListener('blur',()=>{dragging=false;});
$('#universo').addEventListener('wheel',e=>{if(!e.target.closest('button'))zoom=clamp(zoom-e.deltaY*.00025,.7,1.35);},{passive:true});
document.addEventListener('visibilitychange',()=>{
  lastFrame=0;
  if(document.hidden)music.pause();
  else if(audioOn)music.play().catch(musicError);
});
function frame(now){const dt=lastFrame?Math.min((now-lastFrame)/1000,.05):0;lastFrame=now;if(!document.hidden)draw(dt);requestAnimationFrame(frame);}
loadPersonalState();updateProgress();updateMotion();updateClock();setInterval(updateClock,1000);resize();
const initial=location.hash.slice(1);if(chapters.includes(initial))showChapter(initial);
addEventListener('resize',resize);requestAnimationFrame(frame);
