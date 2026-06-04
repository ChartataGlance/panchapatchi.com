(function () {
  const $ = (id) => document.getElementById(id);
  const todayMoon = window.PanchapatchiMoon.getMoonData(new Date());
  window.PanchapatchiMoon.renderMoonTabs(todayMoon);

  $("yearText").textContent = new Date().getFullYear();
  $("moonLightText").textContent = `${todayMoon.lightPercent}%`;
  $("moonNameText").textContent = `${todayMoon.name} • ${Math.round(todayMoon.phaseAngle)}° • section ${todayMoon.section + 1}/30`;

  function updateSun(lat, lon) {
    const date = new Date();
    const sunrise = window.PanchapatchiSun.calcSunTime(date, lat, lon, true);
    const sunset = window.PanchapatchiSun.calcSunTime(date, lat, lon, false);
    $("latText").textContent = lat.toFixed(4);
    $("lonText").textContent = lon.toFixed(4);
    $("sunriseText").textContent = window.PanchapatchiSun.formatLocalTime(sunrise);
    $("sunsetText").textContent = window.PanchapatchiSun.formatLocalTime(sunset);
    $("statusText").textContent = "Calculation complete. Location was used only in this browser.";
  }

  $("locationBtn").addEventListener("click", function () {
    if (!navigator.geolocation) {
      $("statusText").textContent = "Geolocation is not supported by this browser.";
      return;
    }
    $("statusText").textContent = "Requesting location permission...";
    navigator.geolocation.getCurrentPosition(
      (pos) => updateSun(pos.coords.latitude, pos.coords.longitude),
      () => { $("statusText").textContent = "Location permission denied. You can still use demo mode."; },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  });

  $("demoBtn").addEventListener("click", function () {
    updateSun(51.5072, -0.1276);
    $("statusText").textContent = "Demo uses London coordinates.";
  });

  window.addEventListener("resize", function () {
    window.PanchapatchiMoon.renderMoonTabs(todayMoon);
  });
})();
