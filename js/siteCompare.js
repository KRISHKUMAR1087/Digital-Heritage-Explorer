/**
 * Side-by-Side Site Comparison Module
 * Manages selecting up to 2 heritage sites, sticky bottom bar, and side-by-side comparison modal.
 */
const SiteCompareComponent = (() => {
  let selectedSiteIds = [];
  let allSites = [];
  
  const stickyBar = document.getElementById('compare-sticky-bar');
  const compareModal = document.getElementById('site-compare-modal');
  const compareCloseBtn = document.getElementById('compare-modal-close-btn');

  function init(sites) {
    allSites = sites || [];
    
    if (compareCloseBtn) {
      compareCloseBtn.addEventListener('click', closeCompareModal);
    }
    
    if (compareModal) {
      compareModal.addEventListener('click', (e) => {
        if (e.target === compareModal) closeCompareModal();
      });
    }

    updateStickyBar();
  }

  function isSelected(siteId) {
    return selectedSiteIds.includes(siteId);
  }

  function toggleSelect(siteId) {
    const idx = selectedSiteIds.indexOf(siteId);
    if (idx > -1) {
      selectedSiteIds.splice(idx, 1);
    } else {
      if (selectedSiteIds.length >= 2) {
        alert('You can select up to 2 heritage sites for side-by-side comparison.');
        return false;
      }
      selectedSiteIds.push(siteId);
    }

    updateStickyBar();
    return true;
  }

  function clearSelection() {
    selectedSiteIds = [];
    updateStickyBar();
    // Refresh card checkboxes if visible
    const checkboxes = document.querySelectorAll('.card-compare-checkbox');
    checkboxes.forEach(cb => cb.checked = false);
  }

  function updateStickyBar() {
    let barEl = document.getElementById('compare-sticky-bar');
    if (!barEl) return;

    if (selectedSiteIds.length === 0) {
      barEl.style.display = 'none';
      barEl.innerHTML = '';
      return;
    }

    const selectedSites = selectedSiteIds.map(id => allSites.find(s => s.id === id)).filter(Boolean);
    const names = selectedSites.map(s => s.name).join(' vs ');

    barEl.style.display = 'flex';
    barEl.innerHTML = `
      <div class="sticky-bar-content">
        <span class="sticky-bar-text">⚖️ Compare Sites (${selectedSiteIds.length}/2): <strong>${escapeHTML(names)}</strong></span>
        <div class="sticky-bar-actions">
          <button type="button" class="btn-compare-now" id="btn-open-comparison" ${selectedSiteIds.length < 2 ? 'disabled' : ''}>
            ⚖️ Compare Side-by-Side ${selectedSiteIds.length < 2 ? '(Select 1 more)' : ''}
          </button>
          <button type="button" class="btn-compare-clear" id="btn-clear-comparison">✕ Clear</button>
        </div>
      </div>
    `;

    const openBtn = barEl.querySelector('#btn-open-comparison');
    if (openBtn) {
      openBtn.addEventListener('click', openCompareModal);
    }

    const clearBtn = barEl.querySelector('#btn-clear-comparison');
    if (clearBtn) {
      clearBtn.addEventListener('click', clearSelection);
    }
  }

  function openCompareModal() {
    if (selectedSiteIds.length < 2 || !compareModal) return;

    const siteA = allSites.find(s => s.id === selectedSiteIds[0]);
    const siteB = allSites.find(s => s.id === selectedSiteIds[1]);

    if (!siteA || !siteB) return;

    const bodyEl = document.getElementById('compare-modal-body');
    if (bodyEl) {
      bodyEl.innerHTML = renderComparisonTable(siteA, siteB);
    }

    compareModal.classList.add('active');
    compareModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCompareModal() {
    if (!compareModal) return;
    compareModal.classList.remove('active');
    compareModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function renderComparisonTable(siteA, siteB) {
    const getSiteText = (site, field) => window.I18nComponent ? I18nComponent.getSiteText(site, field) : site[field];

    return `
      <div class="compare-table-wrapper">
        <table class="compare-table">
          <thead>
            <tr>
              <th class="col-feature">Feature / Attribute</th>
              <th class="col-site">
                <img src="${siteA.cover}" alt="${escapeHTML(siteA.name)}" class="compare-header-img" />
                <h3>${escapeHTML(getSiteText(siteA, 'name'))}</h3>
                <span class="compare-header-city">📍 ${escapeHTML(getSiteText(siteA, 'city'))}</span>
              </th>
              <th class="col-site">
                <img src="${siteB.cover}" alt="${escapeHTML(siteB.name)}" class="compare-header-img" />
                <h3>${escapeHTML(getSiteText(siteB, 'name'))}</h3>
                <span class="compare-header-city">📍 ${escapeHTML(getSiteText(siteB, 'city'))}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="col-feature">Category</td>
              <td><span class="table-badge">${escapeHTML(siteA.category)}</span></td>
              <td><span class="table-badge">${escapeHTML(siteB.category)}</span></td>
            </tr>
            <tr>
              <td class="col-feature">Historical Era &amp; Year</td>
              <td><strong>${escapeHTML(siteA.period || 'Historical')}</strong> (${siteA.year < 0 ? Math.abs(siteA.year) + ' BCE' : siteA.year + ' AD'})</td>
              <td><strong>${escapeHTML(siteB.period || 'Historical')}</strong> (${siteB.year < 0 ? Math.abs(siteB.year) + ' BCE' : siteB.year + ' AD'})</td>
            </tr>
            <tr>
              <td class="col-feature">Architectural Style</td>
              <td>${escapeHTML(siteA.style || 'Traditional Stone Masonry')}</td>
              <td>${escapeHTML(siteB.style || 'Traditional Stone Masonry')}</td>
            </tr>
            <tr>
              <td class="col-feature">Patron / Builder</td>
              <td>${escapeHTML(siteA.builder || 'Historical Monarchs')}</td>
              <td>${escapeHTML(siteB.builder || 'Historical Monarchs')}</td>
            </tr>
            <tr>
              <td class="col-feature">Primary Material</td>
              <td>${escapeHTML(siteA.material || 'Carved Sandstone')}</td>
              <td>${escapeHTML(siteB.material || 'Carved Sandstone')}</td>
            </tr>
            <tr>
              <td class="col-feature">UNESCO World Heritage</td>
              <td>${siteA.unesco ? '🏛️ UNESCO World Heritage Site' : '❌ State / National Monument'}</td>
              <td>${siteB.unesco ? '🏛️ UNESCO World Heritage Site' : '❌ State / National Monument'}</td>
            </tr>
            <tr>
              <td class="col-feature">Visiting Hours</td>
              <td>${escapeHTML(siteA.timings || 'Daylight Hours')}</td>
              <td>${escapeHTML(siteB.timings || 'Daylight Hours')}</td>
            </tr>
            <tr>
              <td class="col-feature">Entry Ticket Fee</td>
              <td>${escapeHTML(siteA.entryFee || 'Free')}</td>
              <td>${escapeHTML(siteB.entryFee || 'Free')}</td>
            </tr>
            <tr>
              <td class="col-feature">Best Time to Visit</td>
              <td>${escapeHTML(siteA.bestTime || 'October – March')}</td>
              <td>${escapeHTML(siteB.bestTime || 'October – March')}</td>
            </tr>
            <tr>
              <td class="col-feature">Historical Summary</td>
              <td class="table-summary">${escapeHTML(getSiteText(siteA, 'summary'))}</td>
              <td class="table-summary">${escapeHTML(getSiteText(siteB, 'summary'))}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
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
    init,
    isSelected,
    toggleSelect,
    clearSelection,
    openCompareModal
  };
})();

window.SiteCompareComponent = SiteCompareComponent;
