(function () {
  const SYNODIC_MONTH = 29.530588853;
  const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);
  const DAY_MS = 86400000;

  function positiveMod(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
  }

  function getMoonData(date = new Date()) {
    const daysSince = (date.getTime() - KNOWN_NEW_MOON_UTC) / DAY_MS;
    const moonAge = positiveMod(daysSince, SYNODIC_MONTH);
    const phaseAngle = (moonAge / SYNODIC_MONTH) * 360;
    const section = Math.floor(phaseAngle / 12); // 30 sections in total
    const isRising = phaseAngle <= 180;
    const illumination = (1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2;
    const lightPercent = Math.round(illumination * 100);

    let name = "New Moon";
    if (phaseAngle > 10 && phaseAngle < 80) name = "Waxing Crescent";
    else if (phaseAngle >= 80 && phaseAngle < 100) name = "First Quarter / Half Moon";
    else if (phaseAngle >= 100 && phaseAngle < 170) name = "Waxing Gibbous";
    else if (phaseAngle >= 170 && phaseAngle <= 190) name = "Full Moon";
    else if (phaseAngle > 190 && phaseAngle < 260) name = "Waning Gibbous";
    else if (phaseAngle >= 260 && phaseAngle < 280) name = "Last Quarter / Half Moon";
    else if (phaseAngle >= 280 && phaseAngle < 350) name = "Waning Crescent";

    return { moonAge, phaseAngle, section, isRising, lightPercent, name };
  }

  function renderMoonTabs(data) {
    const tabsRoot = document.getElementById("moonTabs");
    const moonBall = document.getElementById("moonBall");
    if (!tabsRoot || !moonBall) return;

    tabsRoot.innerHTML = "";
    const lightSections = data.isRising ? data.section + 1 : 30 - data.section;

    for (let i = 0; i < 30; i += 1) {
      const tab = document.createElement("div");
      tab.className = "moon-tab";

      if (data.lightPercent >= 99) {
        tab.classList.add("light");
        tab.style.setProperty("--tab-brightness", "1.08");
      } else if (data.lightPercent <= 1) {
        // all dark
      } else if (data.isRising) {
        if (i <= data.section) tab.classList.add("light");
      } else {
        if (i >= data.section) tab.classList.add("light");
      }

      if (i === data.section) tab.classList.add("current");
      tabsRoot.appendChild(tab);
    }

    const board = document.querySelector(".moon-board");
    const boardWidth = board ? board.getBoundingClientRect().width : 900;
    const travelWidth = Math.max(0, boardWidth - 200);
    const x = (data.phaseAngle / 360) * travelWidth;
    const y = Math.sin((data.phaseAngle / 360) * Math.PI * 2) * 10;

    moonBall.style.setProperty("--moon-x", `${x}px`);
    moonBall.style.setProperty("--moon-y", `${y}px`);

    if (data.lightPercent <= 1) {
      moonBall.style.setProperty("--moon-fill", "#111");
      moonBall.style.setProperty("--moon-glow", "none");
    } else if (data.lightPercent >= 99) {
      moonBall.style.setProperty("--moon-fill", "#ffeaa0");
      moonBall.style.setProperty("--moon-glow", "0 0 36px rgba(255,234,160,.9)");
    } else {
      moonBall.style.setProperty("--moon-fill", `linear-gradient(${data.isRising ? 90 : 270}deg, #ffeaa0 ${data.lightPercent}%, #111 ${data.lightPercent}%)`);
      moonBall.style.setProperty("--moon-glow", "0 0 18px rgba(255,234,160,.35)");
    }
  }

  window.PanchapatchiMoon = { getMoonData, renderMoonTabs };
})();
