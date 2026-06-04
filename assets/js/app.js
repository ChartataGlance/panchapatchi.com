const birdsDay = [
  { bird:'Cock', activity:'Rule', icon:'🐓' },
  { bird:'Peacock', activity:'Eat', icon:'🦚' },
  { bird:'Vulture', activity:'Walk', icon:'🦅' },
  { bird:'Owl', activity:'Sleep', icon:'🦉' },
  { bird:'Crow', activity:'Death', icon:'🐦‍⬛' }
];
const birdsNight = [
  { bird:'Cock', activity:'Eat', icon:'🐓' },
  { bird:'Peacock', activity:'Walk', icon:'🦚' },
  { bird:'Vulture', activity:'Sleep', icon:'🦅' },
  { bird:'Owl', activity:'Death', icon:'🦉' },
  { bird:'Crow', activity:'Rule', icon:'🐦‍⬛' }
];
const $ = (id)=>document.getElementById(id);
let currentSchedule = null;
function pad(n){return String(n).padStart(2,'0')}
function fmtTime(d){return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`}
function fmtDur(ms){const s=Math.round(ms/1000);const h=Math.floor(s/3600);const m=Math.floor((s%3600)/60);const sec=s%60;return `${pad(h)}:${pad(m)}:${pad(sec)} (${s} sec)`}
function addMs(d,ms){return new Date(d.getTime()+ms)}
function buildParts(start,end,birds,type){
  const total = end - start;
  const partMs = total / 5;
  return birds.map((b,i)=>{
    const from = addMs(start, partMs*i);
    const to = i===4 ? new Date(end) : addMs(start, partMs*(i+1));
    const subMs = (to-from)/5;
    const subparts = Array.from({length:5},(_,j)=>({
      index:j+1,
      from:addMs(from,subMs*j),
      to:j===4?new Date(to):addMs(from,subMs*(j+1)),
      duration:subMs
    }));
    return { index:i+1, type, ...b, from, to, duration:to-from, subparts };
  });
}
function renderCards(containerId, parts, now){
  $(containerId).innerHTML = parts.map(p=>{
    const active = now >= p.from && now < p.to;
    return `<article class="patchi-card ${active?'active':''}">
      <span class="badge ${active?'live':''}">${active?'LIVE NOW':'Part '+p.index}</span>
      <h3>Part ${p.index}</h3>
      <div class="bird-row"><div class="bird-icon">${p.icon}</div><div><strong>${p.bird}</strong><div class="activity">${p.activity}</div></div></div>
      <div class="timebox">
        <div><span>From</span><strong>${fmtTime(p.from)}</strong></div>
        <div><span>To / till</span><strong>${fmtTime(p.to)}</strong></div>
        <div><span>Total</span><strong>${fmtDur(p.duration)}</strong></div>
      </div>
      <details class="subs">
        <summary>Open 5 sub-parts</summary>
        ${p.subparts.map(s=>`<div class="sub-row"><strong>${s.index}</strong><small>${fmtTime(s.from)} → ${fmtTime(s.to)}<br>Total ${fmtDur(s.duration)}</small></div>`).join('')}
      </details>
    </article>`;
  }).join('');
}
function findActive(parts, now){return parts.find(p=>now>=p.from && now<p.to)}
function renderCurrent(dayParts, nightParts, now){
  const active = findActive(dayParts, now) || findActive(nightParts, now);
  const card = $('currentCard');
  if(!active){card.classList.add('hidden');return}
  card.classList.remove('hidden');
  const sub = active.subparts.find(s=>now>=s.from && now<s.to);
  card.innerHTML = `<h2>${active.icon} Current matching card: ${active.bird} / ${active.activity}</h2>
    <p><strong>${active.type}</strong> Part ${active.index}: ${fmtTime(active.from)} → ${fmtTime(active.to)} | Total ${fmtDur(active.duration)}</p>
    <p>${sub ? `Current sub-part ${sub.index}: ${fmtTime(sub.from)} → ${fmtTime(sub.to)} | Total ${fmtDur(sub.duration)}` : ''}</p>`;
  $('periodText').textContent = `${active.type} Part ${active.index}`;
}
function renderSchedule(sunrise, sunset){
  const now = new Date();
  const tomorrowSunrise = new Date(sunrise); tomorrowSunrise.setDate(tomorrowSunrise.getDate()+1);
  const dayParts = buildParts(sunrise, sunset, birdsDay, 'Day');
  const nightParts = buildParts(sunset, tomorrowSunrise, birdsNight, 'Night');
  currentSchedule = {dayParts, nightParts};
  $('sunriseText').textContent = fmtTime(sunrise);
  $('sunsetText').textContent = fmtTime(sunset);
  renderCards('dayCards', dayParts, now);
  renderCards('nightCards', nightParts, now);
  renderCurrent(dayParts, nightParts, now);
}
function tick(){
  $('clock').textContent = fmtTime(new Date());
  if(currentSchedule){renderCurrent(currentSchedule.dayParts,currentSchedule.nightParts,new Date());}
}
setInterval(tick,1000); tick();
$('demoBtn').addEventListener('click',()=>{
  const d = new Date();
  const sunrise = new Date(d.getFullYear(),d.getMonth(),d.getDate(),6,0,0);
  const sunset = new Date(d.getFullYear(),d.getMonth(),d.getDate(),18,0,0);
  $('locationStatus').textContent='Demo 06:00 → 18:00';
  renderSchedule(sunrise,sunset);
});
$('useLocationBtn').addEventListener('click',()=>{
  if(!navigator.geolocation){$('locationStatus').textContent='Geolocation not supported';return;}
  $('locationStatus').textContent='Requesting permission...';
  navigator.geolocation.getCurrentPosition(pos=>{
    const {latitude, longitude}=pos.coords;
    const times = getSunTimes(new Date(), latitude, longitude);
    if(!times.sunrise || !times.sunset){$('locationStatus').textContent='Sun time unavailable here today';return;}
    $('locationStatus').textContent=`Lat ${latitude.toFixed(3)}, Lon ${longitude.toFixed(3)}`;
    renderSchedule(new Date(times.sunrise), new Date(times.sunset));
  },()=>{$('locationStatus').textContent='Location denied. Use demo button.'});
});
