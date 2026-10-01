/**
 * Smart Search & Advanced Filters Module
 * Full-text fuzzy search across names, descriptions, dynasty, & materials in EN/GU/HI.
 * Filters for category, era, UNESCO status, free/paid entry, and open-now status with URL hash sync (#/search?...).
 */
const SearchComponent = (() => {
  let allSites = [];
  let filterCallback = null;
  let activeParams = {
    q: '',
    category: 'All',
    era: 'All',
    unesco: 'All',
    entry: 'All',
    open: 'All'
  };

  function init(sites, onFilterUpdate) {
    allSites = sites || [];
    filterCallback = onFilterUpdate;

    // Parse URL hash on init
    parseHashParams();

    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      if (window.location.hash.startsWith('#/search')) {
        parseHashParams();
        triggerUpdate();
      }
    });
  }

  function parseHashParams() {
    const hash = window.location.hash;
    if (!hash.startsWith('#/search')) return;

    const queryStr = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryStr);

    activeParams = {
      q: params.get('q') || '',
      category: params.get('category') || 'All',
      era: params.get('era') || 'All',
      unesco: params.get('unesco') || 'All',
      entry: params.get('entry') || 'All',
      open: params.get('open') || 'All'
    };
  }

  function updateParams(newPartialParams) {
    activeParams = { ...activeParams, ...newPartialParams };
    syncToHash();
    triggerUpdate();
  }

  function syncToHash() {
    const searchParams = new URLSearchParams();

    if (activeParams.q) searchParams.set('q', activeParams.q);
    if (activeParams.category && activeParams.category !== 'All') searchParams.set('category', activeParams.category);
    if (activeParams.era && activeParams.era !== 'All') searchParams.set('era', activeParams.era);
    if (activeParams.unesco && activeParams.unesco !== 'All') searchParams.set('unesco', activeParams.unesco);
    if (activeParams.entry && activeParams.entry !== 'All') searchParams.set('entry', activeParams.entry);
    if (activeParams.open && activeParams.open !== 'All') searchParams.set('open', activeParams.open);

    const paramStr = searchParams.toString();
    const newHash = paramStr ? `#/search?${paramStr}` : '#/';

    if (window.location.hash !== newHash) {
      history.pushState(null, '', newHash);
    }
  }

  function triggerUpdate() {
    if (typeof filterCallback === 'function') {
      filterCallback(filterSites(allSites, activeParams), activeParams);
    }
  }

  /**
   * Multilingual Full-Text Fuzzy Search & Multi-Criteria Filtering
   */
  function filterSites(sites, params) {
    const q = (params.q || '').trim().toLowerCase();

    return sites.filter(site => {
      // 1. UNESCO Filter
      if (params.unesco === 'true' && !site.unesco) return false;
      if (params.unesco === 'false' && site.unesco) return false;

      // 2. Free / Paid Entry Filter
      if (params.entry === 'free') {
        const isFree = site.entryFee && site.entryFee.toLowerCase().includes('free') && !site.entryFee.toLowerCase().includes('foreign');
        if (!isFree) return false;
      } else if (params.entry === 'paid') {
        const isFree = site.entryFee && site.entryFee.toLowerCase().includes('free') && !site.entryFee.toLowerCase().includes('foreign');
        if (isFree) return false;
      }

      // 3. Open Now Status Filter
      if (params.open === 'true' && window.TouristToolsComponent) {
        const status = TouristToolsComponent.getOpenStatus(site);
        if (!status.isOpen) return false;
      }

      // 4. Category Filter
      if (params.category && params.category !== 'All' && site.category !== params.category) {
        return false;
      }

      // 5. Era Filter
      if (params.era && params.era !== 'All' && site.era !== params.era) {
        return false;
      }

      // 6. Full-Text Multilingual Fuzzy Search Match (Names, City, Summary, Description, Era, Material, Builder)
      if (q) {
        const haystack = [
          site.name, site.name_gu, site.name_hi,
          site.city, site.city_gu, site.city_hi,
          site.summary, site.summary_gu, site.summary_hi,
          site.description, site.era, site.material, site.builder,
          site.category
        ].filter(Boolean).join(' ').toLowerCase();

        // Fuzzy match tokens
        const tokens = q.split(/\s+/);
        const matchesAllTokens = tokens.every(token => haystack.includes(token));
        if (!matchesAllTokens) return false;
      }

      return true;
    });
  }

  function getActiveParams() {
    return { ...activeParams };
  }

  return {
    init,
    updateParams,
    filterSites,
    getActiveParams
  };
})();

window.SearchComponent = SearchComponent;
