/**
 * Then & Now Image Comparison Slider Module
 * Interactive before/after image comparison with draggable handle, keyboard arrows (Left/Right), and touch support.
 */
const CompareComponent = (() => {
  let container = null;
  let currentSite = null;
  let sliderPosition = 50; // Percentage 0 - 100

  function render(site, targetEl) {
    container = targetEl;
    if (!container) return;

    if (!site || !site.historic) {
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    currentSite = site;
    sliderPosition = 50;
    container.style.display = 'block';
    renderLayout();
  }

  function renderLayout() {
    if (!container || !currentSite || !currentSite.historic) return;

    const historic = currentSite.historic;
    const isPlaceholder = !historic.src || historic.src.startsWith('TODO');
    const historicImgSrc = isPlaceholder ? currentSite.cover : historic.src;

    container.innerHTML = `
      <div class="compare-card" tabindex="0" aria-label="Then and Now Historical Photo Comparison Slider">
        <div class="compare-header">
          <h3 class="compare-title">🏛️ Then &amp; Now — Historical Comparison</h3>
          <span class="compare-year-badge">Archival Era: ${escapeHTML(historic.year || 'Historical')}</span>
        </div>

        ${isPlaceholder ? `
          <div class="compare-placeholder-notice">
            📌 <em>Historic photograph archival record noted (${escapeHTML(historic.year || 'Past')}). Image asset placeholder: <code>${escapeHTML(historic.src)}</code></em>
          </div>
        ` : ''}

        <!-- Interactive Comparison Slider Container -->
        <div class="compare-slider-wrapper" id="compare-wrapper">
          <!-- Layer 1: NOW (Background Present Day Cover) -->
          <div class="compare-layer layer-now">
            <img src="${escapeHTML(currentSite.cover)}" alt="Present day view of ${escapeHTML(currentSite.name)}" />
            <span class="compare-label label-now">NOW (Present)</span>
          </div>

          <!-- Layer 2: THEN (Clipped Archival View) -->
          <div class="compare-layer layer-then" id="compare-layer-then" style="width: ${sliderPosition}%;">
            <img src="${escapeHTML(historicImgSrc)}" alt="Historic view of ${escapeHTML(currentSite.name)}" class="${isPlaceholder ? 'vintage-sepia' : ''}" />
            <span class="compare-label label-then">THEN (${escapeHTML(historic.year || 'Past')})</span>
          </div>

          <!-- Vertical Handle Bar -->
          <div class="compare-handle" id="compare-handle" style="left: ${sliderPosition}%;" aria-hidden="true">
            <div class="handle-line"></div>
            <div class="handle-button">↔</div>
          </div>

          <!-- Invisible Range Input for Keyboard & Screen Reader Access -->
          <input type="range" id="compare-range-input" class="compare-range-input" min="0" max="100" value="${sliderPosition}" 
            aria-label="Then and Now image comparison slider. Use Left and Right arrow keys to move handle." />
        </div>

        <div class="compare-footer">
          <span class="compare-credit">📷 Historic Source: ${escapeHTML(historic.credit || 'Archival Record')} • License: ${escapeHTML(historic.license || 'Public Domain')}</span>
        </div>
      </div>
    `;

    setupEvents();
  }

  function setupEvents() {
    if (!container) return;

    const rangeInput = container.querySelector('#compare-range-input');
    const layerThen = container.querySelector('#compare-layer-then');
    const handle = container.querySelector('#compare-handle');
    const wrapper = container.querySelector('#compare-wrapper');

    function updateSlider(val) {
      sliderPosition = Math.max(0, Math.min(100, val));
      if (layerThen) layerThen.style.width = `${sliderPosition}%`;
      if (handle) handle.style.left = `${sliderPosition}%`;
      if (rangeInput && parseInt(rangeInput.value, 10) !== sliderPosition) {
        rangeInput.value = sliderPosition;
      }
    }

    if (rangeInput) {
      rangeInput.addEventListener('input', (e) => {
        updateSlider(parseInt(e.target.value, 10));
      });
      rangeInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          updateSlider(sliderPosition - 5);
        } else if (e.key === 'ArrowRight') {
          updateSlider(sliderPosition + 5);
        }
      });
    }

    // Mouse & Touch Dragging
    let isDragging = false;

    function handleMove(clientX) {
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.round((x / rect.width) * 100);
      updateSlider(pct);
    }

    if (wrapper) {
      wrapper.addEventListener('mousedown', (e) => {
        isDragging = true;
        handleMove(e.clientX);
      });

      window.addEventListener('mousemove', (e) => {
        if (isDragging) handleMove(e.clientX);
      });

      window.addEventListener('mouseup', () => {
        isDragging = false;
      });

      wrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          isDragging = true;
          handleMove(e.touches[0].clientX);
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches.length > 0) {
          handleMove(e.touches[0].clientX);
        }
      }, { passive: true });

      window.addEventListener('touchend', () => {
        isDragging = false;
      });
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
    render
  };
})();

window.CompareComponent = CompareComponent;
