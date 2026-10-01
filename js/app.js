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

  // Register Offline Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('[SW] Registered scope:', reg.scope))
      .catch(err => console.log('[SW] Registration failed:', err));
  }

  // Initialize Modules
  GalleryComponent.init();
  PassportComponent.init();

  I18nComponent.init((lang) => {
    renderCategoryChips(allSites);
    renderEraChips();
    applyFilters();
  });

  // Set initial mobile view mode
  document.body.classList.add('mobile-view-list');

  // Fetch Site Data from data/sites.json
  fetch('data/sites.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(sites => {
      allSites = sites;

      // Render Category Chips & Era Chips
      renderCategoryChips(allSites);
      renderEraChips();

      // Initialize Site Comparison Module
      if (window.SiteCompareComponent) {
        SiteCompareComponent.init(allSites);
      }

      // Initialize Leaflet Map
      MapComponent.init(
        allSites,
        handleMarkerClick,
        handleDetailsClick
      );

      // Initialize Image Recognition Module
      RecognitionComponent.init(
        allSites,
        handleRecognizedSiteSelect
      );

      // Initialize Heritage Trails Module
      TrailsComponent.init((trailSiteIds) => {
        activeTrailSiteIds = trailSiteIds;
        applyFilters();
      });

      // Initialize Tourist Tools (Near Me & Hidden Gems)
      TouristToolsComponent.init((userLocation) => {
        // Location updated, re-apply filters & sort cards by GPS distance
        applyFilters();
      });

      const simLocSelect = document.getElementById('simulated-location-select');
      if (simLocSelect) {
        simLocSelect.addEventListener('change', (e) => {
          const val = e.target.value;
          if (val) {
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
    })
    .catch(error => {
      console.error('Failed to load heritage sites JSON:', error);
      const cardsGrid = document.getElementById('cards-grid');
      if (cardsGrid) {
        cardsGrid.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <h3 class="empty-title">Error Loading Data</h3>
            <p class="empty-desc">Could not load heritage site data. Please serve via local HTTP server (<code>python -m http.server</code>).</p>
          </div>
        `;
      }
    });

  /**
   * Unified Filtering & Sorting Function
   */
  function applyFilters() {
    // If SearchComponent is active, retrieve active params
    const activeParams = window.SearchComponent ? SearchComponent.getActiveParams() : {};

    let filteredSites = allSites.filter(site => {
      // Trail Filter
      if (activeTrailSiteIds && !activeTrailSiteIds.includes(site.id)) {
        return false;
      }

      // Category Match
      const categoryToMatch = activeParams.category !== undefined && activeParams.category !== 'All' ? activeParams.category : currentCategory;
      const matchesCategory = categoryToMatch === 'All' || site.category === categoryToMatch;

      // Era Match
      const eraToMatch = activeParams.era !== undefined && activeParams.era !== 'All' ? activeParams.era : currentEra;
      const matchesEra = eraToMatch === 'All' || site.era === eraToMatch;

      // Timeline Year Match (site year <= slider year)
      const matchesTimeline = site.year === undefined || site.year <= maxTimelineYear;

      // Happening This Month Match
      const matchesThisMonth = !filterThisMonthOnly || (window.LivingComponent && LivingComponent.isHappeningThisMonth(site));

      return matchesCategory && matchesEra && matchesTimeline && matchesThisMonth;
    });

    // Delegate smart search, unesco, entry, open & multilingual fuzzy search to SearchComponent
    if (window.SearchComponent) {
      const qToUse = searchQuery || activeParams.q || '';
      const paramsToPass = { ...activeParams, q: qToUse };
      filteredSites = SearchComponent.filterSites(filteredSites, paramsToPass);
    }

    // If User GPS Location is active, sort by nearest distance
    const userLoc = TouristToolsComponent.getUserLocation();
    if (userLoc) {
      filteredSites.sort((a, b) => {
        const distA = TouristToolsComponent.calculateDistance(userLoc.lat, userLoc.lng, a.lat, a.lng);
        const distB = TouristToolsComponent.calculateDistance(userLoc.lat, userLoc.lng, b.lat, b.lng);
        return distA - distB;
      });
    }

    // Update Cards Grid
    CardsComponent.render(
      filteredSites,
      handleCardClick,
      handleDetailsClick
    );

    // Update Map Markers
    MapComponent.updateMarkers(filteredSites);
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

        CardsComponent.highlightCard(targetSite.id);
        MapComponent.flyToSite(targetSite.id, true);
        GalleryComponent.openDetailModal(targetSite);
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

  function renderCategoryChips(sites) {
    if (!chipsContainer) return;
    const categories = ['All', ...new Set(sites.map(s => s.category))];
    chipsContainer.innerHTML = '';

    categories.forEach(cat => {
      const chip = document.createElement('button');
      chip.className = `chip ${cat === currentCategory ? 'active' : ''}`;
      chip.type = 'button';
      chip.textContent = cat;

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
      chip.textContent = era;

      chip.addEventListener('click', () => {
        currentEra = era;
        const allEraChips = eraChipsContainer.querySelectorAll('.chip');
        allEraChips.forEach(c => c.classList.toggle('active', c.textContent === era));
        applyFilters();
      });

      eraChipsContainer.appendChild(chip);
    });
  }

  function handleCardClick(site) {
    window.location.hash = `#/site/${site.id}`;
    CardsComponent.highlightCard(site.id);
    MapComponent.flyToSite(site.id, true);

    if (window.innerWidth <= 768 && document.body.classList.contains('mobile-view-list')) {
      switchToMobileView('map');
      MapComponent.flyToSite(site.id, true);
    }
  }

  function handleMarkerClick(siteId) {
    window.location.hash = `#/site/${siteId}`;
    CardsComponent.highlightCard(siteId);
  }

  function handleDetailsClick(site) {
    window.location.hash = `#/site/${site.id}`;
    GalleryComponent.openDetailModal(site);
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
      MapComponent.invalidateSize();
    }
  }
});
