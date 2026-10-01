/**
 * Cards Component Module
 * Handles rendering the info cards grid, passport stamps, live open/closed status badges,
 * multilingual text, distance calculations, and card click interactions.
 */

const CardsComponent = (() => {
  const cardsContainer = document.getElementById('cards-grid');
  const countIndicator = document.getElementById('results-count');

  function render(sites, onCardClick, onDetailsClick) {
    if (!cardsContainer) return;
    cardsContainer.innerHTML = '';

    const t = (key) => window.I18nComponent ? I18nComponent.t(key) : key;
    const getSiteText = (site, field) => window.I18nComponent ? I18nComponent.getSiteText(site, field) : site[field];

    if (countIndicator) {
      countIndicator.textContent = `${sites.length} ${t('resultsCount')}`;
    }

    if (sites.length === 0) {
      renderEmptyState();
      return;
    }

    const userLoc = window.TouristToolsComponent ? TouristToolsComponent.getUserLocation() : null;

    sites.forEach(site => {
      const card = document.createElement('article');
      card.className = `site-card ${PassportComponent.isVisited(site.id) ? 'stamped' : ''}`;
      card.dataset.siteId = site.id;
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `View ${getSiteText(site, 'name')} details`);

      const openStatus = TouristToolsComponent ? TouristToolsComponent.getOpenStatus(site) : { label: 'Open', isOpen: true };
      const statusText = openStatus.isOpen ? t('openNow') : t('closedNow');
      const isVisited = PassportComponent.isVisited(site.id);

      let distanceHtml = '';
      if (userLoc && window.TouristToolsComponent) {
        const distKm = TouristToolsComponent.calculateDistance(userLoc.lat, userLoc.lng, site.lat, site.lng);
        const formattedDist = TouristToolsComponent.formatDistance(distKm);
        distanceHtml = `<div class="card-distance-badge">📍 <strong>${formattedDist}</strong> (${distKm.toFixed(1)} ${t('kmAway')})</div>`;
      }

      card.innerHTML = `
        <div class="card-media">
          <img src="${site.cover}" alt="${escapeHTML(getSiteText(site, 'name'))} cover photo" loading="lazy" width="400" height="225" />
          <span class="card-badge">${escapeHTML(site.category)}</span>
          ${isVisited ? `<span class="stamp-badge">${t('stampedBadge')}</span>` : ''}
        </div>
        <div class="card-content">
          <div class="card-meta-line">
            <span class="card-location">${escapeHTML(getSiteText(site, 'city'))}</span>
            <span class="open-status-badge ${openStatus.isOpen ? 'open' : 'closed'}">${statusText}</span>
          </div>
          
          <h3 class="card-title">${escapeHTML(getSiteText(site, 'name'))}</h3>
          <p class="card-summary">${escapeHTML(getSiteText(site, 'summary'))}</p>

          ${distanceHtml}

          <div class="card-footer">
            <label class="card-compare-label" title="Select to compare two sites side-by-side">
              <input type="checkbox" class="card-compare-checkbox" data-site-id="${site.id}" ${window.SiteCompareComponent && SiteCompareComponent.isSelected(site.id) ? 'checked' : ''} />
              <span>${t('compare')}</span>
            </label>

            <button class="btn-trip-toggle ${window.PlannerComponent && PlannerComponent.isInTrip(site.id) ? 'in-trip' : ''}" data-site-id="${site.id}" aria-label="Toggle trip itinerary">
              ${window.PlannerComponent && PlannerComponent.isInTrip(site.id) ? t('inTrip') : t('addToTrip')}
            </button>

            <button class="btn-stamp" aria-label="Stamp passport for ${escapeHTML(getSiteText(site, 'name'))}" title="Toggle passport stamp">
              ${isVisited ? t('stamped') : t('stamp')}
            </button>

            <button class="btn-details" aria-label="View details for ${escapeHTML(getSiteText(site, 'name'))}">
              ${t('viewDetails')}
            </button>
          </div>
        </div>
      `;

      const tripBtn = card.querySelector('.btn-trip-toggle');
      if (tripBtn) {
        tripBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.PlannerComponent) {
            PlannerComponent.toggleSite(site.id);
          }
        });
      }

      const compareCheckbox = card.querySelector('.card-compare-checkbox');
      if (compareCheckbox) {
        compareCheckbox.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.SiteCompareComponent) {
            const success = SiteCompareComponent.toggleSelect(site.id);
            if (!success) compareCheckbox.checked = false;
          }
        });
      }

      const stampBtn = card.querySelector('.btn-stamp');
      if (stampBtn) {
        stampBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.PassportComponent) {
            PassportComponent.toggleVisited(site.id);
            render(sites, onCardClick, onDetailsClick);
          }
        });
      }

      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-details')) {
          e.stopPropagation();
          if (typeof onDetailsClick === 'function') onDetailsClick(site);
        } else if (!e.target.closest('.btn-stamp') && !e.target.closest('.btn-trip-toggle') && !e.target.closest('.card-compare-checkbox')) {
          if (typeof onCardClick === 'function') onCardClick(site);
        }
      });

      card.addEventListener('keydown', (e) => {
        if (e.target !== card) return; // Ignore keydown unless e.target === card
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (typeof onCardClick === 'function') onCardClick(site);
        }
      });

      cardsContainer.appendChild(card);
    });
  }

  function renderEmptyState() {
    if (!cardsContainer) return;
    const t = (key) => window.I18nComponent ? I18nComponent.t(key) : key;

    cardsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">${t('noSitesFound')}</h3>
        <p class="empty-desc">${t('noSitesDesc')}</p>
      </div>
    `;
  }

  function highlightCard(siteId) {
    if (!cardsContainer) return;
    const allCards = cardsContainer.querySelectorAll('.site-card');
    allCards.forEach(c => {
      const isTarget = c.dataset.siteId === siteId;
      c.classList.toggle('highlighted', isTarget);
      if (isTarget) {
        c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
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
    highlightCard
  };
})();

window.CardsComponent = CardsComponent;
