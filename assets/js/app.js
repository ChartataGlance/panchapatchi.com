const BLOCKS = 30;
const DEG_PER_BLOCK = 12;
const orbit = document.getElementById('orbit');
const moonDot = document.getElementById('moonDot');

function norm360(v){ return ((v % 360) + 360) % 360; }
function toRad(d){ return d * Math.PI / 180; }
function julianDate(date = new Date()) { return date.getTime() / 86400000 + 2440587.5; }

// Low-precision astronomy, good enough for visual phase/block display.
function sunLongitude(date = new Date()) {
  const d = julianDate(date) - 2451545.0;
  const g = norm360(357.529 + 0.98560028 * d);
  const q = norm360(280.459 + 0.98564736 * d);
  return norm360(q + 1.915 * Math.sin(toRad(g)) + 0.020 * Math.sin(toRad(2*g)));
}
function moonLongitude(date = new Date()) {
  const d = julianDate(date) - 2451545.0;
  const L = norm360(218.316 + 13.176396 * d);
  const M = norm360(134.963 + 13.064993 * d);
  const F = norm360(93.272 + 13.229350 * d);
  return norm360(L + 6.289 * Math.sin(toRad(M)) + 1.274 * Math.sin(toRad(2*(L - sunLongitude(date)) - M)) + 0.658 * Math.sin(toRad(2*(L - sunLongitude(date)))) + 0.214 * Math.sin(toRad(2*M)) - 0.186 * Math.sin(toRad(sunLongitude(date))) - 0.114 * Math.sin(toRad(2*F)));
}
function phaseData(date = new Date()) {
  const sun = sunLongitude(date);
  const moon = moonLongitude(date);
  // User requested: sun angle - moon angle. We normalize so 0=new, 180=full.
  const phaseAngle = norm360(sun - moon);
  const block = Math.floor(phaseAngle / DEG_PER_BLOCK) % BLOCKS;
  const light = (1 - Math.cos(toRad(phaseAngle))) / 2;
  const waxing = phaseAngle < 180;
  return { sun, moon, phaseAngle, block, light, waxing };
}
function blockPosition(block) {
  // Block 0 at 3 o'clock, Block 15 at 9 o'clock. Counter-clockwise through the top.
  const angle = block * DEG_PER_BLOCK;
  const rad = toRad(angle);
  const rect = orbit.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const radius = rect.width * 0.425;
  return { x: cx + radius * Math.cos(rad), y: cy - radius * Math.sin(rad) };
}
function createBlocks() {
  [...orbit.querySelectorAll('.block')].forEach(el => el.remove());
  for (let i=0; i<BLOCKS; i++) {
    const b = document.createElement('div');
    b.className = 'block';
    b.textContent = i;
    b.dataset.block = i;
    if (i === 0) b.classList.add('new-point');
    if (i === 15) b.classList.add('full-point');
    orbit.appendChild(b);
  }
  positionBlocks();
}
function positionBlocks() {
  document.querySelectorAll('.block').forEach(b => {
    const pos = blockPosition(Number(b.dataset.block));
    b.style.left = `${pos.x}px`;
    b.style.top = `${pos.y}px`;
  });
}
function phaseName(angle) {
  if (angle < 12 || angle >= 348) return 'New Moon';
  if (angle < 84) return 'Waxing Crescent';
  if (angle < 108) return 'First Half';
  if (angle < 168) return 'Waxing Gibbous';
  if (angle < 192) return 'Full Moon';
  if (angle < 252) return 'Waning Gibbous';
  if (angle < 288) return 'Last Half';
  return 'Waning Crescent';
}
function render(date = new Date()) {
  const data = phaseData(date);
  const illuminatedBlocks = Math.round(data.light * BLOCKS);
  document.querySelectorAll('.block').forEach(el => {
    const i = Number(el.dataset.block);
    el.classList.remove('light','dark','current');
    if (data.light > 0.98) el.classList.add('light');
    else if (data.light < 0.02) el.classList.add('dark');
    else if (data.waxing ? i <= data.block && i !== 0 : (i >= data.block || i === 0)) el.classList.add('light');
    else el.classList.add('dark');
    if (i === data.block) el.classList.add('current');
  });
  const p = blockPosition(data.block);
  moonDot.style.left = `${p.x}px`;
  moonDot.style.top = `${p.y}px`;
  moonDot.style.background = data.light < .03 ? '#05060c' : data.light > .97 ? '#fff4a8' : '#10111f';
  const inset = Math.round((1 - data.light) * 28);
  moonDot.style.boxShadow = data.light > .97 ? '0 0 34px rgba(255,225,118,.85)' : `inset ${data.waxing ? '-' : ''}${inset}px 0 0 #fff1a8, 0 0 22px rgba(255,225,118,.35)`;
  document.getElementById('blockReadout').textContent = `Block ${data.block} / 30`;
  document.getElementById('moonBlockCard').textContent = data.block;
  document.getElementById('phaseAngleCard').textContent = `${data.phaseAngle.toFixed(1)}°`;
  document.getElementById('lightCard').textContent = `${Math.round(data.light*100)}%`;
  document.getElementById('directionCard').textContent = data.waxing ? 'Waxing' : 'Waning';
  document.getElementById('phaseName').textContent = phaseName(data.phaseAngle);
  document.getElementById('illuminationText').textContent = `${Math.round(data.light*100)}%`;
  document.getElementById('angleText').textContent = `${data.phaseAngle.toFixed(1)}°`;
}
function calcSunTimes(lat, lon, date = new Date()) {
  const zenith = 90.833;
  const day = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(),0,0))/86400000);
  const lngHour = lon / 15;
  function time(isRise){
    const t = day + ((isRise ? 6 : 18) - lngHour) / 24;
    const M = (0.9856 * t) - 3.289;
    let L = norm360(M + (1.916 * Math.sin(toRad(M))) + (0.020 * Math.sin(toRad(2*M))) + 282.634);
    let RA = norm360(Math.atan(0.91764 * Math.tan(toRad(L))) * 180 / Math.PI);
    RA += (Math.floor(L/90)*90) - (Math.floor(RA/90)*90);
    RA /= 15;
    const sinDec = 0.39782 * Math.sin(toRad(L));
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH = (Math.cos(toRad(zenith)) - (sinDec * Math.sin(toRad(lat)))) / (cosDec * Math.cos(toRad(lat)));
    if (cosH > 1 || cosH < -1) return null;
    let H = isRise ? 360 - Math.acos(cosH) * 180 / Math.PI : Math.acos(cosH) * 180 / Math.PI;
    H /= 15;
    const T = H + RA - (0.06571 * t) - 6.622;
    const UT = norm360((T - lngHour) * 15) / 15;
    const result = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
    result.setUTCMinutes(Math.round(UT * 60));
    return result;
  }
  return { sunrise: time(true), sunset: time(false) };
}
function formatTime(d){ return d ? d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'Unavailable'; }

document.getElementById('geoBtn').addEventListener('click', () => {
  if (!navigator.geolocation) return alert('Geolocation is not supported by this browser.');
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    const times = calcSunTimes(latitude, longitude);
    document.getElementById('sunriseText').textContent = formatTime(times.sunrise);
    document.getElementById('sunsetText').textContent = formatTime(times.sunset);
  }, () => alert('Location permission was not allowed.'));
});

createBlocks();
render();
window.addEventListener('resize', () => { positionBlocks(); render(); });
