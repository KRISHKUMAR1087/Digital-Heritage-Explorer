/**
 * Tourist Tools Component Module
 * Provides Live Open/Closed Status calculation, Geolocation Distance Sorting,
 * and Community Hidden Gem Submissions.
 */

const TouristToolsComponent = (() => {
  let userLocation = null;
  const gemModal = document.getElementById('gem-modal');
  const gemCloseBtn = document.getElementById('gem-close-btn');
  const gemForm = document.getElementById('gem-form');
  const btnSuggestGem = document.getElementById('btn-suggest-gem');

  function init(onLocationSortedCallback) {
    if (btnSuggestGem) btnSuggestGem.addEventListener('click', openGemModal);
    if (gemCloseBtn) gemCloseBtn.addEventListener('click', closeGemModal);
    if (gemModal) {
      gemModal.addEventListener('click', (e) => {
        if (e.target === gemModal) closeGemModal();
      });
    }
    if (gemForm) gemForm.addEventListener('submit', handleGemSubmit);

    // Near Me GPS Button
    const btnNearMe = document.getElementById('btn-near-me');
    if (btnNearMe) {
      btnNearMe.addEventListener('click', () => {
        requestUserLocation(onLocationSortedCallback);
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
   * Request browser geolocation GPS position.
   */
  function requestUserLocation(callback) {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    const btnNearMe = document.getElementById('btn-near-me');
    if (btnNearMe) btnNearMe.textContent = '⏳ Locating...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        if (btnNearMe) btnNearMe.textContent = '📍 Near Me (Active)';
        if (typeof callback === 'function') callback(userLocation);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Could not get your current location. Please allow location permissions.');
        if (btnNearMe) btnNearMe.textContent = '📍 Near Me (GPS)';
      }
    );
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
    return Math.round(R * c);
  }

  function getUserLocation() {
    return userLocation;
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
    getUserLocation
  };
})();
