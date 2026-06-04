const days = [
  ['sunday','ஞாயிறு / Sunday'],['monday','திங்கள் / Monday'],['tuesday','செவ்வாய் / Tuesday'],['wednesday','புதன் / Wednesday'],['thursday','வியாழன் / Thursday'],['friday','வெள்ளி / Friday'],['saturday','சனி / Saturday']
];
const birds = [
  {name:'Cock', ta:'கோழி', emoji:'🐓', action:'Rule'},
  {name:'Peacock', ta:'மயில்', emoji:'🦚', action:'Eat'},
  {name:'Vulture', ta:'வல்லூறு', emoji:'🦅', action:'Walk'},
  {name:'Owl', ta:'ஆந்தை', emoji:'🦉', action:'Sleep'},
  {name:'Crow', ta:'காகம்', emoji:'🐦', action:'Death'}
];
const weekdaySel = document.getElementById('weekday');
days.forEach(([v,t])=>{const o=document.createElement('option'); o.value=v; o.textContent=t; weekdaySel.appendChild(o);});
function parseTime(v){const [h,m,s='0']=v.split(':').map(Number);return h*3600+m*60+s;}
function fmt(sec){sec=((Math.round(sec)%86400)+86400)%86400;const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return [h,m,s].map(n=>String(n).padStart(2,'0')).join(':');}
function dur(sec){sec=Math.round(sec);const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} (${sec} sec)`;}
function build(){
  const moon = document.getElementById('moonPhase').value;
  const weekday = weekdaySel.options[weekdaySel.selectedIndex].text;
  const period = document.getElementById('period').value;
  const sunrise = parseTime(document.getElementById('sunrise').value);
  const sunset = parseTime(document.getElementById('sunset').value);
  const nextSunriseRaw = parseTime(document.getElementById('nextSunrise').value);
  let start,end;
  if(period==='day'){start=sunrise; end=sunset;} else {start=sunset; end=nextSunriseRaw<=sunset ? nextSunriseRaw+86400 : nextSunriseRaw;}
  const total=end-start;
  const partLen=total/5;
  const subLen=partLen/5;
  document.getElementById('summary').innerHTML = `
    <div><strong>Moon</strong>${moon==='waxing'?'வளர் பிறை 0°→180°':'தேய் பிறை 180°→360°'}</div>
    <div><strong>Day</strong>${weekday}</div>
    <div><strong>Period</strong>${period==='day'?'பகல் / Day':'இரவு / Night'}</div>
    <div><strong>Total</strong>${dur(total)}</div>
  `;
  let html='';
  birds.forEach((b,i)=>{
    const ps=start+i*partLen, pe=start+(i+1)*partLen;
    html += `<article class="part-card"><div class="part-head"><div class="bird"><span class="bird-emoji">${b.emoji}</span><div><h2>Part ${i+1}: ${b.name} / ${b.ta}</h2><p class="muted">${b.action}</p></div></div><span class="badge">Major Part ${(i+1)}/5</span></div>`;
    html += `<div class="times"><div class="timebox"><span>From</span>${fmt(ps)}</div><div class="timebox"><span>To Till</span>${fmt(pe)}</div><div class="timebox"><span>Total</span>${dur(partLen)}</div></div>`;
    html += `<div class="subparts">`;
    for(let j=0;j<5;j++){
      const ss=ps+j*subLen, se=ps+(j+1)*subLen;
      html += `<div class="sub"><b>Sub ${j+1}</b><span>From ${fmt(ss)}</span><span>To ${fmt(se)}</span><span>Total ${dur(subLen)}</span></div>`;
    }
    html += `</div></article>`;
  });
  document.getElementById('tree').innerHTML=html;
}
document.getElementById('buildBtn').addEventListener('click', build);
build();
