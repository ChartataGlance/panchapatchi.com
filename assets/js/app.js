function $(id){return document.getElementById(id)}
function byId(id){return document.getElementById(id)}
function setText(id,value){const el=byId(id); if(el) el.textContent=value ?? ''}
function setHTML(id,value){const el=byId(id); if(el) el.innerHTML=value ?? ''}
const BIRDS=[
  {key:'cock',label:'Cock',icon:'🐓'},
  {key:'peacock',label:'Peacock',icon:'🦚'},
  {key:'vulture',label:'Vulture',icon:'🦅'},
  {key:'owl',label:'Owl',icon:'🦉'},
  {key:'crow',label:'Crow',icon:'🐦'}
];
const ACT={
  rule:{label:'Rule',tamil:'அரசு',cls:'rule'},
  eat:{label:'Eat',tamil:'ஊண்',cls:'eat'},
  walk:{label:'Walk',tamil:'நடை',cls:'walk'},
  sleep:{label:'Sleep',tamil:'துயில்',cls:'sleep'},
  death:{label:'Death',tamil:'சாவு',cls:'death'}
};
const TABLES={
  "rising_day": {
    "1": [{"act":"eat","to":30},{"act":"walk","to":66},{"act":"rule","to":114},{"act":"sleep","to":132},{"act":"death","to":144}],
    "2": [{"act":"walk","to":180},{"act":"rule","to":228},{"act":"sleep","to":246},{"act":"death","to":258},{"act":"eat","to":288}],
    "3": [{"act":"rule","to":336},{"act":"sleep","to":354},{"act":"death","to":366},{"act":"eat","to":396},{"act":"walk","to":432}],
    "4": [{"act":"sleep","to":450},{"act":"death","to":462},{"act":"eat","to":492},{"act":"walk","to":528},{"act":"rule","to":576}],
    "5": [{"act":"death","to":588},{"act":"eat","to":618},{"act":"walk","to":654},{"act":"rule","to":702},{"act":"sleep","to":720}]
  },
  "rising_night": {
    "1": [{"act":"eat","to":750},{"act":"rule","to":798},{"act":"death","to":810},{"act":"walk","to":846},{"act":"sleep","to":864}],
    "2": [{"act":"rule","to":912},{"act":"death","to":924},{"act":"walk","to":960},{"act":"sleep","to":978},{"act":"eat","to":1008}],
    "3": [{"act":"death","to":1020},{"act":"walk","to":1056},{"act":"sleep","to":1074},{"act":"eat","to":1104},{"act":"rule","to":1152}],
    "4": [{"act":"walk","to":1188},{"act":"sleep","to":1206},{"act":"eat","to":1236},{"act":"rule","to":1284},{"act":"death","to":1296}],
    "5": [{"act":"sleep","to":1314},{"act":"eat","to":1344},{"act":"rule","to":1392},{"act":"death","to":1404},{"act":"walk","to":1440}]
  },
  "waning_day": {
    "1": [{"act":"eat","to":48},{"act":"death","to":78},{"act":"sleep","to":90},{"act":"rule","to":108},{"act":"walk","to":144}],
    "2": [{"act":"death","to":174},{"act":"sleep","to":186},{"act":"rule","to":204},{"act":"walk","to":240},{"act":"eat","to":288}],
    "3": [{"act":"sleep","to":300},{"act":"rule","to":318},{"act":"walk","to":354},{"act":"eat","to":402},{"act":"death","to":432}],
    "4": [{"act":"rule","to":450},{"act":"walk","to":486},{"act":"eat","to":534},{"act":"death","to":564},{"act":"sleep","to":576}],
    "5": [{"act":"walk","to":612},{"act":"eat","to":660},{"act":"death","to":690},{"act":"sleep","to":702},{"act":"rule","to":720}]
  },
  "waning_night": {
    "1": [{"act":"eat","to":762},{"act":"sleep","to":780},{"act":"walk","to":822},{"act":"death","to":846},{"act":"rule","to":864}],
    "2": [{"act":"sleep","to":882},{"act":"walk","to":924},{"act":"death","to":948},{"act":"rule","to":966},{"act":"eat","to":1008}],
    "3": [{"act":"walk","to":1050},{"act":"death","to":1074},{"act":"rule","to":1092},{"act":"eat","to":1134},{"act":"sleep","to":1152}],
    "4": [{"act":"death","to":1176},{"act":"rule","to":1194},{"act":"eat","to":1236},{"act":"sleep","to":1254},{"act":"walk","to":1296}],
    "5": [{"act":"rule","to":1314},{"act":"eat","to":1356},{"act":"sleep","to":1374},{"act":"walk","to":1416},{"act":"death","to":1440}]
  }
};
function pad(n){return String(Math.floor(n)).padStart(2,'0')}
function hms(d){return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`}
function minutesSince(a,b){return (b-a)/60000}
function addMin(base,min){return new Date(base.getTime()+min*60000)}
function duration(a,b){const s=Math.max(0,Math.round((b-a)/1000));return {s,hms:`${pad(s/3600)}:${pad((s%3600)/60)}:${pad(s%60)}`}}
function dayName(d=new Date()){return d.toLocaleDateString('en-GB',{weekday:'long'})}
function normalize360(x){return ((x%360)+360)%360}
function julianDay(date){return date.getTime()/86400000+2440587.5}
function sunLongitude(date){const n=julianDay(date)-2451545.0;const L=normalize360(280.46646+0.98564736*n);const g=normalize360(357.52911+0.98560028*n)*Math.PI/180;return normalize360(L+1.914602*Math.sin(g)+0.019993*Math.sin(2*g));}
function moonLongitude(date){const n=julianDay(date)-2451545.0;const L=normalize360(218.316+13.176396*n);const M=normalize360(134.963+13.064993*n)*Math.PI/180;const D=normalize360(297.850+12.190749*n)*Math.PI/180;return normalize360(L+6.289*Math.sin(M)+1.274*Math.sin(2*D-M)+0.658*Math.sin(2*D));}
function moonPhase(date){const phase=normalize360(moonLongitude(date)-sunLongitude(date));return {angle:phase,block:Math.round(phase/12)%30,kind:phase<180?'rising':'waning',name:phase<180?'Rising/Waxing Moon':'Waning Moon',illum:(1-Math.cos(phase*Math.PI/180))/2}}
function buildFromTable(tableKey,baseSunrise){const table=TABLES[tableKey];let previous=tableKey.includes('night')?addMin(baseSunrise,720):baseSunrise;return Object.keys(table).map((partNo,idx)=>{const bird=BIRDS[idx];const rows=table[partNo].map((row,i)=>{const start=previous;const end=addMin(baseSunrise,row.to);previous=end;const du=duration(start,end);return {part:+partNo,sub:i+1,bird,act:row.act,activity:ACT[row.act],start,end,duration:du,toOffset:row.to};});return {part:+partNo,bird,start:rows[0].start,end:rows[rows.length-1].end,duration:duration(rows[0].start,rows[rows.length-1].end),rows};});}
function chooseTable(phase,baseSunrise,now){let offset=minutesSince(baseSunrise,now);while(offset<0)offset+=1440;while(offset>=1440)offset-=1440;const period=offset<720?'day':'night';return {key:`${phase.kind}_${period}`,period,offset};}
function findCurrent(parts,now){for(const part of parts){for(const row of part.rows){if(now>=row.start && now<row.end)return {part,row};}}return {part:parts[0],row:parts[0].rows[0]};}
function renderCurrent(ctx){
  const {phase,tablePick,current}=ctx;
  if(!current || !current.row || !current.part) return;
  const r=current.row;
  setText('currentIcon', r.bird.icon);
  setText('currentPath', `${phase.name} · ${dayName()} · ${tablePick.period.toUpperCase()} · Part ${current.part.part} · Sub ${r.sub}`);
  setHTML('currentTitle', `${r.bird.label} · <span class="${r.activity.cls}">${r.activity.label}</span>`);
  setText('currentTime', `${hms(r.start)} → ${hms(r.end)}`);
  setText('currentDuration', `Duration ${r.duration.hms} · ${r.duration.s} sec · Table ${tablePick.key}`);
  const card=byId('currentCard'); if(card) card.classList.add('active');
}
function renderOrbit(phase){const orbit=document.getElementById('orbit');orbit.innerHTML='';const size=orbit.clientWidth||340,c=size/2,r=size*.42;for(let i=0;i<30;i++){const angle=i*12*Math.PI/180;const x=c+r*Math.cos(angle),y=c-r*Math.sin(angle);const el=document.createElement('div');el.className=`node ${i===phase.block?'current':''} ${i===0?'new':''} ${i===15?'full':''}`;el.style.left=x+'px';el.style.top=y+'px';el.textContent=i;orbit.appendChild(el);}document.getElementById('moonInfo').textContent=`${phase.name} · ${phase.angle.toFixed(1)}° · Block ${phase.block}/30 · Light ${(phase.illum*100).toFixed(0)}%`;}
function renderTree(ctx){const {phase,tablePick,parts,current,baseSunrise}=ctx;const tree=document.getElementById('tree');tree.className='tree';const phaseLabel=phase.kind==='rising'?'Rising/Waxing 0° → 180°':'Waning 180° → 360°';tree.innerHTML=`<details class="branch" open><summary><b>🌙 Moon</b><span class="tag">${phaseLabel}</span></summary><div class="children"><details class="branch" open><summary><b>${dayName()}</b><span class="tag">Weekday</span></summary><div class="children"><details class="branch" open><summary><b>${tablePick.period==='day'?'Day':'Night'}</b><span class="tag">Base sunrise ${hms(baseSunrise)} · ${tablePick.key}</span></summary><div class="children" id="partsHost"></div></details></div></details></div></details>`;
const host=document.getElementById('partsHost');parts.forEach(p=>{const d=document.createElement('details');d.className='branch';d.open=p.part===current.part.part;d.innerHTML=`<summary><b>Part ${p.part} <span class="bird-small">${p.bird.icon}</span>${p.bird.label}</b><span class="tag">${hms(p.start)} → ${hms(p.end)} · ${p.duration.hms}</span></summary><div class="children"><div class="part-card"><div class="part-head"><b>Part ${p.part} activity rows</b><span class="tag">not equal split</span></div><div class="rows"></div></div></div>`;const rows=d.querySelector('.rows');p.rows.forEach(r=>{const active=r===current.row;const row=document.createElement('div');row.className=`activity-row ${active?'active':''}`;row.innerHTML=`<div class="num">${r.sub}</div><div><div class="act ${r.activity.cls}">${r.activity.label} <span class="muted">${r.activity.tamil}</span></div><div class="muted">${r.bird.icon} ${r.bird.label} · To offset ${r.toOffset} min</div></div><div class="meta"><b>${hms(r.start)} → ${hms(r.end)}</b><br><span class="tag">${r.duration.hms} · ${r.duration.s} sec${active?' · ACTIVE NOW':''}</span></div>`;rows.appendChild(row);});host.appendChild(d);});}
function initWithSunrise(baseSunrise,label){const now=new Date();const phase=moonPhase(now);const tablePick=chooseTable(phase,baseSunrise,now);const parts=buildFromTable(tablePick.key,baseSunrise);const current=findCurrent(parts,now);const ctx={phase,tablePick,parts,current,baseSunrise};document.getElementById('statusText').textContent=label;renderCurrent(ctx);renderOrbit(phase);renderTree(ctx);}
function demo(){const d=new Date();d.setHours(5,0,0,0);if(new Date()<d)d.setDate(d.getDate()-1);initWithSunrise(d,`Demo sunrise ${hms(d)}. Use location for local sunrise.`);}
function useLocation(){if(!navigator.geolocation){demo();return;}document.getElementById('statusText').textContent='Asking for location…';navigator.geolocation.getCurrentPosition(pos=>{const now=new Date();let sr=new Date(now).sunrise(pos.coords.latitude,pos.coords.longitude);if(now<sr){const y=new Date(now);y.setDate(y.getDate()-1);sr=y.sunrise(pos.coords.latitude,pos.coords.longitude);}initWithSunrise(sr,`Local sunrise ${hms(sr)} · location used only in browser.`);},()=>demo(),{enableHighAccuracy:false,timeout:9000,maximumAge:600000});}
document.getElementById('locBtn').addEventListener('click',useLocation);demo();setInterval(()=>{const text=document.getElementById('statusText').textContent;if(text.includes('Local sunrise')) useLocation(); else demo();},30000);
Date.prototype.sunrise=function(latitude,longitude,zenith){return this.sunriseSet(latitude,longitude,true,zenith)};Date.prototype.sunset=function(latitude,longitude,zenith){return this.sunriseSet(latitude,longitude,false,zenith)};Date.prototype.sunriseSet=function(latitude,longitude,sunrise,zenith){if(!zenith)zenith=90.8333;var hoursFromMeridian=longitude/Date.DEGREES_PER_HOUR,dayOfYear=this.getDayOfYear(),approxTimeOfEventInDays,sunMeanAnomaly,sunTrueLongitude,ascension,rightAscension,lQuadrant,raQuadrant,sinDec,cosDec,cosLocalHourAngle,localHourAngle,localHour,localMeanTime,time;if(sunrise){approxTimeOfEventInDays=dayOfYear+(6-hoursFromMeridian)/24}else{approxTimeOfEventInDays=dayOfYear+(18.0-hoursFromMeridian)/24}sunMeanAnomaly=0.9856*approxTimeOfEventInDays-3.289;sunTrueLongitude=sunMeanAnomaly+1.916*Math.sinDeg(sunMeanAnomaly)+0.02*Math.sinDeg(2*sunMeanAnomaly)+282.634;sunTrueLongitude=Math.mod(sunTrueLongitude,360);ascension=0.91764*Math.tanDeg(sunTrueLongitude);rightAscension=(360/(2*Math.PI))*Math.atan(ascension);rightAscension=Math.mod(rightAscension,360);lQuadrant=Math.floor(sunTrueLongitude/90)*90;raQuadrant=Math.floor(rightAscension/90)*90;rightAscension=rightAscension+(lQuadrant-raQuadrant);rightAscension/=Date.DEGREES_PER_HOUR;sinDec=0.39782*Math.sinDeg(sunTrueLongitude);cosDec=Math.cosDeg(Math.asinDeg(sinDec));cosLocalHourAngle=(Math.cosDeg(zenith)-sinDec*Math.sinDeg(latitude))/(cosDec*Math.cosDeg(latitude));localHourAngle=Math.acosDeg(cosLocalHourAngle);if(sunrise)localHourAngle=360-localHourAngle;localHour=localHourAngle/Date.DEGREES_PER_HOUR;localMeanTime=localHour+rightAscension-0.06571*approxTimeOfEventInDays-6.622;time=localMeanTime-longitude/Date.DEGREES_PER_HOUR;time=Math.mod(time,24);var midnight=new Date(0);midnight.setUTCFullYear(this.getUTCFullYear());midnight.setUTCMonth(this.getUTCMonth());midnight.setUTCDate(this.getUTCDate());return new Date(midnight.getTime()+time*60*60*1000)};Date.DEGREES_PER_HOUR=360/24;Date.prototype.getDayOfYear=function(){var onejan=new Date(this.getFullYear(),0,1);return Math.ceil((this-onejan)/86400000)};Math.sinDeg=function(deg){return Math.sin((deg*2*Math.PI)/360)};Math.acosDeg=function(x){return Math.acos(x)*360/(2*Math.PI)};Math.asinDeg=function(x){return Math.asin(x)*360/(2*Math.PI)};Math.tanDeg=function(deg){return Math.tan((deg*2*Math.PI)/360)};Math.cosDeg=function(deg){return Math.cos((deg*2*Math.PI)/360)};Math.mod=function(a,b){var result=a%b;if(result<0)result+=b;return result};
