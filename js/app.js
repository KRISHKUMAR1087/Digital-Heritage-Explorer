/**
 * Main Application Bootstrap Module
 * Initializes data fetching, state management, search/category filtering, image recognition, and mobile view toggling.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  let allSites = [];
  let currentCategory = 'All';
  let searchQuery = '';
  let debounceTimer = null;

  // DOM References
  const searchInput = document.getElementById('search-input');
  const chipsContainer = document.getElementById('category-chips');
  const mobileToggleListBtn = document.getElementById('btn-view-list');
  const mobileToggleMapBtn = document.getElementById('btn-view-map');

  // Initialize Gallery Module Event Listeners
  GalleryComponent.init();

  // Set initial mobile view mode
  document.body.classList.add('mobile-view-list');

  // Fetch Site Data from data/sites.json
  fetch('data/sites.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(sites => {
      allSites = sites;

      // Render Category Filter Chips
      renderCategoryChips(allSites);

      // Initialize Leaflet Map
      MapComponent.init(
        allSites,
        handleMarkerClick,
        handleDetailsClick
      );

      // Initialize Image Landmark Recognition Module
      RecognitionComponent.init(
        allSites,
        handleRecognizedSiteSelect
      );

      // Render Initial Card Grid & Map Markers
      applyFilters();

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

      // Setup Mobile Toggle Listeners
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
            <p class="empty-desc">Could not load heritage site data. Please ensure you are running the project on a local HTTP server (e.g., <code>python -m http.server</code>).</p>
          </div>
        `;
      }
    });

  /**
   * Unified Filtering Function
   * Filters allSites according to search query and category, then updates cards and map markers together.
   */
  function applyFilters() {
    const filteredSites = allSites.filter(site => {
      // Category Match
      const matchesCategory = currentCategory === 'All' || site.category === currentCategory;

      // Search Query Match (Name, City, Summary, Description)
      const q = searchQuery;
      const matchesSearch = !q || (
        site.name.toLowerCase().includes(q) ||
        site.city.toLowerCase().includes(q) ||
        site.summary.toLowerCase().includes(q) ||
        (site.description && site.description.toLowerCase().includes(q))
      );

      return matchesCategory && matchesSearch;
    });

    // Update Cards Grid
    CardsComponent.render(
      filteredSites,
      handleCardClick,
      handleDetailsClick
    );

    // Update Map Markers & Bounds
    MapComponent.updateMarkers(filteredSites);
  }

  /**
   * Render category filter chips.
   * @param {Array} sites - All site objects.
   */
  function renderCategoryChips(sites) {
    if (!chipsContainer) return;

    // Extract unique categories
    const categories = ['All', ...new Set(sites.map(s => s.category))];
    chipsContainer.innerHTML = '';

    categories.forEach(cat => {
      const chip = document.createElement('button');
      chip.className = `chip ${cat === currentCategory ? 'active' : ''}`;
      chip.type = 'button';
      chip.textContent = cat;
      chip.setAttribute('aria-pressed', cat === currentCategory ? 'true' : 'false');

      chip.addEventListener('click', () => {
        currentCategory = cat;
        // Update active chip UI
        const allChips = chipsContainer.querySelectorAll('.chip');
        allChips.forEach(c => {
          c.classList.remove('active');
          c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('active');
        chip.setAttribute('aria-pressed', 'true');

        applyFilters();
      });

      chipsContainer.appendChild(chip);
    });
  }

  /**
   * Sync Handler: Card Click -> Fly Map to Marker & Highlight Pin
   */
  function handleCardClick(site) {
    CardsComponent.highlightCard(site.id);
    MapComponent.flyToSite(site.id, true);

    // If in mobile view, switch to map view tab smoothly when card clicked
    if (window.innerWidth <= 768 && document.body.classList.contains('mobile-view-list')) {
      switchToMobileView('map');
      MapComponent.flyToSite(site.id, true);
    }
  }

  /**
   * Sync Handler: Marker Click -> Highlight & Scroll to Card
   */
  function handleMarkerClick(siteId) {
    CardsComponent.highlightCard(siteId);
  }

  /**
   * Detail Handler: Open Detail Modal & Lightbox
   */
  function handleDetailsClick(site) {
    GalleryComponent.openDetailModal(site);
  }

  /**
   * Photo Recognition Handler: Focus & View Recognized Site
   */
  function handleRecognizedSiteSelect(site) {
    // Reset filters to show the site if filtered out
    currentCategory = 'All';
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    
    // Refresh active chips UI
    const allChips = chipsContainer.querySelectorAll('.chip');
    allChips.forEach(c => {
      c.classList.toggle('active', c.textContent === 'All');
    });

    applyFilters();

    // Highlight card & fly map
    CardsComponent.highlightCard(site.id);
    MapComponent.flyToSite(site.id, true);

    // Open detail modal
    setTimeout(() => {
      GalleryComponent.openDetailModal(site);
    }, 400);
  }

  /**
   * Setup Mobile View Toggle Buttons
   */
  function setupMobileToggle() {
    if (mobileToggleListBtn) {
      mobileToggleListBtn.addEventListener('click', () => switchToMobileView('list'));
    }
    if (mobileToggleMapBtn) {
      mobileToggleMapBtn.addEventListener('click', () => switchToMobileView('map'));
    }
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
