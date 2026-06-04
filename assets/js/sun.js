// Lightweight sunrise/sunset calculation for static GitHub Pages.
// Based on NOAA-style solar position approximation. Good for web display/trial use.
function dayOfYear(date){
  const start = new Date(date.getFullYear(),0,0);
  return Math.floor((date - start) / 86400000);
}
function degToRad(d){return d*Math.PI/180}
function radToDeg(r){return r*180/Math.PI}
function normalize360(v){return ((v%360)+360)%360}
function calcSunTime(date, lat, lon, isSunrise){
  const zenith = 90.833;
  const N = dayOfYear(date);
  const lngHour = lon / 15;
  const t = isSunrise ? N + ((6 - lngHour) / 24) : N + ((18 - lngHour) / 24);
  const M = (0.9856 * t) - 3.289;
  let L = M + (1.916 * Math.sin(degToRad(M))) + (0.020 * Math.sin(degToRad(2*M))) + 282.634;
  L = normalize360(L);
  let RA = radToDeg(Math.atan(0.91764 * Math.tan(degToRad(L))));
  RA = normalize360(RA);
  const Lquadrant  = Math.floor(L/90) * 90;
  const RAquadrant = Math.floor(RA/90) * 90;
  RA = (RA + (Lquadrant - RAquadrant)) / 15;
  const sinDec = 0.39782 * Math.sin(degToRad(L));
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(degToRad(zenith)) - (sinDec * Math.sin(degToRad(lat)))) / (cosDec * Math.cos(degToRad(lat)));
  if (cosH > 1 || cosH < -1) return null;
  let H = isSunrise ? 360 - radToDeg(Math.acos(cosH)) : radToDeg(Math.acos(cosH));
  H = H / 15;
  const T = H + RA - (0.06571 * t) - 6.622;
  const UT = (T - lngHour + 24) % 24;
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
  d.setUTCSeconds(Math.round(UT * 3600));
  return d;
}
function getSunTimes(date, lat, lon){
  return { sunrise: calcSunTime(date, lat, lon, true), sunset: calcSunTime(date, lat, lon, false) };
}
