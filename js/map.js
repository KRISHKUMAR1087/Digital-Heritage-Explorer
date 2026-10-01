/**
 * Leaflet Map Component Module
 * Handles Leaflet initialization, site marker rendering, card-map synchronization,
 * live user location marker with accuracy circle, distance polylines, and bounds fitting across India.
 */

const MapComponent = (() => {
  let map = null;
  const markersMap = new Map(); // Map<siteId, L.Marker>
  let activeFeatureGroup = null;

  // Live User Location elements
  let userMarker = null;
  let userAccuracyCircle = null;
  let activeRoutePolyline = null;
  let allSitesReference = [];

  /**
   * Create custom Leaflet SVG pin icon for site markers.
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
   * Create custom SVG icon for Person's Live Location.
   */
  function createUserPinIcon() {
    const html = `
      <div class="user-live-pin">
        <div class="user-live-pulse"></div>
        <div class="user-live-dot">📍</div>
      </div>
    `;

    return L.divIcon({
      html: html,
      className: 'user-leaflet-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });
  }

  /**
   * Initialize Leaflet map and render initial site markers.
   */
  function init(sites, onMarkerClick, onDetailsClick) {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    allSitesReference = sites;

    // Default center set to Gujarat / All India View
    map = L.map('map', {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([22.2587, 71.1924], 7);

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    activeFeatureGroup = L.featureGroup().addTo(map);

    // Add Live GPS Custom Control Button on top-right of Leaflet Map
    addLiveGpsControl();

    // Create markers for each site
    sites.forEach(site => {
      const marker = createSiteMarker(site, onMarkerClick, onDetailsClick);
      const marker = L.marker([site.lat, site.lng], {
        icon: createCustomPin(false),
        alt: site.name
      });

      function buildPopupContent() {
        const getSiteText = (s, f) => window.I18nComponent ? I18nComponent.getSiteText(s, f) : s[f];
        const t = (k) => window.I18nComponent ? I18nComponent.t(k) : k;
        return `
          <div>
            <img class="popup-media" src="${site.cover}" alt="${escapeHTML(getSiteText(site, 'name'))}" />
            <div class="popup-body">
              <h4 class="popup-title">${escapeHTML(getSiteText(site, 'name'))}</h4>
              <div class="popup-city">${escapeHTML(getSiteText(site, 'city'))}</div>
              <button class="popup-btn" data-site-id="${site.id}">${t('viewDetails')}</button>
            </div>
          </div>
        `;
      }

      marker.bindPopup(() => buildPopupContent(), { maxWidth: 260 });

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

  function createSiteMarker(site, onMarkerClick, onDetailsClick) {
    const marker = L.marker([site.lat, site.lng], {
      icon: createCustomPin(false),
      alt: site.name
    });

    // Bind initial popup content
    marker.bindPopup(() => generatePopupContent(site), { maxWidth: 280 });

    // Marker Click Event
    marker.on('click', () => {
      highlightMarkerPin(site.id);
      drawLiveDistanceLine(site);
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

    return marker;
  }

  function generatePopupContent(site) {
    const userLoc = window.TouristToolsComponent ? TouristToolsComponent.getUserLocation() : null;
    let distanceSnippet = '';

    if (userLoc) {
      const distKm = TouristToolsComponent.calculateDistance(userLoc.lat, userLoc.lng, site.lat, site.lng);
      const formattedDist = TouristToolsComponent.formatDistance(distKm);
      const estMinutes = Math.round((distKm / 45) * 60); // approx driving time
      distanceSnippet = `
        <div class="popup-live-distance">
          <span>📍 <strong>${formattedDist}</strong> from your live location</span>
          <span class="popup-drive-time">🚗 ~${estMinutes} min drive</span>
        </div>
      `;
    }

    return `
      <div>
        <img class="popup-media" src="${site.cover}" alt="${escapeHTML(site.name)}" />
        <div class="popup-body">
          <h4 class="popup-title">${escapeHTML(site.name)}</h4>
          <div class="popup-city">${escapeHTML(site.city)}</div>
          ${distanceSnippet}
          <button class="popup-btn" data-site-id="${site.id}">View Details</button>
        </div>
      </div>
    `;
  }

  /**
   * Add custom "Live GPS" control button directly onto Leaflet Map UI
   */
  function addLiveGpsControl() {
    if (!map) return;

    const GpsControl = L.Control.extend({
      options: { position: 'topright' },
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom-gps');
        container.innerHTML = `<button type="button" title="Track My Live Location" class="map-gps-btn">🎯</button>`;
        container.style.backgroundColor = '#FFFFFF';
        container.style.width = '34px';
        container.style.height = '34px';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.cursor = 'pointer';
        container.style.fontSize = '1.1rem';

        L.DomEvent.disableClickPropagation(container);
        container.onclick = function() {
          if (window.TouristToolsComponent) {
            TouristToolsComponent.toggleLiveTracking();
          }
        };
        return container;
      }
    });

    map.addControl(new GpsControl());
  }

  /**
   * Update or create Live Location marker for the user ("The Person")
   */
  function updateUserLocationMarker(userLocation) {
    if (!map || !userLocation) return;

    const latLng = [userLocation.lat, userLocation.lng];
    const accuracy = userLocation.accuracy || 20;

    // 1. Create or update user marker
    if (!userMarker) {
      userMarker = L.marker(latLng, {
        icon: createUserPinIcon(),
        zIndexOffset: 1000,
        alt: 'Your Live Location'
      }).addTo(map);

      userMarker.bindPopup(`
        <div class="user-popup-content">
          <h4>📍 Your Live Location</h4>
          <p>Accuracy: ±${accuracy} meters</p>
          <p class="user-coords">Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}</p>
        </div>
      `);
    } else {
      userMarker.setLatLng(latLng);
      userMarker.setPopupContent(`
        <div class="user-popup-content">
          <h4>📍 Your Live Location</h4>
          <p>Accuracy: ±${accuracy} meters</p>
          <p class="user-coords">Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}</p>
        </div>
      `);
    }

    // 2. Create or update user accuracy circle
    if (!userAccuracyCircle) {
      userAccuracyCircle = L.circle(latLng, {
        radius: accuracy,
        color: '#1A73E8',
        fillColor: '#1A73E8',
        fillOpacity: 0.15,
        weight: 1.5
      }).addTo(map);
    } else {
      userAccuracyCircle.setLatLng(latLng);
      userAccuracyCircle.setRadius(accuracy);
    }

    // 3. Update existing site marker popups to reflect live distance
    markersMap.forEach((marker, siteId) => {
      const site = allSitesReference.find(s => s.id === siteId);
      if (site) {
        marker.setPopupContent(generatePopupContent(site));
      }
    });
  }

  /**
   * Remove User Location Marker & Circle from map
   */
  function removeUserLocationMarker() {
    if (userMarker && map) {
      map.removeLayer(userMarker);
      userMarker = null;
    }
    if (userAccuracyCircle && map) {
      map.removeLayer(userAccuracyCircle);
      userAccuracyCircle = null;
    }
    if (activeRoutePolyline && map) {
      map.removeLayer(activeRoutePolyline);
      activeRoutePolyline = null;
    }
  }

  /**
   * Draw dynamic live distance polyline between person's live location and target site
   */
  function drawLiveDistanceLine(site) {
    if (!map || !site) return;
    const userLoc = window.TouristToolsComponent ? TouristToolsComponent.getUserLocation() : null;
    if (!userLoc) return;

    if (activeRoutePolyline) {
      map.removeLayer(activeRoutePolyline);
      activeRoutePolyline = null;
    }

    const latLngs = [
      [userLoc.lat, userLoc.lng],
      [site.lat, site.lng]
    ];

    activeRoutePolyline = L.polyline(latLngs, {
      color: '#B5502F',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 8',
      lineCap: 'round'
    }).addTo(map);

    const distKm = TouristToolsComponent.calculateDistance(userLoc.lat, userLoc.lng, site.lat, site.lng);
    const formattedDist = TouristToolsComponent.formatDistance(distKm);

    activeRoutePolyline.bindTooltip(`📍 Live Distance: ${formattedDist}`, {
      permanent: true,
      direction: 'center',
      className: 'live-distance-tooltip'
    }).openTooltip();
  }

  /**
   * Update active map markers based on filtered sites array.
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
   * Fit map viewport bounds to current active markers + user marker.
   */
  function fitMapBounds() {
    if (!map || !activeFeatureGroup) return;
    const layers = activeFeatureGroup.getLayers();
    if (layers.length > 0) {
      const bounds = activeFeatureGroup.getBounds();
      if (userMarker) {
        bounds.extend(userMarker.getLatLng());
      }
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
    }
  }

  /**
   * Fly to site location on map, highlight pin, open popup, and draw distance line.
   */
  function flyToSite(siteId, openPopup = true) {
    if (!map) return;
    const marker = markersMap.get(siteId);

    if (marker && activeFeatureGroup.hasLayer(marker)) {
      highlightMarkerPin(siteId);

      const targetSite = allSitesReference.find(s => s.id === siteId);
      if (targetSite) {
        drawLiveDistanceLine(targetSite);
      }

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
    invalidateSize,
    updateUserLocationMarker,
    removeUserLocationMarker,
    drawLiveDistanceLine
  };
})();

