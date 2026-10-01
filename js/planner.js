/**
 * Trip Planner / Itinerary Builder Module
 * Allows users to add monuments to a custom trip itinerary, reorder legs, compute total
 * distance & driving duration, plot route on Leaflet map, export printable PDF, and share deep links.
 */

const PlannerComponent = (() => {
  const STORAGE_KEY = 'heritage_trip_planner';
  let tripSiteIds = loadFromStorage();
  let routePolyline = null;
  let routeMarkers = [];

  /**
   * Safe localStorage read
   */
  function loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('[Planner] Error reading localStorage:', e);
      return [];
    }
  }

  /**
   * Safe localStorage write
   */
  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tripSiteIds));
    } catch (e) {
      console.warn('[Planner] Error saving to localStorage:', e);
    }
  }

  /**
   * Check if site is in trip
   */
  function isInTrip(siteId) {
    return tripSiteIds.includes(siteId);
  }

  /**
   * Toggle site in trip
   */
  function toggleSite(siteId) {
    if (isInTrip(siteId)) {
      tripSiteIds = tripSiteIds.filter(id => id !== siteId);
    } else {
      tripSiteIds.push(siteId);
    }
    saveToStorage();
    updateUI();
    return isInTrip(siteId);
  }

  /**
   * Remove site from trip
   */
  function removeSite(siteId) {
    tripSiteIds = tripSiteIds.filter(id => id !== siteId);
    saveToStorage();
    updateUI();
  }

  /**
   * Move site up in itinerary order
   */
  function moveUp(index) {
    if (index <= 0) return;
    const temp = tripSiteIds[index];
    tripSiteIds[index] = tripSiteIds[index - 1];
    tripSiteIds[index - 1] = temp;
    saveToStorage();
    updateUI();
  }

  /**
   * Move site down in itinerary order
   */
  function moveDown(index) {
    if (index >= tripSiteIds.length - 1) return;
    const temp = tripSiteIds[index];
    tripSiteIds[index] = tripSiteIds[index + 1];
    tripSiteIds[index + 1] = temp;
    saveToStorage();
    updateUI();
  }

  /**
   * Clear entire trip
   */
  function clearTrip() {
    tripSiteIds = [];
    saveToStorage();
    clearRouteFromMap();
    updateUI();
  }

  /**
   * Load trip from URL query params (e.g. ?sites=rani-ki-vav,modhera-sun-temple)
   */
  function loadFromHashParams(sitesParam) {
    if (!sitesParam) return;
    const ids = sitesParam.split(',').map(s => s.trim()).filter(Boolean);
    if (ids.length > 0) {
      tripSiteIds = ids;
      saveToStorage();
      updateUI();
    }
  }

  /**
   * Get total trip site IDs
   */
  function getTripSiteIds() {
    return [...tripSiteIds];
  }

  /**
   * Calculate distance between lat/lng coordinates (Haversine formula in km)
   */
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  }

  /**
   * Calculate total itinerary distance and driving duration
   */
  function getItineraryStats(allSites) {
    const tripSites = tripSiteIds
      .map(id => allSites.find(s => s.id === id))
      .filter(Boolean);

    let totalDist = 0;
    const legs = [];

    for (let i = 0; i < tripSites.length - 1; i++) {
      const from = tripSites[i];
      const to = tripSites[i + 1];
      const dist = calculateDistance(from.lat, from.lng, to.lat, to.lng);
      // Rough road multiplier factor 1.25 for real road paths
      const roadDist = parseFloat((dist * 1.25).toFixed(1));
      totalDist += roadDist;
      
      // Estimate driving time at ~50 km/h avg speed
      const driveTimeMinutes = Math.round((roadDist / 50) * 60);

      legs.push({
        from: from,
        to: to,
        distanceKm: roadDist,
        driveTimeMinutes: driveTimeMinutes
      });
    }

    // Total travel time: driving time + 1 hour per site visit
    const totalDriveMinutes = legs.reduce((acc, leg) => acc + leg.driveTimeMinutes, 0);
    const totalVisitMinutes = tripSites.length * 60;
    const totalTripMinutes = totalDriveMinutes + totalVisitMinutes;

    return {
      sites: tripSites,
      legs: legs,
      totalDistanceKm: parseFloat(totalDist.toFixed(1)),
      totalDriveMinutes: totalDriveMinutes,
      totalTripHours: (totalTripMinutes / 60).toFixed(1)
    };
  }

  /**
   * Render Route Polyline and Waypoint Markers on Leaflet Map
   */
  function drawRouteOnMap() {
    if (!window.MapComponent || !window.MapComponent.getMapInstance) return;
    const map = MapComponent.getMapInstance();
    if (!map) return;

    clearRouteFromMap();

    const allSites = window.App ? App.getAllSites() : [];
    const tripSites = tripSiteIds
      .map(id => allSites.find(s => s.id === id))
      .filter(Boolean);

    if (tripSites.length === 0) return;

    const latLngs = tripSites.map(s => [s.lat, s.lng]);

    // Draw connecting polyline
    routePolyline = L.polyline(latLngs, {
      color: '#B5502F',
      weight: 5,
      opacity: 0.85,
      dashArray: '8, 8',
      lineJoin: 'round'
    }).addTo(map);

    // Draw numbered step markers
    tripSites.forEach((site, index) => {
      const numberIcon = L.divIcon({
        className: 'route-step-marker',
        html: `<div class="step-badge">${index + 1}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([site.lat, site.lng], { icon: numberIcon })
        .addTo(map)
        .bindPopup(`<b>Stop ${index + 1}: ${escapeHTML(site.name)}</b><br>${escapeHTML(site.city)}`);
      
      routeMarkers.push(marker);
    });

    // Fit map bounds to encompass full itinerary
    if (latLngs.length > 0) {
      map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });
    }
  }

  /**
   * Remove route markers and polyline from map
   */
  function clearRouteFromMap() {
    if (!window.MapComponent || !window.MapComponent.getMapInstance) return;
    const map = MapComponent.getMapInstance();
    if (!map) return;

    if (routePolyline) {
      map.removeLayer(routePolyline);
      routePolyline = null;
    }
    routeMarkers.forEach(m => map.removeLayer(m));
    routeMarkers = [];
  }

  /**
   * Update all trip UI elements
   */
  function updateUI() {
    // Update trip count badges
    const countBadges = document.querySelectorAll('.trip-count-badge');
    countBadges.forEach(badge => {
      badge.textContent = tripSiteIds.length;
    });

    // Refresh card "Add to Trip" buttons
    const t = (k) => window.I18nComponent ? I18nComponent.t(k) : k;
    const tripBtns = document.querySelectorAll('.btn-trip-toggle');
    tripBtns.forEach(btn => {
      const siteId = btn.dataset.siteId;
      if (isInTrip(siteId)) {
        btn.classList.add('in-trip');
        btn.innerHTML = t('inTrip');
        btn.setAttribute('aria-label', 'Remove from trip');
      } else {
        btn.classList.remove('in-trip');
        btn.innerHTML = t('addToTrip');
        btn.setAttribute('aria-label', 'Add to trip itinerary');
      }
    });

    // Refresh modal if currently open
    const modal = document.getElementById('trip-planner-modal');
    if (modal && modal.style.display !== 'none') {
      renderModalContent();
    }
  }

  /**
   * Render or Open Trip Planner Modal
   */
  function openModal() {
    let modal = document.getElementById('trip-planner-modal');
    if (!modal) {
      modal = createModalDOM();
    }
    renderModalContent();
    modal.style.display = 'flex';
    modal.classList.add('active'); // Added to trigger CSS opacity & visibility transitions
    modal.setAttribute('aria-hidden', 'false');

    if (window.AccessibilityComponent) {
      AccessibilityComponent.trapFocus(modal);
    }
  }

  /**
   * Close Trip Planner Modal
   */
  function closeModal() {
    const modal = document.getElementById('trip-planner-modal');
    if (modal) {
      modal.classList.remove('active'); // Remove active class for fade-out
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300); // Wait for transition
      modal.setAttribute('aria-hidden', 'true');
      if (window.AccessibilityComponent) {
        AccessibilityComponent.untrapFocus();
      }
    }
  }

  /**
   * Create Modal DOM element if not exists
   */
  function createModalDOM() {
    const t = (k) => window.I18nComponent ? I18nComponent.t(k) : k;
    const modal = document.createElement('div');
    modal.id = 'trip-planner-modal';
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'trip-modal-title');
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="modal-container trip-modal-container">
        <button type="button" class="modal-close-btn" id="trip-modal-close-btn" aria-label="Close itinerary planner">✕</button>
        <div class="trip-modal-header">
          <h2 id="trip-modal-title" class="trip-modal-title" data-i18n="tripTitle">${t('tripTitle')}</h2>
          <p class="trip-modal-subtitle" data-i18n="tripSubtitle">${t('tripSubtitle')}</p>
        </div>
        <div class="trip-modal-body" id="trip-modal-body"></div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#trip-modal-close-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    return modal;
  }

  /**
   * Render inside of Trip Planner Modal
   */
  function renderModalContent() {
    const container = document.getElementById('trip-modal-body');
    if (!container) return;

    const t = (k) => window.I18nComponent ? I18nComponent.t(k) : k;
    const getSiteText = (s, f) => window.I18nComponent ? I18nComponent.getSiteText(s, f) : (s ? s[f] : '');

    const titleEl = document.getElementById('trip-modal-title');
    if (titleEl) titleEl.textContent = t('tripTitle');
    const subTitleEl = document.querySelector('.trip-modal-subtitle');
    if (subTitleEl) subTitleEl.textContent = t('tripSubtitle');

    const allSites = window.App ? App.getAllSites() : [];
    const stats = getItineraryStats(allSites);

    if (stats.sites.length === 0) {
      container.innerHTML = `
        <div class="trip-empty-state">
          <div class="empty-icon">📍</div>
          <h3>${t('emptyTripTitle')}</h3>
          <p>${t('emptyTripDesc')}</p>
        </div>
      `;
      return;
    }

    let itemsHtml = stats.sites.map((site, index) => {
      const legInfo = stats.legs[index - 1];

      return `
        ${legInfo ? `
          <div class="trip-leg-connector">
            <span class="leg-line"></span>
            <span class="leg-info">🚗 ${legInfo.distanceKm} km (~${legInfo.driveTimeMinutes} mins drive)</span>
            <span class="leg-line"></span>
          </div>
        ` : ''}
        <div class="trip-item-card" data-site-id="${site.id}">
          <div class="trip-item-number">${index + 1}</div>
          <img src="${site.cover}" alt="${escapeHTML(getSiteText(site, 'name'))}" class="trip-item-thumb" />
          <div class="trip-item-details">
            <h4 class="trip-item-title">${escapeHTML(getSiteText(site, 'name'))}</h4>
            <span class="trip-item-city">📍 ${escapeHTML(getSiteText(site, 'city'))} • ${escapeHTML(site.category)}</span>
          </div>
          <div class="trip-item-actions">
            <button type="button" class="btn-trip-order btn-move-up" data-index="${index}" ${index === 0 ? 'disabled' : ''} aria-label="Move stop up">▲</button>
            <button type="button" class="btn-trip-order btn-move-down" data-index="${index}" ${index === stats.sites.length - 1 ? 'disabled' : ''} aria-label="Move stop down">▼</button>
            <button type="button" class="btn-trip-remove" data-site-id="${site.id}" aria-label="Remove stop">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

    const shareUrl = `${window.location.origin}${window.location.pathname}#/trip?sites=${tripSiteIds.join(',')}`;

    container.innerHTML = `
      <div class="trip-summary-bar">
        <div class="summary-stat">
          <span class="stat-label">${t('totalStops')}</span>
          <span class="stat-value">${stats.sites.length} ${t('monumentsCount')}</span>
        </div>
        <div class="summary-stat">
          <span class="stat-label">${t('roadDistance')}</span>
          <span class="stat-value">${stats.totalDistanceKm} km</span>
        </div>
        <div class="summary-stat">
          <span class="stat-label">${t('tourTime')}</span>
          <span class="stat-value">~${stats.totalTripHours} ${t('hours')}</span>
        </div>
      </div>

      <div class="trip-items-list">
        ${itemsHtml}
      </div>

      <div class="trip-modal-actions">
        <button type="button" id="btn-draw-trip-route" class="btn-primary-action">
          ${t('showRoute')}
        </button>
        <button type="button" id="btn-print-trip" class="btn-secondary-action">
          ${t('exportPdf')}
        </button>
        <button type="button" id="btn-share-trip" class="btn-secondary-action">
          ${t('shareLink')}
        </button>
        <button type="button" id="btn-clear-trip" class="btn-danger-action">
          ${t('clearTrip')}
        </button>
      </div>

      <div id="trip-share-feedback" class="share-feedback-msg" style="display: none;"></div>
    `;

    // Bind item order and removal actions
    container.querySelectorAll('.btn-move-up').forEach(btn => {
      btn.addEventListener('click', () => moveUp(parseInt(btn.dataset.index, 10)));
    });

    container.querySelectorAll('.btn-move-down').forEach(btn => {
      btn.addEventListener('click', () => moveDown(parseInt(btn.dataset.index, 10)));
    });

    container.querySelectorAll('.btn-trip-remove').forEach(btn => {
      btn.addEventListener('click', () => removeSite(btn.dataset.siteId));
    });

    // Bind footer actions
    container.querySelector('#btn-draw-trip-route').addEventListener('click', () => {
      closeModal();
      drawRouteOnMap();
    });

    container.querySelector('#btn-print-trip').addEventListener('click', () => {
      window.print();
    });

    container.querySelector('#btn-share-trip').addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          showShareFeedback('✅ Link copied to clipboard!');
        });
      } else {
        showShareFeedback(`Share Link: ${shareUrl}`);
      }
    });

    container.querySelector('#btn-clear-trip').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your trip itinerary?')) {
        clearTrip();
      }
    });
  }

  /**
   * Helper to display temporary feedback message
   */
  function showShareFeedback(msg) {
    const el = document.getElementById('trip-share-feedback');
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
      setTimeout(() => {
        el.style.display = 'none';
      }, 3500);
    }
  }

  /**
   * Helper to escape HTML characters
   */
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
    isInTrip,
    toggleSite,
    removeSite,
    moveUp,
    moveDown,
    clearTrip,
    getTripSiteIds,
    getItineraryStats,
    drawRouteOnMap,
    clearRouteFromMap,
    loadFromHashParams,
    openModal,
    closeModal,
    updateUI
  };
})();

window.PlannerComponent = PlannerComponent;
