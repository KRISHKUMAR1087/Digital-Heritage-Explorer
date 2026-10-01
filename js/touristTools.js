/**
 * Tourist Tools Component Module
 * Provides Live Geolocation Tracking (watchPosition), Distance Calculations,
 * Live Location Status, and Community Hidden Gem Submissions.
 */

const TouristToolsComponent = (() => {
  let userLocation = null;
  let watchId = null;
  let isTracking = false;

  const gemModal = document.getElementById('gem-modal');
  const gemCloseBtn = document.getElementById('gem-close-btn');
  const gemForm = document.getElementById('gem-form');
  const btnSuggestGem = document.getElementById('btn-suggest-gem');

  // Preset Gujarat landmark locations for instant simulation / testing when GPS unavailable
  const SIMULATED_LOCATIONS = {
    ahmedabad: { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad City Center', accuracy: 15 },
    gandhinagar: { lat: 23.2156, lng: 72.6369, name: 'Gandhinagar', accuracy: 20 },
    vadodara: { lat: 22.3072, lng: 73.1812, name: 'Vadodara Heritage Hub', accuracy: 15 },
    surat: { lat: 21.1702, lng: 72.8311, name: 'Surat Fort Zone', accuracy: 25 },
    rajkot: { lat: 22.3039, lng: 70.8022, name: 'Rajkot Heritage Zone', accuracy: 20 },
    bhuj: { lat: 23.2420, lng: 69.6669, name: 'Bhuj Palace Region', accuracy: 30 }
  };

  function init(onLocationSortedCallback) {
    if (btnSuggestGem) btnSuggestGem.addEventListener('click', openGemModal);
    if (gemCloseBtn) gemCloseBtn.addEventListener('click', closeGemModal);
    if (gemModal) {
      gemModal.addEventListener('click', (e) => {
        if (e.target === gemModal) closeGemModal();
      });
    }
    if (gemForm) gemForm.addEventListener('submit', handleGemSubmit);

    // Near Me GPS Button / Live Location Toggle
    const btnNearMe = document.getElementById('btn-near-me');
    if (btnNearMe) {
      btnNearMe.addEventListener('click', () => {
        toggleLiveTracking(onLocationSortedCallback);
      });
    }
  }

  /**
   * Compute live Open Now / Closed status for a site based on local time.
   */
  function getOpenStatus(site) {
    if (site.openHour === undefined || site.closeHour === undefined) {
      return { label: 'Open Daily', isOpen: true };
    }

    const now = new Date();
    const currentHour = now.getHours() + (now.getMinutes() / 60);

    const isOpen = currentHour >= site.openHour && currentHour <= site.closeHour;
    return {
      label: isOpen ? '🟢 Open Now' : '🔴 Closed Now',
      isOpen
    };
  }

  /**
   * Toggle Live Geolocation GPS Tracking.
   */
  function toggleLiveTracking(callback) {
    if (isTracking) {
      stopLiveTracking();
      updateButtonUI(false, '📍 Live Location');
      if (typeof callback === 'function') callback(null);
    } else {
      startLiveTracking(callback);
    }
  }

  /**
   * Start continuous Geolocation tracking using watchPosition.
   */
  function startLiveTracking(callback) {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Using simulated location.');
      setSimulatedLocation('ahmedabad', callback);
      return;
    }

    updateButtonUI(true, '⏳ Locating You...');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000
    };

    // First attempt immediate position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handlePositionSuccess(position, callback);

        // Then start continuous position watching
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        watchId = navigator.geolocation.watchPosition(
          (pos) => handlePositionSuccess(pos, callback),
          (err) => handlePositionError(err, callback),
          options
        );
      },
      (error) => {
        handlePositionError(error, callback);
      },
      options
    );
  }

  function handlePositionSuccess(position, callback) {
    userLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: Math.round(position.coords.accuracy || 20),
      heading: position.coords.heading || null,
      speed: position.coords.speed || null,
      timestamp: position.timestamp || Date.now(),
      isSimulated: false,
      isTracking: true
    };

    isTracking = true;
    updateButtonUI(true, `📍 Live Location (±${userLocation.accuracy}m)`);

    // Notify Leaflet Map to update live user marker
    if (window.MapComponent && typeof MapComponent.updateUserLocationMarker === 'function') {
      MapComponent.updateUserLocationMarker(userLocation);
    }

    if (typeof callback === 'function') callback(userLocation);
  }

  function handlePositionError(error, callback) {
    console.warn('[Geolocation] Error or permission denied:', error.message);
    stopLiveTracking();

    // Offer user option to use simulated location for testing
    const useSimulated = confirm(
      'Could not access your live GPS position. Would you like to use a simulated live location (Ahmedabad) to test live location & distance features?'
    );

    if (useSimulated) {
      setSimulatedLocation('ahmedabad', callback);
    } else {
      updateButtonUI(false, '📍 Live Location');
      if (typeof callback === 'function') callback(null);
    }
  }

  /**
   * Stop watching position.
   */
  function stopLiveTracking() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    isTracking = false;
    userLocation = null;

    if (window.MapComponent && typeof MapComponent.removeUserLocationMarker === 'function') {
      MapComponent.removeUserLocationMarker();
    }
  }

  /**
   * Manually set a simulated live location (great for desktop testing)
   */
  function setSimulatedLocation(cityKey = 'ahmedabad', callback) {
    const loc = SIMULATED_LOCATIONS[cityKey] || SIMULATED_LOCATIONS.ahmedabad;
    userLocation = {
      lat: loc.lat,
      lng: loc.lng,
      accuracy: loc.accuracy,
      name: loc.name,
      timestamp: Date.now(),
      isSimulated: true,
      isTracking: true
    };

    isTracking = true;
    updateButtonUI(true, `📍 Live: ${loc.name}`);

    if (window.MapComponent && typeof MapComponent.updateUserLocationMarker === 'function') {
      MapComponent.updateUserLocationMarker(userLocation);
    }

    if (typeof callback === 'function') callback(userLocation);
  }

  function updateButtonUI(active, text) {
    const btnNearMe = document.getElementById('btn-near-me');
    if (btnNearMe) {
      btnNearMe.textContent = text;
      btnNearMe.classList.toggle('active', active);
    }
  }

  /**
   * Haversine Distance Formula between two GPS coordinates in km.
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
    return parseFloat((R * c).toFixed(2));
  }

  /**
   * Format distance string for display (m or km)
   */
  function formatDistance(distKm) {
    if (distKm === null || distKm === undefined || isNaN(distKm)) return '';
    if (distKm < 1) {
      const meters = Math.round(distKm * 1000);
      return `${meters} m`;
    }
    return `${distKm.toFixed(1)} km`;
  }

  function getUserLocation() {
    return userLocation;
  }

  function getIsTracking() {
    return isTracking;
  }

  // Gem Modal Handlers
  function openGemModal() {
    if (!gemModal) return;
    gemModal.classList.add('active');
    gemModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeGemModal() {
    if (!gemModal) return;
    gemModal.classList.remove('active');
    gemModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function handleGemSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('gem-name').value.trim();
    const city = document.getElementById('gem-city').value.trim();
    const category = document.getElementById('gem-category').value;
    const desc = document.getElementById('gem-desc').value.trim();

    if (!name || !city) return;

    // Build pre-filled GitHub issue URL
    const repoUrl = 'https://github.com/KRISHKUMAR1087/Digital-Heritage-Explorer/issues/new';
    const issueTitle = encodeURIComponent(`[Hidden Gem Suggestion] ${name} (${city})`);
    const issueBody = encodeURIComponent(`### 💎 Hidden Gem Suggestion\n\n**Name:** ${name}\n**City/Region:** ${city}\n**Category:** ${category}\n\n**Description:**\n${desc}`);

    const targetUrl = `${repoUrl}?title=${issueTitle}&body=${issueBody}`;
    
    closeGemModal();
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }

  return {
    init,
    getOpenStatus,
    calculateDistance,
    formatDistance,
    getUserLocation,
    getIsTracking,
    startLiveTracking,
    stopLiveTracking,
    toggleLiveTracking,
    setSimulatedLocation,
    SIMULATED_LOCATIONS
  };
})();

window.TouristToolsComponent = TouristToolsComponent;
