/**
 * Living Heritage Layer Module
 * Renders living cultural traditions, crafts, and festivals in the detail modal,
 * handles "Happening this month" filter, and provides "Add to Google Calendar" links.
 */
const LivingComponent = (() => {
  let container = null;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function render(site, targetEl) {
    container = targetEl;
    if (!container) return;

    if (!site || !site.living || site.living.length === 0) {
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    container.style.display = 'block';
    renderLayout(site);
  }

  function renderLayout(site) {
    if (!container) return;
    const currentMonthNum = new Date().getMonth() + 1;

    let itemsHTML = site.living.map(item => {
      const isThisMonth = item.months && item.months.includes(currentMonthNum);
      const monthsFormatted = item.months ? item.months.map(m => monthNames[m - 1]).join(', ') : 'All Year';
      const icon = item.type === 'Festival' ? '🎭' : (item.type === 'Craft' ? '🎨' : '🍲');

      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.name + ' at ' + site.name)}&details=${encodeURIComponent(item.note)}&location=${encodeURIComponent(site.name + ', ' + site.city)}`;

      return `
        <div class="living-item-card ${isThisMonth ? 'active-this-month' : ''}">
          <div class="living-item-header">
            <span class="living-type-badge">${icon} ${escapeHTML(item.type || 'Tradition')}</span>
            ${isThisMonth ? `<span class="living-now-badge">🔥 Happening This Month (${monthNames[currentMonthNum - 1]})</span>` : ''}
          </div>
          <h4 class="living-item-name">${escapeHTML(item.name)}</h4>
          <p class="living-item-note">${escapeHTML(item.note)}</p>
          <div class="living-meta-row">
            <span class="living-months-meta">📅 Active Months: ${escapeHTML(monthsFormatted)}</span>
            ${item.type === 'Festival' ? `
              <a href="${gcalUrl}" target="_blank" rel="noopener noreferrer" class="btn-add-gcal">
                📅 Add to Google Calendar
              </a>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="living-heritage-card" tabindex="0" aria-label="Living Cultural Heritage & Festivals">
        <div class="living-heritage-header">
          <h3 class="living-heritage-title">🎨 Living Heritage &amp; Cultural Calendar</h3>
          <p class="living-heritage-subtitle">Intangible crafts, seasonal festivals, and living cultural traditions connected to this monument.</p>
        </div>

        <div class="living-items-grid">
          ${itemsHTML}
        </div>
      </div>
    `;
  }

  function isHappeningThisMonth(site) {
    if (!site || !site.living) return false;
    const currentMonthNum = new Date().getMonth() + 1;
    return site.living.some(item => item.months && item.months.includes(currentMonthNum));
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
    render,
    isHappeningThisMonth
  };
})();

window.LivingComponent = LivingComponent;
