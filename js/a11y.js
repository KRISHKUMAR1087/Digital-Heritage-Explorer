/**
 * Accessibility Upgrade Module (A11y)
 * Provides text-size scaling, high-contrast mode, reduced-motion detection, skip-to-content link,
 * full ARIA attributes, and accessible modal focus trapping.
 * Wraps all localStorage access in try/catch.
 */
const A11yComponent = (() => {

  const STORAGE_KEYS = {
    textSize: 'dhe_a11y_text_size',
    highContrast: 'dhe_a11y_contrast',
    reducedMotion: 'dhe_a11y_reduced_motion'
  };

  let activeTextSize = 'normal'; // 'normal', 'large', 'xlarge'
  let isHighContrast = false;
  let isReducedMotion = false;
  let focusTrapHandler = null;

  function init() {
    loadPreferences();
    applyPreferences();
    injectAccessibilityWidget();
    setupSkipToContent();
  }

  function loadPreferences() {
    try {
      const savedSize = localStorage.getItem(STORAGE_KEYS.textSize);
      if (savedSize) activeTextSize = savedSize;

      const savedContrast = localStorage.getItem(STORAGE_KEYS.highContrast);
      if (savedContrast) isHighContrast = savedContrast === 'true';

      const savedMotion = localStorage.getItem(STORAGE_KEYS.reducedMotion);
      if (savedMotion) {
        isReducedMotion = savedMotion === 'true';
      } else {
        // Detect OS prefers-reduced-motion
        isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }
    } catch (e) {
      console.warn('localStorage disabled or unreadable for A11y settings:', e);
    }
  }

  function savePreferences() {
    try {
      localStorage.setItem(STORAGE_KEYS.textSize, activeTextSize);
      localStorage.setItem(STORAGE_KEYS.highContrast, isHighContrast ? 'true' : 'false');
      localStorage.setItem(STORAGE_KEYS.reducedMotion, isReducedMotion ? 'true' : 'false');
    } catch (e) {
      console.warn('localStorage failed to save A11y settings:', e);
    }
  }

  function applyPreferences() {
    const html = document.documentElement;
    const body = document.body;

    // 1. Text Size Class
    html.classList.remove('text-size-large', 'text-size-xlarge');
    if (activeTextSize === 'large') {
      html.classList.add('text-size-large');
    } else if (activeTextSize === 'xlarge') {
      html.classList.add('text-size-xlarge');
    }

    // 2. High Contrast
    if (isHighContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }

    // 3. Reduced Motion
    if (isReducedMotion) {
      body.classList.add('reduced-motion');
    } else {
      body.classList.remove('reduced-motion');
    }
  }

  function injectAccessibilityWidget() {
    if (document.getElementById('a11y-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'a11y-widget';
    widget.className = 'a11y-floating-widget';
    widget.setAttribute('role', 'region');
    widget.setAttribute('aria-label', 'Accessibility Controls');

    widget.innerHTML = `
      <button type="button" id="a11y-toggle-btn" class="a11y-widget-btn" title="Accessibility Tools" aria-label="Open Accessibility Tools Toolbar">
        ♿
      </button>
      <div id="a11y-menu" class="a11y-menu" style="display: none;" aria-hidden="true">
        <h4 class="a11y-menu-title">♿ Accessibility Options</h4>
        
        <div class="a11y-row">
          <span class="a11y-label">Text Size:</span>
          <div class="a11y-btn-group">
            <button type="button" class="a11y-btn ${activeTextSize === 'normal' ? 'active' : ''}" data-size="normal">A</button>
            <button type="button" class="a11y-btn ${activeTextSize === 'large' ? 'active' : ''}" data-size="large">A+</button>
            <button type="button" class="a11y-btn ${activeTextSize === 'xlarge' ? 'active' : ''}" data-size="xlarge">A++</button>
          </div>
        </div>

        <div class="a11y-row">
          <span class="a11y-label">High Contrast:</span>
          <button type="button" id="btn-toggle-contrast" class="a11y-toggle-chip ${isHighContrast ? 'active' : ''}">
            ${isHighContrast ? '👁️ ON' : '👁️ OFF'}
          </button>
        </div>

        <div class="a11y-row">
          <span class="a11y-label">Reduced Motion:</span>
          <button type="button" id="btn-toggle-motion" class="a11y-toggle-chip ${isReducedMotion ? 'active' : ''}">
            ${isReducedMotion ? '🎬 OFF Animations' : '🎬 Normal'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    // Event Listeners
    const toggleBtn = widget.querySelector('#a11y-toggle-btn');
    const menu = widget.querySelector('#a11y-menu');

    if (toggleBtn && menu) {
      toggleBtn.addEventListener('click', () => {
        const isHidden = menu.style.display === 'none';
        menu.style.display = isHidden ? 'block' : 'none';
        menu.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
      });
    }

    const sizeBtns = widget.querySelectorAll('.a11y-btn');
    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        activeTextSize = btn.getAttribute('data-size');
        savePreferences();
        applyPreferences();
        sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    const contrastBtn = widget.querySelector('#btn-toggle-contrast');
    if (contrastBtn) {
      contrastBtn.addEventListener('click', () => {
        isHighContrast = !isHighContrast;
        savePreferences();
        applyPreferences();
        contrastBtn.textContent = isHighContrast ? '👁️ ON' : '👁️ OFF';
        contrastBtn.classList.toggle('active', isHighContrast);
      });
    }

    const motionBtn = widget.querySelector('#btn-toggle-motion');
    if (motionBtn) {
      motionBtn.addEventListener('click', () => {
        isReducedMotion = !isReducedMotion;
        savePreferences();
        applyPreferences();
        motionBtn.textContent = isReducedMotion ? '🎬 OFF Animations' : '🎬 Normal';
        motionBtn.classList.toggle('active', isReducedMotion);
      });
    }
  }

  function setupSkipToContent() {
    if (document.querySelector('.skip-to-content')) return;

    const skipLink = document.createElement('a');
    skipLink.href = '#cards-grid';
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to main content';

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  /**
   * Modal Focus Trapping Utility
   */
  function trapFocus(modalEl) {
    if (!modalEl) return;

    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableEls = modalEl.querySelectorAll(focusableSelectors);
    if (focusableEls.length === 0) return;

    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    focusTrapHandler = function (e) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    modalEl.addEventListener('keydown', focusTrapHandler);
    firstEl.focus();
  }

  function untrapFocus(modalEl) {
    if (modalEl && focusTrapHandler) {
      modalEl.removeEventListener('keydown', focusTrapHandler);
      focusTrapHandler = null;
    }
  }

  return {
    init,
    trapFocus,
    untrapFocus
  };
})();

window.A11yComponent = A11yComponent;
