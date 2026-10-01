/**
 * Real Route Navigation Module
 * Interacts with OSRM (Open Source Routing Machine) API to fetch real driving road routes,
 * distances, and travel times, with graceful fallback to Haversine calculation.
 * Provides deep links to Google Maps navigation per monument.
 */

const RoutingComponent = (() => {
  const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

  /**
   * Calculate straight-line Haversine distance in km
   */
  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
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
   * Fetch real road route between origin and destination from OSRM API with Haversine fallback.
   * @param {Object} origin - { lat, lng }
   * @param {Object} destination - { lat, lng }
   * @returns {Promise<Object>} { distanceKm, durationMinutes, coordinates, isRealRoad }
   */
  async function fetchRoadRoute(origin, destination) {
    const fallbackDist = haversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    const fallbackRoadDist = parseFloat((fallbackDist * 1.25).toFixed(1));
    const fallbackDuration = Math.round((fallbackRoadDist / 50) * 60);

    const fallbackResult = {
      distanceKm: fallbackRoadDist,
      durationMinutes: fallbackDuration,
      coordinates: [[origin.lat, origin.lng], [destination.lat, destination.lng]],
      isRealRoad: false
    };

    if (!navigator.onLine) {
      return fallbackResult;
    }

    try {
      const url = `${OSRM_BASE_URL}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 sec timeout

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`OSRM HTTP error: ${response.status}`);

      const data = await response.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = parseFloat((route.distance / 1000).toFixed(1));
        const durationMinutes = Math.round(route.duration / 60);
        // OSRM returns coordinates as [lng, lat] GeoJSON array, convert to Leaflet [lat, lng]
        const leafletCoords = route.geometry.coordinates.map(c => [c[1], c[0]]);

        return {
          distanceKm: distanceKm,
          durationMinutes: durationMinutes,
          coordinates: leafletCoords,
          isRealRoad: true
        };
      }
    } catch (err) {
      console.warn('[Routing] OSRM API failed or timed out, using Haversine fallback:', err.message);
    }

    return fallbackResult;
  }

  /**
   * Generate Google Maps directions deep link for a monument site.
   * @param {Object} site - Site object with lat and lng
   * @param {Object} [userLocation] - Optional user GPS location { lat, lng }
   * @returns {string} Google Maps URL
   */
  function getGoogleMapsDirectionsUrl(site, userLocation) {
    if (!site) return '#';
    const siteNameEncoded = encodeURIComponent(site.name || 'Gujarat Monument');
    
    if (userLocation && userLocation.lat && userLocation.lng) {
      return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${site.lat},${site.lng}&destination_place_id=${siteNameEncoded}&travelmode=driving`;
    }
    
    return `https://www.google.com/maps/search/?api=1&query=${site.lat},${site.lng}`;
  }

  /**
   * Attach Google Maps direction link to detail modal button
   * @param {Object} site 
   */
  function updateDirectionsButtonInModal(site) {
    const btnDirections = document.getElementById('btn-directions');
    if (!btnDirections) return;

    const userLoc = window.TouristToolsComponent ? TouristToolsComponent.getUserLocation() : null;
    const url = getGoogleMapsDirectionsUrl(site, userLoc);
    
    btnDirections.href = url;
    btnDirections.target = '_blank';
    btnDirections.rel = 'noopener noreferrer';
    btnDirections.title = `Open Google Maps navigation to ${site.name}`;
  }

  return {
    fetchRoadRoute,
    haversineDistance,
    getGoogleMapsDirectionsUrl,
    updateDirectionsButtonInModal
  };
})();

window.RoutingComponent = RoutingComponent;
