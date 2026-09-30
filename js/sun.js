/**
 * Sun Alignment Simulator Module (Modhera Sun Temple)
 * Interactive SVG top-view plan demonstrating solar rays during Equinoxes & Solstices.
 */
const SunComponent = (() => {
  let container = null;
  let currentDayOfYear = 79; // Default: March 20 (Spring Equinox)
  let currentTimeOfDay = 'sunrise'; // 'sunrise', 'noon', 'sunset'

  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  function getMonthDayFromDayOfYear(day) {
    let d = Math.max(1, Math.min(365, day));
    let monthIdx = 0;
    while (monthIdx < 12 && d > monthDays[monthIdx]) {
      d -= monthDays[monthIdx];
      monthIdx++;
    }
    return `${d} ${monthNames[monthIdx]}`;
  }

  function render(site, targetEl) {
    container = targetEl;
    if (!container) return;

    if (!site || site.id !== 'modhera-sun-temple') {
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    container.style.display = 'block';
    renderLayout();
  }

  function calculateSolarData(dayOfYear, timeOfDay) {
    const latRad = (23.58 * Math.PI) / 180;
    const declinationDeg = 23.45 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);
    const declinationRad = (declinationDeg * Math.PI) / 180;

    const sinAz = Math.sin(declinationRad) / Math.cos(latRad);
    const clampedSin = Math.max(-1, Math.min(1, sinAz));
    const sunriseAzimuthDeg = 90 - (Math.asin(clampedSin) * 180) / Math.PI;

    const isEquinox = Math.abs(dayOfYear - 79) <= 2 || Math.abs(dayOfYear - 266) <= 2;
    const isSummerSolstice = Math.abs(dayOfYear - 172) <= 2;
    const isWinterSolstice = Math.abs(dayOfYear - 355) <= 2;

    let currentAzimuth = sunriseAzimuthDeg;
    if (timeOfDay === 'noon') {
      currentAzimuth = 180;
    } else if (timeOfDay === 'sunset') {
      currentAzimuth = 270 + (90 - sunriseAzimuthDeg);
    }

    return {
      declinationDeg: declinationDeg.toFixed(1),
      sunriseAzimuthDeg: sunriseAzimuthDeg.toFixed(1),
      currentAzimuth: currentAzimuth.toFixed(1),
      isEquinox,
      isSummerSolstice,
      isWinterSolstice
    };
  }

  function renderLayout() {
    if (!container) return;

    const solarData = calculateSolarData(currentDayOfYear, currentTimeOfDay);
    const dateStr = getMonthDayFromDayOfYear(currentDayOfYear);

    let statusText = '';
    let statusClass = 'sun-status-normal';

    if (solarData.isEquinox) {
      statusText = '✨ EQUINOX ALIGNMENT! The first rays of the sun shine directly through the doors into the Garbhagriha (Sanctum)!';
      statusClass = 'sun-status-equinox';
    } else if (solarData.isSummerSolstice) {
      statusText = '☀️ Summer Solstice — Sun rises furthest North-East (~64.3°). Inner sanctum stays in shadow.';
      statusClass = 'sun-status-solstice';
    } else if (solarData.isWinterSolstice) {
      statusText = '❄️ Winter Solstice — Sun rises furthest South-East (~115.7°). Inner sanctum stays in shadow.';
      statusClass = 'sun-status-solstice';
    } else {
      statusText = `Sun Azimuth: ${solarData.currentAzimuth}° (${currentTimeOfDay.toUpperCase()}). Direct sanctum illumination requires Equinox (~20 Mar / 23 Sep).`;
    }

    container.innerHTML = `
      <div class="sun-simulator-card" tabindex="0" aria-label="Sun & Stone Alignment Simulator for Modhera Sun Temple">
        <div class="sun-simulator-header">
          <h3 class="sun-simulator-title">☀️ Sun & Stone Alignment Simulator (Modhera Sun Temple)</h3>
          <p class="sun-simulator-subtitle">Simulate how the 11th-century Solanki architects aligned the temple axis (90° East) with the Equinox sunrise.</p>
        </div>

        <div class="sun-svg-wrapper">
          ${generateSVGPlan(solarData)}
        </div>

        <div class="sun-status-banner ${statusClass}">
          ${escapeHTML(statusText)}
        </div>

        <div class="sun-controls">
          <div class="sun-control-row">
            <span class="control-label">Preset Alignment Dates:</span>
            <div class="sun-btn-group">
              <button type="button" class="sun-preset-btn ${solarData.isEquinox && currentDayOfYear <= 100 ? 'active' : ''}" data-day="79">
                🌅 Spring Equinox (20 Mar)
              </button>
              <button type="button" class="sun-preset-btn ${solarData.isSummerSolstice ? 'active' : ''}" data-day="172">
                ☀️ Summer Solstice (21 Jun)
              </button>
              <button type="button" class="sun-preset-btn ${solarData.isEquinox && currentDayOfYear > 100 ? 'active' : ''}" data-day="266">
                🍂 Autumn Equinox (23 Sep)
              </button>
              <button type="button" class="sun-preset-btn ${solarData.isWinterSolstice ? 'active' : ''}" data-day="355">
                ❄️ Winter Solstice (21 Dec)
              </button>
            </div>
          </div>

          <div class="sun-control-row">
            <span class="control-label">Date Slider (${dateStr}, Day ${currentDayOfYear}):</span>
            <input type="range" id="sun-date-slider" min="1" max="365" value="${currentDayOfYear}" aria-label="Day of Year Date Slider" />
          </div>

          <div class="sun-control-row">
            <span class="control-label">Time of Day:</span>
            <div class="sun-btn-group">
              <button type="button" class="sun-time-btn ${currentTimeOfDay === 'sunrise' ? 'active' : ''}" data-time="sunrise">
                🌅 Sunrise (East)
              </button>
              <button type="button" class="sun-time-btn ${currentTimeOfDay === 'noon' ? 'active' : ''}" data-time="noon">
                ☀️ Solar Noon (South)
              </button>
              <button type="button" class="sun-time-btn ${currentTimeOfDay === 'sunset' ? 'active' : ''}" data-time="sunset">
                🌇 Sunset (West)
              </button>
            </div>
          </div>
        </div>

        <p class="sun-disclaimer">
          ⚠️ <em>Simplified educational model, not an exact reconstruction.</em>
        </p>
      </div>
    `;

    setupEvents();
  }

  function generateSVGPlan(solarData) {
    const width = 640;
    const height = 300;

    const isEquinoxSunrise = solarData.isEquinox && currentTimeOfDay === 'sunrise';
    const garbhagrihaFill = isEquinoxSunrise ? '#FFD700' : '#4A3B2C';
    const garbhagrihaGlow = isEquinoxSunrise ? 'filter="url(#glow)"' : '';

    let rayAngleRad = 0;
    if (currentTimeOfDay === 'sunrise') {
      const az = parseFloat(solarData.sunriseAzimuthDeg);
      rayAngleRad = ((az - 90) * Math.PI) / 180;
    } else if (currentTimeOfDay === 'noon') {
      rayAngleRad = Math.PI / 2;
    } else {
      const az = parseFloat(solarData.currentAzimuth);
      rayAngleRad = ((az - 270) * Math.PI) / 180;
    }

    let startX = 620;
    let startY = 150;
    if (currentTimeOfDay === 'sunset') {
      startX = 20;
      startY = 150;
    } else if (currentTimeOfDay === 'noon') {
      startX = 350;
      startY = 10;
    }

    let dx = currentTimeOfDay === 'sunrise' ? -460 : (currentTimeOfDay === 'sunset' ? 460 : 0);
    let dy = currentTimeOfDay === 'noon' ? 280 : dx * Math.tan(rayAngleRad);
    let endX = startX + dx;
    let endY = startY + dy;

    const beamColor = isEquinoxSunrise ? '#FF8C00' : '#E6B800';

    return `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" class="sun-svg">
        <defs>
          <linearGradient id="sunRayGrad" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#FFD700" stop-opacity="0.95"/>
            <stop offset="60%" stop-color="#FF8C00" stop-opacity="0.75"/>
            <stop offset="100%" stop-color="#FF4500" stop-opacity="0.4"/>
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width="${width}" height="${height}" fill="#FAF5EC"/>
        <text x="590" y="30" font-size="12" font-weight="bold" fill="#B5502F" text-anchor="end">EAST 🌅 (0° Temple Axis)</text>
        <text x="20" y="30" font-size="12" font-weight="bold" fill="#3B2A1A">WEST 🌇</text>
        <text x="320" y="20" font-size="11" font-weight="bold" fill="#3B2A1A" text-anchor="middle">NORTH ⬆️</text>
        <text x="320" y="290" font-size="11" font-weight="bold" fill="#3B2A1A" text-anchor="middle">SOUTH ⬇️</text>

        <line x1="40" y1="150" x2="600" y2="150" stroke="#C9A36B" stroke-dasharray="4,4" stroke-width="1.5"/>

        <!-- 1. Surya Kunda (Water Tank on East) -->
        <rect x="470" y="60" width="120" height="180" fill="#6495ED" stroke="#3B2A1A" stroke-width="2" rx="4"/>
        <rect x="485" y="75" width="90" height="150" fill="#4169E1" stroke="#2B4C7E" stroke-width="1"/>
        <rect x="500" y="90" width="60" height="120" fill="#1E90FF" opacity="0.8"/>
        <circle cx="470" cy="60" r="4" fill="#C9A36B"/>
        <circle cx="470" cy="240" r="4" fill="#C9A36B"/>
        <circle cx="590" cy="60" r="4" fill="#C9A36B"/>
        <circle cx="590" cy="240" r="4" fill="#C9A36B"/>
        <text x="530" y="154" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Surya Kunda</text>

        <!-- Kirti Torana Entrance Arch -->
        <line x1="440" y1="110" x2="440" y2="190" stroke="#B5502F" stroke-width="4"/>
        <text x="440" y="102" font-size="9" font-weight="bold" fill="#B5502F" text-anchor="middle">Torana</text>

        <!-- 2. Sabha Mandapa (Assembly Hall) -->
        <polygon points="300,70 390,70 410,100 410,200 390,230 300,230 280,200 280,100" fill="#D2B48C" stroke="#3B2A1A" stroke-width="2"/>
        <rect x="310" y="90" width="70" height="120" fill="#E6C280" stroke="#3B2A1A" stroke-width="1"/>
        <circle cx="320" cy="100" r="3" fill="#3B2A1A"/><circle cx="370" cy="100" r="3" fill="#3B2A1A"/>
        <circle cx="320" cy="200" r="3" fill="#3B2A1A"/><circle cx="370" cy="200" r="3" fill="#3B2A1A"/>
        <circle cx="345" cy="150" r="3" fill="#3B2A1A"/>
        <text x="345" y="154" font-size="11" font-weight="bold" fill="#3B2A1A" text-anchor="middle">Sabha Mandapa</text>

        <!-- Connector Vestibule -->
        <rect x="250" y="120" width="30" height="60" fill="#C9A36B" stroke="#3B2A1A" stroke-width="1.5"/>

        <!-- 3. Guda Mandapa (Sanctum Hall) -->
        <rect x="100" y="70" width="150" height="160" fill="#C9A36B" stroke="#3B2A1A" stroke-width="2" rx="4"/>
        <rect x="120" y="100" width="60" height="100" fill="${garbhagrihaFill}" stroke="#3B2A1A" stroke-width="2" ${garbhagrihaGlow}/>
        <circle cx="150" cy="150" r="10" fill="#FF8C00" stroke="#FFFFFF" stroke-width="1.5"/>
        <text x="150" y="154" font-size="9" font-weight="bold" fill="#FFFFFF" text-anchor="middle">☀️</text>
        <text x="175" y="60" font-size="11" font-weight="bold" fill="#3B2A1A" text-anchor="middle">Guda Mandapa</text>
        <text x="150" y="215" font-size="9" font-weight="bold" fill="#3B2A1A" text-anchor="middle">Garbhagriha</text>

        ${currentTimeOfDay === 'sunrise' ? `
          <circle cx="${startX}" cy="${startY}" r="18" fill="#FFD700" stroke="#FF8C00" stroke-width="3" filter="url(#glow)"/>
          <polygon points="${startX},${startY - 12} ${startX},${startY + 12} ${endX},${endY + (isEquinoxSunrise ? 10 : 35)} ${endX},${endY - (isEquinoxSunrise ? 10 : 35)}"
            fill="url(#sunRayGrad)" opacity="${isEquinoxSunrise ? '0.85' : '0.45'}"/>
          <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="${beamColor}" stroke-width="${isEquinoxSunrise ? '4' : '2'}" stroke-dasharray="${isEquinoxSunrise ? 'none' : '4,4'}"/>
        ` : ''}

        ${currentTimeOfDay === 'sunset' ? `
          <circle cx="${startX}" cy="${startY}" r="16" fill="#FF4500" stroke="#D2691E" stroke-width="2"/>
          <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="#FF4500" stroke-width="2" stroke-dasharray="4,4"/>
        ` : ''}

        ${currentTimeOfDay === 'noon' ? `
          <circle cx="${startX}" cy="${startY}" r="18" fill="#FFF700" stroke="#FF8C00" stroke-width="3"/>
          <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="#FFD700" stroke-width="3" stroke-dasharray="4,4"/>
        ` : ''}
      </svg>
    `;
  }

  function setupEvents() {
    if (!container) return;

    const presetBtns = container.querySelectorAll('.sun-preset-btn');
    presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const day = parseInt(btn.getAttribute('data-day'), 10);
        currentDayOfYear = day;
        currentTimeOfDay = 'sunrise';
        renderLayout();
      });
    });

    const timeBtns = container.querySelectorAll('.sun-time-btn');
    timeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        currentTimeOfDay = btn.getAttribute('data-time');
        renderLayout();
      });
    });

    const slider = container.querySelector('#sun-date-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        currentDayOfYear = parseInt(e.target.value, 10);
        renderLayout();
      });
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return {
    render
  };
})();

window.SunComponent = SunComponent;
