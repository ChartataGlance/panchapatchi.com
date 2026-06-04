(function () {
  const RAD = Math.PI / 180;
  const DEG = 180 / Math.PI;

  function dayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    return Math.floor((date - start) / 86400000);
  }

  function calcSunTime(date, lat, lon, isSunrise) {
    const zenith = 90.833;
    const N = dayOfYear(date);
    const lngHour = lon / 15;
    const t = isSunrise ? N + ((6 - lngHour) / 24) : N + ((18 - lngHour) / 24);
    const M = (0.9856 * t) - 3.289;
    let L = M + (1.916 * Math.sin(RAD * M)) + (0.020 * Math.sin(RAD * 2 * M)) + 282.634;
    L = ((L % 360) + 360) % 360;
    let RA = DEG * Math.atan(0.91764 * Math.tan(RAD * L));
    RA = ((RA % 360) + 360) % 360;
    const Lquadrant = Math.floor(L / 90) * 90;
    const RAquadrant = Math.floor(RA / 90) * 90;
    RA = (RA + (Lquadrant - RAquadrant)) / 15;
    const sinDec = 0.39782 * Math.sin(RAD * L);
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH = (Math.cos(RAD * zenith) - (sinDec * Math.sin(RAD * lat))) / (cosDec * Math.cos(RAD * lat));
    if (cosH > 1 || cosH < -1) return null;
    let H = isSunrise ? 360 - DEG * Math.acos(cosH) : DEG * Math.acos(cosH);
    H = H / 15;
    const T = H + RA - (0.06571 * t) - 6.622;
    let UT = T - lngHour;
    UT = ((UT % 24) + 24) % 24;
    const result = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
    result.setUTCMinutes(Math.round(UT * 60));
    return result;
  }

  function formatLocalTime(date) {
    if (!date) return "Not available";
    return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(date);
  }

  window.PanchapatchiSun = { calcSunTime, formatLocalTime };
})();
