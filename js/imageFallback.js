/**
 * Image Error Fallback Handler
 * Intercepts failed <img> loads (skipping Leaflet map tiles) and applies a clean SVG placeholder.
 */
const ImageFallbackComponent = (() => {
  const PLACEHOLDER_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23e2d8c3"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%235c4033">🏛️ Image Unavailable</text></svg>';

  function handleImageError(e) {
    const target = e.target;
    if (target && target.tagName === 'IMG') {
      // Skip Leaflet map tiles
      if (target.classList.contains('leaflet-tile') || (target.src && target.src.includes('tile.openstreetmap.org'))) {
        return;
      }
      if (!target.dataset.fallbackTried) {
        target.dataset.fallbackTried = 'true';
        target.src = PLACEHOLDER_SVG;
      }
    }
  }

  function init() {
    window.addEventListener('error', handleImageError, true);
  }

  // Auto-init on script load
  init();

  return {
    init,
    PLACEHOLDER_SVG
  };
})();

window.ImageFallbackComponent = ImageFallbackComponent;
