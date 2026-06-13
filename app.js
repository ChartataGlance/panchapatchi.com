const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];

const selectedTop = $('#selected-top');
const weekdayTabs = $('#weekday-tabs');
const tithiProgress = $('#tithi-progress');
const samamProgress = $('#samam-progress');
const actProgress = $('#act-progress');
const actBubbleProgress = $('#act-bubble-progress');
const predictCard = $('#predict-card');
const relationCard = $('#relation-card');
const astroNote = $('#astro-note');
const lookupForm = $('#lookup-form');
const lookupToggle = $('#lookup-toggle');
const lookupReset = $('#lookup-reset');
const geoBtn = $('#geo-btn');
const placeInput = $('input[name="place"]');
const latInput = $('input[name="lat"]');
const lonInput = $('input[name="lon"]');
const dateInput = $('input[name="date"]');
const timeInput = $('input[name="time"]');
const STORAGE_KEY = 'staticpatchi_lookup';

const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const BIRD_ICONS = { Vulture:'🦅', Owl:'🦉', Crow:'🐦‍⬛', Cock:'🐓', Peacock:'🦚', Unknown:'❔' };
const ACTIVITY_META = { Eat:{ta:'ஊண்',icon:'🍚'}, Walk:{ta:'நடை',icon:'🚶'}, Rule:{ta:'அரசு',icon:'👑'}, Sleep:{ta:'துயில்',icon:'🛌'}, Death:{ta:'சாவு',icon:'☠️'} };
const TITHI_NAMES = ['Prathamai','Dvitiya','Tritiya','Chaturthi','Panchami','Shashti','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Pournami','Prathamai','Dvitiya','Tritiya','Chaturthi','Panchami','Shashti','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya'];

const BIRD_RELATIONS = {
  Crow:{friends:['Vulture','Cock','Peacock'], enemies:['Owl']},
  Cock:{friends:['Peacock','Cock'], enemies:['Vulture','Owl']},
  Peacock:{friends:['Crow','Cock'], enemies:['Vulture','Owl']},
  Owl:{friends:['Vulture','Cock','Peacock'], enemies:['Crow']},
  Vulture:{friends:['Crow'], enemies:['Cock','Owl','Peacock']},
};

const ADHIKARA_PADU = {
  shukla_day:[{adhikara:'Vulture',padu:'Owl'},{adhikara:'Owl',padu:'Crow'},{adhikara:'Vulture',padu:'Cock'},{adhikara:'Owl',padu:'Peacock'},{adhikara:'Crow',padu:'Vulture'},{adhikara:'Cock',padu:'Owl'},{adhikara:'Peacock',padu:'Vulture'}],
  shukla_night:[{adhikara:'Crow',padu:'Owl'},{adhikara:'Cock',padu:'Crow'},{adhikara:'Crow',padu:'Cock'},{adhikara:'Cock',padu:'Peacock'},{adhikara:'Peacock',padu:'Vulture'},{adhikara:'Vulture',padu:'Owl'},{adhikara:'Owl',padu:'Vulture'}],
  krishna_day:[{adhikara:'Cock',padu:'Crow'},{adhikara:'Peacock',padu:'Owl'},{adhikara:'Cock',padu:'Vulture'},{adhikara:'Crow',padu:'Peacock'},{adhikara:'Owl',padu:'Cock'},{adhikara:'Vulture',padu:'Peacock'},{adhikara:'Peacock',padu:'Cock'}],
  krishna_night:[{adhikara:'Vulture',padu:'Crow'},{adhikara:'Cock',padu:'Owl'},{adhikara:'Vulture',padu:'Vulture'},{adhikara:'Owl',padu:'Peacock'},{adhikara:'Crow',padu:'Cock'},{adhikara:'Peacock',padu:'Peacock'},{adhikara:'Unknown',padu:'Cock'}],
};

const PANCHAPATCHI_TABLES = {
  shukla_day:{acts:['Eat','Walk','Rule','Sleep','Death'], minutes:{Eat:30,Walk:36,Rule:48,Sleep:18,Death:12}, birds:[['Vulture','Owl','Crow','Cock','Peacock'],['Owl','Crow','Cock','Peacock','Vulture'],['Vulture','Owl','Crow','Cock','Peacock'],['Owl','Crow','Cock','Peacock','Vulture'],['Crow','Cock','Peacock','Vulture','Owl'],['Cock','Peacock','Vulture','Owl','Crow'],['Peacock','Vulture','Owl','Crow','Cock']]},
  shukla_night:{acts:['Eat','Rule','Death','Walk','Sleep'], minutes:{Eat:30,Rule:48,Death:12,Walk:36,Sleep:18}, birds:[['Crow','Cock','Peacock','Vulture','Owl'],['Cock','Peacock','Vulture','Owl','Crow'],['Crow','Cock','Peacock','Vulture','Owl'],['Cock','Peacock','Vulture','Owl','Crow'],['Peacock','Vulture','Owl','Crow','Cock'],['Vulture','Owl','Crow','Cock','Peacock'],['Owl','Crow','Cock','Peacock','Vulture']]},
  krishna_day:{acts:['Eat','Death','Sleep','Rule','Walk'], minutes:{Eat:48,Death:30,Sleep:12,Rule:18,Walk:36}, birds:[['Cock','Crow','Owl','Vulture','Peacock'],['Peacock','Cock','Crow','Owl','Vulture'],['Cock','Crow','Owl','Vulture','Peacock'],['Crow','Owl','Vulture','Peacock','Cock'],['Owl','Vulture','Peacock','Cock','Crow'],['Vulture','Peacock','Cock','Crow','Owl'],['Peacock','Cock','Crow','Owl','Vulture']]},
  krishna_night:{acts:['Eat','Sleep','Walk','Death','Rule'], minutes:{Eat:42,Sleep:18,Walk:42,Death:24,Rule:18}, birds:[['Vulture','Peacock','Cock','Crow','Owl'],['Cock','Crow','Owl','Vulture','Peacock'],['Vulture','Peacock','Cock','Crow','Owl'],['Owl','Vulture','Peacock','Cock','Crow'],['Crow','Owl','Vulture','Peacock','Cock'],['Peacock','Cock','Crow','Owl','Vulture'],['Cock','Crow','Owl','Vulture','Peacock']]},
};

function esc(v){return String(v).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));}
function pad(n){return String(Math.floor(n)).padStart(2,'0');}
function hmToMin(v){const [h,m]=String(v||'00:00').split(':').map(Number); return (h||0)*60+(m||0);}
function minToHM(v){v=((v%1440)+1440)%1440; return `${pad(v/60)}:${pad(v%60)}`;}
function formatDuration(min){const s=Math.round(min*60), h=Math.floor(s/3600), m=Math.floor((s%3600)/60), ss=s%60; return `${h}:${pad(m)}:${pad(ss)}`;}
function ordinal(n){return `${n}${['st','nd','rd','th','th'][n-1]||'th'}`;}
function dateObj(){return new Date(`${dateInput.value}T${timeInput.value || '00:00'}:00`);}
function weekday(){return new Date(`${dateInput.value}T00:00:00`).getDay();}

function julianDay(date){return date.getTime()/86400000 + 2440587.5;}
function rev(x){return ((x%360)+360)%360;}
function sunLongitude(date){
  const n = julianDay(date) - 2451545.0;
  const L = rev(280.460 + 0.9856474*n);
  const g = rev(357.528 + 0.9856003*n) * Math.PI/180;
  return rev(L + 1.915*Math.sin(g) + 0.020*Math.sin(2*g));
}
function moonLongitude(date){
  const n = julianDay(date) - 2451545.0;
  const L = rev(218.316 + 13.176396*n);
  const M = rev(134.963 + 13.064993*n) * Math.PI/180;
  const D = rev(297.850 + 12.190749*n) * Math.PI/180;
  return rev(L + 6.289*Math.sin(M) + 1.274*Math.sin(2*D-M) + 0.658*Math.sin(2*D) + 0.214*Math.sin(2*M) - 0.186*Math.sin(rev(357.529+0.9856003*n)*Math.PI/180));
}
function tithiInfo(date){
  const sun = sunLongitude(date), moon = moonLongitude(date);
  const elongation = rev(moon - sun);
  const number = Math.floor(elongation/12)+1;
  const pakshaKey = number <= 15 ? 'shukla' : 'krishna';
  const paksha = number <= 15 ? 'Shukla Paksha' : 'Krishna Paksha';
  const progress = ((elongation%12)/12)*100;
  return {sun, moon, elongation, number, name:TITHI_NAMES[number-1], paksha, pakshaKey, progress_percent:progress};
}

function sunriseSunset(date, lat, lon){
  const d = new Date(`${dateInput.value}T12:00:00`);
  const zenith = 90.833;
  const start = new Date(d.getFullYear(),0,0);
  const N = Math.floor((d - start)/86400000);
  function calc(isRise){
    const lngHour = lon/15;
    const t = N + ((isRise ? 6 : 18) - lngHour)/24;
    const M = (0.9856*t) - 3.289;
    let L = rev(M + 1.916*Math.sin(M*Math.PI/180) + 0.020*Math.sin(2*M*Math.PI/180) + 282.634);
    let RA = Math.atan(0.91764*Math.tan(L*Math.PI/180))*180/Math.PI; RA = rev(RA);
    RA += (Math.floor(L/90)*90) - (Math.floor(RA/90)*90); RA /= 15;
    const sinDec = 0.39782*Math.sin(L*Math.PI/180);
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH = (Math.cos(zenith*Math.PI/180) - sinDec*Math.sin(lat*Math.PI/180)) / (cosDec*Math.cos(lat*Math.PI/180));
    if (cosH > 1 || cosH < -1) return isRise ? 6*60 : 18*60;
    let H = isRise ? 360 - Math.acos(cosH)*180/Math.PI : Math.acos(cosH)*180/Math.PI; H /= 15;
    const T = H + RA - (0.06571*t) - 6.622;
    const UT = rev((T - lngHour)*15)/15;
    const tzOffsetHours = -dateObj().getTimezoneOffset()/60;
    return (UT + tzOffsetHours)*60;
  }
  return {sunrise:minToHM(calc(true)), sunset:minToHM(calc(false)), method:'static JS NOAA sunrise/sunset'};
}

function buildDayNight(){
  const rs = sunriseSunset(dateObj(), Number(latInput.value), Number(lonInput.value));
  const selected = hmToMin(timeInput.value), sunrise = hmToMin(rs.sunrise), sunset = hmToMin(rs.sunset);
  const isDay = sunrise <= sunset ? selected >= sunrise && selected < sunset : selected >= sunrise || selected < sunset;
  return {period:isDay?'day':'night', sunrise:rs.sunrise, sunset:rs.sunset};
}
function dayNightStats(dn){
  const selected=hmToMin(timeInput.value), sunrise=hmToMin(dn.sunrise), sunset=hmToMin(dn.sunset);
  let total, elapsed;
  if(dn.period==='day'){total=Math.max(1,sunset-sunrise); elapsed=selected-sunrise;} else {total=Math.max(1,(1440-sunset)+sunrise); elapsed=selected>=sunset?selected-sunset:selected+1440-sunset;}
  elapsed=Math.max(0,Math.min(total,elapsed)); return {progress:(elapsed/total)*100, elapsed, total, remaining:total-elapsed};
}
function panchapatchiRows(paksha, dayNight, wd, samam, stats){
  const table = PANCHAPATCHI_TABLES[`${paksha}_${dayNight}`]; if(!table||!stats) return [];
  const birds=table.birds[wd]||table.birds[0], samamLength=stats.total/5, ratio=samamLength/144;
  let cursor=(samam-1)*samamLength; const authority=ADHIKARA_PADU[`${paksha}_${dayNight}`]?.[wd]||{};
  return birds.map((bird,i)=>{const activity=table.acts[(i+samam-1)%5], duration=table.minutes[activity]*ratio, start=cursor, end=cursor+duration; cursor=end; return {bird,activity,duration,start,end,adhikara:authority.adhikara||'',padu:authority.padu||'',isAdhikara:bird===authority.adhikara,isPadu:bird===authority.padu,meta:ACTIVITY_META[activity]};});
}

function renderWeekdays(){weekdayTabs.innerHTML=WEEKDAYS.map((d,i)=>`<button class="weekday-button ${i===weekday()?'active':''}">${d}</button>`).join('');}
function renderTithi(t){
  $$('.tab-button').forEach(b=>b.classList.toggle('active', b.dataset.paksha===t.pakshaKey));
  const inPaksha=t.number>15?t.number-15:t.number;
  tithiProgress.innerHTML=`<div class="tithi-progress-title">${esc(t.paksha)} · ${esc(t.name)} · each block = 12°</div><div class="tithi-blocks">${Array.from({length:15},(_,i)=>`<div class="tithi-block ${i+1===inPaksha?'active':''}"><span>${i+1}</span>${i+1===inPaksha?`<i style="width:${t.progress_percent}%"></i>`:''}</div>`).join('')}</div>`;
}
function updateDayNightButtons(name, progress, paksha){
  $$('.daynight-button').forEach(btn=>{
    const active=btn.dataset.daynight===name; btn.classList.toggle('active',active);
    const auth=ADHIKARA_PADU[`${paksha}_${btn.dataset.daynight}`]?.[weekday()]||{};
    btn.querySelector('.authority-line').innerHTML=`<span>அதி ${BIRD_ICONS[auth.adhikara]||''} ${esc(auth.adhikara||'--')}</span><span>படு ${BIRD_ICONS[auth.padu]||''} ${esc(auth.padu||'--')}</span>`;
    btn.querySelectorAll('b').forEach((block,i)=>{const s=i*20,e=s+20; block.classList.toggle('filled',active&&progress>=e); block.classList.toggle('partial',active&&progress>s&&progress<e); if(active&&progress>s&&progress<e) block.style.setProperty('--fill',`${((progress-s)/20)*100}%`); else block.style.removeProperty('--fill');});
  });
}
function renderMain(){
  const t=tithiInfo(dateObj()), dn=buildDayNight(), stats=dayNightStats(dn), progress=stats.progress;
  const samam=Math.max(1,Math.min(5,Math.floor(progress/20)+1));
  const rows=panchapatchiRows(t.pakshaKey,dn.period,weekday(),samam,stats);
  let activeIndex=rows.findIndex(r=>stats.elapsed>=r.start&&stats.elapsed<r.end); if(activeIndex<0) activeIndex=0;
  const act=activeIndex+1, activeRow=rows[activeIndex]||rows[0];
  const inActProgress=activeRow?Math.max(0,Math.min(100,((stats.elapsed-activeRow.start)/activeRow.duration)*100)):0;
  renderWeekdays(); renderTithi(t); updateDayNightButtons(dn.period, progress, t.pakshaKey);
  const samamColumns=rows.map(r=>`${Math.max(1,r.duration)}fr`).join(' ');
  samamProgress.innerHTML=`<div class="samam-title">${esc(dn.period)} · ${ordinal(samam)} Samam · time ratio</div><div class="samam-blocks" style="grid-template-columns:${samamColumns}">${rows.map((r,i)=>`<div class="samam-block ${i<activeIndex?'filled':''} ${i===activeIndex?'active':''}"><span><strong>${r.meta.icon} ${esc(r.activity)}</strong><small>${formatDuration(r.duration)}</small></span>${i===activeIndex?`<i style="width:${inActProgress}%"></i>`:''}</div>`).join('')}</div>`;
  const adhikara=rows[0]?.adhikara||'', padu=rows[0]?.padu||'';
  actProgress.innerHTML=`<div class="act-title">${t.pakshaKey==='krishna'?'Waning':'Rising'} · ${esc(dn.period)} · ${ordinal(samam)} Samam · Act ${act}<br><small>அதிகார பட்சி: ${BIRD_ICONS[adhikara]||''} ${esc(adhikara||'--')} · படு பட்சி: ${BIRD_ICONS[padu]||''} ${esc(padu||'--')}</small></div><div class="act-blocks act-detail-blocks">${rows.map((r,i)=>`<div class="act-block ${i<activeIndex?'filled':''} ${i===activeIndex?'active':''} ${r.isAdhikara?'adhikara-bird':''} ${r.isPadu?'padu-bird':''}"><span><strong>${BIRD_ICONS[r.bird]||''} ${esc(r.bird)}</strong><small>${r.meta.icon} ${esc(r.activity)} / ${esc(r.meta.ta)}</small><small>${formatDuration(r.duration)}</small></span>${i===activeIndex?`<i style="width:${inActProgress}%"></i>`:''}</div>`).join('')}</div>`;
  const activeBubble=Math.max(1,Math.min(12,Math.floor((inActProgress/100)*12)+1)), activeBirdIcon=BIRD_ICONS[activeRow?.bird]||'🐦';
  actBubbleProgress.innerHTML=`<div class="bubble-title">${esc(activeRow?.bird||'')} · Act progress · 12 parts</div><div class="bubble-track">${Array.from({length:12},(_,i)=>`<div class="act-bubble b${i+1} ${i+1<activeBubble?'filled':''} ${i+1===activeBubble?'active':''}"><span>${activeBirdIcon}</span></div>`).join('')}</div>`;
  const rel=BIRD_RELATIONS[adhikara]||{friends:[],enemies:[]}, same=activeRow?.bird===adhikara, friend=rel.friends.includes(activeRow?.bird), enemy=rel.enemies.includes(activeRow?.bird), paduSame=activeRow?.bird===padu;
  predictCard.innerHTML=`<div class="predict-title">Predict</div><div class="predict-row ${same||friend?'good':paduSame||enemy?'bad':'neutral'}"><div><small>Adhikara patchi</small><strong>${BIRD_ICONS[adhikara]||''} ${esc(adhikara||'--')}</strong></div><div><small>Act patchi</small><strong>${activeBirdIcon} ${esc(activeRow?.bird||'--')}</strong><small>${same?'Same bird':friend?'Friend bird':enemy?'Enemy bird':'Neutral'}</small></div><div><small>Act</small><strong>${activeRow?.meta?.icon||''} ${esc(activeRow?.activity||'--')}</strong></div></div>`;
  relationCard.innerHTML=`<div class="relation-title">Adhikara patchi info · ${BIRD_ICONS[adhikara]||''} ${esc(adhikara||'--')}</div><div class="relation-grid"><div class="friends"><small>Friends</small><div>${rel.friends.map(b=>`<span>${BIRD_ICONS[b]||''} ${esc(b)}</span>`).join('')||'<span>--</span>'}</div></div><div class="enemies"><small>Enemies</small><div>${rel.enemies.map(b=>`<span>${BIRD_ICONS[b]||''} ${esc(b)}</span>`).join('')||'<span>--</span>'}</div></div></div>`;
  astroNote.textContent = `Static mode: paksha/tithi uses JS astronomy approximation. Sunrise ${dn.sunrise}, sunset ${dn.sunset}. Astronomy library ${window.Astronomy ? 'loaded' : 'CDN not loaded; fallback active'}.`;
  updateSelectedTop(); save();
}

function updateSelectedTop(){selectedTop.textContent=`Selected: ${dateInput.value||'--'} ${timeInput.value||'--'} · ${placeInput.value||'Unknown place'} · ${latInput.value||'--'}, ${lonInput.value||'--'}`;}
function save(){document.cookie=`${STORAGE_KEY}=${encodeURIComponent(JSON.stringify({place:placeInput.value,lat:latInput.value,lon:lonInput.value,date:dateInput.value,time:timeInput.value}))}; max-age=31536000; path=/; SameSite=Lax`;}
function loadSaved(){const item=document.cookie.split('; ').find(r=>r.startsWith(`${STORAGE_KEY}=`)); if(!item)return null; try{return JSON.parse(decodeURIComponent(item.split('=').slice(1).join('=')));}catch{return null;}}
function setNow(){const now=new Date(); dateInput.value=now.toLocaleDateString('en-CA'); timeInput.value=now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false});}
function init(){
  const saved=loadSaved(); if(saved){placeInput.value=saved.place||''; latInput.value=saved.lat||'13.0827'; lonInput.value=saved.lon||'80.2707'; dateInput.value=saved.date||''; timeInput.value=saved.time||'';}
  if(!dateInput.value||!timeInput.value) setNow();
  lookupToggle.addEventListener('click',()=>{lookupForm.classList.toggle('open'); lookupToggle.textContent=lookupForm.classList.contains('open')?'Close Lookup':'Lookup';});
  lookupReset.addEventListener('click',()=>{document.cookie=`${STORAGE_KEY}=; max-age=0; path=/`; placeInput.value=''; latInput.value='13.0827'; lonInput.value='80.2707'; setNow(); renderMain();});
  geoBtn.addEventListener('click',()=>navigator.geolocation?.getCurrentPosition(pos=>{latInput.value=pos.coords.latitude.toFixed(6); lonInput.value=pos.coords.longitude.toFixed(6); placeInput.value='Current location'; renderMain();}));
  [placeInput,latInput,lonInput,dateInput,timeInput].forEach(i=>{i.addEventListener('input',renderMain); i.addEventListener('change',renderMain);});
  renderMain();
  setInterval(()=>{if(!document.hidden){setNow(); renderMain();}},60000);
}
init();
