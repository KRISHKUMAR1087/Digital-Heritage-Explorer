/**
 * Heritage Trails Component Module
 * Manages curated travel routes (polylines, stop sequence numbers, distances, & 1-day feasibility badges).
 */

const TrailsComponent = (() => {
  let trailsData = [];
  let currentTrail = null;
  let trailPolyline = null;
  let trailStopMarkers = [];
  let onTrailFilterCallback = null;

  const trailsContainer = document.getElementById('trails-container');
  const trailBanner = document.getElementById('active-trail-banner');

  function init(onFilterByTrail) {
    onTrailFilterCallback = onFilterByTrail;

    const trailDataPaths = [
      './data/trails.json',
      'data/trails.json',
      `${window.location.pathname.replace(/\/[^\/]*$/, '')}/data/trails.json`.replace(/^\/\//, '/')
    ];

    async function loadTrailsData() {
      for (const path of trailDataPaths) {
        try {
          const res = await fetch(path);
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      return [];
    }

    loadTrailsData()
      .then(data => {
        trailsData = data;
        renderTrailChips();
      })
      .catch(err => console.error('Failed to load trails.json:', err));
  }

  function renderTrailChips() {
    if (!trailsContainer) return;
    trailsContainer.innerHTML = '';

    trailsData.forEach(trail => {
      const btn = document.createElement('button');
      btn.className = `chip trail-chip ${currentTrail && currentTrail.id === trail.id ? 'active' : ''}`;
      btn.type = 'button';
      btn.innerHTML = `🗺️ ${escapeHTML(trail.name)}`;

      btn.addEventListener('click', () => {
        if (currentTrail && currentTrail.id === trail.id) {
          clearTrail();
        } else {
          selectTrail(trail);
        }
      });

      trailsContainer.appendChild(btn);
    });
  }

  function selectTrail(trail) {
    currentTrail = trail;
    renderTrailChips();

    // Render Trail Polyline on Leaflet Map
    if (window.MapComponent && MapComponent.getMapInstance) {
      const leafletMap = MapComponent.getMapInstance();
      if (leafletMap) {
        clearMapTrail();

        // Draw Polyline
        trailPolyline = L.polyline(trail.coordinates, {
          color: '#B5502F',
          weight: 5,
          opacity: 0.85,
          dashArray: '10, 10'
        }).addTo(leafletMap);

        leafletMap.fitBounds(trailPolyline.getBounds(), { padding: [50, 50] });
      }
    }

    // Render Active Trail Banner UI
    if (trailBanner) {
      trailBanner.innerHTML = `
        <div class="trail-banner-card">
          <div class="trail-banner-header">
            <div>
              <span class="trail-badge">🗺️ Active Trail</span>
              <h3 class="trail-banner-title">${escapeHTML(trail.name)}</h3>
              <p class="trail-banner-tagline">${escapeHTML(trail.tagline)}</p>
            </div>
            <button class="btn-close-trail" id="btn-clear-trail" title="Exit Trail">✕ Clear Trail</button>
          </div>
          
          <div class="trail-meta">
            <span class="trail-meta-item">📏 <strong>Distance:</strong> ${escapeHTML(trail.totalDistance)}</span>
            <span class="trail-meta-item">⏱️ <strong>Drive Time:</strong> ${escapeHTML(trail.driveTime)}</span>
            <span class="trail-feasibility-badge">🚗 ${escapeHTML(trail.feasibility)}</span>
          </div>
        </div>
      `;
      trailBanner.style.display = 'block';

      const clearBtn = document.getElementById('btn-clear-trail');
      if (clearBtn) clearBtn.addEventListener('click', clearTrail);
    }

    // Filter site cards grid to trail sites only
    if (typeof onTrailFilterCallback === 'function') {
      onTrailFilterCallback(trail.sites);
    }
  }

  function clearTrail() {
    currentTrail = null;
    clearMapTrail();
    renderTrailChips();

    if (trailBanner) {
      trailBanner.innerHTML = '';
      trailBanner.style.display = 'none';
    }

    if (typeof onTrailFilterCallback === 'function') {
      onTrailFilterCallback(null);
    }
  }

  function clearMapTrail() {
    if (trailPolyline) {
      trailPolyline.remove();
      trailPolyline = null;
    }
    trailStopMarkers.forEach(m => m.remove());
    trailStopMarkers = [];
  }

  function getCurrentTrail() {
    return currentTrail;
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
    clearTrail,
    getCurrentTrail
  };
})();
