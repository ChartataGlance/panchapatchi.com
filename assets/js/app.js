const birds=[
  {name:'Cock',icon:'🐓',cls:'bird-cock'},
  {name:'Peacock',icon:'🦚',cls:'bird-peacock'},
  {name:'Vulture',icon:'🦅',cls:'bird-vulture'},
  {name:'Owl',icon:'🦉',cls:'bird-owl'},
  {name:'Crow',icon:'🐦‍⬛',cls:'bird-crow'}
];
const activities=['Rule','Eat','Walk','Sleep','Death'];
const dayOrder=[0,1,2,3,4];
const nightOrder=[4,3,2,1,0];
const WEEK=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0');
function fmt(d){return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`}
function dur(ms){let s=Math.round(ms/1000),h=Math.floor(s/3600);s%=3600;let m=Math.floor(s/60);s%=60;return `${pad(h)}:${pad(m)}:${pad(s)}`}
function sec(ms){return Math.round(ms/1000)}
function add(d,ms){return new Date(d.getTime()+ms)}
function moonAngle(date=new Date()){
  // Astronomical-lite: phase angle from known new moon. UI still maps 0° new moon at 3 o'clock, 180° full moon at 9 o'clock.
  const synodic=29.530588853;
  const knownNew=Date.UTC(2000,0,6,18,14,0);
  const days=(date.getTime()-knownNew)/86400000;
  return ((days%synodic)+synodic)%synodic/synodic*360;
}
function renderMoon(){
  const orbit=$('moonOrbit'); orbit.innerHTML='';
  const angle=moonAngle(); const block=Math.floor(angle/12)%30;
  const lit=Math.round(((1-Math.cos(angle*Math.PI/180))/2)*30);
  const rect=250, center=125, radius=106;
  for(let i=0;i<30;i++){
    const a=i*12*Math.PI/180;
    const x=center+radius*Math.cos(a);
    const y=center-radius*Math.sin(a);
    const b=document.createElement('div');
    b.className='moon-block'+(i<lit?' lit':'')+(i===block?' current':'');
    b.textContent=i; b.style.left=(x/rect*100)+'%'; b.style.top=(y/rect*100)+'%'; orbit.appendChild(b);
  }
  const dot=document.createElement('div'); dot.className='moon-dot'; orbit.appendChild(dot);
  requestAnimationFrame(()=>{const a=angle*Math.PI/180; dot.style.left=(center+radius*Math.cos(a))/rect*100+'%'; dot.style.top=(center-radius*Math.sin(a))/rect*100+'%'; dot.style.transform='translate(-50%,-50%) rotate(360deg)';});
  $('moonLabel').textContent=`Moon ${Math.round(angle)}° · Block ${block}/30`;
  $('moonMeta').textContent= angle<180?'Waxing 0° → 180°':'Waning 180° → 360°';
  return {angle,block,phase:angle<180?'Waxing':'Waning'};
}
function fallbackSun(){
  const now=new Date();
  return {sunrise:new Date(now.getFullYear(),now.getMonth(),now.getDate(),5,26,22),sunset:new Date(now.getFullYear(),now.getMonth(),now.getDate(),21,49,27)};
}
function makeTimeline(){
  const now=new Date();
  const {sunrise,sunset}=fallbackSun();
  const isDay=now>=sunrise&&now<sunset;
  const start=isDay?sunrise:sunset;
  const end=isDay?sunset:add(sunrise,24*3600*1000);
  const total=end-start;
  const partMs=total/5, subMs=partMs/5, actMs=subMs/5;
  const order=isDay?dayOrder:nightOrder;
  const moon=renderMoon();
  const weekday=WEEK[now.getDay()];
  const tree=$('tree'); tree.innerHTML='';
  const root=document.createElement('details'); root.className='node'; root.open=true;
  root.innerHTML=`<summary><span><span class="node-title">${moon.phase} Moon</span><br><span class="node-meta">${Math.round(moon.angle)}° · Block ${moon.block}</span></span><span>▾</span></summary><div class="children" id="weekNode"></div>`;
  tree.appendChild(root);
  const week=root.querySelector('#weekNode');
  const dayNode=document.createElement('details'); dayNode.className='node'; dayNode.open=true;
  dayNode.innerHTML=`<summary><span><span class="node-title">${weekday}</span><br><span class="node-meta">Today</span></span><span>▾</span></summary><div class="children" id="periodNode"></div>`;
  week.appendChild(dayNode);
  const period=dayNode.querySelector('#periodNode');
  const periodNode=document.createElement('details'); periodNode.className='node'; periodNode.open=true;
  periodNode.innerHTML=`<summary><span><span class="node-title">${isDay?'Day':'Night'}</span><br><span class="node-meta">${fmt(start)} → ${fmt(end)} · ${dur(total)}</span></span><span>▾</span></summary><div class="children" id="partsNode"></div>`;
  period.appendChild(periodNode);
  const parts=periodNode.querySelector('#partsNode');
  let current=null;
  for(let p=0;p<5;p++){
    const pStart=add(start,p*partMs), pEnd=add(start,(p+1)*partMs);
    const bird=birds[order[p]];
    const part=document.createElement('details'); part.className=`part-card ${bird.cls}`; part.open=now>=pStart&&now<pEnd;
    part.innerHTML=`<summary><span><span class="node-title">Part ${p+1}: ${bird.icon} ${bird.name}</span><br><span class="node-meta">${fmt(pStart)} → ${fmt(pEnd)} · ${dur(partMs)}</span></span><span>▾</span></summary><div class="children"></div>`;
    const subWrap=part.querySelector('.children');
    for(let s=0;s<5;s++){
      const sStart=add(pStart,s*subMs), sEnd=add(pStart,(s+1)*subMs);
      const sub=document.createElement('div'); sub.className='sub-card';
      sub.innerHTML=`<div class="sub-head"><div><strong>Sub ${s+1}</strong><div class="time-line">${fmt(sStart)} → ${fmt(sEnd)} · ${dur(subMs)}</div></div><div class="small">${sec(subMs)} sec</div></div><div class="activity-list"></div>`;
      const acts=sub.querySelector('.activity-list');
      for(let a=0;a<5;a++){
        const aStart=add(sStart,a*actMs), aEnd=add(sStart,(a+1)*actMs);
        const active=now>=aStart&&now<aEnd;
        const row=document.createElement('div'); row.className='activity'+(active?' active':'');
        row.innerHTML=`<div class="num">${a+1}</div><div><div class="activity-name">${activities[a]} ${active?'· ACTIVE NOW':''}</div><div class="small">${fmt(aStart)} → ${fmt(aEnd)} · ${dur(actMs)} · ${sec(actMs)} sec</div></div>`;
        acts.appendChild(row);
        if(active) current={bird,activity:activities[a],p:p+1,s:s+1,a:a+1,from:aStart,to:aEnd,duration:actMs,weekday,period:isDay?'Day':'Night',moon};
      }
      subWrap.appendChild(sub);
    }
    parts.appendChild(part);
  }
  if(!current){ current={bird:birds[0],activity:'Rule',p:1,s:1,a:1,from:start,to:add(start,actMs),duration:actMs,weekday,period:isDay?'Day':'Night',moon}; }
  $('currentIcon').textContent=current.bird.icon;
  $('currentPath').textContent=`${current.moon.phase} Moon → ${current.weekday} → ${current.period} → Part ${current.p} → Sub ${current.s} → Activity ${current.a}`;
  $('currentTitle').textContent=`${current.bird.name} · ${current.activity}`;
  $('currentTime').textContent=`${fmt(current.from)} → ${fmt(current.to)} · ${dur(current.duration)} · ${sec(current.duration)} sec`;
  $('currentCard').classList.add('active');
}
$('locateBtn').addEventListener('click',()=>{
  if(navigator.geolocation){navigator.geolocation.getCurrentPosition(()=>makeTimeline(),()=>makeTimeline());} else makeTimeline();
});
makeTimeline(); setInterval(makeTimeline,30000);
