const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const birds=['Vulture','Owl','Crow','Cock','Peacock'];
const actions=['Rule','Eat','Walk','Sleep','Die'];
const cycle=document.body.dataset.cycle || 'waxing';
const root=document.getElementById('treeRoot');
function buildPart(day,period,partNo,index){
  const bird=birds[(index+day.length+(cycle==='waning'?2:0))%5];
  const action=actions[(index+(period==='Night'?1:0))%5];
  const el=document.createElement('div');
  el.className='part';
  el.innerHTML=`<button type="button"><span>Part ${partNo}: ${bird}</span><b>${action}</b></button><div class="detail"><strong>${day} ${period} — Part ${partNo}</strong><br>This is the first-level detail area. Day is sunrise to sunset. Night is sunset to next sunrise. This part can be divided further into 5 sub-parts.<div class="subparts">${[1,2,3,4,5].map(n=>`<span>${partNo}.${n}</span>`).join('')}</div></div>`;
  el.querySelector('button').addEventListener('click',()=>el.classList.toggle('open'));
  return el;
}
function build(){
  root.innerHTML='';
  days.forEach(day=>{
    const wrap=document.createElement('section');
    wrap.innerHTML=`<h2 class="week-title">${day}</h2>`;
    const grid=document.createElement('div');
    grid.className='day-night-grid';
    ['Day','Night'].forEach(period=>{
      const card=document.createElement('div');
      card.className='day-card';
      card.innerHTML=`<h3>${period}</h3><p>${period==='Day'?'Sunrise → Sunset':'Sunset → Next Sunrise'} divided into 5 equal parts.</p>`;
      const parts=document.createElement('div');
      parts.className='parts';
      for(let i=0;i<5;i++) parts.appendChild(buildPart(day,period,i+1,i));
      card.appendChild(parts);
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
    root.appendChild(wrap);
  });
}
build();
