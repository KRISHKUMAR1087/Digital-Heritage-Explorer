/**
 * Living Heritage Layer Module
 * Renders living cultural traditions, crafts, and festivals in the detail modal,
 * and handles the "Happening this month" filter.
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

      return `
        <div class="living-item-card ${isThisMonth ? 'active-this-month' : ''}">
          <div class="living-item-header">
            <span class="living-type-badge">${icon} ${escapeHTML(item.type || 'Tradition')}</span>
            ${isThisMonth ? `<span class="living-now-badge">🔥 Happening This Month (${monthNames[currentMonthNum - 1]})</span>` : ''}
          </div>
          <h4 class="living-item-name">${escapeHTML(item.name)}</h4>
          <p class="living-item-note">${escapeHTML(item.note)}</p>
          <span class="living-months-meta">📅 Active Months: ${escapeHTML(monthsFormatted)}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="living-heritage-card" tabindex="0" aria-label="Living Cultural Heritage & Festivals">
        <div class="living-heritage-header">
          <h3 class="living-heritage-title">🎨 Living Heritage &amp; Traditions</h3>
          <p class="living-heritage-subtitle">Intangible crafts, festivals, and living cultural traditions connected to this monument.</p>
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
