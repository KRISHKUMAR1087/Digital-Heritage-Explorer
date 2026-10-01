/**
 * PWA & Offline Support Module
 * Manages service worker lifecycle, PWA installation prompts, and offline network status.
 */

(function () {
  'use strict';

  let deferredInstallPrompt = null;

  /**
   * Initialize PWA & Offline features
   */
  function initPWA() {
    registerServiceWorker();
    setupInstallPrompt();
    setupNetworkStatusListeners();
    injectOfflineBanner();
  }

  /**
   * Register Service Worker
   */
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered with scope:', registration.scope);
            updateOfflineBadge(true);
          })
          .catch((error) => {
            console.warn('[PWA] Service Worker registration failed:', error);
            updateOfflineBadge(false);
          });
      });
    } else {
      updateOfflineBadge(false);
    }
  }

  /**
   * Setup PWA Install Prompt Button handling
   */
  function setupInstallPrompt() {
    const installBtn = document.getElementById('btn-install-pwa');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      if (installBtn) {
        installBtn.style.display = 'inline-flex';
      }
    });

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        console.log(`[PWA] User response to install prompt: ${outcome}`);
        deferredInstallPrompt = null;
        installBtn.style.display = 'none';
      });
    }

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App successfully installed');
      if (installBtn) {
        installBtn.style.display = 'none';
      }
      deferredInstallPrompt = null;
    });
  }

  /**
   * Monitor online/offline state changes
   */
  function setupNetworkStatusListeners() {
    window.addEventListener('online', updateNetworkBanner);
    window.addEventListener('offline', updateNetworkBanner);
    // Initial check
    updateNetworkBanner();
  }

  /**
   * Inject Connection Drop Alert Banner container into DOM
   */
  function injectOfflineBanner() {
    if (document.getElementById('offline-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.className = 'offline-banner';
    banner.setAttribute('role', 'alert');
    banner.setAttribute('aria-live', 'assertive');
    banner.style.display = 'none';
    banner.innerHTML = `
      <span class="offline-banner-icon" aria-hidden="true">📡</span>
      <span class="offline-banner-text">You are currently offline. Local data, site info, and cached map tiles remain fully accessible.</span>
    `;

    document.body.prepend(banner);
  }

  /**
   * Update Network Alert Banner display
   */
  function updateNetworkBanner() {
    const banner = document.getElementById('offline-banner');
    if (!banner) return;

    if (!navigator.onLine) {
      banner.style.display = 'flex';
      banner.classList.add('active');
    } else {
      banner.classList.remove('active');
      setTimeout(() => {
        if (navigator.onLine) {
          banner.style.display = 'none';
        }
      }, 300);
    }
  }

  /**
   * Update Offline Ready badge in UI
   * @param {boolean} isReady 
   */
  function updateOfflineBadge(isReady) {
    const badge = document.getElementById('offline-ready-badge');
    if (badge) {
      if (isReady) {
        badge.textContent = '⚡ Offline Ready';
        badge.title = 'Service Worker active: site and maps cached for offline use';
        badge.classList.add('badge-active');
      } else {
        badge.textContent = '🌐 Online Only';
        badge.title = 'Service Worker inactive or unsupported in this browser';
        badge.classList.remove('badge-active');
      }
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPWA);
  } else {
    initPWA();
  }
})();
