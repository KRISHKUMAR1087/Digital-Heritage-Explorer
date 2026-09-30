/**
 * Leaflet Map Component Module
 * Handles Leaflet initialization, marker rendering, card-map synchronization, and bounds fitting across India.
 */

const MapComponent = (() => {
  let map = null;
  const markersMap = new Map(); // Map<siteId, L.Marker>
  let activeFeatureGroup = null;

  /**
   * Create custom Leaflet SVG pin icon.
   * @param {boolean} isSelected - Whether the marker is currently selected.
   */
  function createCustomPin(isSelected = false) {
    const mainColor = isSelected ? '#B5502F' : '#3B2A1A';
    const accentColor = isSelected ? '#FAF5EC' : '#C9A36B';
    const size = isSelected ? 42 : 36;

    const svgHtml = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="${size}" height="${size}">
        <path fill="${mainColor}" stroke="#FAF5EC" stroke-width="20" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
        <circle cx="192" cy="192" r="80" fill="${accentColor}"/>
      </svg>
    `;

    return L.divIcon({
      html: svgHtml,
      className: 'custom-leaflet-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size + 8]
    });
  }

  /**
   * Initialize Leaflet map and render initial site markers.
   * @param {Array} sites - All site objects.
   * @param {Function} onMarkerClick - Callback when a marker is clicked (sync to card).
   * @param {Function} onDetailsClick - Callback when popup "View Details" is clicked.
   */
  function init(sites, onMarkerClick, onDetailsClick) {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Default center set to All India View
    map = L.map('map', {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([20.5937, 78.9629], 5);

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    activeFeatureGroup = L.featureGroup().addTo(map);

    // Create markers for each site
    sites.forEach(site => {
      const marker = L.marker([site.lat, site.lng], {
        icon: createCustomPin(false),
        alt: site.name
      });

      // Custom Popup HTML
      const popupContent = `
        <div>
          <img class="popup-media" src="${site.cover}" alt="${site.name}" />
          <div class="popup-body">
            <h4 class="popup-title">${escapeHTML(site.name)}</h4>
            <div class="popup-city">${escapeHTML(site.city)}</div>
            <button class="popup-btn" data-site-id="${site.id}">View Details</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 260 });

      // Marker Click Event
      marker.on('click', () => {
        highlightMarkerPin(site.id);
        if (typeof onMarkerClick === 'function') {
          onMarkerClick(site.id);
        }
      });

      // Handle popup "View Details" button click
      marker.on('popupopen', (e) => {
        const popupNode = e.popup.getElement();
        const btn = popupNode ? popupNode.querySelector('.popup-btn') : null;
        if (btn) {
          btn.addEventListener('click', (evt) => {
            evt.preventDefault();
            if (typeof onDetailsClick === 'function') {
              onDetailsClick(site);
            }
          });
        }
      });

      markersMap.set(site.id, marker);
      activeFeatureGroup.addLayer(marker);
    });

    // Fit map bounds to encompass all markers
    fitMapBounds();

    // Fix map container rendering issues on window resize
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }

  /**
   * Update active map markers based on filtered sites array.
   * @param {Array} activeSites - Array of filtered site objects.
   */
  function updateMarkers(activeSites) {
    if (!map || !activeFeatureGroup) return;

    activeFeatureGroup.clearLayers();
    const activeIds = new Set(activeSites.map(s => s.id));

    markersMap.forEach((marker, siteId) => {
      if (activeIds.has(siteId)) {
        activeFeatureGroup.addLayer(marker);
      }
    });

    fitMapBounds();
  }

  /**
   * Fit map viewport bounds to current active markers.
   */
  function fitMapBounds() {
    if (!map || !activeFeatureGroup) return;
    const layers = activeFeatureGroup.getLayers();
    if (layers.length > 0) {
      const bounds = activeFeatureGroup.getBounds();
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }

  /**
   * Fly to site location on map, highlight pin, and open popup.
   * @param {string} siteId - Target site ID.
   * @param {boolean} openPopup - Whether to open the marker popup.
   */
  function flyToSite(siteId, openPopup = true) {
    if (!map) return;
    const marker = markersMap.get(siteId);

    if (marker && activeFeatureGroup.hasLayer(marker)) {
      highlightMarkerPin(siteId);
      map.flyTo(marker.getLatLng(), 13, {
        duration: 1.2
      });

      if (openPopup) {
        setTimeout(() => {
          marker.openPopup();
        }, 600);
      }
    }
  }

  /**
   * Highlight marker pin visually.
   */
  function highlightMarkerPin(selectedSiteId) {
    markersMap.forEach((marker, siteId) => {
      const isSelected = siteId === selectedSiteId;
      marker.setIcon(createCustomPin(isSelected));
    });
  }

  /**
   * Invalidate map size (useful when toggling tab views).
   */
  function invalidateSize() {
    if (map) {
      setTimeout(() => map.invalidateSize(), 150);
    }
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
    updateMarkers,
    flyToSite,
    invalidateSize
  };
})();
