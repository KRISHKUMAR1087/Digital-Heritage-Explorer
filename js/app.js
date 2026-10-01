/**
 * Main Application Bootstrap Module
 * Integrates Heritage Trails, Time Travel Slider, Multilingual Support (EN/GU/HI),
 * Passport Stamps, Tourist Plan-a-Visit Tools, Image Recognition, and Service Worker.
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let allSites = [];
  let currentCategory = 'All';
  let currentEra = 'All';
  let searchQuery = '';
  let activeTrailSiteIds = null;
  let maxTimelineYear = 2000;
  let filterThisMonthOnly = false;
  let debounceTimer = null;

  // DOM References
  const searchInput = document.getElementById('search-input');
  const chipsContainer = document.getElementById('category-chips');
  const eraChipsContainer = document.getElementById('era-chips');
  const timelineSlider = document.getElementById('timeline-slider');
  const timelineYearLabel = document.getElementById('timeline-year-label');
  const mobileToggleListBtn = document.getElementById('btn-view-list');
  const mobileToggleMapBtn = document.getElementById('btn-view-map');
  const btnThisMonth = document.getElementById('btn-this-month');
  const btnToggleFilters = document.getElementById('btn-toggle-filters');
  const filterBar = document.querySelector('.filter-bar');

  // Register Offline Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('[SW] Registered scope:', reg.scope))
      .catch(err => console.log('[SW] Registration failed:', err));
  }

  // Initialize Modules
  if (window.A11yComponent && typeof A11yComponent.init === 'function') {
    A11yComponent.init();
  }
  if (window.GalleryComponent) GalleryComponent.init();
  if (window.PassportComponent) PassportComponent.init();

  if (window.I18nComponent) {
    I18nComponent.init((lang) => {
      renderCategoryChips(allSites);
      renderEraChips();
      applyFilters();
      if (window.PassportComponent && PassportComponent.updateCounterUI) PassportComponent.updateCounterUI();
      if (window.SiteCompareComponent && SiteCompareComponent.updateStickyBar) SiteCompareComponent.updateStickyBar();
      if (window.PlannerComponent && PlannerComponent.updateUI) PlannerComponent.updateUI();
      if (window.TrailsComponent && TrailsComponent.renderTrailChips) TrailsComponent.renderTrailChips();
      if (window.GalleryComponent && GalleryComponent.refreshModal) GalleryComponent.refreshModal();
    });
  }

  // Set initial mobile view mode
  document.body.classList.add('mobile-view-list');

  // Mobile Filters & Trails Toggle Handler
  if (btnToggleFilters && filterBar) {
    if (window.innerWidth <= 768) {
      filterBar.classList.add('collapsed');
      btnToggleFilters.setAttribute('aria-expanded', 'false');
    }
    btnToggleFilters.addEventListener('click', () => {
      const isExpanded = btnToggleFilters.getAttribute('aria-expanded') === 'true';
      btnToggleFilters.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
      filterBar.classList.toggle('collapsed', isExpanded);
    });
  }

  // Fetch Site Data with resilient path fallbacks
  const siteDataPaths = [
    './data/sites.json',
    'data/sites.json',
    `${window.location.pathname.replace(/\/[^\/]*$/, '')}/data/sites.json`.replace(/^\/\//, '/')
  ];

  async function loadSitesData() {
    let lastErr = null;
    for (const path of siteDataPaths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      } catch (err) {
        lastErr = err;
      }
    }
    if (window.EMBEDDED_SITES_DATA && Array.isArray(window.EMBEDDED_SITES_DATA) && window.EMBEDDED_SITES_DATA.length > 0) {
      return window.EMBEDDED_SITES_DATA;
    }
    throw lastErr || new Error('All data fetch paths failed and no embedded fallback found');
  }

  function initAppData(sites) {
    allSites = sites;

    // Render Category Chips & Era Chips
    renderCategoryChips(allSites);
    renderEraChips();

    // Initialize Site Comparison Module
    if (window.SiteCompareComponent) {
      SiteCompareComponent.init(allSites);
    }

    // Initialize Leaflet Map
    if (window.MapComponent) {
      MapComponent.init(
        allSites,
        handleMarkerClick,
        handleDetailsClick
      );
    }

    // Initialize Image Recognition Module
    if (window.RecognitionComponent) {
      RecognitionComponent.init(
        allSites,
        handleRecognizedSiteSelect
      );
    }

    // Initialize Heritage Trails Module
    if (window.TrailsComponent) {
      TrailsComponent.init((trailSiteIds) => {
        activeTrailSiteIds = trailSiteIds;
        applyFilters();
      });
    }

    // Initialize Tourist Tools (Near Me & Hidden Gems)
    if (window.TouristToolsComponent) {
      TouristToolsComponent.init((userLocation) => {
        applyFilters();
      });
    }

    const simLocSelect = document.getElementById('simulated-location-select');
    if (simLocSelect) {
      simLocSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val && window.TouristToolsComponent) {
          TouristToolsComponent.setSimulatedLocation(val, () => {
            applyFilters();
          });
        }
      });
    }

    // Initialize Trip Planner UI & Listeners
    const btnOpenTrip = document.getElementById('btn-open-trip-planner');
    if (btnOpenTrip) {
      btnOpenTrip.addEventListener('click', () => {
        if (window.PlannerComponent) PlannerComponent.openModal();
      });
    }
    if (window.PlannerComponent) {
      PlannerComponent.updateUI();
    }

    // Timeline Slider Listener
    if (timelineSlider) {
      timelineSlider.addEventListener('input', (e) => {
        maxTimelineYear = parseInt(e.target.value, 10);
        if (timelineYearLabel) {
          timelineYearLabel.textContent = maxTimelineYear < 0 
            ? `${Math.abs(maxTimelineYear)} BCE` 
            : `${maxTimelineYear} AD`;
        }
        applyFilters();
      });
    }

    // Initialize Smart Search & Advanced Filters Module
    if (window.SearchComponent) {
      SearchComponent.init(allSites, () => {
        applyFilters();
      });
    }

    // Smart Filter Dropdowns Listeners (UNESCO, Entry Fee, Open Now)
    const selectUnesco = document.getElementById('filter-unesco');
    if (selectUnesco) {
      selectUnesco.addEventListener('change', (e) => {
        if (window.SearchComponent) SearchComponent.updateParams({ unesco: e.target.value });
      });
    }

    const selectEntry = document.getElementById('filter-entry');
    if (selectEntry) {
      selectEntry.addEventListener('change', (e) => {
        if (window.SearchComponent) SearchComponent.updateParams({ entry: e.target.value });
      });
    }

    const selectOpen = document.getElementById('filter-open');
    if (selectOpen) {
      selectOpen.addEventListener('change', (e) => {
        if (window.SearchComponent) SearchComponent.updateParams({ open: e.target.value });
      });
    }

    // Happening This Month Filter Button Listener
    if (btnThisMonth) {
      btnThisMonth.addEventListener('click', () => {
        filterThisMonthOnly = !filterThisMonthOnly;
        btnThisMonth.classList.toggle('active', filterThisMonthOnly);
        applyFilters();
      });
    }

    // Initial Render & Hash Routing
    applyFilters();

    window.addEventListener('hashchange', handleHashRouting);
    handleHashRouting();

    // Setup Search Listener with Debounce
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          searchQuery = e.target.value.trim().toLowerCase();
          applyFilters();
        }, 250);
      });
    }

    setupMobileToggle();
  }

  loadSitesData()
    .then(sites => {
      initAppData(sites);
    })
    .catch(error => {
      console.error('Failed to load heritage sites JSON:', error);
      const cardsGrid = document.getElementById('cards-grid');
      if (cardsGrid) {
        cardsGrid.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <h3 class="empty-title">Error Loading Data</h3>
            <p class="empty-desc">Could not load heritage site data. If opening locally, please run a local HTTP server or view on your deployed web URL.</p>
            <button onclick="window.location.reload()" class="btn-primary" style="margin-top: 12px; padding: 8px 16px; cursor: pointer; background: var(--color-terracotta, #B5502F); color: #fff; border: none; border-radius: 6px;">🔄 Retry Loading</button>
          </div>
        `;
      }
    });

  /**
   * Unified Filtering & Sorting Function
   */
  function applyFilters() {
    const activeParams = window.SearchComponent ? SearchComponent.getActiveParams() : {};

    let filteredSites = allSites.filter(site => {
      if (activeTrailSiteIds && !activeTrailSiteIds.includes(site.id)) {
        return false;
      }

      const categoryToMatch = activeParams.category !== undefined && activeParams.category !== 'All' ? activeParams.category : currentCategory;
      const matchesCategory = categoryToMatch === 'All' || site.category === categoryToMatch;

      const eraToMatch = activeParams.era !== undefined && activeParams.era !== 'All' ? activeParams.era : currentEra;
      const matchesEra = eraToMatch === 'All' || site.era === eraToMatch;

      const matchesTimeline = site.year === undefined || site.year <= maxTimelineYear;

      const matchesThisMonth = !filterThisMonthOnly || (window.LivingComponent && LivingComponent.isHappeningThisMonth(site));

      return matchesCategory && matchesEra && matchesTimeline && matchesThisMonth;
    });

    if (window.SearchComponent) {
      const qToUse = searchQuery || activeParams.q || '';
      const paramsToPass = { ...activeParams, q: qToUse };
      filteredSites = SearchComponent.filterSites(filteredSites, paramsToPass);
    }

    const userLoc = window.TouristToolsComponent ? TouristToolsComponent.getUserLocation() : null;
    if (userLoc && window.TouristToolsComponent) {
      filteredSites.sort((a, b) => {
        const distA = TouristToolsComponent.calculateDistance(userLoc.lat, userLoc.lng, a.lat, a.lng);
        const distB = TouristToolsComponent.calculateDistance(userLoc.lat, userLoc.lng, b.lat, b.lng);
        return distA - distB;
      });
    }

    if (window.CardsComponent) {
      CardsComponent.render(
        filteredSites,
        handleCardClick,
        handleDetailsClick
      );
    }

    if (window.MapComponent) {
      MapComponent.updateMarkers(filteredSites);
    }
  }

  function handleHashRouting() {
    const hash = window.location.hash;
    if (!hash || !allSites.length) return;

    if (hash.startsWith('#/site/')) {
      const siteId = hash.replace('#/site/', '').trim();
      const targetSite = allSites.find(s => s.id === siteId);
      if (targetSite) {
        currentCategory = 'All';
        currentEra = 'All';
        searchQuery = '';
        activeTrailSiteIds = null;
        if (searchInput) searchInput.value = '';
        updateChipsActiveUI('All');
        applyFilters();

        if (window.CardsComponent) CardsComponent.highlightCard(targetSite.id);
        if (window.MapComponent) MapComponent.flyToSite(targetSite.id, true);
        if (window.GalleryComponent) GalleryComponent.openDetailModal(targetSite);
      }
    } else if (hash.startsWith('#/trip')) {
      if (window.PlannerComponent) {
        const urlParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
        const sitesParam = urlParams.get('sites');
        if (sitesParam) {
          PlannerComponent.loadFromHashParams(sitesParam);
        }
        PlannerComponent.openModal();
      }
    } else if (hash.startsWith('#/category/')) {
      const catName = decodeURIComponent(hash.replace('#/category/', '').trim());
      currentCategory = catName;
      updateChipsActiveUI(catName);
      applyFilters();
    }
  }

  function updateChipsActiveUI(categoryName) {
    if (!chipsContainer) return;
    const allChips = chipsContainer.querySelectorAll('.chip');
    allChips.forEach(c => {
      const isActive = c.textContent === categoryName;
      c.classList.toggle('active', isActive);
      c.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function getCategoryLabel(cat) {
    if (!window.I18nComponent) return cat;
    const catMap = {
      'All': 'catAll',
      'Stepwell': 'catStepwell',
      'Temple': 'catTemple',
      'Fort & Ruins': 'catFort',
      'Mosque & Complex': 'catMosque',
      'Palace': 'catPalace'
    };
    return catMap[cat] ? I18nComponent.t(catMap[cat]) : cat;
  }

  function getEraLabel(era) {
    if (!window.I18nComponent) return era;
    const eraMap = {
      'All': 'eraAll',
      'Harappan': 'eraHarappan',
      'Mauryan': 'eraMauryan',
      'Solanki': 'eraSolanki',
      'Sultanate': 'eraSultanate',
      'Colonial': 'eraColonial'
    };
    return eraMap[era] ? I18nComponent.t(eraMap[era]) : era;
  }

  function renderCategoryChips(sites) {
    if (!chipsContainer) return;
    const categories = ['All', ...new Set(sites.map(s => s.category))];
    chipsContainer.innerHTML = '';

    categories.forEach(cat => {
      const chip = document.createElement('button');
      chip.className = `chip ${cat === currentCategory ? 'active' : ''}`;
      chip.type = 'button';
      chip.textContent = getCategoryLabel(cat);

      chip.addEventListener('click', () => {
        currentCategory = cat;
        updateChipsActiveUI(cat);
        window.location.hash = cat === 'All' ? '#/' : `#/category/${encodeURIComponent(cat)}`;
        applyFilters();
      });

      chipsContainer.appendChild(chip);
    });
  }

  function renderEraChips() {
    if (!eraChipsContainer) return;
    const eras = ['All', 'Harappan', 'Mauryan', 'Solanki', 'Sultanate', 'Colonial'];
    eraChipsContainer.innerHTML = '';

    eras.forEach(era => {
      const chip = document.createElement('button');
      chip.className = `chip era-chip ${era === currentEra ? 'active' : ''}`;
      chip.type = 'button';
      chip.textContent = getEraLabel(era);

      chip.addEventListener('click', () => {
        currentEra = era;
        const allEraChips = eraChipsContainer.querySelectorAll('.chip');
        allEraChips.forEach(c => c.classList.toggle('active', c.textContent === getEraLabel(era)));
        applyFilters();
      });

      eraChipsContainer.appendChild(chip);
    });
  }

  function handleCardClick(site) {
    window.location.hash = `#/site/${site.id}`;
    if (window.CardsComponent) CardsComponent.highlightCard(site.id);
    if (window.MapComponent) MapComponent.flyToSite(site.id, true);

    if (window.innerWidth <= 768 && document.body.classList.contains('mobile-view-list')) {
      switchToMobileView('map');
      if (window.MapComponent) MapComponent.flyToSite(site.id, true);
    }
  }

  function handleMarkerClick(siteId) {
    window.location.hash = `#/site/${siteId}`;
    if (window.CardsComponent) CardsComponent.highlightCard(siteId);
  }

  function handleDetailsClick(site) {
    window.location.hash = `#/site/${site.id}`;
    if (window.GalleryComponent) GalleryComponent.openDetailModal(site);
  }

  function handleRecognizedSiteSelect(site) {
    window.location.hash = `#/site/${site.id}`;
  }

  function setupMobileToggle() {
    if (mobileToggleListBtn) mobileToggleListBtn.addEventListener('click', () => switchToMobileView('list'));
    if (mobileToggleMapBtn) mobileToggleMapBtn.addEventListener('click', () => switchToMobileView('map'));
  }

  function switchToMobileView(viewMode) {
    if (viewMode === 'list') {
      document.body.classList.remove('mobile-view-map');
      document.body.classList.add('mobile-view-list');
      if (mobileToggleListBtn) mobileToggleListBtn.classList.add('active');
      if (mobileToggleMapBtn) mobileToggleMapBtn.classList.remove('active');
    } else {
      document.body.classList.remove('mobile-view-list');
      document.body.classList.add('mobile-view-map');
      if (mobileToggleMapBtn) mobileToggleMapBtn.classList.add('active');
      if (mobileToggleListBtn) mobileToggleListBtn.classList.remove('active');
      if (window.MapComponent) MapComponent.invalidateSize();
    }
  }
});
