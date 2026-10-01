/**
 * Live Weather & Best Time to Visit Module
 * Uses Open-Meteo free API (no API key required) to fetch live temperature and 3-day forecasts
 * for monuments, paired with seasonal visiting advice.
 */

const WeatherComponent = (() => {
  const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

  // WMO Weather Interpretation Codes
  const WMO_CODES = {
    0: { label: 'Clear sky', icon: '☀️' },
    1: { label: 'Mainly clear', icon: '🌤️' },
    2: { label: 'Partly cloudy', icon: '⛅' },
    3: { label: 'Overcast', icon: '☁️' },
    45: { label: 'Foggy', icon: '🌫️' },
    48: { label: 'Depositing rime fog', icon: '🌫️' },
    51: { label: 'Light drizzle', icon: '🌦️' },
    53: { label: 'Moderate drizzle', icon: '🌧️' },
    55: { label: 'Dense drizzle', icon: '🌧️' },
    61: { label: 'Slight rain', icon: '🌧️' },
    63: { label: 'Moderate rain', icon: '🌧️' },
    65: { label: 'Heavy rain', icon: '🌧️' },
    80: { label: 'Slight rain showers', icon: '🌦️' },
    81: { label: 'Moderate rain showers', icon: '🌦️' },
    82: { label: 'Violent rain showers', icon: '⛈️' },
    95: { label: 'Thunderstorm', icon: '🌩️' }
  };

  /**
   * Fetch weather data from Open-Meteo
   * @param {number} lat 
   * @param {number} lng 
   * @returns {Promise<Object|null>}
   */
  async function fetchWeather(lat, lng) {
    try {
      const url = `${OPEN_METEO_URL}?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Open-Meteo HTTP ${response.status}`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.warn('[Weather] Could not fetch live weather:', err.message);
      return null;
    }
  }

  /**
   * Render Live Weather Section inside site detail modal
   * @param {Object} site 
   * @param {HTMLElement} container 
   */
  async function render(site, container) {
    if (!container || !site) return;

    container.style.display = 'block';
    container.innerHTML = `
      <div class="weather-card-section">
        <h3 class="section-subtitle">🌤️ Live Weather &amp; Visiting Season</h3>
        <div class="weather-loading">Loading weather telemetry...</div>
      </div>
    `;

    const weatherData = await fetchWeather(site.lat, site.lng);
    const innerContainer = container.querySelector('.weather-card-section');
    if (!innerContainer) return;

    if (!weatherData || !weatherData.current_weather) {
      innerContainer.innerHTML = `
        <h3 class="section-subtitle">🌤️ Best Time to Visit</h3>
        <div class="best-season-box">
          <span class="season-icon">🗓️</span>
          <div>
            <strong>Best Visiting Season:</strong> ${escapeHTML(site.bestTime || 'October – March')}
            <p class="season-tip">Gujarat monuments are best experienced during mild winter months to avoid peak summer heat.</p>
          </div>
        </div>
      `;
      return;
    }

    const current = weatherData.current_weather;
    const currentWeatherInfo = WMO_CODES[current.weathercode] || { label: 'Fair', icon: '🌡️' };
    const daily = weatherData.daily;

    let forecastHtml = '';
    if (daily && daily.time) {
      forecastHtml = daily.time.slice(0, 3).map((dateStr, i) => {
        const dateObj = new Date(dateStr);
        const dayName = i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const codeInfo = WMO_CODES[daily.weathercode[i]] || { icon: '🌡️' };

        return `
          <div class="forecast-day-card">
            <span class="forecast-date">${dayName}</span>
            <span class="forecast-icon">${codeInfo.icon}</span>
            <span class="forecast-temp">${maxTemp}° / ${minTemp}°C</span>
          </div>
        `;
      }).join('');
    }

    innerContainer.innerHTML = `
      <h3 class="section-subtitle">🌤️ Live Weather &amp; Visiting Season</h3>
      <div class="weather-widget-grid">
        <div class="current-weather-box">
          <div class="weather-main-badge">
            <span class="weather-huge-icon">${currentWeatherInfo.icon}</span>
            <div>
              <span class="current-temp">${Math.round(current.temperature)}°C</span>
              <span class="current-desc">${currentWeatherInfo.label}</span>
            </div>
          </div>
          <div class="weather-wind">💨 Wind: ${current.windspeed} km/h</div>
        </div>

        <div class="forecast-box">
          <span class="forecast-title">3-Day Forecast</span>
          <div class="forecast-days-list">
            ${forecastHtml}
          </div>
        </div>
      </div>

      <div class="best-season-box">
        <span class="season-icon">🗓️</span>
        <div>
          <strong>Recommended Visiting Season:</strong> ${escapeHTML(site.bestTime || 'October – March')}
          <p class="season-tip">Pleasant temperatures ideal for architectural walks, stepwell exploration, and photography.</p>
        </div>
      </div>
    `;
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  return {
    fetchWeather,
    render
  };
})();

window.WeatherComponent = WeatherComponent;
