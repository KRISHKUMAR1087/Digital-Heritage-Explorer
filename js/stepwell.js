/**
 * Stepwell Cross-Section Explorer Module
 * Interactive SVG cut-away diagram for subterranean stepwell storeys (Rani ki Vav & Adalaj Stepwell).
 * Supports level selection, Up/Deeper controls, keyboard arrow navigation, and mouse wheel scrolling.
 */

const StepwellComponent = (() => {
  let currentSite = null;
  let activeLevelIndex = 0;
  let container = null;

  /**
   * Render the Stepwell Explorer inside the provided container.
   * @param {Object} site - Site object with a `levels` array.
   * @param {HTMLElement} targetEl - DOM container element.
   */
  function render(site, targetEl) {
    container = targetEl;
    if (!container) return;

    if (!site || !site.levels || site.levels.length === 0) {
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    currentSite = site;
    activeLevelIndex = 0;
    container.style.display = 'block';

    renderLayout();
  }

  function renderLayout() {
    if (!container || !currentSite) return;

    const levels = currentSite.levels;
    const activeLevel = levels[activeLevelIndex];

    container.innerHTML = `
      <div class="stepwell-explorer-card" tabindex="0" aria-label="Stepwell Subterranean Cross-Section Explorer">
        <div class="stepwell-explorer-header">
          <h3 class="stepwell-explorer-title">🏛️ Subterranean Storey Explorer (${levels.length} Storeys)</h3>
          <p class="stepwell-explorer-hint">Click a level, scroll your mouse, or use Up/Down arrow keys to descend.</p>
        </div>

        <div class="stepwell-explorer-body">
          <!-- Left: SVG Cut-away Diagram -->
          <div class="stepwell-svg-wrapper" id="stepwell-svg-container">
            ${generateSVGDiagram(levels.length, activeLevelIndex)}
          </div>

          <!-- Right: Level Information Panel -->
          <div class="stepwell-info-panel">
            <div class="stepwell-controls">
              <button type="button" class="btn-level-nav" id="btn-level-up" ${activeLevelIndex === 0 ? 'disabled' : ''}>
                ▲ Go Up (Storey ${activeLevelIndex})
              </button>
              <button type="button" class="btn-level-nav" id="btn-level-down" ${activeLevelIndex === levels.length - 1 ? 'disabled' : ''}>
                ▼ Go Deeper (Storey ${activeLevelIndex + 2})
              </button>
            </div>

            <div class="stepwell-level-details">
              <span class="level-badge">Storey ${activeLevelIndex + 1} of ${levels.length}</span>
              <h4 class="level-title">${escapeHTML(activeLevel.title)}</h4>
              <p class="level-desc">${escapeHTML(activeLevel.description)}</p>
              
              <div class="level-lookfor-box">
                <span class="lookfor-label">🔍 What to look for:</span>
                <p class="lookfor-text">${escapeHTML(activeLevel.lookFor)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    setupEvents();
  }

  /**
   * Generate interactive SVG cut-away diagram.
   */
  function generateSVGDiagram(totalLevels, activeIdx) {
    const width = 360;
    const height = 340;
    const startY = 35;
    const levelHeight = (height - startY - 40) / totalLevels;

    let svgContent = `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" class="stepwell-svg">
        <!-- Sky & Ground Surface -->
        <rect x="0" y="0" width="${width}" height="${startY}" fill="#F4ECE1"/>
        <line x1="0" y1="${startY}" x2="${width}" y2="${startY}" stroke="#3B2A1A" stroke-width="4"/>
        <text x="15" y="24" font-size="11" font-weight="bold" fill="#3B2A1A">Ground Level Entry</text>
    `;

    // Render stacked storeys descending down
    for (let i = 0; i < totalLevels; i++) {
      const y = startY + (i * levelHeight);
      const isCurrent = i === activeIdx;
      const isWaterLevel = i === totalLevels - 1;

      // Inverted trapezoid effect (narrower towards bottom)
      const inset = (i / totalLevels) * 35;
      const rectX = 40 + inset;
      const rectWidth = width - 80 - (inset * 2);

      const fillColor = isCurrent ? '#B5502F' : (isWaterLevel ? '#3B7A87' : '#C9A36B');
      const strokeColor = isCurrent ? '#3B2A1A' : '#FAF5EC';
      const textColor = isCurrent ? '#FAF5EC' : '#3B2A1A';

      svgContent += `
        <g class="svg-level-group" data-level-idx="${i}" style="cursor: pointer;">
          <rect x="${rectX}" y="${y + 2}" width="${rectWidth}" height="${levelHeight - 4}" 
                fill="${fillColor}" stroke="${strokeColor}" stroke-width="${isCurrent ? '3' : '1'}" rx="4"/>
          <text x="${rectX + 12}" y="${y + (levelHeight / 2) + 4}" font-size="12" font-weight="bold" fill="${textColor}">
            Storey ${i + 1} ${isWaterLevel ? '💧 Water Basin' : ''}
          </text>
        </g>
      `;
    }

    svgContent += `</svg>`;
    return svgContent;
  }

  function setupEvents() {
    const svgContainer = document.getElementById('stepwell-svg-container');
    const btnUp = document.getElementById('btn-level-up');
    const btnDown = document.getElementById('btn-level-down');
    const cardEl = container.querySelector('.stepwell-explorer-card');

    if (btnUp) {
      btnUp.addEventListener('click', () => {
        if (activeLevelIndex > 0) {
          activeLevelIndex--;
          renderLayout();
        }
      });
    }

    if (btnDown) {
      btnDown.addEventListener('click', () => {
        if (currentSite && activeLevelIndex < currentSite.levels.length - 1) {
          activeLevelIndex++;
          renderLayout();
        }
      });
    }

    // SVG Level click listeners
    if (svgContainer) {
      const levelGroups = svgContainer.querySelectorAll('.svg-level-group');
      levelGroups.forEach(grp => {
        grp.addEventListener('click', () => {
          const idx = parseInt(grp.dataset.levelIdx, 10);
          activeLevelIndex = idx;
          renderLayout();
        });
      });

      // Mouse Wheel Navigation
      svgContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY > 0 && activeLevelIndex < currentSite.levels.length - 1) {
          activeLevelIndex++;
          renderLayout();
        } else if (e.deltaY < 0 && activeLevelIndex > 0) {
          activeLevelIndex--;
          renderLayout();
        }
      });
    }

    // Keyboard Arrow Keys Navigation
    if (cardEl) {
      cardEl.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          if (activeLevelIndex < currentSite.levels.length - 1) {
            activeLevelIndex++;
            renderLayout();
          }
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          if (activeLevelIndex > 0) {
            activeLevelIndex--;
            renderLayout();
          }
        }
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
