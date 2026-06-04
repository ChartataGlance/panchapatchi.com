const orbit = document.getElementById('orbit');
const title = document.getElementById('currentBlockTitle');
const phaseText = document.getElementById('phaseText');
function moonPhaseApprox(){
  const synodic=29.530588853;
  const knownNew=Date.UTC(2000,0,6,18,14,0);
  const now=Date.now();
  const age=((now-knownNew)/86400000)%synodic;
  const phase=(age/synodic)*360;
  const block=Math.floor(phase/12)%30;
  const illumination=(1-Math.cos(phase*Math.PI/180))/2;
  return {phase,block,illumination};
}
function drawOrbit(){
  const {phase,block,illumination}=moonPhaseApprox();
  const r = window.matchMedia('(max-width:800px)').matches ? '164px' : '236px';
  orbit.innerHTML='';
  const litBlocks=Math.round(illumination*30);
  for(let i=0;i<30;i++){
    const b=document.createElement('div');
    b.className='block';
    if(i===0)b.classList.add('new');
    if(i===15)b.classList.add('full');
    if(i===block)b.classList.add('current');
    if(phase<=180 ? i<=block : (i>=block || i===0)) b.classList.add('lit');
    b.textContent=i;
    b.style.setProperty('--a',`${-i*12}deg`);
    b.style.setProperty('--r',r);
    orbit.appendChild(b);
  }
  const dot=document.createElement('div');
  dot.className='moon-dot';
  dot.style.setProperty('--moon-a',`${-phase}deg`);
  dot.style.setProperty('--r',r);
  orbit.appendChild(dot);
  title.textContent=`Block ${block} / 30`;
  phaseText.textContent=`Phase angle: ${phase.toFixed(1)}°. Light: ${Math.round(illumination*100)}%. ${phase<180?'0° to 180° growing moon':'180° to 360° reducing moon'}.`;
}
drawOrbit();
addEventListener('resize',drawOrbit);
